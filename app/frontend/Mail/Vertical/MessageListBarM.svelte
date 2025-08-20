<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="accounts">
      <Button
        icon={folder.account?.icon ?? InboxIcon}
        iconSize="24px"
        iconOnly
        label={$t`Select account or folder`}
        onClick={goToAccounts}
        plain
        />
    </hbox>

    <!-- left middle -->
    <hbox class="msglist">
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
        plain
        />
    </hbox>

    <!-- right -->
    <hbox class="menu button">
      <ButtonMenu bind:isMenuOpen>
      </ButtonMenu>
    </hbox>
  </AppBarM>
</hbox>

<script lang="ts">
  import { Folder } from "../../../logic/Mail/Folder";
  import { mailMustangApp } from "../MailMustangApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import InboxIcon from "lucide-svelte/icons/inbox";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import { goTo } from "../../AppsBar/selectedApp";
  import { t } from "../../../l10n/l10n";

  export let folder: Folder;

  let isMenuOpen = false;

  function goToAccounts() {
    goTo("/mail/", {});
  }
  function goToSearch() {
    goTo("/mail/search", {});
  }

  function newMail() {
    let email = folder.account.newEMailFrom();
    mailMustangApp.writeMail(email);
  }
</script>
