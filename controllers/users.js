const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');
const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const DuplicateError = require('../errors/duplicate-err');

const {
  OK_STATUS_CODE,
  OK_CREATE_STATUS_CODE,
} = require('../utils/status-code');

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  const owner = req.user._id;

  User.findByIdAndUpdate(
    owner,
    { name, email },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  )
    .then((user) => res.status(OK_STATUS_CODE).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Введены некорректные данные'));
      }
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введены некорректные данные'));
      }
      next(new ServerError('На сервере произошла ошибка'));
    });
};

module.exports.getAuthorizedUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      res.status(OK_STATUS_CODE).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Пользователь не найден'));
      } if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователя не существует'));
      }
      next(new ServerError('На сервере произошла ошибка'));
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 8)
    .then((hash) => {
      User.create({
        name, email, password: hash,
      })
        .then((newUser) => {
          const newUserWithoutPassword = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
          };
          res.status(OK_CREATE_STATUS_CODE).send(newUserWithoutPassword);
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new DuplicateError('Пользователь с таким email уже существует'));
          }
          if (err.name === 'CastError') {
            next(new NotFoundError('Пользователь не найден'));
          }
          if (err.name === 'ValidationError') {
            next(new BadRequestError('Введены некорректные данные'));
          }
          next(new ServerError('На сервере произошла ошибка'));
        });
    }).catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неверный пользователь');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неверный пароль');
          }
          const newUserWithoutPassword = {
            _id: user._id,
            name: user.name,
            email: user.email,
          };
          const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });

          // отправим токен, браузер сохранит его в куках
          res
            .cookie('jwt', token, {
              // token - наш JWT токен, который мы отправляем
              maxAge: 3600000 * 24 * 7,
              httpOnly: true,
              sameSite: true,
            })
            .status(OK_STATUS_CODE)
            .send(newUserWithoutPassword);
        });
    })
    .catch(next);
};

module.exports.logout = (req, res) => {
  if (res.cookie) {
    res.clearCookie('jwt').status(OK_STATUS_CODE).send({ message: 'Вы вышли из аккаунта' });
  }
};
