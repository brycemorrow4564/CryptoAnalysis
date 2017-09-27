/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";return{crossLink:function(l){if(l[0]==="#"){l=document.location.href.substring(0,document.location.href.search("demoapps\.html"))+l;}return l;},libraryLink:function(n){if(n&&n.search("sap\\.")===0){return this.formatter.crossLink("#docs/api/symbols/"+n+".html");}else{return"";}},libraryLinkEnabled:function(n){return!!this.formatter.libraryLink.bind(this)(n);},categoryName:function(c){var r=this.getView().getModel("i18n").getResourceBundle();return r.getText("demoAppCategory"+c);}};});
