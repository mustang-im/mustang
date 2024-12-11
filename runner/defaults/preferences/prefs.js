// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

pref("toolkit.defaultChromeURI", "chrome://mustang/content/app.xhtml");

// Mozilla pref tweaks
pref("browser.cache.disk.enable", false);
pref("network.cookie.lifetimePolicy", 2);  // Cookie policy; 2 = allow session cookies only
//pref("network.http.connect.timeout", 20); // time until socket connect
//pref("network.http.read.timeout", 10);; // time from sending request to getting the response, or between response parts

// Development only
pref("nglayout.debug.disable_xul_cache", true); // so chrome changes do not require a restart
pref("nglayout.debug.disable_xul_fastload", true);
pref("browser.dom.window.dump.enabled", true); // start xulrunner with -console to see dump()s
pref("javascript.options.strict", true);
pref("javascript.options.showInConsole", true);
pref("extensions.venkman.enableChromeFilter", false);

// Disable cruft
pref("extensions.update.enabled", false);
pref("extensions.dss.enabled", false);
