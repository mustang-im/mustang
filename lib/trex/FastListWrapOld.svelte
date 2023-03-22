<fastlist bind:this={fastListE}>
  <slot name="header" />
  <slot name="row" />
</fastlist>

<script lang="ts">
  import { Fastlist, SingleSelectionObserver } from 'mustang-lib/trex/fastlist';
  import { Collection, ArrayColl } from 'jscollections';

  type T = $$Generic;
  /** The items to display */
  export let items: Collection<T> = new ArrayColl();
  /** The items that the user selected -- out only */
  export let selectedItems: Collection<T> = null;
  /** The item that the user selected -- out only */
  export let selectedItem: T = null;

  let fastList: Fastlist;
  let fastListE: HTMLElement;
  let singleSelectionObserver = new SingleSelectionObserver();
  singleSelectionObserver.onSelectedItem = (item: T) => selectedItem = item;

  $: onLoad(fastListE);
  function onLoad(_dummy) {
    if (!fastListE) {
      return;
    }
    fastList = new Fastlist(fastListE);
    fastList.showCollection(items);
    selectedItems = fastList.selectedCollection;
    selectedItems.registerObserver(singleSelectionObserver);
  }
</script>
