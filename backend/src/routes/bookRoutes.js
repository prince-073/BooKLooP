const express = require('express');
const { addBook, getBooks, getBookById, updateBook, deleteBook, joinWaitlist, getGlobalActivity, saveBook, unsaveBook, getSavedBooks, getStats } = require('../controllers/booksController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadBookImage } = require('../middleware/uploadMiddleware');
const { withMulter } = require('../middleware/multerErrorHandler');

const router = express.Router();

router.get('/', getBooks);
router.get('/stats', getStats);
router.get('/activity', getGlobalActivity);
router.get('/saved', authMiddleware, getSavedBooks);
router.get('/:id', getBookById);

router.post('/add', authMiddleware, withMulter(uploadBookImage), addBook);
router.put('/:id', authMiddleware, withMulter(uploadBookImage), updateBook);
router.delete('/:id', authMiddleware, deleteBook);

router.post('/:id/join-waitlist', authMiddleware, joinWaitlist);
router.post('/:id/save', authMiddleware, saveBook);
router.delete('/:id/save', authMiddleware, unsaveBook);

module.exports = router;

