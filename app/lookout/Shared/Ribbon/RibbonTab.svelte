{#if $selectedTab == tab || $isSurveying}
  <hbox class="ribbon-tab-content" class:surveyed={$selectedTab != tab}
    role="tabpanel" aria-label={label} inert={$selectedTab != tab}
    bind:this={contentEl}>
    <hbox class="groups">
      <slot />
    </hbox>
    {#if $overflowGroups.length}
      <hbox class="more" bind:this={moreEl}>
        <RibbonButtonBase label={$t`More commands`} icon={MoreIcon}
          fixedLook="simplified-icon" isItem={false}
          classes="menu-trigger more-button"
          pressed={$isMoreMenuOpen}
          onClick={onToggleMoreMenu} />
      </hbox>
    {/if}
  </hbox>
{/if}
<div class="ribbon-more-menu" class:open={$isMoreMenuOpen && $overflowGroups.length}
  style={moreMenuStyle}
  role="menu" aria-label={$t`More commands`}
  bind:this={moreMenuEl}>
  {#each $overflowGroups as group (group)}
    <div class="more-menu-group" use:hostGroupBody={group}></div>
  {/each}
</div>
<svelte:window on:click={onClickOutside} on:keydown={onKeyDown} on:resize={() => tab.closeMoreMenu()} />

<script lang="ts">
  import { RibbonModel, RibbonTabModel, type RibbonGroupModel } from "./RibbonGroup";
  import RibbonButtonBase from "./RibbonButtonBase.svelte";
  import MoreIcon from "lucide-svelte/icons/ellipsis";
  import { getContext, setContext, onDestroy } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let label: string;
  export let contextual = false;

  const ribbon = getContext<RibbonModel>(RibbonModel.contextKey);
  const tab = new RibbonTabModel(label);
  tab.isContextual = contextual;
  setContext(RibbonTabModel.contextKey, tab);
  ribbon.addTab(tab);
  onDestroy(() => ribbon.removeTab(tab));
  $: ribbon.setTabLabel(tab, label);
  const selectedTab = ribbon.selectedTab;
  const isSurveying = ribbon.isSurveying;
  const overflowGroups = tab.overflowGroups;
  const isMoreMenuOpen = tab.isMoreMenuOpen;
  const metrics = ribbon.metrics;
  const layoutSetting = ribbon.layout;

  $: $layoutSetting, tab.setOverflowWidth(ribbon.currentLayout == "simplified" && $metrics
    ? $metrics.simplifiedIconWidth + $metrics.groupChrome
    : 0);

  let contentEl: HTMLElement;
  let moreEl: HTMLElement;
  let moreMenuEl: HTMLElement;
  let moreMenuStyle = "";
  let resizeObserver: ResizeObserver;
  $: observeContent(contentEl);
  function observeContent(el: HTMLElement) {
    resizeObserver?.disconnect();
    if (!el) {
      return;
    }
    resizeObserver = new ResizeObserver(entries => tab.setAvailableWidth(entries[0].contentRect.width));
    resizeObserver.observe(el);
  }
  onDestroy(() => resizeObserver?.disconnect());

  $: if (!$overflowGroups.length || $selectedTab != tab) {
    tab.closeMoreMenu();
  }

  function onToggleMoreMenu() {
    if ($isMoreMenuOpen) {
      tab.closeMoreMenu();
      return;
    }
    let anchor = moreEl.getBoundingClientRect();
    let right = Math.max(4, window.innerWidth - anchor.right);
    moreMenuStyle = `right: ${right}px; top: ${anchor.bottom + 4}px;`;
    $isMoreMenuOpen = true;
  }

  function hostGroupBody(node: HTMLElement, group: RibbonGroupModel) {
    if (group.bodyEl) {
      node.appendChild(group.bodyEl);
    }
  }

  function onClickOutside(event: MouseEvent) {
    let target = event.target as Node;
    if (!$isMoreMenuOpen || moreMenuEl?.contains(target) || moreEl?.contains(target)) {
      return;
    }
    if (target instanceof Element && target.closest(".popup")) {
      return;
    }
    tab.closeMoreMenu();
  }

  function onKeyDown(event: KeyboardEvent) {
    if ($isMoreMenuOpen && event.key == "Escape") {
      tab.closeMoreMenu();
    }
  }
</script>

<style>
  .ribbon-tab-content {
    flex: 1 1 0;
    min-width: 0;
    align-items: stretch;
    overflow: hidden;
  }
  .ribbon-tab-content.surveyed {
    display: none;
  }
  .groups {
    flex: 1 1 auto;
    min-width: 0;
    align-items: stretch;
  }
  .more {
    flex: 0 0 auto;
    align-items: center;
    padding: 0 var(--lo-ribbon-group-padding);
  }
  .ribbon-more-menu {
    position: fixed;
    z-index: 30;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    padding: 4px;
    box-sizing: border-box;
    visibility: hidden;
    background-color: var(--lo-ribbon-bg);
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius);
    box-shadow: var(--lo-shadow-popup);
  }
  .ribbon-more-menu.open {
    visibility: visible;
  }
  .more-menu-group:not(:first-child) {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid var(--lo-divider);
  }
</style>
