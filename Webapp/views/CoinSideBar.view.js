$.sap.require("sap.crypto.app.Utility.ComponentGlobals")

sap.ui.jsview("sap.crypto.app.views.CoinSideBar", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.CoinSideBar";
   },

   createContent: function(oController) {

        var searchBar = new COMPONENT.SearchField({
            items: "{" + GLOBALS.aggCoinModelId + ">/Coins}",
            placeholder: 'Search Coins',
            liveChange: function(evt) {oController.onLiveChange(evt); },
            mode: 'MultiSelect',
            includeItemInSelection: true
        });

        //Create option to toggle sorter functions based on input from user (price, marketcap, alphabetical, etc.)

        var mcSorter = new sap.ui.model.Sorter('data', null); //sorts items by market cap valuation

        mcSorter.fnCompare = function(a, b) {
            try {
                aVal = a[0]['MarketCap'];
                bVal = b[0]['MarketCap'];
                return aVal > bVal ? -1 : aVal == bVal ? 0 : 1;
            } catch (err) {
                return -1;
            }
        };

        var templateItem = new COMPONENT.StandardListItem({
           title: '{' + GLOBALS.aggCoinModelId + '>name}',
           type: 'Active',
           tap: function(oEvent) { oController.listItemClick(oEvent); }
        });

        var coinList = new COMPONENT.List({
            id: oController.coinListId,
            title: 'Current',
            mode: sap.m.ListMode.MultiSelect,
            selectionChange: function(evt) { oController.checkBoxClick(evt); }
        }).bindItems({
            path: GLOBALS.aggCoinModelId + ">/Coins",
            sorter : mcSorter,
            template: templateItem
        });

        coinList.onAfterRendering =

            function(evt) {
                var listControl = sap.ui.getCore().byId(oController.coinListId);
                $("#" + listControl.sId).addClass('CoinListStyle');
        };

        //only do right side border, top will be handled at page level.
        var page = new COMPONENT.Page({
            id: oController.pageId,
            customHeader: new COMPONENT.Toolbar({
                content: [
                    searchBar
                ]
            }),
            content: [
                coinList
            ]
        });

        return page;
   }

});