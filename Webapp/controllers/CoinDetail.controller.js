jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinDetail", {

        onInit: function() {
            var eventBus        = sap.ui.getCore().getEventBus(),
                data            = JSON_LOADER.get_aggregate_json(),
                topCoinData     = data['Coins'][0],
                topCoinModel    = new COMPONENT.JSONModel(topCoinData);

            this.getView().setModel(topCoinModel);
            eventBus.subscribe('CoinSideBar', 'generateCoinView', this.generateCoinView, this);
        },

        //Why is this firing twice for a single event?
        generateCoinView: function(channel, event, data) {
            var coinName        = data,
                data            = JSON_LOADER.get_aggregate_json(),
                allCoinsData    = data['Coins'];

            for (var i = 0; i < allCoinsData.length; i++) {
                if (allCoinsData[i]['name'] == coinName) {
                    data = allCoinsData[i];
                    break;
                }
            }

            var coinModel = new COMPONENT.JSONModel(data);
            this.getView().setModel(coinModel);
            alert(this.getView().getModel().getJSON());

        }

   });
});