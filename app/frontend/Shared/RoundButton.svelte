<button on:click on:dblclick on:click={myOnClick}
  title={label} class="button {classes}" class:filled class:border
  {disabled} class:disabled class:selected
  {tabindex}
  style="--padding: {padding}"
  >
  <hbox class="icon">
    {#if loading}
      <Spinner size={iconSize} />
    {:else if typeof(icon) == "string"}
      <Icon data={icon} size={iconSize} />
    {:else if icon}
      <svelte:component this={icon} size={iconSize} />
    {:else}
      <slot name="icon" />
    {/if}
  </hbox>
</button>

<script lang="ts">
  import { showError } from '../Util/error';
  import Icon from 'svelte-icon/Icon.svelte';
  import Spinner from './Spinner.svelte';
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
    classes?.includes("small") ? "4px" :
    classes?.includes("smallest") ? "2px" :
    "8px";
  export let filled = classes?.includes("create");
  export let border = true;
  export let disabled = false;
  export let selected = false;
  export let tabindex = null;
  export let onClick: (event: Event) => void = null;
  export let errorCallback = showError;

  let loading = false;
  async function myOnClick(event: Event) {
    if (!(onClick && typeof(onClick) == "function")) {
      return;
    }
    let previousDisabled = disabled;
    disabled = true;
    let loadTimeout = setTimeout(() => {
      loading = true;
    }, 500);
    try {
      await onClick(event);
    } catch (ex) {
      errorCallback(ex);
    } finally {
      clearTimeout(loadTimeout);
      loading = false;
    }
    disabled = previousDisabled;
  }
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

    background-color: var(--button-bg);
    color: var(--button-fg);
  }
  button.border {
    border: 1px solid var(--button-border);
  }
  .filled:not(:hover):not(.disabled) {
    background-color: var(--inverted-bg);
    color: var(--inverted-fg);
    border: none;
    padding: calc(var(--padding) + 1px);
    stroke-width: 2px;
  }
  :global(svg) {
    stroke: currentColor;
  }
  .filled:not(:hover) :global(svg) {
    stroke: currentColor;
  }
  .icon {
    margin-inline-end: 0px;
  }
  .disabled {
    opacity: 50%;
  }
  button:hover:not(.disabled) {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
    border: 1px solid transparent !important;
  }
  .selected:not(.disabled) {
    background-color: var(--selected-bg);
    color:  var(--selected-fg);
  }
  .selected:hover:not(.disabled) {
    background-color: var(--selected-hover-bg);
    color: var(--selected-hover-fg);
  }
  button.secondary {
    border-color: var(--button-secondary-line);
  }
  button.plain {
    background-color: transparent;
  }
</style>
