$.sap.require('sap.crypto.app.Utility.RouterGeneral');

CUSTOM_HEADER_GENERATOR = {

    //Generate custom control header used on About, CoinDetail, and Configuration Pages
    customHeader: function(targetBtnText) {

        var htmlStr = '',
            btnTexts = ['Charts', 'Configuration', 'About'];

        btnTexts.forEach(function(label) {
            if (label === targetBtnText) {
                htmlStr += '<button class="header-button"><span class="active-header-text">' + label +
                           '</span><div class="header-tab active-header-tab"></div></div></button>'
            } else {
                htmlStr += '<button class="header-button"><span>' + label +
                           '</span><div class="header-tab"></div></div></button>'
            }
        });

        htmlStr += '<div class="header-bottom-border"></div>'

        return new COMPONENT.Toolbar({
            content: [
                new COMPONENT.ToolbarSpacer(),
                new COMPONENT.HTML({
                    content: htmlStr
                })
            ]
        });

    },

    viewNameToButtonText: {
        "About": "About",
        "CoinDetail": "Charts",
        "ConfigureTable": "Configuration"
    },

    getCustomHeader: function(view) {
        var viewName = view.sViewName.split(".").splice(-1)[0].trim(),
            targetBtnText = this.viewNameToButtonText[viewName];
        return this.customHeader(targetBtnText);
    }

}