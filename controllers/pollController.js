// Controller لإدارة استطلاعات الرأي
const { Poll, PollVote, User } = require('../models');
const { addPoints, calculatePollPoints } = require('../utils/pointsSystem');

// @desc    إنشاء استطلاع رأي جديد
// @route   POST /api/polls
// @access  Private/Admin
const createPoll = async (req, res, next) => {
  try {
    const { title, description, pointsReward } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'عنوان الاستطلاع مطلوب'
      });
    }

    const poll = await Poll.create({
      title,
      description,
      adminId: req.user.id,
      pointsReward: pointsReward || 5
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الاستطلاع بنجاح',
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على جميع الاستطلاعات
// @route   GET /api/polls
// @access  Public
const getAllPolls = async (req, res, next) => {
  try {
    const polls = await Poll.findAll({
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: polls.length,
      data: polls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على استطلاع معين
// @route   GET /api/polls/:id
// @access  Public
const getPollById = async (req, res, next) => {
  try {
    const poll = await Poll.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        },
        {
          model: PollVote,
          as: 'votes',
          attributes: ['id', 'vote', 'createdAt']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'الاستطلاع غير موجود'
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

// @desc    التصويت في استطلاع
// @route   POST /api/polls/:id/vote
// @access  Private
const votePoll = async (req, res, next) => {
  try {
    const { vote } = req.body;
    const pollId = req.params.id;
    const userId = req.user.id;

    if (!vote) {
      return res.status(400).json({
        success: false,
        message: 'الصوت مطلوب'
      });
    }

    // التحقق من وجود الاستطلاع
    const poll = await Poll.findByPk(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'الاستطلاع غير موجود'
      });
    }

    // التحقق من عدم التصويت مسبقاً
    const existingVote = await PollVote.findOne({
      where: { pollId, userId }
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'لقد صوّت في هذا الاستطلاع مسبقاً'
      });
    }

    // حساب النقاط
    const points = calculatePollPoints(poll.pointsReward);

    // تسجيل التصويت
    const pollVote = await PollVote.create({
      pollId,
      userId,
      vote,
      pointsEarned: points
    });

    // منح النقاط
    await addPoints(userId, points);

    res.status(200).json({
      success: true,
      message: `شكراً على المشاركة! حصلت على ${points} نقطة`,
      data: {
        pointsEarned: points
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على نتائج الاستطلاع
// @route   GET /api/polls/:id/results
// @access  Public
const getPollResults = async (req, res, next) => {
  try {
    const pollId = req.params.id;

    const poll = await Poll.findByPk(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'الاستطلاع غير موجود'
      });
    }

    const votes = await PollVote.findAll({
      where: { pollId },
      attributes: ['vote'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ]
    });

    // تجميع النتائج
    const results = {};
    votes.forEach(v => {
      if (results[v.vote]) {
        results[v.vote]++;
      } else {
        results[v.vote] = 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        poll,
        totalVotes: votes.length,
        results,
        votes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تحديث استطلاع
// @route   PUT /api/polls/:id
// @access  Private/Admin
const updatePoll = async (req, res, next) => {
  try {
    const { title, description, pointsReward } = req.body;

    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'الاستطلاع غير موجود'
      });
    }

    if (title) poll.title = title;
    if (description !== undefined) poll.description = description;
    if (pointsReward !== undefined) poll.pointsReward = pointsReward;

    await poll.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الاستطلاع بنجاح',
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    حذف استطلاع
// @route   DELETE /api/polls/:id
// @access  Private/Admin
const deletePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'الاستطلاع غير موجود'
      });
    }

    await poll.destroy();

    res.status(200).json({
      success: true,
      message: 'تم حذف الاستطلاع بنجاح'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  votePoll,
  getPollResults,
  updatePoll,
  deletePoll
};
