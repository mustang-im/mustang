<button on:click on:dblclick
  title={label} class="button {classes}" class:filled
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
</script>

<style>
  button {
    border: 1px solid #B2ADB8;
    border-radius: 1000px;
    padding: 8px;

    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: center;
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
  button:hover {
    background-color: rgba(32, 174, 158, 50%); /* #20AE9E */
  }
  .icon {
    margin-right: 0px;
  }
</style>
