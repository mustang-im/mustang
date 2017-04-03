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
  this._url = "locale/" + getLocale() + "/" + path;
  if (path.indexOf(".") == -1) {
    this._url += ".properties"; // default file extension
  }
}

StringBundle.prototype = {
  /**
   * the URL of the string bundle
   * @type String
   */
  _url: null,

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
    var fileContent = StringBundleUtils.readURLasUTF8(this._url);
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



/**
 * Utility function that gets all elements that have a
 * translate="" atttribute, uses it as stringbundle key,
 * gets the corresponding string from the |stringbundle|,
 * and sets the element content textnode to that string.
 *
 * Use it like this:
 * JS: var gFooBundle = new StringBundle("email/foo.properties");
 *     translateElements(document, gFooBundle, {"brand": brandName });
 * HTML: <a translate="resetpassword.label"
 *     translate-attr="title=resetpassword.tooltip" />
 * takes the stringbundle value for "password.label", replaces placeholder
 * %brand% with brandName, and inserts a text node as child of the <label>.
 * Similarly, translate-attr would takes the stringbundle text for
 * "resetpassword" and set it as value for attribute tooltip, e.g. ends up as
 * <a title="Get a new password by email">Reset password</a>
 *
 * @param container {DOMElement}   Iterators over this element
 * @param stringbundle {StringBundle}
 * @param brand {String} brand to use for substitution in strings
 */
function translateElements(container, stringbundle, placeholders) {
  [].forEach.call(container.querySelectorAll("*[translate]"), function(el) {
    var label = stringbundle.get(el.getAttribute("translate"));
    for (var placeholder in placeholders) {
      label = label.replace("%" + placeholder + "%", placeholders[placeholder]);
    }
    el.appendChild(document.createTextNode(label));
  });

  [].forEach.call(container.querySelectorAll("*[translate-attr]"), function(el) {
    el.getAttribute("translate-attr").split(",").forEach(function(attrNameValue) {
      var attrSplit = attrNameValue.split("=");
      var attrName = attrSplit[0].trim();
      var attrValue = attrSplit[1].trim();
      var label = stringbundle.get(attrValue);
      for (var placeholder in placeholders) {
        label = label.replace("%" + placeholder + "%", placeholders[placeholder]);
      }
      el.setAttribute(attrName, label);
    });
  });
}


/**
 * 3-way plural form for 0, 1 and >1. Picks the corresponding UI string.
 * Also replaces %COUNT% with the number.
 *
 * @param count {Integer}
 * @param str {String} a;b;c
 * @return {String}
 *   if count = 0, use a
 *   if count = 1, use b
 *   if count > 1, use c
 */
function pluralform(count, str) {
  var sp = str.split(";");
  StringBundleUtils.assert(sp.length == 3, "pluralform: expected 3 parts in str: " + str);
  var index;
  if (count == 0)
    index = 0;
  else if (count == 1)
    index = 1;
  else
    index = 2;
  return sp[index].replace("%COUNT%", count);
}

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
function getLocale() {
  // Which translations you have for your app
  // TODO CONFIGURE THIS
  var supportedLanguages = [ "en", "de" ];

  // Which language to use when the browser has a lang you do not support
  var fallbackLanguage = "en";
  var browserLanguage = window.navigator.language.substr(0, 2)
  return supportedLanguages.filter(function(lang) {
      return lang == browserLanguage;
    })[0] || fallbackLanguage;
}

var StringBundleUtils = {
  /**
  * Reads UTF8 data from a URL.
  *
  * @param url {String}   what you want to read
  * @return {String}   the contents of the file, as one long string
  */
  readURLasUTF8 : function (url) {
    StringBundleUtils.assert(url && typeof(url) == "string", "uri must be a string");
    var req = new XMLHttpRequest();
    console.log("trying to open " + url);
    req.onerror = function (e) { console.error(e); }
    req.onload = function () {}
    req.open("GET", url, false); // sync
    req.send(); // blocks
    return req.responseText;
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

  assert : function (test, errorMsg)
  {
    console.assert(test, errorMsg);
    if (!test)
      throw new Error(errorMsg ? errorMsg : "Bug: assertion failed");
  },
}
