// خدمة WhatsApp لإرسال رسائل OTP
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.initializeClient();
  }

  initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: '.wwebjs_auth'
      }),
      puppeteer: {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    // عرض QR Code للمسح
    this.client.on('qr', (qr) => {
      console.log('📱 امسح رمز QR التالي بواسطة WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // عند الاتصال بنجاح
    this.client.on('ready', () => {
      console.log('✅ WhatsApp متصل وجاهز للإرسال!');
      this.isReady = true;
    });

    // عند فصل الاتصال
    this.client.on('disconnected', (reason) => {
      console.log('❌ تم قطع اتصال WhatsApp:', reason);
      this.isReady = false;
    });

    // معالجة الأخطاء
    this.client.on('auth_failure', (msg) => {
      console.error('❌ فشل التوثيق في WhatsApp:', msg);
      this.isReady = false;
    });
  }

  // بدء الاتصال
  async connect() {
    try {
      await this.client.initialize();
      console.log('🔄 جاري الاتصال بـ WhatsApp...');
    } catch (error) {
      console.error('❌ خطأ في الاتصال بـ WhatsApp:', error);
      throw error;
    }
  }

  // إرسال رسالة OTP
  async sendOTP(phoneNumber, otpCode) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp غير متصل. يرجى الانتظار حتى يتم الاتصال.');
      }

      // تنسيق رقم الهاتف (يجب أن يكون بصيغة دولية مثل: 966xxxxxxxxx)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = `${formattedNumber}@c.us`;

      // نص الرسالة
      const message = `مرحباً! 👋\n\nرمز التحقق الخاص بك هو: *${otpCode}*\n\nهذا الرمز صالح لمدة 10 دقائق.\n\n⚠️ لا تشارك هذا الرمز مع أي شخص.\n\n✨ منصة صوتنا يبني`;

      // إرسال الرسالة
      await this.client.sendMessage(chatId, message);
      console.log(`✅ تم إرسال OTP إلى ${phoneNumber}`);

      return true;
    } catch (error) {
      console.error('❌ خطأ في إرسال OTP:', error);
      throw error;
    }
  }

  // تنسيق رقم الهاتف
  formatPhoneNumber(phoneNumber) {
    // إزالة أي رموز غير الأرقام (ما عدا +)
    let formatted = phoneNumber.replace(/[^\d+]/g, '');

    // إزالة + من البداية إذا وجدت
    if (formatted.startsWith('+')) {
      formatted = formatted.substring(1);
    }

    // إزالة أي صفر في البداية
    formatted = formatted.replace(/^0+/, '');

    return formatted;
  }

  // التحقق من حالة الاتصال
  isConnected() {
    return this.isReady;
  }

  // إرسال إشعار جلسة حوارية
  async sendSessionNotification(user, sessionData) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp غير متصل. يرجى الانتظار حتى يتم الاتصال.');
      }

      // تنسيق رقم الهاتف
      const formattedNumber = this.formatPhoneNumber(user.phoneNumber);
      const chatId = `${formattedNumber}@c.us`;

      // تنسيق التاريخ والوقت
      const sessionDate = new Date(sessionData.dateTime);
      const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };

      const formattedDate = sessionDate.toLocaleDateString('ar-SA', dateOptions);
      const formattedTime = sessionDate.toLocaleTimeString('ar-SA', timeOptions);

      // رابط صفحة الجلسات
      const frontendUrl = process.env.FRONTEND_URL || 'http://192.168.0.5:3000';
      const sessionUrl = `${frontendUrl}/discussions`;

      // نص الرسالة
      const message = `مرحباً ${user.name}! 👋\n\n` +
        `🎯 يسعدنا دعوتك لحضور جلسة حوارية جديدة:\n\n` +
        `📌 *${sessionData.title}*\n\n` +
        `📅 التاريخ: ${formattedDate}\n` +
        `🕐 الوقت: ${formattedTime}\n\n` +
        (sessionData.description ? `📝 الوصف: ${sessionData.description}\n\n` : '') +
        `🔗 للاطلاع على تفاصيل الجلسة والتسجيل:\n${sessionUrl}\n\n` +
        `💎 سنكون ممتنين جداً لحضورك ومشاركتك الفعالة معنا!\n\n` +
        `✨ منصة صوتنا يبني`;

      // إرسال الرسالة
      await this.client.sendMessage(chatId, message);
      console.log(`✅ تم إرسال إشعار الجلسة إلى ${user.name} (${user.phoneNumber})`);

      return true;
    } catch (error) {
      console.error(`❌ خطأ في إرسال إشعار الجلسة إلى ${user.phoneNumber}:`, error);
      // لا نرمي الخطأ لنتمكن من الاستمرار في إرسال الرسائل للمستخدمين الآخرين
      return false;
    }
  }

  // فصل الاتصال
  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      console.log('🔌 تم قطع اتصال WhatsApp');
    }
  }
}

// إنشاء instance واحدة من الخدمة
const whatsappService = new WhatsAppService();

module.exports = whatsappService;
