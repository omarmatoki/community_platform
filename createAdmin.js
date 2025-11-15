// سكريبت لإنشاء مستخدم Admin
require('dotenv').config();
const { User } = require('./models');
const { sequelize } = require('./config/database');

const createAdmin = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await sequelize.authenticate();
    console.log('✓ تم الاتصال بقاعدة البيانات');

    // التأكد من وجود الجداول
    await sequelize.sync();
    console.log('✓ تمت مزامنة قاعدة البيانات');

    // البيانات الافتراضية للـ Admin
    const adminEmail = 'admin@community.com';
    const adminPassword = 'Admin@123456';

    // البحث عن Admin موجود
    const existingAdmin = await User.findOne({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('\n⚠️  المستخدم موجود بالفعل!');
      console.log(`البريد الإلكتروني: ${existingAdmin.email}`);
      console.log(`الاسم: ${existingAdmin.name}`);
      console.log(`الدور: ${existingAdmin.role}`);

      if (existingAdmin.role === 'admin') {
        console.log('✓ المستخدم هو Admin بالفعل');
      } else {
        // تحديث الدور إلى Admin
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✓ تم تحديث المستخدم إلى Admin');
      }

      process.exit(0);
    }

    // إنشاء Admin جديد
    const admin = await User.create({
      name: 'المدير العام',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      points: 0
    });

    console.log('\n✅ تم إنشاء مستخدم Admin بنجاح!');
    console.log('═══════════════════════════════════════════');
    console.log(`📧 البريد الإلكتروني: ${adminEmail}`);
    console.log(`🔑 كلمة المرور: ${adminPassword}`);
    console.log(`👤 الاسم: ${admin.name}`);
    console.log(`🎯 الدور: ${admin.role}`);
    console.log('═══════════════════════════════════════════');
    console.log('\n⚠️  تحذير أمني:');
    console.log('   يرجى تغيير كلمة المرور بعد تسجيل الدخول!');
    console.log('   استخدم: PUT /api/auth/change-password\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ خطأ في إنشاء Admin:', error.message);

    if (error.name === 'SequelizeConnectionError') {
      console.error('\n💡 تأكد من:');
      console.error('   1. تشغيل MySQL');
      console.error('   2. صحة بيانات الاتصال في ملف .env');
      console.error('   3. إنشاء قاعدة البيانات community_platform');
    }

    process.exit(1);
  }
};

// تنفيذ الدالة
console.log('\n🚀 بدء إنشاء مستخدم Admin...\n');
createAdmin();
