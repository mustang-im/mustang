// import { StringBundle } from "./stringbundle";

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
  integer(unchecked) {
    if (typeof (unchecked) == "number") {
      return unchecked;
    }
    var r = parseInt(unchecked);
    if (isNaN(r)) {
      throw new MalformedException("no_number.error", unchecked);
    }
    return r;
  }

  integerRange(unchecked, min, max) {
    var i = this.integer(unchecked);
    if (i < min) {
      throw new MalformedException("number_too_small.error", unchecked);
    }
    if (i > max) {
      throw new MalformedException("number_too_large.error", unchecked);
    }
    return i;
  }

  boolean(unchecked) {
    if (typeof (unchecked) == "boolean") {
      return unchecked;
    }
    if (unchecked == "true") {
      return true;
    }
    if (unchecked == "false") {
      return false;
    }
    throw new MalformedException("boolean.error", unchecked);
  }

  string(unchecked) {
    return String(unchecked);
  }

  nonemptystring(unchecked) {
    if (!unchecked) {
      throw new MalformedException("string_empty.error", unchecked);
    }
    return this.string(unchecked);
  }

  /**
   * Allow only letters, numbers, "-" and "_".
   *
   * Empty strings not allowed (good idea?).
   */
  alphanumdash(unchecked) {
    var str = this.nonemptystring(unchecked);
    if (!/^[a-zA-Z0-9\-\_]*$/.test(str)) {
      throw new MalformedException("alphanumdash.error", unchecked);
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
  hostname(unchecked) {
    var str = this.nonemptystring(unchecked);
    if (!/^[a-zA-Z0-9\-\.%]*$/.test(unchecked)) {
      throw new MalformedException("hostname_syntax.error", unchecked);
    }
    return str.toLowerCase();
  }

  portTCP(unchecked) {
    return this.integerRange(unchecked, 1, 65535);
  }

  /**
   * A non-chrome URL that's safe to request.
   */
  url(unchecked) {
    var str = this.string(unchecked);
    if (str.substr(0, 5) != "http:" && str.substr(0, 6) != "https:" &&
      str.substr(0, 4) != "ftp:") {
      throw new MalformedException("url_scheme.error", unchecked);
    }
    //TODO security-check URL
    return str;
  }

  /**
   * Email address foo@bar.com
   */
  emailAddress(unchecked) {
    var str = this.nonemptystring(unchecked);
    var sp = str.split("@");
    if (sp.length != 2 || !/^[a-zA-Z0-9\-%+_\.\*]+@[a-z0-9\-\.]+\.[a-z]+$/i.test(str)) {
      throw new MalformedException("not_an_email_address.error", unchecked);
    }
    var user = this.nonemptystring(sp[0]);
    var domain = this.hostname(sp[1]);
    return str.toLowerCase();
  }

  /**
   * A value which should be shown to the user in the UI as label
   */
  label(unchecked) {
    return this.string(unchecked);
  }

  /**
   * @param unchecked either Unixtime in milliseconds (as number)
   *   or an ISO time string "2024-03-14T16:00:00+0100"
   *   or an RFC822 Date string
   * @return {Date}
   */
  date(unchecked) {
    if (typeof (unchecked) == "string") {
      return new Date(unchecked); // ISO or RFC822 format
    } else if (typeof (unchecked) == "number") {
      return new Date(unchecked); // Unixtime in milliseconds
    } else {
      throw new MalformedException("date_not_string_or_number", unchecked);
    }
  }

  /**
   * Allows only certain values as input, otherwise throw.
   *
   * @param unchecked {Any} The value to check
   * @param allowedValues {Array} List of values that |unchecked| may have.
   * @param defaultValue {Any} (Optional) If |unchecked| does not match
   *       anything in |mapping|, a |defaultValue| can be returned instead of
   *       throwing an exception. The latter is the default and happens when
   *       no |defaultValue| is passed.
   * @throws MalformedException
   */
  enum(unchecked, allowedValues, defaultValue) {
    var checkedValue = allowedValues.find(allowedValue => allowedValue == unchecked);
    if (checkedValue) {
      return checkedValue;
    }
    // value is bad
    if (typeof (defaultValue) == "undefined") {
      throw new MalformedException("allowed_value.error", unchecked);
    }
    return defaultValue;
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
   * @param defaultValue {Any} (Optional) If |unchecked| does not match
   *       anything in |mapping|, a |defaultValue| can be returned instead of
   *       throwing an exception. The latter is the default and happens when
   *       no |defaultValue| is passed.
   * @throws MalformedException
   */
  translate(unchecked, mapping, defaultValue) {
    for (let inputValue in mapping) {
      if (inputValue == unchecked) {
        return mapping[inputValue];
      }
    }
    // value is bad
    if (typeof (defaultValue) == "undefined") {
      throw new MalformedException("allowed_value.error", unchecked);
    }
    return defaultValue;
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
