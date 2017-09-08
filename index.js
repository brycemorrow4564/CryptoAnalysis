//SETUP SERVER AND APP
var express = require('express');
var app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku, defaults to 8080
var port = process.env.PORT || 8080;

app.set('view engine', 'pug');
// make express look in the Webapp directory for assets (css/js/img)
app.use('/', express.static(__dirname + '/Webapp'));
app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});

//CREATE INITIAL DB
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('cryptodata.db');

//CREATE EVENTEMITTER INSTANCE AND DEFINE CUSTOM EVENTS FOR TRIGGERING ACTION
var events = require('events');
var eventEmitter = new events.EventEmitter();

/*
DB Philosophy

Will keep a single DB with relations as follows

CoinsHistory:   maintains the names of any coin that has ever been included in any previous
                or current instance of the Coins relation. We use this history table to get
                the names of coins that we are no longer tracking so that we can drop unused
                tables and their associated data. 

Coins:          The names of the 100 coins that we are currently tracking. Every entry in this
                relation (just a coin name) is a foreign key to a relation for a given coin that
                we are tracking that maintains its price history all the way up to the current day. 

Upon initialization of program, we create tables for CoinsHistory and Coins. Any time we get new data 
we update CoinsHistory with the names of new coins (duplicates removed). We then proceed to drop all 
tables that exist according to CoinsHistory. In this way we clear our db each time we get updated 
information rather than combine preexisting with new. This implementation is not optimal and might be
changed in the future, but for my current purposes it suffices. We then also drop the Coins table so
that the db is entirely clear at this point. Now we rebuild the Coins relation and all associated coin
relations using our newly scraped data. Later I will add some support for caching.
*/

var dbUpdate = function (newData) {
    console.log('updating the database'); 

    db.serialize(function() {

        //Create tables if they do not already exist. Will only happen once.
        db.run("CREATE TABLE IF NOT EXISTS CoinsHistory (name TEXT)");
        db.run("CREATE TABLE IF NOT EXISTS Coins        (name TEXT)");

        //Delete all old data from Coins so it can be updated with new data
        db.run("DELETE FROM Coins");

        //Drop any previously existing tables related to specific coins
        db.each("SELECT ch.name FROM CoinsHistory AS ch", [], function(err, row) {
            var cn = row.name;
            console.log(cn);
            db.exec("DROP TABLE IF EXISTS " + cn); //NOT SURE IF THIS WORKS SO COME BACK LATER
        });

//INSERT INTO memos(id,text)
//SELECT 5, 'text to insert'
//WHERE NOT EXISTS(SELECT 1 FROM memos WHERE id = 5 AND text = 'text to insert');

        var cds = '(Volume INTEGER, Date TEXT, MarketCap REAL, Open REAL)'; //coin data schema

        newData.forEach(function(coinData) {

            var name = coinData['name'],
                data = coinData['data'];

            db.exec("INSERT INTO CoinsHistory VALUES (name)" +
                    "SELECT " + name + " WHERE NOT EXISTS (SELECT 1 FROM CoinsHistory WHERE name = " + name);


            db.run("CREATE TABLE IF NOT EXISTS " + name + " " + cds); //each coin gets its own relation where its historical data is stored

            var addRecords = db.prepare("INSERT INTO " + name + " VALUES (?,?,?,?)");
            data.forEach(function(record) {
                addRecords.run(record['Volume'], record['Date'], record['MarketCap'], record['Open']);
            });
            addRecords.finalize();
        });

        /*
        On successive runs of this method we need to append any new data to end of existing tables 
        */

        //Tests to ensure data was stored correctly 
//        db.each('SELECT * FROM Coins', function(err, row) {
//            if (err) throw err;
//            console.log(row);
//        });
//
//        newData.forEach(function(coinData) {
//            var name = coinData['name'];
//            db.each('SELECT * FROM ' + name, function(err, row) {
//                if (err) throw err;
//                console.log(row);
//            });
//        });
    });

}
eventEmitter.on('dbUpdate', dbUpdate);

//SETUP SCHEDULED EXECUTION OF WEB DATA SCRAPER 
var PythonShell = require('python-shell');
var schedule = require("node-schedule");

var j = schedule.scheduleJob('* * * * * *', function() {

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

});
