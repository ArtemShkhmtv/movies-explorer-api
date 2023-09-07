const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

require('dotenv').config();

const { dataMoviesExplorer, PORT } = require('./utils/config');
const { mainRouter } = require('./routes/index');
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

app.use('/', mainRouter);

const auth = require('./middlewares/auth');

mainRouter.use('/*', auth, (req, res, next) => {
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
  await mongoose.connect(dataMoviesExplorer);

  app.listen(PORT, () => {
    console.log(`Сервер запущен на ${PORT} порту.`);
  });
}

main();
