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
  import type { Person } from "../../../logic/Abstract/Person";
  import { selectedPerson } from "../Person/Selected";
  import { goTo } from "../../AppsBar/selectedApp";
  import { appGlobal } from "../../../logic/app";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import SaveIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { getNext } from "../../../logic/util/collections";
  import { URLPart } from "../../Util/util";
  import { t } from "../../../l10n/l10n";

  export let person: Person;

  async function save() {
    if (!person.addressbook) {
      person.addressbook = appGlobal.personalAddressbook;
      person.addressbook.persons.add(person);
    }
    await person.save();
  }
  async function deleteIt() {
    if (person == $selectedPerson) {
      $selectedPerson = getNext(person.addressbook?.persons, person);
      if (appGlobal.isMobile) {
        goTo(URLPart`/contacts/person/${person.id}/edit`, { person });
      }
    }

    await person.deleteIt();
  }
</script>
