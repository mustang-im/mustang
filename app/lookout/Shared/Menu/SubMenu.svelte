<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="lo-submenu" class:open={isOpen} bind:this={anchorEl}
  on:mouseenter={onOpen}
  on:keydown={onKeyDown}>
  <MenuItem {label} {icon} {disabled} {tooltip} hasSubMenu keepOpen onClick={onOpen} bind:buttonEl={itemEl} />
  {#if !disabled}
    <div class="submenu-layer" use:moveOutOfParentMenu>
      <Menu bind:isMenuOpen={isOpen} anchor={anchorEl} placement="right-start" isSubMenu
        onClose={() => itemEl?.focus()}>
        <div class="submenu-content" on:click|capture={onClickInside}>
          <slot />
        </div>
      </Menu>
    </div>
  {/if}
</div>

<script lang="ts" context="module">
  import { writable } from "svelte/store";

  const openSubMenu = writable<object>(null);
</script>

<script lang="ts">
  import Menu from "./Menu.svelte";
  import MenuItem from "./MenuItem.svelte";
  import { getContext, onDestroy } from "svelte";

  export let label: string;
  export let icon: ConstructorOfATypedSvelteComponent = null;
  export let disabled: boolean | string = false;
  export let tooltip: string = null;

  const closeAllMenus = getContext<() => void>("lo-close-all-menus");
  const me = {};

  let anchorEl: HTMLElement;
  let itemEl: HTMLButtonElement;
  let isOpen = false;
  $: if ($openSubMenu != me) {
    isOpen = false;
  }

  function onOpen() {
    if (disabled) {
      return;
    }
    $openSubMenu = me;
    isOpen = true;
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key != "ArrowRight" || event.target != itemEl) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onOpen();
  }

  function onClickInside(event: MouseEvent) {
    let target = event.target as HTMLElement;
    if (!target?.closest?.("button.lo-menuitem:not(:disabled), button.menuitem:not(.disabled)") ||
        target.closest(".lo-submenu")) {
      return;
    }
    setTimeout(() => {
      isOpen = false;
      closeAllMenus?.();
    }, 0);
  }

  // The parent menu clips its content, and the popup positioning would then flip the submenu to the left
  function moveOutOfParentMenu(node: HTMLElement) {
    let target = node.closest(".lookout-window") ?? document.body;
    target.appendChild(node);
    return {
      destroy() {
        node.remove();
      },
    };
  }

  onDestroy(() => {
    if ($openSubMenu == me) {
      $openSubMenu = null;
    }
  });
</script>

<style>
  .lo-submenu {
    display: flex;
    flex-direction: column;
  }
  .lo-submenu.open > :global(.lo-menuitem) {
    background-color: var(--lo-hover-bg);
  }
  .submenu-content {
    display: flex;
    flex-direction: column;
  }
</style>
