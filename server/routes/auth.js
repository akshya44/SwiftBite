const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db } = require('../database/db');
const { handleValidationErrors } = require('../middleware/validate');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['customer', 'restaurant']).withMessage('Invalid role'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { name, email, password, role, address } = req.body;
    try {
      const existing = db.prepare('SELECT _id FROM users WHERE email = ?').get(email);
      if (existing) return res.status(400).json({ message: 'Email already registered' });

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const id = crypto.randomUUID();
      const userRole = role || 'customer';

      db.prepare('INSERT INTO users (_id, name, email, password, role, address) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, name, email.toLowerCase(), hashedPassword, userRole, address || '');

      res.status(201).json({
        _id: id,
        name,
        email: email.toLowerCase(),
        role: userRole,
        token: generateToken(id),
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
