<vbox class="results" flex>
  {#if searchMessages}
    <VerticalMessageList messages={searchMessages} bind:selectedMessage bind:selectedMessages on:click={() => catchErrors(goToMessage)} />
    <FolderFooter folder={null} bind:searchMessages />
  {/if}
</vbox>
<SearchBarM />

<script lang="ts">
  import { EMail } from "../../../logic/Mail/EMail";
  import { getNavigation } from "../../AppsBar/selectedApp";
  import VerticalMessageList from "../Vertical/VerticalMessageList.svelte";
  import FolderFooter from "../LeftPane/FolderFooter.svelte";
  import SearchBarM from "./SearchBarM.svelte";
  import { URLPart } from "../../../logic/util/blob";
  import { catchErrors } from "../../Util/error";
  import { assert, sleep } from "../../../logic/util/util";
  import { ArrayColl } from "svelte-collections";
  import { openEMailMessage } from "../open";
  import { AppWindow } from "../../MainWindow/AppWindow";

  const { goTo } = getNavigation();
  const appWindow = AppWindow.current();

  export let searchMessages: ArrayColl<EMail> | null = null;

  let selectedMessage: EMail;
  let selectedMessages: ArrayColl<EMail>;

  async function goToMessage() {
    await sleep(0.1); // wait for `<VerticalMessageList>` to set `selectedMessage`
    assert(selectedMessage, "Need message");
    await openEMailMessage(selectedMessage, appWindow);
  }
</script>
