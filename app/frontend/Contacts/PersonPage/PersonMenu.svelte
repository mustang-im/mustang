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
    if (person == $selectedPerson) {
      $selectedPerson = getNext(person.addressbook?.persons, person);
      if (appGlobal.isMobile) {
        goTo(URLPart`/contacts/person/${person.id}/edit`, { person });
      }
    }

    await person.deleteIt();
  }
</script>
