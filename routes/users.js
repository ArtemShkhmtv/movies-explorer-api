const usersRouter = require('express').Router(); // создали роутер
const { celebrate, Joi } = require('celebrate');
const {
  updateUser,
  getAuthorizedUser,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

//  роуты

usersRouter.get('/users/me', auth, getAuthorizedUser);

usersRouter.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
  }),
}), updateUser);

module.exports = {
  usersRouter,
};
