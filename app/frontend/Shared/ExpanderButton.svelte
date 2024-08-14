{#if !expanded}
  <hbox class="expander-button">
    <Button plain {icon} onClick={onExpand}>
      <hbox class="content" slot="label">
        {label}
        <AddIcon size="16px" />
      </hbox>
    </Button>
  </hbox>
{/if}

<script lang="ts">
  import Button from "./Button.svelte";
  import AddIcon from "lucide-svelte/icons/circle-plus";
  import type { ComponentType } from "svelte";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  /** A button with label that you can click to expand some entire
   * named section. Upon clicking, the section will appear and
   * the button will disappear. */

  /** in/out */
  export let expanded = false;
  export let label: string;
  export let icon: ComponentType | string = null;

  function onExpand() {
    expanded = true;
    dispatch("expand");
  }
</script>

<style>
  .content {
    align-items: center;
    background-color: var(--main-bg);
    color: var(--main-fg);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 2px 6px 2px 10px;
  }
  .content :global(svg) {
    margin-inline-start: 8px;
    stroke-width: 1px;
  }
  .expander-button :global(button:hover:not(.disabled)) {
    background-color: transparent;
  }
  :global(button:hover:not(.disabled)) .content {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
</style>
