jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals")

sap.ui.jsview("sap.crypto.app.views.App", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.App";
   },

   createContent: function(oController) {

        this.setDisplayBlock(true);
        var app = new COMPONENT.SplitApp('app');
        var displayInfo = new COMPONENT.JSView({
                    viewName: 'sap.crypto.app.views.DisplayInfo'
                });

        var coinSideBar = new COMPONENT.JSView({
            viewName: 'sap.crypto.app.views.CoinSideBar'
        });


        app.setHomeIcon({ 'phone':'phone-icon.png', 'phone@2':'phone-retina.png', 'tablet':'tablet-icon.png', 'tablet@2':'tablet-retina.png', 'icon':'desktop.ico' });

        app.addMasterPage(coinSideBar);
        app.addDetailPage(displayInfo);
        return app;
   }

});