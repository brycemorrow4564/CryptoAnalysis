$.sap.require('sap.crypto.app.Utility.GenerateCustomHeader');
$.sap.require('sap.crypto.app.Utility.RouterGeneral');

sap.ui.jsview("sap.crypto.app.views.CoinCorrelation", {

    getControllerName: function() {
        return "sap.crypto.app.controllers.CoinCorrelation";
    },

    createContent: function(oController) {

        var correlationMatrixHolder = new sap.ui.core.HTML({
            content: '<div id="correlation-matrix-holder"></div>'
        });

        var page =  new sap.m.Page({
            customHeader: CUSTOM_HEADER_GENERATOR.getCustomHeader(oController.getView()),
            content: [
                correlationMatrixHolder
            ]
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