// خدمة WhatsApp - تعمل عبر WebSocket مباشرة (Baileys) بدون Chrome/Puppeteer
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

const AUTH_DIR = path.join(process.cwd(), 'auth_info_baileys');
const RECONNECT_MAX = 5;
const RECONNECT_BASE_DELAY = 2000;

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.isReady = false;
    this.currentQR = null;
    this._reconnectAttempts = 0;
    this._connecting = false;
  }

  async connect() {
    if (this._connecting) return;
    this._connecting = true;

    try {
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

      let version;
      try {
        const result = await fetchLatestBaileysVersion();
        version = result.version;
      } catch {
        version = [2, 3000, 1021543367];
      }

      const logger = pino({ level: 'silent' });

      this.sock = makeWASocket({
        version,
        auth: state,
        logger,
        printQRInTerminal: false,
        browser: ['Community Platform', 'Chrome', '1.0.0'],
        connectTimeoutMs: 60000,
        qrTimeout: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 15000,
        retryRequestDelayMs: 250,
        generateHighQualityLinkPreview: false,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.currentQR = qr;
          console.log('📱 امسح رمز QR التالي بواسطة WhatsApp:');
          qrcode.generate(qr, { small: true });
          console.log('💡 أو افتح: GET /api/whatsapp/qr للحصول على الرمز كصورة');
        }

        if (connection === 'close') {
          this.isReady = false;
          this._connecting = false;
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`❌ انقطع اتصال WhatsApp (كود: ${statusCode})`);

          if (shouldReconnect && this._reconnectAttempts < RECONNECT_MAX) {
            this._reconnectAttempts++;
            const delay = Math.min(
              RECONNECT_BASE_DELAY * Math.pow(2, this._reconnectAttempts - 1),
              30000
            );
            console.log(`🔄 إعادة المحاولة ${this._reconnectAttempts}/${RECONNECT_MAX} بعد ${delay / 1000}s...`);
            setTimeout(() => this.connect(), delay);
          } else if (statusCode === DisconnectReason.loggedOut) {
            console.log('⚠️  تم تسجيل الخروج. شغّل: node initWhatsApp.js لإعادة الربط');
            this.currentQR = null;
          } else {
            console.log('⚠️  توقفت محاولات إعادة الاتصال بعد الوصول للحد الأقصى');
          }
        }

        if (connection === 'open') {
          this.isReady = true;
          this.currentQR = null;
          this._reconnectAttempts = 0;
          this._connecting = false;
          console.log('✅ WhatsApp متصل وجاهز للإرسال!');
        }
      });
    } catch (error) {
      this._connecting = false;
      console.error('❌ خطأ في الاتصال بـ WhatsApp:', error.message);
      throw error;
    }
  }

  // إرسال رسالة OTP
  async sendOTP(phoneNumber, otpCode) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp غير متصل. يرجى الانتظار حتى يتم الاتصال.');
      }

      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      // baileys يستخدم @s.whatsapp.net بدلاً من @c.us
      const chatId = `${formattedNumber}@s.whatsapp.net`;

      const message =
        `مرحباً! 👋\n\n` +
        `رمز التحقق الخاص بك هو: *${otpCode}*\n\n` +
        `هذا الرمز صالح لمدة 10 دقائق.\n\n` +
        `⚠️ لا تشارك هذا الرمز مع أي شخص.\n\n` +
        `✨ منصة صوتنا يبني`;

      await this.sock.sendMessage(chatId, { text: message });
      console.log(`✅ تم إرسال OTP إلى ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في إرسال OTP:', error);
      throw error;
    }
  }

  // إرسال إشعار جلسة حوارية
  async sendSessionNotification(user, sessionData) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp غير متصل. يرجى الانتظار حتى يتم الاتصال.');
      }

      const formattedNumber = this.formatPhoneNumber(user.phoneNumber);
      const chatId = `${formattedNumber}@s.whatsapp.net`;

      const sessionDate = new Date(sessionData.dateTime);
      const formattedDate = sessionDate.toLocaleDateString('ar-SA', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const formattedTime = sessionDate.toLocaleTimeString('ar-SA', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const sessionUrl = `${frontendUrl}/polls`;

      const message =
        `مرحباً ${user.name}! 👋\n\n` +
        `🎯 يسعدنا دعوتك لحضور جلسة حوارية جديدة:\n\n` +
        `📌 *${sessionData.title}*\n\n` +
        `📅 التاريخ: ${formattedDate}\n` +
        `🕐 الوقت: ${formattedTime}\n\n` +
        (sessionData.description ? `📝 الوصف: ${sessionData.description}\n\n` : '') +
        `🔗 للاطلاع على تفاصيل الجلسة:\n${sessionUrl}\n\n` +
        `💎 سنكون ممتنين جداً لحضورك ومشاركتك!\n\n` +
        `✨ منصة صوتنا يبني`;

      await this.sock.sendMessage(chatId, { text: message });
      console.log(`✅ تم إرسال إشعار الجلسة إلى ${user.name} (${user.phoneNumber})`);
      return true;
    } catch (error) {
      console.error(`❌ خطأ في إرسال إشعار الجلسة إلى ${user.phoneNumber}:`, error.message);
      return false;
    }
  }

  // تنسيق رقم الهاتف
  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    if (formatted.startsWith('+')) {
      formatted = formatted.substring(1);
    }
    formatted = formatted.replace(/^0+/, '');
    return formatted;
  }

  // حالة الاتصال
  isConnected() {
    return this.isReady;
  }

  // QR code كـ data URI (للعرض في المتصفح)
  async getQRCodeDataURI() {
    if (!this.currentQR) return null;
    try {
      return await QRCode.toDataURL(this.currentQR);
    } catch {
      return null;
    }
  }

  // فصل الاتصال
  async disconnect() {
    if (this.sock) {
      await this.sock.logout().catch(() => {});
      this.isReady = false;
      this.currentQR = null;
      console.log('🔌 تم قطع اتصال WhatsApp');
    }
  }
}

// instance واحدة مشتركة
const whatsappService = new WhatsAppService();
module.exports = whatsappService;
