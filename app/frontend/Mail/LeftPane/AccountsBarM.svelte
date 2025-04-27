<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="empty" />

    <!-- left middle -->
    <hbox class="search">
      <Button
        icon={SearchIcon}
        iconSize="24px"
        iconOnly
        label={$t`Search messages`}
        onClick={goToSearch}
        plain
        />
    </hbox>

    <AppMenuButton />

    <!-- right middle -->
    <hbox class="write">
      <Button
        icon={WriteIcon}
        iconSize="24px"
        iconOnly
        label={$t`Write new email`}
        onClick={newMail}
        disabled={!selectedAccount}
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
  import { MailAccount } from "../../../logic/Mail/MailAccount";
  import { Folder } from "../../../logic/Mail/Folder";
  import { mailMustangApp } from "../MailMustangApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import { goTo } from "../../AppsBar/selectedApp";
  import { t } from "../../../l10n/l10n";

  export let selectedAccount: MailAccount;
  export let selectedFolder: Folder;

  let isMenuOpen = false;

  function goToSearch() {
    goTo("/mail/search");
  }

  function newMail() {
    let email = selectedAccount.newEMailFrom();
    mailMustangApp.writeMail(email);
  }
</script>
