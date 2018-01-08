var db;
var eventEmitter;
const async = require('async'),
cmFields = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap'], //coinmarketcap data fields
rmFields = ['Date', 'Count'], //redditmetrics data fields
cmSchema = '(Date REAL, Open REAL, High REAL, Low REAL, Close REAL, Volume REAL, MarketCap REAL)', //coinmarketcap schema
rmSchema = '(Date REAL, Count REAL)'; //redditmetrics data

const setup = (runScraperOnStartup, eventEmitterRef) => {

    eventEmitter = eventEmitterRef;

    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database('cryptodata.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        //error callback to ensure that we successfully create/open the database
        (error) => {
            if (error === null) {
                console.log("Successfully created/opened the database");
            } else {
                console.log("Encountered an error while attempting to create the database");
                console.log(error);
            }
        }
    );

    db.run("CREATE TABLE IF NOT EXISTS Coins (coin_name TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS Subreddits (subreddit_name TEXT)");

    //If we are not running scraper on startup our database is already valid so we don't reset database
    if (runScraperOnStartup) {
        //Deal with coinmarketcap tables
        db.each(`SELECT * FROM Coins`, [],
            (err, row) => {
                if (err) {
                    console.log("There was an error selecting all from Coins");
                    console.log(err);
                }
                console.log(`Coins table does exist and we are dropping table ${row.coin_name}`);
                db.run(`DROP TABLE ${row.coin_name}`);
            },
            () => {
                console.log("We have finished dropping tables from Coins");
                db.run("DROP TABLE IF EXISTS Coins", [], () => {
                    db.run("CREATE TABLE IF NOT EXISTS Coins (coin_name TEXT)");
                });
            }
        );
        //Deal with redditmetrics tables
        db.each(`SELECT * FROM Subreddits`, [],
            (err, row) => {
                if (err) {
                    console.log("There was an error selecting all from Subreddits");
                    console.log(err);
                }
                console.log(`We are dropping table ${row.subreddit_name}`);
                db.run(`DROP TABLE ${row.subreddit_name}`);
            },
            () => {
                console.log("We have finished dropping tables from Subreddits");
                db.run("DROP TABLE IF EXISTS Subreddits", [], () => {
                    db.run("CREATE TABLE IF NOT EXISTS Subreddits (subreddit_name TEXT)");
                });
            }
        );
    }

    return db;
};

const enterCoinMarketCapData = (data) => {

    console.log('entering data into the database');

    //First we delete all previous db data. Then we call callback to insert our new data
    db.each("SELECT * FROM Coins", [],
        //Function drops every coin data table corresponding to an entry in the coin names table
        (err, row) => {
            if (err) {
                console.log(`failed to drop ${row.coin_name}`);
                console.log(err);
            }
            console.log(`dropping ${row.coin_name}`);
            db.run(`DROP TABLE ${row.coin_name}`);
        },
        //Now that we have read in all coin names, and dropped each corresponding table, we drop the coin names table
        () => {
            console.log("we dropped all tables in the database");
            db.run("DROP TABLE IF EXISTS Coins", [], () => {
                db.run("CREATE TABLE Coins (coin_name TEXT)", [], insertData);
            });
        }
    );

    const insertData = (err) => {
        if (err) {
            console.log("An error occurred when dropping a particular coin table or the coin names table");
            console.log(err);
        }
        //asynchronously create and add data rows to tables
        async.each(data,
            //Asynchronously executed function creates table for particular coin, then fire callback to enter data
            (coinDataObj, done) => {
                const [coinName, data] = [coinDataObj.coinName, coinDataObj.data];
                // -------------------------  IMPORTANT  -----------------------------------------
                // Table names in SQL db can't include '-' so we change to '_'
                // SQL table names can't begin with a number. So we prefix all names with "XX"
                const tableName = 'XX' + coinName.replace(/-/g, '_');
                db.run('INSERT INTO Coins VALUES (?)', tableName);
                // -------------------------------------------------------------------------------
                db.run(`CREATE TABLE ${tableName} ${cmSchema}`, [],
                    (err) => {
                        if (err) {
                            console.log("There was an error creating a new table for a coin");
                            console.log(err);
                        }
                        //Now that we have created the table, we enter data which we can access thanks to closure scope
                        //data is currently array of objects, decompose to array of arrays (in order of keys)
                        const newData = data.map((entry) => {
                            var newEntry = [];
                            cmFields.forEach((field) => {
                                newEntry.push(entry[field]);
                            });
                            return newEntry;
                        });
                        //Now we use prepare to bulk load entries into table
                        bulkLoadRows = db.prepare(`INSERT INTO ${tableName} VALUES (?,?,?,?,?,?,?)`);
                        newData.forEach((row) => {
                             bulkLoadRows.run(row[0], row[1], row[2], row[3], row[4], row[5], row[6]);
                        });
                        //After we complete our bulk loading, we call the finish callback.
                        bulkLoadRows.finalize(() => {
                            done(null);
                        });
                    }
                );
            },
            (err) => {
                if (err) {
                    console.log(err);
                }
                console.log("We have successfully updated the database for coinmarketcap");
                eventEmitter.emit('dbUpdatedCoinMarketCap');
            }
        );
    };

};

const enterRedditMetricsData = (data) => {

    //First we delete all previous db data. Then we call callback to insert our new data
    db.each("SELECT * FROM Subreddits", [],
        //Function drops every coin data table corresponding to an entry in the coin names table
        (err, row) => {
            if (err) {
                console.log(`failed to drop ${row.subreddit_name}`);
                console.log(err);
            }
            console.log(`dropping ${row.subreddit_name}`);
            db.run(`DROP TABLE ${row.subreddit_name}`);
        },
        //Now that we have read in all coin names, and dropped each corresponding table, we drop the coin names table
        () => {
            console.log("we dropped all tables in the database");
            db.run("DROP TABLE IF EXISTS Subreddits", [], () => {
                db.run("CREATE TABLE Subreddits (subreddit_name TEXT)", [], insertData);
            });
        }
    );

    const insertData = (err) => {
        if (err) {
            console.log("An error occurred when dropping a particular subreddit table or the subreddit names table");
            console.log(err);
        }
        //asynchronously create and add data rows to tables
        async.each(data,
            //Asynchronously executed function creates table for particular coin, then fire callback to enter data
            (subredditDataObj, done) => {
                const [url, data] = [subredditDataObj.url, subredditDataObj.data];
                // -------------------------  IMPORTANT  -----------------------------------------
                // Table names in SQL db can't include '-' so we change to '_'
                // Add 'YY' as prefix to differentiate from coin tables
                const tableName = 'YY' + url.replace(/-/g, '_');
                db.run('INSERT INTO Subreddits VALUES (?)', tableName);
                // -------------------------------------------------------------------------------
                db.run(`CREATE TABLE ${tableName} ${rmSchema}`, [],
                    (err) => {
                        if (err) {
                            console.log("There was an error creating a new table for a subreddit");
                            console.log(err);
                        }
                        //Now that we have created the table, we enter data which we can access thanks to closure scope
                        //data is currently array of objects, decompose to array of arrays (in order of keys)
                        const newData = data.map((entry) => {
                            var newEntry = [];
                            rmFields.forEach((field) => {
                                newEntry.push(entry[field]);
                            });
                            return newEntry;
                        });
                        //Now we use prepare to bulk load entries into table
                        bulkLoadRows = db.prepare(`INSERT INTO ${tableName} VALUES (?,?)`);
                        newData.forEach((row) => {
                             bulkLoadRows.run(row[0], row[1]);
                        });
                        //After we complete our bulk loading, we call the finish callback.
                        bulkLoadRows.finalize(() => {
                            done(null);
                        });
                    }
                );
            },
            (err) => {
                if (err) {
                    console.log(err);
                }
                console.log("We have successfully updated the database for redditmetrics");
                eventEmitter.emit('dbUpdatedRedditMetrics');
            }
        );
    };

};

module.exports = {
    "setup": setup,
    "enterCoinMarketCapData": enterCoinMarketCapData,
    "enterRedditMetricsData": enterRedditMetricsData
};