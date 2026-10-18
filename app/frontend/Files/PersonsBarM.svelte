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
    <hbox class="empty" />
  </AppBarM>
</hbox>

<script lang="ts">
  import { getContactsSelection } from "../Contacts/Person/Selected";
  import { getNavigation } from "../AppsBar/selectedApp";
  import AppBarM from "../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../Shared/Menu/ButtonMenu.svelte";
  import AppMenuButton from "../AppsBar/AppMenuM/AppMenuButton.svelte";
  import { URLPart } from "../../logic/util/blob";

  const { selectedPerson } = getContactsSelection();
  const { goTo } = getNavigation();

  let isMenuOpen = false;

  function goToUpload() {
    goTo(URLPart`${$selectedPerson.id}/upload`, { person: $selectedPerson });
  }
</script>
