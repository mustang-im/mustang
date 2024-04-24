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
  integer(unchecked, fallback = throwErrors) {
    if (typeof (unchecked) == "number") {
      return unchecked;
    }
    let r = parseInt(unchecked);
    if (isNaN(r)) {
      haveError("no_number.error", unchecked, fallback);
    }
    return r;
  }

  integerRange(unchecked, min, max, fallback) {
    let i = this.integer(unchecked, fallback);
    if (i < min) {
      haveError("number_too_small.error", unchecked, fallback);
    }
    if (i > max) {
      haveError("number_too_large.error", unchecked, fallback);
    }
    return i;
  }

  boolean(unchecked, fallback) {
    if (typeof (unchecked) == "boolean") {
      return unchecked;
    }
    if (unchecked == "true") {
      return true;
    }
    if (unchecked == "false") {
      return false;
    }
    haveError("boolean.error", unchecked, fallback);
  }

  string(unchecked, fallback) {
    if (unchecked === null || unchecked === undefined) {
      haveError("string_empty.error", unchecked, fallback);
    }
    return String(unchecked);
  }

  nonemptystring(unchecked, fallback) {
    if (!unchecked) {
      haveError("string_empty.error", unchecked, fallback);
    }
    return this.string(unchecked, fallback);
  }

  /**
   * Allow only letters, numbers, "-" and "_".
   *
   * Empty strings not allowed (good idea?).
   */
  alphanumdash(unchecked, fallback) {
    let str = this.nonemptystring(unchecked, fallback);
    if (!/^[a-zA-Z0-9\-\_]*$/.test(str)) {
      haveError("alphanumdash.error", unchecked, fallback);
    }
    return str;
  }

  /**
   * DNS hostnames like foo.bar.example.com
   * Allow only letters, numbers, "-" and "."
   * Empty strings not allowed.
   * Currently does not support IDN (international domain names).
   * HACK: "%" is allowed, because we allow placeholders in hostnames in the
   * config file.
   */
  hostname(unchecked, fallback) {
    let str = this.nonemptystring(unchecked, fallback);
    if (!/^[a-zA-Z0-9\-\.%]*$/.test(unchecked)) {
      haveError("hostname_syntax.error", unchecked, fallback);
    }
    return str.toLowerCase();
  }

  portTCP(unchecked, fallback) {
    return this.integerRange(unchecked, 1, 65535, fallback);
  }

  /**
   * A non-chrome URL that's safe to request.
   */
  url(unchecked, fallback) {
    let str = this.string(unchecked, fallback);
    if (str.substring(0, 5) != "http:" && str.substring(0, 6) != "https:" &&
      str.substring(0, 4) != "ftp:") {
      haveError("url_scheme.error", unchecked, fallback);
    }
    //TODO security-check URL
    return str;
  }

  /**
   * Email address foo@bar.com
   */
  emailAddress(unchecked, fallback) {
    let str = this.nonemptystring(unchecked, fallback);
    let sp = str.split("@");
    if (sp.length != 2 || !/^[a-zA-Z0-9\-%+_\.\*]+@[a-z0-9\-\.]+\.[a-z]+$/i.test(str)) {
      haveError("not_an_email_address.error", unchecked, fallback);
    }
    let user = this.nonemptystring(sp[0], fallback); // implicitly checks, var unused
    let domain = this.hostname(sp[1], fallback); // implicitly checks, var unused
    return str.toLowerCase();
  }

  /**
   * A value which should be shown to the user in the UI as label
   */
  label(unchecked, fallback) {
    return this.string(unchecked, fallback);
  }

  /**
   * @param unchecked either Unixtime in milliseconds (as number)
   *   or an ISO time string "2024-03-14T16:00:00+0100"
   *   or an RFC822 Date string
   * @return {Date}
   */
  date(unchecked, fallback) {
    if (typeof (unchecked) == "string") {
      return new Date(unchecked); // ISO or RFC822 format
    } else if (typeof (unchecked) == "number") {
      return new Date(unchecked); // Unixtime in milliseconds
    } else if (typeof (unchecked) == "object" && unchecked instanceof Date) {
      return new Date(unchecked); // ISO or RFC822 format
    } else {
      haveError("date_not_string_or_number.error", unchecked, fallback);
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
  enum(unchecked, allowedValues, fallback) {
    return allowedValues.find(allowedValue => allowedValue == unchecked) ??
      haveError("allowed_value.error", unchecked, fallback);
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
  translate(unchecked, mapping, fallback) {
    for (let inputValue in mapping) {
      if (inputValue == unchecked) {
        return mapping[inputValue];
      }
    }
    haveError("allowed_value.error", unchecked, fallback);
  }
}

function haveError(errorMsg, unchecked, fallback) {
  if (fallback === throwErrors) {
    throw new MalformedException(errorMsg, unchecked);
  } else {
    return fallback;
  }
}

class MalformedException extends Error {
  constructor(msgID, uncheckedBadValue) {
    let msg = "Value error: " + msgID.replace(".error", "").replace(/ /g, "_");;
    /* try {
      let gSanitizeBundle = new StringBundle("util");
      msg = gSanitizeBundle.get(msgID);
    } catch (ex) { } */
    console.log(msg += " (bad value: " + new String(uncheckedBadValue) + ")");
    super(msg);
    this.msg = msg;
  }
  toString() {
    return this.msg;
  }
}

export let sanitize = new Sanitize();
// exports.sanitize = sanitize;
