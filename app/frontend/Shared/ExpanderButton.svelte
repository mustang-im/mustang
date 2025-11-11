{#if !expanded}
  <hbox class="expander-button {classes}">
    <Button plain onClick={onExpand} tooltip={label}>
      <hbox class="content font-small" slot="label">
        {#if typeof(icon) == "string"}
          <hbox class="icon">
            <Icon data={icon} size={iconSize} />
          </hbox>
        {:else if icon}
          <hbox class="icon">
            <svelte:component this={icon} size={iconSize} />
          </hbox>
        {:else}
          <slot name="icon" />
        {/if}
        <hbox class="label">{label}</hbox>
        <AddIcon size={iconSize} />
      </hbox>
    </Button>
  </hbox>
{/if}

<script lang="ts">
  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";
  import AddIcon from "lucide-svelte/icons/circle-plus";
  import type { ComponentType } from "svelte";
  import { createEventDispatcher } from 'svelte';
  import { appGlobal } from "../../logic/app";
  const dispatch = createEventDispatcher();

  /** A button with label that you can click to expand some entire
   * named section. Upon clicking, the section will appear and
   * the button will disappear. */

  /** in/out */
  export let expanded = false;
  export let label: string;
  export let icon: ComponentType | string | null = null;
  export let iconSize = "16px";
  export let classes = "";

  function onExpand() {
    expanded = true;
    dispatch("expand");
  }
</script>

<style>
  :global(.mobile) .content {
    border-radius: 12px;
    padding: 8px 12px !important;
  }
  .content {
    align-items: center;
    background-color: var(--main-bg);
    color: var(--main-fg);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 2px 6px 2px 4px;
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
  .icon {
    margin-inline-start: 0px;
    margin-inline-end: 8px;
  }
  :global(.mobile) .label {
    border-radius: 100px;
    padding: 0px 2px;
  }
</style>
