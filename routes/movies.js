const router = require('express').Router(); // создали роутер
const { celebrate, Joi } = require('celebrate');
const { regEx } = require('../utils/reg-ex');
const {
  getMovies,
  addMovie,
  deleteAimMovie,
} = require('../controllers/movies');
const auth = require('../middlewares/auth');

//  роуты

router.get('/movies', auth, getMovies);

router.post('/movies', auth, celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number(),
    year: Joi.string().length(4),
    description: Joi.string().required(),
    image: Joi.string().pattern(regEx),
    trailerLink: Joi.string().pattern(regEx),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().pattern(regEx),
    movieId: Joi.string().alphanum(),
  }),
}), addMovie);

router.delete('/movies/:movieId', auth, celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex().required(),
  }),
}), deleteAimMovie);

module.exports = {
  router,
};
