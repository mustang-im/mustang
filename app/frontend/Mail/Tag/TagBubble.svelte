<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="tag"
  style="--color: {$tag.color}"
  on:click
  class:selected={selected == true}
  class:unselected={selected == false}
  >
  {$tag.name}

  {#if canDelete}
    <RoundButton
      label={$t`Remove`}
      onClick={onRemove}
      icon={DeleteIcon}
      classes="small remove"
      iconSize="12px"
      padding="0px"
      border={false}
      />
  {/if}
</hbox>

<script lang="ts">
  import type { Tag } from "../../../logic/Mail/Tag";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher<{ remove: Tag }>();

  export let tag: Tag;
  export let selected: boolean | undefined = undefined;
  export let canDelete = false;

  function onRemove() {
    dispatch("remove", tag);
  }
</script>

<style>
  .tag {
    min-height: 16px;
    font-size: 12px;
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
    color: black;
  }
  .tag.selected {
    border: 1px solid var(--button-border);
  }
  .tag :global(.button.remove) {
    margin-inline-start: -8px;
    margin-inline-end: -6px;
  }
</style>
