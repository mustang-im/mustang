<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="todo">
      <Button
        icon={TodoIcon}
        iconSize="24px"
        iconOnly
        label={$t`TODO`}
        onClick={goToTODO}
        plain
        />
    </hbox>

    <!-- left middle -->
    <hbox class="search">
      <Button
        icon={SearchIcon}
        iconSize="24px"
        iconOnly
        label={$t`Search appointments`}
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
        label={$t`Make an appointment`}
        onClick={newEvent}
        disabled={!$selectedCalendar}
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
  import { selectedCalendar } from "../selected";
  import { calendarMustangApp } from "../CalendarMustangApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import TodoIcon from "lucide-svelte/icons/list-checks";
  import PlusIcon from "lucide-svelte/icons/plus";
  import { goTo } from "../../AppsBar/selectedApp";
  import { t } from "../../../l10n/l10n";

  let isMenuOpen = false;

  function goToSearch() {
    goTo("/calendar/search", {});
  }

  function goToTODO() {
    goTo("/calendar/todo", {});
  }

  function newEvent() {
    let event = $selectedCalendar.newEvent();
    calendarMustangApp.showEvent(event);
  }
</script>
