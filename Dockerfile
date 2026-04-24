# Node.js 18 Alpine — أخف صورة ممكنة، لا Chrome مطلوب
FROM node:18-alpine

# مكتبات ضرورية فقط: sharp (معالجة الصور) + ca-certificates
RUN apk add --no-cache \
    ca-certificates \
    vips-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# مجلد التطبيق
WORKDIR /app

# نسخ ملفات package أولاً (لاستغلال Docker cache)
COPY package*.json ./

# تثبيت الاعتماديات (production فقط)
RUN npm ci --only=production --no-optional

# نسخ باقي الملفات
COPY . .

# إنشاء المجلدات المطلوبة
RUN mkdir -p uploads/games/puzzles uploads/games/crosswords uploads/games/other auth_info_baileys

# الصلاحيات
RUN chmod -R 755 /app

# المنفذ
EXPOSE 4000

# تشغيل السيرفر
CMD ["node", "server.js"]
