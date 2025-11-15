// Controller لإدارة الجلسات الحوارية
const { DiscussionSession, SessionAttendance, User } = require('../models');
const { addPoints, calculateSessionPoints } = require('../utils/pointsSystem');

// @desc    إنشاء جلسة حوارية جديدة
// @route   POST /api/discussions
// @access  Private/Admin
const createSession = async (req, res, next) => {
  try {
    const { title, description, meetLink, dateTime, pointsReward } = req.body;

    if (!title || !dateTime) {
      return res.status(400).json({
        success: false,
        message: 'العنوان والتاريخ مطلوبان'
      });
    }

    const session = await DiscussionSession.create({
      title,
      description,
      meetLink,
      dateTime,
      pointsReward: pointsReward || 20,
      adminId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الجلسة الحوارية بنجاح',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على جميع الجلسات الحوارية
// @route   GET /api/discussions
// @access  Public
const getAllSessions = async (req, res, next) => {
  try {
    const { upcoming } = req.query;

    const where = {};
    if (upcoming === 'true') {
      where.dateTime = {
        [require('sequelize').Op.gte]: new Date()
      };
    }

    const sessions = await DiscussionSession.findAll({
      where,
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        },
        {
          model: SessionAttendance,
          as: 'attendances',
          attributes: ['id', 'userId', 'attended']
        }
      ],
      order: [['dateTime', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على جلسة معينة
// @route   GET /api/discussions/:id
// @access  Public
const getSessionById = async (req, res, next) => {
  try {
    const session = await DiscussionSession.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        },
        {
          model: SessionAttendance,
          as: 'attendances',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'الجلسة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تسجيل حضور جلسة
// @route   POST /api/discussions/:id/attend
// @access  Private
const markAttendance = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.id;

    // التحقق من وجود الجلسة
    const session = await DiscussionSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'الجلسة غير موجودة'
      });
    }

    // التحقق من عدم تسجيل الحضور مسبقاً
    const existingAttendance = await SessionAttendance.findOne({
      where: { sessionId, userId }
    });

    if (existingAttendance) {
      if (existingAttendance.attended) {
        return res.status(400).json({
          success: false,
          message: 'لقد سجلت حضورك في هذه الجلسة مسبقاً'
        });
      } else {
        // تحديث الحضور
        existingAttendance.attended = true;
        existingAttendance.pointsEarned = calculateSessionPoints(session.pointsReward);
        await existingAttendance.save();

        await addPoints(userId, existingAttendance.pointsEarned);

        return res.status(200).json({
          success: true,
          message: `تم تسجيل حضورك وحصلت على ${existingAttendance.pointsEarned} نقطة`,
          data: {
            pointsEarned: existingAttendance.pointsEarned
          }
        });
      }
    }

    // حساب النقاط
    const points = calculateSessionPoints(session.pointsReward);

    // تسجيل الحضور
    const attendance = await SessionAttendance.create({
      sessionId,
      userId,
      attended: true,
      pointsEarned: points
    });

    // منح النقاط
    await addPoints(userId, points);

    res.status(200).json({
      success: true,
      message: `تم تسجيل حضورك بنجاح وحصلت على ${points} نقطة`,
      data: {
        pointsEarned: points
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على الحضور في جلسة معينة
// @route   GET /api/discussions/:id/attendees
// @access  Private/Admin
const getSessionAttendees = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    const attendances = await SessionAttendance.findAll({
      where: { sessionId, attended: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: attendances.length,
      data: attendances
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تحديث جلسة
// @route   PUT /api/discussions/:id
// @access  Private/Admin
const updateSession = async (req, res, next) => {
  try {
    const { title, description, meetLink, dateTime, pointsReward } = req.body;

    const session = await DiscussionSession.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'الجلسة غير موجودة'
      });
    }

    if (title) session.title = title;
    if (description !== undefined) session.description = description;
    if (meetLink !== undefined) session.meetLink = meetLink;
    if (dateTime) session.dateTime = dateTime;
    if (pointsReward !== undefined) session.pointsReward = pointsReward;

    await session.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الجلسة بنجاح',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    حذف جلسة
// @route   DELETE /api/discussions/:id
// @access  Private/Admin
const deleteSession = async (req, res, next) => {
  try {
    const session = await DiscussionSession.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'الجلسة غير موجودة'
      });
    }

    await session.destroy();

    res.status(200).json({
      success: true,
      message: 'تم حذف الجلسة بنجاح'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getAllSessions,
  getSessionById,
  markAttendance,
  getSessionAttendees,
  updateSession,
  deleteSession
};
