

const schedule = require("node-schedule");

//SCRIPT SCHEDULED TO RUN AT 5:30 AM each day to update with new data
const j = schedule.scheduleJob('5 30 * * *', function() {

    console.log("started scheduled job: " + Date());

    //eventEmitter.emit('dbUpdate', data);

});