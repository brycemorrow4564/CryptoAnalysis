jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals")

sap.ui.jsview("sap.crypto.app.views.DisplayInfo", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.DisplayInfo";
   },

   createContent: function(oController) {

        return new COMPONENT.Page({
            content: [
                new COMPONENT.Label({text: 'detail'})
            ]
        });
   }

});