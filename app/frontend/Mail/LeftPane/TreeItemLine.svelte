<hbox class="tree-line-item" style="margin-left: {indentionLevel * 12}px" flex>
  {#if canExpand}
    <Button
      classes="expand"
      label={isExpanded ? "Collapse" : "Expand"}
      icon={isExpanded ? CollapseIcon : ExpandIcon}
      iconOnly plain
      on:click={onExpandCollapse}
      />
  {:else}
    <hbox class="button-placeholder" />
  {/if}
  <slot name="row" />
</hbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import { getIndentionLevelFor } from "../../Shared/FastTree";
  import Button from "../../Shared/Button.svelte";
  import ExpandIcon from "lucide-svelte/icons/chevron-right";
  import CollapseIcon from "lucide-svelte/icons/chevron-down";

  // <https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md>
  type T = $$Generic<TreeItem>;

  /** in */
  export let item: T;

  $: children = item.children as Collection<T>;
  $: canExpand = $children.hasItems;
  $: isExpanded = $item.expanded;
  $: indentionLevel = getIndentionLevelFor(item);

  function onExpandCollapse() {
    console.log("expand/coll", "was", item.expanded, "change to", !item.expanded);
    item.expanded = !item.expanded;
  }
</script>

<style>
  hbox :global(button.expand) {
    color: #555555;
  }
  hbox :global(button:hover) {
    background-color: inherit !important;
  }
  .tree-line-item :global(button.expand) {
    padding: 0;
    min-width: unset;
    margin-right: 2px;
  }
  .button-placeholder {
    margin-right: 2px;
    width: 16px;
  }
</style>
