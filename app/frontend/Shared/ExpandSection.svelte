<vbox class="expander">
   <hbox class="header" class:box={headerBox}
      on:click={onExpandToggle}>
      <slot name="header" />
    <hbox flex />
    <hbox class="buttons top-right">
      <Button plain
        icon={expanded ? CollapseIcon : ExpandIcon}
        label={expanded ? $t`Collapse` : $t`Expand`}
        onClick={onExpandToggle}
        classes="expand"
        iconOnly iconSize="16px" />
    </hbox>
   </hbox>
   {#if expanded}
     <slot />
   {/if}
</vbox>

<script lang="ts">
  import Button from "./Button.svelte";
  import ExpandIcon from "lucide-svelte/icons/chevron-down";
  import CollapseIcon from "lucide-svelte/icons/chevron-up";
  import { t } from "../../l10n/l10n";

  /** in/out */
  export let expanded = false;
  /** Whether to show a visual box around the header */
  export let headerBox = false;

  function onExpandToggle(event: MouseEvent) {
    expanded = !expanded;
    event.stopPropagation();
  }
</script>

<style>
  .header.box {
    align-items: center;
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    border: 2px solid var(--border);
    border-radius: 5px;
    padding: 4px 8px;
    margin-block-end: 4px;
  }
</style>
