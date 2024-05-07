<button on:click on:dblclick on:click={myOnClick} bind:this={buttonEl}
  title={tooltip} class="button {classes}" class:plain
  {disabled} class:disabled class:selected
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
  {#if hasIcon && hasLabel}
    <hbox class="gap" />
  {/if}
  {#if !iconOnly}
    {#if label}
      <hbox class="label">{label}</hbox>
    {:else}
      <slot name="label" />
    {/if}
  {/if}
</button>

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';
  import type { ComponentType } from 'svelte';
  import { showError } from '../Util/error';

  /** Show this label below the icon (unless `iconOnly` or label slot).
   * If iconOnly and no explicit `tooltip`: Show it as tooltip. */
  export let label: string = null;
  export let shortCutInfo: string = null;
  /** What to show when the user hovers with the mouse over the
   * button for ca. 2+ seconds.
   * Defaults to `label` and `shortCutInfo`. */
  export let tooltip: string = label +
    (shortCutInfo ? "\n\nShortcut: " + shortCutInfo : '');
  export let icon: ComponentType | string = null;
  export let classes = "";
  export let plain = false;
  export let iconSize = "16px";
  export let iconOnly = false;
  export let disabled = false;
  export let selected = false;
  export let onClick: (event: Event) => void = null;
  export let errorCallback = showError;
  /** e.g. to `.focus()`
   * out */
  export let buttonEl: HTMLButtonElement = null;

  $: hasIcon = !!icon || $$slots.icon;
  $: hasLabel = (!!label || $$slots.label) && !iconOnly;

  async function myOnClick(event: Event) {
    if (!(onClick && typeof(onClick) == "function")) {
      return;
    }
    let previousDisabled = disabled;
    disabled = true;
    try {
      await onClick(event);
    } catch (ex) {
      errorCallback(ex);
    }
    disabled = previousDisabled;
  }
</script>

<style>
  button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  button:not(.plain) {
    background-color: #f9f9f9;
    border: 1px solid #B2ADB8;
    border-radius: 1000px;
    padding: 6px 8px;
  }
  .plain {
    background-color: transparent;
    border-radius: 3px;
    border: none;
    min-width: 20px;
  }
  .disabled {
    opacity: 50%;
  }
  button:hover:not(.disabled) {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  button.selected:not(.disabled) {
    background-color: var(--selected-bg);
    color: var(--selected-fg);
  }
  button.selected:hover:not(.disabled) {
    background-color: var(--selected-hover-bg);
    color: var(--selected-hover-bg);
  }
  :global(.selected) button:hover:not(.disabled) {
    background-color: var(--selected-hover-bg);
    color: var(--selected-hover-fg);
  }
  button.secondary {
    border-color: var(--button-secondard-line);
  }
  button.filled {
    background-color: var(--inverted-bg);
    color: var(--inverted-fg);
  }
  button.large {
    padding: 8px 24px;
    font-size: 16px;
    font-weight: bold;
  }
  .gap {
    width: 8px;
  }
  .plain .icon {
    margin-right: 0;
  }
</style>
