const express = require('express');
const { register, login, requestOtp, verifyOtp, logout, updateMe, updateAvatar } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/avatarUploadMiddleware');
const { withMulter } = require('../middleware/multerErrorHandler');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logout);
router.patch('/me', authMiddleware, updateMe);
router.post('/me/avatar', authMiddleware, withMulter(uploadAvatar), updateAvatar);

module.exports = router;
