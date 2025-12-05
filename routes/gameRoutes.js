// مسارات الألعاب
const express = require('express');
const router = express.Router();
const {
  createGame,
  getAllGames,
  getGameById,
  completeGame,
  getUserGameHistory,
  updateGame,
  deleteGame
} = require('../controllers/gameController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');
const { uploadGameImage, handleMulterError } = require('../middlewares/upload');

// مسارات عامة
router.get('/', getAllGames);
router.get('/:id', getGameById);

// مسارات محمية
router.post('/:id/complete', protect, completeGame);
router.get('/user/history', protect, getUserGameHistory);

// مسارات الأدمن
router.post('/', protect, authorize('admin'), uploadGameImage, handleMulterError, createGame);
router.put('/:id', protect, authorize('admin'), uploadGameImage, handleMulterError, updateGame);
router.delete('/:id', protect, authorize('admin'), deleteGame);

module.exports = router;
