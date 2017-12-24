//Database fields (need global access in this file)
const fields = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap'];
const async  = require('async');

const parse = (dataArr) => {

    console.log("Begin the parsing of our inbound html from the web scraper");

    const cheerio = require('cheerio');

    async.map(dataArr,
        (incDataObj, next) => {
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
            return next(null, {
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
    const db = require('../Database/dbInterface');

    async.map(data,
        //Asynchronous function performs type conversions for each individual set of coin data
        (coinDataObj, next) => {
            var d = coinDataObj['data'];
            d = d.map((row) => {
                fields.forEach((field) => {
                    if (field === 'Date') {
                        //Date field will always exists so no need to check for existence
                        row.Date = new Date(row.Date.replace(',','').replace(' ','-')).valueOf(); //to epoch
                    } else {
                        //Might have an empty value represented as '-'. Since can't change schema of SQL database
                        //we will instead insert a sentinel value of -1 in this case.
                        if (row[field].indexOf('-') > -1) {
                            row[field] = -1;
                        } else {
                            row[field] = parseFloat(row[field].replace(/,/g,''));
                        }
                    }
                });
                return row;
            });
            return next(null, {
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