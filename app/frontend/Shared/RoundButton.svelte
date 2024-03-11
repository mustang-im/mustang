<button on:click on:dblclick
  title={label} class="button {classes}" class:filled class:border
  {disabled} class:disabled class:selected
  style="--padding: {padding}"
  >
  <hbox class="icon">
    {#if typeof(icon) == "string"}
      <Icon data={icon} size={iconSize} />
    {:else if icon}
      <svelte:component this={icon} size={iconSize} />
    {:else}
      <slot name="icon" />
    {/if}
  </hbox>
</button>

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';
  import type { ComponentType } from 'svelte';

  export let label: string = null;
  export let icon: ComponentType | string = null;
  export let classes = "";
  export let iconSize = classes?.includes("large") ? "20px" : "16px";
  export let padding = classes?.includes("large") ? "10px" : "8px";
  export let filled = false;
  export let border = true;
  export let disabled = false;
  export let selected = false;
</script>

<style>
  button {
    border: 1px solid transparent;
    border-radius: 1000px;
    padding: var(--padding);

    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  button.border {
    border: 1px solid #B2ADB8;
  }
  .filled:not(:hover) {
    background-color: #160C27; /* 142862 */
    border: none;
    padding: calc(var(--padding) + 1px);
    color: white;
    stroke-width: 2px;
  }
  .filled:not(:hover) :global(path) {
    stroke: currentColor;
  }
  .icon {
    margin-right: 0px;
  }
  button:hover:not(.disabled) {
    background-color: rgba(32, 174, 158, 100%); /* #20AE9E */
    border: 1px solid transparent !important;
  }
  .button:hover:not(.disabled) .icon :global(path) {
    stroke: white;
  }
  .disabled {
    opacity: 50%;
  }
  .selected {
    background-color: #00000033; /* TODO adapt style */
  }

  .secondary.action {
    border-color: #E2E6E6;
  }

  @media (prefers-color-scheme: light) {
    button {
      background-color: #f9f9f9;
    }
  }
</style>
