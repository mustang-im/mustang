<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="empty" />

    <!-- left middle -->
    <hbox class="history">
      <Button
        icon={HistoryIcon}
        iconSize="24px"
        iconOnly
        label={$t`Call history`}
        onClick={goToCallHistory}
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
        label={$t`Start a meeting`}
        onClick={onCreateMeeting}
        disabled={!selectedAccount}
        plain
        />
    </hbox>

    <!-- right -->
    <hbox class="empty" />
  </AppBarM>
</hbox>

<script lang="ts">
  import { MeetAccount } from "../../../logic/Meet/MeetAccount";
  import { startAdHocMeeting } from "./start";
  import { meetMustangApp } from "../MeetMustangApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import HistoryIcon from "lucide-svelte/icons/history";
  import PlusIcon from "lucide-svelte/icons/plus";
  import { goTo, openApp } from "../../AppsBar/selectedApp";
  import { t } from "../../../l10n/l10n";

  export let selectedAccount: MeetAccount;

  let isMenuOpen = false;

  function goToCallHistory() {
    goTo("/meet/history", {});
  }

  async function onCreateMeeting() {
    let meeting = await startAdHocMeeting();
    openApp(meetMustangApp, { meeting });
  }
</script>
