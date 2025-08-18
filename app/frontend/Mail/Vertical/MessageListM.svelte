<vbox flex class="message-list-pane">
  <FolderHeader folder={selectedFolder} {searchMessages} />
  <VerticalMessageList {messages} bind:selectedMessage bind:selectedMessages on:click={() => catchErrors(goToMessage)} />
  {#if selectedFolder && !(selectedFolder instanceof SavedSearchFolder) && availableTags.hasItems}
    <TagsList folder={selectedFolder} bind:searchMessages />
  {/if}
  <FolderFooter folder={selectedFolder} bind:searchMessages />
  <MessageListBarM folder={selectedFolder} />
</vbox>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/EMail";
  import { availableTags } from "../../../logic/Abstract/Tag";
  import { goTo } from "../../AppsBar/selectedApp";
  import VerticalMessageList from "./VerticalMessageList.svelte";
  import FolderHeader from "../LeftPane/FolderHeader.svelte";
  import FolderFooter from "../LeftPane/FolderFooter.svelte";
  import TagsList from "../LeftPane/TagsList.svelte";
  import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import MessageListBarM from "./MessageListBarM.svelte";
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
    const en = encodeURIComponent;
    goTo(`/mail/message/${en(selectedMessage.folder.account.id)}/${en(selectedMessage.folder.id)}/${en(selectedMessage.id)}/display`);
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
</style>
