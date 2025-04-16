<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    {#if doingSearch}
      <hbox class="list">
        <Button
          icon={ListIcon}
          iconSize="24px"
          iconOnly
          label={$t`List persons`}
          onClick={goToList}
          plain
          />
      </hbox>
    {:else}
      <hbox class="empty" />
    {/if}

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
    <hbox class="write">
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
  import ListIcon from "lucide-svelte/icons/list";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus";
  import { goTo } from "../AppsBar/selectedApp";
  import { t } from "../../l10n/l10n";

  export let selectedAddressbook: Addressbook;
  export let doingSearch = false;

  let isMenuOpen = false;

  function goToList() {
    doingSearch = false;
  }

  function goToSearch() {
    doingSearch = true;
  }

  function newContact() {
    let contact = selectedAddressbook.newPerson();
    $selectedPerson = contact;
    goTo(`/contacts/person/${contact.id}/edit`);
  }
</script>
