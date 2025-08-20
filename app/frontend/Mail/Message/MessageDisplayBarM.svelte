<hbox class="buttons"
  on:touchstart={ev => swipe.touchStart(ev)}
  on:touchend={ev => swipe.touchEnd(ev)}
  >
  <AppBarM>
    <!-- left -->
    <hbox class="accounts">
      <Button
        icon={message?.folder?.account?.icon ?? InboxIcon}
        iconSize="24px"
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
        icon={ListIcon}
        iconSize="24px"
        iconOnly
        plain
        />
    </hbox>

    <!-- left center extra -->
    <hbox class="spam extra">
      <Button
        icon={SpamIcon}
        iconSize="24px"
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
        iconSize="24px"
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
          iconSize="24px"
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
          iconSize="24px"
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
  import { goTo } from "../../AppsBar/selectedApp";
  import MessageMenu from "./MessageMenu.svelte";
  import MessageMovePopup from "./MessageMovePopup.svelte";
  import Print from "./MessagePrint.svelte";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import Popup from "../../Shared/Popup.svelte";
  import Button from "../../Shared/Button.svelte";
  import InboxIcon from "lucide-svelte/icons/inbox";
  import ListIcon from "lucide-svelte/icons/list";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import FolderActionsIcon from "lucide-svelte/icons/folder-dot";
  import { Swipe } from "../../Shared/Gesture";
  import { URLPart } from "../../Util/util";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  function goToAccounts() {
    goTo("/mail/", {});
  }
  function goToMsgList() {
    goTo(URLPart`/mail/folder/${message.folder.account.id}/${message.folder.id}/message-list`, {
      account: message.folder.account,
      folder: message.folder,
    });
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

  function onNextMessage() {
    message = message.nextMessage();
  }
  function onPreviousMessage() {
    message = message.nextMessage(true);
  }
  let swipe = new Swipe();
  swipe.onLeft = onPreviousMessage;
  swipe.onRight = onNextMessage;

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

  /*
  use:swipe={{ minSwipeDistance: 50 }}
  on:swipe={(ev) => onSwipe(ev.detail.direction)}
  import { swipe } from "svelte-gestures";
    function onSwipe(direction: "top" | "right" | "bottom" | "left") {
    if (direction == "left") {
      onPreviousMessage();
    } else if (direction == "right") {
      onNextMessage();
    }
  }
  */
</script>
