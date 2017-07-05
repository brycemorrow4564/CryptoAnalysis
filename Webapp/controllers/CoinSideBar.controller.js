jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinSideBar", {

        coinListId:     'CoinList',
        allCoinsModelId: 'AllCoins',

        onInit: function() {
            var data            = JSON_LOADER.get_aggregate_json(),
                allCoinsModel   = new COMPONENT.JSONModel(data);

            this.getView().setModel(allCoinsModel);
        },

        selectionChange: function(evt) {

            var eventBus = sap.ui.getCore().getEventBus(),
                listId = evt.getParameters()['id'],
                list = sap.ui.getCore().byId(listId),
                selectedItems = list.getSelectedItems();

            var coinNames = [];
            selectedItems.forEach(function(item) { coinNames.push(item.getTitle()); });
            eventBus.publish('CoinSideBar', 'generateCoinView', coinNames);
        }

   });
});