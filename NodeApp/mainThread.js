const run = () => {

    //SETTING VARIABLES
    const runScraperOnStartup = false; //For dev purposes, set to false for faster testing. set to true for deployment

    //Run Server Setup bind to port
    const server = require('./ExpressServer/server'); //IMPORTANT: check this module to comment our module path for deployment
    const app    = server.initialize();
    //Setup EventEmitter
    const events = require('events');
    const eventEmitter = new events.EventEmitter();
    //Setup Database
    const dbCreator = require('./Database/database');
    const db = dbCreator.setup(runScraperOnStartup, eventEmitter);
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


