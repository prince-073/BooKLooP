const express = require('express');
const { getUserById, recordVisit, getMyVisitors } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me/visitors', authMiddleware, getMyVisitors);
router.post('/:id/visit', authMiddleware, recordVisit);
router.get('/:id', authMiddleware, getUserById);

module.exports = router;
