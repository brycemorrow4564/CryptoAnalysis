const Combinatorics = require('js-combinatorics');
var db;

var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split(''),
    mappingTableSchema = "(pKey TEXT, tableName TEXT)"
    usedLetterPointer = -1, //array pointer for alphabet. elem pointed to and all previous elements have been "used"
    //At some point move the declaration of this data elsewhere to avoid duplication of information
    dataSourcesInfo = [
        {
            "source": "redditmetrics",
            "mappingTableName": "Subreddits",
            "dataTableSchema": '(Date REAL, Count REAL)',
            "dataTableFields": ['Date', 'Count'], 
            "dataTableInsertString": '(?,?)',
            "numIdentifiers": 135, //we are currently scraping from 135 subreddits
            "alphabet": []
        },
        {
            "source": "coinmarketcap",
            "mappingTableName": "Coins",
            "dataTableSchema": '(Date REAL, Open REAL, High REAL, Low REAL, Close REAL, Volume REAL, MarketCap REAL, UNIQUE(Date, Open, High, Low, Close, Volume, MarketCap))',
            "dataTableFields": ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'MarketCap'],
            "dataTableInsertString": '(?,?,?,?,?,?,?)',
            "numIdentifiers": 100, //we are currently collecting data for top 150 coins
            "alphabet": []
        }
    ];

const setup = (dbRef) => {

    db = dbRef;

    //Generate alphabets for each of our data sources
    for (var i = 0; i < dataSourcesInfo.length; i++) {
        var elem = dataSourcesInfo[i],
            numIdentifiers = elem.numIdentifiers,
            numLettersNeeded,
            n = 2;
        for ( ; true; n++) {
            var possibleStringsFromSubsetOfSizeN = Math.pow(n, n);
            if (possibleStringsFromSubsetOfSizeN > numIdentifiers) {
                numLettersNeeded = n;
                break;
            }
        }
        if (numLettersNeeded > alphabet.length - (usedLetterPointer + 1)) {
            throw new Error("Error in dbKeyMapper module. Alphabet is too small to generate unique identifier for all elems from data sources");
        } else {
            //add the number of needed letters for our element's alphabet
            dataSourcesInfo[i]['alphabet'] = alphabet.slice().slice(usedLetterPointer + 1, usedLetterPointer + numLettersNeeded + 1);
            usedLetterPointer += numLettersNeeded;
            console.log(`Need to represent ${elem.numIdentifiers} distinct entities for data source ${elem.source} which we can accomplish with the following alphabet ${dataSourcesInfo[i].alphabet}`);
        }
    }
};

const run = (data, dataSource) => {

    //find relevant info object
    var dataInfo = undefined;
    for (var i = 0; i < dataSourcesInfo.length; i++) {
        if (dataSourcesInfo[i]['source'] === dataSource) {
            dataInfo = dataSourcesInfo[i];
            break;
        }
    }
    if (dataInfo === undefined) {
        console.log(dataSource);
        throw new Error("ERROR: When attempting to run dbKeyMapper module on data object, unrecognized data source");
    }
    //Generate mappings from pKeys to our randomly generated valid table names
    const   alphabet                = dataInfo['alphabet'],
            identifyingPermutations = Combinatorics.baseN(alphabet, alphabet.length).toArray().sort().slice(0, dataInfo['numIdentifiers']),
            identifyingStrPerms     = identifyingPermutations.map((elem) => { return elem.join(''); }) //char arrays to strings
            mappingTableName        = dataInfo.mappingTableName,
            rows                    = data.map((elem, ind) => { return [elem['pKey'], identifyingStrPerms[ind]]; }),
            pKeyToDataMap           = data.reduce((accumulator, curr) => {
                accumulator[curr.pKey] = curr.data;
                return accumulator;
            }, {});

    //insert data into tables (triggered as a callback)
    const insertData = () => {
        var promiseResolveCount = 0;
        db.each(`SELECT * FROM ${mappingTableName}`, [],
            (err, row) => {
                if (err) {
                    throw new Error(`ERROR: Unable to select all from table ${mappingTableName}`);
                }
                var pKey = row.pKey,
                    tableName = row.tableName,
                    data = pKeyToDataMap[pKey],
                    dataEntryPromise = new Promise((resolve, reject) => { 
                        db.run(`CREATE TABLE ${tableName} ${dataInfo.dataTableSchema}`, [], () => {
                            let bulkLoadRows = db.prepare(`INSERT INTO ${tableName} VALUES ${dataInfo.dataTableInsertString}`), 
                                runFunc = bulkLoadRows.run;
                            //We are entering data this way since we have the number of parameters to call bulkLoadRows.run with varies by dataSource
                            data.forEach((row) => { 
                                let rowArr = dataInfo.dataTableFields.reduce((accumulator, curr) => { 
                                    if (curr == "MarketCap") {
                                        accumulator.push(row["Market Cap"]);
                                    } else {
                                        accumulator.push(row[curr]); 
                                    }
                                    return accumulator; 
                                }, []);  
                                bulkLoadRows.run(...rowArr); 
                                //runFunc.apply(bulkLoadRows, row); 
                            });
                            //After we complete our bulk loading, we call the finish callback.
                            bulkLoadRows.finalize(() => {
                                console.log(`We have entered data for ${pKey} in mapped table ${tableName}`);
                                //db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => { console.log(rows); })
                                resolve(); //will either resolve or error will be thrown so no explicit call to reject
                            });
                        });
                    });
                dataEntryPromise.then(() => {
                    promiseResolveCount++;
                    if (promiseResolveCount === dataInfo.numIdentifiers) {
                        console.log(`WE HAVE FINISHED ENTERING DATA FOR DATA SOURCE: ${dataSource}`);
                    }
                });
            },
            () => {

            }
        );
    };
    //Input rows into mapping table (triggered as a callback)
    const insertMappingData = () => {
        var bulkLoadRows = db.prepare(`INSERT INTO ${mappingTableName} VALUES (?,?)`);
        rows.forEach((row) => { bulkLoadRows.run(row[0], row[1]); });
        //After we complete our bulk loading, we call the finish callback.
        bulkLoadRows.finalize(() => {
            console.log(`We have created and populated our mapping table for data source ${dataInfo.source}`);
            insertData();
        });
    };

    //Create mapping table
    db.run(`CREATE TABLE ${mappingTableName} ${mappingTableSchema}`, [], insertMappingData);

};

module.exports = {
    "setup": setup,
    "run": run
}