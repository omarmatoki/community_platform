// Controller لإدارة الجلسات الحوارية
const { DiscussionSession, SessionAttendance, User, SessionPoll, SessionPollOption, SessionPollVote } = require('../models');
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
          attributes: ['id', 'name', 'phoneNumber']
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

// @desc    إنشاء استطلاع للجلسة
// @route   POST /api/discussions/:id/poll
// @access  Private/Admin
const createSessionPoll = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const { title, options, endDate, pointsReward } = req.body;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'العنوان وخيارين على الأقل مطلوبان'
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ انتهاء الاستطلاع مطلوب'
      });
    }

    // التحقق من وجود الجلسة
    const session = await DiscussionSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'الجلسة غير موجودة'
      });
    }

    // التحقق من عدم وجود استطلاع مسبق
    const existingPoll = await SessionPoll.findOne({ where: { sessionId } });
    if (existingPoll) {
      return res.status(400).json({
        success: false,
        message: 'يوجد استطلاع بالفعل لهذه الجلسة'
      });
    }

    // إنشاء الاستطلاع
    const poll = await SessionPoll.create({
      sessionId,
      title,
      endDate: new Date(endDate),
      pointsReward: pointsReward || 5
    });

    // إنشاء الخيارات
    const pollOptions = await Promise.all(
      options.map(optionText =>
        SessionPollOption.create({
          pollId: poll.id,
          optionText
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الاستطلاع بنجاح',
      data: {
        poll,
        options: pollOptions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على استطلاع الجلسة
// @route   GET /api/discussions/:id/poll
// @access  Public
const getSessionPoll = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    const poll = await SessionPoll.findOne({
      where: { sessionId },
      include: [
        {
          model: SessionPollOption,
          as: 'options',
          attributes: ['id', 'optionText', 'voteCount']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد استطلاع لهذه الجلسة'
      });
    }

    res.status(200).json({
      success: true,
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    التصويت في استطلاع الجلسة
// @route   POST /api/discussions/:id/poll/vote
// @access  Private
const voteSessionPoll = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.id;
    const { optionId } = req.body;

    if (!optionId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الخيار مطلوب'
      });
    }

    // الحصول على الاستطلاع
    const poll = await SessionPoll.findOne({ where: { sessionId } });
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد استطلاع لهذه الجلسة'
      });
    }

    // التحقق من نشاط الاستطلاع
    if (!poll.isActive || new Date() > new Date(poll.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'الاستطلاع منتهي أو غير نشط'
      });
    }

    // التحقق من وجود الخيار
    const option = await SessionPollOption.findOne({
      where: { id: optionId, pollId: poll.id }
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'الخيار غير موجود'
      });
    }

    // التحقق من عدم التصويت مسبقاً
    const existingVote = await SessionPollVote.findOne({
      where: { pollId: poll.id, userId }
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'لقد صوت في هذا الاستطلاع مسبقاً'
      });
    }

    // تسجيل التصويت
    const vote = await SessionPollVote.create({
      pollId: poll.id,
      optionId,
      userId,
      pointsEarned: poll.pointsReward
    });

    // زيادة عدد الأصوات للخيار
    option.voteCount += 1;
    await option.save();

    // منح النقاط
    await addPoints(userId, poll.pointsReward);

    res.status(200).json({
      success: true,
      message: `تم تسجيل تصويتك بنجاح وحصلت على ${poll.pointsReward} نقطة`,
      data: {
        pointsEarned: poll.pointsReward
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على نتائج استطلاع الجلسة
// @route   GET /api/discussions/:id/poll/results
// @access  Public
const getSessionPollResults = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    const poll = await SessionPoll.findOne({
      where: { sessionId },
      include: [
        {
          model: SessionPollOption,
          as: 'options',
          attributes: ['id', 'optionText', 'voteCount']
        },
        {
          model: SessionPollVote,
          as: 'votes',
          attributes: ['id', 'userId', 'createdAt']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد استطلاع لهذه الجلسة'
      });
    }

    const totalVotes = poll.votes.length;
    const resultsWithPercentage = poll.options.map(option => ({
      id: option.id,
      optionText: option.optionText,
      voteCount: option.voteCount,
      percentage: totalVotes > 0 ? ((option.voteCount / totalVotes) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        poll: {
          id: poll.id,
          title: poll.title,
          endDate: poll.endDate,
          isActive: poll.isActive,
          totalVotes
        },
        results: resultsWithPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    إضافة رابط Google Meet للجلسة
// @route   POST /api/discussions/:id/meet-link
// @access  Private/Admin
const addMeetLink = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const { meetLink } = req.body;

    if (!meetLink) {
      return res.status(400).json({
        success: false,
        message: 'رابط Google Meet مطلوب'
      });
    }

    const session = await DiscussionSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'الجلسة غير موجودة'
      });
    }

    session.meetLink = meetLink;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'تم إضافة رابط Google Meet بنجاح',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على رابط Google Meet للجلسة
// @route   GET /api/discussions/:id/meet-link
// @access  Public
const getMeetLink = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    const session = await DiscussionSession.findByPk(sessionId, {
      attributes: ['id', 'title', 'meetLink', 'dateTime']
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'الجلسة غير موجودة'
      });
    }

    if (!session.meetLink) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم إضافة رابط Google Meet لهذه الجلسة بعد'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        title: session.title,
        meetLink: session.meetLink,
        dateTime: session.dateTime
      }
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
  deleteSession,
  createSessionPoll,
  getSessionPoll,
  voteSessionPoll,
  getSessionPollResults,
  addMeetLink,
  getMeetLink
};
