//Database fields (need global access in this file)
const fields = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap'];

const parse = (dataArr) => {

    console.log("Begin the parsing of our inbound html from the web scraper");

    const cheerio = require('cheerio'),
          async   = require('async');

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
            return next(null, rowObjects);
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
    Date => epoch
    Everything else => double 
    */

}

module.exports.parse = parse;