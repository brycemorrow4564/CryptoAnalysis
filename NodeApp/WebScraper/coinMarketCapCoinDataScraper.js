const run = () => {

    const request       = require('request'),
          cheerio       = require('cheerio'),
          async         = require('async'),
          asyncReqMod   = require('./asyncUrlRequestProcessor'),
          dataParser    = require('./../DataParsing/dataParser'),
          baseUrl       = 'https://coinmarketcap.com',
          urlSuffix     = 'historical-data/?start=20130428&end=20501224';

    request(baseUrl, (error, response, html) => {

            if (error) {
                console.log(error);
            }
            const $ = cheerio.load(html);
            var urls = [];
            //Scrape coin names from page, get url extensions to append to base url
            $('.currency-symbol').each((ind, elem) => {
                urls.push(baseUrl + elem.children[0].attribs.href + urlSuffix);
            });

            /*
            urls: urls to request asynchronously
            50 is our limit of concurrent asynchronous requests
            dataParser.parse is callback function for finished results data
            pass references to async and request modules
            */
            asyncReqMod.asyncRequestUrls(urls, 50, dataParser.parse, async, request);
        }
    );
};

module.exports.run = run;
