$.sap.require('sap.crypto.app.Utility.GenerateCustomHeader');
$.sap.require('sap.crypto.app.Utility.RouterGeneral');

sap.ui.jsview("sap.crypto.app.views.CoinCorrelation", {

    getControllerName: function() {
        return "sap.crypto.app.controllers.CoinCorrelation";
    },

    createContent: function(oController) {

        var page =  new sap.m.Page({
            id: oController.pageId,
            customHeader: CUSTOM_HEADER_GENERATOR.getCustomHeader(oController.getView()),
            content: []
        });

        page.onAfterRendering = function(evt) {
            if (sap.m.Page.prototype.onAfterRendering) { //apply any default behavior so we don't override essential things
                sap.m.Page.prototype.onAfterRendering.apply(this);
            }
            ROUTER.setupHeaderRouting();
        };

        return page;
    }

});