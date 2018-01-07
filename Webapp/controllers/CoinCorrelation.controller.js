$.sap.require('sap.crypto.app.Utility.Globals');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinCorrelation", {

        pageId: "correlationPageId",
        tableId: "CorrelationTable",

        onInit: function() {
            console.log('Initiate coin correlation view');
            sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.onRouteMatched, this);
            sap.ui.getCore().getEventBus().subscribe('CoinSideBar', 'regenerateCorrelationTable', this.generateCorrelationTable, this);
        },

        onRouteMatched: function() {

            var currDetPageName = sap.ui.getCore().byId("app").getCurrentDetailPage().sViewName.split('.').splice(-1)[0].trim();
            if (currDetPageName !== "CoinCorrelation") {
                return;
            }

            this.generateCorrelationTable();
        },

        generateCorrelationTable: function() {

            const core                  = sap.ui.getCore(),
                  selectedCoinsData     = core.getModel(GLOBALS.coinChartModelId).getData();
            var selectedCoins           = [];

            //get names of all selected coins
            selectedCoinsData['columns'].forEach(function(chartObj) {
                var coins = chartObj['data'];
                coins.forEach(function(coin) {
                    selectedCoins.push(coin);
                });
            });

            if (selectedCoins.length === 0) {
                const page = sap.ui.getCore().byId(this.pageId);
                page.destroyContent();
                return;
            }

            var tableOptions = {
                    id: this.tableId,
                    width: "90%"
                },
                columns = [];

            columns.push("CoinNames");
            selectedCoins.forEach(function(coinName) {
                columns.push(coinName);
            });

            columns = columns.map(function(colName) {
                return new sap.m.Column({
                    header: new sap.m.Label({text: colName}),
                    width: (100 / columns.length) + '%'
                })
            });

            //We destroy content so we can create new table with same id
            const page = sap.ui.getCore().byId(this.pageId);
            page.destroyContent();

            tableOptions.columns = columns;
            var correlationTable = new sap.m.Table(tableOptions);

            correlationTable.bindItems({
                path: GLOBALS.correlationMatrixModelId + '>/columns',
                factory: function(sId, oContext) {

                    var data        = oContext.oModel.getProperty(oContext.sPath),
                        numCoins    = Object.keys(data).length - 1,
                        cells       = [];

                    cells.push(new sap.m.Label({
                        text: {
                            path: GLOBALS.correlationMatrixModelId + '>coin_name'
                        }
                    }));

                    for (var i = 0; i < numCoins; i++) {
                        cells.push(new sap.m.Label({
                            text: {
                                path: GLOBALS.correlationMatrixModelId + '>' + i //correlation values indexed by count in model
                            }
                        }));
                    }

                    return new sap.m.ColumnListItem({
                        "cells": cells
                    });
                }
            });

            page.addContent(correlationTable);
        }

   });
});