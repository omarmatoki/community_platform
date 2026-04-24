// ملف لبدء جلسة WhatsApp عبر Baileys (بدون Chrome)
// قم بتشغيل هذا الملف لمرة واحدة لمسح QR Code والاتصال بـ WhatsApp
// بعد الاتصال الأول، سيتم حفظ الجلسة تلقائياً في مجلد auth_info_baileys

require('dotenv').config();
const whatsappService = require('./services/whatsappService');

console.log('════════════════════════════════════════════════════════');
console.log('📱 بدء جلسة WhatsApp (Baileys - بدون Chrome)');
console.log('════════════════════════════════════════════════════════');
console.log('');
console.log('⚠️  ملاحظة هامة:');
console.log('   1. سيظهر رمز QR في الأسفل');
console.log('   2. افتح تطبيق WhatsApp على هاتفك');
console.log('   3. اذهب إلى الإعدادات > الأجهزة المرتبطة');
console.log('   4. امسح رمز QR المعروض أدناه');
console.log('   5. بعد الاتصال، ستُحفظ الجلسة في: auth_info_baileys/');
console.log('   6. السيرفر الرئيسي سيستخدم هذه الجلسة تلقائياً');
console.log('');
console.log('════════════════════════════════════════════════════════');
console.log('');

whatsappService.connect().catch(error => {
  console.error('❌ حدث خطأ أثناء الاتصال:', error.message);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n\n🛑 إيقاف الجلسة...');
  await whatsappService.disconnect();
  process.exit(0);
});

console.log('💡 اضغط Ctrl+C للخروج');
