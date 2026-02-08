const express = require('express');
const router = express.Router();
const {
  scheduleHearing,
  getAllHearings,
  getHearing,
  updateHearing,
  getHearingsCalendar,
  getUpcomingHearings
} = require('../controllers/hearingController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, getAllHearings)
  .post(protect, adminOnly, scheduleHearing);

router.route('/calendar/monthly')
  .get(protect, getHearingsCalendar);

router.route('/upcoming/list')
  .get(protect, getUpcomingHearings);

router.route('/:id')
  .get(protect, getHearing)
  .put(protect, adminOnly, updateHearing);

module.exports = router;
