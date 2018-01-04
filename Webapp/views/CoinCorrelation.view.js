sap.ui.jsview("sap.crypto.app.views.CoinCorrelation", {

    getControllerName: function() {
        return "sap.crypto.app.controllers.CoinCorrelation";
    },

    createContent: function(oController) {

        var page =  new sap.m.Page({
            customHeader: CUSTOM_HEADER_GENERATOR.getCustomHeader(oController.getView())
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