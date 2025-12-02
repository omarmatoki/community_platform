// Controller لإدارة استطلاعات الرأي
const { Poll, PollOption, PollVote, User } = require('../models');
const { addPoints, calculatePollPoints } = require('../utils/pointsSystem');

// @desc    إنشاء استطلاع رأي جديد
// @route   POST /api/polls
// @access  Private/Admin
const createPoll = async (req, res, next) => {
  try {
    const { title, description, pointsReward, options } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'عنوان الاستطلاع مطلوب'
      });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'يجب إضافة خيارين على الأقل للاستطلاع'
      });
    }

    // إنشاء الاستطلاع
    const poll = await Poll.create({
      title,
      description,
      adminId: req.user.id,
      pointsReward: pointsReward || 5
    });

    // إنشاء الخيارات
    await Promise.all(
      options.map((optionText, index) =>
        PollOption.create({
          pollId: poll.id,
          text: optionText,
          order: index
        })
      )
    );

    // إرجاع الاستطلاع مع الخيارات
    const pollWithOptions = await Poll.findByPk(poll.id, {
      include: [
        {
          model: PollOption,
          as: 'options',
          attributes: ['id', 'text', 'order']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الاستطلاع بنجاح',
      data: pollWithOptions
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
        },
        {
          model: PollOption,
          as: 'options',
          attributes: ['id', 'text', 'order']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // الحصول على عدد الأصوات لكل خيار
    const pollsWithStats = await Promise.all(
      polls.map(async (poll) => {
        const pollData = poll.toJSON();

        if (pollData.options) {
          // حساب عدد الأصوات لكل خيار
          const optionsWithVotes = await Promise.all(
            pollData.options.map(async (option) => {
              const votesCount = await PollVote.count({
                where: { optionId: option.id }
              });

              return {
                id: option.id,
                text: option.text,
                order: option.order,
                votesCount
              };
            })
          );

          // حساب مجموع الأصوات
          const totalVotes = optionsWithVotes.reduce((sum, opt) => sum + opt.votesCount, 0);

          // إضافة النسب المئوية
          pollData.options = optionsWithVotes.map(option => ({
            id: option.id,
            text: option.text,
            order: option.order,
            votesCount: option.votesCount,
            percentage: totalVotes > 0 ? parseFloat(((option.votesCount / totalVotes) * 100).toFixed(1)) : 0
          }));

          // ترتيب الخيارات حسب order
          pollData.options.sort((a, b) => a.order - b.order);

          // إضافة مجموع الأصوات للاستطلاع
          pollData.totalVotes = totalVotes;
        }

        return pollData;
      })
    );

    res.status(200).json({
      success: true,
      count: polls.length,
      data: pollsWithStats
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
          model: PollOption,
          as: 'options',
          attributes: ['id', 'text', 'order']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'الاستطلاع غير موجود'
      });
    }

    // إضافة إحصائيات الأصوات
    const pollData = poll.toJSON();

    // حساب عدد الأصوات لكل خيار
    let totalVotes = 0;
    pollData.options = await Promise.all(
      pollData.options.map(async (option) => {
        const votesCount = await PollVote.count({
          where: { optionId: option.id }
        });

        totalVotes += votesCount;

        return {
          id: option.id,
          text: option.text,
          order: option.order,
          votesCount
        };
      })
    );

    // إضافة النسب المئوية
    pollData.options = pollData.options.map(option => ({
      ...option,
      percentage: totalVotes > 0 ? parseFloat(((option.votesCount / totalVotes) * 100).toFixed(1)) : 0
    }));

    // ترتيب الخيارات
    pollData.options.sort((a, b) => a.order - b.order);

    pollData.totalVotes = totalVotes;

    res.status(200).json({
      success: true,
      data: pollData
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
    const { optionId } = req.body;
    const pollId = req.params.id;
    const userId = req.user.id;

    if (!optionId) {
      return res.status(400).json({
        success: false,
        message: 'يجب اختيار أحد الخيارات'
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

    // التحقق من وجود الخيار وأنه ينتمي للاستطلاع
    const option = await PollOption.findOne({
      where: { id: optionId, pollId }
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'الخيار غير موجود أو لا ينتمي لهذا الاستطلاع'
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
    await PollVote.create({
      pollId,
      userId,
      optionId,
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

    const poll = await Poll.findByPk(pollId, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        },
        {
          model: PollOption,
          as: 'options',
          attributes: ['id', 'text', 'order']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'الاستطلاع غير موجود'
      });
    }

    // حساب الإحصائيات
    const pollData = poll.toJSON();

    let totalVotes = 0;
    pollData.options = await Promise.all(
      pollData.options.map(async (option) => {
        // الحصول على الأصوات مع معلومات المستخدمين
        const votes = await PollVote.findAll({
          where: { optionId: option.id },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ],
          attributes: ['id', 'userId', 'createdAt']
        });

        const votesCount = votes.length;
        totalVotes += votesCount;

        return {
          id: option.id,
          text: option.text,
          order: option.order,
          votesCount,
          voters: votes.map(v => ({
            userId: v.user.id,
            userName: v.user.name,
            votedAt: v.createdAt
          }))
        };
      })
    );

    // إضافة النسب المئوية
    pollData.options = pollData.options.map(option => ({
      ...option,
      percentage: totalVotes > 0 ? parseFloat(((option.votesCount / totalVotes) * 100).toFixed(1)) : 0
    }));

    // ترتيب الخيارات
    pollData.options.sort((a, b) => a.order - b.order);

    pollData.totalVotes = totalVotes;

    res.status(200).json({
      success: true,
      data: pollData
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
    const { title, description, pointsReward, options } = req.body;

    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'الاستطلاع غير موجود'
      });
    }

    // التحقق من وجود أصوات - إذا كان هناك أصوات، لا يمكن تعديل الخيارات
    const existingVotes = await PollVote.count({
      where: { pollId: req.params.id }
    });

    if (existingVotes > 0 && options) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تعديل خيارات الاستطلاع بعد بدء التصويت'
      });
    }

    // تحديث معلومات الاستطلاع
    if (title) poll.title = title;
    if (description !== undefined) poll.description = description;
    if (pointsReward !== undefined) poll.pointsReward = pointsReward;

    await poll.save();

    // تحديث الخيارات إذا تم تقديمها ولا توجد أصوات
    if (options && Array.isArray(options) && options.length >= 2) {
      // حذف الخيارات القديمة
      await PollOption.destroy({
        where: { pollId: poll.id }
      });

      // إنشاء الخيارات الجديدة
      await Promise.all(
        options.map((optionText, index) =>
          PollOption.create({
            pollId: poll.id,
            text: optionText,
            order: index
          })
        )
      );
    }

    // إرجاع الاستطلاع المحدث مع الخيارات
    const updatedPoll = await Poll.findByPk(poll.id, {
      include: [
        {
          model: PollOption,
          as: 'options',
          attributes: ['id', 'text', 'order']
        }
      ],
      order: [[{ model: PollOption, as: 'options' }, 'order', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'تم تحديث الاستطلاع بنجاح',
      data: updatedPoll
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
