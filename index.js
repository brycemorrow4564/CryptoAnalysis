//Todo 1. Add error responses to JSON API
//Todo 2. Precompute data for JSON API queries
//Todo 3. Add check so that two jobs are not ever in process at the same time
//Todo 4. Add logified data field to JSON API queries. See if this can be handled via some Highstock chart option
//Todo 5. Add rate limiting to the API

//module.paths.push('/usr/local/lib/node_modules'); //COMMENT OUT FOR DEPLOYMENT

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('cryptodata.db');

db.run("CREATE TABLE IF NOT EXISTS Coins (coin_name TEXT)", [], function() { console.log("created initial Coins table"); })

var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

app.set('view engine', 'pug');
app.use('/', express.static(__dirname + '/Webapp')); // make express look in the Webapp directory for assets (css/js/img)
app.listen(port, function() {
	console.log('Our app is deployed to Heroku');
});

//JSON API

//TODO Add appropriate error responses for calls to json api

//GET data for specific coin
app.get('/coins/:name', function (req, res) {

    db.serialize(function() {

        db.all("SELECT * FROM " + req.params.name.replace('-','_'), [], function(err, rows) {
            if (err) {
                res.send({
                     "name": '',
                     "data": '',
                     "err" : true
                });
                return err;
            }
            res.send({
                "name": req.params.name.replace('_','-'),
                "data": rows,
                "err" : false
            })
        });

    });
});

//GET data for all coins
app.get('/coins/', function (req, res) {

    db.serialize(function() {

        var coin_objs   = [],
            coin_data   = [],
            counter     = 0,
            num_coins   = 100;

        var addCoin = function(err, row) {
            if (err) { console.log(err); }
            setTimeout(function() {
                var name = row.coin_name;
                db.all("SELECT * FROM " + name, [], function(err, rows) {
                     counter += 1;
                     coin_data.push({
                         "name": name.replace('_','-'),
                         "data": rows
                     });
                     if (counter === num_coins) {
                         res.send({
                             "Coins": coin_data
                         });
                     } else {
                         console.log('counter is ' + counter);
                     }
                });
            }, 0);

        };

        db.each("SELECT * FROM Coins", [], addCoin);

    });

});

//GET list of all coin names
app.get('/all_coin_names/', function (req, res) {

    db.serialize(function() {

        db.all("SELECT * FROM Coins", [], function(err, rows) {
            if (err) {
                return err;
            }
            for (var i = 0; i < rows.length; i++) {
                rows[i]['coin_name'] = rows[i]['coin_name'].replace('_','-');
            }
            res.send({
                "Coins": rows
            })
        });

    });

})

//CREATE EVENTEMITTER INSTANCE AND DEFINE CUSTOM EVENTS FOR TRIGGERING ACTION
var events = require('events');
var eventEmitter = new events.EventEmitter();

//Callback fired after web scraper runs, updating db asynchronously
var dbUpdate = function (newData) {

    db.serialize(function() {

        var schema = '(Volume TEXT, Date TEXT, MarketCap TEXT, Open TEXT)';

        var createCoinTableThenInsert = function(coinData) {
            // IMPORTANT ---------------------------------------------------------------------------------------------
            coinData['name'] = coinData['name'].replace('-','_');
            var coin_name = coinData['name']; //replace bc sqlite3 doesn't support '-' in a table name
            // IMPORTANT ---------------------------------------------------------------------------------------------
            db.run("CREATE TABLE " + coin_name + " " + schema, [], function(err) {
                if (err) { console.log("we have an err when creating table for " + coin_name); }
                console.log("created table for " + coin_name);
                var addRecords = db.prepare("INSERT INTO " + coin_name + " VALUES (?,?,?,?)");
                coinData['data'].forEach(function(record) {
                    addRecords.run([record['Volume'].toString(), record['Date'].toString(), record['MarketCap'].toString(), record['Open'].toString()]);
                });
                addRecords.finalize();
            })
            .run("INSERT INTO Coins VALUES (?)", coin_name, function(err) { if (err) { console.log("err on insert for " + coin_name)}})
        };

        var asyncForEach = function(arr) {

            setTimeout(function() {
                arr.forEach(function(coinData) {
                    setTimeout(function() {
                        createCoinTableThenInsert(coinData);
                    }, 0);
                });
            }, 0);

        };

        var loadNewData = function(err) {
            if (err) { console.log(err); }
            asyncForEach(newData);
        };

        var createNewCoinsTable = function(err) {
            if (err) { console.log(err); }
            db.run("CREATE TABLE Coins (coin_name TEXT)", [], loadNewData);
        };

        var dropCoinsTable = function(err) {
            if (err) { console.log(err); }
            db.run("DROP TABLE Coins", [], createNewCoinsTable);
        };

        var dropSpecificCoinTable = function(err, row) {
            if (err) { console.log(err); }
            console.log("dropping " + row.coin_name);
            db.run("DROP TABLE " + row.coin_name);
        };

        db.each("SELECT * FROM Coins", [], dropSpecificCoinTable, dropCoinsTable);

    });
}

eventEmitter.on('dbUpdate', dbUpdate);

//SETUP SCHEDULED EXECUTION OF WEB DATA SCRAPER
var PythonShell = require('python-shell');
var schedule = require("node-schedule");

//RUN ONCE UPON DEPLOY TO GET UPDATED INFO ASAP
console.log("started job: " + Date());

PythonShell.run('./CoinMarketCapScraper/Main.py', {'mode':'text'}, function(err, results) {
    console.log("Finished at " + Date());
    if (err) throw err;
    var data = '';
    for (var i = 0; i < results.length; i++) {
        if (results[i] === 'SENTINEL') {
            data = results[i+1];
            break;
        }
    }
    var obj = JSON.parse(data);
    eventEmitter.emit('dbUpdate', obj);
});

//SCRIPT SCHEDULED TO RUN AT 12:14 AM each day to update with new data
var j = schedule.scheduleJob('0 14 * * *', function() {

    console.log("started scheduled job: " + Date());

    PythonShell.run('./CoinMarketCapScraper/Main.py', {'mode':'text'}, function(err, results) {
        console.log("Finished at " + Date());
        if (err) throw err;
        var data = '';
        for (var i = 0; i < results.length; i++) {
            if (results[i] === 'SENTINEL') {
                data = results[i+1];
                break;
            }
        }
        var obj = JSON.parse(data);
        eventEmitter.emit('dbUpdate', obj);
    });

});