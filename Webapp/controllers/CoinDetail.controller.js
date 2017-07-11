jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');
jQuery.sap.require('sap.crypto.app.Utility.HighstockJsonFormatter');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinDetail", {

        detailPageId: "CoinDetailPage",
        maxNumCharts: 25, //Maximum number of charts a user can include on the detail page

        onInit: function() {
            //Whenever a change occurs in the CoinSideBar, we must regenerate the coin view with up to date model data
            sap.ui.getCore().getEventBus().subscribe('CoinSideBar', 'generateCoinView', this.generateCoinView, this);
        },

        clearPlottingDivs: function() {
            //Called whenever the there is no data to plot. Clears all highstock chart divs
            $('.CHARTDIV').each(function(index) { $(this).empty(); });
        },

        //Dynamically populate view with coin data using jquery and highstock apis (no model binding is used)
        generateCoinView: function(channel, event) {

            var allCoinsData = sap.ui.getCore().getModel("AggregateCoinJson").getProperty("/Coins"),
                coinDataMap = {},
                coinNames = [],
                coinToChartData = sap.ui.getCore().getModel("CoinToChart").getProperty('/columns'),
                relevantCoinToChartData = [];

            if (coinToChartData.length == 0) { //When no items selected, clear plotting divs and exit
                this.clearPlottingDivs();
                return;
            }

            for (var i = 0; i < coinToChartData.length; i++) {
                var chartDataObj = coinToChartData[i],
                    chartName = chartDataObj['name'],
                    chartCoinNames = chartDataObj['data'];

                //If we have added a chart to the model but there is no data associated with it, do NOT plot the chart
                if (chartCoinNames.length != 0) {
                    var obj = {};
                    obj.name = chartName;
                    obj.data = chartCoinNames;
                    relevantCoinToChartData.push(obj);
                    coinNames = coinNames.concat(chartCoinNames);
                }
            }

            for (var i = 0; i < allCoinsData.length; i++) {
                if (coinNames.includes(allCoinsData[i]['name'])) {
                    coinDataMap[allCoinsData[i]['name']] = allCoinsData[i]
                }
            }

            HIGHSTOCK_JSON_FORMATTER.processAndPlot(relevantCoinToChartData, coinDataMap);
        },

        navToTableConfiguration: function(evt) {
            var oRouter = this.getOwnerComponent().getRouter();;
            oRouter.navTo("ConfigureTable");
        }

   });
});