jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinDetail", {

        onInit: function() {
            var eventBus = sap.ui.getCore().getEventBus();
            eventBus.subscribe('CoinSideBar', 'generateCoinViews', this.generateCoinViews, this);
        },

        //Why is this firing twice for a single event?
        generateCoinViews: function(channel, evt, data) {
            coinNames = data;
            alert('generate coin viewsssss' + coinNames);
        }

   });
});