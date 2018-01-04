sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinCorrelation", {

        onInit: function() {

            console.log('Initiate coin correlation view');

            var controller = this;
            this.getView().attachAfterRendering(function(evt) {
                var router = sap.ui.core.UIComponent.getRouterFor(controller);
                router.attachRoutePatternMatched(controller.generateCoinView, controller);
                if (controller.isInit) {
                    controller.isInit = false;
                    router.fireRoutePatternMatched({
                        'name': 'CoinDetail'
                    });
                }
            });


        },

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
            var sumXY = sumX = sumY = sumX2 = sumY2 = 0;
            //Let dataOne be rv X and dataTwo be rv Y
            while (p < endIndex) {
                var currX = dataOne[p][activeMetric],
                    currY = dataTwo[p][activeMetric];
                sumX    += currX;
                sumY    += currY;
                sumX2   += currX**2;
                sumY2   += currY**2;
                sumXY   += currX * currY
            }
            var numDataPoints   = endIndex,
                corr            = (numDataPoints * sumXY - sumX * sumY) /
                                  Math.sqrt((numDataPoints*sumX2 - sumX**2)*(numDataPoints*sumY2 - sumY**2));

            return corr;
        },

        generateCorrelationMatrix: function() {

            $.sap.require("sap.crypto.app.Utility.Globals");

            const core                  = sap.ui.getCore(),
                  selectedCoinsData     = core.getModel(GLOBALS.coinChartModelId).getData(),
                  analysisMetricData    = core.getModel(GLOBALS.dataModeModelId).getData(),
                  aggCoinData           = core.getModel(GLOBALS.aggCoinModelId).getData(),
                  activeMetric          = analysisMetricData['active'];
            var selectedCoins           = [],
                coinDataMap             = {};

            //get names of all selected coins
            selectedCoinsData['columns'].forEach((chartObj) => {
                var coins = chartObj['data'];
                coins.forEach((coin) => {
                    selectedCoins.push(coin);
                });
            });

            //create mapping from coin names to their corresponding data
            aggCoinData['Coins'].forEach((coinObj) => {
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
                        var dataOne = coinDataMap[coinOne],
                            dataTwo = coinDataMap[coinTwo];
                            corr    = calculateCorrelation(dataOne, dataTwo, activeMetric);
                        correlationMatrix[c][r] = corr;
                    }
                }
            }

            console.log(correlationMatrix);
            return {
                "coins" : selectedCoins,
                "matrix": correlationMatrix
            }

        }

   });
});