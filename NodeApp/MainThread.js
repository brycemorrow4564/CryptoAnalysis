const run = () => {

//    //SETTING VARIABLES
//    const runScraperOnStartup = true; //For dev purposes, set to false for faster testing. set to true for deployment
//
//    //Run Server Setup bind to port
//    const server = require('./ExpressServer/server'); //IMPORTANT: check this module to comment our module path for deployment
//    const app    = server.initialize();
//    //Setup EventEmitter
//    const events = require('events');
//    const eventEmitter = new events.EventEmitter();
//    //Setup Database. Only occurs once per application lifetime
//    const dbCreator = require('./Database/database');
//    const db = dbCreator.setup(runScraperOnStartup, eventEmitter);
//    //Test run data scraper. Later we schedule this.
//    const scraper = require('./WebScraper/scraper');
//    if (runScraperOnStartup) {
//        scraper.run();
//    }
//    //Setup API query handlers
//    const api = require('./API/api');
//    api.setup(app, db);
//    //Schedule web scraping task
//    const schedule = require("node-schedule");
//    const scheduleModule = require('./Scheduler/scheduler');
//    scheduleModule.scheduleWebScraper(eventEmitter);

    const subredditMonitoringModule = require('./WebScraper/coinMarketCapSubredditScraper');
    subredditMonitoringModule.getSubredditUrls();

};

module.exports.run = run;


