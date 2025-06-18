<hbox class="fast-list"
  on:wheel={event => onScrollWheelDebounced(event)}
  on:keydown={event => onKey(event)}
  tabindex={0}
  bind:this={listE}>
  <grid style="grid-template-columns: {columns};">
    <div class="header" bind:this={headerE}>
      <slot name="header" />
    </div>
    <div class="content" bind:this={contentE}>
      {#each showItems as item}
        <div class="row" on:click={event => onSelectElement(item, event)} class:selected={$selectedItems.includes(item)}>
          <slot name="row" {item} />
        </div>
      {/each}
    </div>
  </grid>
  <div class="scrollbar"
    on:scroll={onScrollBar}
    class:hidden={scrollbarHidden}
    style="top: {headerHeight}px; height: calc(100% - {headerHeight}px);"
    bind:this={scrollbarE}>
    <div class="scrollbar-content" style="height: {$items.length * rowHeight}px" />
  </div>
</hbox>

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

  Try it out at https://benbucksch.github.io/trex/fastlist-test.html (non-Svelte DOM version)

  TODO:
  * alignment
  */

  import { Collection, CollectionObserver, ArrayColl } from "svelte-collections"
  import { onMount, tick } from "svelte";
  import debounce from "lodash/debounce";

  type T = $$Generic;

  /**
   * The items to display in the list.
   */
  export let items: Collection<T> = new ArrayColl<T>();

  /** grid-template-columns: */
  export let columns: string = "auto";

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
   * in/out
   */
  export let selectedItem: T = null;

  /** When the `selectedItems` are removed from `items`,
   * select the items which was in their place in the list. */
  export let ensureSelection = true;

  let listE: HTMLDivElement;
  let headerE: HTMLDivElement;
  let contentE: HTMLDivElement;
  /** A dummy element that displays only a scrollbar. */
  let scrollbarE: HTMLDivElement;
  let scrollbarHidden = true;

  $: headerHeight = headerE?.firstChild?.offsetHeight ?? 0;

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

  $: $items.hasItems && listE && updateSize();

  /**
   * Call this when either the number of entries changes,
   * or the DOM size of <fastlist> changes.
   * Updates the DOM elements with the rows.
   */
  async function updateSize() {
    try {
      if (items.isEmpty) {
        return;
      }
      await tick();
      let contentRow = contentE.firstChild?.firstChild as HTMLElement;
      if (!contentRow) {
        return;
      }
      rowHeight = contentRow.offsetHeight;
      let availableHeight = listE.offsetHeight - headerE.offsetHeight;

      showRows = Math.min(items.length, Math.floor(availableHeight / rowHeight));
      // Workaround: the following line should be triggered automatically in the $: above, but it doesn't.
      showItems = $items.getIndexRange(scrollPos, showRows) as T[];

      let scrollHeight = items.length * rowHeight;
      scrollbarHidden = scrollHeight <= availableHeight;
    } catch (ex) {
      console.error(ex);
    }
  }

  onMount(() => {
    selectedItems.registerObserver(singleSelectionObserver);
    if (selectedItem) {
      selectedItems.add(selectedItem);
    }

    const updateSizeDebounced = debounce(updateSize, 30);
    const resizeObserver = new ResizeObserver(updateSizeDebounced);
    resizeObserver.observe(listE);
    return () => resizeObserver.unobserve(listE);
  });

  function onKey(event: KeyboardEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
    // Do allow Ctrl/Shift, so that we can expand selection with keyboard
    if (event.key == "ArrowDown" || event.key == "ArrowUp" ||
        event.key == "PageDown" || event.key == "PageUp" ||
        event.key == "Home" || event.key == "End") {
      event.stopPropagation();
      event.preventDefault();
      let lastItem = selectedItems.last || selectedItem;
      let oldIndex = lastItem ? items.contents.findIndex(item => item == lastItem) : 0;
      let newIndex = oldIndex;
      if (event.key == "ArrowDown") {
        newIndex++;
      } else if (event.key == "ArrowUp") {
        newIndex--;
      } else if (event.key == "PageDown") {
        newIndex += showRows;
      } else if (event.key == "PageUp") {
        newIndex -= showRows;
      } else if (event.key == "Home") {
        newIndex = 0;
      } else if (event.key == "End") {
        newIndex = items.length - 1;
      }
      if (newIndex < 0) {
        newIndex = 0;
      } else if (newIndex >= items.length) {
        newIndex = items.length - 1;
      }
      let newElement = items.getIndex(newIndex);
      if (!newElement) {
        return;
      }
      /*if (event.shiftKey) {
        let startIndex = oldIndex < newIndex ? oldIndex : newIndex;
        let length = Math.abs(newIndex - oldIndex) + 1;
        console.log("from", startIndex, "len", length);
        selectedItems.addAll(items.getIndexRange(startIndex, length));
      } else */ if (event.ctrlKey || event.shiftKey) {
        selectedItems.add(newElement);
      } else {
        selectedItems.clear();
        selectedItems.add(newElement);
      }
      scrollIntoView(newIndex);
    }

    if ((event.ctrlKey || event.altKey) && !event.shiftKey && !event.altKey) {
      if (event.key == "a") {
        selectedItems.clear();
        selectedItems.addAll(items);
        // Keep selectedItem as-is
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  function scrollIntoView(index: number) {
    if (index >= scrollPos && index < scrollPos + showRows - 1) {
      return;
    }
    scrollPos = Math.min(index, Math.max(0, items.length - showRows));
  }

  const onScrollWheelDebounced = debounceReduce(onScrollWheel, 30, wheelReduce);
  function wheelReduce(event: WheelEvent, accumulated: Partial<WheelEvent>) {
    return { deltaY: event.deltaY + (accumulated?.deltaY ?? 0) };
  }
  function onScrollWheel(event: Partial<WheelEvent>) {
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

  function onSelectElement(clickedItem: T, event: MouseEvent) {
    if (event.shiftKey) { // select whole range
      let firstItem = selectedItems.first;
      let lastItem = clickedItem;
      let itemsArray = new ArrayColl(items);
      let firstItemIndex = itemsArray.getKeyForValue(firstItem);
      let lastItemIndex = itemsArray.getKeyForValue(lastItem);
      selectedItems.clear();
      selectedItems.add(firstItem); // Should stay first, to be the anchor for later operations
      if (firstItemIndex == lastItemIndex) {
        // Only this
      } else if (firstItemIndex < lastItemIndex) {
        selectedItems.addAll(itemsArray.getIndexRange(firstItemIndex + 1, lastItemIndex - firstItemIndex));
      } else { // User selected bottom -> top
        selectedItems.addAll(itemsArray.getIndexRange(lastItemIndex, firstItemIndex - lastItemIndex));
      }
    } else if (event.ctrlKey) { // add to current selection
      if (selectedItems.contains(clickedItem)) {
        selectedItems.remove(clickedItem);
      } else {
        selectedItems.add(clickedItem);
      }
    } else { // no modifier, i.e. a simple single-selection click
      selectedItems.clear();
      selectedItems.add(clickedItem);
    }
  }

  /** If the selected items were removed from the list,
   * adapt the selectedItems and implicitly selectedItem. */
  $: ensureSelection && $items && replaceSelectedItem();
  function replaceSelectedItem() {
    if (selectedItems.isEmpty) {
      return;
    }
    selectedItems.removeAll(selectedItems.filterOnce(a => !items.includes(a)));
    if (selectedItems.isEmpty) {
      let newItem = items.getIndex(lastSelectedIndex) ?? items.first;
      if (!newItem) {
        return;
      }
      selectedItems.add(newItem);
    }
  }
  $: lastSelectedIndex = ensureSelection ? getLastSelectedIndex(items, selectedItem) : -1;
  function getLastSelectedIndex(coll: Collection<T>, item: T) {
    return coll.contents.findIndex(a => a == item);
  }

  /**
   * Convenience class which returns just the first selected item
   */
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
  singleSelectionObserver.onSelectedItem = (item: T) => {
    selectedItem = item;
  };

  function debounceReduce<OriginalArg, Accumulated>(
    callback: (accumulated: Accumulated) => void,
    minWaitInMS: number,
    reducer: (arg: OriginalArg, acc: Accumulated | undefined) => Accumulated
  ) {
    let timeoutID: ReturnType<typeof setTimeout> | undefined;
    let accumulated: Accumulated | undefined;

    return (arg: OriginalArg) => {
      accumulated = reducer(arg, accumulated);

      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      timeoutID = setTimeout(() => {
        callback(accumulated);
        accumulated = undefined;
      }, minWaitInMS);
    };
  }
</script>

<style>
  .fast-list {
    position: relative;
    flex: 1 0 0;
    overflow: hidden;
  }
  grid {
    width: 100%;
    height: min-content;
  }
  .header {
    display: contents;
  }
  .header :global(> *) {
    padding: 2px 5px;
  }
  .content {
    display: contents;
  }
  .row {
    display: contents;
  }
  .row :global(> *) {
    overflow: hidden;
    padding: 0px 5px; /* TODO vertical padding triggers a bug in the size calculation */
  }
  .scrollbar {
    overflow-y: scroll;
    overflow-x: hidden;
    position: absolute;
    right: 0px;
    width: 10px;
    /* top: and height: set in style="" */
  }
  .scrollbar::-webkit-scrollbar-thumb {
    min-height: 60px;
  }
  /* .scrollbar :dir(rtl) Doesn't work */
  :global([dir="rtl"]) .scrollbar {
    left: 0px;
    right: unset;
  }
  .hidden {
    display: none;
  }
  /* 3D style
  .header :global(> *) {
    border-top: 1px solid white;
    border-left: 1px solid white;
    border-right: 1px solid #8E8EA1;
    border-bottom: 1px solid #8E8EA1;
    background-color: #D2D2DC;
  }
  .header :global(> *:hover) {
    background-color: #E5E5F7;
  }
  */
</style>
