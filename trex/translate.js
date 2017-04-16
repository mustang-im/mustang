
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

exports.translateElements = translateElements;
exports.pluralform = pluralform;
