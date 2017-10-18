$.sap.require("sap.m.BusyDialog");

sap.ui.jsfragment('sap.crypto.app.views.fragments.BusyDialog', {

    createContent: function(oController) {
        return new sap.m.BusyDialog({
            title: 'Querying Server'
        });
    }

});