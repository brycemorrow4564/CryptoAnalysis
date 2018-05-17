const events = require('events'), 
      ee = new events.EventEmitter();  

const run = async () => {

    //Setup configuration variables for Heroku/Local deployments 
    const configModule = require('./AppConfig/config'); 
    await configModule.setupConfigVars(ee);

    //Setup app by binding to port and specifying relevant data directories 
    const server    = require('./ExpressServer/server'),
          app       = await server.initialize(ee);
    console.log(`Application deployed ${process.env.IS_LOCAL_RUN ? `locally on port ${process.env.PORT}`: "to Heroku"}`);
        
    //Setup Database
    const dbModule = require('./Database/database');
    const db = dbModule.setup(ee);

    //Setup and Run Data Scrapers
    const scraperModule = require('./WebScraper/webscraper');
    const coinMarketCapScraper = scraperModule.getScraper('coinmarketcap');
    const redditMetricsScraper = scraperModule.getScraper('redditmetrics');

    if (process.env.RUN_SCRAPER_ON_STARTUP === 'true') { 
        coinMarketCapScraper.run();
        redditMetricsScraper.run();
    }

    //Setup API query handlers
    const api = require('./API/api');
    api.setup(app, db);

    //Schedule web scraping task
    const schedule = require("node-schedule");
    const scheduleModule = require('./Scheduler/scheduler');
    scheduleModule.scheduleWebScraper(ee);

};

module.exports.run = run;


