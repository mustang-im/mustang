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
  export let iconSize =
    classes?.includes("create") ? "18px" :
    classes?.includes("large") ? "20px" :
    "16px";
  export let padding =
    classes?.includes("create") ? "8px" :
    classes?.includes("large") ? "10px" :
    "8px";
  export let filled = classes?.includes("create");
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
  :global(svg) {
    stroke: currentColor;
  }
  .filled:not(:hover) :global(svg) {
    stroke: currentColor;
  }
  .icon {
    margin-right: 0px;
  }
  .disabled {
    opacity: 50%;
  }
  button:hover:not(.disabled) {
    background-color: #A9DAD4;
    color: black;
    border: 1px solid transparent !important;
  }
  .selected:not(.disabled) {
    background-color: #20AE9E; /* or #27C1AA */
    color: white;
  }
  .selected:hover:not(.disabled) {
    background-color: #1C998B;
    color: white;
  }
  button.secondary {
    border-color: #A1E4DA;
  }

  @media (prefers-color-scheme: light) {
    button {
      background-color: #f9f9f9;
    }
  }
</style>
