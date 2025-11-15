// مسارات المستخدمين
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPoints,
  getLeaderboardController
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');

// مسارات عامة
router.get('/leaderboard', getLeaderboardController);

// مسارات محمية
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.get('/:id/points', protect, getUserPoints);

module.exports = router;
