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
 * The Original Code is Preferences.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Myk Melez <myk@mozilla.org> (API)
 *   Ben Bucksch <ben.bucksch  beonex> <http://business.beonex.com>
 *       (HTML5 implementation based on localStorage)
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
 * This implements a way to store user preferences, settings, configuration.
 * It stores strings, integers and booleans.
 * Pref keys are organized in a hierarchy called branches, separated by dots,
 * e.g. "email.login.username" = "ben" (string)
 * It closely matches the Firefox preferences that you can see in <about:config>.
 *
 * Use it like:
 * var loginPrefs = myPrefs("email.login.") // mind the trailing dot
 * loginPrefs.set("username", "ben");
 * var useSSL = loginPrefs.get("ssl", true); // default true
 *
 * You can also observe whole pref branches for changes, which allows
 * you to update your UI everywhere automatically
 * (subject/observer design pattern).
 */


/**
 * A cache of pref observers.
 *
 * We use this to remove observers when a caller calls Preferences::ignore.
 *
 * All Preferences instances share this object, because we want callers to be
 * able to remove an observer using a different Preferences object than the one
 * with which they added it.  That means we have to identify the observers
 * in this object by their complete pref name, not just their name relative to
 * the root branch of the Preferences object with which they were created.
 *
 * {Array of {
 *   prefName {String}
 *   callback {function()}
 *   thisObject {Object}
 * } }
 */
var gPrefObservers = [];

function Preferences(branch) {
  this._prefBranch = branch;
}
Preferences.prototype = {
  /**
   * The branch of the preferences tree to which this instance provides access.
   * @private
   */
  _prefBranch : "",

  _getPref : function(prefName) {
    return this._getPrefFromLocalStorage("prefs." + this._prefBranch + prefName);
  },
  _getDefaultPref : function(prefName) {
    return this._getPrefFromLocalStorage("defaultPrefs." + this._prefBranch + prefName);
  },
  /**
   * Use the stored DType to return a value of the correct type,
   * given that localStorage stores only strings.
   */
  _getPrefFromLocalStorage : function(id) {
    var value = localStorage[id];
    var datatype = localStorage[id + ".DType"];
    //debug("pref " + id + " [" + datatype + "] has value " + value + " type " + typeof value);
    if (datatype == "boolean" || datatype == "number")
      // JSON.parse() will autoconvert booleans and numbers
      value = JSON.parse(value);
    else if (datatype == "undefined")
      value = undefined;
    return value;
  },

  _setPref : function(prefName, value) {
    localStorage["prefs." + this._prefBranch + prefName] = value;
    localStorage["prefs." + this._prefBranch + prefName + ".DType"] = typeof value;
  },
  _setDefaultPref : function(prefName, value) {
    localStorage["defaultPrefs." + this._prefBranch + prefName] = value;
    localStorage["defaultPrefs." + this._prefBranch + prefName + ".DType"] = typeof value;
  },
  _removePref : function(prefName) {
    localStorage.removeItem("prefs." + this._prefBranch + prefName);
    localStorage.removeItem("prefs." + this._prefBranch + prefName + ".DType");
  },

  /**
   * Get the value of a pref, if any; otherwise return the default value.
   *
   * @param   prefName  {String|Array}
   *          the pref to get, or an array of prefs to get
   *
   * @param   defaultValue
   *          the default value, if any, for prefs that don't have one
   *
   * @returns the value of the pref, if any; otherwise the default value
   */
  get: function(prefName, defaultValue) {
    if (isArray(prefName))
      return prefName.map(function(v) { return this.get(v, defaultValue); }, this);

    var value = this._getPref(prefName);
    if (value !== undefined)
      return value;
    value = this._getDefaultPref(prefName);
    if (value !== undefined)
      return value;
    return defaultValue;
  },

  /**
   * Set a preference to a value.
   *
   * You can set multiple prefs by passing an object as the only parameter.
   * In that case, this method will treat the properties of the object
   * as preferences to set, where each property name is the name of a pref
   * and its corresponding property value is the value of the pref.
   *
   * @param   prefName  {String|Object}
   *          the name of the pref to set; or an object containing a set
   *          of prefs to set
   *
   * @param   prefValue {String|Number|Boolean}
   *          the value to which to set the pref
   *
   * Note: Preferences cannot store non-integer numbers or numbers outside
   * the signed 32-bit range -(2^31-1) to 2^31-1, If you have such a number,
   * store it as a string by calling toString() on the number before passing
   * it to this method, i.e.:
   *   Preferences.set("pi", 3.14159.toString())
   *   Preferences.set("big", Math.pow(2, 31).toString()).
   */
  set: function(prefName, prefValue) {
    if (isObject(prefName)) {
      for (var name in prefName)
        this.set(name, prefName[name]);
      return;
    }

    this._setPref(prefName, prefValue);
  },

  /**
   * Whether or not the given pref has a value.  This is different from isSet
   * because it returns true whether the value of the pref is a default value
   * or a user-set value, while isSet only returns true if the value
   * is a user-set value.
   *
   * @param   prefName  {String|Array}
   *          the pref to check, or an array of prefs to check
   *
   * @returns {Boolean|Array}
   *          whether or not the pref has a value; or, if the caller provided
   *          an array of pref names, an array of booleans indicating whether
   *          or not the prefs have values
   */
  has: function(prefName) {
    if (isArray(prefName))
      return prefName.map(this.has, this);

    return this._getPref(prefName) !== undefined &&
        this._getDefaultPref(prefName) !== undefined;
  },

  /**
   * Whether or not the given pref has a user-set value.  This is different
   * from |has| because it returns true only if the value of the pref is a user-
   * set value, while |has| returns true if the value of the pref is a default
   * value or a user-set value.
   *
   * @param   prefName  {String|Array}
   *          the pref to check, or an array of prefs to check
   *
   * @returns {Boolean|Array}
   *          whether or not the pref has a user-set value; or, if the caller
   *          provided an array of pref names, an array of booleans indicating
   *          whether or not the prefs have user-set values
   */
  isSet: function(prefName) {
    if (isArray(prefName))
      return prefName.map(this.isSet, this);

    return this._getPref(prefName) !== undefined;
  },

  /**
   * Whether or not the given pref has a user-set value. Use isSet instead,
   * which is equivalent.
   * @deprecated
   */
  modified: function(prefName) { return this.isSet(prefName) },

  reset: function(prefName) {
    if (isArray(prefName)) {
      prefName.map(function(v) { return this.reset(v); }, this);
      return;
    }

    this._removePref(prefName);
  },

  /**
   * If you need to know the default values, without resetting the actual
   * user prefs, you can use this.
   * @returns {Preferences} a new Preferences object, which accesses
   * the defaults rather than the user prefs.
   * *Only* call get() on this.
   * If you call set(), you will modify the defaults, so don't do that!
   */
  defaults : function() {
    throw "not yet implemented";
    var prefs = new Preferences(this._prefBranch);
    // override. nasty, but this is internal, so OK.
    prefs.__defineGetter__("_prefSvc", function() { return defaultBranch; });
    return prefs;
  },

  /**
   * Lock a pref so it can't be changed.
   *
   * @param   prefName  {String|Array}
   *          the pref to lock, or an array of prefs to lock
   */
  lock: function(prefName) {
    throw "not implemented";
  },

  /**
   * Unlock a pref so it can be changed.
   *
   * @param   prefName  {String|Array}
   *          the pref to lock, or an array of prefs to lock
   */
  unlock: function(prefName) {
    throw "not implemented";
  },

  /**
   * Whether or not the given pref is locked against changes.
   *
   * @param   prefName  {String|Array}
   *          the pref to check, or an array of prefs to check
   *
   * @returns {Boolean|Array}
   *          whether or not the pref has a user-set value; or, if the caller
   *          provided an array of pref names, an array of booleans indicating
   *          whether or not the prefs have user-set values
   */
  locked: function(prefName) {
    throw "not implemented";
  },

  /**
   * Start observing a pref.
   *
   * The callback can be a function or any object that implements nsIObserver.
   * When the callback is a function and thisObject is provided, it gets called
   * as a method of thisObject.
   *
   * @param   prefName    {String}
   *          the name of the pref to observe
   *
   * @param   callback    {Function|Object}
   *          the code to notify when the pref changes;
   *
   * @param   thisObject  {Object}  [optional]
   *          the object to use as |this| when calling a Function callback;
   *
   * @returns the wrapped observer
   */
  observe: function(prefName, callback, thisObject) {
    var fullPrefName = this._prefBranch + (prefName || "");

    this.ignore(prefName, callback, thisObject); // prevent double-add
    var observer = {
      prefName : fullPrefName,
      callback : callback,
      thisObject : thisObject,
    };
    gPrefObservers.push(observer);

    return observer;
  },

  /**
   * Stop observing a pref.
   *
   * You must call this method with the same prefName, callback, and thisObject
   * with which you originally registered the observer.  However, you don't have
   * to call this method on the same exact instance of Preferences; you can call
   * it on any instance.  For example, the following code first starts and then
   * stops observing the "foo.bar.baz" preference:
   *
   *   var observer = function() {...};
   *   Preferences.observe("foo.bar.baz", observer);
   *   new Preferences("foo.bar.").ignore("baz", observer);
   *
   * @param   prefName    {String}
   *          the name of the pref being observed
   *
   * @param   callback    {Function|Object}
   *          the code being notified when the pref changes
   *
   * @param   thisObject  {Object}  [optional]
   *          the object being used as |this| when calling a Function callback
   */
  ignore: function(prefName, callback, thisObject) {
    var fullPrefName = this._prefBranch + (prefName || "");

    var removes = gPrefObservers.filter(function(v) { return
        v.prefName == fullPrefName &&
        v.callback == callback &&
        v.thisObject == thisObject; });
    for (var i in removes)
      gPrefObservers.splice(gPrefObservers.indexOf(removes[i]), 1);
  },

  /**
   * Same as observe(), but automatically unregisters itself when
   * the window closes, saving you from writing an unload handler and
   * calling ignore().
   * @param win {nsIDOMWindow} your |window|
   */
  observeAuto: function(win, prefName, callback, thisObject) {
    throw "not yet implemented";
  },

  /**
   * This must be called whenever a pref has changed via any means.
   *
   * NOTE: This assumes that all writes to prefs happen via this API.
   * If the change is done via other means, the observers are not called
   * and things break.
   */
  _notifyObservers: function(prefName, newValue) {
    var fullPrefName = this._prefBranch + (prefName || "");

    for (var i in gPrefObservers)
    {
      var observer = observers[i];
      if ( !(observer.prefName == fullPrefName ||
            observer.prefName.substr(-1) == "*" &&
            observer.prefName.substr(0, observer.prefName.length - 1) ==
                fullPrefName.substr(0, observer.prefName.length - 1)))
        continue;
      try {
        if (observer.thisObject)
          observer.callback.call(observer.thisObject, newValue);
        else
          observer.callback(newValue);
      } catch (e) { console.error(e); }
    }
  },

  /**
   * Resets the passed in pref subbranch or if nothing is passed
   * in, the associated branch.
   */
  resetBranch: function(prefBranch) {
    if (prefBranch) {
      this.branch(prefBranch).resetBranch();
    } else {
      this.reset(this.childPrefNames());
    }
  },

  /**
   * Returns all child prefs of this pref branch.
   * This equals nsIPrefBranch.getChildList().
   * This allows you to do e.g.
   * var myPrefs = new Preferences("extensions.cooler.");
   * var contents = myPrefs.branch("contents.");
   * for each (var prefname in contents.childPrefNames())
   *   dump("have " + contents.get(prefname) + " " + prefname + "\n");
   *
   * @returns {Array of String} The names of the children,
   *     without the base pref branch, but with subbranch.
   */
  childPrefNames : function() {
    var result = [];
    var prefBranch = "prefs." + this._prefBranch;
    var defaultBranch = "defaultPrefs." + this._prefBranch;
    for (var fullname in localStorage) {
      if (fullname.substr(0, prefBranch.length) == prefBranch) {
        result.push(fullname.substr(prefBranch.length));
      } else if (fullname.substr(0, defaultBranch.length) == defaultBranch) {
        result.push(fullname.substr(defaultPrefBranch.length));
      }
    }
    return result;
  },

  /**
   * Returns the base pref name that this object stands for.
   * E.g. "extensions.yourcooler.";
   * @returns {String}
   */
  get prefBranchName() {
    return this._prefBranch;
  },

  /**
   * Returns an Preferences object for an sub pref branch
   * underneath the current pref branch.
   * @param subbranch {String} Will be appended to the
   *     current pref branch. Don't forget the trailing dot,
   *     where necessary.
   *     E.g. "contents."
   * @returns {Preferences}
   */
  branch : function(subbranch) {
    return new Preferences(this._prefBranch + subbranch);
  },

};

function isArray(val) {
  // We can't check for |val.constructor == Array| here, since the value
  // might be from a different context whose Array constructor is not the same
  // as ours, so instead we match based on the name of the constructor.
  return (typeof val != "undefined" && val != null && typeof val == "object" &&
          val.constructor.name == "Array");
}

function isObject(val) {
  // We can't check for |val.constructor == Object| here, since the value
  // might be from a different context whose Object constructor is not the same
  // as ours, so instead we match based on the name of the constructor.
  return (typeof val != "undefined" && val != null && typeof val == "object" &&
          val.constructor.name == "Object");
}

var myPrefs = new Preferences("");
