# إعداد WhatsApp على السيرفر

## المشكلة التي تم حلها

كانت المشكلة الأساسية هي أن Puppeteer يحتاج إلى مكتبات نظام خاصة لتشغيل Chromium، وكانت الصورة `node:18-alpine` لا تحتوي على المكتبة `libcups2` والعديد من المكتبات الأخرى المطلوبة.

## التغييرات المطبقة

### 1. تحديث Dockerfile

تم تغيير الصورة الأساسية من `node:18-alpine` إلى `node:18-slim` وإضافة جميع المكتبات المطلوبة:

```dockerfile
FROM node:18-slim

# تثبيت جميع المكتبات المطلوبة بما في ذلك libcups2
RUN apt-get update && apt-get install -y \
    libcups2 \
    libgbm1 \
    libnss3 \
    # ... وغيرها من المكتبات
```

### 2. تحديث WhatsApp Service

تم تحسين الكود ليتعرف تلقائياً على مسار Chromium في بيئة production.

## خطوات النشر

### الطريقة 1: باستخدام Docker (موصى بها)

```bash
# 1. بناء الصورة
docker build -t community-backend .

# 2. تشغيل الحاوية
docker run -d \
  --name community-app \
  -p 4000:4000 \
  -v $(pwd)/.wwebjs_auth:/app/.wwebjs_auth \
  -v $(pwd)/uploads:/app/uploads \
  --env-file .env.production \
  community-backend

# 3. عرض السجلات والحصول على QR Code
docker logs -f community-app

# 4. مسح QR Code بواسطة تطبيق WhatsApp
```

### الطريقة 2: التثبيت المباشر على السيرفر

إذا كنت تعمل مباشرة على السيرفر بدون Docker:

```bash
# 1. تثبيت المكتبات المطلوبة
sudo apt-get update
sudo apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libx11-6 \
    libxcomposite1 \
    libxrandr2

# 2. تثبيت اعتماديات Node.js
npm install

# 3. تشغيل التطبيق
NODE_ENV=production npm start
```

## ربط WhatsApp

بعد تشغيل التطبيق لأول مرة:

1. ستظهر لك QR Code في الـ Console
2. افتح تطبيق WhatsApp على هاتفك
3. اذهب إلى: الإعدادات > الأجهزة المرتبطة
4. امسح رمز QR الذي ظهر في Console
5. سيتم حفظ الجلسة في مجلد `.wwebjs_auth`

## ملاحظات مهمة

### الحفاظ على الجلسة

- مجلد `.wwebjs_auth` يحتوي على بيانات الجلسة
- احرص على عدم حذفه لتجنب إعادة المسح
- في Docker، تأكد من ربط هذا المجلد كـ volume

### استكشاف الأخطاء

إذا استمرت المشكلة:

```bash
# التحقق من وجود المكتبات
ldd /path/to/chrome | grep "not found"

# إعادة بناء الصورة من الصفر
docker build --no-cache -t community-backend .

# التحقق من السجلات
docker logs community-app
```

### متطلبات الذاكرة

Chromium يحتاج إلى ذاكرة معقولة:
- الحد الأدنى: 512MB RAM
- موصى به: 1GB+ RAM

### البيئة الخالية من واجهة رسومية (Headless)

التطبيق مُعد للعمل في بيئة headless بالكامل، لا يحتاج إلى X11 أو واجهة رسومية.

## الأوامر المفيدة

```bash
# إعادة تشغيل الحاوية
docker restart community-app

# حذف البيانات وإعادة الربط
docker exec -it community-app rm -rf .wwebjs_auth
docker restart community-app

# التحقق من حالة الاتصال
docker exec -it community-app node -e "console.log(require('./services/whatsappService').isConnected())"
```

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من السجلات: `docker logs community-app`
2. تأكد من تثبيت جميع المكتبات المطلوبة
3. تأكد من وجود ذاكرة كافية على السيرفر
