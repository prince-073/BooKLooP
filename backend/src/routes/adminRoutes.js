const express = require('express');
const { adminDirectIssue, adminForceHandover, adminUpdateUserRole } = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

// Endpoints are protected and restricted to Admins only
router.post('/issue-book', authMiddleware, adminMiddleware, adminDirectIssue);
router.post('/requests/:id/force-handover', authMiddleware, adminMiddleware, adminForceHandover);
router.patch('/users/:id/role', authMiddleware, adminMiddleware, adminUpdateUserRole);

module.exports = router;
