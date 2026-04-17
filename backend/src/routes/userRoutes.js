const express = require('express');
const { getAllUsers, getUserById, recordVisit, getMyVisitors } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/me/visitors', authMiddleware, getMyVisitors);
router.post('/:id/visit', authMiddleware, recordVisit);
router.get('/all', authMiddleware, adminMiddleware, getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
