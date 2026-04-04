const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiError');
const { env } = require('../config/env');

function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Missing or invalid Authorization header');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch (e) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = { authMiddleware };

