<Dialog title={$t`Create Rule`}
  okLabel={$t`OK`}
  okDisabled={(!name.trim() && $t`Enter a name`) ||
    (!hasAction && $t`Choose what to do with the messages`) ||
    (moveToFolder && !folder && $t`Select a folder`)}
  onOK={onSave}
  width="460px"
  on:close>
  <vbox class="dialog-content">
    <span class="caption">
      {$t`When a message arrives in ${account.name} that matches this search`}
    </span>
    <label for="rule-name">{$t`Name of the rule:`}</label>
    <input id="rule-name" class="lo-text-field" type="text" bind:value={name} />
    <span class="caption">{$t`Do the following:`}</span>
    <label class="checkbox" class:disabled={isJunk || deleteIt}>
      <input type="checkbox" bind:checked={moveToFolder} disabled={isJunk || deleteIt} />
      {$t`Move the item to folder:`}
      <span class="folder-name">{moveToFolder ? folder?.name ?? "" : ""}</span>
    </label>
    {#if moveToFolder && !isJunk && !deleteIt}
      <vbox class="indented">
        <FolderPicker label={$t`Folders`} bind:selectedFolder={folder}
          disableFolder={target => target.account != account && $t`The rule runs in ${account.name}`} />
      </vbox>
    {/if}
    <label class="checkbox">
      <input type="checkbox" bind:checked={markAsRead} />
      {$t`Mark it as read`}
    </label>
    <label class="checkbox">
      <input type="checkbox" bind:checked={flag} />
      {$t`Flag it`}
    </label>
    {#if $tags.hasItems}
      <label class="checkbox">
        <input type="checkbox" bind:checked={assignCategories} />
        {$t`Assign it to the categories:`}
      </label>
      {#if assignCategories}
        <hbox class="categories indented">
          {#each $tags.each as tag (tag)}
            <button type="button" class="category" class:selected={categories.includes(tag)}
              aria-pressed={categories.includes(tag)}
              on:click={() => toggleCategory(tag)}>
              <CategorySquare color={tag.color} state={categories.includes(tag) ? TagState.All : TagState.None} />
              {tag.name}
            </button>
          {/each}
        </hbox>
      {/if}
    {/if}
    <label class="checkbox" class:disabled={deleteIt}>
      <input type="checkbox" bind:checked={isJunk} disabled={deleteIt} />
      {$t`Mark it as junk`}
    </label>
    <label class="checkbox" class:disabled={isJunk}>
      <input type="checkbox" bind:checked={deleteIt} disabled={isJunk} />
      {$t`Delete it`}
    </label>
  </vbox>
</Dialog>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { availableTags, type Tag } from "../../../logic/Abstract/Tag";
  import { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import { TagState } from "../SelectionState";
  import CategorySquare from "../Menu/CategorySquare.svelte";
  import FolderPicker from "./FolderPicker.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let search: SearchEMail;
  export let account: MailAccount;

  const tags = availableTags;
  let name = search.bodyText ?? "";
  let moveToFolder = false;
  let folder: Folder | null = null;
  let markAsRead = false;
  let flag = false;
  let assignCategories = false;
  let categories: Tag[] = [];
  let isJunk = false;
  let deleteIt = false;

  $: hasAction = (moveToFolder && !isJunk && !deleteIt) || markAsRead || flag ||
    (assignCategories && categories.length > 0) || isJunk || deleteIt;

  function toggleCategory(tag: Tag) {
    categories = categories.includes(tag)
      ? categories.filter(category => category != tag)
      : [...categories, tag];
  }

  async function onSave() {
    let criteria = new SearchEMail();
    criteria.copyFrom(search);
    let rule = new FilterRuleAction(account, criteria);
    rule.name = name.trim();
    if (moveToFolder && !isJunk && !deleteIt) {
      rule.toFolder = folder;
    }
    if (markAsRead) {
      rule.markAsRead = true;
    }
    if (flag) {
      rule.markAsStarred = true;
    }
    if (assignCategories) {
      rule.addTags.addAll(categories);
    }
    if (isJunk) {
      rule.markAsSpam = true;
    }
    if (deleteIt) {
      rule.deleteTrash = true;
    }
    // <copied from="../../../frontend/Mail/Search/RulesFromSearchUI.svelte">
    rule.account.filterRuleActions.add(rule);
    await rule.account.save();
    // </copied>
  }
</script>

<style>
  .dialog-content {
    gap: 6px;
  }
  .caption:not(:first-child) {
    margin-block-start: 10px;
  }
  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 26px;
  }
  .checkbox.disabled {
    color: var(--lo-fg-disabled);
  }
  .folder-name {
    font-weight: 600;
  }
  .indented {
    margin-inline-start: 26px;
  }
  .categories {
    flex-wrap: wrap;
    gap: 4px;
  }
  .category {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
    cursor: pointer;
  }
  .category:hover {
    background-color: var(--lo-hover-bg);
  }
  .category.selected {
    border-color: var(--lo-accent);
  }
</style>
