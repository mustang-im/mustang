<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="accounts">
      <Button
        icon={message?.folder?.account?.icon ?? AccountIcon}
        iconSize="32px"
        iconOnly
        label={$t`Select account or folder`}
        onClick={goToAccounts}
        plain
        />
    </hbox>

    <!-- left middle -->
    <hbox class="msglist" specialfolder={message.folder.specialFolder}>
      <Button
        label={$t`Show messages in folder ${message.folder.name}`}
        onClick={goToMsgList}
        iconOnly
        plain
        >
        <hbox slot="icon">
          {#if message.folder.specialFolder == SpecialFolder.Inbox || message.folder.specialFolder == SpecialFolder.Normal }
            <FolderIcon folder={message.folder} size="32px" />
          {:else}
            <NormalFolderIcon size="32px" />
          {/if}
        </hbox>
      </Button>
    </hbox>

    <!-- left center extra -->
    <hbox class="spam extra">
      <Button
        icon={SpamIcon}
        iconSize="32px"
        iconOnly
        label={$t`Treat this email as spam: Move it to the Spam folder, and train the spam filter`}
        onClick={markAsSpam}
        disabled={!message}
        plain
        />
    </hbox>

    <AppMenuButton />

    <!-- right center extra -->
    <hbox class="trash extra">
      <Button
        icon={TrashIcon}
        iconSize="32px"
        iconOnly
        label={$t`Delete this message`}
        onClick={deleteMessage}
        disabled={!message}
        plain
        />
    </hbox>

    <!-- right middle -->
    {#if message.isDraft || message.folder?.specialFolder == SpecialFolder.Drafts }
      <hbox class="draft">
        <Button
          icon={WriteIcon}
          iconSize="32px"
          iconOnly
          label={$t`Edit draft`}
          onClick={editDraft}
          plain
          />
      </hbox>
    {:else}
      <hbox class="move button" bind:this={popupAnchorE}>
        <Button
          icon={FolderActionsIcon}
          iconSize="32px"
          iconOnly
          label={$t`Move to folder, or add tag`}
          onClick={onPopupToggle}
          plain
          />
      </hbox>
    {/if}

    <!-- right -->
    <hbox class="menu button">
      <ButtonMenu bind:isMenuOpen>
        <MessageMenu {message} {printE} />
      </ButtonMenu>
    </hbox>
  </AppBarM>
</hbox>
<Popup bind:popupOpen popupAnchor={popupAnchorE} placement="bottom" boundaryElSel=".message-list-pane">
  <MessageMovePopup messages={new ArrayColl([message])} on:close={onPopupClose} />
</Popup>

<Print {message} bind:this={printE} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { mailMustangApp } from "../MailMustangApp";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import MessageMenu from "./MessageMenu.svelte";
  import MessageMovePopup from "./MessageMovePopup.svelte";
  import Print from "./MessagePrint.svelte";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import FolderIcon from "../LeftPane/FolderIcon.svelte";
  import Popup from "../../Shared/Popup.svelte";
  import Button from "../../Shared/Button.svelte";
  import AccountIcon from "lucide-svelte/icons/rabbit";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import FolderActionsIcon from "lucide-svelte/icons/folder-dot";
  import NormalFolderIcon from "lucide-svelte/icons/folder";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";
  import { goTo } from "../../AppsBar/selectedApp";

  export let message: EMail;

  function goToAccounts() {
    goTo("/mail/");
  }
  function goToMsgList() {
    goTo("/mail/folder/message-list");
  }
  async function deleteMessage() {
    await message.deleteMessage();
  }
  async function markAsSpam() {
    await message.treatSpam(true);
  }
  async function editDraft() {
    await message.loadMIME();
    mailMustangApp.writeMail(message);
  }

  let isMenuOpen = false;
  let printE: Print;

  // Folder Popup
  let popupAnchorE: HTMLElement;
  let popupOpen = false;
  function onPopupToggle(event) {
    popupOpen = !popupOpen;
  }
  function onPopupClose() {
    popupOpen = false;
  }
</script>
