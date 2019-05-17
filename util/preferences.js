/*************************
 * name: Preferences
 * description: Preferences system for node.js, saving the prefs in a JSON file
 * copyright: Ben Bucksch of Beonex
 * license: MIT
 * version: 0.7
 ****************************/

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
 *
 * This implementation stores the preferences in a local JSON file
 * using node.js functions.
 * There are other implementations with the same API, but using
 * HTML5 localStorage.
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
    prefName = this._prefBranch + prefName;
    let path = prefName.split(".");
    let leaf = path.pop();
    let branch = gPrefs;
    for (let dir of path) {
      if (typeof(branch[dir]) == "undefined") {
        return undefined;
      }
      branch = branch[dir];
    }
    return branch[leaf];
  },

  _setPref : function(prefName, value) {
    prefName = this._prefBranch + prefName;
    let path = prefName.split(".");
    let leaf = path.pop();
    let branch = gPrefs;
    for (let dir of path) {
      if (typeof(branch[dir]) == "undefined") {
        branch[dir] = {};
      }
      branch = branch[dir];
    }
    branch[leaf] = value;
  },
  _removePref : function(prefName) {
    prefName = this._prefBranch + prefName;
    let path = prefName.split(".");
    let leaf = path.pop();
    let branch = gPrefs;
    for (let dir of path) {
      if (typeof(branch[dir]) == "undefined") {
        return;
      }
    }
    branch[leaf] = undefined;
  },

  _getDefaultPref : function(prefName) {
    return this._getPref("default." + prefName);
  },
  _setDefaultPref : function(prefName, value) {
    this._setPref("default." + prefName, value);
  },

  /**
   * Get the value of a pref, if any; otherwise return the default value.
   *
   * @param   prefName {String}   E.g. "foo.bar.baz"
   *
   * @param   defaultValue   the hardcoded default value,
   *     for prefs that have neither a user pref nor a default pref set
   *
   * @returns the value of the pref, if any; otherwise the default value
   */
  get: function(prefName, defaultValue) {
    var value = this._getPref(prefName);
    if (value !== undefined) {
      return value;
    }
    value = this._getDefaultPref(prefName);
    if (value !== undefined) {
      return value;
    }
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
   * @param   prefName {String}   E.g. "foo.bar.baz"
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
    this._setPref(prefName, prefValue);
  },

  /**
   * Whether or not the given pref has a value.  This is different from isSet
   * because it returns true whether the value of the pref is a default value
   * or a user-set value, while isSet only returns true if the value
   * is a user-set value.
   *
   * @param   prefName {String}   E.g. "foo.bar.baz"
   *
   * @returns {Boolean} whether the pref has a value
   */
  has: function(prefName) {
    return this._getPref(prefName) !== undefined &&
        this._getDefaultPref(prefName) !== undefined;
  },

  /**
   * Whether or not the given pref has a user-set value.  This is different
   * from |has| because it returns true only if the value of the pref is a user-
   * set value, while |has| returns true if the value of the pref is a default
   * value or a user-set value.
   *
   * @param   prefName {String}   E.g. "foo.bar.baz"
   *
   * @returns {Boolean} whether the pref has a user-set value
   */
  hasUser: function(prefName) {
    return this._getPref(prefName) !== undefined;
  },

  reset: function(prefName) {
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
   * Start observing a pref.
   *
   * The callback can be a function or any object that implements nsIObserver.
   *
   * @param   prefName    {String}
   *          the name of the pref to observe. E.g. "foo.bar.baz"
   *
   * @param   callback    {Function}
   *          the code to notify when the pref changes;
   *
   * @returns the wrapped observer
   */
  observe: function(prefName, callback) {
    var fullPrefName = this._prefBranch + (prefName || "");

    this.ignore(prefName, callback); // prevent double-add
    var observer = {
      prefName : fullPrefName,
      callback : callback,
    };
    gPrefObservers.push(observer);

    return observer;
  },

  /**
   * Stop observing a pref.
   *
   * You must call this method with the same prefName and callback
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
   * @param   callback    {Function}
   *          the code being notified when the pref changes
   */
  ignore: function(prefName, callback) {
    var fullPrefName = this._prefBranch + (prefName || "");

    var removes = gPrefObservers.filter(v =>
        v.prefName == fullPrefName &&
        v.callback == callback);
    for (var i in removes) {
      gPrefObservers.splice(gPrefObservers.indexOf(removes[i]), 1);
    }
  },

  /**
   * Same as observe(), but automatically unregisters itself when
   * the window closes, saving you from writing an unload handler and
   * calling ignore().
   * @param win {nsIDOMWindow} your |window|
   */
  observeAuto: function(win, prefName, callback) {
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
                fullPrefName.substr(0, observer.prefName.length - 1))) {
        continue;
      }
      try {
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
    for (var fullname in {}) {
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


const os = require("os");
const util = require("util");
const fs = require("fs");
fs.readFileAsync = util.promisify(fs.readFile);
fs.writeFileAsync = util.promisify(fs.writeFile);
fs.mkdirAsync = util.promisify(fs.mkdir);
fs.existsAsync = util.promisify(fs.exists);

function _getPrefsFileName() {
  // TODO change app name
  // TODO Windows, Mac
  return os.homedir() + "/.mustang/prefs.json";
}

async function _ensureDirectoryExists(filename) {
  if (!filename.includes("/")) {
    return;
  }
  var dirname = filename.substr(0, filename.lastIndexOf("/"));
  if (await fs.existsAsync(dirname)) {
    return;
  }
  await fs.mkdirAsync(dirname, { recursive: true });
}

/**
 * Save the in-memory preferences in a JSON file on disk.
 */
async function savePrefs() {
  var content = JSON.stringify(gPrefs, null, "  ");
  var filename = _getPrefsFileName();
  await _ensureDirectoryExists(filename);
  console.log("writing prefs file");
  await fs.writeFileAsync(filename, content);
}

/**
 * Read the preferences from a JSON file on disk into memory.
 */
function readPrefsSync() {
  try {
    var content = fs.readFileSync(_getPrefsFileName(), { encoding: "utf8" });
    gPrefs = JSON.parse(content);
  } catch (ex) {
    if (ex.code == "ENOENT") { // file not found
      gPrefs = {};
    } else {
      console.error(ex);
      throw ex;
    }
  }
}

var gPrefs = null;
var gUserPrefs = new Preferences("");

/**
 * TODO implement as a getter
 * @returns {gPrefs}
 */
function getPrefs() {
  if (!gPrefs) {
    gPrefs = readPrefs();
  }
  return gPrefs;
}

// TODO make on-demand, see getPrefs()
readPrefsSync();

module.exports = {
  myPrefs : gUserPrefs, // legacy
  pref : gUserPrefs,
  obj : gPrefs,
  savePrefs : savePrefs,
};
