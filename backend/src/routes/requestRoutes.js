const express = require('express');
const {
  sendRequest,
  getUserRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
  modifyRequest,
  requestReturnOtp,
  verifyReturnOtp,
} = require('../controllers/requestsController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', authMiddleware, sendRequest);
router.get('/user', authMiddleware, getUserRequests);
router.put('/:id/accept', authMiddleware, acceptRequest);
router.put('/:id/reject', authMiddleware, rejectRequest);
router.delete('/:id', authMiddleware, cancelRequest);
router.put('/:id/modify', authMiddleware, modifyRequest);
router.post('/:id/return-otp', authMiddleware, requestReturnOtp);
router.post('/:id/return-verify', authMiddleware, verifyReturnOtp);

// Extra endpoint to support "When book returned".
router.put('/:id/complete', authMiddleware, completeRequest);

module.exports = router;

