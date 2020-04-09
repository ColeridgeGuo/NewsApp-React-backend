const express = require('express');
const app = express();

const guardian = require('./guardian/guardian');
const nytimes = require('./nytimes/nytimes');

// GET Guardian articles
app.use('/guardian', guardian);

// GET NYTimes articles
app.use('/nytimes', nytimes);

module.exports = app;