<ButtonMenu>
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
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { getNext } from "../../../logic/util/collections";
  import { URLPart } from "../../Util/util";
  import { t } from "../../../l10n/l10n";

  export let person: Person;

  async function deleteIt() {
    let toDelete = person;
    if (person == $selectedPerson) {
      let next = getNext(person.addressbook?.persons, person);
      $selectedPerson = next === toDelete ? null : next;
      if (appGlobal.isMobile) {
        if ($selectedPerson) {
          goTo(URLPart`/contacts/person/${$selectedPerson.id}/edit`, { person: $selectedPerson });
        } else {
          goTo(URLPart`/contacts`, {});
        }
      }
    }

    await toDelete.deleteIt();
  }
</script>
