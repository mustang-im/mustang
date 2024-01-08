<button on:click on:dblclick
  title={label} class="button {classes}" class:filled class:border
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
  export let iconSize = "16px";
  export let filled = false;
  export let border = true;
</script>

<style>
  button {
    border: 1px solid transparent;
    border-radius: 1000px;
    padding: 8px;

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
    padding: 9px;
    color: white;
    stroke-width: 2px;
  }
  .filled:not(:hover) :global(path) {
    stroke: currentColor;
  }
  .icon {
    margin-right: 0px;
  }
  button:hover {
    background-color: rgba(32, 174, 158, 100%); /* #20AE9E */
    border: 1px solid transparent !important;
  }
  .button:hover .icon :global(path) {
    stroke: white;
  }

  @media (prefers-color-scheme: light) {
    button {
      background-color: #f9f9f9;
    }
  }
</style>
