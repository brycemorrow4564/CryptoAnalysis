/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
PR.registerLangHandler(PR.createSimpleLexer([],[[PR.PR_COMMENT,/[ \t]*#[^\r\n]*/],['lang-feature.plain',/Feature:([^\r\n]*)(?:\r\n|\r|\n)/],['lang-feature.plain',/[ \t]+Scenario:([^\r\n]*)(?:\r\n|\r|\n)/],['lang-feature.plain',/[ \t][ \t]+(?:Given|When|Then|And|But)([^\r\n]*)(?:\r\n|\r|\n)/],['lang-feature.table',/[ \t][ \t]+(\|(?:[^|]*\|)+)[^\r\n]*(?:\r\n|\r|\n)/],[PR.PR_COMMENT,/[ \t][ \t]+[^\r\n]*(?:\r\n|\r|\n)/],[PR.PR_KEYWORD,/Feature:|Scenario:|Given|When|Then|And|But/],[PR.PR_TAG,/@\w+/],[PR.PR_PLAIN,/[^\r\n]*(?:\r\n|\r|\n)/]]),['feature']);PR.registerLangHandler(PR.createSimpleLexer([],[[PR.PR_PLAIN,/[\s\S]*/]]),['feature.plain']);PR.registerLangHandler(PR.createSimpleLexer([],[[PR.PR_PUNCTUATION,/\|/,null,'|'],[PR.PR_LITERAL,/[^|]*/]]),['feature.table']);
