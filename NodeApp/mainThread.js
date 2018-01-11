const run = () => {

    //SETTING VARIABLES
    /*
    From Scratch Mode: all tables/data are removed from the DB. Scraper is run once after this then scheduled
    If this is set to false: db is simply opened at beginning and jobs are scheduled. This variable is set in main thread
    and passed to the database module during setup. The database module stores it's value in a table called AppSettings
    with schema (property TEXT, value TEXT)
    */
    const fromScratchModeEnabled = true;

    //Run Server Setup bind to port
    const server = require('./ExpressServer/server'); //IMPORTANT: check this module to comment our module path for deployment
    const app    = server.initialize();
    //Setup EventEmitter
    const events = require('events');
    const eventEmitter = new events.EventEmitter();
    //Setup Database
    const dbModule = require('./Database/database');
    const db = dbModule.setup(fromScratchModeEnabled, eventEmitter);
    //Setup and Run Data Scrapers
    const scraperModule = require('./WebScraper/webscraper');
    const coinMarketCapScraper = scraperModule.getScraper('coinmarketcap');
    const redditMetricsScraper = scraperModule.getScraper('redditmetrics');
    if (fromScratchModeEnabled) {
        coinMarketCapScraper.run();
        redditMetricsScraper.run();
    }
    //Setup API query handlers
    const api = require('./API/api');
    api.setup(app, db);

    //Schedule web scraping task
    const schedule = require("node-schedule");
    const scheduleModule = require('./Scheduler/scheduler');
    scheduleModule.scheduleWebScraper(eventEmitter);

};

module.exports.run = run;


