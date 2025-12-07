// ملف السيرفر الرئيسي
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const whatsappService = require('./services/whatsappService');

// استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const articleRoutes = require('./routes/articleRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const gameRoutes = require('./routes/gameRoutes');
const pollRoutes = require('./routes/pollRoutes');
const discussionRoutes = require('./routes/discussionRoutes');

// إنشاء تطبيق Express
const app = express();

// Middlewares عامة
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة الملفات الثابتة (الصور المرفوعة)
app.use('/uploads', express.static('uploads'));

// Logger Middleware (في وضع التطوير)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// المسار الرئيسي
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً بك في منصة صوتنا يبني',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      categories: '/api/categories',
      articles: '/api/articles',
      surveys: '/api/surveys',
      games: '/api/games',
      polls: '/api/polls',
      discussions: '/api/discussions'
    }
  });
});

// تحميل المسارات
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/discussions', discussionRoutes);

// معالجة المسارات غير الموجودة
app.use(notFound);

// معالج الأخطاء المركزي
app.use(errorHandler);

// تحديد رقم المنفذ
const PORT = process.env.PORT || 5000;

// دالة لبدء السيرفر
const startServer = async () => {
  try {
    // اختبار الاتصال بقاعدة البيانات
    await testConnection();

    // مزامنة قاعدة البيانات (إنشاء الجداول)
    // في الإنتاج، استخدم { alter: true } أو migrations
await sequelize.sync({ force: false, alter: false });
    console.log('✓ تمت مزامنة قاعدة البيانات بنجاح');

    // بدء خدمة WhatsApp
    console.log('🔄 جاري الاتصال بـ WhatsApp...');
    whatsappService.connect().catch(error => {
      console.error('⚠️  تحذير: فشل الاتصال بـ WhatsApp:', error.message);
      console.log('💡 يمكنك تشغيل: node initWhatsApp.js لربط WhatsApp يدوياً');
    });

    // بدء السيرفر
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
      console.log(`📍 الوضع: ${process.env.NODE_ENV}`);
      console.log(`🌐 الرابط: http://localhost:${PORT}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('✗ فشل في بدء السيرفر:', error.message);
    process.exit(1);
  }
};

// بدء السيرفر
startServer();

// معالجة الأخطاء غير المعالجة
process.on('unhandledRejection', (err) => {
  console.error('خطأ غير معالج:', err);
  console.log('إيقاف السيرفر...');
  process.exit(1);
});

module.exports = app;
