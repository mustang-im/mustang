<SelectNamesDialog title={$t`Rule Address`} fields={[field]} onOK={onPicked} onCancel={onClose} />

<script lang="ts">
  import type { Person } from "../../../../logic/Abstract/Person";
  import { PersonUID } from "../../../../logic/Abstract/PersonUID";
  import { SelectNamesField } from "../../Composer/SelectNames";
  import SelectNamesDialog from "../../Composer/SelectNamesDialog.svelte";
  import { gt, t } from "../../../../l10n/l10n";

  export let person: Person | null;
  export let onOK: (person: Person | null) => void;
  export let onClose: () => void;

  const field = new SelectNamesField(gt`From`, person?.emailAddresses.hasItems ? [PersonUID.fromPerson(person)] : [], true);

  function onPicked() {
    let pick = field.picks.first;
    onOK(pick?.findPerson() ?? null);
    onClose();
  }
</script>
