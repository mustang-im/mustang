<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

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
  import { saveTagsList, type Tag } from "../../../logic/Mail/Tag";
  import type { EMail } from "../../../logic/Mail/EMail";
  import TagBubble from "./TagBubble.svelte";
  import TagAdd from "./TagAdd.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import { catchErrors } from "../../Util/error";
  import type { SetColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher<{ select: Tag, unselect: Tag }>();

  export let tags: SetColl<Tag>;
  export let selectedTags: SetColl<Tag> = undefined;
  export let message: EMail | undefined = undefined;
  export let canAdd = true;

  async function onSelectToggle(tag: Tag) {
    if (!selectedTags) {
      return;
    }
    if (selectedTags.contains(tag)) {
      if (message) {
        await message.removeTag(tag);
      } else {
        selectedTags.remove(tag);
      }
      dispatch("unselect", tag);
    } else {
      if (message) {
        await message.addTag(tag);
      } else {
        selectedTags.add(tag);
      }
      dispatch("select", tag);
    }
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
    onSelectToggle(tag);
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
