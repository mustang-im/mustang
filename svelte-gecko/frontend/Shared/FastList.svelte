<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="fast-list"
  on:click={onClick}
  on:wheel={onScrollWheel}
  bind:this={listE}>
  <table bind:this={tableE} cellspacing="0">
    <thead bind:this={theadE}>
      <slot name="header" />
    </thead>
    <tbody bind:this={contentE}>
      {#each showItems as item}
        <slot name="row" {item} />
      {/each}
    </tbody>
  </table>
  <div class="scrollbar"
    on:scroll={onScrollBar}
    class:hidden={scrollbarHidden}
    bind:this={scrollbarE}>
    <div class="scrollbar-content" bind:this={scrollbarContentE} />
  </div>
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

  type T = $$Generic;

  /**
   * The items to display in the list.
   */
  export let items: Collection<T> = new ArrayColl<T>();

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
  export const selectedItems = new ArrayColl<T>();

  /**
   * The list item that the user selected,
   * e.g. by clicking on it.
   * Unlike selecteditems, this is always returns just one element.
   *
   * out only
   */
  export let selectedItem: T = null;

  type T = $$Generic;
  let listE: HTMLDivElement;
  let tableE: HTMLTableElement;
  let theadE: HTMLTableSectionElement;
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
   * TODO calculate this
   * {integer} in px
   */
  export let rowHeight = 10;

  /**
   * The items that should be shown in the list.
   *
   * This is a dynamic list. As you add or remove items
   * to/from this collection, the UI will be updated.
   *
   * This is the same collection that was set in showCollection().
   * If you didn't call showCollection(), this is a default collection.
   *
  export function getItems(): Collection<T> {
    return items;
  }

  /**
   * Adds a row to the list
   * @param obj values for one row
   *
  export function addItem(obj: T) {
    items.add(obj);
  }

  /**
   * Adds a number of rows to the list. Each array element is one row.
   * @param array values for  rows
   *
  export function addEntriesFromArray(array: T[]) {
    items.addAll(array);
  }
  */

  /**
   * First visible row
   * {integer} index position in entries
   */
  let scrollPos = 0;

  /** How many rows are actually visible on the screen, without scroll */
  let showRows = 1;
  $: showItems = items.getIndexRange(scrollPos, showRows) as T[];
  $: console.log("showItems", showRows, showItems, showItems)

  $: listE && items && showErrors(() => showCollection())
  let previousItemsColl: Collection<T>;

  /**
   * Shown the `items` in the UI.
   */
  function showCollection() {
    if (previousItemsColl) {
      previousItemsColl.unregisterObserver(observer);
      previousItemsColl.unregisterObserver(singleSelectionObserver);
    }
    previousItemsColl = items;
    selectedItems.clear();

    updateSize();
    items.registerObserver(observer);
    items.registerObserver(singleSelectionObserver);
  }

  /*window.addEventListener("throttledResize", () => { // throttledResize from trex.js
    updateSize();
  });*/

  /**
   * Call this when either the number of entries changes,
   * or the DOM size of <fastlist> changes.
   * Updates the DOM elements with the rows.
   */
  function updateSize() {
    let scrollHeight = items.length * rowHeight;
    //let availableHeight = getHeight(contentE);
    let availableHeight = listE.offsetHeight - rowHeight - 6; // TODO

    showRows = Math.min(items.length, Math.round(availableHeight / rowHeight));

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

  const singleSelectionObserver = new SingleSelectionObserver<T>();
  singleSelectionObserver.onSelectedItem = item => {
    selectedItem = item;
  };

  let observer: CollectionObserver = {
    added: items => {
      updateSize();
    },
    removed: items => {
      updateSize();
    },
  };

  function onScrollWheel(event: WheelEvent) {
    let scrollRows = 3; // How many rows to scroll each time
    if (event.deltaY > 0) {
      scrollPos = Math.min(scrollPos + scrollRows, items.length - rowElements.length);
      //_scrollbarE.scrollTop = Math.min(scrollbarE.scrollTop + rowHeight, scrollbarE.scrollHeight);
    } else if (event.deltaY < 0) {
      scrollPos = Math.max(scrollPos - scrollRows, 0);
      //_scrollbarE.scrollTop = Math.max(scrollbarE.scrollTop - rowHeight, 0);
    }
  }

  function onScrollBar(_event: Event) {
    scrollPos = Math.round(scrollbarE.scrollTop / rowHeight); // TODO ceil()?
    console.log("scrollTop = " + scrollbarE.scrollTop);
    console.log("entries size = " + items.length);
    console.log("scroll pos = " + scrollPos);
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
      for (let item of items) {
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
</script>

<style>
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
  thead :global(header),
  tbody :global(> row) {
    display: table-row;
  }
  thead :global(header > *) {
    display: table-cell;
    padding: 2px 8px;
  }
  tbody :global(> row > *) {
    display: table-cell;
    padding: 0px 5px; /* TODO vertical padding triggers a bug in the size calculation */
  }
  thead :global(header > *) {
    border-top: 1px solid white;
    border-left: 1px solid white;
    border-right: 1px solid #8E8EA1;
    border-bottom: 1px solid #8E8EA1;
    background-color: #D2D2DC;
  }
  thead :global(header > *:hover) {
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
