const setup = () => {

    var sqlite3 = require('sqlite3').verbose(); //verbose gives more descriptive error messages
    var db = new sqlite3.Database('cryptodata.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        //error callback to ensure that we successfully create/open the database
        (error) => {
            if (error === null) {
                console.log("Successfully created/opened the database");
            } else {
                console.log("Encountered an error while attempting to create the database");
            }
        }
    );
    /*
    Right now, since we have to make the same number of web requests regardless of whether or not
    we are getting all of the data for a given coin or if we simply wish to update with new information.
    As such, our current, easy to implement strategy is to always drop the existing db on the start of
    our runs. We will then let our web scraping script update with new information.
    */
    db.run("DROP TABLE IF EXISTS Coins");
    db.run("CREATE TABLE IF NOT EXISTS Coins (coin_name TEXT)");
};

module.exports.setup = setup;