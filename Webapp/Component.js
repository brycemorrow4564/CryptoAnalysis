sap.ui.define([
   "sap/ui/core/UIComponent"
], function (UIComponent) {
   "use strict";
   return UIComponent.extend("sap.crypto.app.Component", {
        metadata : {
            manifest: "json",
            rootView: {
              "viewName": "sap.crypto.app.views.App",
              "type": "JS"
            }
	    },
        init : function () {

            $.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-core');
            $.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-widget');
            $.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-mouse');
            $.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-droppable');
            $.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-draggable');

            UIComponent.prototype.init.apply(this, arguments);
            var oRouter = this.getRouter();
            oRouter.register('router');
            oRouter.initialize();

      }
   });
});