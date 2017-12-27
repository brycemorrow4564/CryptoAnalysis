const scheduleWebScraper = (eventEmitterRef) => {

    const scraper = require('./../WebScraper/scraper');
    const schedule = require("node-schedule");
    var eventEmitter = eventEmitterRef;

    //SCRIPT SCHEDULED TO RUN AT 5:30 AM each day to update with new data
    const j = schedule.scheduleJob('0 5 30 * * *', function() {

        console.log("STARTED SCHEDULED JOB AT " + Date());

        eventEmitter.on('dbUpdated', () => {
            console.log("SCHEDULED JOB HAS FINISHED UPDATING DB AT " + Date());
        });

        scraper.run(); //scraper run terminates with emission of 'dbUpdated' event emitted by Database module

    });

    console.log("Scheduled job");
};

module.exports.scheduleWebScraper = scheduleWebScraper;




