<hbox class="tag font-smallest"
  style="--color: {$tag.color}"
  on:click
  class:selected={selected == true}
  class:unselected={selected == false}
  >
  {$tag.name}

  <hbox class="buttons-right">
    <slot name="tag-button" {tag} />
  </hbox>
</hbox>

<script lang="ts">
  import type { Tag } from "../../../logic/Abstract/Tag";

  export let tag: Tag;
  export let selected: boolean | undefined = undefined;
</script>

<style>
  .tag {
    min-height: 16px;
    border-radius: 8px;
    background-color: var(--color);
    color: white;
    border: 1px solid transparent;
    padding-inline-start: 8px;
    padding-inline-end: 8px;
    margin: 2px 2px;
  }
  .tag:not(:hover) :global(.button) {
    visibility: hidden;
  }
  .tag.unselected {
    background-color: color-mix(in srgb, var(--color) 30%, transparent);
    color: var(--button-fg);
  }
  .tag.selected {
    border: 1px solid var(--button-border);
  }
  .buttons-right :global(button) {
    align-self: center;
    margin-inline-start: -8px;
    margin-inline-end: -6px;
  }
</style>
