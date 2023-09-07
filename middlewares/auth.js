const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

const { NODE_ENV, JWT_SECRET } = require('../utils/config');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    next(new UnauthorizedError('Необходима авторизация'));
  }
  req.user = payload;
  return next();
};
