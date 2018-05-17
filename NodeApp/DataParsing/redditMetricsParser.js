const jsonic        = require('jsonic'),
      async         = require('async'),
      cheerio       = require('cheerio'),
      db            = require('../Database/database');

const parseData = (dataArr, dataSource) => {

    console.log("Begin the parsing of our inbound html from redditmetrics");

    var subredditGrowthData = [];
    dataArr.forEach((responseObj) => {
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
                    while (scriptBody[p] !== '[') { p++; }
                    start = p;
                    while (scriptBody[p] !== ']') { p++; }
                    end = p + 1;
                    //We use jsonic here as we are parsing a json object that has non-string keys like: {a: true}
                    var data = jsonic(scriptBody.substring(start, end)); //parse data arr from string.
                    var subredditInd = url.indexOf("/r/") + 3;
                    subredditGrowthData.push({
                        "pKey": url.substring(subredditInd), //subreddit property is name of subreddit and NO other part of url
                        "data":      data
                    });
                    break;
                }
            }
        }

    });
    typifyAndStore(subredditGrowthData, dataSource);
};

/*
data is an array where every object follows this structure: { y: '2012-10-30', a: 0 }
where key y maps to a string object representing the date. a maps to the growth (num of subscribers)
that occurred on that day.
*/
const typifyAndStore = (data, dataSource) => {

    console.log("Typifying redditmetrics data");

    data = data.map((elem) => {
        var data = elem['data'];
        data = data.map((d) => {
            return {
                "Date": (new Date(d['y'])).valueOf(),
                "Count": d['a']
            };
        });
        return {
            "pKey": elem['pKey'],
            'data': data
        };
    });
    db.enterData(data, dataSource);
};

module.exports.parseData = parseData;