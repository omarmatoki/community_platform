// مسارات إدارة WhatsApp
const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');

// GET /api/whatsapp/status - حالة الاتصال (أدمن فقط)
router.get('/status', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    data: {
      connected: whatsappService.isConnected(),
      hasQR: !!whatsappService.currentQR,
      message: whatsappService.isConnected()
        ? 'WhatsApp متصل وجاهز'
        : whatsappService.currentQR
          ? 'في انتظار مسح QR'
          : 'WhatsApp غير متصل'
    }
  });
});

// GET /api/whatsapp/qr - الحصول على QR Code كصورة (أدمن فقط)
router.get('/qr', protect, authorize('admin'), async (req, res) => {
  if (whatsappService.isConnected()) {
    return res.json({
      success: false,
      message: 'WhatsApp متصل بالفعل، لا حاجة لمسح QR'
    });
  }

  if (!whatsappService.currentQR) {
    return res.json({
      success: false,
      message: 'لا يوجد QR متاح حالياً. تأكد من تشغيل السيرفر وانتظر لحظة'
    });
  }

  const qrDataURI = await whatsappService.getQRCodeDataURI();
  if (!qrDataURI) {
    return res.status(500).json({
      success: false,
      message: 'فشل توليد QR Code'
    });
  }

  res.json({
    success: true,
    message: 'امسح هذا الرمز بواسطة تطبيق WhatsApp',
    data: { qrCode: qrDataURI }
  });
});

module.exports = router;
