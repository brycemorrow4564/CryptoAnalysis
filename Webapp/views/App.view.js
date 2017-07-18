jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");

sap.ui.jsview("sap.crypto.app.views.App", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.App";
   },

   createContent: function(oController) {

        this.setDisplayBlock(true);
        this.oApp = new COMPONENT.SplitApp("app", {
            layoutData: new COMPONENT.SplitterLayoutData({
                resizable: true
            })
        });
        return this.oApp;
   }

});