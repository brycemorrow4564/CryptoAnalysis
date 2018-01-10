const cmParser = require('./coinMarketCapParser');
const rmParser = require('./redditMetricsParser');

const parseData = (data, dataSource) => {

    //Channel incoming data to correct parsing sub-module
    if      (dataSource === 'redditmetrics') { rmParser.parseData(data, dataSource); }
    else if (dataSource === 'coinmarketcap') { cmParser.parseData(data, dataSource); }
    else { throw new Error("ERROR: Unrecognized dataParser type requested from DataParser module"); }

}


module.exports.parseData = parseData;
