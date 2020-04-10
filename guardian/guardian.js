const express = require('express');
const router = express.Router();
const axios = require('axios');

// useful Guardian consts
const guardian_default_img_url = "https://assets.guim.co.uk/images/eada8aa27c12fe2d5afa3a89d3fbae0d/fallback-logo.png";
const guardian_api_key = "8f86228c-9df5-451e-a505-f7979e6ec8a3";

// get Guardian home articles
function get_guardian_home() {
  return axios.get(`https://content.guardianapis.com/search?api-key=${guardian_api_key}&section=(world|sport|business|technology|politics)&show-blocks=all&page-size=20`)
    .then(response => {
      console.log(`Getting Guardian home - status: ${response.status}`);
      return response.data.response.results;
    })
    .catch(error => {
      console.log(error);
    });
}

// get Guardian articles by section
function get_guardian_by_section(section) {
  return axios.get(`https://content.guardianapis.com/${section}?api-key=${guardian_api_key}&show-blocks=all&page-size=20`)
    .then( response => {
      console.log(`Getting Guardian section \'${section}\' - status: ${response.status}`);
      return response.data.response.results;
    })
    .catch( error => {
      console.log(error);
    });
}

// return processed Guardian results
function process_guardian_results(data) {
  const results = {articles: []};
  for (let i = 0; i < data.length; i++) {
    const article = {};
    
    // validate id
    if (data[i].id) article.id = data[i].id;
    else { console.log(`\tskipping article ${i}: id missing.`); continue; }
    
    // validate url
    if (data[i].webUrl) article.url = data[i].webUrl;
    else { console.log(`\tskipping article ${i}: url missing.`); continue; }
    
    // validate title
    if (data[i].webTitle) article.title = data[i].webTitle;
    else { console.log(`\tskipping article ${i}: title missing.`); continue; }
    
    // validate image url
    let assets;
    try { assets = data[i].blocks.main.elements[0].assets; }
    catch (e) {}
    finally {
      if (assets && assets.length > 0) { article.image = assets[assets.length - 1].file; }
      else article.image = guardian_default_img_url;
    }
    
    // validate sectionId
    if (data[i].sectionId) {
      if (data[i].sectionId === 'sport') data[i].sectionId = 'sports';
      article.sectionId = data[i].sectionId;
    }
    else { console.log(`\tskipping article ${i}: sectionId missing.`); continue; }
    
    // validate publication date
    const date_patt = /\d{4}-\d{2}-\d{2}/;
    if (data[i].webPublicationDate)
      article.date = date_patt.exec(data[i].webPublicationDate)[0];
    else { console.log(`\tskipping article ${i}: date missing.`); continue; }
    
    // validate description
    if (data[i].blocks.body[0].bodyTextSummary) {
      article.descp = data[i].blocks.body[0].bodyTextSummary;
    }
    else { console.log(`\tskipping article ${i}: description missing.`); continue; }
    
    // push validated article
    results.articles.push(article);
  }
  results.articles = results.articles.slice(0,10);
  return results;
}

router.get('/', (req, res) => {
  get_guardian_home()
    .then(data => {
      res.json(process_guardian_results(data))
    })
})

router.get('/:sectionId', (req, res) => {
  const sections = ['world', 'politics', 'business', 'technology', 'sports'];
  if (!sections.includes(req.params.sectionId)) {
    res.json({error: {message: "Unknown section ID."}})
  }
  else {
    const sectionId = (req.params.sectionId === 'sports') ? 'sport' : req.params.sectionId;
    get_guardian_by_section(sectionId)
      .then(data => {
        res.json(process_guardian_results(data))
      })
  }
})

module.exports = router;