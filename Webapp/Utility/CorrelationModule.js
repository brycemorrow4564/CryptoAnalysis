$.sap.require('sap.crypto.app.Utility.Globals');

CORRELATION_MODULE = {

        calculateCorrelation: function(dataOne, dataTwo, activeMetric) {
            /*
            Data assumption: All data runs from a start date (span of 2013-2017) and runs to the current date
            We calculate our correlation data only over days where there is data for both coins. So if for example
            we compare bitcoin and bitcoin cash, we drop all days from bitcoin where there is not price data for
            bitcoin cash. We want to track general levels of correlation for whatever attribute (market cap, open, high
            low, etc.) is currently selected. We assume dataOne !== dataTwo as we handle this case in generate function.
            */
            var endIndex    = Math.min(dataOne.length, dataTwo.length),
                p           = 0;
            var sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0;
            //Let dataOne be rv X and dataTwo be rv Y
            while (p < endIndex) {
                var currX = dataOne[p][activeMetric],
                    currY = dataTwo[p][activeMetric];
                sumX    += currX;
                sumY    += currY;
                sumX2   += Math.pow(currX,2);
                sumY2   += Math.pow(currY,2);
                sumXY   += currX * currY;
                p++;
            }
            var numDataPoints   = endIndex,
                corr            = (numDataPoints * sumXY - sumX * sumY) /
                                  Math.sqrt((numDataPoints*sumX2 - Math.pow(sumX,2))*(numDataPoints*sumY2 - Math.pow(sumY,2)));

            return Math.floor(corr*100) / 100.0;
        },

        generateCorrelationMatrix: function() {

            const core                  = sap.ui.getCore(),
                  selectedCoinsData     = core.getModel(GLOBALS.coinChartModelId).getData(),
                  analysisMetricData    = core.getModel(GLOBALS.dataModeModelId).getData(),
                  aggCoinData           = core.getModel(GLOBALS.aggCoinModelId).getData(),
                  activeMetric          = analysisMetricData['active'];
            var selectedCoins           = [],
                coinDataMap             = {};

            //get names of all selected coins
            selectedCoinsData['columns'].forEach(function(chartObj) {
                var coins = chartObj['data'];
                coins.forEach(function(coin) {
                    selectedCoins.push(coin);
                });
            });

            if (selectedCoins.length === 0) {
                return;
            }

            //create mapping from coin names to their corresponding data
            aggCoinData['Coins'].forEach(function(coinObj) {
                coinDataMap[coinObj.name] = coinObj.data;
            });

            //Create array one column at a time as we are calculating correlation values
            //EX: Creating a 3x3 square matrix of values. f = filled, * = space initialized
            /*     0               1               2             3
                 * * *           f * *           f f *         f f f
                          =>     f         =>    f f      =>   f f f
                                 f               f f           f f f
            */
            const numCoins = selectedCoins.length;
            var correlationMatrix = new Array(numCoins);
            for (var c = 0; c < selectedCoins.length; c++) {
                var colCoin = selectedCoins[c];
                correlationMatrix[c] = new Array(numCoins);
                for (var r = 0; r < selectedCoins.length; r++) {
                    var rowCoin = selectedCoins[r];
                    if (colCoin === rowCoin) {
                        correlationMatrix[c][r] = 1;
                    } else {
                        var calculatedMirror = false;
                        try {
                            correlationMatrix[c][r] = correlationMatrix[r][c]
                            calculatedMirror = true;
                        } catch (err) {}
                        if (!calculatedMirror) {
                            var dataOne = coinDataMap[colCoin],
                                dataTwo = coinDataMap[rowCoin],
                                corr    = this.calculateCorrelation(dataOne, dataTwo, activeMetric);
                            correlationMatrix[c][r] = corr;
                        }
                    }
                }
            }

            //Calculated data now we update our model
            var corrMatrixModel = core.getModel(GLOBALS.correlationMatrixModelId),
                columns         = [];

            for (var c = 0; c < selectedCoins.length; c++) {
                var coinName    = selectedCoins[c],
                    obj         = {
                        "coin_name": coinName
                    };
                for (var r = 0; r < correlationMatrix[0].length; r++) {
                    obj[r + ''] = correlationMatrix[c][r];
                }
                columns.push(obj);
            }

            corrMatrixModel.setData({
                "columns": columns
            })

            console.log('correlation matrix'); console.log(correlationMatrix); console.log(columns);

        }
}