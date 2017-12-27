const setup = (app, db) => {

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
                for (var i = 0; i < rows.length; i++) {
                    rows[i].coin_name = rows[i].coin_name.slice(2).replace(/_/g,'-');
                }
                res.send({
                    "coin_names": rows
                });
            }
        });
    });

    console.log("API has been setup");

};

module.exports.setup = setup;


