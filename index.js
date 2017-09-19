//CREATE INITIAL DB
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('cryptodata.db');

db.run("CREATE TABLE IF NOT EXISTS Coins (coin_name TEXT)")

//SETUP SERVER AND APP
var express = require('express');
var app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku, defaults to 8080
//var port = process.env.PORT || 8080;
var port = 8080;

app.set('view engine', 'pug');
// make express look in the Webapp directory for assets (css/js/img)
app.use('/', express.static(__dirname + '/Webapp'));
app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});

//SETUP QUERIES TO DATABASE

//Get data for a given coin
app.get('/coins/:name', function (req, res) {

    db.serialize(function() {

        db.all("SELECT * FROM " + req.params.name, [], function(err, rows) {
            if (err) {
                return err;
            }
            res.send({
                "name": req.params.name,
                "data": rows
            })
        });

    });
});

//Get data for all coins
app.get('/coins/', function (req, res) {

    var coin_objs   = [],
        coin_data   = [],
        counter     = 0;

    db.serialize(function() {

        var specific_coin_cb = function(err, rows) {
            coin_data.push({
                "name": coin_objs[counter]['coin_name'],
                "data": rows
            })
            counter += 1;
            if (counter == coin_objs.length) {
                res.send({
                    "Coins": coin_data
                });
            }
        }

        var asyncForEach = function(arr) {
            arr.forEach(function(elem) {
                setTimeout(function() {
                    db.all("SELECT * FROM " + elem['coin_name'], [], specific_coin_cb)
                }, 0);
            });
        };

        var coinsCollectedCb = function(err, rows) {
            if (err) {
                return err;
            }
            coin_objs = rows;
            asyncForEach(coin_objs);
        };

        db.all("SELECT * FROM Coins", [], coinsCollectedCb);

    });

});

//Get list of all coin name s
app.get('/all_coin_names/', function (req, res) {

    db.serialize(function() {

        db.all("SELECT * FROM Coins", [], function(err, rows) {
            if (err) {
                return err;
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

var dbUpdate = function (newData) {

    db.serialize(function() {

        var asyncForEach = function(arr) {
            arr.forEach(function(elem) {

                db.run("CREATE TABLE IF NOT EXISTS " + coinData['name'] + " (Volume TEXT, Date TEXT, MarketCap TEXT, Open TEXT)")
                  .run("INSERT INTO Coins VALUES (?)", coinData['name']);

                var addRecords = db.prepare("INSERT INTO " + coinData['name'] + " VALUES (?,?,?,?)");
                coinData['data'].forEach(function(record) {
                    addRecords.run([record['Volume'].toString(), record['Date'].toString(), record['MarketCap'].toString(), record['Open'].toString()]);
                });
                addRecords.finalize();

                setTimeout(function() {
                    db.all("SELECT * FROM " + elem['coin_name'], [], specific_coin_cb)
                }, 0);
            });
        };

        db.each("SELECT * FROM Coins", function(err, row) {
            console.log("dropping " + row.coin_name);
            db.run("DROP TABLE IF EXISTS " + row.coin_name);
        })
        .run("DROP TABLE Coins", [], function() { console.log("dropping Coins table"); })
        .run("CREATE TABLE Coins (coin_name TEXT)", [], function() {
            console.log("creating new Coins table")
            asyncForEach(newData);
        });

        db.serialize(function() {
            newData.forEach(function(coinData) {
                db.serialize(function() {



                });
            });
        });

        db.serialize(function() {
            db.each("SELECT * FROM Coins", function(err, row) {
                db.all("SELECT * FROM " + row.coin_name, function(err, rows) {
                    console.log(rows);
                });
            })
        });

    });

}

eventEmitter.on('dbUpdate', dbUpdate);

//SETUP SCHEDULED EXECUTION OF WEB DATA SCRAPER 
var PythonShell = require('python-shell');
var schedule = require("node-schedule");

//var j = schedule.scheduleJob('0 49 * * * *', function() {
//
//    console.log("started job: " + Date());
//
//    PythonShell.run('./CoinMarketCapScraper/Main.py', {'mode':'text'}, function(err, results) {
//        console.log("Finished at " + Date());
//        if (err) throw err;
//        var data = '';
//        for (var i = 0; i < results.length; i++) {
//            if (results[i] === 'SENTINEL') {
//                data = results[i+1];
//                break;
//            }
//        }
//        var obj = JSON.parse(data);
//        eventEmitter.emit('dbUpdate', obj);
//    });
//
//});

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

