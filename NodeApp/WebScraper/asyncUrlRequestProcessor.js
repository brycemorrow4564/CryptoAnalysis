const asyncRequestUrls = (urls, limit, resultsProcessingCallback, async, request) => {

            /*
            Send an asynchronous request to a webpage. When we complete request, either error or success,
            then we call the "done" callback (maintains order as part of async.map) with appropriate params
            */
            const sendRequest = (url, done) => {
                    return request(url, (error, response, html) => {
                        if (error) {
                            return done(error);
                        } else if (Math.floor(Math.random() * 11) < 2) {
                            return done(new Error('RANDOM ERROR'));
                        } else {
                            return done(null, {
                                "url": url,
                                "html": html
                            });
                        }
                    });
            };

            /*
            failedUrlMappings is an array of objects in form of {url : indexThatResponseToThisUrlBelongsInResultsArray}
            */
            const processFailedRequests = (urls, failedUrlMappings, results) => {

                failedUrls = failedUrlMappings.map((elem) => Object.keys(elem)[0] );

                const sendRequests = (failedUrls) => {

                    async.map(failedUrls,
                        async.reflect(sendRequest),
                        (err, newResults) => {
                            if (err) { console.log(err); }
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
                                console.log("SUCCESS 2");
                                //console.log(results);
                                results = results.map((elem) => elem.value);
                                resultsProcessingCallback(results);
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

            async.mapLimit(urls, limit,
                async.reflect(sendRequest), //async reflect wraps return obj in wrapper so we can easily check for errors in results callback
                (err, results) => {
                    if (err) { console.log(err); }
                    var failedUrls = [];
                    for (var x = 0; x < results.length; x++) {
                        if (results[x].error) {
                            console.log("an error occurred on first time request for url: " + urls[x]);
                            var obj = {};
                            obj[urls[x]] = x; //failed url is key. index into results where response belongs is value
                            failedUrls.push(obj);
                        }
                    }

                    if (failedUrls.length === 0) {
                        console.log("SUCCESS");
                        results = results.map((elem) => elem.value);
                        resultsProcessingCallback(results);
                    } else {
                        processFailedRequests(urls, failedUrls, results);
                    }
                }
            );

};

module.exports.asyncRequestUrls = asyncRequestUrls;