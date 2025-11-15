// نظام حساب ومنح النقاط للمستخدمين
const { User } = require('../models');

// إعدادات النقاط لكل نشاط
const POINTS_CONFIG = {
  READ_ARTICLE: 5,           // قراءة مقال
  COMPLETE_SURVEY: 10,       // إكمال استبيان بنجاح (70%+)
  COMPLETE_GAME: 15,         // إكمال لعبة
  VOTE_POLL: 5,              // التصويت في استطلاع رأي
  ATTEND_SESSION: 20         // حضور جلسة حوارية
};

/**
 * إضافة نقاط للمستخدم
 * @param {String} userId - معرف المستخدم
 * @param {Number} points - عدد النقاط المراد إضافتها
 * @returns {Object} - بيانات المستخدم المحدثة
 */
const addPoints = async (userId, points) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    // إضافة النقاط
    user.points += points;
    await user.save();

    return {
      success: true,
      points: user.points,
      addedPoints: points
    };
  } catch (error) {
    throw new Error(`فشل في إضافة النقاط: ${error.message}`);
  }
};

/**
 * حساب نقاط الاستبيان بناءً على الإجابات الصحيحة
 * @param {Number} correctAnswers - عدد الإجابات الصحيحة
 * @param {Number} totalQuestions - إجمالي عدد الأسئلة
 * @returns {Object} - النقاط المكتسبة والنسبة المئوية
 */
const calculateSurveyPoints = (correctAnswers, totalQuestions) => {
  if (totalQuestions === 0) {
    return { points: 0, percentage: 0, passed: false };
  }

  const percentage = (correctAnswers / totalQuestions) * 100;
  const passed = percentage >= 70;
  const points = passed ? POINTS_CONFIG.COMPLETE_SURVEY : 0;

  return {
    points,
    percentage: Math.round(percentage),
    passed,
    correctAnswers,
    totalQuestions
  };
};

/**
 * حساب نقاط اللعبة
 * @param {String} gameType - نوع اللعبة
 * @param {Number} customPoints - نقاط مخصصة (اختياري)
 * @returns {Number} - النقاط المكتسبة
 */
const calculateGamePoints = (gameType, customPoints = null) => {
  if (customPoints !== null && customPoints > 0) {
    return customPoints;
  }
  return POINTS_CONFIG.COMPLETE_GAME;
};

/**
 * حساب نقاط استطلاع الرأي
 * @param {Number} customPoints - نقاط مخصصة (اختياري)
 * @returns {Number} - النقاط المكتسبة
 */
const calculatePollPoints = (customPoints = null) => {
  if (customPoints !== null && customPoints > 0) {
    return customPoints;
  }
  return POINTS_CONFIG.VOTE_POLL;
};

/**
 * حساب نقاط حضور الجلسة
 * @param {Number} customPoints - نقاط مخصصة (اختياري)
 * @returns {Number} - النقاط المكتسبة
 */
const calculateSessionPoints = (customPoints = null) => {
  if (customPoints !== null && customPoints > 0) {
    return customPoints;
  }
  return POINTS_CONFIG.ATTEND_SESSION;
};

/**
 * الحصول على لوحة الصدارة
 * @param {Number} limit - عدد المستخدمين المراد عرضهم
 * @returns {Array} - قائمة بأعلى المستخدمين نقاطاً
 */
const getLeaderboard = async (limit = 10) => {
  try {
    const topUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'points', 'createdAt'],
      order: [['points', 'DESC']],
      limit: parseInt(limit)
    });

    return topUsers.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.points,
      memberSince: user.createdAt
    }));
  } catch (error) {
    throw new Error(`فشل في الحصول على لوحة الصدارة: ${error.message}`);
  }
};

/**
 * الحصول على ترتيب مستخدم معين في لوحة الصدارة
 * @param {String} userId - معرف المستخدم
 * @returns {Object} - ترتيب المستخدم
 */
const getUserRank = async (userId) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    // حساب عدد المستخدمين الذين لديهم نقاط أكثر
    const higherRankedCount = await User.count({
      where: {
        points: {
          [require('sequelize').Op.gt]: user.points
        }
      }
    });

    const rank = higherRankedCount + 1;

    return {
      rank,
      points: user.points,
      name: user.name
    };
  } catch (error) {
    throw new Error(`فشل في الحصول على ترتيب المستخدم: ${error.message}`);
  }
};

module.exports = {
  POINTS_CONFIG,
  addPoints,
  calculateSurveyPoints,
  calculateGamePoints,
  calculatePollPoints,
  calculateSessionPoints,
  getLeaderboard,
  getUserRank
};
