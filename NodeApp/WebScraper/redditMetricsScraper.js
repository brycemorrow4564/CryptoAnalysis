const run = () => {

    const request       = require('request'),
          cheerio       = require('cheerio'),
          async         = require('async'),
          jsonic        = require('jsonic'),
          asyncLimit    = 30,
          asyncReqMod   = require('./asyncUrlRequestProcessor'),
          baseUrl       = 'http://redditmetrics.com/r/';

    //INSERT SOME LOGIC FOR COMPUTING/GATHERING NAMES OF SUBREDDITS OF INTEREST
    var subreddits          = ['bitcoin', 'ethereum', 'storj', 'ripple', 'cardano', 'bridgecoin'],
        subredditLinks      = subreddits.map((elem) => baseUrl + elem),
        subredditGrowthData = [];

    const extractSubredditData = (results) => {
        results.forEach((responseObj) => {
            var url     = responseObj.url,
                html    = responseObj.html,
                $       = cheerio.load(html),
                scripts = $('script').toArray();
            for (var i = 0; i < scripts.length; i++) {
                var scriptContents = scripts[i].children;
                for (var v = 0; v < scriptContents.length; v++) {
                    var scriptBody = scriptContents[v].data;
                    if (scriptBody.includes('subscriber-growth')) {
                        //we have found target script which loads data. We now extract
                        var targetStr   = "element: 'subscriber-growth'",
                            p           = scriptBody.indexOf(targetStr) + targetStr.length,
                            start       = -1,
                            end         = -1;
                        while (scriptBody[p] !== '[') { p++; } //find start index for data
                        start = p;
                        while (scriptBody[p] !== ']') { p++; } //find end index for data
                        end = p + 1;
                        var data = jsonic(scriptBody.substring(start, end)); //parse data arr from string
                        subredditGrowthData.push({
                            "subreddit": url,
                            "data":      data
                        });
                    }
                }
            }

        });
        //At this point we have all of the data for the subreddits. Add into the database
    };

    asyncReqMod.asyncRequestUrls(subredditLinks, asyncLimit, extractSubredditData, async, request);
};

module.exports.run = run;