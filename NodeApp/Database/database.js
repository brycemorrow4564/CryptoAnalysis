var db;
var eventEmitter;
const async = require('async');
const fields = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap'];

const setup = (runScraperOnStartup, eventEmitterRef) => {

    eventEmitter = eventEmitterRef;

    const sqlite3 = require('sqlite3').verbose(); //verbose gives more descriptive error messages
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

    //If we are not running scraper on startup our database is already valid so we don't reset database
    if (runScraperOnStartup) {
        db.run("CREATE TABLE IF NOT EXISTS Coins (coin_name TEXT)", [], )

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
                    db.run("CREATE TABLE Coins (coin_name TEXT)");
                });
            }
        );
    }

    return db;
};

const enterData = (data) => {

    console.log('entering data into the database');
    const schema = '(Date REAL, Open REAL, High REAL, Low REAL, Close REAL, Volume REAL, MarketCap REAL)';

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
        console.log("here is data");
        console.log(data);

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
                db.run(`CREATE TABLE ${tableName} ${schema}`, [],
                    (err) => {
                        if (err) {
                            console.log("There was an error creating a new table for a coin");
                            console.log(err);
                        }
                        //Now that we have created the table, we enter data which we can access thanks to closure scope
                        //data is currently array of objects, decompose to array of arrays (in order of keys)
                        const newData = data.map((entry) => {
                            var newEntry = [];
                            fields.forEach((field) => {
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
                console.log("We have successfully updated the database");
                eventEmitter.emit('dbUpdated');
            }
        );
    };

};

module.exports = {
    "setup": setup,
    "enterData": enterData
};