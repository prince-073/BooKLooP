const express = require('express');
const { submitRating } = require('../controllers/ratingController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, submitRating);

module.exports = router;
