# إنشاء مستخدم Admin

بعد تشغيل المشروع لأول مرة، ستحتاج إلى إنشاء مستخدم Admin للتحكم بالمنصة.

## الطريقة 1: عبر API ثم تعديل قاعدة البيانات

### الخطوة 1: تسجيل مستخدم عادي

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "المدير العام",
  "email": "admin@community.com",
  "password": "Admin@123456"
}
```

### الخطوة 2: تحديث role في قاعدة البيانات

قم بتنفيذ هذا الاستعلام SQL:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'admin@community.com';
```

أو عبر MySQL Workbench:

1. افتح MySQL Workbench
2. اتصل بقاعدة البيانات `community_platform`
3. نفذ الاستعلام أعلاه

## الطريقة 2: إدراج Admin مباشرة في قاعدة البيانات

يمكنك تنفيذ هذا السكريبت SQL بعد تشغيل المشروع لأول مرة:

```sql
-- استخدم قاعدة البيانات
USE community_platform;

-- إدراج مستخدم Admin
-- ملاحظة: كلمة المرور هنا مشفرة بـ bcrypt
-- كلمة المرور الأصلية: Admin@123456
INSERT INTO users (id, name, email, password, role, points, createdAt, updatedAt)
VALUES (
  UUID(),
  'المدير العام',
  'admin@community.com',
  '$2a$10$ZYWz7OHwXYqKqH.z3Lq3g.N.YH5JhPBN6xhQ4c4FZn.0dZ8q3rZ1e',
  'admin',
  0,
  NOW(),
  NOW()
);
```

**ملاحظة:** كلمة المرور المشفرة في المثال أعلاه قد لا تعمل. الطريقة الأفضل هي:

1. تسجيل مستخدم عادي عبر API (سيتم تشفير كلمة المرور تلقائياً)
2. تحديث role إلى 'admin' في قاعدة البيانات

## الطريقة 3: سكريبت Node.js لإنشاء Admin

أنشئ ملف `createAdmin.js` في مجلد backend:

```javascript
// createAdmin.js
require('dotenv').config();
const { User } = require('./models');
const { sequelize } = require('./config/database');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ تم الاتصال بقاعدة البيانات');

    // البحث عن Admin موجود
    const existingAdmin = await User.findOne({
      where: { email: 'admin@community.com' }
    });

    if (existingAdmin) {
      console.log('✗ المستخدم موجود بالفعل');

      if (existingAdmin.role === 'admin') {
        console.log('✓ المستخدم هو Admin بالفعل');
      } else {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✓ تم تحديث المستخدم إلى Admin');
      }

      process.exit(0);
    }

    // إنشاء Admin جديد
    const admin = await User.create({
      name: 'المدير العام',
      email: 'admin@community.com',
      password: 'Admin@123456',
      role: 'admin',
      points: 0
    });

    console.log('✓ تم إنشاء مستخدم Admin بنجاح');
    console.log('البريد الإلكتروني: admin@community.com');
    console.log('كلمة المرور: Admin@123456');
    console.log('\n⚠️  يرجى تغيير كلمة المرور بعد تسجيل الدخول!');

    process.exit(0);
  } catch (error) {
    console.error('✗ خطأ:', error.message);
    process.exit(1);
  }
};

createAdmin();
```

ثم نفذ:

```bash
node createAdmin.js
```

## الطريقة 4: إضافة سكريبت في package.json

أضف هذا السكريبت في `package.json`:

```json
{
  "scripts": {
    "create-admin": "node createAdmin.js"
  }
}
```

ثم نفذ:

```bash
npm run create-admin
```

## تسجيل الدخول كـ Admin

بعد إنشاء حساب Admin، سجل الدخول:

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@community.com",
  "password": "Admin@123456"
}
```

ستحصل على token. استخدمه في جميع طلبات Admin:

```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## تغيير كلمة المرور

بعد تسجيل الدخول كـ Admin، غيّر كلمة المرور فوراً:

```bash
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "currentPassword": "Admin@123456",
  "newPassword": "YourNewSecurePassword123!"
}
```

## التحقق من صلاحيات Admin

اختبر الصلاحيات بإنشاء تصنيف:

```bash
POST http://localhost:5000/api/categories
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "تصنيف تجريبي",
  "description": "للاختبار"
}
```

إذا نجح الطلب، فأنت الآن Admin بصلاحيات كاملة! 🎉

## ملاحظات أمنية

⚠️ **هام:**

1. **لا تستخدم** كلمات مرور بسيطة في الإنتاج
2. **غيّر** كلمة المرور الافتراضية فوراً
3. **لا تشارك** بيانات اعتماد Admin مع أحد
4. **استخدم** كلمة مرور قوية تحتوي على:
   - حروف كبيرة وصغيرة
   - أرقام
   - رموز خاصة
   - طول 12 حرف على الأقل

## إنشاء Admins إضافيين

يمكن للـ Admin الحالي إنشاء مستخدمين آخرين وتحديث role لهم:

### 1. المستخدم الجديد يسجل عبر API

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "مدير فرعي",
  "email": "moderator@community.com",
  "password": "Secure123!"
}
```

### 2. Admin الحالي يحدث role

```bash
PUT http://localhost:5000/api/users/{{new_user_id}}
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "role": "admin"
}
```

الآن المستخدم الجديد أصبح Admin! ✅
