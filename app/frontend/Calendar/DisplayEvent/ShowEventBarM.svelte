<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="calendar">
      <Button
        label={$t`Calendar`}
        onClick={goToCalendar}
        iconSize="24px" iconOnly plain>
        <CalendarIcon slot="icon" />
      </Button>
    </hbox>

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
  import { goTo } from "../../AppsBar/selectedApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import CalendarIcon from "../CalendarIcon.svelte";
  import { t } from "../../../l10n/l10n";

  function goToCalendar() {
    goTo(`/calendar`, {});
  }
</script>
