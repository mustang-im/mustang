<FastList items={expandedItems} {columns} bind:selectedItem bind:selectedItems>
  <slot name="header" slot="header" />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div slot="row" class="tree-row" let:item>
    <slot name="row" {item}
      indentionLevel={getIndentionLevelFor(item)}
      canExpand={item.children.hasItems}
      isExpanded={showChildrenOf.has(item)}
      />
  </div>
</FastList>

<script lang="ts">
  /** This is a variant of `<FastList>` which can display a hierarchy of homogenous items,
   * e.g. a folder tree or message threads.
   * The items need to implement the `TreeItem` interface, which has `.parent` and `.children`.
   * The `<FastTree>` then takes care of rendering the hierarchy on-demand,
   * opening/closing items etc.
   */

  import { type TreeItem, getIndentionLevelFor } from "./FastTree";
  import { type Collection, ArrayColl } from "svelte-collections"
  import FastList from "./FastList.svelte";

  // <https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md>
  type T = $$Generic<TreeItem>;

  /**
   * The items to display in the list.
   */
  export let items: Collection<T>;

  /** items + children which are displayed */
  let expandedItems: Collection<T>;
  let showChildrenOf = new Set<T>();

  $: expandedItems = new ArrayColl(items);

  const selectOpens = true;
  $: selectOpens && selectedItem && openOnly(selectedItem)
  function openOnly(selectedItem: T) {
    expandedItems = new ArrayColl(items);
    showChildrenOf.clear();
    if (!selectedItem) {
      return;
    }
    let cur = selectedItem;
    while (cur) {
      showChildrenOf.add(cur);
      expandedItems.addAll(cur.children);
      cur = cur.parent;
    }
  }

  /** grid-template-columns: */
  export let columns: string = "auto";

  /**
   * The list item that the user selected,
   * e.g. by clicking on it.
   * Unlike selecteditems, this is always returns just one element.
   *
   * in/out
   */
  export let selectedItem: T = null;

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
  export let selectedItems: ArrayColl<T>;
</script>

<style>
</style>
