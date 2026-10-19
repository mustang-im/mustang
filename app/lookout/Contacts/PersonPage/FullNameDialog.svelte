<Dialog title={$t`Check Full Name`} okLabel={$t`OK`} onOK={onOK} width="420px" on:close>
  <GroupBox label={$t`Name details`}>
    <FormGrid>
      <span>{$t`First`}</span>
      <TextField bind:value={firstName} label={$t`First`} />
      <span>{$t`Last`}</span>
      <TextField bind:value={lastName} label={$t`Last`} />
    </FormGrid>
  </GroupBox>
</Dialog>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import TextField from "../../Shared/Form/TextField.svelte";
  import { t } from "../../../l10n/l10n";

  export let person: Person;

  let firstName = person.firstName ?? "";
  let lastName = person.lastName ?? "";

  function onOK() {
    let oldComposed = [person.firstName, person.lastName].filter(Boolean).join(" ");
    person.firstName = firstName.trim() || null;
    person.lastName = lastName.trim() || null;
    if (!person.name || person.name == oldComposed) {
      person.name = [person.firstName, person.lastName].filter(Boolean).join(" ");
    }
  }
</script>
