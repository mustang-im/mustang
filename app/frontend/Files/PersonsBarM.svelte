<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="empty" />

    <!-- left middle -->
    <hbox class="empty" />

    <AppMenuButton />

    <!-- right middle -->
    <hbox class="empty" />

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
  import { selectedPerson } from "../Contacts/Person/Selected";
  import AppBarM from "../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../Shared/Menu/ButtonMenu.svelte";
  import AppMenuButton from "../AppsBar/AppMenuM/AppMenuButton.svelte";
  import { goTo } from "../AppsBar/selectedApp";

  let isMenuOpen = false;

  function goToUpload() {
    goTo(`${$selectedPerson.id}/upload`, { person: $selectedPerson });
  }
</script>
