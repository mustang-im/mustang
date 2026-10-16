<vbox class="categories" role="tablist" aria-orientation="vertical">
  {#each groups as group, groupIndex}
    {#if groupIndex > 0}
      <hbox class="separator" />
    {/if}
    {#each group as entry (entry.id)}
      <button class="category" class:selected={entry.id == selected}
        role="tab" aria-selected={entry.id == selected}
        on:click={() => selected = entry.id}>
        {entry.label}
      </button>
    {/each}
  {/each}
</vbox>

<script lang="ts">
  type T = $$Generic<string>;

  export let groups: { id: T, label: string }[][];
  export let selected: T;
</script>

<style>
  .categories {
    flex-shrink: 0;
    width: 180px;
    padding: 4px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-alt-bg);
    overflow-y: auto;
  }
  .category {
    position: relative;
    flex-shrink: 0;
    height: 32px;
    padding: 0 12px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .category:hover {
    background-color: var(--lo-hover-bg);
  }
  .category.selected {
    background-color: var(--lo-selected-bg);
    font-weight: 600;
  }
  .category.selected::before {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
  .separator {
    margin: 6px 8px;
    border-block-start: 1px solid var(--lo-divider);
  }
</style>
