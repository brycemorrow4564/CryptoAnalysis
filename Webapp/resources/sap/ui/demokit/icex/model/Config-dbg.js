/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['sap/ui/Device'], function(Device) {
	"use strict";

	return {
		getPageSize: function() {

			// Lacking the capability to detect the rendering performance
			// of the device we assume that "desktop devices"
			// are 5 times faster than "mobile" devices.
			return (Device.system.desktop) ? 250 : 50;
		}
	};
});
