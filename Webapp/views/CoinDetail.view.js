jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");

sap.ui.jsview("sap.crypto.app.views.CoinDetail", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.CoinDetail";
   },

   createContent: function(oController) {

        var configTableBtn = new COMPONENT.Button({
            text: "Configure Tables",
            press: function(evt) {
                oController.navToTableConfiguration(evt);
            }
        }),
           htmlStr = '';

        //Create divs for plotting all possible charts. Class included for easy jQuery access later on.
        for (var i = 1; i <= oController.maxNumCharts; i++) {
            htmlStr += "<div id='Chart " + i + "' class='CHARTDIV'></div>";
        }

        var html = new COMPONENT.HTML({
            content: htmlStr
        });

        return new COMPONENT.Page({
            id: oController.detailPageId,
            content: [
                configTableBtn,
                html
            ]
        });
   }

});