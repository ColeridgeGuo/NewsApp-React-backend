const express = require('express');
const router = express.Router();
const guardian = require('./guardian/guardian');
const nytimes = require('./nytimes/nytimes');

// search from both sources
function search_query(query) {
  const nytimes_promise = nytimes.search_nytimes_results(query)
  const guardian_promise = guardian.search_guardian_results(query)
  return Promise.all([nytimes_promise, guardian_promise])
    .then( values => {
      return [...nytimes.process_nytimes_search_results(values[0]).articles.slice(0,5),
        ...guardian.process_guardian_results(values[1]).articles.slice(0,5)]
    }
    )
}

router.get('/:query', (req, res) => {
  search_query(req.params.query)
    .then( data => {
      res.json(data)
    })
})

module.exports = router;