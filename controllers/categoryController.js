// Controller لإدارة التصنيفات
const { Category, Article } = require('../models');

// @desc    إنشاء تصنيف جديد
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'اسم التصنيف مطلوب'
      });
    }

    const category = await Category.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء التصنيف بنجاح',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على جميع التصنيفات
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Article,
          as: 'articles',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على تصنيف معين
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Article,
          as: 'articles',
          attributes: ['id', 'title', 'content', 'createdAt']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    تحديث تصنيف
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود'
      });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث التصنيف بنجاح',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    حذف تصنيف
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود'
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'تم حذف التصنيف بنجاح'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
