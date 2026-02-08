const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('Admin'), createNotification);

router.route('/read-all')
  .put(protect, markAllAsRead);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/:id')
  .delete(protect, deleteNotification);

module.exports = router;
