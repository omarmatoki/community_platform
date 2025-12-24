// مسارات الاستبيانات
const express = require('express');
const router = express.Router();
const {
  createSurvey,
  getSurveyByArticleId,
  submitSurveyAnswers,
  getUserSurveyResults,
  updateSurvey
} = require('../controllers/surveyController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');

// مسارات عامة
router.get('/article/:articleId', getSurveyByArticleId);

// مسارات محمية
router.post('/:surveyId/submit', protect, submitSurveyAnswers);
router.get('/:surveyId/results', protect, getUserSurveyResults);

// مسارات الأدمن
router.post('/', protect, authorize('admin'), createSurvey);
router.put('/:id', protect, authorize('admin'), updateSurvey);

module.exports = router;
