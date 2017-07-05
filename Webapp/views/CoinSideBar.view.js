jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals")

sap.ui.jsview("sap.crypto.app.views.CoinSideBar", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.CoinSideBar";
   },

   createContent: function(oController) {

        var mcSorter = new sap.ui.model.Sorter('priceHistory', null); //sorts items by market cap valuation

        mcSorter.fnCompare = function(a, b) {
            aVal = a[0]['Market Cap'];
            bVal = b[0]['Market Cap'];
            return aVal > bVal ? -1 : aVal == bVal ? 0 : 1;
        };

        var templateItem = new COMPONENT.StandardListItem({
           title: '{name}'
        });

        var coinList = new COMPONENT.List({
            id: oController.coinListId,
            mode: sap.m.ListMode.MultiSelect,
            selectionChange: function(evt) { oController.selectionChange(evt) }
//            updateFinished : function(evt) {
//                //selects first item by default
//                var firstItem = this.getItems()[0];
//                this.setSelectedItem(firstItem, true);
//                oController.selectionChange(evt);
//            }
        }).bindItems({
            path: "/Coins",
            sorter : mcSorter,
            template: templateItem
        });

        return new COMPONENT.Page({
            content: [
                coinList
            ]
        });
   }

});