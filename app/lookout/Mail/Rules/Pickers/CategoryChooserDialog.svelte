<Dialog title={$t`Color Categories`} okLabel={$t`OK`} onOK={onSubmit} on:close={onClose} width="400px"
  okDisabled={!chosen.length && $t`Select at least one category`}>
  <vbox class="categories">
    <span>{$t`Select the categories for this rule:`}</span>
    <vbox class="list" role="group" aria-label={$t`Categories`}>
      {#each $tags.each as tag (tag)}
        <label class="row">
          <input type="checkbox" checked={chosen.includes(tag)} on:change={() => toggle(tag)} />
          <CategorySquare color={tag.color} />
          <span class="name">{tag.name}</span>
        </label>
      {/each}
      {#if $tags.isEmpty}
        <hbox class="empty lo-secondary">{$t`There are no categories yet.`}</hbox>
      {/if}
    </vbox>
  </vbox>
</Dialog>

<script lang="ts">
  import { availableTags, type Tag } from "../../../../logic/Abstract/Tag";
  import type { Collection } from "svelte-collections";
  import Dialog from "../../../Shared/Dialog/Dialog.svelte";
  import CategorySquare from "../../Menu/CategorySquare.svelte";
  import { t } from "../../../../l10n/l10n";

  export let selected: Collection<Tag>;
  export let onOK: (tags: Tag[]) => void;
  export let onClose: () => void;

  const tags = availableTags;
  let chosen: Tag[] = selected.contents;

  function toggle(tag: Tag) {
    chosen = chosen.includes(tag)
      ? chosen.filter(category => category != tag)
      : [...chosen, tag];
  }

  function onSubmit() {
    onOK(chosen);
  }
</script>

<style>
  .categories {
    gap: 6px;
  }
  .list {
    height: 220px;
    padding: 2px 0;
    overflow-y: auto;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
  }
  .row {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
    height: 26px;
    padding: 0 8px;
  }
  .row:hover {
    background-color: var(--lo-hover-bg);
  }
  .name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .empty {
    padding: 16px;
    justify-content: center;
  }
</style>
