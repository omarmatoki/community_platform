// مسارات المصادقة
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  registerValidation
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// مسارات عامة
router.post('/register', registerValidation, register);
router.post('/login', login);

// مسارات محمية
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
