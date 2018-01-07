const scheduleWebScraper = (eventEmitter) => {

    const scraperModule = require('./../WebScraper/webscraper'),
          schedule      = require("node-schedule"),
          rmScraper     = scraperModule.getScraper("redditmetrics"),
          cmScraper     = scraperModule.getScraper('coinmarketcap');

    //SCRIPT SCHEDULED TO RUN AT 5:30 AM each day to update with new data
    const j = schedule.scheduleJob('0 5 30 * * *', function() {

        console.log("STARTED SCHEDULED JOB AT " + Date());

        cmScraper.run();
        rmScraper.run();

    });

    console.log("Scheduled job");
};

module.exports.scheduleWebScraper = scheduleWebScraper;




