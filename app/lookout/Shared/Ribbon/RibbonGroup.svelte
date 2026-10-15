<vbox class="ribbon-group" class:collapsed={$collapsed} class:compact={$compact}
  role="group" aria-label={label}
  bind:this={groupEl}>
  {#if $collapsed}
    <RibbonButtonBase {label} icon={icon ?? group.firstIcon}
      classes="group-collapsed-button menu-trigger"
      hasMenu pressed={isPopupOpen}
      onClick={onTogglePopup}
      bind:buttonEl={collapsedButtonEl}
      />
  {/if}
  <hbox class="group-buttons"
    class:popup={$collapsed}
    class:open={$collapsed && isPopupOpen}
    style={$collapsed ? popupStyle : ""}
    on:click|capture={onClickInside}
    bind:this={buttonsEl}>
    <slot />
  </hbox>
  {#if !$collapsed}
    <hbox class="group-label">{label}</hbox>
  {/if}
</vbox>
<svelte:window on:click={onClickOutside} on:keydown={onKeyDown} on:resize={closePopup} />

<script lang="ts">
  import { RibbonGroupModel, RibbonTabModel } from "./Ribbon";
  import RibbonButtonBase from "./RibbonButtonBase.svelte";
  import { getContext, setContext, onMount, onDestroy } from "svelte";

  export let label: string;
  export let icon: ConstructorOfATypedSvelteComponent = null;

  const tab = getContext<RibbonTabModel>(RibbonTabModel.contextKey);
  const group = new RibbonGroupModel(label);
  setContext(RibbonGroupModel.contextKey, group);
  const collapsed = group.collapsed;
  const compact = group.compact;
  $: group.label = label;

  let groupEl: HTMLElement;
  let buttonsEl: HTMLElement;
  let collapsedButtonEl: HTMLButtonElement;
  let isPopupOpen = false;
  let popupStyle = "";

  let resizeObserver: ResizeObserver;
  onMount(() => {
    tab?.addGroup(group);
    resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(buttonsEl);
    measure();
  });
  onDestroy(() => {
    resizeObserver?.disconnect();
    tab?.removeGroup(group);
  });

  function measure() {
    if (!groupEl || !buttonsEl) {
      return;
    }
    let style = getComputedStyle(groupEl);
    let chrome = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) +
      parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    let buttonsStyle = getComputedStyle(buttonsEl);
    let popupChrome = parseFloat(buttonsStyle.paddingLeft) + parseFloat(buttonsStyle.paddingRight) +
      parseFloat(buttonsStyle.borderLeftWidth) + parseFloat(buttonsStyle.borderRightWidth);
    let iconOnlyWidth = parseFloat(style.getPropertyValue("--lo-ribbon-icon-only-width"));
    let iconOnlyMenuWidth = parseFloat(style.getPropertyValue("--lo-ribbon-icon-only-menu-width"));
    let hasIconOnly = !isNaN(iconOnlyWidth) && !isNaN(iconOnlyMenuWidth);
    let expandedWidth = hasIconOnly && $compact
      ? group.expandedWidth
      : buttonsEl.offsetWidth - popupChrome + chrome;
    if (!hasIconOnly) {
      let buttonWidth = (groupEl.querySelector<HTMLElement>(".ribbon-button") ?? buttonsEl).offsetWidth;
      group.setWidths(expandedWidth, buttonWidth + chrome);
    } else {
      let buttons = Array.from(buttonsEl.querySelectorAll(".ribbon-button"));
      let gap = parseFloat(buttonsStyle.columnGap) || 0;
      let iconsWidth = buttons.reduce((sum, button) =>
        sum + (button.classList.contains("has-menu") ? iconOnlyMenuWidth : iconOnlyWidth), 0) +
        gap * Math.max(0, buttons.length - 1);
      group.setWidths(expandedWidth, iconOnlyMenuWidth + chrome, iconsWidth + chrome);
    }
    tab?.fitGroups();
  }

  $: if (!$collapsed) {
    isPopupOpen = false;
  }

  function onTogglePopup() {
    if (isPopupOpen) {
      closePopup();
      return;
    }
    let anchor = collapsedButtonEl.getBoundingClientRect();
    let left = Math.max(4, Math.min(anchor.left, window.innerWidth - buttonsEl.offsetWidth - 8));
    popupStyle = `left: ${left}px; top: ${anchor.bottom + 4}px;`;
    isPopupOpen = true;
  }

  function closePopup() {
    isPopupOpen = false;
  }

  function onClickInside(event: MouseEvent) {
    if (!$collapsed || !isPopupOpen) {
      return;
    }
    let target = event.target as HTMLElement;
    if (target.closest(".menu-trigger")) {
      return;
    }
    closePopup();
  }

  function onClickOutside(event: MouseEvent) {
    if (!isPopupOpen || groupEl?.contains(event.target as Node)) {
      return;
    }
    closePopup();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (isPopupOpen && event.key == "Escape") {
      closePopup();
      collapsedButtonEl?.focus();
    }
  }
</script>

<style>
  .ribbon-group {
    position: relative;
    flex: 0 0 auto;
    padding: 0 5px;
  }
  .ribbon-group:not(:last-child)::after {
    content: "";
    position: absolute;
    inset-inline-end: 0;
    top: 6px;
    bottom: 6px;
    width: 1px;
    background-color: var(--lo-divider);
  }
  .group-buttons {
    flex: 1 0 auto;
    align-items: flex-start;
    gap: 2px;
    width: max-content;
  }
  .group-buttons.popup {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 30;
    visibility: hidden;
    padding: 4px;
    background-color: var(--lo-ribbon-bg);
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius);
    box-shadow: var(--lo-shadow-popup);
  }
  .group-buttons.popup.open {
    visibility: visible;
  }
  .group-label {
    justify-content: center;
    width: 0;
    min-width: 100%;
    height: 18px;
    font-size: 11px;
    line-height: 18px;
    color: var(--lo-fg-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :global(.ribbon.simplified) .group-label {
    display: none;
  }
</style>
