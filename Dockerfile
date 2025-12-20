# استخدام Node.js 18 كصورة أساسية
FROM node:18-alpine

# تثبيت Chromium والمكتبات المطلوبة
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libx11 \
    libxcomposite \
    libxdamage \
    libxrandr \
    libxkbcommon \
    libgbm \
    libasound \
    atk \
    atk-bridge \
    pango \
    gtk+3.0 \
    dbus \
    ttf-dejavu

# تعيين متغيرات البيئة لـ Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# إنشاء مجلد التطبيق
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت الاعتماديات
RUN npm ci --only=production

# نسخ بقية ملفات المشروع
COPY . .

# إنشاء مجلد uploads إذا لم يكن موجوداً
RUN mkdir -p uploads

# تعيين الصلاحيات
RUN chmod -R 755 /app

# فتح المنفذ 4000
EXPOSE 4000

# إضافة healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# تشغيل التطبيق
CMD ["npm", "start"]
