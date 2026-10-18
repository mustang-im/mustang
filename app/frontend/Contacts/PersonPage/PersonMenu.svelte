<ButtonMenu>
  <MenuItem
    onClick={copyContact}
    label={$t`Copy contact`}
    tooltip={$t`Copy the contact information to the clipboard`}
    icon={CopyIcon} />
  <MenuItem
    onClick={deleteIt}
    label={$t`Delete this contact`}
    tooltip={$t`Delete`}
    icon={DeleteIcon} />
</ButtonMenu>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { getContactsSelection } from "../Person/Selected";
  import { getNavigation } from "../../AppsBar/selectedApp";
  import { appGlobal } from "../../../logic/app";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import CopyIcon from "lucide-svelte/icons/copy";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { getNext } from "../../../logic/util/collections";
  import { URLPart } from "../../../logic/util/blob";
  import { t } from "../../../l10n/l10n";
  import { AppWindow } from "../../MainWindow/AppWindow";

  const { newPerson, selectedPerson } = getContactsSelection();
  const { goTo } = getNavigation();
  const appWindow = AppWindow.current();

  export let person: Person;

  async function copyContact() {
    await appWindow.window.navigator.clipboard.writeText(person.toPlaintext());
  }

  async function deleteIt() {
    let toDelete = person;
    if (toDelete == $selectedPerson) {
      $selectedPerson = getNext(toDelete.addressbook?.persons, toDelete);
      if (appGlobal.isMobile) {
        if ($selectedPerson) {
          goTo(URLPart`/contacts/person/${$selectedPerson.id}/edit`, { person: $selectedPerson });
        } else {
          goTo(URLPart`/contacts`, {});
        }
      }
    }

    if (toDelete == $newPerson) {
      $newPerson = null;
    } else {
      await toDelete.deleteIt();
    }
  }
</script>
