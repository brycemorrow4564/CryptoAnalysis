const run = () => {

    const request       = require('request'),
          cheerio       = require('cheerio'),
          async         = require('async'),
          dataParser    = require('./../DataParsing/dataParser'),
          baseUrl       = 'https://coinmarketcap.com',
          urlSuffix     = 'historical-data/?start=20130428&end=20501224';

    request(baseUrl,
        (error, response, html) => {
            if (error) {
                console.log(error);
            }
            const $ = cheerio.load(html);
            var urls = [];
            //Scrape coin names from page, get url extensions to append to base url
            $('.currency-symbol').each((ind, elem) => {
                urls.push(baseUrl + elem.children[0].attribs.href + urlSuffix);
            });

            const sendRequest = (url, done) => {
                    return request(url, (error, response, html) => {
                        if (error) {
                            console.log("Resending request to " + url);
                            return sendRequest(url, done); //recurse on failure
                        } else {
                            //Note that we return an object that includes the url so we know which coin corresponds to the data
                            return done(null, {
                                "url": url,
                                "html": html
                            });
                        }
                    });
            };

            //loop through our target urls, request pages
            async.mapLimit(urls, 105,
                //Mapping function called for each url in urls
                sendRequest,
                //Final callback on completion of all async requests
                (err, results) => {
                    if (err) {
                        console.log('in the final callback');
                        console.log(err);
                    }
                    //At this point we have collected html for all target pages. Pass to parsing module
                    dataParser.parse(results);
                }
            );
        }
    );
};

module.exports.run = run;
