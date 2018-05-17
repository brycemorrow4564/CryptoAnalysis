const async     = require('async'),
      request   = require('request');

const asyncRequestUrls = (urls, dataSource, limit, resultsProcessingCallback) => {

            console.log("STARTED FOR " + dataSource);

            //DEBUG VARIABLES TO SIMULATE NETWORK FAILURES CONDITIONS
            const randomFailuresEnabled = false,
                  failureRate           = 0; //to the nearest percent

            var returnArr           = [], //top level scope so we can add finished request data from any callback
                brokenUrls          = [], //any urls we are unable to retrieve data from after multiple attempts
                failureCountMap     = {}, //Count failures for each url. If we fail too many times stop trying and exit
                failureCountLimit   = 3;

            urls.forEach((url) => { failureCountMap[url] = 0; });

            const sendRequest = (url, done) => {
                    var params = {
                        "url": url,
                        "rejectUnauthorized": false //include rejectUnauthorized to resolve issue with failure to validate first certificate
                    };
                    return request(params, (error, response, html) => {
                        /*
                        Important note: done callback is what we call when a single request finishes over
                        the course of the running of async.map. Typically if we experience failure, we pass
                        it as the first parameter to the done function but I have changed the mechanism for
                        the purpose of easing error detection and recovering.
                        */
                        if (error) {
                            return done(null, {
                                "url": url,
                                "errorOccurred": true,
                                "error": error
                            });
                        } else if (randomFailuresEnabled && Math.floor(Math.random() * 101) < 100 * failureRate) {
                             return done(null, {
                                 "url": url,
                                 "errorOccurred": true,
                                 "error": new Error("RANDOM ERROR")
                             });
                        } else {
                            return done(null, {
                                "url":  url,
                                "html": html
                            });
                        }
                    });
            };

            const fireAsyncRequests = (urls) => {
                async.mapLimit(urls, limit,
                    sendRequest, //callback called for each url in urls
                    (err, results) => {
                        if (err) { console.log(err); }
                        var failedUrls = [];
                        for (var x = 0; x < results.length; x++) {
                            if (results[x].errorOccurred) {
                                console.log("A request error occurred for: " + results[x].url);
                                console.log(results[x].error);
                                failureCountMap[results[x].url] += 1;
                                //If we fail more than 3 times on a url we give up on url
                                if (failureCountMap[results[x].url] === 3) {
                                    brokenUrls.push(results[x].url);
                                } else {
                                    failedUrls.push(results[x].url);
                                }
                            } else {
                                returnArr.push(results[x]);
                            }
                        }
                        if (failedUrls.length === 0) {
                            console.log(`We have successfully processed ${urls.length - brokenUrls.length} requests and we have failed on ${brokenUrls.length}`);
                            if (brokenUrls.length > 0) {
                                console.log("Our requests failed for the following urls");
                                console.log(brokenUrls);
                            }
                            resultsProcessingCallback(returnArr, dataSource);
                        } else {
                            fireAsyncRequests(failedUrls); //Recurse to re-send failed requests
                        }
                    }
                );
            };

            fireAsyncRequests(urls);
};


module.exports.asyncRequestUrls = asyncRequestUrls;