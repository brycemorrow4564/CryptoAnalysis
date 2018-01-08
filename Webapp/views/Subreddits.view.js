$.sap.require('sap.crypto.app.Utility.GenerateCustomHeader');
$.sap.require('sap.crypto.app.Utility.RouterGeneral');
$.sap.require('sap.crypto.app.Utility.Globals');

sap.ui.jsview("sap.crypto.app.views.Subreddits", {

    getControllerName: function() {
        return "sap.crypto.app.controllers.Subreddits";
    },

    createContent: function(oController) {

        var template = new sap.ui.core.ListItem({
                text: '{' + GLOBALS.subredditModelId + '>subreddit_name}'
            }),
            subredditSelector = new sap.m.MultiComboBox({
                id: oController.subredditSelectorId,
                width: "100%",
                selectionChange: function(oEvent) {
                    oController.displaySubredditData(oEvent);
                }
            }).bindItems(GLOBALS.subredditModelId + '>/subreddits', template),
            chartHtml = new sap.ui.core.HTML({
                content: '<div id="SubredditGraph"></div>'
            });

        var page =  new sap.m.Page({
            customHeader: CUSTOM_HEADER_GENERATOR.getCustomHeader(oController.getView()),
            content: [
                subredditSelector, chartHtml
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