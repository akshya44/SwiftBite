const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const crypto = require('crypto');
const { db } = require('../database/db');
const { protect, authorizeRoles } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

// GET /api/restaurants — public
router.get('/', async (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT r.*, u.name as ownerName, u.email as ownerEmail 
      FROM restaurants r 
      JOIN users u ON r.ownerId = u._id
    `).all();
    
    const restaurants = rows.map(r => {
      const rest = {
        ...r,
        isOpen: !!r.isOpen,
        ownerId: { _id: r.ownerId, name: r.ownerName, email: r.ownerEmail }
      };
      delete rest.ownerName;
      delete rest.ownerEmail;
      return rest;
    });
    
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/restaurants/:id — public
router.get('/:id', async (req, res) => {
  try {
    const row = db.prepare(`
      SELECT r.*, u.name as ownerName, u.email as ownerEmail 
      FROM restaurants r 
      JOIN users u ON r.ownerId = u._id 
      WHERE r._id = ?
    `).get(req.params.id);
    
    if (!row) return res.status(404).json({ message: 'Restaurant not found' });
    
    const restaurant = {
      ...row,
      isOpen: !!row.isOpen,
      ownerId: { _id: row.ownerId, name: row.ownerName, email: row.ownerEmail }
    };
    delete restaurant.ownerName;
    delete restaurant.ownerEmail;
    
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/restaurants — restaurant owner or admin
router.post(
  '/',
  protect,
  authorizeRoles('restaurant', 'admin'),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('cuisineType').trim().notEmpty().withMessage('Cuisine type required'),
    body('address').trim().notEmpty().withMessage('Address required'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { name, description, cuisineType, imageUrl, address } = req.body;
    try {
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO restaurants (_id, name, description, cuisineType, imageUrl, address, ownerId) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, description || '', cuisineType, imageUrl || '', address, req.user._id);
      
      const newRest = db.prepare('SELECT * FROM restaurants WHERE _id = ?').get(id);
      newRest.isOpen = !!newRest.isOpen;
      res.status(201).json(newRest);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/restaurants/:id — owner or admin
router.put('/:id', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = db.prepare('SELECT * FROM restaurants WHERE _id = ?').get(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    
    if (req.user.role !== 'admin' && restaurant.ownerId !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const fields = ['name', 'description', 'cuisineType', 'imageUrl', 'address', 'rating', 'isOpen'];
    const updates = [];
    const values = [];
    
    for (const key of fields) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        let val = req.body[key];
        if (key === 'isOpen') val = val ? 1 : 0;
        values.push(val);
      }
    }
    
    if (updates.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE restaurants SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE _id = ?`).run(...values);
    }
    
    const updatedRest = db.prepare('SELECT * FROM restaurants WHERE _id = ?').get(req.params.id);
    updatedRest.isOpen = !!updatedRest.isOpen;
    res.json(updatedRest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/restaurants/:id — owner or admin
router.delete('/:id', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = db.prepare('SELECT * FROM restaurants WHERE _id = ?').get(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    
    if (req.user.role !== 'admin' && restaurant.ownerId !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    db.transaction(() => {
      db.prepare('DELETE FROM menu_items WHERE restaurantId = ?').run(req.params.id);
      db.prepare('DELETE FROM restaurants WHERE _id = ?').run(req.params.id);
    })();
    
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Menu Items ──────────────────────────────────────────────────────────────

// GET /api/restaurants/:id/menu — public
router.get('/:id/menu', async (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM menu_items WHERE restaurantId = ?').all(req.params.id);
    // Convert isAvailable to boolean
    const formatted = items.map(i => ({ ...i, isAvailable: !!i.isAvailable }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/restaurants/:id/menu — owner only
router.post(
  '/:id/menu',
  protect,
  authorizeRoles('restaurant', 'admin'),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').trim().notEmpty().withMessage('Category required'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const restaurant = db.prepare('SELECT * FROM restaurants WHERE _id = ?').get(req.params.id);
      if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
      
      if (req.user.role !== 'admin' && restaurant.ownerId !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const { name, description, price, category, imageUrl } = req.body;
      const itemId = crypto.randomUUID();
      
      db.prepare(`
        INSERT INTO menu_items (_id, restaurantId, name, description, price, category, imageUrl) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(itemId, req.params.id, name, description || '', price, category, imageUrl || '');
      
      const item = db.prepare('SELECT * FROM menu_items WHERE _id = ?').get(itemId);
      item.isAvailable = !!item.isAvailable;
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/restaurants/:id/menu/:itemId
router.put('/:id/menu/:itemId', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = db.prepare('SELECT * FROM restaurants WHERE _id = ?').get(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    
    if (req.user.role !== 'admin' && restaurant.ownerId !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const item = db.prepare('SELECT * FROM menu_items WHERE _id = ?').get(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    
    const fields = ['name', 'description', 'price', 'category', 'imageUrl', 'isAvailable'];
    const updates = [];
    const values = [];
    
    for (const key of fields) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        let val = req.body[key];
        if (key === 'isAvailable') val = val ? 1 : 0;
        values.push(val);
      }
    }
    
    if (updates.length > 0) {
      values.push(req.params.itemId);
      db.prepare(`UPDATE menu_items SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE _id = ?`).run(...values);
    }
    
    const updatedItem = db.prepare('SELECT * FROM menu_items WHERE _id = ?').get(req.params.itemId);
    updatedItem.isAvailable = !!updatedItem.isAvailable;
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/restaurants/:id/menu/:itemId
router.delete('/:id/menu/:itemId', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = db.prepare('SELECT * FROM restaurants WHERE _id = ?').get(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    
    if (req.user.role !== 'admin' && restaurant.ownerId !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const info = db.prepare('DELETE FROM menu_items WHERE _id = ?').run(req.params.itemId);
    if (info.changes === 0) return res.status(404).json({ message: 'Menu item not found' });
    
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
