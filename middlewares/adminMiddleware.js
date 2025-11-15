// Middleware للتحقق من صلاحيات الأدمن
// يجب استخدامه بعد authMiddleware

const authorize = (...roles) => {
  return (req, res, next) => {
    // التحقق من وجود المستخدم (تم التحقق منه في authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح لك بالدخول'
      });
    }

    // التحقق من صلاحيات المستخدم
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `دور المستخدم ${req.user.role} غير مصرح له بالوصول إلى هذا المسار`
      });
    }

    next();
  };
};

module.exports = { authorize };
