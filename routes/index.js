const mainRouter = require('express').Router(); // создали роутер

const { router } = require('./movies');
const { usersRouter } = require('./users');

mainRouter.use('/', usersRouter);
mainRouter.use('/', router);

module.exports = {
  mainRouter,
};
