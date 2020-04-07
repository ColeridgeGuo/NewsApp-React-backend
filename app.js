const express = require('express');
const app = express();

const axios = require('axios');

// get guardian news articles
const guardian_default_img_url = "https://assets.guim.co.uk/images/eada8aa27c12fe2d5afa3a89d3fbae0d/fallback-logo.png";
const guardian_api_key = "8f86228c-9df5-451e-a505-f7979e6ec8a3";

// get guardian home articles
function get_guardian_home() {
  return axios.get(`https://content.guardianapis.com/search?api-key=${guardian_api_key}&section=(world|sport|business|technology|politics)&show-blocks=all`)
    .then(response => {
      console.log(`Getting Guardian home - status: ${response.status}`);
      return response.data.response.results;
    })
    .catch(error => {
      console.log(error);
    });
}

// get guardian articles by section
function get_guardian_by_section(section) {
  return axios.get(`https://content.guardianapis.com/${section}?api-key=${guardian_api_key}&show-blocks=all`)
    .then(response => {
      console.log(`Getting Guardian section \'${section}\' - status: ${response.status}`);
      return response.data.response.results;
    })
    .catch(error => {
      console.log(error);
    });
}

// return processed guardian results
function process_guardian_results(data) {
  let results = {articles: []};
  for (let i = 0; i < data.length; i++) {
    let article = {};
    
    // validate title
    if (data[i].webTitle) { article.title = data[i].webTitle; }
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
    if (data[i].sectionId) { article.sectionId = data[i].sectionId; }
    else {console.log(`\tskipping article ${i}: sectionId missing.`); continue;}
    
    // validate publication date
    let date_patt = /\d{4}-\d{2}-\d{2}/;
    if (data[i].webPublicationDate) {
      article.date = date_patt.exec(data[i].webPublicationDate)[0];
    }
    else {console.log(`\tskipping article ${i}: date missing.`); continue;}
    
    // validate description
    if (data[i].blocks.body[0].bodyTextSummary) {
      article.descp = data[i].blocks.body[0].bodyTextSummary;
    }
    else {console.log(`\tskipping article ${i}: description missing.`); continue;}
    
    // push validated article
    results.articles.push(article);
  }
  return results;
}

// get nytimes news articles
const nytimes_default_img_url = "https://upload.wikimedia.org/wikipedia/commons/0/0e/Nytimes_hq.jpg";
const nytimes_api_key = "1HzpS5vMG5GY8t5nTyN0Gj2SssDJ71Ye";

// Guardian articles for home
app.get('/guardian', (req, res) => {
  get_guardian_home()
    .then(data => {
      res.send(process_guardian_results(data));
    });
});

// Guardian articles by section
app.get('/guardian/:sectionId',  (req, res) => {
  get_guardian_by_section(req.params.sectionId)
    .then(data => {
      res.send(process_guardian_results(data));
    });
});

module.exports = app;