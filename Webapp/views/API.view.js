$.sap.require("sap.crypto.app.Utility.ComponentGlobals");
$.sap.require('sap.crypto.app.Utility.GenerateCustomHeader');
$.sap.require('sap.crypto.app.Utility.RouterGeneral');

sap.ui.jsview("sap.crypto.app.views.API", {

    getControllerName: function() {
        return "sap.crypto.app.controllers.API";
    },

    createContent: function(oController) {

        var apiList = new sap.m.List({
            id: oController.apiListId,
            headerText: "API Calls"
        }).bindItems({
             path: oController.apiModelId + ">/API_functions",
             template: new sap.m.DisplayListItem({
                "label": "{" + oController.apiModelId + ">url}",
                "value": "{" + oController.apiModelId + ">data}"
             })
        });

        var donateList = new sap.m.List({
            id: oController.donateListId,
            headerText: "Donate Links"
        }).bindItems({
            path: oController.donateModelId + ">/DonateKeys",
            template: new sap.m.DisplayListItem({
                "label": "{" + oController.donateModelId + ">currency}",
                "value": "{" + oController.donateModelId + ">address}"
            })
        });

        var layout = new sap.ui.layout.VerticalLayout({
            id: 'LayoutWrapper',
            width: "90%",
            content: [
                apiList,
                donateList
            ]
        })

        var page =  new sap.m.Page({
            customHeader: CUSTOM_HEADER_GENERATOR.getCustomHeader(oController.getView()),
            content: [
                layout
            ]
        });

        page.onAfterRendering = function(evt) {
            if (sap.m.Page.prototype.onAfterRendering) { //apply any default behavior so we don't override essential things
                sap.m.Page.prototype.onAfterRendering.apply(this);
            }
            ROUTER.setupHeaderRouting();

            //On click of donate links we activate page overlay and bitcoin QR code
            $('#DonateList li').on('click', function(oEvent) {

            });

            var topOffset = $('.sapMPageHeader').height() - 3; //Border width is 2px so subtract
            $('.header-bottom-border').css('top', topOffset);
        };

        return page;
    }

});