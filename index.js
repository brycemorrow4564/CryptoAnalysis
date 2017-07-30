var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    schedule = require("node-schedule"),
    PythonShell = require('python-shell'),
    port = process.env.PORT || 8080;

http.createServer(function(request, response) {

    var filename = 'Webapp/index.html';

    fs.exists(filename, function(exists) {

      if (!exists) {
        response.writeHead(404, {
          "Content-Type": "text/plain"
        });
        response.write("404 Not Found\n");
        response.end();
        return;
      }

      fs.readFile(filename, function(err, file) {
        if (err) {
          response.writeHead(500, {
            "Content-Type": "text/plain"
          });
          response.write(err + "\n");
          response.end();
          return;
        }

        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(file);
        response.end();

      });
    });

}).listen(parseInt(port, 10));

console.log("http://localhost:" + port + "/\nCTRL + C to shutdown");

//Automate data scrapper to run at 12:01 am daily and load data into local directory
var j = schedule.scheduleJob('0 17 ? * 0,4-6', function() {
    PythonShell.run('./CoinMarketCapScraper/Main.py', function (err) {
      if (err) throw err;
      console.log('done');
      console.log('updated: ' + Date());
    });
});

