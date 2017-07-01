/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.strings'],function(q){"use strict";function d(t,a){return"<code>"+(a||t)+"</code>";}function f(s,o){o=o||{};var b=o.beforeParagraph==null?'<p>':o.beforeParagraph;var a=o.afterParagraph==null?'</p>':o.afterParagraph;var c=o.beforeFirstParagraph==null?b:o.beforeFirstParagraph;var e=o.afterLastParagraph==null?a:o.afterLastParagraph;var l=typeof o.linkFormatter==='function'?o.linkFormatter:d;var r=/(<pre>)|(<\/pre>)|(<h[\d+]>)|(<\/h[\d+]>)|\{@link\s+([^}\s]+)(?:\s+([^\}]*))?\}|((?:\r\n|\r|\n)[ \t]*(?:\r\n|\r|\n))/gi;var i=false;s=s||'';l=l||d;s=c+s.replace(r,function(m,p,g,h,j,k,n,t){if(p){i=true;}else if(g){i=false;}else if(h){if(!i){return a+m;}}else if(j){if(!i){return m+b;}}else if(t){if(!i){return a+b;}}else if(k){if(!i){return l(k,n);}}return m;})+e;s=s.replace(new RegExp(q.sap.escapeRegExp(b)+"\s*"+q.sap.escapeRegExp(a),"g"),"");return s;}return{formatTextBlock:f};});
