<vbox flex class="message-list-pane"
  on:swipedown={() => catchErrors(onCheckMail)}>
  {#if checkingMail || loggingIn}
    <hbox class="mail-check">
      {#if checkingMail}
        <FetchingIcon size="32xp" />
      {:else if loggingIn}
        <LoginIcon size="32xp" />
      {/if}
    </hbox>
  {/if}
  <FolderHeader folder={selectedFolder} {searchMessages} />
  <VerticalMessageList {messages} bind:selectedMessage bind:selectedMessages on:click={() => catchErrors(goToMessage)} />
  {#if selectedFolder && !(selectedFolder instanceof SavedSearchFolder) && availableTags.hasItems}
    <TagsList folder={selectedFolder} bind:searchMessages showStaticLabel={false} />
  {/if}
  <FolderFooter folder={selectedFolder} bind:searchMessages showGetMail={false} />
  <MessageListBarM folder={selectedFolder} />
</vbox>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/EMail";
  import { availableTags } from "../../../logic/Abstract/Tag";
  import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import { goTo } from "../../AppsBar/selectedApp";
  import VerticalMessageList from "./VerticalMessageList.svelte";
  import FolderHeader from "../LeftPane/FolderHeader.svelte";
  import FolderFooter from "../LeftPane/FolderFooter.svelte";
  import TagsList from "../LeftPane/TagsList.svelte";
  import MessageListBarM from "./MessageListBarM.svelte";
  import FetchingIcon from "lucide-svelte/icons/arrow-big-down-dash";
  import LoginIcon from "lucide-svelte/icons/key-round";
  import { URLPart } from "../../Util/util";
  import { catchErrors } from "../../Util/error";
  import { sleep, assert } from "../../../logic/util/util";
  import type { ArrayColl } from 'svelte-collections';

  export let messages: ArrayColl<EMail>; /** in */
  export let searchMessages: ArrayColl<EMail> | null; /** out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedMessage: EMail; /** in/out */
  export let selectedMessages: ArrayColl<EMail>; /** in/out */

  async function goToMessage() {
    await sleep(0.1); // wait for `<VerticalMessageList>` to set `selectedMessage`
    assert(selectedMessage, "Need message");
    goTo(URLPart`/mail/message/${selectedMessage.folder.account.id}/${selectedMessage.folder.id}/${selectedMessage.id}/display`, {
      account: selectedMessage.folder.account,
      folder: selectedMessage.folder,
      message: selectedMessage,
    });
  }

  let checkingMail = false;
  let loggingIn = false;
  async function onCheckMail() {
    loggingIn = true;
    let account = selectedFolder.account;
    if (!account.isLoggedIn) {
      await account.login(true);
    }
    loggingIn = false;
    checkingMail = true;
    await selectedFolder.getNewMessages();
    checkingMail = false;
  }
</script>

<style>
  .message-list-pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .message-list-pane {
    box-shadow: 1px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    z-index: 2;
  }
  .mail-check {
    height: 32px;
  }
</style>
