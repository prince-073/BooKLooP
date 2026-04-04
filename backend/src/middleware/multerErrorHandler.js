const { ApiError } = require('../utils/ApiError');

/**
 * Wraps multer middleware so validation errors (wrong type, file too large)
 * become proper 400 JSON instead of hanging or crashing.
 */
function withMulter(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        const message = err.message || 'File upload failed';
        return next(new ApiError(400, message));
      }
      next();
    });
  };
}

module.exports = { withMulter };
