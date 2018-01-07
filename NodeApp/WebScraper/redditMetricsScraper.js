const run = () => {

    const request       = require('request'),
          dataParser    = require('./../DataParsing/dataParser'),
          asyncReqMod   = require('./asyncUrlRequestProcessor'),
          asyncLimit    = 30,
          baseUrl       = 'http://redditmetrics.com/r/';

    //INSERT SOME LOGIC FOR COMPUTING/GATHERING NAMES OF SUBREDDITS OF INTEREST
    var subreddits          = ['bitcoin', 'ethereum', 'storj', 'ripple', 'cardano', 'bridgecoin'],
        subredditLinks      = subreddits.map((elem) => baseUrl + elem),
        subredditGrowthData = [];

    /*
    example url would be http://redditmetrics.com/r/bitcoin
    We query each url in urls with this module, and the return data array includes the html from each of the pages
    that we requested. upon receiving this data array, we pass to our data processing callback
    */
    asyncReqMod.asyncRequestUrls(subredditLinks, asyncLimit, dataParser.parseRedditMetricsData);
};

module.exports.run = run;