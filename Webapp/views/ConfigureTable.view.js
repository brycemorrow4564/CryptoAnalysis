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

        var chartManager = new COMPONENT.Table({
            id: oController.chartManagerTableId
        });

        return new COMPONENT.Page({
            showNavButton: true,
            navButtonTap:function(){
                  oController.navBack();
            },
            content: [
                addChartBtn,
                chartManager
            ]
        });
   },

   navBack: function(evt) {
       var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
       oRouter.navTo('');
   }

});