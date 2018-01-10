const cmScraper = require('./coinMarketCapScraper');
const rmScraper = require('./redditMetricsScraper');

const getScraper = (scraperName) => {

    //Channel incoming data to correct scraping sub-module
    if      (scraperName === 'redditmetrics') { return rmScraper; }
    else if (scraperName === 'coinmarketcap') { return cmScraper; }
    else { throw new Error("ERROR: Unrecognized scraper type requested from WebScraper module"); }

};

module.exports.getScraper = getScraper;