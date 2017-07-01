/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/UIComponent","sap/ui/model/json/JSONModel"],function(C,U,J){"use strict";return C.extend("sap.ui.demokit.explored.view.notFound",{onInit:function(){this.router=U.getRouterFor(this);this.router.attachRoutePatternMatched(this.onRouteMatched,this);this.getView().addEventDelegate(this);this.getView().setModel(new J({entityName:""}));},onRouteMatched:function(e){if(e.getParameter("name")!=="notFound"){return;}var p=e.getParameter("arguments")["all*"];this.getView().getModel().setProperty("/entityName",p);},onBeforeShow:function(e){if(e.data.path){this.getView().getModel().setProperty("/entityName",e.data.path);}},onNavBack:function(){this.router.myNavBack("home",{});}});});
