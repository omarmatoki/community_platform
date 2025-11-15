// مسارات استطلاعات الرأي
const express = require('express');
const router = express.Router();
const {
  createPoll,
  getAllPolls,
  getPollById,
  votePoll,
  getPollResults,
  updatePoll,
  deletePoll
} = require('../controllers/pollController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');

// مسارات عامة
router.get('/', getAllPolls);
router.get('/:id', getPollById);
router.get('/:id/results', getPollResults);

// مسارات محمية
router.post('/:id/vote', protect, votePoll);

// مسارات الأدمن
router.post('/', protect, authorize('admin'), createPoll);
router.put('/:id', protect, authorize('admin'), updatePoll);
router.delete('/:id', protect, authorize('admin'), deletePoll);

module.exports = router;
