jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");
jQuery.sap.require('sap.crypto.app.Utility.HighstockJsonFormatter');

sap.ui.jsview("sap.crypto.app.views.Home", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.Home";
   },

   createContent: function(oController) {

        var app = sap.ui.getCore().byId('app');


        //app.addDetailPage(detailTwo);

   }

});




