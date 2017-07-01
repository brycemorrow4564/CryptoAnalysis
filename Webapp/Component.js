sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
   "use strict";
   return UIComponent.extend("sap.crypto.app.Component", {
        metadata : {
		    rootView: {
		        viewName: "sap.crypto.app.views.App",
		        type: 'JS'
		    }
	    },
        init : function () {
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);
            // set i18n model
            var i18nModel = new ResourceModel({
                bundleName : "sap.crypto.app.i18n.i18n"
            });
            this.setModel(i18nModel, "i18n");
      }
   });
});