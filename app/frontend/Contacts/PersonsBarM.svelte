<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="empty" />

    <!-- left middle -->
    <hbox class="empty" />

    <AppMenuButton />

    <!-- right middle -->
    <hbox class="new">
      <Button
        icon={PlusIcon}
        iconSize="24px"
        iconOnly
        label={$t`Create a contact`}
        onClick={newContact}
        disabled={!selectedAddressbook}
        plain
        />
    </hbox>

    <!-- right -->
    <hbox class="empty" />
  </AppBarM>
</hbox>

<script lang="ts">
  import { Addressbook } from "../../logic/Contacts/Addressbook";
  import { getContactsSelection } from "./Person/Selected";
  import { getNavigation } from "../AppsBar/selectedApp";
  import AppBarM from "../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../Shared/Menu/ButtonMenu.svelte";
  import Button from "../Shared/Button.svelte";
  import AppMenuButton from "../AppsBar/AppMenuM/AppMenuButton.svelte";
  import PlusIcon from "lucide-svelte/icons/plus";
  import { URLPart } from "../Util/util";
  import { t } from "../../l10n/l10n";

  const { selectedPerson } = getContactsSelection();
  const { goTo } = getNavigation();

  export let selectedAddressbook: Addressbook;

  let isMenuOpen = false;

  function newContact() {
    let contact = selectedAddressbook.newPerson();
    $selectedPerson = contact;
    goTo(URLPart`/contacts/person/${contact.id}/edit`, { person: contact });
  }
</script>
