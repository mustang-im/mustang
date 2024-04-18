<hbox style="margin-left: {indentionLevel * 12}px" flex>
  {#if isTree}
    <Button
      classes="expand"
      label={isExpanded ? "Collapse" : "Expand"}
      icon={isExpanded ? CollapseIcon : ExpandIcon}
      iconOnly plain
      on:click={onExpandCollapse}
      />
  {/if}
  <slot name="row" />
</hbox>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import ExpandIcon from "lucide-svelte/icons/chevron-right";
  import CollapseIcon from "lucide-svelte/icons/chevron-down";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let indentionLevel = 0;
  export let isExpanded = false;
  export let isTree = true;

  function onExpandCollapse() {
    dispatch('expandCollapse');
  }
</script>

<style>
  hbox :global(button.expand) {
    color: #555555;
  }
  hbox :global(button:hover) {
    background-color: inherit !important;
  }
</style>
