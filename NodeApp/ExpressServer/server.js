const initialize = () => {

    //--------------------------------- IMPORTANT  ------------------------------------------------------
    module.paths.push('/usr/local/lib/node_modules'); //COMMENT OUT FOR DEPLOYMENT
    //--------------------------------- IMPORTANT  ------------------------------------------------------

    const express = require('express');
    const app     = express();
    const port    = process.env.PORT || 8080;

    if (port === 8080) {
        console.log(`Application deployed locally on port: ${port}`);
    } else {
        console.log("Application deployed to Heroku");
    }

    app.set('view engine', 'pug');
    app.use('/', express.static(__dirname + '/Webapp')); // Tells server where to find html, css, js files to send to client on page nav
    app.listen(port);

    //Return variables necessary to execute main server logic from main thread
    return app;

}

module.exports.initialize = initialize;


