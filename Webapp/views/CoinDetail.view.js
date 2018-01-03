$.sap.require('sap.crypto.app.Utility.GenerateCustomHeader');
$.sap.require('sap.crypto.app.Utility.RouterGeneral');

sap.ui.jsview("sap.crypto.app.views.CoinDetail", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.CoinDetail";
   },

   createContent: function(oController) {

        var noContentFormat = new sap.m.Title({
            id: oController.noContentMsgId,
            text: 'Add coins from sidebar to see graphs',
        }).addStyleClass('noContentTitle'),

            htmlStr = '';

        //Create divs for plotting all possible charts. Class included for easy jQuery access later on.
        for (var i = 1; i <= oController.maxNumCharts; i++) {
            htmlStr += "<div id='Chart " + i + "' class='CHARTDIV'></div>";
        }

        var html = new sap.ui.core.HTML({
            content: htmlStr
        });

        var page = new sap.m.Page({
            id: oController.detailPageId,
            customHeader: CUSTOM_HEADER_GENERATOR.getCustomHeader(oController.getView()),
            content: [
                noContentFormat,
                html
            ]
        });

        page.onAfterRendering = function(evt) {
            if (sap.m.Page.prototype.onAfterRendering) { //apply any default behavior so we don't override essential things
                sap.m.Page.prototype.onAfterRendering.apply(this);
            }
            //Hide all plotting charts as we have no data to plot
            $('.CHARTDIV').addClass('hideChart');

            ROUTER.setupHeaderRouting();
        };

        return page;
   }

});