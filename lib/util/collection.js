/*************************
 * name: Collection classes
 * description: List classes like ArrayColl, SetColl, MapColl, with observers and operators
 * copyright: Ben Bucksch of Beonex
 * license: MIT
 * version: 0.1
 ****************************/

/**
 * This defines the common base API for all collections and operators
 */
class Collection {
  constructor() {
    this._observers = [];
  }

  /**
   * Adds one item to the list
   * @param item {Object} any JS object
   */
  add(item) {
    throw "implement";
  }

  /**
   * Compat with JS |Array|
   */
  push(item) {
    this.add(item);
  }

  /**
   * Removes one item from the list
   * @param item {Object} any JS object
   */
  remove(item) {
    throw "implement";
  }

  /**
   * Add all items in |coll| to this list.
   * This is just a convenience function.
   * This adds items statically and does not observe the |coll| changes.
   * Consider using addColl() instead.
   *
   * Note: This is intentionally not overloading |add|.
   * @param coll {Collection or JS Array}
   */
  addAll(coll) {
    coll.forEach(item => this.add(item));
  }

  /**
   * Removes all items in |coll| from this list
   * @see addAll()
   * @param coll {Collection or JS Array}
   */
  removeAll(coll) {
    coll.forEach(item => this.remove(item));
  }

  /**
   * Removes all items from the list.
   */
  clear() {
    throw "implement";
  }

  /**
   * The number of items in this list
   * @returns {Integer} (always >= 0)
   */
  get length() {
    throw "implement";
  }

  /**
   * Whether there are items in this list
   * @returns {Boolean}
   */
  get isEmpty() {
    return this.length == 0;
  }

  /**
   * Checks whether this item is in the list.
   * @returns {Boolean}
   */
  contains(item) {
    return this.contents.indexOf(item) != -1;
  }

  /**
   * Returns all items contained in this list,
   * as a new JS array (so calling this can be expensive).
   *
   * If the list is ordered, the result of this function
   * is ordered in the same way.
   *
   * While the returned array is a copy, the items
   * are not, so changes to the array do not affect
   * the list, but changes to its items do change the
   * items in the list.
   *
   * @returns {Array} new JS array with all items
   */
  get contents() {
    throw "implement";
  }

  /**
   * The first item in the list
   * @returns {Object}
   * null, if the list is empty
   */
  get first() {
    throw "implement";
  }

  /**
   * The item at the nth position in the list
   * @returns {Object}
   * null, if the list is empty
   */
  getIndex(i) {
    throw "implement";
  }

  /**
   * |len| number of items, starting from the nth position in the list
   * @returns {Array of Object}
   * null, if the list is empty
   */
  getIndexRange(i, length) {
    throw "implement";
  }



  forEach(callback) {
    this.contents.forEach(callback);
  }

  /**
   * @param filterFunc {Function(item)}
   * @returns {Array of items} where |filterFunc| returned |true|
   */
  filter(filterFunc) {
    return new FilteredCollection(this, filterFunc);
  }

  /**
   * @returns first matching item or |undefined|
   */
  find(filterFunc) {
    var result = undefined;
    this.forEach(item => {
      if ( !result && filterFunc(item)) {
        result = item;
      }
    });
    return result;
  }

  map(mapFunc) {
    return new MapToCollection(this, mapFunc);
  }

  /**
   * Provides an iterator, i.e. allows to write:
   * var coll = new SetColl();
   * for (let item of coll) {
   *   debug(item);
   * }
   *
   * Subclasses may override this with a more
   * efficient implementation. But take care that
   * a remove() during the iteration doesn't confuse it.
   *
  iterator : function*() {
    var items = this.contents;
    for (var i = 0; i < items.length; i++) {
      yield items[i];
    }
  }
  */



  // Convenience methods for operators

  /**
   * operator +
   * Returns a collection that contains all values from both collections.
   * If the same item is in both collections, it will be added twice.
   * The result is simply |otherColl| appended to |this|.
   * @param otherColl {Collection}
   * @returns {Collection} Preserves order.
   */
  concat(otherColl) {
    return new AdditionCollection(this, otherColl);
  }

  /**
   * operator +
   * [Union](http://en.wikipedia.org/wiki/Union_(set_theory))
   * Returns a collection that contains all values from both collections.
   * If the same item is in both collections, it will be added only once.
   * @param otherColl {Collection}
   * @returns {Collection} Does not preserve order.
   */
  merge(otherColl) {
    return new AdditionCollectionWithDups(this, otherColl);
  }

  /**
   * operator -
   * [Set difference](http://en.wikipedia.org/wiki/Set_difference)
   * Returns a collection that contains all values from |this|, apart from those in collSubtract.
   * @param collSubtract {Collection}
   * @returns {Collection} Preserves order of collBase.
   */
  subtract(collSubtract) {
    return new SubtractCollection(this, collSubtract);
  }

  /**
   * operator &
   * [Intersection](http://en.wikipedia.org/wiki/Intersection_(set_theory))
   * Returns a collection that contains the values that are contained
   * in *both* collections, and only those.
   * @param otherColl {Collection}
   * @returns {Collection} Does not preserve order.
   */
  inCommon(otherColl) {
    return new IntersectionCollection(this, otherColl);
  }

  /**
   * operator xor
   * [Symmetric difference](http://en.wikipedia.org/wiki/Symmetric_difference)
   * Returns a collection that contains all values that are contained only in |this| or in |otherColl|, but not in both.
   * @param otherColl {Collection}
   * @returns {Collection} Does not preserve order.
   */
  notInCommon(otherColl) {
    return notInCommonColl(this, otherColl);
  }

  /**
   * @param sortFunc {Function(item)} like Array.sort()
   * @returns {Array of items} sorted by |sortFunc|
   */
  sort(sortFunc) {
    return sortColl(this, sortFunc);
  }



  // Observer

  /**
   * Pass an object that will be called when
   * items are added or removed from this list.
   *
   * If you call this twice for the same observer, the second is a no-op.
   * @param observer {CollectionObserver}
   */
  registerObserver(observer) {
    assert(observer);
    assert(typeof(observer.added) == "function",
        "must implement CollectionObserver");
    if (this._observers.indexOf(observer) != -1) { // already contains it
      return;
    }
    this._observers.push(observer);
  }

  /**
   * undo |registerObserver|
   * @param observer {CollectionObserver}
   */
  unregisterObserver(observer) {
    assert(observer);
    assert(typeof(observer.added) == "function" &&
           typeof(observer.removed) == "function",
        "must implement CollectionObserver");
    _coll_arrayRemove(this._observers, observer, true);
  }

  _notifyAdded(items) {
    this._observers.forEach(observer => {
      try {
        observer.added(items, this);
      } catch (e) {
        console.error(e);
      }
    });
  }

  _notifyRemoved(items) {
    this._observers.forEach(observer => {
      try {
        observer.removed(items, this);
      } catch (e) {
        console.error(e);
      }
    });
  }
}


/**
 * A collection where entries have a key or label or index.
 * Examples of subclasses: ArrayColl (key = index), MapColl
 */
class KeyValueCollection extends Collection {
  constructor() {
    super();
  }

  /**
   * Sets the value for |key|
   *
   * @param key
   */
  set(key, item) {
  }

  /**
   * Gets the value for |key|
   *
   * If the key doesn't exist, returns |undefined|.
   * @param key
   */
  get(key) {
    throw "implement";
  }

  /**
   * Remove the key and its corresponding value item.
   *
   * undo set(key, item)
   */
  removeKey(key) {
    throw "implement";
  }

  /**
   * @returns {Boolean}
   */
  containsKey(key) {
    return this.get(key) != undefined;
  }

  /**
   * Searches the whole list for this |value|.
   * and if found, returns the (first) key for it.
   *
   * If not found, returns undefined.
   * @returns key
   */
  getKeyForValue(value) {
  }
}


/**
 * This listens to changes in the lists, to react on them.
 *
 * This is can be implemented by application code
 * and passed to Collection.registerObserver().
 *
 * Abstract class
 */
class CollectionObserver {
  constructor() {
  }

  /**
   * Called after an item has been added to the list.
   *
   * @param items {Array of Object} the added item
   * @param coll {Collection} the observed list. convenience only.
   */
  added(items, coll) {
    throw "implement";
  }

  /**
   * Called after an item has been removed from the list
   *
   * @param items {Array of Object} the removed item
   * @param coll {Collection} the observed list. convenience only.
   */
  removed(items, coll) {
    throw "implement";
  }
}






/*******************************************************
 * Basic operations
 *
 * This allows to merge collections to new collections,
 * based on certain operations like add, subtract, sort.
 *
 * The result collections are not static, but updated dynamically
 * when the base collections change, using observers.
 * The resulting collections can be observed as well, of course,
 * and you can chain operations.
 *
 * @see <https://wiki.mozilla.org/Jetpack/Collections>
 * @see <http://en.wikipedia.org/wiki/Set_theory>
 ********************************************************/

/**
 * Returns a collection that contains all values from coll1 and coll2.
 * If the same item is in both coll1 and coll2, it will be added only once.
 *
 * Union @see <http://en.wikipedia.org/wiki/Union_(set_theory)>
 *
 * @param coll1 {Collection}
 * @param coll2 {Collection}
 * @returns {Collection}
 *     Does not preserve order.
 */
function mergeColl(coll1, coll2) {
  return new AdditionCollection(coll1, coll2);
}
var addColl = mergeColl;

/**
 * Returns a collection that contains all values from coll1 and coll2.
 * If the same item is in both coll1 and coll2, it will be added twice.
 *
 * @param coll1 {Collection}
 * @param coll2 {Collection}
 * @returns {Collection}
 *     Preserves order
 */
function concatColl(coll1, coll2) {
  return new AdditionCollectionWithDups(coll1, coll2);
}
var addCollWithDups = concatColl;

/**
 * Returns a collection that contains all values from collBase,
 * apart from those in collSubtract.
 *
 * Set difference @see <http://en.wikipedia.org/wiki/Set_difference>
 *
 * @param collBase {Collection}
 * @param collSubtract {Collection}
 * @returns {Collection}
 *     Preserves order of collBase.
 */
function subtractColl(collBase, collSubtract) {
  return new SubtractCollection(collBase, collSubtract);
}

/**
 * Returns a collection that contains the values that are contained
 * in *both* coll1 and coll1, and only those.
 *
 * Intersection @see <http://en.wikipedia.org/wiki/Intersection_(set_theory)>
 *
 * @param coll1 {Collection}
 * @param coll2 {Collection}
 * @returns {Collection}
 *     Does not preserve order.
 */
function inCommonColl(coll1, coll2) {
  return new IntersectionCollection(coll1, coll2);
}
var andColl = inCommonColl;

/**
 * Returns a collection that contains all values that are contained
 * only in coll1 or coll2, but *not in both*.
 *
 * Symmetric difference <http://en.wikipedia.org/wiki/Symmetric_difference>
 *
 * @param coll1 {Collection}
 * @param coll2 {Collection}
 * @returns {Collection}
 *     Does not preserve order.
 */
function notInCommonColl(coll1, coll2) {
  return new SubtractCollection(
      new AdditionCollection(coll1, coll2),
      new IntersectionCollection(coll1, coll2));
}
var xorColl = notInCommonColl;



/*******************************************************
 * Collection implementations
 ******************************************************/


/**
 * A |KeyValueCollection| based on a JS Array.
 * Properties:
 * - ordered
 * - indexed: every item has an integer key
 * - can hold the same item several times
 * - fast
 */
class ArrayColl extends KeyValueCollection {
  /**
   * @param copyFrom {Array or Collection} init the collection with these values
   */
  constructor(copyFrom) {
    super();
    this._array = [];
    if (copyFrom instanceof Collection) {
      this._array = copyFrom.contents;
    } else if (copyFrom && copyFrom.length) {
      this._array = copyFrom.slice(0);
    }
  }

  /**
   * Adds this item to the end of the array.
   *
   * You can add them same object several times.
   */
  add(item) {
    this._array.push(item);
    this._notifyAdded([item], this);
  }

  _addWithoutObserver(item) {
    this._array.push(item);
  }

  /**
   * Removes first instance of this item.
   *
   * If you have added the same object 5 times,
   * you need to call remove() 5 times, or removeEach() once,
   * to remove them all.
   */
  remove(item) {
    _coll_arrayRemove(this._array, item, false);
    this._notifyRemoved([item], this);
  }

  _removeWithoutObserver(item) {
    _coll_arrayRemove(this._array, item, false);
  }

  addAll(items) {
    if (items instanceof Collection) {
      items = items.contents;
    }
    items.forEach(item => this._addWithoutObserver(item));
    this._notifyAdded(items, this);
  }

  removeAll(items) {
    if (items instanceof Collection) {
      items = items.contents;
    }
    items.forEach(item => this._removeWithoutObserver(item));
    this._notifyRemoved(items, this);
  }

  /**
   * Removes all instances of this item.
   *
   * If you have added the same object 5 times,
   * you need to call remove() 5 times, or removeEach() once,
   * to remove them all.
   */
  removeEach(item) {
    while (this.contains(item)) {
      this.remove(item);
    }
  }

  clear() {
    this._notifyRemoved(this.contents, this);
    this._array = [];
  }

  get length() {
    return this._array.length;
  }

  contains(item) {
    return this._array.indexOf(item) != -1;
  }

  // containsKey : defined in KeyValueCollection

  get contents() {
    return this._array.slice(); // return copy of array
  }

  get first() {
    return this._array[0];
  }

  getIndex(i) {
    return this._array[i];
  }

  getIndexRange(i, length) {
    if (!i) {
      return [];
    }
    return this._array.slice(i, i + length);
  }

  forEach(callback) {
    this._array.forEach(callback);
  }

  /**
   * Sets the value at index |i|
   * This is similar to array[i]
   *
   * @param key {Integer}
   */
  set(i, item) {
    assert(typeof(i) == "number");
    if (this._array.length > i && this._array[i] == item) {
      return;
    }
    var oldItem = this._array[i];
    this._array[i] = item;
    if (oldItem !== undefined) {
      this._notifyRemoved([oldItem], this);
    }
    if (item !== undefined) {
      this._notifyAdded([item], this);
    }
  }

  /**
   * Gets the value at index |i|
   *
   * If the key doesn't exist, returns null.
   * @param key {Integer}
   */
  get(i) {
    assert(typeof(i) == "number");
    return this._array[i];
  }

  removeKey(i) {
    var item = this._array[i];
    if (item == undefined) {
      return;
    }
    delete this._array[i];
    this._notifyRemoved([item], this);
  }

  getKeyForValue(value) {
    for (var i in this._array) {
      if (this._array[i] == value) {
        return i;
      }
    }
    return undefined;
  }
}



/**
 * Removes |element| from |array|.
 * @param array {Array} to be modified. Will be modified in-place.
 * @param element {Object} If |array| has a member that equals |element|,
 *    the array member will be removed.
 * @param all {boolean}
 *     if true: remove all occurences of |element| in |array.
 *     if false: remove only the first hit
 * @returns {Integer} number of hits removed (0, 1 or more)
 */
function _coll_arrayRemove(array, element, all) {
  var found = 0;
  var pos = 0;
  while ((pos = array.indexOf(element, pos)) != -1) {
    array.splice(pos, 1);
    found++
    if ( ! all) {
      return found;
    }
  }
  return found;
}

function _coll_sanitizeString(unchecked) {
  return String(unchecked);
};


/**
 * A |Collection| which can hold each object only once.
 * Properties:
 * - not ordered
 * - can *not* hold the same item several times
 * - fast
 */
class SetColl extends Collection {
  constructor() {
    super();
    this._array = [];
  }

  /**
   * Adds this item.
   * If the item already exists, this is a no-op.
   * @param item {Object}
   */
  add(item) {
    var added = _addWithoutObserver(item);
    if (added) {
      this._notifyAdded([item], this);
    }
  }

  _addWithoutObserver(item) {
    if ( !item && item !== 0) {
      throw "null objects are not allowed";
    }
    if (this.contains(item)) {
      return false;
    }
    this._array.push(item);
    return true;
  }

  remove(item) {
    _coll_arrayRemove(this._array, item, true);
    this._notifyRemoved([item], this);
  }

  _removeWithoutObserver(item) {
    _coll_arrayRemove(this._array, item, true);
  }

  addAll(items) {
    if (items instanceof Collection) {
      items = items.contents;
    }
    items.forEach(item => this._addWithoutObserver(item));
    this._notifyAdded(items, this);
  }

  removeAll(items) {
    if (items instanceof Collection) {
      items = items.contents;
    }
    items.forEach(item => this._removeWithoutObserver(item));
    this._notifyRemoved(items, this);
  }

  clear() {
    this._notifyRemoved(this.contents, this);
    this._array = [];
  }

  get length() {
    return this._array.length;
  }

  contains(item) {
    return this._array.indexOf(item) != -1;
  }

  get contents() {
    return this._array.slice(); // return copy of array
  }

  get first() {
    return this._array[0];
  }

  getIndex(i) {
    return this._array[i];
  }

  getIndexRange(i, length) {
    if (!i) {
      return [];
    }
    return this._array.slice(i, i + length);
  }

  forEach(callback) {
    this._array.forEach(callback);
  }
}



/**
 * A |KeyValueCollection| which can hold each object only once.
 * Properties:
 * - not ordered
 * - can *not* hold the same item several times
 * - fast
 */
class MapColl extends KeyValueCollection {
  constructor() {
    super();
    this._obj = {};
    this._nextFree = 0; // Hack to support add() somehow
  }

  /**
   * This doesn't make much sense for MapColl.
   * Please use set() instead.
   */
  add(value) {
    while (this.contains(this._nextFree)) {
      this._nextFree++;
    }
    this.set(this._nextFree++, value);
  }

  remove(value) {
    var key = this.getKeyForValue(value);
    if (!key) {
      throw "Item doesn't exist";
    }
    this.removeKey(key);
  }

  clear() {
    this._notifyRemoved(this.contents, this);
    this._obj = {};
  }

  get length() {
    var length = 0;
    for (let prop in this._obj) {
      length++;
    }
    return length;
  }

  get contents() {
    var array = [];
    for (let prop in this._obj) {
      let value = this._obj[prop];
      array.push(value);
    }
    return array;
  }

  get first() {
    return this.contents[0]; // is there a more efficient impl?
  }

  getIndex(i) {
    return this.contents[i];
  }

  getIndexRange(i, length) {
    if (!i) {
      return [];
    }
    return this.contents.slice(i, i + length);
  }

  contentKeys() {
    var array = [];
    for (let key in this._obj) {
      array.push(key);
    }
    return array;
  }

  contentKeyValues() {
    var obj = {};
    for (let key in this._obj) {
      obj[key] = value
    }
    return obj;
  }

  forEach(callback) {
    for (let prop in this._obj) {
      let value = this._obj[prop];
      callback(value);
    }
  }

  /*
  iterator*() {
    for (var prop in this._obj) {
      var value = this._obj[prop];
      yield value[i];
    }
  }*/

  contains(value) {
    return this.getKeyForValue(value) != undefined;
  }

  // containsKey : defined in KeyValueCollection

  /**
   * Sets the value for |key|
   *
   * @param key {String}
   */
  set(key, value) {
    key = _coll_sanitizeString(key);
    var oldValue = this._obj[key];
    if (oldValue == value) {
      return;
    }
    this._obj[key] = value;
    if (oldValue !== undefined) {
      this._notifyRemoved([oldValue], this);
    }
    if (value !== undefined) {
      this._notifyAdded([value], this);
    }
  }

  /**
   * Gets the value for |key|
   *
   * If the key doesn't exist, returns null.
   * @param key {String}
   */
  get(key) {
    key = _coll_sanitizeString(key);
    return this._obj[key];
  }

  removeKey(key) {
    key = _coll_sanitizeString(key);
    var value = this._obj[key];
    if (value == undefined) {
      return;
    }
    delete this._obj[key];
    this._notifyRemoved([value], this);
  }

  getKeyForValue(value) {
    for (var key in this._obj) {
      if (this._obj[key] == value) {
        return key;
      }
    }
    return undefined;
  }
}


/**
 * A |Collection| which wraps a DOMNodeList.
 * It is static, i.e. changes in the DOM are not reflected here.
 */
class DOMColl extends ArrayColl {
  /**
   * @param domlist {DOM NodeList}
   */
  constructor(domlist) {
    super();
    assert(typeof(domlist.item) == "function", "Not a DOMNodeList");
    var array = [];
    for (let i = 0, l = domlist.length; i < l; i++) {
      array.push(domlist[i]);
    }
  }

  add(value) {
    throw "immutable";
  }

  remove(value) {
    throw "immutable";
  }

  clear() {
    throw "immutable";
  }
}

/**
 * A |Collection| which wraps a DOMNodeList.
 * Changes in the DOM will be reflected here and
 * be sent to the observers.
 * TODO Not yet implemented
 *
class DynamicDOMColl extends Collection {
  constructor(domlist) {
    super();
    assert(typeof(domlist.item) == "function", "Not a DOMNodeList");
    this._domlist = domlist;
  }

  add(el) {
    throw "immutable";
  }

  remove(el) {
    throw "immutable";
  }

  clear() {
    this._notifyRemoved(this.contents, this);
    this._domlist = [];
  },

  get length() {
    return this._domlist.length;
  }

  get contents() {
    var array = [];
    for (let i = 0, l = this._domlist.length; i < l; i++) {
      let item = this._domlist.item(i);
      array.push(item);
    }
    return array;
  }

  forEach(callback) {
    for (let i = 0, l = this._domlist.length; i < l; i++) {
      let item = this._domlist[i];
      callback(item);
    }
  }
}
*/



//////////////////////////////////////
// Implementation of abstract function collections
//

/**
 * Shared ctor code for |AdditionCollection*|
 */
function _initAddition(self, coll1, coll2) {
  assert(coll1 instanceof Collection, "must be a Collection");
  assert(coll2 instanceof Collection, "must be a Collection");
  self._coll1 = coll1;
  self._coll2 = coll2;

  // add initial contents
  coll1.forEach(item => self.add(item));
  coll2.forEach(item => self.add(item));

  coll1.registerObserver(self);
  coll2.registerObserver(self);
}

/**
 * Superset
 * Does not allow duplicates
 * E.g. A = abcd, B = bdef, then with addition = abcdef.
 */
class AdditionCollection extends SetColl {
  constructor(coll1, coll2) {
    super();
    _initAddition(this, coll1, coll2);
  }

  // Implement CollectionObserver
  added(items) {
    //this.addAll(items); -- also works, but leaves de-duping to SetColl
    this.addAll(items.filter(item => !this.contains(item)));
  }

  removed(items, coll) {
     // if the item was in both colls, but now is in only one,
     // we need to keep it in the result.
     // SetColl.remove() would not keep it at all anymore.
    //var otherColl = coll == this._coll1 ? this._coll2 : this._coll1;
    //if (otherColl.contains(item))
    //  return;
    this.removeAll(items.filter(item =>
      !(this._coll1.contains(item) || this._coll2.contains(item))
    ));
  }
}

/**
 * Superset
 * Allows duplicates
 * E.g. A = abcd, B = bdef, then addition with dups = abcdbdef.
 */
class AdditionCollectionWithDups extends ArrayColl {
  constructor(coll1, coll2) {
    super();
    _initAddition(this, coll1, coll2);
  }

  // Implement CollectionObserver
  added(items) {
    this.addAll(items);
  }

  removed(items, coll) {
    this.removeAll(items);
  }
}

/**
 * Removes the second coll from the first.
 * E.g. A = abcd, B = bdef, then substract = ac
 */
class SubtractCollection extends ArrayColl {
  constructor(collBase, collSubtract) {
    super();
    assert(collBase instanceof Collection, "must be a Collection");
    assert(collSubtract instanceof Collection, "must be a Collection");
    this._collBase = collBase;
    this._collSubtract = collSubtract;

    // add initial contents
    this._reconstruct();

    var self = this;
    collBase.registerObserver({
      // Implement CollectionObserver
      added : function(items, coll) {
        // add(this) doesn't preserve original order
        var addItems = items.filter(item => !self._collSubtract.contains(item));
        if (addItems.length) {
          self._reconstruct();
          self._notifyAdded(addItems);
        }
      },
      removed : function(items, coll) {
        items.forEach(item => {
          if (self._collSubtract.contains(item)) {
            return;
          }
          self.removeEach(item);
        });
      },
    });
    collSubtract.registerObserver({
      // Implement CollectionObserver
      added : function(items, coll) {
        self.removeAll(items);
      },
      removed : function(items, coll) {
        // add(this) -- doesn't preserve original order
        var addItems = items.filter(item => self._collBase.contains(item));
        if (addItems.length) {
          self._reconstruct();
          self._notifyAdded(addItems);
        }
      },
    });
  }

  _reconstruct() {
    var sub = this._collSubtract;
    this._collBase.forEach(item => {
      if ( !sub.contains(item)) {
        this._addWithoutObserver(item);
      }
    });
  }
}

/**
 * Returns a subset of |source|.
 * Which items will be included is defined by |filterFunc|.
 * This works like Array.filter().
 *
 * It's observable, i.e. if |source| changed and |filterFunc| matches,
 * items will be added and the observers called.
 *
 * @param source {Collection}   Another collection that is to be filtered
 * @param filterFunc {Function(item)}
 *     |item| will be included in FilteredCollection, (only) if |true| is returned
 */
class FilteredCollection extends ArrayColl {
  constructor(source, filterFunc) {
    super();
    assert(typeof(filterFunc) == "function", "must be a function");
    assert(source instanceof Collection, "must be a Collection");
    //this._source = source;
    this._filterFunc = filterFunc;

    // add initial contents
    source.forEach(item => {
      if (filterFunc(item)) {
        this._addWithoutObserver(item);
      }
    });

    source.registerObserver(this);
  }

  // Implement CollectionObserver
  added(items) {
    this.addAll(items.filter(item => this._filterFunc(item)));
  }

  removed(items, coll) {
    this.removeAll(items.filter(item => this.contains(item)));
  }
}

/**
 * For each item in |source|, returns another item defined by |mapFunc()|.
 * This works like Array.map().
 *
 * It's observable, i.e. if |source| changed,
 * mapped items will be added and the observers called.
 * TODO removed() observer may not work properly
 *
 * @param source {Collection}   Another collection that is to be filtered
 * @param mapFunc {Function(item)}
 *     The result will be included in MapToCollection
 */
class MapToCollection extends ArrayColl {
  constructor(source, mapFunc) {
    super();
    assert(typeof(mapFunc) == "function", "must be a function");
    assert(source instanceof Collection, "must be a Collection");
    //this._source = source;
    this._mapFunc = mapFunc;

    // add initial contents
    source.forEach(item => this._addWithoutObserver(mapFunc(item)));

    source.registerObserver(this);
  }

  // Implement CollectionObserver
  added(items) {
    this.addAll(items.map(item => this._mapFunc(item)));
  }

  removed(items, coll) {
    var mappedRemovedItems = items.map(item => this._mapFunc(item));
    this.removeAll(this.filter(mappedItem =>
      mappedRemovedItems.indexOf(mappedItem) != -1  // TODO Will not work with |Object|s
    ));
  }
}


/**
 * Has only those items that are in both coll1 and in coll2.
 * E.g. A = abcd, B = bdef, then intersection = bd.
 */
class IntersectionCollection extends SetColl {
  constructor(coll1, coll2) {
    super();
    assert(coll1 instanceof Collection, "must be a Collection");
    assert(coll2 instanceof Collection, "must be a Collection");
    this._coll1 = coll1;
    this._coll2 = coll2;

    // add initial contents
    coll1.forEach(item => {
      if (coll2.contains(item)) {
        this._addWithoutObserver(item);
      }
    });

    coll1.registerObserver(this);
    coll2.registerObserver(this);
  }

  // Implement CollectionObserver
  added(items) {
    this.addAll(items.filter(item =>
      this._coll1.contains(item) &&
      this._coll2.contains(item) &&
      !this.contains(item)
    ));
  }

  removed(items, coll) {
    this.removeAll(items.filter(item => this.contains(item)));
  }
}


/**
 * Returns a new collection that is sorted based on the |sortFunc|.
 *
 * TODO Stable sort, even with observers?
 *
 * @param coll {Collection}
 * @param sortFunc(a {Item}, b {Item})
 *     returns {Boolean} a > b // TODO stable sort? {Integer: -1: <, 0: =, 1: >}
 * @returns {Collection}
 */
function sortColl(coll, sortFunc) {
  throw new "not yet implemented"
}



/**
 * Implements the |Collection| API, but forwards
 * all function calls to a another |Collection| implementation.
 */
class DelegateCollection extends Collection {
  constructor(base) {
    super();
    this._observers = null;
    assert(base instanceof Collection);
    this._base = base;
  }

  add(item) {
    this._base.add(item);
  }
  remove(item) {
    this._base.remove(item);
  }
  clear() {
    this._base.clear();
  }
  get length() {
    return this._base.length;
  }
  get isEmpty() {
    return this._base.isEmpty;
  }
  contains(item) {
    return this._base.contains(item);
  }
  get contents() {
    return this._base.contents;
  }
  get first() {
    return this._base.first;
  }
  getIndex(i) {
    return this._base.getIndex(i);
  }
  getIndexRange(i, length) {
    return this._base.getIndexRange(i, length);
  }
  forEach(callback) {
    this._base.forEach(callback);
  }
  registerObserver(observer) {
    this._base.registerObserver(observer);
  }
  unregisterObserver(observer) {
    this._base.unregisterObserver(observer);
  }
}


// Util functions

function assert(test, errorMsg) {
  if (!test) {
    throw new Error(errorMsg ? errorMsg : "Bug: assertion failed");
  }
}

if (typeof(exports) == "undefined") {
  exports = {};
}
exports.CollectionObserver = CollectionObserver;
exports.Collection = Collection;
exports.KeyValueCollection = KeyValueCollection;
exports.DelegateCollection = DelegateCollection;
exports.ArrayColl = ArrayColl;
exports.SetColl = SetColl;
exports.MapColl = MapColl;
exports.DOMColl = DOMColl;
exports.mergeColl = mergeColl;
exports.concatColl = concatColl;
exports.subtractColl = subtractColl;
exports.inCommonColl = inCommonColl;
exports.notInCommonColl = notInCommonColl;
exports.sortColl = sortColl;
