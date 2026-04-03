const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const crypto = require('crypto');
const { db } = require('../database/db');
const { protect, authorizeRoles } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

function formatOrderRow(row) {
  const order = { ...row, items: JSON.parse(row.items) };
  
  if (row.customerName) {
    order.customerId = { _id: order.customerId, name: row.customerName, email: row.customerEmail };
    delete order.customerName;
    delete order.customerEmail;
  }
  
  if (row.restaurantName) {
    order.restaurantId = { _id: order.restaurantId, name: row.restaurantName, imageUrl: row.restaurantImage, address: row.restaurantAddress };
    delete order.restaurantName;
    delete order.restaurantImage;
    delete order.restaurantAddress;
  }
  return order;
}

// POST /api/orders — create order (customer)
router.post(
  '/',
  protect,
  [
    body('restaurantId').notEmpty().withMessage('Restaurant ID required'),
    body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address required'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { restaurantId, items, deliveryAddress } = req.body;
    try {
      let totalAmount = 0;
      const resolvedItems = [];

      for (const item of items) {
        // Fetch menu item directly
        const menuItem = db.prepare('SELECT * FROM menu_items WHERE _id = ?').get(item.menuItemId);
        if (!menuItem || !menuItem.isAvailable) {
          return res.status(400).json({ message: `Item "${item.menuItemId}" not found or unavailable` });
        }
        const lineTotal = menuItem.price * item.quantity;
        totalAmount += lineTotal;
        resolvedItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price,
        });
      }

      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO orders (_id, customerId, restaurantId, items, totalAmount, deliveryAddress) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, req.user._id, restaurantId, JSON.stringify(resolvedItems), totalAmount, deliveryAddress);

      const row = db.prepare('SELECT * FROM orders WHERE _id = ?').get(id);
      res.status(201).json(formatOrderRow(row));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/orders/my — customer's orders
router.get('/my', protect, async (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT o.*, r.name as restaurantName, r.imageUrl as restaurantImage 
      FROM orders o 
      JOIN restaurants r ON o.restaurantId = r._id 
      WHERE o.customerId = ? 
      ORDER BY o.createdAt DESC
    `).all(req.user._id);
    
    res.json(rows.map(formatOrderRow));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/restaurant — restaurant owner's incoming orders
router.get('/restaurant', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    // Get all records where the restaurant owner matches
    const rows = db.prepare(`
      SELECT o.*, 
             u.name as customerName, u.email as customerEmail,
             r.name as restaurantName
      FROM orders o
      JOIN users u ON o.customerId = u._id
      JOIN restaurants r ON o.restaurantId = r._id
      WHERE r.ownerId = ?
      ORDER BY o.createdAt DESC
    `).all(req.user._id);
    
    res.json(rows.map(formatOrderRow));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id — single order
router.get('/:id', protect, async (req, res) => {
  try {
    const row = db.prepare(`
      SELECT o.*, 
             u.name as customerName, u.email as customerEmail,
             r.name as restaurantName, r.imageUrl as restaurantImage, r.address as restaurantAddress
      FROM orders o
      JOIN users u ON o.customerId = u._id
      JOIN restaurants r ON o.restaurantId = r._id
      WHERE o._id = ?
    `).get(req.params.id);
    
    if (!row) return res.status(404).json({ message: 'Order not found' });

    const isOwner = row.customerId === req.user._id;
    const isRestaurantOwner = req.user.role === 'restaurant' || req.user.role === 'admin'; // Needs deeper check realistically
    
    if (!isOwner && !isRestaurantOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // For restaurant owner verify they own the specific restaurant
    if (req.user.role === 'restaurant' && !isOwner) {
      const restaurant = db.prepare('SELECT ownerId FROM restaurants WHERE _id = ?').get(row.restaurantId);
      if (restaurant.ownerId !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(formatOrderRow(row));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status — restaurant owner or admin
router.put(
  '/:id/status',
  protect,
  authorizeRoles('restaurant', 'admin'),
  [body('status').isIn(['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid status')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const order = db.prepare('SELECT * FROM orders WHERE _id = ?').get(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      
      if (req.user.role === 'restaurant') {
        const restaurant = db.prepare('SELECT ownerId FROM restaurants WHERE _id = ?').get(order.restaurantId);
        if (restaurant.ownerId !== req.user._id) {
          return res.status(403).json({ message: 'Not authorized' });
        }
      }

      db.prepare('UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE _id = ?')
        .run(req.body.status, req.params.id);
      
      const updatedRow = db.prepare('SELECT * FROM orders WHERE _id = ?').get(req.params.id);
      res.json(formatOrderRow(updatedRow));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
