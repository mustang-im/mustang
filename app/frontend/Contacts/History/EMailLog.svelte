<vbox class="email" flex
  title={message.subject + "\n\n" + (message.text?.substring(0, 300) ?? "")}
  on:click={() => catchErrors(onOpen)}>
  <div class="subject">
    {message.subject}
  </div>
  <div class="body">
    {message.text?.substring(0, 240) ?? ""}
  </div>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { selectedAccount, selectedFolder, selectedMessage, selectedSearchTab } from "../../Mail/Selected";
  import { SearchView } from "../../Mail/LeftPane/SearchSwitcher.svelte";
  import { openApp } from "../../AppsBar/selectedApp";
  import { mailMustangApp } from "../../Mail/MailMustangApp";
  import { assert } from "../../../logic/util/util";
  import { catchErrors } from "../../Util/error";
  import { tick } from "svelte";

  export let message: EMail;

  async function onOpen() {
    assert(message.folder?.account, "no account for email");
    $selectedAccount = message.folder?.account;
    $selectedFolder = message.folder;
    $selectedMessage = message;
    $selectedSearchTab = SearchView.Person;
    openApp(mailMustangApp, {
      message: message,
      folder: message.folder,
      account: message.folder?.account,
      tab: SearchView.Person,
    });
    await tick();
    $selectedAccount = message.folder?.account;
    $selectedFolder = message.folder;
    $selectedMessage = message;
    $selectedSearchTab = SearchView.Person;
  }
</script>

<style>
  .subject,
  .body {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .subject {
    max-height: 1.4em;
    margin-block-start: -1px;
    margin-block-end: 3px;
    font-weight: bold;
  }
  .body {
    max-height: 2.4em;
    line-height: 1.2em;
    font-weight: 300;
  }
</style>
