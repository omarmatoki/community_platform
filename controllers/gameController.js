// Controller لإدارة الألعاب
const { Game, UserGame } = require('../models');
const { addPoints, calculateGamePoints } = require('../utils/pointsSystem');

// @desc    إنشاء لعبة جديدة
// @route   POST /api/games
// @access  Private/Admin
const createGame = async (req, res, next) => {
  try {
    const { type, title, content, educationalMessage, pointsReward } = req.body;

    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'النوع، العنوان، والمحتوى مطلوبة'
      });
    }

    const game = await Game.create({
      type,
      title,
      content,
      educationalMessage,
      pointsReward: pointsReward || 15
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء اللعبة بنجاح',
      data: game
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على جميع الألعاب
// @route   GET /api/games
// @access  Public
const getAllGames = async (req, res, next) => {
  try {
    const { type } = req.query;

    const where = {};
    if (type) {
      where.type = type;
    }

    const games = await Game.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على لعبة معينة
// @route   GET /api/games/:id
// @access  Public
const getGameById = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'اللعبة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    next(error);
  }
};

// @desc    إكمال لعبة ومنح نقاط
// @route   POST /api/games/:id/complete
// @access  Private
const completeGame = async (req, res, next) => {
  try {
    const gameId = req.params.id;
    const userId = req.user.id;

    // التحقق من وجود اللعبة
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'اللعبة غير موجودة'
      });
    }

    // التحقق من عدم إكمال اللعبة مسبقاً
    const existingGame = await UserGame.findOne({
      where: { userId, gameId, completed: true }
    });

    if (existingGame) {
      return res.status(400).json({
        success: false,
        message: 'لقد أكملت هذه اللعبة مسبقاً'
      });
    }

    // حساب النقاط
    const points = calculateGamePoints(game.type, game.pointsReward);

    // تسجيل الإكمال
    const userGame = await UserGame.create({
      userId,
      gameId,
      completed: true,
      pointsEarned: points,
      completedAt: new Date()
    });

    // منح النقاط
    await addPoints(userId, points);

    res.status(200).json({
      success: true,
      message: `أحسنت! لقد أكملت اللعبة وحصلت على ${points} نقطة`,
      data: {
        pointsEarned: points,
        educationalMessage: game.educationalMessage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على سجل ألعاب المستخدم
// @route   GET /api/games/user/history
// @access  Private
const getUserGameHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userGames = await UserGame.findAll({
      where: { userId },
      include: [
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'type', 'title', 'educationalMessage']
        }
      ],
      order: [['completedAt', 'DESC']]
    });

    const totalPoints = userGames.reduce((sum, ug) => sum + ug.pointsEarned, 0);

    res.status(200).json({
      success: true,
      count: userGames.length,
      totalPoints,
      data: userGames
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تحديث لعبة
// @route   PUT /api/games/:id
// @access  Private/Admin
const updateGame = async (req, res, next) => {
  try {
    const { type, title, content, educationalMessage, pointsReward } = req.body;

    const game = await Game.findByPk(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'اللعبة غير موجودة'
      });
    }

    if (type) game.type = type;
    if (title) game.title = title;
    if (content) game.content = content;
    if (educationalMessage !== undefined) game.educationalMessage = educationalMessage;
    if (pointsReward !== undefined) game.pointsReward = pointsReward;

    await game.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث اللعبة بنجاح',
      data: game
    });
  } catch (error) {
    next(error);
  }
};

// @desc    حذف لعبة
// @route   DELETE /api/games/:id
// @access  Private/Admin
const deleteGame = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'اللعبة غير موجودة'
      });
    }

    await game.destroy();

    res.status(200).json({
      success: true,
      message: 'تم حذف اللعبة بنجاح'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGame,
  getAllGames,
  getGameById,
  completeGame,
  getUserGameHistory,
  updateGame,
  deleteGame
};
