<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="submenu-item" class:open={isOpen} bind:this={anchorEl} on:mouseenter={onOpen}>
  <MenuItem {icon} {disabled} tooltip={label} onClick={onOpen}>
    <hbox slot="label" class="submenu-label font-small">
      <span>{label}</span>
      <hbox flex />
      <ChevronIcon size="14px" class="chevron" />
    </hbox>
  </MenuItem>
  {#if !disabled}
    <div class="submenu-layer" use:moveOutOfParentMenu>
      <Menu bind:isMenuOpen={isOpen} anchor={anchorEl} placement="right-start">
        <vbox class="submenu-content" on:click|capture={onClickInside}>
          <slot />
        </vbox>
      </Menu>
    </div>
  {/if}
</div>

<script lang="ts" context="module">
  import { writable } from "svelte/store";

  const openSubMenu = writable<object>(null);
</script>

<script lang="ts">
  import Menu from "../../../frontend/Shared/Menu/Menu.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import ChevronIcon from "lucide-svelte/icons/chevron-right";
  import { getContext, setContext, onDestroy, type ComponentType } from "svelte";

  export let label: string;
  export let icon: ComponentType = null;
  export let disabled: boolean | string = false;

  const parentClose = getContext<() => void>("onMenuClose");
  setContext("onMenuClose", () => {});
  const me = {};

  let anchorEl: HTMLElement;
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

  function onClickInside(event: MouseEvent) {
    if (!(event.target as HTMLElement)?.closest?.("button.menuitem:not(.disabled)")) {
      return;
    }
    setTimeout(() => {
      isOpen = false;
      parentClose?.();
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
  .submenu-item {
    display: flex;
    flex-direction: column;
  }
  .submenu-item.open > :global(.menuitem) {
    background-color: var(--lo-hover-bg);
  }
  .submenu-label {
    flex: 1;
    align-items: center;
    min-width: 0;
  }
  .submenu-label :global(.chevron) {
    margin-inline-start: 24px;
    color: var(--lo-fg-secondary);
  }
</style>
