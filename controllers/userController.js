// Controller لإدارة المستخدمين
const { User } = require('../models');
const { getLeaderboard, getUserRank } = require('../utils/pointsSystem');

// @desc    الحصول على جميع المستخدمين
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على مستخدم معين
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تحديث مستخدم
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, points } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (points !== undefined) user.points = points;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث المستخدم بنجاح',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    حذف مستخدم
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على نقاط المستخدم
// @route   GET /api/users/:id/points
// @access  Private
const getUserPoints = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'points']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // الحصول على ترتيب المستخدم
    const rank = await getUserRank(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        rank: rank.rank
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على لوحة الصدارة
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboardController = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const leaderboard = await getLeaderboard(limit);

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPoints,
  getLeaderboardController
};
