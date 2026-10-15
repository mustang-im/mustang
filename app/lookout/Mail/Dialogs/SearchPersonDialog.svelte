<Dialog title={$t`Choose Person`}
  okLabel={$t`OK`}
  okDisabled={!selected && $t`Select a person first`}
  onOK={onChoose}
  on:close>
  <vbox class="dialog-content">
    <span class="caption">{$t`Show only messages from or to:`}</span>
    <PersonPicker label={$t`Persons`} bind:selected on:choose={onChooseAndClose} />
  </vbox>
</Dialog>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { MailSearch } from "../Search/MailSearch";
  import PersonPicker from "./PersonPicker.svelte";
  import Dialog from "./Dialog.svelte";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  const dispatch = createEventDispatcher<{ close: void }>();
  let selected: Person | null = MailSearch.current().person;

  function onChoose() {
    MailSearch.update({ person: selected });
  }

  function onChooseAndClose() {
    onChoose();
    dispatch("close");
  }
</script>

<style>
  .dialog-content {
    gap: 8px;
  }
</style>
