jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');
jQuery.sap.require('sap.crypto.app.Utility.HighstockJsonFormatter');
$.sap.require('sap.crypto.app.Utility.Globals');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinDetail", {

        detailPageId: "CoinDetailPage",
        maxNumCharts: 25, //Maximum number of charts a user can include on the detail page

        onInit: function() {

            console.log('CoinDetail: init');

            //Whenever a change occurs in the CoinSideBar, we must regenerate the coin view with up to date model data
            sap.ui.getCore().getEventBus().subscribe('CoinSideBar', 'generateCoinView', this.generateCoinView, this);
            //Generate coin view whenever we navigate to this page (say from configure table page)
            //We attach this function after rendering so that we can locate the html divs for plotting
            var controller = this;
            this.getView().attachAfterRendering(function(evt, self = controller) {
                var router = sap.ui.core.UIComponent.getRouterFor(controller);
                router.attachRoutePatternMatched(controller.generateCoinView, controller);
                router.fireRouteMatched({
                    'name': 'CoinDetail'
                });
            });
        },

        clearPlottingDivs: function() {

            console.log('CoinDetail: clear divs');
            //Called whenever the there is no data to plot. Clears all highstock chart divs
            $('.CHARTDIV').each(function(index) { var elem = $(this); elem.empty(); });
        },

        //Dynamically populate view with coin data using jquery and highstock apis (no model binding is used)
        generateCoinView: function(channel, event) {

            console.log('CoinDetail: generate coin view');

            this.clearPlottingDivs();
            $('.CHARTDIV').addClass('hideChart');

            var core = sap.ui.getCore(),
                allCoinsData = core.getModel(GLOBALS.aggCoinModelId).getProperty("/Coins"),
                coinDataMap = {},
                coinNames = [],
                coinToChartData = core.getModel(GLOBALS.coinChartModelId).getProperty('/columns'),
                dataMode = core.getModel(GLOBALS.dataModeModelId).getProperty('/active');

            if (coinToChartData.length == 0) { //When no items selected, clear plotting divs and exit
                return;
            }

            for (var i = 0; i < coinToChartData.length; i++) {
                coinNames = coinNames.concat(coinToChartData[i]['data']);
            }

            for (var i = 0; i < allCoinsData.length; i++) {
                if (coinNames.includes(allCoinsData[i]['name'])) {
                    coinDataMap[allCoinsData[i]['name']] = allCoinsData[i]
                }
            }

            HIGHSTOCK_JSON_FORMATTER.processAndPlot(coinToChartData, coinDataMap, dataMode);
        },

        navToTableConfiguration: function(evt) {

            console.log('CoinDetail: navToConfig');

            this.getOwnerComponent().getRouter().navTo("ConfigureTable");
        }

   });
});