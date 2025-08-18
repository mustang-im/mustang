<button class="menuitem {classes}"
  class:disabled class:selected
  on:click on:dblclick
  on:click={myOnClick}
  title={typeof(disabled) == "string" ? disabled : tooltip}
  {tabindex}
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
      <hbox class="label font-small">{label}</hbox>
    {:else}
      <slot name="label" />
    {/if}
  {/if}
</button>

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';
  import { showError } from '../../Util/error';
  import { getContext, type ComponentType } from 'svelte';
  import { t } from '../../../l10n/l10n';

  /** Show this label below the icon (unless `iconOnly` or label slot).
   * If iconOnly and no explicit `tooltip`: Show it as tooltip. */
  export let label: string = null;
  export let icon: ComponentType | string = null;
  export let classes = "";
  export let iconSize = "16px";
  export let iconOnly = false;
  /** For toggle buttons: pressed/active state */
  export let selected = false;
  /** If true or a string, refuse input and make it grey.
   * If a string, this string will be shown as tooltip. This allows you to inform the user
   * about the reason why the button is disabled */
  export let disabled: boolean | string = false;
  export let shortCutInfo: string = null;
  /** What to show when the user hovers with the mouse over the
   * button for ca. 2+ seconds.
   * Defaults to `label` and `shortCutInfo`. */
  export let tooltip: string = label +
    (shortCutInfo ? "\n\n" + $t`Shortcut: ${shortCutInfo}` : '');
  export let tabindex = 0;
  export let onClick: (event: Event) => void = null;
  export let errorCallback = showError;

  $: hasIcon = !!icon || $$slots.icon;
  $: hasLabel = (!!label || $$slots.label) && !iconOnly;

  let onMenuClose = getContext("onMenuClose") as () => void;
  async function myOnClick(event: Event) {
    if (!(onClick && typeof(onClick) == "function")) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    if (onMenuClose) {
      onMenuClose();
    }
    try {
      await onClick(event);
    } catch (ex) {
      errorCallback(ex);
    }
  }
</script>

<style>
  .menuitem {
    align-items: center;
    padding: 7px 14px;

    /* button */
    display: flex;
    flex-direction: row;
    border: none;
    background-color: unset;
    width: 100%;
  }
  .menuitem:hover:not(.disabled) {
    background-color: var(--hover-bg) !important;
    color: var(--hover-fg);
  }
  .menuitem:hover.selected:not(.disabled) {
    background-color: var(--selected-hover-bg);
    color: var(--selected-hover-fg);
  }
  .menuitem.selected {
    background-color: var(--selected-bg);
    color: var(--selected-fg);
  }
  .disabled {
    opacity: 50%;
  }
  .icon {
    justify-content: center;
    align-items: center;
  }
  .gap {
    width: 8px;
  }
  .label {
    white-space: nowrap;
  }
  .menuitem.danger {
    color: red;
  }
</style>
