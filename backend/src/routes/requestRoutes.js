const express = require('express');
const {
  sendRequest,
  getUserRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
  modifyRequest,
  requestHandoverOtp,
  verifyHandoverOtp,
  requestReturnOtp,
  verifyReturnOtp,
  nudgeReturn,
} = require('../controllers/requestsController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', authMiddleware, sendRequest);
router.get('/user', authMiddleware, getUserRequests);
router.put('/:id/accept', authMiddleware, acceptRequest);
router.put('/:id/reject', authMiddleware, rejectRequest);
router.delete('/:id', authMiddleware, cancelRequest);
router.put('/:id/modify', authMiddleware, modifyRequest);

// Handover endpoints (Owner gives to Borrower)
router.post('/:id/handover-otp', authMiddleware, requestHandoverOtp);
router.post('/:id/handover-verify', authMiddleware, verifyHandoverOtp);

// Return endpoints (Borrower gives to Owner)
router.post('/:id/return-otp', authMiddleware, requestReturnOtp);
router.post('/:id/return-verify', authMiddleware, verifyReturnOtp);

// Owner requests return nudge
router.post('/:id/nudge', authMiddleware, nudgeReturn);

// Extra endpoint to support "When book returned".
router.put('/:id/complete', authMiddleware, completeRequest);

module.exports = router;

