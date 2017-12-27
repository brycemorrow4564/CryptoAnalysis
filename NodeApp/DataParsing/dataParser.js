//Database fields (need global access in this file)
const fields = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap'];
const async  = require('async');

const parse = (dataArr) => {

    console.log("Begin the parsing of our inbound html from the web scraper");

    const cheerio = require('cheerio');

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
            typifyToStore(results);
        }
    );
}

const typifyToStore = (data) => {

    console.log("We have our data now we need to ensure correct types for storage in db");
    /*
    Necessary type conversions from our data, which is currently stored entirely as strings
    Date => epoch which will be stored as int
    Everything else => double
    */
    const db = require('../Database/database');

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
            db.enterData(aggregateData);
        }
    );
}

module.exports.parse = parse;