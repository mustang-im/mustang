<Dialog title={$t`Choose Person`} bind:this={dialog}
  okLabel={$t`OK`}
  okDisabled={!selected && $t`Select a person first`}
  onOK={onChoose}
  on:close>
  <vbox class="dialog-content">
    <span class="caption">{$t`Show only messages from or to:`}</span>
    <PersonPicker label={$t`Persons`} bind:selected on:choose={() => dialog.submit()} />
  </vbox>
</Dialog>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { MailSearch } from "../Search/MailSearch";
  import PersonPicker from "./PersonPicker.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  let dialog: Dialog;
  let selected: Person | null = MailSearch.current().person;

  function onChoose() {
    MailSearch.update({ person: selected });
  }
</script>

<style>
  .dialog-content {
    gap: 8px;
  }
</style>
