# دليل نظام التوثيق عبر WhatsApp

## نظرة عامة

تم تحديث نظام التوثيق في المنصة ليعتمد على رقم الهاتف بدلاً من البريد الإلكتروني، مع إرسال رموز OTP عبر WhatsApp للتحقق.

## الميزات الجديدة

- ✅ التوثيق برقم الهاتف بدلاً من البريد الإلكتروني
- ✅ إرسال رموز OTP عبر WhatsApp
- ✅ إعادة إرسال الرمز بعد دقيقتين
- ✅ صلاحية الرمز لمدة 10 دقائق
- ✅ حد أقصى 5 محاولات للتحقق
- ✅ تسجيل وتسجيل دخول موحد (Passwordless)

---

## خطوات الإعداد الأولي

### 1. ربط WhatsApp بالسيرفر

قبل البدء في استخدام النظام، يجب ربط رقم WhatsApp بالسيرفر:

```bash
npm run init-whatsapp
```

سيظهر رمز QR في الطرفية:
1. افتح تطبيق WhatsApp على هاتفك
2. اذهب إلى: **الإعدادات** → **الأجهزة المرتبطة**
3. اضغط على **ربط جهاز**
4. امسح رمز QR المعروض

**ملاحظة:** بعد الربط الأول، سيتم حفظ الجلسة تلقائياً ولن تحتاج لإعادة المسح.

---

## API Endpoints

### 1. إرسال OTP للتسجيل/تسجيل الدخول

**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "phoneNumber": "0512345678"
}
```

**تنسيقات رقم الهاتف المقبولة:**
- `0512345678`
- `+966512345678`
- `966512345678`
- `00966512345678`

**Response (Success):**
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق إلى رقم الواتساب الخاص بك",
  "data": {
    "phoneNumber": "0512345678",
    "expiresIn": "10 دقائق"
  }
}
```

**Response (Error - WhatsApp غير متصل):**
```json
{
  "success": false,
  "message": "خدمة WhatsApp غير متاحة حالياً. يرجى المحاولة لاحقاً"
}
```

---

### 2. إعادة إرسال OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Request Body:**
```json
{
  "phoneNumber": "0512345678"
}
```

**ملاحظة:** يجب الانتظار دقيقتين بين كل إرسال.

**Response (Too Many Requests):**
```json
{
  "success": false,
  "message": "يرجى الانتظار 45 ثانية قبل إعادة الإرسال"
}
```

---

### 3. التحقق من OTP والتسجيل/تسجيل الدخول

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body (للتسجيل - مستخدم جديد):**
```json
{
  "phoneNumber": "0512345678",
  "code": "123456",
  "name": "أحمد محمد"
}
```

**Request Body (لتسجيل الدخول - مستخدم موجود):**
```json
{
  "phoneNumber": "0512345678",
  "code": "123456"
}
```

**Response (Success - تسجيل جديد):**
```json
{
  "success": true,
  "message": "تم التسجيل بنجاح",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "أحمد محمد",
      "phoneNumber": "0512345678",
      "points": 0,
      "role": "user",
      "isPhoneVerified": true
    },
    "token": "jwt-token-here"
  }
}
```

**Response (Error - رمز خاطئ):**
```json
{
  "success": false,
  "message": "رمز التحقق غير صحيح. المحاولات المتبقية: 4"
}
```

**Response (Error - رمز منتهي):**
```json
{
  "success": false,
  "message": "رمز التحقق منتهي الصلاحية أو تم استخدامه"
}
```

---

### 4. الحصول على الملف الشخصي

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "أحمد محمد",
    "phoneNumber": "0512345678",
    "points": 150,
    "role": "user",
    "isPhoneVerified": true
  }
}
```

---

### 5. تحديث الملف الشخصي

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "أحمد محمد العلي"
}
```

---

### 6. تحديث رقم الهاتف

**Endpoint:** `PUT /api/auth/update-phone`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "newPhoneNumber": "0598765432",
  "code": "123456"
}
```

**ملاحظة:** يجب إرسال OTP أولاً للرقم الجديد عبر `/api/auth/send-otp`

---

## سير العمل الكامل

### التسجيل/تسجيل الدخول:

```
1. المستخدم يدخل رقم الهاتف
   ↓
2. Frontend يرسل POST /api/auth/send-otp
   ↓
3. Backend يرسل OTP عبر WhatsApp
   ↓
4. المستخدم يدخل الرمز المستلم
   ↓
5. Frontend يرسل POST /api/auth/verify-otp
   ↓
6. Backend يتحقق من الرمز:
   - إذا كان الرقم جديد → إنشاء حساب جديد
   - إذا كان الرقم موجود → تسجيل الدخول
   ↓
7. إرجاع JWT Token
```

---

## أمثلة باستخدام cURL

### إرسال OTP:
```bash
curl -X POST http://localhost:4001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0512345678"}'
```

### التحقق من OTP (تسجيل):
```bash
curl -X POST http://localhost:4001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0512345678",
    "code": "123456",
    "name": "أحمد محمد"
  }'
```

### الحصول على الملف الشخصي:
```bash
curl -X GET http://localhost:4001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ملاحظات مهمة

### الأمان:
- ✅ كل رمز OTP صالح لمدة 10 دقائق فقط
- ✅ الحد الأقصى 5 محاولات خاطئة
- ✅ يجب الانتظار دقيقتين بين كل إعادة إرسال
- ✅ رقم الهاتف يجب أن يكون فريداً

### رقم الهاتف:
- يجب أن يكون رقم سعودي يبدأ بـ 05
- التنسيق المخزن في قاعدة البيانات يتم توحيده تلقائياً

### WhatsApp:
- يجب أن يكون WhatsApp متصلاً على السيرفر
- في حالة انقطاع الاتصال، قم بتشغيل: `npm run init-whatsapp`
- الجلسة تبقى نشطة حتى بعد إعادة تشغيل السيرفر

---

## استكشاف الأخطاء

### مشكلة: WhatsApp غير متصل

**الحل:**
```bash
npm run init-whatsapp
```
ثم امسح رمز QR

### مشكلة: رقم الهاتف غير صالح

**الحل:** تأكد من أن الرقم:
- سعودي (يبدأ بـ 05)
- مكون من 10 أرقام
- بأي من التنسيقات المقبولة

### مشكلة: الرمز منتهي الصلاحية

**الحل:**
- اطلب إعادة إرسال الرمز عبر `/api/auth/resend-otp`
- تأكد من إدخال الرمز خلال 10 دقائق

---

## التغييرات على قاعدة البيانات

### جدول Users:
- ❌ تم حذف: `email`
- ✅ تم إضافة: `phoneNumber` (فريد)
- ✅ تم إضافة: `isPhoneVerified` (boolean)

### جدول جديد: OTPs:
- `id` - UUID
- `phoneNumber` - رقم الهاتف
- `code` - رمز التحقق (6 أرقام)
- `expiresAt` - تاريخ انتهاء الصلاحية
- `verified` - حالة التحقق
- `attempts` - عدد المحاولات
- `createdAt` - تاريخ الإنشاء
- `updatedAt` - تاريخ التحديث

---

## الدعم

في حال مواجهة أي مشاكل:
1. تحقق من أن WhatsApp متصل: `npm run init-whatsapp`
2. تحقق من logs السيرفر
3. تأكد من صحة تنسيق رقم الهاتف
