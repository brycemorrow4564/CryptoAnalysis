$.sap.require('sap.crypto.app.Utility.Globals');
$.sap.require('sap.crypto.app.Utility.HighstockJsonFormatter');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.Subreddits", {

        subredditSelectorId: "SubredditSelectorBox",
        firstVisit: true,

        onInit: function() {
            console.log('Initiate subreddits view');
            sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.onRouteMatched, this);

            if (this.firstVisit) {
                this.firstVisit = false;
                $.ajax({
                    url: '/top_15_subreddits_by_growth/',
                    success: function(response) {
                        HIGHSTOCK_JSON_FORMATTER.processAndPlotTopFifteenSubreddits(response)
                    }
                });
            }
        },

        onRouteMatched: function() {

            var currDetPageName = sap.ui.getCore().byId("app").getCurrentDetailPage().sViewName.split('.').splice(-1)[0].trim();
            if (currDetPageName !== "Subreddits") {
                return;
            }
        },

        plotData: function(selectedSubredditNames) {

            var core = sap.ui.getCore(),
                model = core.getModel(GLOBALS.subredditModelId),
                data = model.getData()['subreddits'];

            HIGHSTOCK_JSON_FORMATTER.processAndPlotSubredditData(selectedSubredditNames, data);
        },

        displaySubredditData: function(oEvent) {
            var core = sap.ui.getCore(),
                controller = this,
                selector = core.byId(this.subredditSelectorId),
                selectedItems = selector.getSelectedItems(),
                selectedItems = selectedItems.map(function(elem) {
                    return elem.mProperties.text;
                }),
                model = core.getModel(GLOBALS.subredditModelId),
                data = model.getData()['subreddits'],
                requestSubreddit = -1; //fill with url we wish to request from. We only ever need to request from 1 url

            data.forEach(function(elem) {
                if (elem.hasOwnProperty('data') || $.inArray(elem.subreddit_name, selectedItems) === -1) {
                    //1. this element already had it's data loaded in so do nothing
                    //2. element is not currently selected so we ignore it
                } else {
                    //we need to queue up this url to request data from
                    requestSubreddit = elem.subreddit_name;
                }
            });

            //if there are requests to be made, we show busy dialog while requesting data
            var busyDialog = sap.ui.jsfragment('sap.crypto.app.views.fragments.BusyDialog'),
                makingRequests = false;

            if (requestSubreddit !== -1) {
                makingRequests = true;
                $.sap.syncStyleClass('sapUiSizeCompact', this.getView(), busyDialog);
                busyDialog.open();
            }

            $.when(
                $.ajax({
                    url: "subreddits/" + requestSubreddit
                })
            ).done(function(response) {
                var currSubreddit = response['name'];
                for (var x = 0; x < data.length; x++) {
                    if (data[x].subreddit_name === currSubreddit) {
                        data[x] = {
                            "subreddit_name": currSubreddit,
                            "data": response
                        };
                        break;
                    }
                }
                model.setData({
                    "subreddits": data
                });
                model.refresh(true);
                busyDialog.close();

                controller.plotData(selectedItems);
            });

            if (!makingRequests) {
                controller.plotData(selectedItems);
            }

        }

   });
});