let request = require('request'),
  cheerio = require('cheerio'),
  async = require('async'),
  URL = require('url'),
  fs = require('fs'),
  scrappedURLs = [], // array that will contain all the scrapped URLs within medium.com
  loggedURLs = ['https://medium.com/'], // array that stores all the URLs to avoid duplicates
  restrictedHost = URL.parse(loggedURLs[0]).hostname; // to make sure that we don't scrape the URLs outside of medium.com

let scrapingQueue = async.queue( (url, callback) => { 
  if (!url) return callback(null);

  request(url, (err, response, body) => {
    if (err) return callback(err);

    scrappedURLs.push(url);
    console.log('Scrapping ' + url);
    let urls = [];
    let $ = cheerio.load(body);
    let href;

    $('a').map( (i, e) => {
      href = $(e).attr('href');
      if (href !== undefined && URL.parse(href).hostname == restrictedHost) {
        if (!loggedURLs.includes($(e).attr('href'))) {
          loggedURLs.push($(e).attr('href'));
          urls.push($(e).attr('href'));
        }
      } 
    });
    scrapingQueue.push(urls);
    callback(null);
  });
}, 5);

scrapingQueue.drain = () => {
  fs.writeFile('result.csv', scrappedURLs.toString(), (err) => {
    console.log(err);
  });
};

scrapingQueue.push('https://medium.com/');