<Dialog title={$t`Search Folder Criteria`} okLabel={$t`OK`} onOK={onSubmit} on:close={onClose} width="560px" bind:this={dialog}>
  <SearchCriteria bind:draft={criteria.draft} showScope={false} showDates={false} showButtons={false} onSearch={() => dialog.submit()} />
  <svelte:fragment slot="buttons-start">
    <DialogButton label={$t`Clear All`} onClick={onClear} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import { SearchFolderCriteria } from "./SearchFolderCriteria";
  import SearchCriteria from "./SearchCriteria.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let search: SearchEMail;
  export let onOK: () => void;
  const dispatch = createEventDispatcher<{ close: void }>();

  let dialog: Dialog;
  let criteria = new SearchFolderCriteria(search);

  function onClear() {
    criteria.draft.clear();
    criteria = criteria;
  }

  function onSubmit() {
    criteria.writeTo(search);
    onOK();
  }

  function onClose() {
    dispatch("close");
  }
</script>
