// مسارات المصادقة
const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  resendOTP,
  getProfile,
  updateProfile,
  updatePhoneNumber,
  registerValidation,
  verifyOTPValidation,
  loginValidation
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// ==================== مسارات التسجيل (Register) ====================

// التسجيل - إنشاء حساب وإرسال OTP
router.post('/register', registerValidation, register);

// التحقق من OTP وتفعيل الحساب
router.post('/verify', verifyOTPValidation, verifyOTP);

// ==================== مسارات تسجيل الدخول (Login) ====================

// تسجيل الدخول - بدون OTP
router.post('/login', loginValidation, login);

// ==================== مسارات عامة ====================

// إعادة إرسال OTP (للحسابات غير المفعّلة)
router.post('/resend-otp', resendOTP);

// ==================== مسارات محمية ====================

// الحصول على الملف الشخصي
router.get('/profile', protect, getProfile);

// تحديث الملف الشخصي
router.put('/profile', protect, updateProfile);

// تحديث رقم الهاتف
router.put('/update-phone', protect, updatePhoneNumber);

module.exports = router;
