const run = () => {

    //SETTING VARIABLES
    const runScraperOnStartup = true,                   //For dev purposes, set to false for faster testing. set to true for deployment
          fromScratchDbStartupModeEnabled = false;      //If set to false, in "Deploy" mode where db is only updated.

    //Run Server Setup bind to port
    const server = require('./ExpressServer/server'); //IMPORTANT: check this module to comment our module path for deployment
    const app    = server.initialize();
    //Setup EventEmitter
    const events = require('events');
    const eventEmitter = new events.EventEmitter();
    //Setup Database
    const dbModule = require('./Database/database');
    const db = dbModule.setup(runScraperOnStartup, fromScratchDbStartupModeEnabled, eventEmitter);
    //Setup and Run Data Scrapers
    const scraperModule = require('./WebScraper/webscraper');
    const coinMarketCapScraper = scraperModule.getScraper('coinmarketcap');
    const redditMetricsScraper = scraperModule.getScraper('redditmetrics');
    if (runScraperOnStartup) {
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


