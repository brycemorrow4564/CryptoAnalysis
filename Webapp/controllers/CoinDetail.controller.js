jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');
jQuery.sap.require('sap.crypto.app.Utility.HighstockJsonFormatter');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinDetail", {

        isSameSet: function(arr1, arr2) {
          return  $( arr1 ).not( arr2 ).length === 0 && $( arr2 ).not( arr1 ).length === 0;
        },

        onInit: function() {
            sap.ui.getCore().getEventBus().subscribe('CoinSideBar', 'generateCoinView', this.generateCoinView, this);
        },

        generateCoinView: function(channel, event, coinNames) {

            var allCoinsData = sap.ui.getCore().getModel("AggregateCoinJson").getProperty("/Coins"),
                coinDataList = [];

            for (var i = 0; i < allCoinsData.length; i++) {
                if (coinNames.includes(allCoinsData[i]['name'])) {
                    coinDataList.push(allCoinsData[i]);
                }
            }

            HIGHSTOCK_JSON_FORMATTER.exWhyIfyDataList(coinDataList);
        },

        navToTableConfiguration: function(evt) {
            var oRouter = this.getOwnerComponent().getRouter();;
            oRouter.navTo("ConfigureTable");
        }

   });
});