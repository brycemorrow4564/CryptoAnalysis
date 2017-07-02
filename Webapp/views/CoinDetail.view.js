jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals")

sap.ui.jsview("sap.crypto.app.views.CoinDetail", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.CoinDetail";
   },

   createContent: function(oController) {

        return new COMPONENT.Page({
            content: [
                new COMPONENT.Label({text: 'Main Page'})
            ]
        });
   }

});