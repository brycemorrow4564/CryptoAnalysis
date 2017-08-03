sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
   "use strict";
   return UIComponent.extend("sap.crypto.app.Component", {
        metadata : {
            manifest: "json"
	    },
        init : function () {

            UIComponent.prototype.init.apply(this, arguments);
            var oRouter = this.getRouter();
            oRouter.register('router'); //name router for easy access
            oRouter.initialize();

            var i18nModel = new ResourceModel({
                bundleName : "sap.crypto.app.i18n.i18n"
            });
            this.setModel(i18nModel, "i18n");
      }
   });
});