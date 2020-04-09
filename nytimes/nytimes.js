const express = require('express');
const router = express.Router();
const axios = require('axios');

// useful NYTimes consts
const nytimes_default_img_url = "https://upload.wikimedia.org/wikipedia/commons/0/0e/Nytimes_hq.jpg";
const nytimes_api_key = "1HzpS5vMG5GY8t5nTyN0Gj2SssDJ71Ye";

// get NYTimes home articles
function get_nytimes_home() {
  return axios.get(`https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${nytimes_api_key}`)
    .then(response => {
      console.log(`Getting NYTimes home - status: ${response.status}`);
      return response.data.results.filter(filter_nytimes_section).slice(0,10);
    })
    .catch( error => {
      console.log(error);
    });
}

// filter home articles to selected sections
function filter_nytimes_section(article) {
  const sections = ['world', 'business', 'technology', 'sports'];
  return sections.includes(article.section) || article.subsection === 'politics';
}

// get NYTimes articles by section
function get_nytimes_section(section) {
  return axios.get(`https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${nytimes_api_key}`)
    .then( response => {
      console.log(`Getting NYTimes section \'${section}\' - status: ${response.status}`);
      return response.data.results.slice(0,10);
    })
    .catch( error => {
      console.log(error);
    });
}

// return processed NYTimes results
function process_nytimes_results(data) {
  const results = {articles: []};
  for (let i = 0; i < data.length; i++) {
    const article = {};
  
    // validate id
    if (data[i].uri) article.id = data[i].uri;
    else { console.log(`\tskipping article ${i}: id missing.`); continue; }
  
    // validate url
    if (data[i].url) article.url = data[i].url;
    else { console.log(`\tskipping article ${i}: url missing.`); continue; }
    
    // validate title
    if (data[i].title) article.title = data[i].title;
    else { console.log(`\tskipping article ${i}: title missing.`); continue; }
    
    // validate img url
    try {
      if (data[i].multimedia && data[i].multimedia.length > 0) {
        const image = data[i].multimedia.filter((multimedia) => multimedia.width > 2000);
        article.image = image[0].url;
      }
    }
    catch (e) {}
    finally { if (!article.image) article.image = nytimes_default_img_url; }
  
    // validate sectionId
    if (data[i].section) {
      // NYTimes returns politics articles with section='[country]' and subsection='politics'
      if (data[i].subsection === 'politics') article.sectionId = data[i].subsection;
      else article.sectionId = data[i].section;
    }
    else { console.log(`\tskipping article ${i}: sectionId missing.`); continue; }
    
      // validate publication date
    const date_patt = /\d{4}-\d{2}-\d{2}/;
    if (data[i].published_date)
      article.date = date_patt.exec(data[i].published_date)[0];
    else { console.log(`\tskipping article ${i}: date missing.`); continue; }
  
    // validate description
    if (data[i].abstract) article.descp = data[i].abstract;
    else { console.log(`\tskipping article ${i}: description missing.`); continue; }
  
    // push validated article
    results.articles.push(article);
  }
  return results;
}

router.get('/', (req, res) => {
  get_nytimes_home()
    .then(data => {
      res.json(process_nytimes_results(data))
    })
})

router.get('/:sectionId', (req, res) => {
  const sections = ['world', 'politics', 'business', 'technology', 'sports'];
  if (!sections.includes(req.params.sectionId)) {
    res.json({error: {message: "Unknown section ID."}})
  }
  else {
    get_nytimes_section(req.params.sectionId)
      .then(data => {
        res.json(process_nytimes_results(data))
      })
  }
})

module.exports = router;