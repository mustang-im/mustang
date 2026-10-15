<hbox class="ribbon-menu-button">
  <RibbonButtonBase {label} {icon} {tooltip} {shortCutInfo} {disabled}
    classes="menu-trigger {classes}"
    hasMenu pressed={isMenuOpen}
    onClick={onToggleMenu}
    bind:buttonEl
    />
  <Menu bind:isMenuOpen anchor={buttonEl} placement="bottom-start">
    <slot />
  </Menu>
</hbox>

<script lang="ts">
  import RibbonButtonBase from "./RibbonButtonBase.svelte";
  import Menu from "../../../frontend/Shared/Menu/Menu.svelte";

  export let label: string;
  export let icon: ConstructorOfATypedSvelteComponent = null;
  export let isMenuOpen = false;
  export let disabled: boolean | string = false;
  export let tooltip: string = null;
  export let shortCutInfo: string = null;
  export let classes = "";
  export let buttonEl: HTMLButtonElement = null;

  function onToggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<style>
  .ribbon-menu-button {
    flex: 0 0 auto;
  }
</style>
