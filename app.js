const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { celebrate, Joi } = require('celebrate');
const cors = require('cors');
// const { regEx } = require('./utils/reg-ex');
const { requestLogger, errorLogger } = require('./middlewares/logger');

require('dotenv').config();

const {
  createUser,
  login,
  logout,
} = require('./controllers/users');

const { PORT = 3000 } = process.env;
const { router } = require('./routes/movies');
const { usersRouter } = require('./routes/users');
const NotFoundError = require('./errors/not-found-err');
const { SERVER_ERROR_STAUS_CODE } = require('./utils/status-code');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://artpr.nomoredomainsicu.ru',
  ],
  credentials: true,
}));

app.use(express.json());

app.use(cookieParser());

app.use(requestLogger); // подключаем логгер запросов

app.post(
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

app.post(
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

app.post(
  '/signout',
  logout,
);

app.use('/', usersRouter);
app.use('/', router);

router.use('/*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());

app.use((err, req, res, next) => {
  if (!err.statusCode) {
    res.status(SERVER_ERROR_STAUS_CODE).send({ message: 'Произошла ошибка' });
  } else {
    res.status(err.statusCode).send({ message: err.message });
  }
  next();
});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb');

  app.listen(PORT, () => {
    console.log(`Сервер запущен на ${PORT} порту.`);
  });
}

main();
