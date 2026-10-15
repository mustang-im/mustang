<vbox class="form-section">
  <h2>{title}</h2>
  <grid class="entries">
    <slot />
  </grid>
  <button class="add" on:click={onAdd}>
    <AddIcon size={14} />
    {addLabel}
  </button>
</vbox>

<script lang="ts">
  import AddIcon from "lucide-svelte/icons/plus";

  export let title: string;
  export let addLabel: string;
  export let onAdd: () => void;
</script>

<style>
  .form-section {
    margin-block-start: 20px;
  }
  h2 {
    margin: 0 0 8px 0;
    padding-block-end: 4px;
    border-block-end: 1px solid var(--lo-divider);
    font-size: var(--lo-font-size);
    font-weight: 600;
  }
  grid.entries {
    display: grid;
    grid-template-columns: 120px 1fr 28px;
    gap: 6px 12px;
  }
  grid.entries:empty {
    display: none;
  }
  .add {
    display: flex;
    flex-direction: row;
    align-items: center;
    align-self: start;
    gap: 6px;
    margin-block-start: 6px;
    margin-inline-start: 128px;
    padding: 4px 8px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    cursor: pointer;
  }
  .add:hover {
    background-color: var(--lo-hover-bg);
  }
</style>
