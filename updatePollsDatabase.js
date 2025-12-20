// سكريبت لتحديث قاعدة البيانات وإضافة حقل expiryDate إلى جدول polls
require('dotenv').config();
const { sequelize } = require('./config/database');

const updateDatabase = async () => {
  try {
    console.log('🔄 جاري تحديث قاعدة البيانات...');

    // مزامنة النماذج مع قاعدة البيانات مع تحديث الجداول الموجودة
    await sequelize.sync({ alter: true });

    console.log('✓ تم تحديث قاعدة البيانات بنجاح');
    console.log('✓ تمت إضافة حقل expiryDate إلى جدول polls');

    process.exit(0);
  } catch (error) {
    console.error('✗ خطأ في تحديث قاعدة البيانات:', error.message);
    process.exit(1);
  }
};

updateDatabase();
