<hbox class="dialog-tabs" role="tablist">
  {#each tabs as tab (tab.id)}
    <button class="dialog-tab" class:selected={tab.id == selected}
      role="tab" aria-selected={tab.id == selected}
      on:click={() => selected = tab.id}>
      {tab.label}
    </button>
  {/each}
</hbox>

<script lang="ts">
  export let tabs: { id: string, label: string }[];
  export let selected: string = tabs[0]?.id;
</script>

<style>
  .dialog-tabs {
    flex-shrink: 0;
    gap: 4px;
    border-block-end: 1px solid var(--lo-border);
  }
  .dialog-tab {
    position: relative;
    height: 32px;
    padding: 0 12px;
    border: none;
    border-radius: var(--lo-radius-small) var(--lo-radius-small) 0 0;
    background: none;
    color: var(--lo-fg);
    font: inherit;
    white-space: nowrap;
    cursor: pointer;
  }
  .dialog-tab:hover {
    background-color: var(--lo-hover-bg);
  }
  .dialog-tab.selected {
    font-weight: 600;
  }
  .dialog-tab.selected::after {
    content: "";
    position: absolute;
    inset-inline: 8px;
    bottom: -1px;
    height: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
</style>
