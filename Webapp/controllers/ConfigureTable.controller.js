$.sap.require('sap.crypto.app.Utility.HighstockJsonFormatter');
$.sap.require('sap.crypto.app.Utility.Globals');
$.sap.require('sap.crypto.app.Utility.RouterGeneral');

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
        dataModeSelectorId  : 'DataModeSelector',
        logModeSelectorId   : "LogModeSelector",
        firstMatch          : true,

        onInit: function() {

            console.log('Config: init');

            /* Setup AllCoins model, which is used to display list of all coin names for batch action.
               Data will be loaded into this model via onRouteMatched. It will also be updated when selection
               events occur in the CoinSideBar view. */
            this.getView().setModel(new sap.ui.model.json.JSONModel({}), this.allCoinsModelId);

            this.setupPopover(); //Create model and data items for message info popover

            sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.onRouteMatched, this);
            sap.ui.getCore().getEventBus().subscribe('CoinSideBar', 'updateAllCoins', this.updateAllCoins, this);
        },

        onRouteMatched: function(oEvent) {

            var currDetPageName = sap.ui.getCore().byId("app").getCurrentDetailPage().sViewName.split('.').splice(-1)[0].trim();
            if (currDetPageName !== "ConfigureTable") {
                return;
            }

            console.log('Config: config route match');

            var core                = sap.ui.getCore(),
                coinToChartModel    = core.getModel(this.coinToChartModelId),
                allCoinNamesObjects = [];

            coinToChartModel.getProperty('/columns').forEach(function(coinToChartObj) {
                coinToChartObj['data'].forEach(function(coinName) {
                    allCoinNamesObjects.push({"name": coinName});
                });
            });

            this.getView().getModel(this.allCoinsModelId).setData({
                "coins": allCoinNamesObjects
            });

            if (this.firstMatch) {
                this.firstMatch = false;
                sap.m.MessageToast.show("You can drag and drop coin tiles to move them between charts", {
                    duration: 5000
                });
            }

            console.log(this.getView().getModel(this.allCoinsModelId).getJSON());

        },

        updateAllCoins: function() {

            console.log('Config: update all coins');

            this.onRouteMatched();
        },

        setDefaultChart: function(oEvent) {

            console.log('Config: set default');

            try {
                var selectChartList = sap.ui.getCore().byId(this.selectDefaultChartId),
                    newDefault = selectChartList.getSelectedItem().getText();
                GLOBALS.defaultChartId = newDefault;
                selectChartList.setPlaceholder(newDefault);
                selectChartList.setSelectedItem(null);
            } catch (err) {
                //This will catch exceptions when no item is selected. If this is the case we do nothing.
                console.log(err);
            }

            //After this we want our change to be immediate so we fire update event for table
            var table = sap.ui.getCore().byId(this.chartManagerTableId);
            table.fireUpdateFinished();
        },


        /*  This method allows users to add a new chart from the configure tables view. This adds a new entry
            into the table, updates the CoinToChart model. Upon navigation back to the detail view, the model
            will be checked and new charts will be created accordingly.  */
        addChart: function() {

            console.log('Config: add chart');

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

            console.log('Config: remove charts');

            var chartsToRemoveList  = sap.ui.getCore().byId(this.removeSelectorId),
                chartsToRemoveItems = chartsToRemoveList.getSelectedItems(),
                chartsToRemove      = [],
                globalModel         = sap.ui.getCore().getModel(this.coinToChartModelId),
                allCoinsModel       = this.getView().getModel(this.allCoinsModelId),
                allCoinNamesObjects = [],
                coinToChartObjects  = [],
                unclickCoinNames    = [],
                chartCounter        = 1;

            var chartName;

            chartsToRemoveItems.forEach(function(chartItem) {
                chartName = chartItem.getText();
                chartsToRemove.push(chartName);
                if (chartName === GLOBALS.defaultChartId) {
                    GLOBALS.defaultChartId = "Chart 1";
                }
            });

            globalModel.getProperty('/columns').forEach(function(coinToChartObj) {
                chartName = coinToChartObj['name'];
                $('#' + chartName).addClass('hideChart');
                if ($.inArray(chartName, chartsToRemove) === -1) { //returns -1 if not in array so we, keep these coins
                    var coinNames = coinToChartObj['data'];
                    coinNames.forEach(function(name) {
                        allCoinNamesObjects.push({"name": name});
                    });
                    coinToChartObjects.push({ //redo chart names since we might remove non-consecutive charts
                        'name': 'Chart ' + chartCounter,
                        'data': coinNames
                    });
                    chartCounter += 1;
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

        generateCoinCells: function(sId, oContext) {

            console.log('Config: generate table coin cells on change');

            var data = oContext.oModel.getProperty(oContext.sPath),
                coins = data['data'],
                buttons = [];

            for (var i = 0; i < coins.length; i++) {
                buttons.push(
                    new sap.m.Button({
                        text: coins[i]
                    }).addStyleClass('chartTableBtnMarker')
                );
            }

            return new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Label({
                        text : {
                            'path': GLOBALS.coinChartModelId + '>name'
                        }
                    }),
                    new sap.ui.layout.HorizontalLayout({
                        width: '100%',
                        allowWrapping: true,
                        content: buttons
                    }).addStyleClass('CoinContainerMarker')
                ]
            });
        },

        removeCoins: function() {

            console.log('Config: remove coins');

            //Get List control, get selected items, and extract text to get the names of clicked coins
            var selectCoins = sap.ui.getCore().byId(this.removeSelectorId),
                selectedOptions = selectCoins.getSelectedItems(),
                selectedCoinNames = [];

            selectedOptions.forEach(function(option) { selectedCoinNames.push(option.getText()); });

            //Now that we know which coins to remove. We get all models that need to be altered and begin this process.
            var globalModel = sap.ui.getCore().getModel(this.coinToChartModelId),
                allCoinsModel = this.getView().getModel(this.allCoinsModelId),
                allCoinNamesObjects = [],
                coinToChartObjects = [];

            globalModel.getProperty('/columns').forEach(function(coinToChartObj) {
                var chartName = coinToChartObj['name'],
                    coins = coinToChartObj['data'],
                    keepCoins = [];
                for (var i = 0; i < coins.length; i++) {
                    if ($.inArray(coins[i], selectedCoinNames) === -1) { //returns -1 if not in array so we, keep these coins
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

        moveCoinsToChart: function(coinNames, newChart) {

            console.log('Config: move coins to chart');

            var globalModel = sap.ui.getCore().getModel(this.coinToChartModelId),
                coinToChartObjects = [];

            globalModel.getProperty('/columns').forEach(function(coinToChartObj) {
                var chartName = coinToChartObj['name'],
                    coins = coinToChartObj['data'],
                    keepCoins = [];
                if (chartName === newChart) {
                    coinToChartObjects.push({
                        "name": chartName,
                        "data": coinNames.concat(coins)
                    });
                } else {
                    for (var i = 0; i < coins.length; i++) {
                        if ($.inArray(coins[i], coinNames) === -1) { //returns -1 if not in array so we keep these coins
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
            return item.bindProperty('text', GLOBALS.coinChartModelId + '>name');
        },

        switchComboBox: function(newComboId) {

            console.log('Config: switch combo box');

            var core = sap.ui.getCore(),
                currCombo = core.byId(this.removeRowId).getContent()[0];

            if (newComboId === this.coinMode) {
                //activate coin combo selector
                currCombo.bindItems(this.allCoinsModelId + '>/coins', this.getCoinTemplate());
                currCombo.setPlaceholder('Remove Coins');
            } else {
                //activate chart combo selector
                currCombo.bindItems(this.coinToChartModelId + '>/columns', this.getChartTemplate());
                currCombo.setPlaceholder('Remove Charts');
            }

            this.getView().getModel(this.allCoinsModelId).refresh(true);
            this.getView().getModel(this.coinToChartModelId).refresh(true);
        },

        removeChartOrCoin: function() {

            console.log('Config: remove chart or coin');

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

            console.log('Config: reset config');

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
        },

        setDataMode: function(oEvent) {

            console.log('Config: set data mode');

            var core            = sap.ui.getCore(),
                selector        = core.byId(this.dataModeSelectorId),
                newMode         = selector.getSelectedItem().getText(),
                dataModeModel   = core.getModel(GLOBALS.dataModeModelId) ,
                dataModeObj     = JSON.parse(dataModeModel.getJSON());

            dataModeObj.active = newMode;

            dataModeModel.setData(dataModeObj);
            dataModeModel.refresh(true);
        },

        setLogMode: function(oEvent) {

            console.log('Config: log mode for chart data');

            var core            = sap.ui.getCore(),
                selector        = core.byId(this.logModeSelectorId),
                newMode         = selector.getSelectedItem().getText(),
                logModeModel    = core.getModel(GLOBALS.logifyModelId) ,
                logModeObj      = JSON.parse(logModeModel.getJSON());

            console.log(true === newMode);

            switch (newMode) {
                case 'true':
                    logModeObj.active = true; break;
                case 'false':
                    logModeObj.active = false; break;
                default:
                    throw "Unrecognized log mode";
            }

            console.log('log mode is now ' + logModeObj.active);

            logModeModel.setData(logModeObj);
            logModeModel.refresh(true);
        },

        setupPopover: function() {

            var popoverMsgTemplate = new sap.m.MessagePopoverItem({
                type: '{type}',
                title: '{title}',
                description: '{description}'
            });

            var popoverMessages = [
                {
                    type: 'Information',
                    title: 'Set Default Chart',
                    description: 'Setting the default chart allows you to specify which of your charts coins should be added to by default'
                },
                {
                    type: 'Information',
                    title: 'Set Data Mode',
                    description: 'Setting the data mode changes the type of data you will see for your selected cryptocurrencies. Check the dropdown to see your options.'
                },
                {
                    type: 'Information',
                    title: 'Removing Items',
                    description: 'You can toggle between removing whole charts or removing a subset of the coins you have selected.'
                },
                {
                    type: 'Information',
                    title: 'Drag and Drop',
                    description: 'You can drag and drop coin tiles between charts within the table to easily manage which coins appear in which chart.'
                }
            ];

            var popover = new sap.m.MessagePopover({
                items: {
                    path: '/',
                    template: popoverMsgTemplate
                }
            });

            var popoverModel = new sap.ui.model.json.JSONModel();
            popoverModel.setData(popoverMessages);

            popover.setModel(popoverModel);

            this.infoPopover = popover;
        },

        displayPopover: function(oEvent) {
            this.infoPopover.openBy(oEvent.getSource());
        }

   });
});
