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
    <hbox class="history">
      <Button
        icon={HistoryIcon}
        iconSize="24px"
        iconOnly
        label={$t`Contact history`}
        onClick={goToHistory}
        plain
        />
    </hbox>

    <AppMenuButton />

    <!-- right middle -->
    <hbox class="empty" />

    <!-- right -->
    <hbox class="empty" />
  </AppBarM>
</hbox>

<script lang="ts">
  import { Person } from "../../../logic/Abstract/Person";
  import { goTo } from "../../AppsBar/selectedApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import PersonsIcon from "lucide-svelte/icons/users";
  import SearchIcon from "lucide-svelte/icons/search";
  import HistoryIcon from "lucide-svelte/icons/history";
  import { URLPart } from "../../Util/util";
  import { t } from "../../../l10n/l10n";

  export let person: Person;

  let isMenuOpen = false;

  function goToPersons() {
    goTo("/contacts/", {});
  }

  function goToSearch() {
    goTo("/contacts/search", {});
  }

  function goToHistory() {
    goTo(URLPart`/contacts/person/${person.id}/history`, { person });
  }
</script>
