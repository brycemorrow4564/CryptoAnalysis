const scheduleWebScraper = (eventEmitter) => {

    const scraperModule = require('./../WebScraper/webscraper'),
          schedule      = require("node-schedule"),
          rmScraper     = scraperModule.getScraper("redditmetrics"),
          cmScraper     = scraperModule.getScraper('coinmarketcap');

    //SCRIPT SCHEDULED TO RUN AT 11:00 PM each day to update with new data
    const j = schedule.scheduleJob('0 0 23 * * *', function() {
        console.log("Started web scraping job at: " + Date());
        cmScraper.run();
        rmScraper.run();
    });

    console.log("Scheduled job");
};

module.exports.scheduleWebScraper = scheduleWebScraper;




