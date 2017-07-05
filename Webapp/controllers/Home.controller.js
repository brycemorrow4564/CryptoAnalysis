sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.Home", {

        onInit: function() {
            var splitApp = sap.ui.getCore().byId('app'),
                detailPages = splitApp.getDetailPages();

            console.log(detailPages[0]);

            splitApp.toMaster("m2");
            splitApp.toDetail("d2");
            //splitApp.to(this.createId(detailPages[0].getId()));
        }

   });
});