const usersRouter = require('express').Router(); // создали роутер
const { celebrate, Joi } = require('celebrate');
const {
  updateUser,
  getAuthorizedUser,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

//  роуты

const {
  createUser,
  login,
  logout,
} = require('../controllers/users');

usersRouter.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().min(2).max(30).email()
        .required(),
      password: Joi.string().min(2).max(30).required(),
    }),
  }),
  createUser,
);

usersRouter.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().min(2).max(30).email()
        .required(),
      password: Joi.string().min(2).max(30).required(),
    }),
  }),
  login,
);

usersRouter.post(
  '/signout',
  logout,
);

usersRouter.get('/users/me', auth, getAuthorizedUser);

usersRouter.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().min(2).max(30).email(),
  }),
}), updateUser);

module.exports = {
  usersRouter,
};
