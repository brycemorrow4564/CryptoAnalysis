const initialize = () => {

    let serverInitPromise = new Promise((resolve, reject) => {

        const express = require('express'),
              app     = express();

        app.use(express.static(__dirname + '/../../Webapp')); // Tells server where to find html, css, js files to send to client on page nav
        app.listen(process.env.PORT);

        resolve(app);
    }); 

    serverInitPromise.catch(
        (err) => {
            ee.emit('error', {
                "contextMsg": "Error while setting up event driven error handling", 
                "error": err
            }); 
        }
    ); 

    return serverInitPromise; 
};

module.exports.initialize = initialize;


