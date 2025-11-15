// Middleware لمعالجة الأخطاء بشكل مركزي

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // أخطاء Sequelize Validation
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'خطأ في التحقق من البيانات',
      errors
    });
  }

  // أخطاء Sequelize Unique Constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    return res.status(400).json({
      success: false,
      message: `القيمة ${field} مستخدمة بالفعل`
    });
  }

  // أخطاء Sequelize Foreign Key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'خطأ في العلاقات بين البيانات'
    });
  }

  // أخطاء Sequelize Database
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      message: 'خطأ في قاعدة البيانات',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // أخطاء JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'التوكن غير صالح'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'التوكن منتهي الصلاحية'
    });
  }

  // الخطأ الافتراضي
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'خطأ في السيرفر',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Middleware للتعامل مع المسارات غير الموجودة
const notFound = (req, res, next) => {
  const error = new Error(`المسار غير موجود - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
