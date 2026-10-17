<SelectNamesDialog fields={[field]} {onOK} onCancel={onClose} />

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { SelectNamesField } from "../Composer/SelectNames";
  import SelectNamesDialog from "../Composer/SelectNamesDialog.svelte";
  import { createEventDispatcher } from "svelte";

  export let fieldLabel: string;
  export let person: Person | null = null;
  export let onPick: (person: Person | null) => void;

  const dispatch = createEventDispatcher<{ close: void }>();
  const field = new SelectNamesField(fieldLabel, person?.emailAddresses.hasItems ? [PersonUID.fromPerson(person)] : [], true);

  function onOK() {
    let pick = field.picks.first;
    onPick(pick ? pick.findPerson() ?? null : null);
    onClose();
  }

  function onClose() {
    dispatch("close");
  }
</script>
