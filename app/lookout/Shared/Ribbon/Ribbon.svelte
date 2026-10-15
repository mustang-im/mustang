<vbox class="ribbon {layout}"
  class:collapsed={isCollapsed}
  class:temp-open={isCollapsed && isTempOpen}
  bind:this={ribbonEl}>
  <hbox class="tab-row">
    <button class="tab file-tab" on:click={onFile} title={$t`File`}>
      {$t`File`}
    </button>
    <hbox class="tabs" role="tablist" tabindex="-1" on:keydown={onTabRowKeyDown}>
      {#each $tabs as tab}
        <button class="tab" role="tab"
          class:selected={tab == $selectedTab}
          aria-selected={tab == $selectedTab}
          tabindex={tab == $selectedTab ? 0 : -1}
          on:click={() => onSelectTab(tab)}
          on:dblclick={onToggleCollapsed}>
          {tab.label}
        </button>
      {/each}
    </hbox>
    <hbox flex class="spacer" />
    <slot name="tab-row-end" />
    <hbox class="options" bind:this={optionsEl}>
      <button class="options-button"
        class:open={isOptionsOpen}
        title={$t`Ribbon display options`}
        aria-label={$t`Ribbon display options`}
        aria-haspopup="menu"
        on:click|stopPropagation={onToggleOptions}>
        <OptionsIcon size="16" />
      </button>
    </hbox>
    <Menu bind:isMenuOpen={isOptionsOpen} anchor={optionsEl} placement="bottom-end">
      <MenuLabel label={$t`Ribbon layout`} />
      <MenuItem label={$t`Classic ribbon`} icon={layout == "classic" ? CheckIcon : BlankIcon}
        onClick={() => ribbon.setLayout("classic")} />
      <MenuItem label={$t`Simplified ribbon`} icon={layout == "simplified" ? CheckIcon : BlankIcon}
        onClick={() => ribbon.setLayout("simplified")} />
      <MenuDivider />
      <MenuLabel label={$t`Show ribbon`} />
      <MenuItem label={$t`Always show ribbon`} icon={isCollapsed ? BlankIcon : CheckIcon}
        onClick={() => ribbon.setCollapsed(false)} />
      <MenuItem label={$t`Show tabs only`} icon={isCollapsed ? CheckIcon : BlankIcon}
        onClick={() => ribbon.setCollapsed(true)} />
    </Menu>
  </hbox>
  <hbox class="ribbon-content" on:click|capture={onClickContent}>
    <slot />
  </hbox>
</vbox>
<svelte:window on:click={onClickOutside} on:keydown={onKeyDown} />

<script lang="ts">
  import { RibbonModel, type RibbonTabModel, type RibbonLayout } from "./Ribbon";
  import { backstageState } from "../../Settings/BackstageState";
  import Menu from "../../../frontend/Shared/Menu/Menu.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../../frontend/Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import OptionsIcon from "lucide-svelte/icons/chevron-down";
  import CheckIcon from "lucide-svelte/icons/check";
  import BlankIcon from "../Menu/BlankIcon.svelte";
  import { setContext } from "svelte";
  import { t } from "../../../l10n/l10n";

  const ribbon = new RibbonModel();
  setContext(RibbonModel.contextKey, ribbon);
  const tabs = ribbon.tabs;
  const selectedTab = ribbon.selectedTab;
  const layoutSetting = ribbon.layout;
  const collapsedSetting = ribbon.collapsed;

  let layout: RibbonLayout;
  $: $layoutSetting, layout = ribbon.currentLayout;
  $: isCollapsed = !!$collapsedSetting.value;

  let ribbonEl: HTMLElement;
  let optionsEl: HTMLElement;
  let isOptionsOpen = false;
  let isTempOpen = false;

  function onFile() {
    isTempOpen = false;
    backstageState.open();
  }

  function onSelectTab(tab: RibbonTabModel) {
    if (isCollapsed) {
      isTempOpen = !(isTempOpen && tab == $selectedTab);
    }
    ribbon.selectTab(tab);
  }

  function onToggleCollapsed() {
    isTempOpen = false;
    ribbon.setCollapsed(!isCollapsed);
  }

  function onToggleOptions() {
    isOptionsOpen = !isOptionsOpen;
  }

  function onClickContent(event: MouseEvent) {
    if (!isCollapsed || !isTempOpen) {
      return;
    }
    let target = event.target as HTMLElement;
    if (!target.closest("button") || target.closest(".menu-trigger")) {
      return;
    }
    isTempOpen = false;
  }

  function onClickOutside(event: MouseEvent) {
    if (!isTempOpen || ribbonEl?.contains(event.target as Node)) {
      return;
    }
    isTempOpen = false;
  }

  function onKeyDown(event: KeyboardEvent) {
    if (isTempOpen && event.key == "Escape") {
      isTempOpen = false;
    }
  }

  function onTabRowKeyDown(event: KeyboardEvent) {
    if (event.key != "ArrowLeft" && event.key != "ArrowRight") {
      return;
    }
    let tabButtons = Array.from(ribbonEl.querySelectorAll<HTMLElement>(".tab-row .tabs .tab"));
    let pos = tabButtons.indexOf(document.activeElement as HTMLElement);
    if (pos < 0) {
      return;
    }
    let forward = (event.key == "ArrowRight") != (getComputedStyle(ribbonEl).direction == "rtl");
    let next = tabButtons[(pos + (forward ? 1 : -1) + tabButtons.length) % tabButtons.length];
    next.focus();
    event.preventDefault();
  }
</script>

<style>
  .ribbon {
    position: relative;
    flex: 0 0 auto;
    background-color: var(--lo-window-bg);
    color: var(--lo-fg);
    z-index: 10;
  }
  .ribbon.classic {
    --lo-ribbon-button-width: max(72px, calc(6px + 11ch));
    --lo-ribbon-button-height: 64px;
    --lo-ribbon-icon-size: 24px;
  }
  .ribbon.simplified {
    --lo-ribbon-button-width: max(112px, calc(36px + 12ch));
    --lo-ribbon-button-height: 32px;
    --lo-ribbon-icon-size: 16px;
  }

  .tab-row {
    align-items: stretch;
    height: 36px;
    padding: 0 8px;
  }
  .tabs {
    align-items: stretch;
  }
  .tabs:focus {
    outline: none;
  }
  .tab {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 12px;
    margin: 2px 1px;
    border: none;
    border-radius: var(--lo-radius-small);
    background-color: transparent;
    color: var(--lo-fg);
    font-family: inherit;
    font-size: var(--lo-font-size);
    white-space: nowrap;
  }
  .tab:hover {
    background-color: var(--lo-hover-bg);
  }
  .tab.selected {
    font-weight: 600;
  }
  .tab.selected::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 3px;
    height: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
  .collapsed:not(.temp-open) .tab.selected {
    font-weight: normal;
  }
  .collapsed:not(.temp-open) .tab.selected::after {
    display: none;
  }
  .options {
    align-items: center;
  }
  .options-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background-color: transparent;
    color: var(--lo-fg-secondary);
  }
  .options-button:hover,
  .options-button.open {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }

  .ribbon-content {
    margin: 0 8px 8px 8px;
    padding: 4px;
    background-color: var(--lo-ribbon-bg);
    border-radius: var(--lo-radius);
    box-shadow: var(--lo-shadow-card);
  }
  .collapsed .ribbon-content {
    display: none;
  }
  .collapsed.temp-open .ribbon-content {
    display: flex;
    position: absolute;
    top: 36px;
    left: 0;
    right: 0;
    box-shadow: var(--lo-shadow-popup);
  }
  .collapsed:not(.temp-open) .tab-row {
    margin-block-end: 4px;
  }
</style>
