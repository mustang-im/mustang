<Dialog title={title} okLabel={$t`OK`} onOK={onSubmit} on:close={onClose} width="480px"
  okDisabled={!name.trim() && $t`Enter a name`}>
  <FormGrid columns="max-content minmax(0, 1fr)">
    <span class="lo-form-label">{$t`Name:`}</span>
    <TextField label={$t`Name:`} bind:value={name} />
    <span class="lo-form-label">{$t`Criteria:`}</span>
    <hbox class="criteria">
      <span class="summary" title={summary}>{summary}</span>
      <DialogButton label={$t`Criteria…`} onClick={() => { isEditingCriteria = true; }} />
    </hbox>
    <span class="lo-form-label">{$t`Search mail in:`}</span>
    <ComboBox label={$t`Search mail in:`} options={accountOptions} bind:value={account} width="100%" />
  </FormGrid>
</Dialog>
{#if isEditingCriteria}
  <SearchFolderCriteriaDialog {search} onOK={() => { search = search; }} onClose={() => { isEditingCriteria = false; }} />
{/if}

<script lang="ts" context="module">
  import type { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import { writable } from "svelte/store";

  export const openCustomizeSearchFolder = writable<SavedSearchFolder | null>(null);
</script>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import { appGlobal } from "../../../logic/app";
  import { SearchFolderCriteria } from "./SearchFolderCriteria";
  import SearchFolderCriteriaDialog from "./SearchFolderCriteriaDialog.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import TextField from "../../Shared/Form/TextField.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import type { ComboOption } from "../../Shared/Form/ComboOption";
  import { gt, t } from "../../../l10n/l10n";

  export let title: string;
  export let name: string;
  export let search: SearchEMail;
  export let onOK: (name: string, search: SearchEMail) => void | Promise<void>;
  export let onClose: () => void;

  let account: MailAccount | null = search.account && appGlobal.emailAccounts.contains(search.account) ? search.account : null;
  let isEditingCriteria = false;

  const accountOptions: ComboOption<MailAccount | null>[] = [
    { value: null, label: gt`All accounts` },
    ...appGlobal.emailAccounts.contents.map(mailAccount => ({ value: mailAccount, label: mailAccount.name })),
  ];
  $: summary = criteriaSummary(search);

  function criteriaSummary(_search: SearchEMail): string {
    let draft = new SearchFolderCriteria(search).draft;
    let parts: string[] = [];
    if (draft.keywords) {
      parts.push(gt`containing ${draft.keywords}`);
    }
    if (draft.from) {
      parts.push(gt`from ${draft.from.name}`);
    }
    if (draft.to) {
      parts.push(gt`to ${draft.to.name}`);
    }
    if (search.isRead === false) {
      parts.push(gt`unread`);
    }
    if (search.isStarred) {
      parts.push(gt`flagged`);
    }
    if (search.hasAttachment) {
      parts.push(gt`with attachments`);
    }
    if (search.tags.hasItems) {
      parts.push(search.tags.contents.map(tag => tag.name).join(", "));
    }
    return parts.join("; ") || gt`All mail`;
  }

  async function onSubmit() {
    search.account = account;
    await onOK(name.trim(), search);
  }
</script>

<style>
  .criteria {
    align-items: center;
    gap: 8px;
  }
  .summary {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--lo-fg-secondary);
  }
</style>
