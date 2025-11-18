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
  deleteSession,
  createSessionPoll,
  getSessionPoll,
  voteSessionPoll,
  getSessionPollResults,
  addMeetLink,
  getMeetLink
} = require('../controllers/discussionController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');

// مسارات عامة
router.get('/', getAllSessions);
router.get('/:id', getSessionById);
router.get('/:id/poll', getSessionPoll);
router.get('/:id/poll/results', getSessionPollResults);
router.get('/:id/meet-link', getMeetLink);

// مسارات محمية
router.post('/:id/attend', protect, markAttendance);
router.post('/:id/poll/vote', protect, voteSessionPoll);

// مسارات الأدمن
router.post('/', protect, authorize('admin'), createSession);
router.get('/:id/attendees', protect, authorize('admin'), getSessionAttendees);
router.put('/:id', protect, authorize('admin'), updateSession);
router.delete('/:id', protect, authorize('admin'), deleteSession);
router.post('/:id/poll', protect, authorize('admin'), createSessionPoll);
router.post('/:id/meet-link', protect, authorize('admin'), addMeetLink);

module.exports = router;
