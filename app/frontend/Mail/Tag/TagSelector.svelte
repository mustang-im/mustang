<vbox>
  <hbox class="tag-list">
    {#each $tags.each as tag}
      <TagBubble {tag}
        selected={$selectedTags ? $selectedTags.contains(tag) : undefined}
        on:click={() => catchErrors(() => onSelectToggle(tag))}
        >
        <slot name="tag-button" slot="tag-button" {tag} />
      </TagBubble>
    {/each}

    {#if canAdd && !isAdding}
      <vbox class="buttons">
        <RoundButton
          label={$t`Add`}
          onClick={onAddNew}
          icon={AddIcon}
          classes="small plain"
          iconSize="12px"
          padding="2px"
          />
      </vbox>
    {/if}
  </hbox>
  {#if isAdding}
    <TagAdd
      on:add={(event) => catchErrors(() => onAdd(event.detail))}
      on:cancel={onAddCancel}
      />
  {/if}
</vbox>

<script lang="ts">
  import { availableTags, saveTagsList, type Tag } from "../../../logic/Mail/Tag";
  import TagBubble from "./TagBubble.svelte";
  import TagAdd from "./TagAdd.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import { catchErrors } from "../../Util/error";
  import type { SetColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher<{ selection: void }>();

  export let tags: SetColl<Tag>;
  export let selectedTags: SetColl<Tag> = undefined;
  export let canAdd = true;

  function onSelectToggle(tag: Tag) {
    if (!selectedTags) {
      return;
    }
    if (selectedTags.contains(tag)) {
      selectedTags.remove(tag);
    } else {
      selectedTags.add(tag);
    }
    dispatch("selection");
  }

  let isAdding = false;
  function onAddNew() {
    isAdding = true;
  }
  function onAddCancel() {
    isAdding = false;
  }
  async function onAdd(tag: Tag) {
    tags.add(tag);
    await saveTagsList();
    isAdding = false;
  }
</script>

<style>
  .tag-list {
    flex-wrap: wrap;
  }
  .buttons {
    margin-inline-start: 6px;
    justify-content: center;
  }
</style>
