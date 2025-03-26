{#if $$slots.control}
  <hbox class="menu button" bind:this={menuAnchorE}>
    <slot name="control" />
  </hbox>
{:else}
  <hbox class="menu button" bind:this={menuAnchorE}>
    <Button
      icon={buttonIcon}
      iconSize="16px"
      iconOnly
      {label}
      onClick={onMenuToggle}
      plain
      classes="menu-button"
      />
  </hbox>
{/if}
<Menu bind:isMenuOpen anchor={menuAnchorE} {boundaryElSel}>
  <slot />
</Menu>

<script lang="ts">
  import Button from "../Button.svelte";
  import Menu from "./Menu.svelte";
  import MenuIcon from "lucide-svelte/icons/ellipsis";

  /** in/out */
  export let isMenuOpen: boolean = false;
  /**
   * In which area the popup may appear. Much larger than the anchor.
   * Typically the entire page,  or just a part of it.
   * Should be large enough to contain the entire popup window
   * in any situation, e.g. if the anchor is in the middle of this area.
   * The popup window will be entirely within this area, and
   * be cut off larger.
   * Document element selector, e.g. '.mail-composer-window'
   * in */
  export let boundaryElSel: string = "body";
  export let label: string = "";
  export let buttonIcon = MenuIcon;

  let menuAnchorE: HTMLElement;
  function onMenuToggle() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<style>
</style>
