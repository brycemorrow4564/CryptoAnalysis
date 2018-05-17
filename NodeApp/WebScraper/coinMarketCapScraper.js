const run = () => {

    const dataSource    = "coinmarketcap",
          request       = require('request'),
          cheerio       = require('cheerio'),
          asyncReqMod   = require('./asyncUrlRequestProcessor'),
          dataParser    = require('./../DataParsing/dataParser'),
          asyncLimit    = 30,
          numCoins      = 100,
          firstPageUrl  = 'https://coinmarketcap.com/all/views/all/',
          baseUrl       = 'https://coinmarketcap.com',
          urlSuffix     = 'historical-data/?start=20130428&end=20501224';

    request(firstPageUrl, (error, response, html) => {

            if (error) {
                console.log(error);
            }
            const $ = cheerio.load(html);
            var urls = [];
            //Scrape coin names from page, get url extensions to append to base url
            $('.currency-symbol').each((ind, elem) => {
                urls.push(baseUrl + elem.children[0].attribs.href + urlSuffix);
            });

            urls = urls.splice(0, numCoins);

            /*
            example url would be https://coinmarketcap.com/currencies/bitcoin/historical-data/?start=20130428&end=20180107
            We query each url in urls with this module, and the return data array includes the html from each of the pages
            that we requested. upon receiving this data array, we pass to our data processing callback
            */
            asyncReqMod.asyncRequestUrls(urls, dataSource, asyncLimit, dataParser.parseData);
        }
    );
};

module.exports.run = run;
