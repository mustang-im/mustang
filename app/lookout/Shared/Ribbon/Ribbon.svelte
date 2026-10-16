<vbox class="ribbon {layout}"
  class:collapsed={isCollapsed}
  class:temp-open={isCollapsed && isTempOpen}
  on:contextmenu={onContextMenu}
  bind:this={ribbonEl}>
  <hbox class="tab-row">
    <button class="tab file-tab" on:click={onFile} title={$t`File`}>
      {$t`File`}
    </button>
    <hbox class="tabs" role="tablist" tabindex="-1" on:keydown={onTabRowKeyDown}>
      {#each shownTabs as tab}
        <button class="tab" role="tab"
          class:selected={tab == $selectedTab}
          class:contextual={tab.isContextual}
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
    <TellMe {ribbonEl} />
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
      <MenuItem label={$t`Classic ribbon`} checked={layout == "classic"}
        onClick={() => ribbon.setLayout("classic")} />
      <MenuItem label={$t`Simplified ribbon`} checked={layout == "simplified"}
        onClick={() => ribbon.setLayout("simplified")} />
      <MenuLabel label={$t`Show ribbon`} />
      <MenuItem label={$t`Always show ribbon`} checked={!isCollapsed}
        onClick={() => ribbon.setCollapsed(false)} />
      <MenuItem label={$t`Show tabs only`} checked={isCollapsed}
        onClick={() => ribbon.setCollapsed(true)} />
      <MenuDivider />
      <MenuItem label={$t`Show Quick Access Toolbar`} checkable checked={!$qatHidden.value}
        onClick={() => QuickAccessToolbar.setHidden(!$qatHidden.value)} />
      <MenuItem label={$t`Customize the Ribbon…`} onClick={() => { isCustomizing = true; }} />
    </Menu>
    <ContextMenu bind:this={contextMenu}>
      {#if !$qatHidden.value}
        <MenuItem label={$qatPosition.value == "below" ? $t`Show Quick Access Toolbar Above the Ribbon` : $t`Show Quick Access Toolbar Below the Ribbon`}
          onClick={() => QuickAccessToolbar.setPosition($qatPosition.value == "below" ? "above" : "below")} />
      {:else}
        <MenuItem label={$t`Show Quick Access Toolbar`} onClick={() => QuickAccessToolbar.setHidden(false)} />
      {/if}
      <MenuDivider />
      <MenuItem label={$t`Customize the Ribbon…`} onClick={() => { isCustomizing = true; }} />
      <MenuItem label={$t`Collapse the Ribbon`} checkable checked={isCollapsed} shortCutInfo="Ctrl+F1" onClick={onToggleCollapsed} />
    </ContextMenu>
  </hbox>
  <hbox class="ribbon-content" on:click|capture={onClickContent}>
    <slot />
  </hbox>
  <QuickAccessToolbarView placement="below" />
  <KeyTipsLayer {ribbonEl} />
  {#if isCustomizing}
    <CustomizeRibbonDialog {ribbon} onClose={() => isCustomizing = false} />
  {/if}
  <div class="metrics-probe" aria-hidden="true" bind:this={probeEl}>
    <div class="probe-classic">
      <div data-metric="largeWidth" style="width: var(--lo-ribbon-large-width)"></div>
      <div data-metric="smallWidth" style="width: var(--lo-ribbon-small-width)"></div>
      <div data-metric="smallIconWidth" style="width: var(--lo-ribbon-small-icon-width)"></div>
    </div>
    <div class="probe-simplified">
      <div data-metric="simplifiedWidth" style="width: var(--lo-ribbon-simplified-width)"></div>
      <div data-metric="simplifiedIconWidth" style="width: var(--lo-ribbon-simplified-icon-width)"></div>
    </div>
    <div data-metric="gap" style="width: var(--lo-ribbon-gap)"></div>
    <div data-metric="groupChrome" style="width: calc(2 * var(--lo-ribbon-group-padding))"></div>
  </div>
</vbox>
<svelte:window on:click={onClickOutside} on:keydown={onKeyDown} />

<script lang="ts">
  import { RibbonModel, type RibbonTabModel, type RibbonLayout, type RibbonMetrics } from "./Ribbon";
  import { backstageState } from "../../Settings/BackstageState";
  import Menu from "../Menu/Menu.svelte";
  import MenuItem from "../Menu/MenuItem.svelte";
  import MenuLabel from "../Menu/MenuLabel.svelte";
  import MenuDivider from "../Menu/MenuDivider.svelte";
  import QuickAccessToolbarView from "../QuickAccess/QuickAccessToolbar.svelte";
  import KeyTipsLayer from "./KeyTipsLayer.svelte";
  import TellMe from "./TellMe.svelte";
  import CustomizeRibbonDialog from "./CustomizeRibbonDialog.svelte";
  import ContextMenu from "../Menu/ContextMenu.svelte";
  import { RibbonCustomization } from "./RibbonCustomization";
  import { selectedApp } from "../../../frontend/AppsBar/selectedApp";
  import { get } from "svelte/store";
  import { QuickAccessToolbar } from "../QuickAccess/QuickAccess";
  import OptionsIcon from "lucide-svelte/icons/chevron-down";
  import { setContext, onMount, onDestroy, tick } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let id: string = null;

  const ribbon = new RibbonModel();
  ribbon.id = id ?? get(selectedApp)?.id ?? ribbon.id;
  setContext(RibbonModel.contextKey, ribbon);
  const tabs = ribbon.tabs;
  const selectedTab = ribbon.selectedTab;
  const layoutSetting = ribbon.layout;
  const qatHidden = QuickAccessToolbar.isHidden;
  const qatPosition = QuickAccessToolbar.position;
  const customization = RibbonCustomization.setting;
  let isCustomizing = false;
  let contextMenu: ContextMenu;

  $: shownTabs = $tabs.filter(tab => tab.isContextual || !RibbonCustomization.isTabHidden(ribbon.id, tab.label, $customization.value));
  $: if ($selectedTab && shownTabs.length && !shownTabs.includes($selectedTab)) {
    ribbon.selectTab(shownTabs[0]);
  }
  const collapsedSetting = ribbon.collapsed;

  let layout: RibbonLayout;
  $: $layoutSetting, layout = ribbon.currentLayout;
  $: isCollapsed = !!$collapsedSetting.value;

  let ribbonEl: HTMLElement;
  let optionsEl: HTMLElement;
  let probeEl: HTMLElement;

  let probeObserver: ResizeObserver;
  onMount(() => {
    probeObserver = new ResizeObserver(measureMetrics);
    for (let probe of probeEl.querySelectorAll("[data-metric]")) {
      probeObserver.observe(probe);
    }
    measureMetrics();
  });
  onDestroy(() => probeObserver?.disconnect());

  $: $layoutSetting, measureMetricsLater();
  async function measureMetricsLater() {
    await tick();
    measureMetrics();
  }
  function measureMetrics() {
    if (!probeEl) {
      return;
    }
    let metrics = {} as RibbonMetrics;
    for (let probe of probeEl.querySelectorAll<HTMLElement>("[data-metric]")) {
      metrics[probe.dataset.metric] = probe.getBoundingClientRect().width;
    }
    ribbon.setMetrics(metrics);
  }
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

  function onContextMenu(event: MouseEvent) {
    let target = event.target as HTMLElement;
    if (target.closest("input, textarea, .lo-menu")) {
      return;
    }
    event.preventDefault();
    contextMenu.onContextMenu(event);
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
  .ribbon {
    --lo-ribbon-large-width: max(72px, calc(6px + 11ch));
    --lo-ribbon-row-height: 22px;
    --lo-ribbon-large-height: calc(3 * var(--lo-ribbon-row-height));
    --lo-ribbon-small-width: calc(38px + 11ch);
    --lo-ribbon-small-icon-width: 36px;
    --lo-ribbon-row-button-width: 26px;
    --lo-ribbon-button-height: 32px;
    --lo-ribbon-simplified-width: calc(48px + 10ch);
    --lo-ribbon-simplified-icon-width: 40px;
    --lo-ribbon-gap: 2px;
    --lo-ribbon-group-padding: 5px;
  }
  .metrics-probe {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    height: 0;
    overflow: hidden;
  }
  .metrics-probe div {
    height: 1px;
  }
  .probe-classic {
    font-size: var(--lo-font-size-small);
  }
  .probe-simplified {
    font-size: 13px;
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
  .tab.contextual {
    color: var(--lo-accent-text);
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
