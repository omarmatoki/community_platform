// Controller للمصادقة وإدارة الحسابات
const jwt = require('jsonwebtoken');
const { User, OTP } = require('../models');
const { body, validationResult } = require('express-validator');
const whatsappService = require('../services/whatsappService');
const crypto = require('crypto');

// توليد JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// توليد رمز OTP عشوائي (6 أرقام)
const generateOTPCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// @desc    إرسال OTP للتسجيل أو تسجيل الدخول
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res, next) => {
  try {
    const { phoneNumber, name } = req.body;

    // التحقق من صحة البيانات
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // التحقق من اتصال WhatsApp
    if (!whatsappService.isConnected()) {
      return res.status(503).json({
        success: false,
        message: 'خدمة WhatsApp غير متاحة حالياً. يرجى المحاولة لاحقاً'
      });
    }

    // حذف أي OTP سابق غير مستخدم لنفس الرقم
    await OTP.destroy({
      where: {
        phoneNumber,
        verified: false
      }
    });

    // توليد رمز OTP جديد
    const otpCode = generateOTPCode();

    // حفظ OTP في قاعدة البيانات
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // صالح لمدة 10 دقائق
    await OTP.create({
      phoneNumber,
      code: otpCode,
      expiresAt,
      verified: false,
      attempts: 0
    });

    // إرسال OTP عبر WhatsApp
    try {
      await whatsappService.sendOTP(phoneNumber, otpCode);

      res.status(200).json({
        success: true,
        message: 'تم إرسال رمز التحقق إلى رقم الواتساب الخاص بك',
        data: {
          phoneNumber,
          expiresIn: '10 دقائق'
        }
      });
    } catch (error) {
      // في حالة فشل الإرسال، حذف OTP من قاعدة البيانات
      await OTP.destroy({ where: { phoneNumber, code: otpCode } });

      return res.status(500).json({
        success: false,
        message: 'فشل إرسال رمز التحقق. يرجى التأكد من رقم الهاتف'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    إعادة إرسال OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مطلوب'
      });
    }

    // البحث عن آخر OTP للرقم
    const lastOTP = await OTP.findOne({
      where: { phoneNumber },
      order: [['createdAt', 'DESC']]
    });

    // التحقق من مرور دقيقتين على آخر إرسال
    if (lastOTP) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      if (lastOTP.createdAt > twoMinutesAgo) {
        const remainingSeconds = Math.ceil((lastOTP.createdAt - twoMinutesAgo) / 1000);
        return res.status(429).json({
          success: false,
          message: `يرجى الانتظار ${remainingSeconds} ثانية قبل إعادة الإرسال`
        });
      }
    }

    // إرسال OTP جديد
    await sendOTP(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    التحقق من OTP والتسجيل أو تسجيل الدخول
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, code, name } = req.body;

    // التحقق من البيانات المطلوبة
    if (!phoneNumber || !code) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف ورمز التحقق مطلوبان'
      });
    }

    // البحث عن OTP
    const otp = await OTP.findOne({
      where: {
        phoneNumber,
        verified: false
      },
      order: [['createdAt', 'DESC']]
    });

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'رمز التحقق غير صحيح أو منتهي الصلاحية'
      });
    }

    // التحقق من صلاحية OTP
    if (!otp.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'رمز التحقق منتهي الصلاحية أو تم استخدامه'
      });
    }

    // التحقق من الرمز
    const isValid = otp.verifyCode(code);
    await otp.save();

    if (!isValid) {
      const remainingAttempts = 5 - otp.attempts;
      return res.status(400).json({
        success: false,
        message: `رمز التحقق غير صحيح. المحاولات المتبقية: ${remainingAttempts}`
      });
    }

    // البحث عن المستخدم
    let user = await User.findOne({ where: { phoneNumber } });

    // إذا لم يكن موجوداً، إنشاء حساب جديد (تسجيل)
    if (!user) {
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'الاسم مطلوب للتسجيل'
        });
      }

      // إنشاء كلمة مرور عشوائية (لن تستخدم في تسجيل الدخول)
      const randomPassword = crypto.randomBytes(16).toString('hex');

      user = await User.create({
        name,
        phoneNumber,
        password: randomPassword,
        isPhoneVerified: true,
        role: 'user'
      });
    } else {
      // تحديث حالة التحقق
      user.isPhoneVerified = true;
      await user.save();
    }

    // إنشاء التوكن
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: user.createdAt === user.updatedAt ? 'تم التسجيل بنجاح' : 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          points: user.points,
          role: user.role,
          isPhoneVerified: user.isPhoneVerified
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على الملف الشخصي للمستخدم الحالي
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تحديث الملف الشخصي
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تحديث رقم الهاتف (يتطلب التحقق من OTP)
// @route   PUT /api/auth/update-phone
// @access  Private
const updatePhoneNumber = async (req, res, next) => {
  try {
    const { newPhoneNumber, code } = req.body;

    if (!newPhoneNumber || !code) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف الجديد ورمز التحقق مطلوبان'
      });
    }

    // التحقق من OTP
    const otp = await OTP.findOne({
      where: {
        phoneNumber: newPhoneNumber,
        verified: false
      },
      order: [['createdAt', 'DESC']]
    });

    if (!otp || !otp.isValid() || !otp.verifyCode(code)) {
      return res.status(400).json({
        success: false,
        message: 'رمز التحقق غير صحيح أو منتهي الصلاحية'
      });
    }

    await otp.save();

    // التحقق من أن الرقم الجديد غير مستخدم
    const existingUser = await User.findOne({ where: { phoneNumber: newPhoneNumber } });
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مستخدم بالفعل'
      });
    }

    // تحديث رقم الهاتف
    const user = await User.findByPk(req.user.id);
    user.phoneNumber = newPhoneNumber;
    user.isPhoneVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث رقم الهاتف بنجاح',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const sendOTPValidation = [
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('رقم الهاتف مطلوب')
    .matches(/^(00966|966|\+966|0)?5[0-9]{8}$/).withMessage('رقم الهاتف غير صالح')
];

const verifyOTPValidation = [
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('رقم الهاتف مطلوب'),
  body('code')
    .trim()
    .notEmpty().withMessage('رمز التحقق مطلوب')
    .isLength({ min: 6, max: 6 }).withMessage('رمز التحقق يجب أن يكون 6 أرقام')
];

module.exports = {
  sendOTP,
  resendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  updatePhoneNumber,
  sendOTPValidation,
  verifyOTPValidation
};
