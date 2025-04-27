<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="search">
      <Button
        icon={PersonsIcon}
        iconSize="24px"
        iconOnly
        label={$t`List persons`}
        onClick={goToPersons}
        plain
        />
    </hbox>

    <!-- left middle -->
    <hbox class="search">
      <Button
        icon={SearchIcon}
        iconSize="24px"
        iconOnly
        label={$t`Search a person`}
        onClick={goToSearch}
        plain
        />
    </hbox>

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
    <hbox class="menu button">
      <ButtonMenu bind:isMenuOpen>
        <!--
        <MailMenu {selectedAccount} {selectedFolder} />
        -->
      </ButtonMenu>
    </hbox>
  </AppBarM>
</hbox>

<script lang="ts">
  import { Addressbook } from "../../logic/Contacts/Addressbook";
  import { selectedPerson } from "./Person/Selected";
  import AppBarM from "../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../Shared/Menu/ButtonMenu.svelte";
  import Button from "../Shared/Button.svelte";
  import AppMenuButton from "../AppsBar/AppMenuM/AppMenuButton.svelte";
  import PersonsIcon from "lucide-svelte/icons/users";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus";
  import { goTo } from "../AppsBar/selectedApp";
  import { t } from "../../l10n/l10n";

  export let selectedAddressbook: Addressbook;

  let isMenuOpen = false;

  function goToPersons() {
    goTo("/contacts/");
  }

  function goToSearch() {
    goTo("/contacts/search");
  }

  function newContact() {
    let contact = selectedAddressbook.newPerson();
    $selectedPerson = contact;
    goTo(`/contacts/person/${contact.id}/edit`);
  }
</script>
