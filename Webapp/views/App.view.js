jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals")

sap.ui.jsview("sap.crypto.app.views.App", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.App";
   },

   createContent: function(oController) {

        this.setDisplayBlock(true);
        var app = new COMPONENT.SplitApp('app');

        var singleCoinView = new COMPONENT.JSView({
            viewName: 'sap.crypto.app.views.CoinDetail'
        });

        var comparisonCoinsView = new COMPONENT.JSView({
            viewName: 'sap.crypto.app.views.CoinDetail'
        });

        var coinSideBar = new COMPONENT.JSView({
            viewName: 'sap.crypto.app.views.CoinSideBar'
        });

        app.addMasterPage(coinSideBar);
        app.addDetailPage(singleCoinView);
        app.addDetailPage(comparisonCoinsView);
        return app;
   }

});