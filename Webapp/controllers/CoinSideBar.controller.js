jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');
jQuery.sap.require('sap.crypto.app.Utility.Globals');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinSideBar", {

        coinListId      : 'CoinList',
        allCoinsModelId : 'AllCoins',
        pageId          : "SidebarPage",

        onInit: function() {
            var data            = JSON_LOADER.get_aggregate_json(),
                allCoinsModel   = new COMPONENT.JSONModel(data);

            this.getView().setModel(allCoinsModel);
            sap.ui.getCore().getEventBus().subscribe('ConfigureTable', 'deselectCoins', this.deselectCoins, this);
            sap.ui.getCore().getEventBus().subscribe('ConfigureTable', 'deselectAllCoins', this.deselectAllCoins, this);
        },

        checkBoxClick: function(evt) {

            var itemClicked = evt.getParameters().listItem,
                itemStatus = itemClicked.isSelected(),
                coinName = itemClicked.getTitle(),
                numSelectedItems = evt.getSource().getSelectedItems().length;

            this.selectionChange(itemClicked, itemStatus, coinName, numSelectedItems);
        },

        listItemClick: function(evt) {

            //Events are different so we have to make some alterations when list item, rather than checkbox is clicked
            var itemClicked = evt.getSource(),
                itemStatus = !itemClicked.isSelected(),
                coinName = itemClicked.getTitle(),
                list = sap.ui.getCore().byId(this.coinListId),
                numSelectedItems = list.getSelectedItems().length + (itemStatus ? 1 : 0);

            list.setSelectedItem(itemClicked, itemStatus);

            this.selectionChange(itemClicked, itemStatus, coinName, numSelectedItems);

        },

        selectionChange: function(itemClicked, itemStatus, coinName, numSelectedItems) {

            var coinToChartModel = sap.ui.getCore().getModel("CoinToChart"),
                data = coinToChartModel.getProperty('/columns');

            //Make conditional changes to coinToChart model
            if (!itemStatus) { //If item was unselected, we need to remove the coin name from the table config model
                if (numSelectedItems == 0) { //special case if no items are selected
                    data = [];
                } else {
                    var targetList = -1,
                        replaceInd = -1;

                    for (var i = 0; i < data.length; i++) {
                        var chartDataObj = data[i],
                            chartName = chartDataObj['name'],
                            coinNames = chartDataObj['data'];
                        for (var x = 0; x < coinNames.length; x++) {
                            if (coinNames[x] == coinName) {
                                  targetList = coinNames;
                                  replaceInd = i;
                                  break;
                            }
                        }
                        if (targetList != -1) {
                            break;
                        }
                    }

                    //remove coinName from list
                    var ind = targetList.indexOf(coinName);
                    targetList.splice(ind, 1);

                    //place new data back in aggregateData at appropriate index
                    var newData = {};
                    newData.name = chartName;
                    newData.data = targetList;
                    data[replaceInd] = newData;
                }
            } else { //If item was selected, we add coin name to table config model using default chart value from Globals.js
                var keyFound = false;
                for (var i = 0; i < data.length; i++) {
                    var chartDataObj = data[i],
                        chartName = chartDataObj['name'];

                    if (chartName == GLOBALS.defaultChartId) {
                        coinNames = chartDataObj['data'];
                        coinNames.push(coinName)
                        chartDataObj.data = coinNames;
                        data[i] = chartDataObj;
                        coinToChartModel.setData({'columns': data});
                        keyFound = true;
                        break;
                    }
                }
                if (!keyFound) { //No Chart has been created yet so we create new key in model
                    var newObj = {};
                    newObj.name = GLOBALS.defaultChartId;
                    newObj.data = [coinName];
                    data.push(newObj);
                }
            }

            //Reset model data on core after performing necessary changes
            sap.ui.getCore().getModel('CoinToChart').setData({'columns': data})
            sap.ui.getCore().getModel('CoinToChart').refresh(true);

            var eventBus = sap.ui.getCore().getEventBus();

            eventBus.publish('CoinSideBar', 'generateCoinView'); //CoinDetail subscribes to this event and reacts to model changes
            eventBus.publish('CoinSideBar', 'updateAllCoins'); //Refresh table in ConfigureTable view
        },

        deselectCoins: function(channel, event, data) {

            var coinList        = sap.ui.getCore().byId(this.coinListId),
                selectedCoins   = coinList.getSelectedItems();

            data['coins'].forEach(function(coinName) {
                for (var i = 0; i < selectedCoins.length; i++) {
                    if (coinName == selectedCoins[i].getTitle()) {
                        selectedCoins.splice(i,1); //remove item
                        break;
                    }
                }
            });

            //Clear selection and reselect remaining coins
            coinList.removeSelections(true);
            selectedCoins.forEach(function(item) { coinList.setSelectedItem(item, true); })
        },

        deselectAllCoins: function(channel, event) {
            sap.ui.getCore().byId(this.coinListId).removeSelections(true);
        },

        onLiveChange: function(oEvent) {

            var data = oEvent.getSource().getValue(),
                filter = new sap.ui.model.Filter('name', sap.ui.model.FilterOperator.StartsWith, data),
                list = sap.ui.getCore().byId(this.coinListId),
                oBinding = list.getBinding('items');

            oBinding.filter([filter]);
        }

   });
});