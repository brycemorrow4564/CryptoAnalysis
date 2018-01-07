//Database fields (need global access in this file)
const fields = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap'];
const async  = require('async');
const jsonic = require('jsonic');
const cheerio = require('cheerio');
const db = require('../Database/database');

// --------------------------------------- COIN MARKET CAP SCRAPER -----------------------------------------------------

const parseCoinMarketCapData = (dataArr) => {

    console.log("Begin the parsing of our inbound html from coinmarketcap");

    async.map(dataArr,
        (incDataObj, done) => {
            const [url, html] = [incDataObj.url, incDataObj.html];
            const $ = cheerio.load(html);
            const rows = $('tbody').find('.text-right');
            var rowObjects = [];
            for (var x = 0; x < rows.length; x++) {
                row = rows[x];
                var rowChildren = row.children;
                var data = [];
                rowChildren.forEach((child) => {
                    if (child.name === 'td') {
                        data.push(child.children[0].data);
                    }
                });
                //Zip row data with fields in JSON object form
                var rowObj = {};
                for (var i = 0; i < fields.length; i++) {
                    rowObj[fields[i]] = data[i];
                }
                //Add our object to the rowObjects array
                rowObjects.push(rowObj);
            }
            const coinNameRegex = /\/currencies\/(.*)\/historical-data/;
            const coinName = coinNameRegex.exec(url)[1];
            return done(null, {
                'data': rowObjects,
                'coinName': coinName
            });
        },
        (err, results) => {
            if (err !== null) {
                console.log(err);
            }
            typifyCoinMarketCapDataAndStore(results);
        }
    );
}

const typifyCoinMarketCapDataAndStore = (data) => {

    console.log("We have our data now we need to ensure correct types for storage in db");
    /*
    Necessary type conversions from our data, which is currently stored entirely as strings
    Date => epoch which will be stored as int
    Everything else => double
    */

    async.map(data,
        //Asynchronous function performs type conversions for each individual set of coin data
        (coinDataObj, done) => {
            var d = coinDataObj['data'];
            var row;
            //Typify data
            for (var i = 0; i < d.length; i++) {
                row = d[i];
                fields.forEach(
                    (field) => {
                        if (field === 'Date') {
                            row.Date = new Date(row.Date.replace(/,/g,'').replace(/ /g,'-')).valueOf(); //to epoch
                        } else {
                            //Might have an empty value represented as '-'. In this case, we want to find the closest
                            //data point which we will copy into this place as an estimation of value
                            if (row[field].indexOf('-') > -1) {
                                row[field] = -1;
                            } else {
                                row[field] = parseFloat(row[field].replace(/,/g,''));
                            }
                        }
                    }
                );
                d[i] = row;
            }
            //Create estimations for empty values, which exist as -1 in the database as per type conversion
            for (var x = 0; x < d.length; x++) {
                row = d[x];
                fields.forEach(
                    (field) => {
                        if (field !== 'Date') {
                            if (row[field] === -1) {
                                //we have located an empty value. probe up and down to find nearest data point
                                var up = x,
                                    down = x,
                                    foundUp = false,
                                    foundDown = false;
                                var upRow;
                                var downRow;
                                var estimation;
                                for ( ; up > 0; up--) {
                                    upRow = d[up];
                                    if (upRow[field] !== -1) {
                                        foundUp = upRow[field];
                                        break;
                                    }
                                }
                                for ( ; down < d.length; down++) {
                                    downRow = d[down];
                                     if (downRow[field] !== -1) {
                                        foundDown = downRow[field];
                                        break;
                                     }
                                }
                                //found both directions, take closer data point
                                if (foundUp && foundDown) {
                                    if (up - x > x - down) {
                                        estimation = foundDown;
                                    } else {
                                        estimation = foundUp;
                                    }
                                } else if (foundUp) {
                                    estimation = foundUp;
                                } else if (foundDown) {
                                    estimation = foundDown;
                                } else {
                                    estimation = 0;
                                }
                                row[field] = estimation;
                            }
                        }
                    }
                );
                d[x] = row;
            }
            return done(null, {
                'data': d,
                'coinName': coinDataObj['coinName']
            });
        },
        //Send correctly typed aggregate data to DB for storage
        (err, aggregateData) => {
            if (err) {
                console.log(err);
            }
            db.enterCoinMarketCapData(aggregateData);
        }
    );
}

// --------------------------------------- REDDIT METRICS SCRAPER ------------------------------------------------------

const parseRedditMetricsData = (dataArr) => {

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
                    while (scriptBody[p] !== '[') { p++; } //find start index for data
                    start = p;
                    while (scriptBody[p] !== ']') { p++; } //find end index for data
                    end = p + 1;
                    var data = jsonic(scriptBody.substring(start, end)); //parse data arr from string
                    var subredditInd = url.indexOf("/r/") + 3;
                    subredditGrowthData.push({
                        "subreddit": url.substring(subredditInd),
                        "data":      data
                    });
                    break;
                }
            }
        }

    });
    //At this point we have all of the data for the subreddits. Add into the database
    typifyRedditMetricsDataAndStore(subredditGrowthData);
};

/*
data is an array where every object follows this structure: { y: '2012-10-30', a: 0 }
where key y maps to a string object representing the date. a maps to the growth (num of subscribers)
that occurred on that day.
*/
const typifyRedditMetricsDataAndStore = (data) => {
    data = data.map((elem) => {
        var data = elem['data'];
        data = data.map((d) => {
            return {
                "Date": (new Date(d['y'])).valueOf(),
                "Count": d['a']
            };
        });
        return {
            "url": elem.subreddit,
            'data': data
        };
    });
    console.log(data);
    db.enterRedditMetricsData(data);
};


module.exports.parseCoinMarketCapData = parseCoinMarketCapData;
module.exports.parseRedditMetricsData = parseRedditMetricsData;