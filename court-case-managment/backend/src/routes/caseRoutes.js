const express = require('express');
const router = express.Router();
const {
  createCase,
  getAllCases,
  getCase,
  updateCase,
  uploadDocument,
  getCaseStats
} = require('../controllers/caseController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, getAllCases)
  .post(protect, adminOnly, createCase);

router.route('/stats/dashboard')
  .get(protect, getCaseStats);

router.route('/:id')
  .get(protect, getCase)
  .put(protect, adminOnly, updateCase);

router.route('/:id/documents')
  .post(protect, adminOnly, upload.single('document'), uploadDocument);

module.exports = router;
