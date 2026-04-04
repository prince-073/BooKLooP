const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
  blockUser,
  unblockUser,
  getBlockedUsers,
} = require('../controllers/chatController');
const { uploadChatAttachment } = require('../middleware/chatUploadMiddleware');
const { withMulter } = require('../middleware/multerErrorHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.delete('/conversations/:conversationId', deleteConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', withMulter(uploadChatAttachment), sendMessage);
router.get('/blocked', getBlockedUsers);
router.post('/block', blockUser);
router.post('/unblock', unblockUser);

module.exports = router;

