const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { protect, authorizeRoles } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

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
      // Server-side price calculation
      let totalAmount = 0;
      const resolvedItems = [];

      for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItemId);
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

      const order = await Order.create({
        customerId: req.user._id,
        restaurantId,
        items: resolvedItems,
        totalAmount,
        deliveryAddress,
      });

      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/orders/my — customer's orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('restaurantId', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/restaurant — restaurant owner's incoming orders
router.get('/restaurant', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const restaurantIds = restaurants.map((r) => r._id);
    const orders = await Order.find({ restaurantId: { $in: restaurantIds } })
      .populate('customerId', 'name email')
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id — single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name imageUrl address')
      .populate('customerId', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.customerId._id.toString() === req.user._id.toString();
    const isRestaurantOwner = req.user.role === 'restaurant' || req.user.role === 'admin';
    if (!isOwner && !isRestaurantOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
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
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      order.status = req.body.status;
      await order.save();
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
