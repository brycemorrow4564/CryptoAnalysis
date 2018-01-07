const coinMarketCapScraper = require('./coinMarketCapScraper');
const redditMetricsScraper = require('./redditMetricsScraper');

const getScraper = (scraperName) => {

    if      (scraperName === 'redditmetrics') { return redditMetricsScraper; }
    else if (scraperName === 'coinmarketcap') { return coinMarketCapScraper; }
    else { throw new Error("ERROR: Unrecognized scraper type requested from WebScraper module"); }

};

module.exports.getScraper = getScraper;