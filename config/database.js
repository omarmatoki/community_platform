// ملف إعدادات الاتصال بقاعدة البيانات
const { Sequelize } = require('sequelize');
require('dotenv').config();

// إنشاء اتصال جديد بقاعدة البيانات
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true
    }
  }
);

// اختبار الاتصال بقاعدة البيانات
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ تم الاتصال بقاعدة البيانات بنجاح');
  } catch (error) {
    console.error('✗ فشل الاتصال بقاعدة البيانات:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
