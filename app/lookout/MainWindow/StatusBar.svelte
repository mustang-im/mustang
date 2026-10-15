<hbox class="status-bar" role="status">
  <hbox class="side left">
    {#each $section?.left ?? [] as item}
      <StatusBarEntry {item} />
    {/each}
  </hbox>
  <hbox flex class="spacer" />
  <hbox class="side right">
    {#each $section?.right ?? [] as item}
      <StatusBarEntry {item} />
    {/each}
  </hbox>
</hbox>

<script lang="ts">
  import { statusBar } from "./StatusBar";
  import StatusBarEntry from "./StatusBarEntry.svelte";

  const sections = statusBar.sections;
  $: section = $sections.last;
</script>

<style>
  .status-bar {
    flex: 0 0 auto;
    align-items: center;
    height: var(--lo-statusbar-height);
    padding: 0 12px;
    background-color: var(--lo-statusbar-bg);
    color: var(--lo-fg-secondary);
    font-size: var(--lo-font-size-small);
    border-block-start: 1px solid var(--lo-divider);
    white-space: nowrap;
    overflow: hidden;
  }
  .side {
    align-items: center;
    gap: 16px;
    min-width: 0;
  }
</style>
