const run = () => {

    //Run Server Setup bind to port
    const server = require('./ExpressServer/server');
    const app    = server.initialize();
    //Setup Database. Only occurs once per application lifetime
    const dbCreator = require('./Database/dbSetup');
    dbCreator.setup();
    //Setup EventEmitter
    const events = require('events');
    const eventEmitter = new events.EventEmitter();
    //Test run data scraper. Later we schedule this.
    const scraper = require('./WebScraper/scraper');
    scraper.run();

}

module.exports.run = run;


