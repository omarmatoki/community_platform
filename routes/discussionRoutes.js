// مسارات الجلسات الحوارية
const express = require('express');
const router = express.Router();
const {
  createSession,
  getAllSessions,
  getSessionById,
  markAttendance,
  getSessionAttendees,
  updateSession,
  deleteSession
} = require('../controllers/discussionController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');

// مسارات عامة
router.get('/', getAllSessions);
router.get('/:id', getSessionById);

// مسارات محمية
router.post('/:id/attend', protect, markAttendance);

// مسارات الأدمن
router.post('/', protect, authorize('admin'), createSession);
router.get('/:id/attendees', protect, authorize('admin'), getSessionAttendees);
router.put('/:id', protect, authorize('admin'), updateSession);
router.delete('/:id', protect, authorize('admin'), deleteSession);

module.exports = router;
