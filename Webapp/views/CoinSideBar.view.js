jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals")

sap.ui.jsview("sap.crypto.app.views.CoinSideBar", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.CoinSideBar";
   },

   createContent: function(oController) {

        var searchBar = new COMPONENT.SearchField({
            items: "{/Coins}",
            placeholder: 'Search Coins',
            liveChange: function(evt) {oController.onLiveChange(evt); },
            mode: 'MultiSelect',
            includeItemInSelection: true
        });

        //Create option to toggle sorter functions based on input from user (price, marketcap, alphabetical, etc.)

        var mcSorter = new sap.ui.model.Sorter('priceHistory', null); //sorts items by market cap valuation

        mcSorter.fnCompare = function(a, b) {
            aVal = a[0]['Market Cap'];
            bVal = b[0]['Market Cap'];
            return aVal > bVal ? -1 : aVal == bVal ? 0 : 1;
        };

        var templateItem = new COMPONENT.StandardListItem({
           title: '{name}',
           type: 'Active',
           tap: function(oEvent) { oController.listItemClick(oEvent); }
        });

        var coinList = new COMPONENT.List({
            id: oController.coinListId,
            title: 'Current',
            mode: sap.m.ListMode.MultiSelect,
            selectionChange: function(evt) { oController.checkBoxClick(evt); }
        }).bindItems({
            path: "/Coins",
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

//        page.onAfterRendering =
//
//            function(evt) {
//                if (sap.m.Page.prototype.onAfterRendering) { //apply any default behavior so we don't override essential things
//                    sap.m.Page.prototype.onAfterRendering.apply(this);
//                }
//                $('#app-Master').resi
//            };


        return page;
   }

});