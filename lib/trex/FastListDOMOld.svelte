<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="fast-list"
  on:click={onClick}
  on:wheel={onScrollWheel}
  bind:this={listE}>
  <table bind:this={tableE} cellspacing="0">
    <thead bind:this={theadE} use:getHeaderRow>
      <slot name="header" />
    </thead>
    <tbody bind:this={contentE}>
    </tbody>
  </table>
  <div class="scrollbar"
    on:scroll={onScrollBar}
    class:hidden={scrollbarHidden}
    bind:this={scrollbarE}>
    <div class="scrollbar-content" bind:this={scrollbarContentE} />
  </div>
  <hbox class="row-template-container" use:getRowTemplate>
    <slot name="row" />
  </hbox>
</hbox>

<script lang="ts">
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

  import { Collection, CollectionObserver, ArrayColl } from "jscollections"
  import { showErrors } from "../Util/error";

  /**
   * All items shown in the list.
   */
  export let entries: Collection<Object> = new ArrayColl<Object>();

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
   * @see also selectedItem
   *
   * out only
   */
  export const selectedItems = new ArrayColl<Object>();

  /**
   * The list item that the user selected,
   * e.g. by clicking on it.
   * Unlike selecteditems, this is always returns just one element.
   *
   * out only
   */
  export let selectedItem: Object = null;

  type T = $$Generic;
  let listE: HTMLDivElement;
  let tableE: HTMLTableElement;
  let theadE: HTMLTableSectionElement;
  /** The template that the caller gave us for the header */
  let headerRowE: HTMLHeadingElement;
  /** Where the actual rows are added. */
  let contentE: HTMLTableSectionElement;
  /** A dummy element that displays only a scrollbar. */
  let scrollbarE: HTMLDivElement;
  /** The dummy content of the scrollbar, to set the right height. */
  let scrollbarContentE: HTMLDivElement;
  let scrollbarHidden = true;
  /** Original, empty template for a row.
   * Not visible itself, but will be copied and filled in for each row. */
  let rowTemplateE: HTMLTableRowElement;

  /** Currently displayed rows. */
  let rowElements: HTMLTableRowElement[] = [];

  /**
   * Height of the DOM elements for a single row.
   * {integer} in px
   */
  let rowHeight = 10; // set in getRowTemplate()

  /**
   * Convenience class which returns just the first selected item
   */
  //export class SingleSelectionObserver<T> {
  class SingleSelectionObserver<T> extends CollectionObserver<T> {
    added(_items: T[], selectedItems: Collection<T>) {
      this.onSelectedItem(selectedItems.first);
    }
    removed(_items: T[], selectedItems: Collection<T>) {
      this.onSelectedItem(selectedItems.isEmpty ? null : selectedItems.first);
    }
    /**
     * Called when the selected item changed
     * @param selectedItem
     *      null, if no item is selected
     */
    onSelectedItem(selectedItem?: T) {
      throw "implement this";
    }
  }

  const singleSelectionObserver = new SingleSelectionObserver<Object>();
  singleSelectionObserver.onSelectedItem = item => {
    selectedItem = item;
  };

  /**
   * First visible row
   * {integer} index position in entries
   */
  let scrollPos = 0;

  let observer: CollectionObserver = {
    added: items => {
      updateSize();
      refreshContent();
    },
    removed: items => {
      updateSize();
      refreshContent();
    },
  };

  /*window.addEventListener("throttledResize", () => { // throttledResize from trex.js
    updateSize();
    refreshContent();
  });*/

  /** We cannot use `<slot name="header" bind:this={headerRowE} />`
   * so use this trick <https://svelte.dev/repl/e3ad270dc3cf494e8b7b9d446c437c63?version=3.46.4> */
  function getHeaderRow(node: HTMLDivElement) {
    headerRowE = node.firstChild as HTMLHeadingElement;
  }

  /** @see getHeaderRow() */
  function getRowTemplate(node: HTMLDivElement) {
    rowTemplateE = node.firstChild as HTMLTableRowElement;
    rowHeight = parseInt(rowTemplateE.getAttribute("rowheight")); // TODO automatic sizing
    //_rowHeight = getHeight(rowTemplate); // TODO consider vertical padding
    rowTemplateE.removeAttribute("rowheight");
  }

  $: listE && entries && showErrors(() => showCollection())
  let oldEntriesCollection: Collection<Object>;

    /**
   * Shown the `entries` in the UI.
   */
  function showCollection() {
    if (oldEntriesCollection) {
      oldEntriesCollection.unregisterObserver(observer);
    }
    oldEntriesCollection = entries;

    updateSize();
    refreshContent();

    entries.registerObserver(observer);
    selectedItems.clear();
  }

  /**
   * The items that should be shown in the list.
   *
   * This is a dynamic list. As you add or remove items
   * to/from this collection, the UI will be updated.
   *
   * This is the same collection that was set in showCollection().
   * If you didn't call showCollection(), this is a default collection.
   */
  export function getEntries(): Collection<Object> {
    return entries;
  }

  /**
   * Adds a row to the list
   * @param obj values for one row
   */
  export function addEntry(obj: Object) {
    entries.add(obj);
  }

  /**
   * Adds a number of rows to the list. Each array element is one row.
   * @param array values for  rows
   */
  export function addEntriesFromArray(array: Object[]) {
    entries.addAll(array);
  }

  type FillFunc = (value: any) => string | number | HTMLElement;

  /**
   * Populates DOM entries with the values from an object
   * By default, for each element with a field="foo" attribute,
   * it reads the corresponding obj.foo property and
   * writes it as text node into the element.
   *
   * @param obj values for this row
   */
  function fillRow(rowE: HTMLTableRowElement, obj: Object) {
    for (let fieldE of rowE.querySelectorAll("*[field]")) {
      let fieldName = fieldE.getAttribute("field");
      let value = obj[fieldName];

      let fillFunc = fieldE.fillFunc as FillFunc;
      if (fillFunc && typeof(fillFunc) == "function") {
        let display = fillFunc(value);
        if (typeof(display) == "string") {
          fieldE.textContent = display;
        } else if (typeof(display) == "number") {
          fieldE.textContent = display.toFixed(0);
        } else if (display instanceof HTMLElement) {
          cleanElement(fieldE);
          fieldE.appendChild(display);
        } else {
          fieldE.textContent = display;
        }
      } else {
        fieldE.textContent = value;
      }
    };
  }

  /**
   * Call this when either the number of entries changes,
   * or the DOM size of <fastlist> changes.
   * Updates the DOM elements with the rows.
   */
  function updateSize() {
    let scrollHeight = entries.length * rowHeight;
    //let availableHeight = getHeight(contentE);
    let availableHeight = listE.offsetHeight - rowHeight - 6; // TODO

    let needRows = Math.min(entries.length, Math.round(availableHeight / rowHeight));
    let newRows = needRows - rowElements.length;
    if (newRows > 0) {
      for (let i = 0; i < newRows; i++) {
        let newRowE = rowTemplateE.cloneNode(true) as HTMLTableRowElement;
        contentE.appendChild(newRowE);
        rowElements.push(newRowE);
      }
    } else if (newRows < 0) {
      for (let i = 0; i < -newRows; i++) {
        let oldRowE = rowElements.pop();
        contentE.removeChild(oldRowE);
      }
    }

    scrollbarContentE.width = 1;
    //_scrollbarContentE.style.height = scrollHeight;
    scrollbarContentE.setAttribute("style", "height: " +  scrollHeight + "px");
    if (scrollHeight > availableHeight) {
      scrollbarHidden = false;
    } else {
      scrollbarHidden = true;
    }
  }

  function getHeight(el: HTMLDivElement) {
    // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
    return el.offsetHeight;
    /*
    let height = el.getBoundingClientRect().height;
    // getBoundingClientRect does not include margin
    let style = window.getComputedStyle(el);
    height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);

    nodeListToArray(el.childNodes).forEach(
          childNode => height += childNode.nodeType == 1 ? getHeight(childNode) : 0);
    return height;
    */
  }

  /**
   * Displays the values at the current scroll position.
   * Call this after
   * - scrolling
   * - adding or removing entries
   */
  function refreshContent() {
    // TODO be lazy, avoid unnecessary refreshs
    console.log("Show entries", entries);
    let renderRow = scrollPos;
    for (let rowE of rowElements) {
      let obj = entries.getIndex(renderRow++);
      if (!obj) {
        return;
      }
      fillRow(rowE, obj);
      rowE._item = obj;
    };
  }

  function onScrollWheel(event: WheelEvent) {
    let scrollRows = 3; // How many rows to scroll each time
    if (event.deltaY > 0) {
      scrollPos = Math.min(scrollPos + scrollRows, entries.length - rowElements.length);
      //_scrollbarE.scrollTop = Math.min(scrollbarE.scrollTop + rowHeight, scrollbarE.scrollHeight);
    } else if (event.deltaY < 0) {
      scrollPos = Math.max(scrollPos - scrollRows, 0);
      //_scrollbarE.scrollTop = Math.max(scrollbarE.scrollTop - rowHeight, 0);
    }
    refreshContent();
  }

  function onScrollBar(_event: Event) {
    scrollPos = Math.round(scrollbarE.scrollTop / rowHeight); // TODO ceil()?
    console.log("scrollTop = " + scrollbarE.scrollTop);
    console.log("entries size = " + entries.length);
    console.log("scroll pos = " + scrollPos);
    refreshContent();
  }

  function onClick(event: MouseEvent) {
    // Walk up the DOM tree, until we find the row element
    for (let el = event.target as HTMLElement; el != listE; el = el.parentNode as HTMLElement) {
      if (el.nodeName == rowTemplateE.nodeName &&
          el._item) {
        onSelectElement(el._item, event);
        return;
      }
    }
  }

  function onSelectElement(selectedItem, event: KeyboardEvent | MouseEvent) {
    if (event.shiftKey) { // select whole range
      let firstItem = selectedItems.first;
      let inRange = false;
      for (let item of entries) {
        if (inRange) {
          selectedItems.add(item);
        }
        if (item == firstItem) {
          inRange = true;
          // firstItem is already in selectedItems, so don't re-add it in this loop
        }
        if (item == selectedItem) {
          inRange = false;
        }
      };
    } else if (event.ctrlKey) { // add to current selection
      selectedItems.add(selectedItem);
    } else { // no modifier, i.e. a simple single-selection click
      selectedItems.clear();
      selectedItems.add(selectedItem);
    }
  }

  // <copied from="uiutil.js" />
  function cleanElement(el) {
    while (el.hasChildNodes()) {
      el.removeChild(el.firstChild);
    }
  }
</script>

<style>
  .row-template-container {
    display: none;
  }

  .fast-list {
    position: relative;
    border: 1px solid #8E8EA1;
    background-color: #EEF3F9;
  }
  table {
    width: 100%;
  }
  tbody {
    display: table-row-group;
  }
  header,
  tbody > row {
    display: table-row;
  }
  header > * {
    display: table-cell;
    padding: 2px 8px;
  }
  tbody > row > * {
    display: table-cell;
    padding: 0px 5px; /* TODO vertical padding triggers a bug in the size calculation */
  }
  header > * {
    border-top: 1px solid white;
    border-left: 1px solid white;
    border-right: 1px solid #8E8EA1;
    border-bottom: 1px solid #8E8EA1;
    background-color: #D2D2DC;
  }
  header > *:hover {
    background-color: #E5E5F7;
  }
  .scrollbar {
    overflow-y: scroll;
    overflow-x: hidden;
    height: 100%;
    position: absolute;
    top: 26px;
    right: 0px;
    width: 20px;
  }
  .hidden {
    display: none;
  }
</style>
