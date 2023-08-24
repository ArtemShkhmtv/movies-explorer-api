const Movie = require('../models/movie');
const {
  OK_STATUS_CODE,
  OK_CREATE_STATUS_CODE,
} = require('../utils/status-code');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-action-err');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.send(movies);
    })
    .catch(() => {
      next(new ServerError('На сервере произошла ошибка'));
    });
};

module.exports.addMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => res.status(OK_CREATE_STATUS_CODE).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введены некорректные данные'));
      }
      next(new ServerError('На сервере произошла ошибка'));
    });
};

module.exports.deleteAimMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail()
    .then((movie) => {
      if ((!movie.owner.equals(req.user._id))) {
        throw (new ForbiddenError('Попытка удаления фильма, добавленного другимого пользователем'));
      }
      Movie.findByIdAndRemove(req.params.movieId)
        .then((deletedMovie) => {
          res.status(OK_STATUS_CODE).send(deletedMovie);
        }).catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Фильм не найден'));
      } if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Фильма не существует'));
      }
      if (err.message === 'Попытка удаления фильма другого пользователя') {
        next(new ForbiddenError('Попытка удаления фильма другого пользователя'));
      }
      next(new ServerError('На сервере произошла ошибка'));
    });
};

// module.exports.likeCard = (req, res, next) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
//     { new: true },
//   )
//     .orFail()
//     .then((card) => {
//       res.status(OK_CREATE_STATUS_CODE).send(card);
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         next(new BadRequestError('Карточка не найдена'));
//       } if (err.name === 'DocumentNotFoundError') {
//         next(new NotFoundError('Карточки не существует'));
//       }
//       next(new ServerError('На сервере произошла ошибка'));
//     });
// };

// module.exports.dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
//   req.params.cardId,
//   { $pull: { likes: req.user._id } }, // убрать _id из массива
//   { new: true },
// )
//   .orFail()
//   .then((card) => {
//     res.status(OK_STATUS_CODE).send(card);
//   })
//   .catch((err) => {
//     if (err.name === 'CastError') {
//       next(new BadRequestError('Карточка не найдена'));
//     } if (err.name === 'DocumentNotFoundError') {
//       next(new NotFoundError('Карточки не существует'));
//     }
//     next(new ServerError('На сервере произошла ошибка'));
//   });
