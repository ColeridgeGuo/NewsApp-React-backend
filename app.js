const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

const guardian = require('./guardian/guardian');
const nytimes = require('./nytimes/nytimes');
const search = require('./search');

// GET Guardian articles
app.use('/guardian', guardian.router);

// GET NYTimes articles
app.use('/nytimes', nytimes.router);

app.use('/search', search);

module.exports = app;