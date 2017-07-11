jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');
jQuery.sap.require('sap.crypto.app.Utility.HighstockJsonFormatter');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.ConfigureTable", {

        chartManagerTableId: 'ChartManagerTable',

        onInit: function() {

            var coinToChartModel = sap.ui.getCore().getModel('CoinToChart'),
                view = this.getView(),
                allCoinNames = [],
                allCoinNamesObjects = [],
                allCoinsObj = {};

            coinToChartModel.getProperty('/columns').forEach(function(coinToChartObj) {
                var coinNames = coinToChartObj['data'];
                coinNames.forEach(function(name) {
                    allCoinNames.push(name);
                    allCoinNamesObjects.push({"name": name});
                });
            });

            allCoinsObj.coins = allCoinNamesObjects;

            //Copy data from model on core locally. Use event bus to keep this model updated when core model changes.
            this.getView().setModel(coinToChartModel, 'ConfigCoinToChart');
            this.getView().setModel(new COMPONENT.JSONModel(allCoinsObj), 'AllCoins');

            sap.ui.getCore().getEventBus().subscribe('CoinSideBar', 'updateTable', this.updateTable, this);
        },

        updateTable: function() {

            var coinToChartModel = sap.ui.getCore().getModel('CoinToChart'),
                allCoinNames = [],
                allCoinNamesObjects = [],
                allCoinsObj = {};

            coinToChartModel.getProperty('/columns').forEach(function(coinToChartObj) {
                var coinNames = coinToChartObj['data'];
                coinNames.forEach(function(name) {
                    allCoinNames.push(name);
                    allCoinNamesObjects.push({"name": name});
                });
            });

            var configModel = this.getView().getModel("ConfigCoinToChart"),
                allCoinsModel = this.getView().getModel('AllCoins');

            configModel.setData(JSON.parse(coinToChartModel.getJSON()));
            allCoinsModel.setData({'coins': allCoinNamesObjects})

            configModel.refresh(true);
            allCoinsModel.refresh(true);
        },

        navBack: function(evt) {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("");
        },

        /*  This method allows users to add a new chart from the configure tables view. This adds a new entry
            into the table, updates the CoinToChart model. Upon navigation back to the detail view, the model
            will be checked and new charts will be created accordingly.  */
        addChart: function() {

            var chartManagerTable   = sap.ui.getCore().byId(this.chartManagerTableId),
                numRows             = chartManagerTable.getItems().length,
                label               = "Chart " + (numRows + 1),
                coinToChartModel    = sap.ui.getCore().getModel('CoinToChart'),
                currData            = coinToChartModel.getProperty('/'),
                colList             = currData['columns'],
                newChartData        = {},
                newData             = {};

            //Update model data
            newChartData["name"] = label;
            newChartData["data"] = [];
            colList.push(newChartData);
            newData.columns = colList;

            sap.ui.getCore().getModel("CoinToChart").setData(newData);
            sap.ui.getCore().getModel('CoinToChart').refresh();
        }

   });
});