<ButtonMenu>
  <MenuItem
    onClick={save}
    label={$t`Save`}
    tooltip={$t`Save`}
    icon={SaveIcon} />
  <MenuItem
    onClick={deleteIt}
    label={$t`Delete this contact`}
    tooltip={$t`Delete`}
    icon={DeleteIcon} />
</ButtonMenu>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { selectedPerson } from "./Person/Selected";
  import { appGlobal } from "../../logic/app";
  import ButtonMenu from "../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import SaveIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../l10n/l10n";

  export let person: Person;

  async function save() {
    if (!person.addressbook) {
      person.addressbook = appGlobal.personalAddressbook;
      person.addressbook.persons.add(person);
    }
    await person.saveToServer();
    await person.save();
  }
  async function deleteIt() {
    if (person == $selectedPerson) {
      let addressbook = person.addressbook;
      let posInAddressbook = addressbook.persons.indexOf(person);
      let next = addressbook.persons.getIndex(posInAddressbook)
        ?? addressbook.persons.first;
      $selectedPerson = next;
    }

    await person.deleteIt();
  }
</script>
