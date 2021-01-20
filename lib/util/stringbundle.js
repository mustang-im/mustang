/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is String Bundle.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Myk Melez <myk@mozilla.org> (API)
 *   Ben Bucksch <ben.bucksch  beonex> <http://business.beonex.com>
 *       (HTML5 implementation based on sync XHR)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


// Which translations you have for your app
// CONFIGURE THIS
var supportedLanguages = [ "en-US" ];
var fallbackLanguage = "en-US";


/**
 * A string bundle, for loading translations of UI strings.
 *
 * To use this module, import it, create a new instance of StringBundle,
 * and then use the instance's |get| and |getAll| methods to retrieve strings
 * (you can get both plain and formatted strings with |get|):
 *
 *   var strings = new StringBundle("email/login");
 *   var foo = strings.get("prompt");
 *   var barFormatted = strings.get("welcome", [arg1, arg2]);
 *   strings.getAll().forEach(function(string) {
 *     dump (string.key + " = " + string.value + "\n");
 *   });
 *
 * @param path {String}
 *        the filename of the string bundle, in your addon's locale/<lang>/ directory
 *        with or without .properties siffix
 *        e.g. "email/login" loads locale/en/email/login.properties
 *
 * You MUST also configure |supportedLanguages| below.
 */
function StringBundle(path) {
  this._filename = "locale/" + StringBundleUtils.getLocale() + "/" + path;
  if (path.indexOf(".") == -1) {
    this._filename += ".properties"; // default file extension
  }
}

StringBundle.prototype = {
  /**
   * the path of the string bundle
   * @type String
   */
  _filename: null,

  /**
   * { map property ID {String} -> translation {String} }
   */
  _properties : null,

  /**
   * Read the string bundle from disk.
   * Only if necessary.
   */
  _ensureLoaded : function() {
    if (this._properties)
      return;
    var fileContent = StringBundleUtils.readURLasUTF8(this._filename);
    this._properties = {};
    //console.log(this._url + ": " + fileContent);
    var spLines = StringBundleUtils.splitLines(fileContent);
    for (var i in spLines) {
      var line = spLines[i].trim();
      if (line[0] == "#") // comment
        continue;
      var sp = line.split("=", 2);
      if (sp.length < 2)
        continue;
      var id = sp[0].trim();
      var translation = sp[1].trim();
      this._properties[id] = translation;
    }
    //console.dir(this._properties);
  },

  _get: function(key) {
    try {
      this._ensureLoaded();
    } catch (e) {
      //console.error("Could not get stringbundle <" + this._url +
      //    ">, error: " + e);
      throw e;
    }
    if (this._properties[key] === undefined) {
      var msg = "Could not get key " + key + " from stringbundle <" +
          this._url + ">";
      //console.error(msg);
      throw msg;
    }

    return this._properties[key];
  },

  /**
   * Get a string from the bundle.
   *
   * @param key {String}
   *        the identifier of the string to get
   * @param args {array} [optional]
   *        an array of arguments that replace occurrences of %S in the string
   *
   * @returns {String} the value of the string
   */
  get: function(key, args) {
    if (args)
      return this.getFormattedString(key, args);
    else
      return this._get(key);
  },

  /**
   * Get a string from the bundle.
   * @deprecated use |get| instead
   *
   * @param key {String}
   *        the identifier of the string to get
   *
   * @returns {String}
   *          the value of the string
   */
  getString: function(key) {
    return this._get(key);
  },

  /**
   * Get a formatted string from the bundle.
   * @deprecated use |get| instead
   *
   * @param key {string}
   *        the identifier of the string to get
   * @param args {array}
   *        an array of arguments that replace occurrences of %S in the string
   *
   * @returns {String}
   *          the formatted value of the string
   */
  getFormattedString: function(key, args) {
    var result = this._get(key);
    if (result.indexOf("%1$S") > -1) {
      for (var i = 0; i < args.length; i++)
        result = result.replace("%" + (i+1) + "$S", args[i]);
    } else { // Just simple %S
      for (var i in args) {
        result = result.replace("%S", args[i]);
      }
    }
    return result;
  },

  /**
   * Get all the strings in the bundle.
   *
   * @returns {Array}
   *          an array of objects with key and value properties
   */
  getAll: function() {
    this._ensureLoaded();
    var strings = [];
    for (var i in this._properties) {
      var id = this._properties[i];
      strings.push({ key: id, value: this._properties[id] });
    }
    return strings;
  },
  
}



var StringBundleUtils = {
  /**
   * Reads UTF8 data from a URL.
   *
   * @param filename {String}   what you want to read
   * @return {String}   the contents of the file, as one long string
   */
  readURLasUTF8 : function (filename) {
    StringBundleUtils.assert(filename && typeof(filename) == "string", "uri must be a string");
    StringBundleUtils.assert(filename.substr(5) != "http:", "cannot load stringbundles from network in Node");
    if (typeof(window) == "object" && "navigator" in window) { // browser
      let req = new XMLHttpRequest();
      req.onerror =e => console.error(e);
      //console.log(__dirname, filename);
      req.open("GET", __dirname + "/../../lib/" + filename, false); // sync
      req.overrideMimeType("text/plain");
      req.send(); // blocks
      return req.responseText;
    } else { // node.js
      let fs = require("fs");
      return fs.readFileSync(__dirname + "/../" + filename, "utf8");
    }
  },

  /**
   * Takes a string (which is typically the content of a file,
   * e.g. the result returned from readURLUTF8() ), and splits
   * it into lines, and returns an array with one string per line
   *
   * Linebreaks are not contained in the result,,
   * and all of \r\n, (Windows) \r (Mac) and \n (Unix) counts as linebreak.
   *
   * @param content {String} one long string with the whole file
   * @return {Array of String} one string per line (no linebreaks)
   */
  splitLines : function(content) {
    content = content.replace("\r\n", "\n");
    content = content.replace("\r", "\n");
    return content.split("\n");
  },

  assert : function (test, errorMsg) {
    console.assert(test, errorMsg);
    if (!test)
      throw new Error(errorMsg ? errorMsg : "Bug: assertion failed");
  },

  /**
   * Get the language of the browser, as sent to webpages.
   * Only the locales for which our ext has translations.
   *
   * You need to configure |supportedLanguages| with the languages
   * for which you have translations for your app.
   *
   * @returns {String} e.g. "en"
   * @see also getUILocale()
   */
  getLocale: function() {
    if (typeof(window) == "object" && "navigator" in window) { // browser
      // Which language to use when the browser has a lang you do not support
      let browserLanguage = window.navigator.language.substr(0, 2);
      return supportedLanguages.filter(function(lang) {
          return lang == browserLanguage;
        })[0] || fallbackLanguage;
    } else { // node.js
      let i18n = require("i18n");
      i18n.configure({
        locales : supportedLanguages,
        defaultLocale : fallbackLanguage,
      });
      return i18n.getLocale();
    }
  },
}

exports.StringBundle = StringBundle;
