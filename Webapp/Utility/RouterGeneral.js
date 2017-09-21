ROUTER = {

    buttonRoutePatternMap: {
        "Charts":           "CoinDetail",
        "Configuration":    "ConfigureTable",
        "API":              "API"
    },

    handleNavigation: function(jqueryObj) {

        var buttonText = jqueryObj.context.innerText.trim(),
            navPattern = this.buttonRoutePatternMap[buttonText];

        var currDetPageName = sap.ui.getCore().byId("app").getCurrentDetailPage().sViewName.split('.').splice(-1)[0].trim();
        if (currDetPageName === navPattern) {
            return;
        }
        console.log("HANDLING NAV FOR " + navPattern);

        sap.ui.core.routing.Router.getRouter("router").navTo(navPattern);
    },

    setupHeaderRouting: function() {
        var self = this;
        $('.header-button').click(function() {
            self.handleNavigation($(this));
        });
    }

}