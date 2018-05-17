const async = require('async');
const _ = require('lodash');

const setup = (app, db) => { 

    //GET data for specific coin
    app.get('/coins/:name', (req, res) => {

        db.get(`SELECT C.tableName FROM Coins AS C WHERE C.pKey = "${req.params.name}"`, [], (err, row) => {
            if (err) {
                console.log(err);
                res.send({
                    "error": err
                });
            } else {
                db.all(`SELECT * FROM ${row.tableName}`, [], (err, rows) => {
                    res.send({
                        "name": req.params.name, 
                        "data": rows
                    }); 
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

        db.all(`SELECT S.tableName FROM Subreddits AS S WHERE S.pkey = "${req.params.name}"`, [], (err, rows) => {
            if (rows.length === 0) {
                res.send({
                    "error": "the requested subreddit does not exist in the database"
                });
            } else if (rows.length > 1) {
                res.send({
                    "error": "server side error with mapping of pKeys to database tables"
                });
            } else {
                db.all(`SELECT * FROM ${rows[0].tableName}`, [], (err, rows) => {
                    if (err) { console.log(err); }
                    res.send({
                        'subredditData': rows
                    }); 
                }); 
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
};

module.exports.setup = setup;



