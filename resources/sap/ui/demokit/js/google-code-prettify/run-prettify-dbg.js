/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
(function() {

	/*global document,prettyPrint */

	function prettify() {
		if ( typeof prettyPrint === 'function' ) {
			prettyPrint();
		}
	}

	function onLoaded() {
		document.removeEventListener( "DOMContentLoaded", onLoaded, false );
		prettify();
	}

	if ( document.readyState === 'complete' ) {
		prettify();
	} else {
		document.addEventListener( "DOMContentLoaded", onLoaded, false );
	}

}());