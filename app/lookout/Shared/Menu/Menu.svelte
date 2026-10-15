<Popup bind:popupOpen={isMenuOpen} popupAnchor={anchor} {placement} {boundaryElSel}>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="lo-menu" role="menu" tabindex="-1"
    on:keydown={onKeyDown}
    bind:this={menuEl}>
    <slot />
  </div>
</Popup>

<script lang="ts">
  import Popup from "../../../frontend/Shared/Popup.svelte";
  import type { Placement } from "@popperjs/core";
  import { getContext, setContext, tick } from "svelte";

  export let isMenuOpen = false;
  export let anchor: HTMLElement;
  export let placement: Placement = "bottom-start";
  export let boundaryElSel = "body";
  export let isSubMenu = false;
  export let autoFocus = true;
  export let onClose: () => void = null;

  let menuEl: HTMLElement;

  function closeMenu() {
    isMenuOpen = false;
    onClose?.();
  }
  setContext("onMenuClose", closeMenu);
  setContext("lo-close-all-menus", getContext<() => void>("lo-close-all-menus") ?? closeMenu);

  $: if (isMenuOpen && autoFocus) {
    focusMenu();
  }
  async function focusMenu() {
    await tick();
    menuEl?.focus({ preventScroll: true });
  }

  export async function focusFirstItem() {
    await tick();
    items()[0]?.focus();
  }

  function items(): HTMLElement[] {
    return Array.from(menuEl.querySelectorAll<HTMLElement>("button.lo-menuitem:not(:disabled), button.menuitem:not(.disabled)"));
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key == "Escape" || (isSubMenu && event.key == "ArrowLeft")) {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      if (anchor instanceof HTMLElement) {
        anchor.focus();
      }
      return;
    }
    if (event.key != "ArrowDown" && event.key != "ArrowUp" && event.key != "Home" && event.key != "End") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    let all = items();
    if (!all.length) {
      return;
    }
    let pos = all.indexOf(document.activeElement as HTMLElement);
    let next = event.key == "Home" ? 0
      : event.key == "End" ? all.length - 1
      : event.key == "ArrowDown" ? (pos + 1) % all.length
      : (pos <= 0 ? all.length - 1 : pos - 1);
    all[next].focus();
  }
</script>

<style>
  .lo-menu {
    display: flex;
    flex-direction: column;
    min-width: 180px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    padding: 4px;
    box-sizing: border-box;
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius);
    box-shadow: var(--lo-shadow-popup);
    font-family: var(--lo-font);
    font-size: var(--lo-font-size);
    outline: none;
  }
  .lo-menu :global(button.menuitem) {
    min-height: 30px;
    padding: 0 10px 0 10px;
    border-radius: var(--lo-radius-small);
    color: var(--lo-fg);
    font-family: inherit;
  }
  .lo-menu :global(button.menuitem .label) {
    font-size: var(--lo-font-size);
  }
  .lo-menu :global(button.menuitem .gap) {
    width: 10px;
  }
</style>
