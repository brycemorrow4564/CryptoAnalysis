jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals")

sap.ui.jsview("sap.crypto.app.views.CoinSideBar", {

//   getControllerName: function() {
//      return "sap.crypto.app.controllers.App";
//   },

   createContent: function(oController) {

        return new COMPONENT.Page({
            content: [
                new COMPONENT.Label({text: 'coin'})
            ]
        });
   }

});