{#if $selectedTab == tab}
  <hbox class="ribbon-tab-content" role="tabpanel" aria-label={label} bind:this={contentEl}>
    <slot />
  </hbox>
{/if}

<script lang="ts">
  import { RibbonModel, RibbonTabModel } from "./Ribbon";
  import { getContext, setContext, onDestroy } from "svelte";

  export let label: string;

  const ribbon = getContext<RibbonModel>(RibbonModel.contextKey);
  const tab = new RibbonTabModel(label);
  setContext(RibbonTabModel.contextKey, tab);
  ribbon.addTab(tab);
  onDestroy(() => ribbon.removeTab(tab));
  $: ribbon.setTabLabel(tab, label);
  const selectedTab = ribbon.selectedTab;

  let contentEl: HTMLElement;
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
</script>

<style>
  .ribbon-tab-content {
    flex: 1 1 0;
    min-width: 0;
    align-items: stretch;
    overflow: hidden;
  }
</style>
