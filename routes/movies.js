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

router.patch('/movies', auth, celebrate({
  body: Joi.object().keys({
    country: Joi.string().min(2).max(30),
    director: Joi.string().min(2).max(30),
    duration: Joi.number(),
    year: Joi.string().length(4),
    description: Joi.string().min(2).max(30),
    image: Joi.string().pattern(regEx),
    trailer: Joi.string().pattern(regEx),
    nameRU: Joi.string().min(1).max(50),
    nameEN: Joi.string().min(1).max(50),
    thumbnail: Joi.string().pattern(regEx),
    movieId: Joi.string().alphanum(),
  }),
}), addMovie);

router.delete('/movies/:movieId', auth, celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().alphanum(),
  }),
}), deleteAimMovie);

module.exports = {
  router,
};
