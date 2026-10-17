<Dialog title={$t`Open Other User's Folder`} okLabel={$t`OK`} onOK={onOK} width="460px" bind:this={dialog}
  okDisabled={!$recipients.hasItems && $t`Enter the name of your colleague first`}
  on:close>
  <FormGrid columns="max-content minmax(0, 1fr)">
    <DialogButton label={$t`Name…`} onClick={() => { isPicking = true; }} />
    <hbox class="name-field">
      <MailAutocomplete addresses={recipients} label={$t`Name`} />
    </hbox>
    <span class="lo-form-label">{$t`Folder type:`}</span>
    <ComboBox label={$t`Folder type:`} options={typeOptions} bind:value={type} width="100%" />
  </FormGrid>
  {#if $availableAccounts.hasItems}
    <vbox class="available">
      <span>{$t`Shared with you:`}</span>
      <ListView items={$availableAccounts.contents} onSelect={person => recipients.replaceAll([person])}
        onOpen={person => { recipients.replaceAll([person]); dialog.submit(); }}
        label={$t`Shared with you:`} height="120px" let:item>
        <span title={item.emailAddress}>{item.nameOrEMail}</span>
      </ListView>
    </vbox>
  {/if}
</Dialog>
{#if isPicking}
  <SelectNamesDialog title={$t`Select Name`} persons={picked} label={$t`Name`} single
    on:ok={onPicked} on:close={() => { isPicking = false; }} />
{/if}

<script lang="ts" context="module">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { writable } from "svelte/store";

  export const openSharedFolder = writable<MailAccount | null>(null);
</script>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { SharedFolders, SharedFolderType } from "./SharedFolders";
  import SelectNamesDialog from "../Composer/SelectNamesDialog.svelte";
  import MailAutocomplete from "../Composer/MailAutocomplete.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import ListView from "../../Shared/Form/ListView.svelte";
  import type { ComboOption } from "../../Shared/Form/ComboOption";
  import { catchErrors } from "../../../frontend/Util/error";
  import { assert } from "../../../logic/util/util";
  import { ArrayColl } from "svelte-collections";
  import { onMount } from "svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let account: MailAccount;

  const typeOptions: ComboOption<SharedFolderType>[] = [SharedFolderType.Inbox, SharedFolderType.Calendar, SharedFolderType.Contacts]
    .map(folderType => ({ value: folderType, label: SharedFolders.typeLabel(folderType) }));
  let dialog: Dialog;
  let recipients = new ArrayColl<PersonUID>();
  let type = SharedFolderType.Inbox;
  let isPicking = false;
  let picked = new ArrayColl<PersonUID>();
  let availableAccounts = new ArrayColl<PersonUID>();

  onMount(() => catchErrors(async () => {
    availableAccounts = await account.availableSharedAccounts();
  }));

  function onPicked() {
    recipients.replaceAll(picked.contents.slice(0, 1));
    picked = new ArrayColl<PersonUID>();
  }

  async function onOK() {
    let person = recipients.first;
    assert(person, gt`Enter the name of your colleague first`);
    await SharedFolders.open(account, person, type);
  }
</script>

<style>
  .name-field {
    min-height: 32px;
    padding: 0 6px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
  }
  .available {
    gap: 4px;
    margin-top: 12px;
  }
</style>
