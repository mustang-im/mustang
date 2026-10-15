<Dialog title={$t`New Search Folder`}
  okLabel={$t`OK`}
  okDisabled={disabledReason}
  onOK={onCreate}
  width="520px"
  on:close>
  <vbox class="dialog-content">
    <span class="caption">{$t`Select a Search Folder:`}</span>
    <vbox class="templates" role="radiogroup">
      {#each templates as template}
        {#if template.section}
          <hbox class="section">{template.section}</hbox>
        {/if}
        <label class="template" class:selected={selected == template}>
          <input type="radio" name="template" value={template} bind:group={selected} />
          {template.label}
        </label>
      {/each}
    </vbox>
    {#if selected?.id == "person"}
      <PersonPicker label={$t`Show mail from and to`} bind:selected={person} height="160px" />
    {:else if selected?.id == "categorized"}
      <label class="field">
        {$t`Category:`}
        <select bind:value={tag}>
          {#each $tags.each as availableTag}
            <option value={availableTag}>{availableTag.name}</option>
          {/each}
        </select>
      </label>
    {:else if selected?.id == "large"}
      <label class="field">
        {$t`Show mail greater than:`}
        <input type="number" min="1" bind:value={sizeKB} />
        {$t`KB`}
      </label>
    {/if}
    <label class="field">
      {$t`Search mail in:`}
      <select bind:value={account}>
        <option value={null}>{$t`All accounts`}</option>
        {#each $accounts.each as mailAccount}
          <option value={mailAccount}>{mailAccount.name}</option>
        {/each}
      </select>
    </label>
    <label class="field">
      {$t`Name:`}
      <input type="text" class="name" bind:value={name} />
    </label>
  </vbox>
</Dialog>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { availableTags, type Tag } from "../../../logic/Abstract/Tag";
  import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import { newSearchEMail } from "../../../logic/Mail/Store/setStorage";
  import { allAccountsAccount } from "../../../logic/Mail/AccountsList/ShowAccounts";
  import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import type { Person } from "../../../logic/Abstract/Person";
  import { appGlobal } from "../../../logic/app";
  import { selectedAccount, selectedFolder } from "../../../frontend/Mail/Selected";
  import PersonPicker from "./PersonPicker.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let defaultAccount: MailAccount | null = null;

  interface SearchTemplate {
    id: string;
    label: string;
    section?: string;
    apply: (search: SearchEMail) => void;
  }

  const templates: SearchTemplate[] = [
    { id: "unread", label: gt`Unread mail`, section: gt`Reading Mail`, apply: search => search.isRead = false },
    { id: "flagged", label: gt`Mail flagged for follow up`, apply: search => search.isStarred = true },
    { id: "person", label: gt`Mail from and to specific people`, section: gt`Mail from People and Lists`, apply: search => search.includesPerson = person },
    { id: "categorized", label: gt`Categorized mail`, section: gt`Organizing Mail`, apply: search => search.tags.add(tag) },
    { id: "large", label: gt`Large mail`, apply: search => search.sizeMin = sizeKB * 1024 },
    { id: "attachments", label: gt`Mail with attachments`, apply: search => search.hasAttachment = true },
  ];

  const tags = availableTags;
  const accounts = appGlobal.emailAccounts;
  let selected = templates[0];
  let person: Person | null = null;
  let tag: Tag = availableTags.first;
  let sizeKB = 100;
  let account: MailAccount | null = defaultAccount && appGlobal.emailAccounts.contains(defaultAccount) ? defaultAccount : null;
  let name = templates[0].label;
  $: defaultName = selected.id == "person" && person ? $t`Mail from and to ${person.name}` : selected.label;
  let lastDefaultName = name;
  $: if (defaultName != lastDefaultName) {
    if (name == lastDefaultName || !name) {
      name = defaultName;
    }
    lastDefaultName = defaultName;
  }

  $: disabledReason = !name?.trim()
    ? $t`Enter a name`
    : selected?.id == "person" && !person
      ? $t`Select a person`
      : selected?.id == "categorized" && !tag
        ? $t`Create a category first`
        : selected?.id == "large" && !(sizeKB > 0)
          ? $t`Enter a size`
          : false;

  async function onCreate() {
    let search = newSearchEMail();
    search.account = account;
    selected.apply(search);
    let folder = new SavedSearchFolder(search);
    folder.name = name.trim();
    await folder.save();
    $selectedAccount = allAccountsAccount;
    $selectedFolder = folder;
  }
</script>

<style>
  .dialog-content {
    gap: 10px;
  }
  .templates {
    max-height: 260px;
    padding: 4px;
    overflow-y: auto;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
  }
  .section {
    padding: 8px 8px 2px 8px;
    color: var(--lo-fg-secondary);
    font-size: 12px;
    font-weight: 600;
  }
  .template {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px 4px 16px;
    border-radius: var(--lo-radius-small);
    cursor: pointer;
  }
  .template:hover {
    background-color: var(--lo-hover-bg);
  }
  .template.selected {
    background-color: var(--lo-selected-bg);
  }
  .field {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .field select,
  .field input {
    height: 30px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
  }
  .field input[type="number"] {
    width: 80px;
  }
  .field .name {
    flex: 1;
  }
</style>
