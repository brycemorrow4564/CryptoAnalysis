jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinSideBar", {

        onInit: function() {
            var data            = JSON_LOADER.get_aggregate_json(),
                allCoinModel    = new COMPONENT.JSONModel(data),
            


        }

   });
});