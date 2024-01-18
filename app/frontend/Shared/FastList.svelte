<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<hbox class="fast-list"
  on:wheel={event => onScrollWheel(event)}
  on:keydown={event => onKey(event)}
  tabindex={0}
  bind:this={listE}>
  <table cellspacing="0">
    <thead bind:this={theadE}>
      <tr>
        <slot name="header" />
      </tr>
    </thead>
    <tbody bind:this={contentE}>
      {#each showItems as item}
        <tr on:click={ev => onSelectElement(item, ev)} class:selected={$selectedItems.includes(item)}>
          <slot name="row" {item} />
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="scrollbar"
    on:scroll={onScrollBar}
    class:hidden={scrollbarHidden}
    style="top: {headerHeight}px; height: calc(100% - {headerHeight}px);"
    bind:this={scrollbarE}>
    <div class="scrollbar-content" style="height: {$items.length * rowHeight}px" />
  </div>
</hbox>
<!--svelte:window on:resize={debounce(updateSize, 300)} /-->

<script lang="ts">
  /**
  There are many HTML tree widget implementations out there, but most fail when you start
  pushing 100000 entries in there. The problem is that most create a DOM nodes for
  every line and cell, and once you get to a million DOM nodes, that's a noticeable
  load time and costs RAM. For email, we need to render folders with tens of thousands
  and a hundred thousand emails.

  This is a "fast list". The demo is loading 100000 entries on load, and you can add 100000
  more in fractions of a second. You will notice that the addition is very fast. Millions of rows work.
  Scrolling is very fast. Scrolling should work both using the scroll bar and using the mouse wheel.

  We don't create DOM nodes for every row, but only for the visible rows, e.g. only 10 or so.
  The data is in a pure data array. When the user scrolls, we do not move or destroy DOM nodes,
  but merely replace their text content and leave the nodes in place.

  We listen to mouse wheel scroll events, and scroll correspondingly.
  The scroll bar at the right is a dummy element, and we set the inner height of it to the
  calculated height in px that the rows would have, if all rows would be DOM nodes.
  Then we listen to scroll events, and translate them to corresponding row content changes.

  You're not limited to a single line per row, and you can have rich HTML content in each cell.
  However, the number of columns must be the same for every row / entry.

  Try it out at http://benbucksch.github.io/trex/fastlist-test.html (non-Svelte DOM version)

  TODO:
  * tree functionality
  * alignment
  * fixing column width to not change while scrolling
  * etc.
  */

  import { Collection, CollectionObserver, ArrayColl } from "svelte-collections"
  //import debounce from "lodash.debounce";

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

  let listE: HTMLDivElement;
  let theadE: HTMLTableSectionElement;
  let contentE: HTMLTableSectionElement;
  /** A dummy element that displays only a scrollbar. */
  let scrollbarE: HTMLDivElement;
  let scrollbarHidden = true;

  $: headerHeight = theadE ? theadE.offsetHeight : 26;

  /**
   * Height of the DOM elements for a single row.
   * {integer} in px
   */
  let rowHeight = 0;

  /**
   * First visible row
   * {integer} index position in entries
   */
  let scrollPos = 0;

  /** How many rows are actually visible on the screen, without scroll */
  let showRows = 1;
  $: showItems = $items.getIndexRange(scrollPos, showRows) as T[];

  $: $items && listE && updateSize();

  /**
   * Call this when either the number of entries changes,
   * or the DOM size of <fastlist> changes.
   * Updates the DOM elements with the rows.
   */
  function updateSize() {
    let contentRow = contentE.firstChild as HTMLElement;
    if (contentRow) {
      rowHeight = contentRow.offsetHeight;
    } else if (!rowHeight) {
      rowHeight = 10;
      setTimeout(updateSize, 100);
    }
    let availableHeight = listE.offsetHeight - theadE.offsetHeight;

    showRows = Math.min(items.length, Math.round(availableHeight / rowHeight));
    // Workaround: the following line should be triggered automatically in the $: above, but it doesn't.
    showItems = $items.getIndexRange(scrollPos, showRows) as T[];

    let scrollHeight = items.length * rowHeight;
    scrollbarHidden = scrollHeight <= availableHeight;
  }

  function onKey(event: KeyboardEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
    if (event.key == "ArrowDown" || event.key == "ArrowUp" ||
        event.key == "PageDown" || event.key == "PageUp") {
      let lastItem = selectedItems.last || selectedItem;
      let oldIndex = lastItem ? items.contents.findIndex(item => item == lastItem) : 0;
      let newIndex = oldIndex;
      if (event.key == "ArrowDown") {
        newIndex++;
      } else if (event.key == "PageDown") {
        newIndex += showRows;
      } else if (event.key == "ArrowUp") {
        newIndex--;
      } else if (event.key == "PageUp") {
        newIndex -= showRows;
      }
      if (newIndex < 0) {
        newIndex += items.length;
      } else if (newIndex >= items.length) {
        newIndex -= items.length;
      }
      let newElement = items.getIndex(newIndex);
      if (!newElement) {
        return;
      }
      if (event.ctrlKey || event.shiftKey) {
        selectedItems.add(newElement);
      /*} else if (event.shiftKey) {
        let startIndex = oldIndex < newIndex ? oldIndex : newIndex;
        let length = Math.abs(newIndex - oldIndex);
        console.log("from", startIndex, "len", length);
        selectedItems.addAll(items.getIndexRange(startIndex, length));*/
      } else {
        selectedItems.clear();
        selectedItems.add(newElement);
      }
      scrollIntoView(newIndex);
      event.stopPropagation();
    }
  }

  function scrollIntoView(index: number) {
    if (index >= scrollPos && index < scrollPos + showRows - 1) {
      return;
    }
    scrollPos = Math.min(index, Math.max(0, items.length - showRows));
  }

  function onScrollWheel(event: WheelEvent) {
    let scrollRows = 3; // How many rows to scroll each time
    if (event.deltaY > 0) {
      scrollPos = Math.min(scrollPos + scrollRows, items.length - showRows);
    } else if (event.deltaY < 0) {
      scrollPos = Math.max(scrollPos - scrollRows, 0);
    }
  }

  let scrollPosByScrollBar: NodeJS.Timeout = null;
  $: scrollbarE && !scrollPosByScrollBar ? scrollbarE.scrollTop = scrollPos * rowHeight : null;

  async function onScrollBar(_event: Event) {
    clearTimeout(scrollPosByScrollBar);
    scrollPosByScrollBar = setTimeout(() => {
      scrollPosByScrollBar = null;
      clearTimeout(scrollPosByScrollBar);
    }, 200);

    scrollPos = Math.round(scrollbarE.scrollTop / rowHeight); // TODO ceil()?
  }

  function onSelectElement(selectedItem, event: MouseEvent) {
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
      if (selectedItems.contains(selectedItem)) {
        selectedItems.remove(selectedItem);
      } else {
        selectedItems.add(selectedItem);
      }
    } else { // no modifier, i.e. a simple single-selection click
      selectedItems.clear();
      selectedItems.add(selectedItem);
    }
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
  selectedItems.registerObserver(singleSelectionObserver);
</script>

<style>
  .fast-list {
    position: relative;
    flex: 1 0 0;
  }
  table {
    width: 100%;
    height: min-content;
  }
  thead > tr :global(> *) {
    display: table-cell;
    padding: 2px 5px;
    border-top: 1px solid white;
    border-left: 1px solid white;
    border-right: 1px solid #8E8EA1;
    border-bottom: 1px solid #8E8EA1;
    background-color: #D2D2DC;
  }
  thead > tr :global(> *:hover) {
    background-color: #E5E5F7;
  }
  tbody {
    display: table-row-group;
  }
  tbody > tr :global(> *) {
    display: table-cell;
    padding: 0px 5px; /* TODO vertical padding triggers a bug in the size calculation */
  }
  .scrollbar {
    overflow-y: scroll;
    overflow-x: hidden;
    position: absolute;
    right: 0px;
    width: 20px;
    /* top: and height: set in style="" */
  }
  .hidden {
    display: none;
  }
</style>
