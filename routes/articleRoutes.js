// مسارات المقالات
const express = require('express');
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  getArticleById,
  getArticlesByCategory,
  updateArticle,
  deleteArticle,
  markArticleAsRead
} = require('../controllers/articleController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');

// مسارات عامة
router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.get('/category/:categoryId', getArticlesByCategory);

// مسارات محمية
router.post('/:id/read', protect, markArticleAsRead);

// مسارات الأدمن
router.post('/', protect, authorize('admin'), createArticle);
router.put('/:id', protect, authorize('admin'), updateArticle);
router.delete('/:id', protect, authorize('admin'), deleteArticle);

module.exports = router;
