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
                            console.log("Throwing error for url: " + url);
                            console.log(url);
                            console.log(error);
                            return done(error);
                        } else {
                            //Note that we return an object that includes the url so we know which coin corresponds to the data
                            return done(null, {
                                "url": url,
                                "html": html
                            });
                        }
                    });
            };

            const printResultsKeys = (results) => {
                results.forEach((elem) => {
                    console.log(Object.keys(elem));
                })
            }

            /*
            failedUrlMappings is an array of objects in form of {url: indexThatResponseToThisUrlBelongsInResultsArray}
            */
            const processFailedRequests = (urls, failedUrlMappings, results) => {

                failedUrls = failedUrlMappings.map((elem) => Object.keys(elem)[0] ); //extract keys as array of urls

                const sendRequests = (failedUrls) => {

                    async.map(failedUrls,
                        async.reflect(sendRequest),
                        (err, newResults) => {
                            if (err) {
                                console.log("In initial callback for results");
                                console.log(err);
                            }
                            var moreFailedUrls = [];
                            for (var x = 0; x < newResults.length; x++) {
                                if (newResults[x].error) {
                                    console.log("we failed again for url: " + failedUrls[x]);
                                    var obj = {};
                                    failedUrlMappings.forEach((mapping) => {
                                        if (mapping[failedUrls[x]] > -1) {
                                            obj[failedUrls[x]] = mapping[failedUrls[x]];
                                        }
                                    });
                                    moreFailedUrls.push(obj);
                                } else {
                                    //The request for this url succeeded so we add into our original results array
                                    console.log("second (or more) attempt succeeded for " + failedUrls[x]);
                                    var resultsIndex = -1;
                                    failedUrlMappings.forEach((mapping) => {
                                        if (mapping[failedUrls[x]] > -1) {
                                            resultsIndex = mapping[failedUrls[x]];
                                        }
                                    });
                                    var html = newResults[x].value

                                    results[resultsIndex] = {'value': html}; //wrap in object with key value for standard form
                                }
                            }
                            //if we have no new failures, we have received data for all previously failed urls. We run parser
                            if (moreFailedUrls.length === 0) {
                                dataParser.parse(results.map((elem) => elem.value));
                            } else {
                                //recurse with new failed urls
                                processFailedRequests(urls, moreFailedUrls, results);
                                //This recursion will continue until this condition is not met and data is sent to dataParser
                            }
                        }
                    );

                };

                sendRequests(failedUrls);

            };

            //loop through our target urls, request pages
            async.map(urls,
                //Mapping function called for each url in urls
                async.reflect(sendRequest), //async reflect wraps return obj in wrapper so we can easily check for errors in results callback
                //Final callback on completion of all async requests
                async (err, results) => {
                    if (err) {
                        console.log('In CoinMarketCap Urls results callback');
                        console.log(err);
                    }
                    var failedUrls = [];
                    for (var x = 0; x < results.length; x++) {
                        if (results[x].error) {
                            console.log("an error occurred when requesting url: " + urls[x]);
                            var obj = {};
                            obj[urls[x]] = x; //failed url is key. index into results where response belongs is value
                            failedUrls.push(obj);
                        }
                    }

                    if (failedUrls.length === 0) {
                        dataParser.parse(results.map((elem) => elem.value)); //unwrap reflect objects on success
                    } else {
                        processFailedRequests(urls, failedUrls, results);
                    }
                }
            );
        }
    );
};

module.exports.run = run;
