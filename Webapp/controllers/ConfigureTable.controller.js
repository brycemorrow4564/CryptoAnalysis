jQuery.sap.require('sap.crypto.app.Utility.LocalJsonLoader');
jQuery.sap.require('sap.crypto.app.Utility.HighstockJsonFormatter');
jQuery.sap.require('sap.crypto.app.Utility.Globals');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.ConfigureTable", {

        chartMode           : 'chart',
        coinMode            : 'coin',
        selectDefaultChartId: 'DefaultChart',
        chartManagerTableId : 'ChartManagerTable',
        allCoinsModelId     : 'AllCoins',
        coinToChartModelId  : 'CoinToChart',
        removeRowId         : 'RemoveRow',
        removeCoinId        : 'RemoveCoin',
        removeChartId       : 'RemoveChart',
        removeSelectorId    : 'RemoveSelector',
        segButtonsId        : 'SegButtons',
        vertLayoutId        : 'VertLayout',

        onInit: function() {

            /* Setup AllCoins model, which is used to display list of all coin names for batch action.
               Data will be loaded into this model via onRouteMatched. It will also be updated when selection
               events occur in the CoinSideBar view. */
            this.getView().setModel(new COMPONENT.JSONModel({}), this.allCoinsModelId);
            sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.onRouteMatched, this);
            sap.ui.getCore().getEventBus().subscribe('CoinSideBar', 'updateAllCoins', this.updateAllCoins, this);
        },

        onRouteMatched: function(oEvent) {

            var coinToChartModel    = sap.ui.getCore().getModel(this.coinToChartModelId),
                allCoinNamesObjects = [];

            coinToChartModel.getProperty('/columns').forEach(function(coinToChartObj) {
                coinToChartObj['data'].forEach(function(coinName) { allCoinNamesObjects.push({"name": coinName}); });
            });

            this.getView().getModel(this.allCoinsModelId).setData({'coins': allCoinNamesObjects});
        },

        updateAllCoins: function() {

            this.onRouteMatched();
        },

        setDefaultChart: function(oEvent) {
            try {
                var selectChartList = sap.ui.getCore().byId(this.selectDefaultChartId),
                    newDefault = selectChartList.getSelectedItem().getText();
                GLOBALS.defaultChartId = newDefault;
                selectChartList.setSelectedItem(null);
            } catch (err) {
                //This will catch exceptions when no item is selected. If this is the case we do nothing.
                console.log(err);
            }
        },

        navToCoinDetail: function(evt) {

            this.getOwnerComponent().getRouter().navTo("CoinDetail");
        },

        /*  This method allows users to add a new chart from the configure tables view. This adds a new entry
            into the table, updates the CoinToChart model. Upon navigation back to the detail view, the model
            will be checked and new charts will be created accordingly.  */
        addChart: function() {

            var chartManagerTable   = sap.ui.getCore().byId(this.chartManagerTableId),
                label               = "Chart " + (chartManagerTable.getItems().length + 1),
                coinToChartModel    = sap.ui.getCore().getModel(this.coinToChartModelId),
                colList             = coinToChartModel.getProperty('/')['columns'];

            colList.push({
                "name": label,
                "data": []
            });

            coinToChartModel.setData({'columns': colList});
            coinToChartModel.refresh(true);
        },

        removeCharts: function() {

            var chartsToRemoveList  = sap.ui.getCore().byId(this.removeSelectorId),
                chartsToRemoveItems = chartsToRemoveList.getSelectedItems(),
                chartsToRemove      = [],
                globalModel         = sap.ui.getCore().getModel(this.coinToChartModelId),
                allCoinsModel       = this.getView().getModel(this.allCoinsModelId),
                allCoinNamesObjects = [],
                coinToChartObjects  = [],
                unclickCoinNames    = [],
                allCoinsObj         = {},
                chartCounter        = 1;

            chartsToRemoveItems.forEach(function(chartItem) { chartsToRemove.push(chartItem.getText()); });

            globalModel.getProperty('/columns').forEach(function(coinToChartObj) {
                var chartName = coinToChartObj['name'];
                if ($.inArray(chartName, chartsToRemove) == -1) { //returns -1 if not in array so we, keep these coins
                    var coinNames = coinToChartObj['data'];
                    coinNames.forEach(function(name) {
                        allCoinNamesObjects.push({"name": name});
                    });
                    coinToChartObjects.push({ //redo chart names since we might remove non-consecutive charts
                        'name': 'Chart ' + chartCounter++,
                        'data': coinNames
                    });
                } else {
                    //since we are removing this chart, we need to keep track of which coins
                    //are being removed so we can publish to event bus and unclick in sidebar
                    unclickCoinNames = unclickCoinNames.concat(coinToChartObj['data']);
                }
            });

            //Publish coins to unclick to EventBus
            sap.ui.getCore().getEventBus().publish('ConfigureTable', 'deselectCoins', {"coins": unclickCoinNames});

            //Set new data and refresh
            globalModel.setData({'columns': coinToChartObjects});
            allCoinsModel.setData({'coins': allCoinNamesObjects})

            globalModel.refresh(true);
            allCoinsModel.refresh(true);

            //Deselect all charts in combo box
            chartsToRemoveList.setSelectedItems([]);
        },

        generateCoinCells: function(sId,oContext) {

            var data = oContext.oModel.getProperty(oContext.sPath),
                chartName = data['name'],
                coins = data['data'],
                buttons = [];

            for (var i = 0; i < coins.length; i++) {
                buttons.push(
                    new COMPONENT.Button({
                        text: coins[i]
                    }).addStyleClass('chartTableBtnMarker')
                );
            }

            return new sap.m.ColumnListItem({
                cells: [
                    new COMPONENT.Label({
                        text : {'path': 'CoinToChart>name'}
                    }),
                    new COMPONENT.HorizontalLayout({
                        width: '100%',
                        allowWrapping: true,
                        content: buttons
                    }).addStyleClass('CoinContainerMarker')
                ]
            });
        },

        removeCoins: function() {

            //Get List control, get selected items, and extract text to get the names of clicked coins
            var selectCoins = sap.ui.getCore().byId(this.removeSelectorId),
                selectedOptions = selectCoins.getSelectedItems(),
                selectedCoinNames = [];

            selectedOptions.forEach(function(option) { selectedCoinNames.push(option.getText()); });

            //Now that we know which coins to remove. We get all models that need to be altered and begin this process.
            var globalModel = sap.ui.getCore().getModel(this.coinToChartModelId),
                allCoinsModel = this.getView().getModel(this.allCoinsModelId),
                allCoinNamesObjects = [],
                coinToChartObjects = [],
                unclickCoinNames = [],
                allCoinsObj = {};

            globalModel.getProperty('/columns').forEach(function(coinToChartObj) {
                var chartName = coinToChartObj['name'],
                    coins = coinToChartObj['data'],
                    keepCoins = [];
                for (var i = 0; i < coins.length; i++) {
                    if ($.inArray(coins[i], selectedCoinNames) == -1) { //returns -1 if not in array so we, keep these coins
                        allCoinNamesObjects.push({"name": coins[i]});
                        keepCoins.push(coins[i]);
                    }
                }
                coinToChartObjects.push({
                    "name": chartName,
                    "data": keepCoins
                });
            });

            //Publish coins to unclick to EventBus
            sap.ui.getCore().getEventBus().publish('ConfigureTable', 'deselectCoins', {"coins": selectedCoinNames});

            //Set new data and refresh
            globalModel.setData({'columns': coinToChartObjects});
            allCoinsModel.setData({'coins': allCoinNamesObjects})

            globalModel.refresh(true);
            allCoinsModel.refresh(true);

            //Deselect items in combo box
            selectCoins.setSelectedItems([]);
        },

        moveCoinsToChart(coinNames, newChart) {

            var globalModel = sap.ui.getCore().getModel(this.coinToChartModelId),
                coinToChartObjects = [];

            globalModel.getProperty('/columns').forEach(function(coinToChartObj) {
                var chartName = coinToChartObj['name'],
                    coins = coinToChartObj['data'],
                    keepCoins = [];
                if (chartName == newChart) {
                    coinToChartObjects.push({
                        "name": chartName,
                        "data": coinNames.concat(coins)
                    });
                } else {
                    for (var i = 0; i < coins.length; i++) {
                        if ($.inArray(coins[i], coinNames) == -1) { //returns -1 if not in array so we, keep these coins
                            keepCoins.push(coins[i]);
                        }
                    }
                    coinToChartObjects.push({
                        "name": chartName,
                        "data": keepCoins
                    });
                }

            });

            //Set new data and refresh
            globalModel.setData({'columns': coinToChartObjects});
            globalModel.refresh(true);
        },

        getCoinTemplate: function() {
            var item = new sap.ui.core.ListItem();
            return item.bindProperty('text', 'AllCoins>name');
        },

        getChartTemplate: function() {
            var item = new sap.ui.core.ListItem();
            return item.bindProperty('text', 'CoinToChart>name');
        },

        switchComboBox: function(newComboId) {

            var core = sap.ui.getCore(),
                currCombo = core.byId(this.removeRowId).getContent()[0];

            if (newComboId == this.coinMode) {
                //activate coin combo selector
                currCombo.bindItems(this.allCoinsModelId + '>/coins', this.getCoinTemplate());
            } else {
                //activate chart combo selector
                currCombo.bindItems(this.coinToChartModelId + '>/columns', this.getChartTemplate());
            }

            this.getView().getModel(this.allCoinsModelId).refresh(true);
            this.getView().getModel(this.coinToChartModelId).refresh(true);
        },

        removeChartOrCoin: function() {

            var segBtns = sap.ui.getCore().byId(this.segButtonsId),
                selectedId = segBtns.getSelectedButton();

            switch(selectedId) {
                case this.removeChartId:
                    this.removeCharts();
                    break;
                case this.removeCoinId:
                    this.removeCoins();
                    break;
                default:
                    throw "Unrecognized remove button id"
            }
        },

        resetConfig: function() {

            var globalModel = sap.ui.getCore().getModel(this.coinToChartModelId),
                allCoinsModel = this.getView().getModel(this.allCoinsModelId);

            globalModel.setData({
                'columns': [
                    {
                        'name': 'Chart 1',
                        'data': []
                    }
                ]
            });
            allCoinsModel.setData({'coins': []});

            sap.ui.getCore().getEventBus().publish('ConfigureTable', 'deselectAllCoins');

            globalModel.refresh(true);
            allCoinsModel.refresh(true);
        }
   });
});




