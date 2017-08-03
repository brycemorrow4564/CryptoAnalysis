jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");
$.sap.require('sap.crypto.app.Utility.GenerateCustomHeader');
$.sap.require('sap.crypto.app.Utility.RouterGeneral');

sap.ui.jsview("sap.crypto.app.views.About", {

    getControllerName: function() {
        return "sap.crypto.app.controllers.About";
    },

    createContent: function(oController) {

        var page =  new COMPONENT.Page({
            customHeader: CUSTOM_HEADER_GENERATOR.getCustomHeader(oController.getView()),
            content: [
                new COMPONENT.HTML({
                    content: ''
                })
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