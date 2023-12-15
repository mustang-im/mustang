/**
There are many HTML tree widget implementations out there, but most fail when you start
pushing 100000 entries in there. The problem is that most create a DOM nodes for
every line and cell, and once you get to a million DOM nodes, that's a noticeable
load time and costs RAM. For Thunderbird, we need to render folders with tens of thousands
and a hundred thousand emails.

Here's a prototype. This is just a start. It doesn't contain tree functionality yet, just a table.
The tree functionality would be added on top. There are also many things to be polished:
* styling
* alignment
* fixing column width to not change while scrolling
* etc.

But the basic idea of a fast list is working. It's loading 100000 entries on load, and you can
add 100000 more on a button click. You will notice that the addition is very fast.
More importantly, scrolling is very fast. Scrolling should work both using the scroll bar and
using the mouse wheel.

Try it out at http://benbucksch.github.io/trex/fastlist-test.html

The basic trick is that I don't create DOM nodes for every rows, but only for the 10 or so
visible rows. The data is in a pure data array. When the user scrolls, we do not move or
destroy DOM nodes, but merely replace their text content and leave the nodes in place.
We then listen to mouse wheel scroll events, and scroll correspondingly.
The scroll bar at the right is a dummy element, and we set the inner height of it to the
calculated height in px that the rows would have, if all rows would be DOM nodes.
Then we listen to scroll events again, and translate them to corresponding row content changes.

From what I understand, that is the basic principle that XUL `<tree>`s also work with.
Just that XUL `<tree>`s are implemented in C++, and I implemented it in JavaScript
and HTML. (And HTML was the most painful part in it.)

The coolest thing is that we're no longer limited to a single line per row, and we can have
rich HTML content in each cell. XUL `<tree>`s can do neither, and that's a major limitation.
We've always wanted to make the message list prettier, but we couldn't. Now we can.
*/

import { ArrayColl } from "jscollections"
import { assert } from "../util/util";
import { cE, removeElement, cleanElement, nodeListToArray } from "../util/uiutil";

export class Fastlist {
  constructor(element) {
    assert(element && element.localName == "fastlist", "need <fastlist> element");
    element.widget = this;

    /**
     * {<fastlist> DOMElement}
     */
    this._listE = element;

    this._listE.addEventListener("wheel", event => this._onScrollWheel(event), false);
    this._listE.addEventListener("click", event => this._onClick(event), false);

    var tableE = cE(this._listE, "table", null, { cellspacing: 0 });
    var headerRowE = this._listE.querySelector("header");
    removeElement(headerRowE);
    var theadE = cE(tableE, "thead");
    theadE.appendChild(headerRowE);

    /**
     * Where the actual rows are added.
     * {<vbox> DOMElement}
     */
    this._contentE = cE(tableE, "tbody", "content", { flex: 1 });

    /**
     * A dummy element that displays a scrollbar.
     * {<vbox> DOMElement}
     */
    this._scrollbarE = cE(this._listE, "div", "scrollbar");

    this._scrollbarE.addEventListener("scroll", event => this._onScrollBar(event), false);

    /**
     * The dummy content of the scrollbar, to set the right height.
     * {<vbox> DOMElement}
     */
    this._scrollbarContentE = cE(this._scrollbarE, "div", "scrollbar-content");

    /**
     * Original, empty template for a row.
     * Not visible.
     * {<row> DOMElement}
     */
    this._rowTemplate = this._listE.querySelector("row");

    assert(this._rowTemplate, "Fastlist needs a row template");

    /**
     * Currently displayed rows.
     * {Array of <row> DOMElement}
     */
    this._rowElements = [];

    /**
      * Height of the DOM elements for a single row
      * {integer} in px
      */
    this._rowHeight = parseInt(this._rowTemplate.getAttribute("rowheight")); // TODO automatic sizing
    //this._rowHeight = this._getHeight(this._rowTemplate); // TODO consider vertical padding

    this._rowTemplate.removeAttribute("rowheight");
    removeElement(this._rowTemplate);

    /**
     * All items shown in the list.
     * {Collection of {Object}}
     */
    this._entries = new ArrayColl(); // just for init. will be overwritten below.

    /**
     * Items currently selected by the user.
     * @See selectedCollection()
     * {Collection of {Object}}
     */
    this._selectedEntries = new ArrayColl();

    /**
     * First visible row
     * {integer} index position in this._entries
     */
    this._scrollPos = 0;

    this._observer = null;

    /*window.addEventListener("throttledResize", () => { // throttledResize from trex.js
      this._updateSize();
      this._refreshContent();
    });*/

    this.showCollection(new ArrayColl());
  }

  /**
   * The items that should be shown in the list.
   *
   * @see entries
   * |coll| will be |this.entries|.
   *
   * @param coll {Collection} @see collection.js
   */
  showCollection(coll) {
    if (this._observer) {
      coll.unregisterObserver(this._observer);
    }

    this._entries = coll;
    this._updateSize();
    this._refreshContent();

    var self = this;
    this._observer = {
      added: function (items) {
        self._updateSize();
        self._refreshContent();
      },
      removed: function (items) {
        self._updateSize();
        self._refreshContent();
      },
    };
    coll.registerObserver(this._observer);
    this.selectedCollection.clear();
  }

  /**
   * The items that should be shown in the list.
   *
   * This is a dynamic list. As you add or remove items
   * to/from this collection, the UI will be updated.
   *
   * This is the same collection that was set in showCollection().
   * If you didn't call showCollection(), this is a default collection.
   *
   * @returns {Collection} @see collection.js
   */
  get entries() {
    return this._entries;
  }

  /**
   * Adds a row to the list
   * @param obj {Object} values for one row
   */
  addEntry(obj) {
    this._entries.add(obj);
  }

  /**
   * Adds a number of rows to the list. Each array element is one row.
   * @param array {Array of Objects} values for  rows
   */
  addEntriesFromArray(array) {
    this._entries.addAll(array);
  }

  /**
   * The list items that the user selected,
   * e.g. by clicking on them.
   * This is usually just one element,
   * unless the user used multiple selection, e.g. using the SHIFT key.
   *
   * This collection object is always the same.
   * You can be notified of changes in the selection using
   * the normal collection observers.
   *
   * @returns {Collection} @see collection.js
   */
  get selectedCollection() {
    return this._selectedEntries;
  }

  /**
   * Populates DOM entries with the values from an object
   * By default, for each element with a field="foo" attribute,
   * it reads the corresponding obj.foo property and
   * writes it as text node into the element.
   * @param obj {Object} values for this row
   * @param rowE {<row> DOMElement}
   */
  fillRow(rowE, obj) {
    nodeListToArray(rowE.querySelectorAll("*[field]")).forEach(fieldE => {
      var fieldName = fieldE.getAttribute("field");
      var value = obj[fieldName];

      var fillFunc = this["fill" + fieldName];
      if (fillFunc && typeof (fillFunc) == "function") {
        var display = fillFunc(value);
        if (typeof (display) == "object" && "nodeName" in display) { // fill function returned DOM node
          cleanElement(fieldE);
          fieldE.appendChild(display);
        } else { // fill function returned string
          fieldE.textContent = String(display);
        }
      } else {
        fieldE.textContent = value;
      }
    });
  }

  /**
   * Call this when either the number of entries changes,
   * or the DOM size of <fastlist> changes.
   * Updates the DOM elements with the rows.
   */
  _updateSize() {
    var scrollHeight = this._entries.length * this._rowHeight;
    //var availableHeight = this._getHeight(this._contentE);
    var availableHeight = this._listE.offsetHeight - this._rowHeight - 6; // TODO

    var needRows = Math.min(this._entries.length, Math.round(availableHeight / this._rowHeight));
    var newRows = needRows - this._rowElements.length;
    if (newRows > 0) {
      for (var i = 0; i < newRows; i++) {
        var newRowE = this._rowTemplate.cloneNode(true);
        this._contentE.appendChild(newRowE);
        this._rowElements.push(newRowE);
      }
    } else if (newRows < 0) {
      for (var i = 0; i < -newRows; i++) {
        var oldRowE = this._rowElements.pop();
        this._contentE.removeChild(oldRowE);
      }
    }

    this._scrollbarContentE.width = 1;
    //this._scrollbarContentE.style.height = scrollHeight;
    this._scrollbarContentE.setAttribute("style", "height: " + scrollHeight + "px");
    if (scrollHeight > availableHeight) {
      this._scrollbarE.removeAttribute("hidden");
    } else {
      this._scrollbarE.setAttribute("hidden", true);
    }
  }

  _getHeight(el) {
    // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
    return el.offsetHeight;
    /*
    var height = el.getBoundingClientRect().height;
    // getBoundingClientRect does not include margin
    var style = window.getComputedStyle(el);
    height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);

    nodeListToArray(el.childNodes).forEach(
          childNode => height += childNode.nodeType == 1 ? this._getHeight(childNode) : 0);
    return height;
    */
  }

  /**
   * Displays the values at the current scroll position.
   * Call this after
   * - scrolling
   * - adding or removing entries
   */
  _refreshContent() {
    // TODO be lazy, avoid unnecessary refreshs
    var renderRow = this._scrollPos;
    this._rowElements.forEach(rowE => {
      var obj = this._entries.getIndex(renderRow++);
      if (!obj) {
        return;
      }
      this.fillRow(rowE, obj);
      rowE._item = obj;
    });
  }

  _onScrollWheel(event) {
    var scrollRows = 3; // How many rows to scroll each time
    if (event.deltaY > 0) {
      this._scrollPos = Math.min(this._scrollPos + scrollRows, this._entries.length - this._rowElements.length);
      //this._scrollbarE.scrollTop = Math.min(this._scrollbarE.scrollTop + this._rowHeight, this._scrollbarE.scrollHeight);
    } else if (event.deltaY < 0) {
      this._scrollPos = Math.max(this._scrollPos - scrollRows, 0);
      //this._scrollbarE.scrollTop = Math.max(this._scrollbarE.scrollTop - this._rowHeight, 0);
    }
    this._refreshContent();
  }

  _onScrollBar(event) {
    this._scrollPos = Math.round(this._scrollbarE.scrollTop / this._rowHeight); // TODO ceil()?
    console.log("scrollTop = " + this._scrollbarE.scrollTop);
    console.log("entries size = " + this._entries.length);
    console.log("scroll pos = " + this._scrollPos);
    this._refreshContent();
  }

  _onClick(event) {
    // Walk up the DOM tree, until we find the row element
    for (var e = event.target; e != this._listE; e = e.parentNode) {
      if (e.nodeName == this._rowTemplate.nodeName &&
        e._item) {
        this._onSelectElement(e._item, event);
        return;
      }
    }
  }

  _onSelectElement(selectedItem, event) {
    if (event.shiftKey) { // select whole range
      var firstItem = this.selectedCollection.first;
      var inRange = false;
      this._entries.forEach(item => {
        if (inRange) {
          this.selectedCollection.add(item);
        }
        if (item == firstItem) {
          inRange = true;
          // firstItem is already in selectedCollection, so don't re-add it in this loop
        }
        if (item == selectedItem) {
          inRange = false;
        }
      });
    } else if (event.ctrlKey) { // add to current selection
      this.selectedCollection.add(selectedItem);
    } else { // no modifier, i.e. a simple single-selection click
      this.selectedCollection.clear();
      this.selectedCollection.add(selectedItem);
    }
  }
}

/**
 * Convenience class which returns just the first selected item
 */
export class SingleSelectionObserver {
  //class SingleSelectionObserver extends CollectionObserver {
  added(items, selectedItems) {
    this.onSelectedItem(selectedItems.first);
  }
  removed(items, selectedItems) {
    this.onSelectedItem(selectedItems.isEmpty ? null : selectedItems.first);
  }
  /**
   * Called when the selected item changed
   * @param selectedItem {Object}
   *      null, if no item is selected
   */
  onSelectedItem(selectedItem) {
    throw "implement this";
  }
}
