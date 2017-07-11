jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");

sap.ui.jsview("sap.crypto.app.views.ConfigureTable", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.ConfigureTable";
   },

   createContent: function(oController) {

        var addChartBtn = new COMPONENT.Button({
            text: 'Add Chart',
            press: function(evt) { oController.addChart(); }
        });

        var template = new sap.ui.core.ListItem({
            text: '{AllCoins>name}'
        });

        var selectMultiCoins = new COMPONENT.MultiComboBox({
            selectionChange: function(evt) { oController.handleChangeAction(evt); },
        }).bindItems('AllCoins>/coins', template);


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
                addChartBtn,
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