$.sap.require('sap.crypto.app.Utility.Globals');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.CoinSideBar", {

        coinListId      : 'CoinList',
        pageId          : "SidebarPage",

        onInit: function() {
            sap.ui.getCore().getEventBus().subscribe('ConfigureTable', 'deselectCoins', this.deselectCoins, this);
            sap.ui.getCore().getEventBus().subscribe('ConfigureTable', 'deselectAllCoins', this.deselectAllCoins, this);
        },

        checkBoxClick: function(evt) {

            console.log('Sidebar: check box click');

            var itemClicked = evt.getParameters().listItem,
                itemStatus = itemClicked.isSelected(),
                coinName = itemClicked.getTitle(),
                numSelectedItems = evt.getSource().getSelectedItems().length;

            this.selectionChange(itemClicked, itemStatus, coinName, numSelectedItems);
        },

        listItemClick: function(evt) {

            console.log('Sidebar: list item click');

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

            console.log('Sidebar: selection change');

            var coinToChartModel = sap.ui.getCore().getModel(GLOBALS.coinChartModelId),
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

                //Since a coin was newly selected, we now need to check if we have loaded the data for this coin into app
                var dataModel   = sap.ui.getCore().getModel(GLOBALS.aggCoinModelId),
                    coins       = dataModel.getProperty('/Coins'),
                    dataLoaded  = false;

                for (var x = 0; x < coins.length; x++) {
                    if (coins[x]['name'] === coinName) {
                        dataLoaded = !(coins[x]['data'].length === 0);
                        break;
                    }
                }

                if (!dataLoaded) { //If we didn't find this particular coins data in model, we load it in via API

                    var busyDialog = sap.ui.jsfragment('sap.crypto.app.views.fragments.BusyDialog');
                    $.sap.syncStyleClass('sapUiSizeCompact', this.getView(), busyDialog);
                    busyDialog.open();

                    $.when(
                        $.ajax({
                            async: false,
                            url: '/coins/' + coinName
                        })
                    )
                    .done(function(response) {

                        var rawData = response['data'];
                        for (var k = 0; k < rawData.length; k++) {
                            var elem = rawData[k];
                            elem['Volume'] = parseInt(elem['Volume'].replace(/,/g,''));
                            elem['MarketCap'] = parseInt(elem['MarketCap'].replace(/,/g,''));
                            elem['Open'] = parseFloat(elem['Open'].replace(/,/g,''));
                        }
                        var cleanedData = rawData; //data has been correctly formatted at this point

                        for (var q = 0; q < coins.length; q++) {
                            if (coins[q]['name'] === coinName) {
                                coins[q]['data'] = cleanedData;
                                break;
                            }
                        }

                        dataModel.setData({"Coins": coins});
                        dataModel.refresh(true);
                        setTimeout(function() {busyDialog.close()}, 350); //350 msec Delay to avoid flashing screen w/ no dialog shown
                    });

                }

            }

            //Reset model data on core after performing necessary changes
            var model = sap.ui.getCore().getModel(GLOBALS.coinChartModelId);
            model.setData({'columns': data});
            model.refresh(true);

            var eventBus = sap.ui.getCore().getEventBus(),
                currDetPageName = sap.ui.getCore().byId("app").getCurrentDetailPage().sViewName.split('.').splice(-1)[0].trim();

            if (currDetPageName === 'CoinDetail') {
                eventBus.publish('CoinSideBar', 'generateCoinView'); //CoinDetail subscribes to this event and reacts to model changes
            } else if (currDetPageName === 'ConfigureTable') {
                eventBus.publish('CoinSideBar', 'updateAllCoins'); //ConfigureTable subscribes to this to keep table updated
            }
        },

        deselectCoins: function(channel, event, data) {

            console.log('Sidebar: deselect coins');

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

            console.log('Sidebar: deselect all');

            sap.ui.getCore().byId(this.coinListId).removeSelections(true);
        },

        onLiveChange: function(oEvent) {

            console.log('Sidebar: live change');

            var data = oEvent.getSource().getValue(),
                filter = new sap.ui.model.Filter('name', sap.ui.model.FilterOperator.StartsWith, data),
                list = sap.ui.getCore().byId(this.coinListId),
                oBinding = list.getBinding('items');

            oBinding.filter([filter]);
        }

   });
});