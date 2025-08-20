<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="start">
      <Button
        icon={HomeIcon}
        iconSize="24px"
        iconOnly
        label={$t`Start page`}
        onClick={goToStart}
        plain
        />
    </hbox>

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
  import { meetMustangApp } from "../MeetMustangApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import HomeIcon from "lucide-svelte/icons/home";
  import { openApp } from "../../AppsBar/selectedApp";
  import { t } from "../../../l10n/l10n";

  let isMenuOpen = false;

  function goToStart() {
    openApp(meetMustangApp, {});
  }
</script>
