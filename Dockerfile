# استخدام Node.js 18 على Debian (أفضل من Alpine لـ Puppeteer)
FROM node:18-slim

# تثبيت المكتبات المطلوبة لـ Puppeteer و Chromium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# تعيين متغيرات البيئة لـ Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

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
