// Middleware للتحقق من صحة JWT Token
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// التحقق من أن المستخدم مسجل دخول
const protect = async (req, res, next) => {
  try {
    let token;

    // التحقق من وجود التوكن في الـ headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // التحقق من وجود التوكن
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح لك بالدخول، يرجى تسجيل الدخول'
      });
    }

    try {
      // فك تشفير التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // البحث عن المستخدم
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'التوكن غير صالح أو منتهي الصلاحية'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من الصلاحية',
      error: error.message
    });
  }
};

module.exports = { protect };
