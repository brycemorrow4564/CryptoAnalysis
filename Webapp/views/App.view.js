$.sap.require('sap.m.SplitApp');
$.sap.require('sap.ui.layout.SplitterLayoutData');

sap.ui.jsview("sap.crypto.app.views.App", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.App";
   },

   createContent: function(oController) {

        this.setDisplayBlock(true);
        this.oApp = new sap.m.SplitApp("app", {
            layoutData: new sap.ui.layout.SplitterLayoutData({
                resizable: true
            })
        });
        return this.oApp;
   }

});