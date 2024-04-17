<hbox style="margin-left: {indentionLevel * 12}px" flex>
  {#if canExpand}
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

  /** in */
  export let canExpand = false;
  /** in/out */
  export let isExpanded = false;
  /** in */
  export let indentionLevel = 0;

  function onExpandCollapse() {
    isExpanded = !isExpanded;
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
