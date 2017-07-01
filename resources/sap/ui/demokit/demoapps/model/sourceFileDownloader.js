/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var c={};return function(u){return new Promise(function(r){var s=function(a){c[u]=a;r(a);};var e=function(){r({errorMessage:"FIle not found: '"+u+"'"});};if(!(u in c)){q.ajax(u,{dataType:"text",success:s,error:e});}else{r(c[u]);}});};});
