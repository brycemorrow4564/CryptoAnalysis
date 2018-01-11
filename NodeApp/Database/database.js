var
db, eventEmitter;

const
async               = require('async'),
cmFields            = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap'],
rmFields            = ['Date', 'Count'],
appSettingsSchema   = '(property TEXT, value TEXT)',
subredditsSchema    = '(pKey TEXT, tableName TEXT)',
coinsSchema         = '(pKey TEXT, tableName TEXT)',
cmSchema            = '(Date REAL, Open REAL, High REAL, Low REAL, Close REAL, Volume REAL, MarketCap REAL)',
rmSchema            = '(Date REAL, Count REAL)';

var firstVisit = true;

const dbKeyMapper = require('./dbKeyMapper') //Module for handling data to be input to database. Data specifications in module

/*
Each object in the parameter data, an array, has the following structure:
{
    "pKey": "some unique id like the name of a coin or a subreddit link",
    "data": "array of objects, each of which contains data about the pKey element on some given Date (represented by epoch of Date object)
}
This mapping module (represented as variable dbMapper) does the following:
1. Creates and populates a table for mapping pKey values to their (generated) table id's in the database
2. for each element in data: stores element['data'] as the rows of the table mapped to by pKey (from table generated in step 1)
The reason for this is that the pKey values are things like urls, coin names, etc. and are not always valid tables names for
an sqlite3 database. This provides a reliable way to consistently generate identifiable tables for storing unpredictable data.
*/
const enterData = (data, dataSource) => {

    if (firstVisit) {
        firstVisit = false;
        dbKeyMapper.setup(db);
    }
    dbKeyMapper.run(data, dataSource);
};

const setup = (fromScratchModeEnabled, eventEmitterRef) => {

    eventEmitter = eventEmitterRef;
    const sqlite3 = require('sqlite3').verbose(); //verbose provides longer stacktraces
    //ALWAYS Open the database on setup()
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

    if (fromScratchModeEnabled) {

    /*
    PICKUP HERE
    PICKUP HERE
    PICKUP HERE
    */

        //we need to turn off this flag and switch to deploy mode
        db.run(`DELETE TABLE IF EXISTS AppSettings`, [], () => {
            db.run(`CREATE TABLE AppSettings ${appSettingsSchema}`, [], () => {
                db.run()
            });
        });

        console.log("From scratch mode enabled: clearing out the database");
        //Clear coinmarketcap data
        db.each(`SELECT * FROM Coins`, [],
            (err, row) => {
                if (err) {
                    console.log("There was an error selecting all from Coins table");
                    console.log(err);
                }
                var tn = row.tableName;
                console.log(`Coins table does exist and we are dropping table ${tn}`);
                db.run(`DROP TABLE IF EXISTS ${tn}`);
            },
            () => {
                db.run("DROP TABLE IF EXISTS Coins", [], () => {
                    db.run("CREATE TABLE IF NOT EXISTS Coins " + coinsSchema);
                });
            }
        );
        //Clear redditmetrics data
        db.each(`SELECT * FROM Subreddits`, [],
            (err, row) => {
                if (err) {
                    console.log("There was an error selecting all from Subreddits table");
                    console.log(err);
                }
                var tn = row.tableName;
                console.log(`Subreddits table does exist and we are dropping table ${tn}`);
                db.run(`DROP TABLE IF EXISTS ${tn}`);
            },
            () => {
                db.run("DROP TABLE IF EXISTS Subreddits", [], () => {
                    db.run("CREATE TABLE IF NOT EXISTS Subreddits " + subredditsSchema);
                });
            }
        );
    } else {
        console.log("From scratch mode disabled. Database contents left unaltered");
    }

    return db;
};

module.exports = {
    "setup": setup,
    "enterData": enterData
};

//const enterCoinMarketCapData = (dataArr) => {
//
//    console.log('entering data from coinmarketcap into the database');
//
//    //asynchronously create and add data rows to tables
//    async.each(dataArr,
//        //Asynchronously executed function creates table for particular coin, then fire callback to enter data
//        (coinDataObj, done) => {
//            const [coinName, data] = [coinDataObj.pKey, coinDataObj.data];
//            // -------------------------  IMPORTANT  -----------------------------------------
//            // Table names in SQL db can't include '-' so we change to '_'
//            // SQL table names can't begin with a number. So we prefix all names with "XX"
//            const tableName = 'XX' + coinName.replace(/-/g, '_');
//            db.run('INSERT INTO Coins VALUES (?)', tableName);
//            // -------------------------------------------------------------------------------
//            db.run(`CREATE TABLE ${tableName} ${cmSchema}`, [],
//                (err) => {
//                    if (err) {
//                        console.log("There was an error creating a new table for a coin");
//                        console.log(err);
//                    }
//                    //Now that we have created the table, we enter data which we can access thanks to closure scope
//                    //data is currently array of objects, decompose to array of arrays (in order of keys)
//                    const newData = data.map((entry) => {
//                        var newEntry = [];
//                        cmFields.forEach((field) => {
//                            newEntry.push(entry[field]);
//                        });
//                        return newEntry;
//                    });
//                    //Now we use prepare to bulk load entries into table
//                    bulkLoadRows = db.prepare(`INSERT INTO ${tableName} VALUES (?,?,?,?,?,?,?)`);
//                    newData.forEach((row) => {
//                         bulkLoadRows.run(row[0], row[1], row[2], row[3], row[4], row[5], row[6]);
//                    });
//                    //After we complete our bulk loading, we call the finish callback.
//                    bulkLoadRows.finalize(() => {
//                        done(null);
//                    });
//                }
//            );
//        },
//        (err) => {
//            if (err) {
//                console.log(err);
//            }
//            console.log("We have successfully updated the database for coinmarketcap");
//            eventEmitter.emit('dbUpdatedCoinMarketCap');
//        }
//    );
//
//};
//
//const enterRedditMetricsData = (data) => {
//
//    //asynchronously create and add data rows to tables
//    async.each(data,
//        //Asynchronously executed function creates table for particular coin, then fire callback to enter data
//        (subredditDataObj, done) => {
//            const [url, data] = [subredditDataObj.pKey, subredditDataObj.data];
//            // -------------------------  IMPORTANT  -----------------------------------------
//            // Table names in SQL db can't include '-' so we change to '_'
//            // Add 'YY' as prefix to differentiate from coin tables
//            const tableName = 'YY' + url.replace(/-/g, '_');
//            db.run('INSERT INTO Subreddits VALUES (?)', tableName);
//            // -------------------------------------------------------------------------------
//            db.run(`CREATE TABLE ${tableName} ${rmSchema}`, [],
//                (err) => {
//                    if (err) {
//                        console.log("There was an error creating a new table for a subreddit");
//                        console.log(err);
//                    }
//                    //Now that we have created the table, we enter data which we can access thanks to closure scope
//                    //data is currently array of objects, decompose to array of arrays (in order of keys)
//                    const newData = data.map((entry) => {
//                        var newEntry = [];
//                        rmFields.forEach((field) => {
//                            newEntry.push(entry[field]);
//                        });
//                        return newEntry;
//                    });
//                    //Now we use prepare to bulk load entries into table
//                    bulkLoadRows = db.prepare(`INSERT INTO ${tableName} VALUES (?,?)`);
//                    newData.forEach((row) => {
//                         bulkLoadRows.run(row[0], row[1]);
//                    });
//                    //After we complete our bulk loading, we call the finish callback.
//                    bulkLoadRows.finalize(() => {
//                        done(null);
//                    });
//                }
//            );
//        },
//        (err) => {
//            if (err) {
//                console.log(err);
//            }
//            console.log("We have successfully updated the database for redditmetrics");
//            eventEmitter.emit('dbUpdatedRedditMetrics');
//        }
//    );
//
//};