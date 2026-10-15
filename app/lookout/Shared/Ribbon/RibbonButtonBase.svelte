<button class="ribbon-button {classes}"
  class:pressed
  class:disabled={isDisabled}
  class:has-menu={hasMenu}
  disabled={isDisabled}
  title={tooltipCalc}
  aria-label={label}
  aria-pressed={toggle ? pressed : undefined}
  aria-haspopup={hasMenu ? "menu" : undefined}
  aria-expanded={hasMenu ? pressed : undefined}
  bind:this={buttonEl}
  on:click={myOnClick}
  >
  <hbox class="icon">
    {#if loading}
      <hbox class="loading"><LoadingIcon size="24" /></hbox>
    {:else if icon}
      <svelte:component this={icon} size="24" />
    {/if}
  </hbox>
  <span class="label">
    <span class="text">{labelStart}{#if hasMenu}<span class="last-word">{labelEnd}{#if isOneWord}<span class="classic-line-break"><br /></span>{/if}<span class="chevron classic-chevron"><ChevronDownIcon size="12" /></span></span>{/if}</span>
    {#if hasMenu}
      <span class="chevron simplified-chevron"><ChevronDownIcon size="12" /></span>
    {/if}
  </span>
</button>

<script lang="ts">
  import { RibbonGroupModel } from "./Ribbon";
  import { showError } from "../../../frontend/Util/error";
  import LoadingIcon from "lucide-svelte/icons/loader-circle";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import { getContext } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let label: string;
  export let icon: ConstructorOfATypedSvelteComponent = null;
  export let tooltip: string = null;
  export let shortCutInfo: string = null;
  export let disabled: boolean | string = false;
  export let pressed = false;
  export let toggle = false;
  export let hasMenu = false;
  export let classes = "";
  export let onClick: (event: Event) => void | Promise<void> = null;
  export let errorCallback = showError;
  export let buttonEl: HTMLButtonElement = null;
  export let loadDelayMS = 500;

  getContext<RibbonGroupModel>(RibbonGroupModel.contextKey)?.offerIcon(icon);

  // Chrome breaks lines before the chevron icon even after a word joiner, so the last word and the chevron get a nowrap box.
  // Chrome also never breaks after a slash, so "Send/Receive" gets a zero-width space there.
  $: wrappingLabel = label?.replace(/\/(?=\S)/g, "/\u200B") ?? "";
  $: lastBreak = hasMenu ? Math.max(wrappingLabel.lastIndexOf(" "), wrappingLabel.lastIndexOf("\u200B")) : -1;
  $: isOneWord = hasMenu && lastBreak < 0;
  $: labelStart = hasMenu ? wrappingLabel.slice(0, lastBreak + 1) : wrappingLabel;
  $: labelEnd = hasMenu ? wrappingLabel.slice(lastBreak + 1) : "";

  /* <copied from="../../../frontend/Shared/Button.svelte"> */
  $: tooltipCalc = typeof(disabled) == "string"
    ? disabled
    : tooltip
      ? tooltip
      : label
        ? label +
          (shortCutInfo
            ? "\n\n" + $t`Shortcut: ${shortCutInfo}`
            : "")
        : null;

  let loading = false;
  let running = false;
  $: isDisabled = !!disabled || running;
  async function myOnClick(event: Event) {
    if (!(onClick && typeof(onClick) == "function")) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    running = true;
    let loadTimeout = setTimeout(() => {
      loading = true;
    }, loadDelayMS);
    try {
      await onClick(event);
    } catch (ex) {
      errorCallback(ex);
    } finally {
      clearTimeout(loadTimeout);
      loading = false;
      running = false;
    }
  }
  /* </copied> */
</script>

<style>
  .ribbon-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    width: min-content;
    min-width: var(--lo-ribbon-button-width, 72px);
    height: var(--lo-ribbon-button-height, 64px);
    flex: 0 0 auto;
    margin: 0;
    padding: 6px 2px 0 2px;
    border: 1px solid transparent;
    border-radius: var(--lo-radius-small);
    background-color: transparent;
    color: var(--lo-fg);
    font-family: inherit;
    font-size: var(--lo-font-size-small);
    line-height: 15px;
    text-align: center;
    cursor: default;
  }
  .ribbon-button:hover:not(.disabled) {
    background-color: var(--lo-hover-bg);
  }
  .ribbon-button:active:not(.disabled) {
    background-color: var(--lo-pressed-bg);
  }
  .ribbon-button.pressed:not(.disabled) {
    background-color: var(--lo-selected-bg);
    border-color: var(--lo-selected-hover-bg);
  }
  .ribbon-button.pressed:hover:not(.disabled) {
    background-color: var(--lo-selected-hover-bg);
  }
  .ribbon-button.disabled {
    color: var(--lo-fg-disabled);
  }
  .ribbon-button:focus-visible {
    outline: 2px solid var(--lo-focus-ring);
    outline-offset: -2px;
  }
  .icon {
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: var(--lo-ribbon-icon-size, 24px);
    height: var(--lo-ribbon-icon-size, 24px);
    color: var(--lo-ribbon-icon-color, var(--lo-accent-text));
  }
  .disabled .icon {
    color: var(--lo-fg-disabled);
  }
  .icon :global(svg) {
    width: var(--lo-ribbon-icon-size, 24px);
    height: var(--lo-ribbon-icon-size, 24px);
    stroke-width: 1.6;
  }
  .loading {
    animation: lo-ribbon-spin 1s linear infinite;
  }
  @keyframes lo-ribbon-spin {
    to {
      transform: rotate(360deg);
    }
  }
  .label {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    margin-block-start: 3px;
    max-width: 100%;
    text-overflow: ellipsis;
  }
  .last-word {
    white-space: nowrap;
  }
  .chevron {
    display: inline-flex;
    vertical-align: middle;
    margin-inline-start: 1px;
  }
  .simplified-chevron {
    display: none;
  }

  :global(.ribbon.simplified) .ribbon-button {
    width: auto;
    min-width: 0;
    flex-direction: row;
    justify-content: flex-start;
    padding: 0 8px;
    font-size: 13px;
    text-align: start;
  }
  :global(.ribbon.simplified) .label {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 0 0 auto;
    margin-block-start: 0;
    margin-inline-start: 6px;
    white-space: nowrap;
  }
  :global(.ribbon.simplified) .classic-chevron,
  :global(.ribbon.simplified) .classic-line-break {
    display: none;
  }
  :global(.ribbon.simplified) .simplified-chevron {
    display: inline-flex;
    margin-inline-start: 2px;
  }
  :global(.ribbon.simplified .ribbon-group.compact) .ribbon-button,
  :global(.ribbon.simplified) .ribbon-button:global(.group-collapsed-button) {
    justify-content: center;
    width: var(--lo-ribbon-icon-only-width);
    min-width: 0;
    padding: 0;
  }
  :global(.ribbon.simplified .ribbon-group.compact) .ribbon-button.has-menu,
  :global(.ribbon.simplified) .ribbon-button:global(.group-collapsed-button) {
    width: var(--lo-ribbon-icon-only-menu-width);
  }
  :global(.ribbon.simplified .ribbon-group.compact) .text,
  :global(.ribbon.simplified) :global(.group-collapsed-button) .text {
    display: none;
  }
  :global(.ribbon.simplified .ribbon-group.compact) .label,
  :global(.ribbon.simplified) :global(.group-collapsed-button) .label {
    margin-inline-start: 0;
  }
</style>
