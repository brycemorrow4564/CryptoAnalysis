jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');
jQuery.sap.require('sap.crypto.app.Utility.HighstockJsonFormatter');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.ConfigureTable", {

        chartManagerTableId: 'ChartManagerTable',

        navBack: function(evt) {

            var oRouter = this.getOwnerComponent().getRouter();;
            oRouter.navTo("");
        },


        /*  This method allows users to add a new chart from the configure tables view. This adds a new entry
            into the table, updates the CoinToChart model. Upon navigation back to the detail view, the model
            will be checked and new charts will be created accordingly.  */
        addChart: function() {

            var chartManagerTable   = sap.ui.getCore().byId(this.chartManagerTableId),
                numCols             = chartManagerTable.getColumns().length,
                label               = "Chart " + (numCols + 1),
                coinToChartModel    = sap.ui.getCore().getModel('CoinToChart'),
                currData            = coinToChartModel.getProperty('/'),
                colList             = currData['columns'],
                newChartData        = {},
                newData             = {},
                newCol              = new COMPONENT.Column({
                                            label: new COMPONENT.Label({
                                                text: label
                                            })
                                      });

            //Add new column to table
            chartManagerTable.addColumn(newCol);

            //Update model data
            newChartData["name"] = label;
            newChartData["data"] = []
            colList.push(newChartData);
            newData.columns = colList;
            coinToChartModel.setData(newData);
        }

   });
});