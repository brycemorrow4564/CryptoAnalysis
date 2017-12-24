const run = () => {

    const request       = require('request'),
          cheerio       = require('cheerio'),
          async         = require('async'),
          dataParser    = require('./../DataParsing/incomingDataParser'),
          baseUrl       = 'https://coinmarketcap.com',
          urlSuffix     = 'historical-data/?start=20130428&end=20501224';

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
                    //Note that we return an object that includes the url so we know which coin corresponds to the data
                    return next(error, {
                        "url": url,
                        "html": html
                    });
                })
            },
            //Final callback on completion of all async requests
            function(err, results) {
                if (err) {
                    console.log(err);
                }
                //At this point we have collected html for all target pages. Pass to parsing module
                dataParser.parse(results);
            }
        );
    });
};

module.exports.run = run;
