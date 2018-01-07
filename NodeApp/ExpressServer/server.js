const initialize = () => {

    // -------------------------------- IMPORTANT  ------------------------------------------------------
    // module.paths.push('/usr/local/lib/node_modules'); //COMMENT OUT FOR DEPLOYMENT
    // -------------------------------- IMPORTANT  ------------------------------------------------------

    const express = require('express'),
          app     = express(),
          devPort = 8081,
          port    = process.env.PORT || devPort;

    app.set('view engine', 'pug');
    app.use(express.static(__dirname + '/../../Webapp')); // Tells server where to find html, css, js files to send to client on page nav
    app.listen(port);

    if (port === devPort) {
        console.log(`Application deployed locally on port: ${port}`);
    } else {
        console.log("Application deployed to Heroku");
    }

    return app;

}

module.exports.initialize = initialize;


