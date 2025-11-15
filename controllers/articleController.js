// Controller لإدارة المقالات
const { Article, Category, User, Survey, ArticleRead } = require('../models');
const { addPoints, POINTS_CONFIG } = require('../utils/pointsSystem');

// @desc    إنشاء مقال جديد
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = async (req, res, next) => {
  try {
    const { title, content, categoryId } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }

    // التحقق من وجود التصنيف
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود'
      });
    }

    const article = await Article.create({
      title,
      content,
      categoryId,
      adminId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المقال بنجاح',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على جميع المقالات
// @route   GET /api/articles
// @access  Public
const getAllArticles = async (req, res, next) => {
  try {
    const articles = await Article.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        },
        {
          model: Survey,
          as: 'survey',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على مقال معين
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        },
        {
          model: Survey,
          as: 'survey',
          attributes: ['id', 'title']
        }
      ]
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على المقالات حسب التصنيف
// @route   GET /api/articles/category/:categoryId
// @access  Public
const getArticlesByCategory = async (req, res, next) => {
  try {
    const articles = await Article.findAll({
      where: { categoryId: req.params.categoryId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
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
      count: articles.length,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تحديث مقال
// @route   PUT /api/articles/:id
// @access  Private/Admin
const updateArticle = async (req, res, next) => {
  try {
    const { title, content, categoryId } = req.body;

    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    if (title) article.title = title;
    if (content) article.content = content;
    if (categoryId) {
      // التحقق من وجود التصنيف
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'التصنيف غير موجود'
        });
      }
      article.categoryId = categoryId;
    }

    await article.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث المقال بنجاح',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    حذف مقال
// @route   DELETE /api/articles/:id
// @access  Private/Admin
const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    await article.destroy();

    res.status(200).json({
      success: true,
      message: 'تم حذف المقال بنجاح'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تسجيل قراءة مقال ومنح نقاط
// @route   POST /api/articles/:id/read
// @access  Private
const markArticleAsRead = async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const userId = req.user.id;

    // التحقق من وجود المقال
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    // التحقق من عدم قراءة المقال مسبقاً
    const existingRead = await ArticleRead.findOne({
      where: { userId, articleId }
    });

    if (existingRead) {
      return res.status(400).json({
        success: false,
        message: 'لقد قرأت هذا المقال مسبقاً'
      });
    }

    // تسجيل القراءة
    const articleRead = await ArticleRead.create({
      userId,
      articleId,
      pointsEarned: POINTS_CONFIG.READ_ARTICLE
    });

    // منح النقاط
    await addPoints(userId, POINTS_CONFIG.READ_ARTICLE);

    res.status(200).json({
      success: true,
      message: `تم تسجيل القراءة وحصلت على ${POINTS_CONFIG.READ_ARTICLE} نقاط`,
      data: {
        pointsEarned: POINTS_CONFIG.READ_ARTICLE
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  getArticlesByCategory,
  updateArticle,
  deleteArticle,
  markArticleAsRead
};
