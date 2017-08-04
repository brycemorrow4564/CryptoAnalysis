ROUTER = {

    buttonRoutePatternMap: {
        "Charts":           "CoinDetail",
        "Configuration":    "ConfigureTable",
        "About":            "About"
    },

    handleNavigation: function(jqueryObj) {

        var buttonText = jqueryObj.context.innerText.trim(),
            navPattern = this.buttonRoutePatternMap[buttonText];

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