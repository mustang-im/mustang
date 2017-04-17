/*************************
 * name: Collection classes
 * description: List classes like ArrayColl, SetColl, MapColl, with observers and operators
 * copyright: Ben Bucksch of Beonex
 * license: MIT
 * version: 0.1
 ****************************/

// util functions needed:
// extend(), assert()

/**
 * This defines the common base API for all collections and operators
 */
function Collection() {
  this._observers = [];
}
Collection.prototype = {
  _observers : null,

  /**
   * Adds one item to the list
   * @param item {Object} any JS object
   */
  add : function(item) {
    throw "implement";
  },

  /**
   * Compat with JS |Array|
   */
  push : function(item) {
    this.add(item);
  },

  /**
   * Removes one item from the list
   * @param item {Object} any JS object
   */
  remove : function(item) {
    throw "implement";
  },

  /**
   * Add all items in |coll| to this list.
   * This is just a convenience function.
   * This adds items statically and does not observe the |coll| changes.
   * Consider using addColl() instead.
   *
   * Note: This is intentionally not overloading |add|.
   * @param coll {Collection or JS Array}
   */
  addAll : function(coll) {
    coll.forEach(function(item) {
      this.add(item);
    }, this);
  },

  /**
   * Removes all items in |coll| from this list
   * @see addAll()
   * @param coll {Collection or JS Array}
   */
  removeAll : function(coll) {
    coll.forEach(function(item) {
      this.remove(item);
    }, this);
  },

  /**
   * Removes all items from the list.
   */
  clear : function() {
    throw "implement";
  },

  /**
   * The number of items in this list
   * @returns {Integer} (always >= 0)
   */
  get length() {
    throw "implement";
  },

  /**
   * Whether there are items in this list
   * @returns {Boolean}
   */
  get isEmpty() {
    return this.length == 0;
  },

  /**
   * Checks whether this item is in the list.
   * @returns {Boolean}
   */
  contains : function(item) {
    return this.contents.indexOf(item) != -1;
  },

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
  contents : function() {
    throw "implement";
  },

  /**
   * The first item in the list
   * @returns {Object}
   * null, if the list is empty
   */
  get first() {
    throw "implement";
  },



  forEach : function(callback, self) {
    this.contents.forEach(callback, self);
  },

  /**
   * @param filterFunc {Function(item)}
   * @returns {Array of items} where |filterFunc| returned |true|
   */
  filter : function(filterFunc, self) {
    return new FilteredCollection(this, filterFunc, self);
  },

  /**
   * @returns first matching item or |undefined|
   */
  find : function(filterFunc, self) {
    var result = undefined;
    this.forEach(function(item) {
      if ( !result && filterFunc.call(self, item)) {
        result = item;
      }
    }, this);
    return result;
  },

  map : function(mapFunc, self) {
    return new MapToCollection(this, mapFunc, self);
  },

  /**
   * Provides an iterator, i.e. allows to write:
   * var coll = new SetColl();
   * for each (var item in coll)
   *   debug(item);
   *
   * Subclasses may override this with a more
   * efficient implementation. But take care that
   * a remove() during the iteration doesn't confuse it.
   *
  iterator : function() {
    var items = this.contents();
    for (var i = 0; i < items.length; i++) {
      yield items[i];
    }
  },
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
  concat : function(otherColl) {
    return new AdditionCollection(this, otherColl);
  },

  /**
   * operator +
   * [Union](http://en.wikipedia.org/wiki/Union_(set_theory))
   * Returns a collection that contains all values from both collections.
   * If the same item is in both collections, it will be added only once.
   * @param otherColl {Collection}
   * @returns {Collection} Does not preserve order.
   */
  merge : function(otherColl) {
    return new AdditionCollectionWithDups(this, otherColl);
  },

  /**
   * operator -
   * [Set difference](http://en.wikipedia.org/wiki/Set_difference)
   * Returns a collection that contains all values from |this|, apart from those in collSubtract.
   * @param collSubtract {Collection}
   * @returns {Collection} Preserves order of collBase.
   */
  subtract : function(collSubtract) {
    return new SubtractCollection(this, collSubtract);
  },

  /**
   * operator &
   * [Intersection](http://en.wikipedia.org/wiki/Intersection_(set_theory))
   * Returns a collection that contains the values that are contained
   * in *both* collections, and only those.
   * @param otherColl {Collection}
   * @returns {Collection} Does not preserve order.
   */
  inCommon : function(otherColl) {
  return new IntersectionCollection(this, otherColl);
  },

  /**
   * operator xor
   * [Symmetric difference](http://en.wikipedia.org/wiki/Symmetric_difference)
   * Returns a collection that contains all values that are contained only in |this| or in |otherColl|, but not in both.
   * @param otherColl {Collection}
   * @returns {Collection} Does not preserve order.
   */
  notInCommon : function(otherColl) {
    notInCommonColl(this, otherColl);
  },

  /**
   * @param sortFunc {Function(item)} like Array.sort()
   * @returns {Array of items} sorted by |sortFunc|
   */
  sort : function(sortFunc) {
    sortColl(this, sortFunc);
  },



  // Observer

  /**
   * Pass an object that will be called when
   * items are added or removed from this list.
   *
   * If you call this twice for the same observer, the second is a no-op.
   * @param observer {CollectionObserver}
   */
  registerObserver : function(observer) {
    assert(observer);
    assert(typeof(observer.added) == "function",
        "must implement CollectionObserver");
    if (this._observers.indexOf(observer) != -1) // already contains it
      return;
    this._observers.push(observer);
  },

  /**
   * undo |registerObserver|
   * @param observer {CollectionObserver}
   */
  unregisterObserver : function(observer) {
    assert(observer);
    assert(typeof(observer.added) == "function" &&
           typeof(observer.removed) == "function",
        "must implement CollectionObserver");
    _coll_arrayRemove(this._observers, observer, true);
  },

  _notifyAdded : function(item) {
    this._observers.forEach(function(observer) {
      try {
        observer.added(item, this);
      } catch (e) {
        console.error(e);
      }
    }, this);
  },

  _notifyRemoved : function(item) {
    this._observers.forEach(function(observer) {
      try {
        observer.removed(item, this);
      } catch (e) {
        console.error(e);
      }
    }, this);
  },
}


/**
 * A collection where entries have a key or label or index.
 * Examples of subclasses: ArrayColl (key = index), MapColl
 */
function KeyValueCollection() {
  Collection.call(this);
}
KeyValueCollection.prototype = {

  /**
   * Sets the value for |key|
   *
   * @param key
   */
  set : function(key, item) {
  },

  /**
   * Gets the value for |key|
   *
   * If the key doesn't exist, returns |undefined|.
   * @param key
   */
  get : function(key) {
    throw "implement";
  },

  /**
   * Remove the key and its corresponding value item.
   *
   * undo set(key, item)
   */
  removeKey : function(key) {
    throw "implement";
  },

  /**
   * @returns {Boolean}
   */
  containsKey : function(key) {
    return this.get(key) != undefined;
  },

  /**
   * Searches the whole list for this |value|.
   * and if found, returns the (first) key for it.
   *
   * If not found, returns undefined.
   * @returns key
   */
  getKeyForValue : function(value) {
  },

}
extend(KeyValueCollection, Collection);


/**
 * This listens to changes in the lists, to react on them.
 *
 * This is can be implemented by application code
 * and passed to Collection.registerObserver().
 */
function CollectionObserver() {
  throw "abstract class";
}
CollectionObserver.prototype = {

  /**
   * Called after an item has been added to the list.
   *
   * @param item {Object} the removed item
   * @param coll {Collection} the observed list. convenience only.
   */
  added : function(item, coll) {
    throw "implement";
  },

  /**
   * Called after an item has been removed from the list
   *
   * TODO should clear() call removed() for each item?
   * Currently: yes.
   *
   * @param item {Object} the removed item
   * @param coll {Collection} the observed list. convenience only.
   */
  removed : function(item, coll) {
    throw "implement";
  },
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
 *
 * @param copyFrom {Array or Collection} init the collection with these values
 */
function ArrayColl(copyFrom) {
  KeyValueCollection.call(this);
  this._array = [];
  if (copyFrom instanceof Collection) {
    this._array = copyFrom.contents;
  } else if (copyFrom && copyFrom.length) {
    this._array = copyFrom.slice(0);
  }
}
ArrayColl.prototype = {

  /**
   * Adds this item to the end of the array.
   *
   * You can add them same object several times.
   */
  add : function(item) {
    this._array.push(item);
    this._notifyAdded(item, this);
  },

  _addWithoutObserver : function(item) {
    this._array.push(item);
  },

  /**
   * Removes first instance of this item.
   *
   * If you have added the same object 5 times,
   * you need to call remove() 5 times, or removeEach() once,
   * to remove them all.
   */
  remove : function(item) {
    _coll_arrayRemove(this._array, item, false);
    this._notifyRemoved(item, this);
  },

  _removeWithoutObserver : function(item) {
    _coll_arrayRemove(this._array, item, false);
  },

  /**
   * Removes all instances of this item.
   *
   * If you have added the same object 5 times,
   * you need to call remove() 5 times, or removeEach() once,
   * to remove them all.
   */
  removeEach : function(item) {
    while (this.contains(item)) {
      this.remove(item);
    }
  },

  clear : function() {
    this._array.forEach(function(item) {
      this._notifyRemoved(item, this);
    }, this);
    this._array = [];
  },

  get length() {
    return this._array.length;
  },

  contains : function(item) {
    return this._array.indexOf(item) != -1;
  },

  // containsKey : defined in KeyValueCollection

  contents : function() {
    return this._array.slice(); // return copy of array
  },

  get first() {
    return this._array[0];
  },

  forEach : function(callback, self) {
    this._array.forEach(callback, self);
  },

  /**
   * Sets the value at index |i|
   * This is similar to array[i]
   *
   * @param key {Integer}
   */
  set : function(i, item) {
    assert(typeof(i) == "number");
    if (this._array.length > i && this._array[i] == item)
      return;
    var oldItem = this._array[i];
    this._array[i] = item;
    if (oldItem !== undefined)
      this._notifyRemoved(oldItem, this);
    if (item !== undefined)
      this._notifyAdded(item, this);
  },

  /**
   * Gets the value at index |i|
   *
   * If the key doesn't exist, returns null.
   * @param key {Integer}
   */
  get : function(i) {
    assert(typeof(i) == "number");
    return this._array[i];
  },

  removeKey : function(i) {
    var item = this._array[i];
    if (item == undefined)
      return;
    delete this._array[i];
    this._notifyRemoved(item, this);
  },

  getKeyForValue : function(value) {
    for (var i in this._array) {
      if (this._array[i] == value)
        return i;
    }
    return undefined;
  },

}
extend(ArrayColl, KeyValueCollection);



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
function _coll_arrayRemove(array, element, all)
{
  var found = 0;
  var pos = 0;
  while ((pos = array.indexOf(element, pos)) != -1)
  {
    array.splice(pos, 1);
    found++
    if ( ! all)
      return found;
  }
  return found;
}

function _coll_sanitizeString(str) {
  return String(unchecked);
};


/**
 * A |Collection| which can hold each object only once.
 * Properties:
 * - not ordered
 * - can *not* hold the same item several times
 * - fast
 */
function SetColl() {
  Collection.call(this);
  this._array = [];
}
SetColl.prototype = {

  /**
   * Adds this item.
   * If the item already exists, this is a no-op.
   * @param item {Object}
   */
  add : function(item) {
    this._addWithoutObserver(item);
    this._notifyAdded(item, this);
  },

  _addWithoutObserver : function(item) {
    if ( !item && item !== 0)
      throw "null objects are not allowed";
    if (this.contains(item))
      return;
    this._array.push(item);
  },

  remove : function(item) {
    _coll_arrayRemove(this._array, item, true);
    this._notifyRemoved(item, this);
  },

  _removeWithoutObserver : function(item) {
    _coll_arrayRemove(this._array, item, true);
  },

  clear : function() {
    this._array.forEach(function(item) {
      this._notifyRemoved(item, this);
    }, this);
    this._array = [];
  },

  get length() {
    return this._array.length;
  },

  contains : function(item) {
    return this._array.indexOf(item) != -1;
  },

  contents : function() {
    return this._array.slice(); // return copy of array
  },

  get first() {
    return this._array[0];
  },

  forEach : function(callback, self) {
    this._array.forEach(callback, self);
  },
}
extend(SetColl, Collection);



/**
 * A |KeyValueCollection| which can hold each object only once.
 * Properties:
 * - not ordered
 * - can *not* hold the same item several times
 * - fast
 */
function MapColl() {
  Collection.call(this);
  this._obj = {};
}
MapColl.prototype = {
  _nextFree : 0, // Hack to support add() somehow

  /**
   * This doesn't make much sense for MapColl.
   * Please use set() instead.
   */
  add : function(value) {
    while (this.contains(this._nextFree))
      this._nextFree++;
    this.set(this._nextFree++, value);
  },

  remove : function(value) {
    var key = this.getKeyForValue(value);
    if (!key)
      throw "item doesn't exist";
    this.removeKey(key);
  },

  clear : function() {
    for (var prop in this._obj) {
      var value = this._obj[prop];
      this._notifyRemoved(value, this);
    }
    this._obj = {};
  },

  get length() {
    var length = 0;
    for (var prop in this._obj) {
      length++;
    }
    return length;
  },

  contents : function() {
    var array = [];
    for (var prop in this._obj) {
      var value = this._obj[prop];
      array.push(value);
    }
    return array;
  },

  get first() {
    return this.contents[0]; // is there a more efficient impl?
  },

  contentKeys : function() {
    var array = [];
    for (var key in this._obj)
      array.push(key);
    return array;
  },

  contentKeyValues : function() {
    var obj = {};
    for (var key in this._obj)
      obj[key] = value
    return obj;
  },

  forEach : function(callback, self) {
    for (var prop in this._obj) {
      var value = this._obj[prop];
      callback.call(self, value);
    }
  },

  /*
  iterator : function() {
    for (var prop in this._obj) {
      var value = this._obj[prop];
      yield value[i];
    }
  },*/

  contains : function(value) {
    return this.getKeyForValue(value) != undefined;
  },

  // containsKey : defined in KeyValueCollection

  /**
   * Sets the value for |key|
   *
   * @param key {String}
   */
  set : function(key, value) {
    key = _coll_sanitizeString(key);
    var oldValue = this._obj[key];
    this._obj[key] = value;
    if (oldValue !== undefined)
      this._notifyRemoved(oldValue, this);
    if (value !== undefined)
      this._notifyAdded(value, this);
  },

  /**
   * Gets the value for |key|
   *
   * If the key doesn't exist, returns null.
   * @param key {String}
   */
  get : function(key) {
    key = _coll_sanitizeString(key);
    return this._obj[key];
  },

  removeKey : function(key) {
    key = _coll_sanitizeString(key);
    var value = this._obj[key];
    if (value == undefined)
      return;
    delete this._obj[key];
    this._notifyRemoved(value, this);
  },

  getKeyForValue : function(value) {
    for (var key in this._obj) {
      if (this._obj[key] == value)
        return key;
    }
    return undefined;
  },

}
extend(MapColl, KeyValueCollection);


/**
 * A |Collection| which wraps a DOMNodeList.
 * It is static, i.e. changes in the DOM are not reflected here.
 */
function DOMColl(domlist) {
  assert(typeof(domlist.item) == "function", "Not a DOMNodeList");
  var array = [];
  for (var i = 0, l = domlist.length; i < l; i++) {
    array.push(domlist[i]);
  }
  ArrayColl.call(this, array);
}
DOMColl.prototype = {
  add : function(value) {
    throw "immutable";
  },

  remove : function(value) {
    throw "immutable";
  },

  clear : function() {
    throw "immutable";
  },
}
extend(DOMColl, ArrayColl);

/**
 * A |Collection| which wraps a DOMNodeList.
 * Changes in the DOM will be reflected here and
 * be sent to the observers.
 * TODO Not yet implemented
 *
function DynamicDOMColl(domlist) {
  Collection.call(this);
  assert(typeof(domlist.item) == "function", "Not a DOMNodeList");
  this._domlist = domlist;
}
DynamicDOMColl.prototype = {
  /**
   * Adds this element to the DOM, at the end
   *
  add : function(el) {
    throw "immutable";
  },
  /**
   * Removes this element from the DOM
   *
  remove : function(el) {
    throw "immutable";
  },

  /**
   * Removes all child elements from the DOM
   *
  clear : function() {
    this.contents.forEach(function(item) {
      this._notifyRemoved(item, this);
    }, this);
    this._domlist = [];
  },

  get length() {
    return this._domlist.length;
  },

  contents : function() {
    var array = [];
    for (var i = 0, l = this._domlist.length; i < l; i++) {
      var item = this._domlist.item(i);
      array.push(item);
    }
    return array;
  },

  forEach : function(callback, self) {
    for (var i = 0, l = this._domlist.length; i < l; i++) {
      var item = this._domlist[i];
      callback.call(self, item);
    }
  },
}
extend(DynamicDOMColl, Collection);
*/



//////////////////////////////////////
// Implementation of abstract function collections
//

/**
 * Shared ctor code for |AdditionCollection*|
 */
function initAddition(self, coll1, coll2) {
  assert(coll1 instanceof Collection, "must be a Collection");
  assert(coll2 instanceof Collection, "must be a Collection");
  self._coll1 = coll1;
  self._coll2 = coll2;

  // add initial contents
  coll1.forEach(function(item) {
    self.add(item);
  }, self);
  coll2.forEach(function(item) {
    self.add(item);
  }, self);

  coll1.registerObserver(self);
  coll2.registerObserver(self);
}

/**
 * Superset
 * Does not allow duplicates
 * E.g. A = abcd, B = bdef, then with addition = abcdef.
 */
function AdditionCollection(coll1, coll2) {
  SetColl.call(this);
  initAddition(this, coll1, coll2);
}
AdditionCollection.prototype = {
  // Implement CollectionObserver
  added : function(item) {
    this.add(item);
  },
  removed : function(item, coll) {
     // if the item was in both colls, but now is in only one,
     // we need to keep it in the result.
     // SetColl.remove() would not keep it at all anymore.
    //var otherColl = coll == this._coll1 ? this._coll2 : this._coll1;
    //if (otherColl.contains(item))
    //  return;
    if (this._coll1.contains(item) || this._coll2.contains(item))
      return;
    this.remove(item);
  },
}
extend(AdditionCollection, SetColl);

/**
 * Superset
 * Allows duplicates
 * E.g. A = abcd, B = bdef, then addition with dups = abcdbdef.
 */
function AdditionCollectionWithDups(coll1, coll2) {
  ArrayColl.call(this);
  initAddition(this, coll1, coll2);
}
AdditionCollection.prototype = {
  // Implement CollectionObserver
  added : function(item) {
    this.add(item);
  },
  removed : function(item, coll) {
    this.remove(item);
  },
}
extend(AdditionCollection, ArrayColl);

/**
 * Removes the second coll from the first.
 * E.g. A = abcd, B = bdef, then substract = ac
 */
function SubtractCollection(collBase, collSubtract) {
  ArrayColl.call(this);
  assert(collBase instanceof Collection, "must be a Collection");
  assert(collSubtract instanceof Collection, "must be a Collection");
  this._collBase = collBase;
  this._collSubtract = collSubtract;

  // add initial contents
  this._reconstruct();

  var self = this;
  collBase.registerObserver({
    // Implement CollectionObserver
    added : function(item, coll) {
      if (self._collSubtract.contains(item))
        return;
      // this.add(this); -- doesn't preserve original order
      self._reconstruct();
      self._notifyAdded(item);
    },
    removed : function(item, coll) {
      if (self._collSubtract.contains(item))
        return;
      self.removeEach(item);
    },
  });
  collSubtract.registerObserver({
    // Implement CollectionObserver
    added : function(item, coll) {
      self.removeEach(item);
    },
    removed : function(item, coll) {
      if (self._collBase.contains(item)) {
        // this.add(this); -- doesn't preserve original order
        self._reconstruct();
        self._notifyAdded(item);
      }
    },
  });
}
SubtractCollection.prototype = {
  _reconstruct : function() {
    var sub = this._collSubtract;
    this._collBase.forEach(function(item) {
      if ( !sub.contains(item)) {
        this._addWithoutObserver(item);
      }
    }, this);
  },
}
extend(SubtractCollection, ArrayColl);

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
 * @param self {Objecŧ}   Will be passed as |this| to filterFunc
 */
function FilteredCollection(source, filterFunc, self) {
  ArrayColl.call(this);
  assert(source instanceof Collection, "must be a Collection");
  this._source = source;
  this._filterFunc = filterFunc;
  this._self = self;

  // add initial contents
  source.forEach(function(item) {
    if (filterFunc.call(self, item)) {
      this._addWithoutObserver(item);
    }
  }, this);

  source.registerObserver(this);
}
FilteredCollection.prototype = {
  // Implement CollectionObserver
  added : function(item) {
    if (this._filterFunc.call(self, item)) {
      this.add(item);
    }
  },
  removed : function(item, coll) {
    if ( !this.contains(item)) {
      return;
    }
    this.remove(item);
  },
}
extend(FilteredCollection, ArrayColl);

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
 * @param self {Objecŧ}   Will be passed as |this| to mapFunc
 */
function MapToCollection(source, mapFunc, self) {
  ArrayColl.call(this);
  assert(source instanceof Collection, "must be a Collection");
  this._source = source;
  this._mapFunc = mapFunc;
  this._self = self;

  // add initial contents
  source.forEach(function(item) {
    this._addWithoutObserver(mapFunc.call(self, item));
  }, this);

  source.registerObserver(this);
}
MapToCollection.prototype = {
  // Implement CollectionObserver
  added : function(item) {
    this.add(this._mapFunc.call(self, item));
  },
  removed : function(item, coll) {
    var mappedItem = this._mapFunc.call(self, item);
    this.forEach(function(curItem) {
      if (curItem == mappedItem) { // TODO Will not work with |Object|s
        this.remove(curItem);
      }
    }, this);
  },
}
extend(MapToCollection, ArrayColl);


/**
 * Has only those items that are in both coll1 and in coll2.
 * E.g. A = abcd, B = bdef, then intersection = bd.
 */
function IntersectionCollection(coll1, coll2) {
  SetColl.call(this);
  assert(coll1 instanceof Collection, "must be a Collection");
  assert(coll2 instanceof Collection, "must be a Collection");
  this._coll1 = coll1;
  this._coll2 = coll2;

  // add initial contents
  coll1.forEach(function(item) {
    if (coll2.contains(item))
      this._addWithoutObserver(item);
  }, this);

  coll1.registerObserver(this);
  coll2.registerObserver(this);
}
IntersectionCollection.prototype = {
  // Implement CollectionObserver
  added : function(item) {
    if (this._coll1.contains(item) &&
        this._coll2.contains(item) &&
        !this.contains(item)) {
      this.add(item);
    }
  },
  removed : function(item, coll) {
    if ( !this.contains(item))
      return;
    this.remove(item);
  },
}
extend(IntersectionCollection, SetColl);


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
function DelegateCollection(base) {
  assert(base instanceof Collection);
  this._base = base;
}
DelegateCollection.prototype = {
  add : function(item) {
    this._base.add(item);
  },
  remove : function(item) {
    this._base.remove(item);
  },
  clear : function() {
    this._base.clear();
  },
  get length() {
    return this._base.length;
  },
  get isEmpty() {
    return this._base.isEmpty;
  },
  contains : function(item) {
    return this._base.contains(item);
  },
  contents : function() {
    return this._base.contents();
  },
  get first() {
    return this._base.first;
  },
  forEach : function(callback, self) {
    this._base.forEach(callback, self);
  },
  registerObserver : function(observer) {
    this._base.registerObserver(observer);
  },
  unregisterObserver : function(observer) {
    this._base.unregisterObserver(observer);
  },
}
extend(DelegateCollection, Collection);


// Util functions

/**
 * Create a subtype.
 */
function extend(child, supertype)
{
  child.prototype.__proto__ = supertype.prototype;
}

function assert(test, errorMsg)
{
  if (!test)
    throw new Error(errorMsg ? errorMsg : "Bug: assertion failed");
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
