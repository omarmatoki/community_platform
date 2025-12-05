// Multer Middleware لرفع الملفات
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// التأكد من وجود المجلدات
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// إعداد التخزين
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/games/';

    // تحديد المجلد بناءً على نوع اللعبة
    if (req.body.type === 'puzzle') {
      uploadPath += 'puzzles/';
    } else if (req.body.type === 'crossword') {
      uploadPath += 'crosswords/';
    } else {
      uploadPath += 'other/';
    }

    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // إنشاء اسم ملف فريد: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

// فلتر الملفات - قبول الصور فقط
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم! يُرجى رفع صورة (JPEG, PNG, GIF, WEBP)'), false);
  }
};

// إعداد Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // حد أقصى 5MB
  }
});

// Middleware لرفع صورة واحدة
const uploadGameImage = upload.single('image');

// Middleware لرفع صور متعددة (للاستخدام المستقبلي)
const uploadMultipleImages = upload.array('images', 10);

// Error handler لـ Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً! الحد الأقصى 5MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'عدد الملفات يتجاوز الحد المسموح'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'خطأ في رفع الملف'
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'خطأ في رفع الملف'
    });
  }

  next();
};

module.exports = {
  uploadGameImage,
  uploadMultipleImages,
  handleMulterError
};
