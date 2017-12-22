const run = () => {

    const request   = require('request'),
          cheerio   = require('cheerio'),
          async     = require('async'),
          baseUrl   = 'https://coinmarketcap.com',
          urlSuffix = 'historical-data/?start=20130428&end=';

    const parseResponses = (htmlArr) => {

    };

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
        //loop through our target urls, request pages
        async.map(urls,
            //Mapping function called for each url in urls
            function(url, next) {
                return request(url, (error, response, html) => {
                    return next(error, html);
                })
            },
            //Final callback on completion of all async requests
            function(err, results) {
                //At this point we have collected html for all target pages. Pass to parsing function

                //PICKUP HERE. CREATE PARSING INTERFACE THAT INTERACTS WITH 1. DATA COMING IN FROM WEB
                //AND 2. DATA EXTRACTED FROM DATABASE THAT WE WISH TO SEND TO USER TO ANSWER API QUERY
            }
        );
    });
};

module.exports.run = run;
