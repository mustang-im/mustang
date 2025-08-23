// import { StringBundle } from "./stringbundle";

let throwErrors = Symbol("Throw");

/**
 * This is a generic input validation lib. Use it when you process
 * data from the network.
 *
 * Just a few functions which verify, for security purposes, that the
 * input variables (strings, if nothing else is noted) are of the expected
 * type and syntax.
 *
 * The functions take a string (unless noted otherwise) and return
 * the expected datatype in JS types. If the value is not as expected,
 * they throw exceptions.
 */
class Sanitize {
  integer(unchecked: number | string | null, fallback: number | null | Symbol = throwErrors): number {
    if (typeof (unchecked) == "number") {
      return unchecked;
    }
    let r = parseInt(unchecked);
    if (isNaN(r)) {
      return haveError("No number", unchecked, fallback);
    }
    return r;
  }

  integerRange(unchecked: number | string | null, min: number, max: number, fallback: number | null | Symbol = throwErrors): number {
    let i = this.integer(unchecked, fallback);
    if (i < min) {
      return haveError("Number too small", unchecked, fallback);
    }
    if (i > max) {
      return haveError("Number too large", unchecked, fallback);
    }
    return i;
  }

  boolean(unchecked: boolean | string | number | null, fallback: boolean | null | Symbol = throwErrors): boolean {
    if (typeof (unchecked) == "boolean") {
      return unchecked;
    }
    if (unchecked === 0 || unchecked === null || unchecked === undefined) {
      return false;
    }
    if (unchecked === 1) {
      return true;
    }
    if (unchecked === "false" || unchecked === "0") {
      return false;
    }
    if (unchecked === "true" || unchecked === "1") {
      return true;
    }
    return haveError("Boolean", unchecked, fallback);
  }

  string(unchecked: string | null, fallback: string | null | Symbol = throwErrors): string {
    if (unchecked === null || unchecked === undefined) {
      return haveError("String empty", unchecked, fallback);
    }
    return String(unchecked);
  }

  nonemptystring(unchecked: string | null, fallback: string | null | Symbol = throwErrors): string {
    if (!unchecked) {
      return haveError("String empty", unchecked, fallback);
    }
    return this.string(unchecked, fallback);
  }

  /**
   * Allow only letters, numbers, "-" and "_".
   *
   * Empty strings not allowed (good idea?).
   */
  alphanumdash(unchecked: string | null, fallback: string | null | Symbol = throwErrors): string {
    let str = this.nonemptystring(unchecked, fallback);
    if (!/^[a-zA-Z0-9\-\_]*$/.test(str)) {
      return haveError("Not alpha-num-dash", unchecked, fallback);
    }
    return str;
  }

  // International hostnames like уайлддк.орг need to pass
  regexpHostname = /^[\p{Letter}\p{Number}\-\.%]*$/u;
  regexpHostname_ASCII = /^[a-zA-Z0-9\-\.%]*$/;

  /**
   * DNS hostnames like foo.bar.example.com
   * Allow only letters, numbers, "-" and "."
   * Empty strings not allowed.
   * Currently does not support IDN (international domain names).
   * HACK: "%" is allowed, because we allow placeholders in hostnames in the
   * config file.
   */
  hostname(unchecked: string | null, fallback: string | null | Symbol = throwErrors): string {
    let str = this.nonemptystring(unchecked, fallback);
    try {
      if (!this.regexpHostname.test(str)) {
        return haveError("Hostname syntax", unchecked, fallback);
      }
    } catch (ex) { // node.js mobile: No Unicode regexp support
      if (!this.regexpHostname_ASCII.test(str)) {
        return haveError("Hostname syntax", unchecked, fallback);
      }
    }
    return str?.toLowerCase();
  }

  portTCP(unchecked: number | string | null, fallback: number | null | Symbol = throwErrors): number {
    return this.integerRange(unchecked, 1, 65535, fallback);
  }

  /**
   * A non-chrome URL that's safe to request.
   */
  url(unchecked: string | null, fallback: string | null | Symbol = throwErrors,
    allowedURLSchemes: string[] = ["https", "http"]): string {
    let str = this.nonemptystring(unchecked, fallback);
    if (!str) { // in case of fallback
      return haveError("URL is empty", unchecked, fallback);
    }
    if (!allowedURLSchemes.find(scheme => str.startsWith(scheme))) {
      return haveError("URL scheme", unchecked, fallback);
    }
    //TODO security-check URL
    return str;
  }

  // EAI like ндрис@уайлддк.орг need to pass
  regexpEMailAddress = /^[\p{Letter}\p{Number}\-+_\.]+@[\p{Letter}\p{Number}\-\.]+\.(?:[\p{Letter}]+|xn--[a-z0-9]+)$/u;
  regexpEMailAddress_ASCII = /^[a-zA-Z0-9\-+_\.]+@[a-zA-Z0-9\-\.]+\.(?:[a-zA-Z]+|xn--[a-z0-9]+)$/;

  /**
   * Email address foo@bar.com
   */
  emailAddress(unchecked: string | null, fallback: string | null | Symbol = throwErrors): string {
    if (!unchecked) {
      return haveError("Missing email address", unchecked, fallback);
    }
    let str = String(unchecked);
    try {
      if (!this.regexpEMailAddress.test(str)) {
        return haveError("Not an email address", unchecked, fallback);
      }
    } catch (ex) { // node.js mobile: No Unicode regexp support
      if (!this.regexpEMailAddress_ASCII.test(str)) {
        return haveError("Not an email address", unchecked, fallback);
      }
    }
    return str.toLowerCase();
    /*
    let sp = str.split("@");
    if (sp.length != 2) {
      throw new Error("");
    }
    let user = this.nonemptystring(sp[0]); // only check, var unused
    let domain = this.hostname(sp[1]); // only check, var unused
    */
  }

  regexpFilename = /[^\p{Letter}\p{Number}\.\-_ ]/gu;
  regexpFilename_ASCII = /[^a-zA-Z0-9\.\-_ ]/g;

  /** Removes potentially dangerous parts of the file name, e.g.
   * \ / : . ' " ! ? * |
   * See <https://kizu514.com/blog/forbidden-file-names-on-windows-10/>
   * but there are many others. */
  filename(unchecked: string | null, fallback: string | null | Symbol = throwErrors): string {
    let filename = this.nonemptystring(unchecked, fallback);
    try {
      filename = filename.replace(this.regexpFilename, "").trim();
    } catch (ex) { // node.js mobile: No Unicode regexp support
      filename = filename.replace(this.regexpHostname_ASCII, "").trim();
    }
    if (!filename) {
      return haveError("Filename cannot have punctuation and control characters", unchecked, fallback);
    }
    const kDeviceNames = ['NUL', 'AUX', 'PRN', 'CON', 'COM', 'LPT', 'COM1', 'LPT1', 'COM2', 'LPT2'];
    if (filename.length < 5 && kDeviceNames.includes(filename)) {
      return haveError("Filename cannot be a Windows device name", unchecked, fallback);
    }
    // TODO Unix `/dev/`, `/proc/`, `/sys/` etc.
    return filename;
  }

  /**
   * A value which should be shown to the user in the UI as label
   */
  label(unchecked: string | null, fallback: string | null | Symbol = throwErrors): string {
    return this.string(unchecked, fallback);
  }

  /**
   * @param unchecked either Unixtime in milliseconds (as number)
   *   or an ISO time string "2024-03-14T16:00:00+0100"
   *   or an RFC822 Date string
   * @return {Date}
   */
  date(unchecked: Date | string | number | null, fallback: Date | null | Symbol = throwErrors): Date {
    function newDate(val) {
      let date = new Date(val);
      if (isNaN(date.getTime())) {
        return haveError("Invalid date", unchecked, fallback);
      }
      return date;
    }
    if (!unchecked) {
      return haveError("Date is empty", unchecked, fallback);
    } else if (typeof (unchecked) == "string") {
      return newDate(unchecked); // ISO or RFC822 format
    } else if (typeof (unchecked) == "number") {
      return newDate(unchecked); // Unixtime in milliseconds
    } else if (typeof (unchecked) == "object" && unchecked instanceof Date) {
      return newDate(unchecked); // ISO or RFC822 format
    } else {
      return haveError("Date not string or number", unchecked, fallback);
    }
  }

  /**
   * A value which should be shown to the user in the UI as label
   */
  array(unchecked: [] | null, fallback: [] | null | Symbol = throwErrors): [] | null {
    if (unchecked && Array.isArray(unchecked)) {
      return unchecked;
    } else {
      return haveError("Not an array", unchecked, fallback);
    }
  }

  /**
   * Allows only certain values as input, otherwise throw.
   *
   * @param unchecked {Any} The value to check
   * @param allowedValues {Array} List of values that |unchecked| may have.
   * @param fallback {Any} (Optional) If |unchecked| does not match
   *       anything in |mapping|, a |defaultValue| can be returned instead of
   *       throwing an exception. The latter is the default and happens when
   *       no |defaultValue| is passed.
   * @throws MalformedException
   */
  enum<T>(unchecked: T | null, allowedValues: T[], fallback: T | null | Symbol = throwErrors): T {
    return allowedValues.find(allowedValue => allowedValue == unchecked) ??
      haveError("Allowed value", unchecked, fallback);
  }

  /**
   * Like enum, allows only certain (string) values as input, but allows the
   * caller to specify another value to return instead of the input value. E.g.,
   * if unchecked == "foo", return 1, if unchecked == "bar", return 2,
   * otherwise throw. This allows to translate string enums into integer enums.
   *
   * @param unchecked {Any} The value to check
   * @param mapping {Object} Associative array. property name is the input
   *       value, property value is the output value. E.g. the example above
   *       would be: { foo: 1, bar : 2 }.
   *       Use quotes when you need freaky characters: "baz-" : 3.
   * @param fallback {Any} (Optional) If |unchecked| does not match
   *       anything in |mapping|, a |defaultValue| can be returned instead of
   *       throwing an exception. The latter is the default and happens when
   *       no |defaultValue| is passed.
   * @throws MalformedException
   */
  translate<F, T>(unchecked: F | null, mapping: Record<any, T>, fallback: T | null | Symbol = throwErrors): T {
    for (let inputValue in mapping) {
      if (inputValue == unchecked) {
        return mapping[inputValue];
      }
    }
    return haveError("Allowed value", unchecked, fallback);
  }

  json(unchecked: string | Object, fallback: Object | Symbol = throwErrors): any {
    if (!unchecked) {
      return haveError("JSON is empty", unchecked, fallback);
    } else if (typeof (unchecked) == "object") {
      return unchecked;
    } else if (typeof (unchecked) == "string") {
      try {
        return JSON.parse(unchecked);
      } catch (ex) {
        return haveError("Malformed JSON string", unchecked, fallback);
      }
    } else {
      return haveError("Should be JSON, but got wrong data type " + typeof(unchecked), unchecked, fallback);
    }
  }
}

function haveError(errorMsg: string, unchecked: any, fallback: any): any {
  if (fallback === throwErrors) {
    throw new MalformedException(errorMsg, unchecked);
  } else {
    return fallback;
  }
}

class MalformedException extends Error {
  constructor(msgID: string, uncheckedBadValue: any) {
    let msg = "Value error: " + msgID;
    msg += " (Bad value: " + new String(uncheckedBadValue) + ")";
    /* try {
      let gSanitizeBundle = new StringBundle("util");
      msg = gSanitizeBundle.get(msgID.toLowerCase().replace(/ /g, "_") + ".error");
    } catch (ex) { } */
    super(msg);
    //this.msg = msg;
  }
  toString() {
    return this.message;
  }
}

export let sanitize = new Sanitize();
