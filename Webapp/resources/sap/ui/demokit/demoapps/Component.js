/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/UIComponent','sap/ui/model/json/JSONModel','sap/ui/demokit/demoapps/model/libraryData'],function(U,J,l){"use strict";return U.extend("sap.ui.demokit.demoapps.Component",{metadata:{manifest:"json"},init:function(){U.prototype.init.apply(this,arguments);var m=new J();l.fillJSONModel(m);this.setModel(m);}});});
