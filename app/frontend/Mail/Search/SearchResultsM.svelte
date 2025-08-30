<vbox class="results" flex>
  {#if searchMessages}
    <VerticalMessageList {messages} bind:selectedMessage bind:selectedMessages on:click={() => catchErrors(goToMessage)} />
    <FolderFooter folder={null} bind:searchMessages />
  {/if}
</vbox>
<SearchBarM />

<script lang="ts">
  import { EMail } from "../../../logic/Mail/EMail";
  import { goTo } from "../../AppsBar/selectedApp";
  import VerticalMessageList from "../Vertical/VerticalMessageList.svelte";
  import FolderFooter from "../LeftPane/FolderFooter.svelte";
  import SearchBarM from "./SearchBarM.svelte";
  import { URLPart } from "../../Util/util";
  import { catchErrors } from "../../Util/error";
  import { assert, sleep } from "../../../logic/util/util";
  import { ArrayColl } from "svelte-collections";

  export let searchMessages: ArrayColl<EMail> | null = null;

  let messages = new ArrayColl<EMail>();
  let selectedMessage: EMail;
  let selectedMessages: ArrayColl<EMail>;

  async function goToMessage() {
    await sleep(0.1); // wait for `<VerticalMessageList>` to set `selectedMessage`
    assert(selectedMessage, "Need message");
    goTo(URLPart`/mail/message/${selectedMessage.folder.account.id}/${selectedMessage.folder.id}/${selectedMessage.id}/display`, {
      account: selectedMessage.folder.account,
      folder: selectedMessage.folder,
      message: selectedMessage,
    });
  }
</script>
