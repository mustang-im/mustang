{#if !expanded}
  <hbox class="expander-button">
    <Button plain {icon} onClick={() => expanded = true}>
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

  /** A button with label that you can click to expand some entire
   * named section. Upon clicking, the section will appear and
   * the button will disappear. */

  /** in/out */
  export let expanded = false;
  export let label: string;
  export let icon: ComponentType | string = null;
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
    margin-left: 8px;
    stroke-width: 1px;
  }
</style>
