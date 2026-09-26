const express = require('express');
const { adminDirectIssue, adminForceHandover } = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

// Both endpoints are protected and restricted to Admins only
router.post('/issue-book', authMiddleware, adminMiddleware, adminDirectIssue);
router.post('/requests/:id/force-handover', authMiddleware, adminMiddleware, adminForceHandover);

module.exports = router;
