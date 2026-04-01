const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { protect, authorizeRoles } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

// GET /api/restaurants — public
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('ownerId', 'name email');
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/restaurants/:id — public
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('ownerId', 'name email');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
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
      const restaurant = await Restaurant.create({
        name, description, cuisineType, imageUrl, address,
        ownerId: req.user._id,
      });
      res.status(201).json(restaurant);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/restaurants/:id — owner or admin
router.put('/:id', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/restaurants/:id — owner or admin
router.delete('/:id', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await restaurant.deleteOne();
    await MenuItem.deleteMany({ restaurantId: req.params.id });
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Menu Items ──────────────────────────────────────────────────────────────

// GET /api/restaurants/:id/menu — public
router.get('/:id/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.id });
    res.json(items);
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
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
      if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      const item = await MenuItem.create({ ...req.body, restaurantId: req.params.id });
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/restaurants/:id/menu/:itemId
router.put('/:id/menu/:itemId', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const item = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/restaurants/:id/menu/:itemId
router.delete('/:id/menu/:itemId', protect, authorizeRoles('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await MenuItem.findByIdAndDelete(req.params.itemId);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
