const express = require('express');
const app = express();

const guardian = require('./guardian/guardian');
const nytimes = require('./nytimes/nytimes');

// GET Guardian articles
app.use('/guardian', guardian);

// GET NYTimes articles
app.use('/nytimes', nytimes);

// handle 404 errors
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
})
// handle 500 errors
app.use((error, req, res) => {
  res.status(error.status || 500);
  res.json({err: {message: error.message}});
})

module.exports = app;