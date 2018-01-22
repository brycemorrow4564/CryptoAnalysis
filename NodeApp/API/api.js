const async = require('async');
const _ = require('lodash');

const setup = (app, db) => {

/*
Create an API call to get the data for the top 15 subreddits "top" is defined as experiencing the most growth
on the most recent data point collected relative to the second most recent data point collected (the derivative
of the line between these two points). When we send the data back to the user, they only want a graph of the
growth by day. All of the ranking is done server side and we include this information when we send it to the end user.
*/

    app.get('/top_15_subreddits_by_growth/', (req, res) => {

        var subredditGrowthData = [];

        const rankData = (data) => {
            dataChangeRateMap = {};
            //Calculate percentage value of today's value relative to yesterday's value
            data.forEach((elem) => {
                const d = elem.data,
                      dLen = d.length,
                      final = d[dLen-1],
                      penult = d[dLen-2];
                subredditGrowthData.push({
                    "subreddit": elem.subreddit,
                    "growthRate": final.Count * penult.Count === 0 ? 0: final.Count / penult.Count,
                    "data": d
                });
            });
            //push coins to top15GrowthSubreddits as long as they are greater than single element in the array
            subredditGrowthData = _.sortBy(subredditGrowthData, elem => elem.growthRate).reverse().splice(0,15);
            subredditGrowthData = subredditGrowthData.map((elem) => {
                return {
                    "name": elem.subreddit,
                    "data": elem.data
                };
            })
            res.send({
                "subredditData": subredditGrowthData
            });
        };

        db.all('SELECT * FROM Subreddits', [], (err, rows) => {
            if (err) {
                res.send({
                    "error": err
                });
            } else {
                var subredditTableNames = rows.map((elem) => { return elem.subreddit_name; });
                async.map(subredditTableNames,
                    (tableName, done) => {
                        db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
                            if (err) {
                                console.log("error when extracting one of the top 15 subreddits from the database");
                                throw err;
                            } else {
                                done(null, {
                                    'subreddit': tableName.slice(2).replace(/_/g,'-'),
                                    'data': rows
                                });
                            }
                        });
                    },
                    (err, results) => {
                        if (err) {
                            console.log("error when extracting top 15 subreddits from their respective databases");
                            throw err;
                        } else {
                            rankData(results);
                        }
                    }
               );

            }
        });

    });




    //GET data for specific coin
    app.get('/coins/:name', (req, res) => {

        const tableName = 'XX' + req.params.name.replace(/-/g,'_');
        db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
            if (err) {
                res.send({
                    "error": err
                });
            } else {
                res.send({
                    'name': req.params.name,
                    'data': rows
                });
            }
        });
    });

    //GET all coin names
    app.get('/coin_names/', (req, res) => {

        db.all('SELECT * FROM Coins', [], (err, rows) => {
            if (err) {
                res.send({
                    "error": err
                });
            } else {
                res.send({
                    "coin_names": rows.map((elem) => { return elem.pKey; })
                });
            }
        });
    });

    //GET data for specific subreddit
    app.get('/subreddits/:name', (req, res) => {

        db.all(`SELECT S.tableName FROM Subreddits AS S WHERE S.pkey = \"${req.params.name}\"`, [], (err, rows) => {
            if (rows.length === 0) {
                res.send({
                    "error": "the requested subreddit does not exist in the database"
                });
            } else if (rows.length > 1) {
                res.send({
                    "error": "server side error with mapping of pKeys to database tables"
                });
            } else {
                res.send({
                    "subredditData": rows[0]
                })
            }
        });

    });


    //GET all subreddit names
    app.get('/subreddit_names/', (req, res) => {

        db.all('SELECT * FROM Subreddits', [], (err, rows) => {
            if (err) {
                res.send({
                    "error": err
                });
            } else {
                res.send({
                    "subreddit_names": rows.map((elem) => { return elem.pKey; })
                });
            }
        });
    });

    console.log("API has been setup");

};

module.exports.setup = setup;


