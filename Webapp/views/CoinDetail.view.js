jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");

sap.ui.jsview("sap.crypto.app.views.CoinDetail", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.CoinDetail";
   },



   createContent: function(oController) {

        var model = sap.ui.getCore().getModel('CoinToChart');

        var configTableBtn = new COMPONENT.Button({
            text: "Configure Tables",
            press: function(evt) {
                oController.navToTableConfiguration(evt);
            }
        });

        var html = new COMPONENT.HTML({
            content: [
                "<div id='highstockGraph'></div>"
            ]
        });

        return new COMPONENT.Page({
            id: "CoinDetailPage",
            content: [
                configTableBtn,
                html
            ]
        });
   }

});