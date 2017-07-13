jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");

sap.ui.jsview("sap.crypto.app.views.ConfigureTable", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.ConfigureTable";
   },

   createContent: function(oController) {

        var addChartBtn = new COMPONENT.Button({
            text: 'Add Chart',
            width: "100%",
            press: function(evt) { oController.addChart(); },
            layoutData: new COMPONENT.GridData({
                span: "XL4 L6 M6 S8",
                indent: "XL4 L3 M3 S2"
            })
        });

        var firstRow = new COMPONENT.HorizontalLayout({
            content: [addChartBtn]
        });


        var removeChartBtn = new COMPONENT.Button({
            text: "Remove Chart",
            press: function(evt) { oController.removeChart(); }
        });
        var chartTemplate = new sap.ui.core.ListItem({
            text: '{ConfigCoinToChart>name}'
        });
        var selectChartsToRemove = new COMPONENT.MultiComboBox({
            id: oController.selectChartsToRemoveId
        }).bindItems('ConfigCoinToChart>/columns', chartTemplate);

        var coinTemplate = new sap.ui.core.ListItem({
            text: '{AllCoins>name}'
        });
        var selectMultiCoins = new COMPONENT.MultiComboBox({
            selectionChange: function(evt) { oController.handleChangeAction(evt); },
        }).bindItems('AllCoins>/coins', coinTemplate);


        var chartManager = new COMPONENT.Table({
            id: oController.chartManagerTableId,
            columns: [
                new COMPONENT.Column({
                    header: new COMPONENT.Label({
                        text: 'Chart'
                    }),
                    width: "20%"
                }),
                new COMPONENT.Column({
                    header: new COMPONENT.Label({
                        text: 'Coins'
                    })
                })
            ]
        });

        chartManager.bindItems("ConfigCoinToChart>/columns", new sap.m.ColumnListItem({
             cells : [
                  new COMPONENT.Label({
                       text : "{ConfigCoinToChart>name}"
                  }),
                  new COMPONENT.Label({
                       text : "{ConfigCoinToChart>data}"
                  })
             ]
        }));

        return new COMPONENT.Page({
            showNavButton: true,
            navButtonTap:function(){
                  oController.navBack();
            },
            content: [
                firstRow,
                selectChartsToRemove,
                removeChartBtn,
                selectMultiCoins,
                chartManager
            ]
        });
   },

   navBack: function(evt) {
       var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
       oRouter.navTo('');
   }

});