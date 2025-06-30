<vbox class="email" flex
  title={message.subject + "\n\n" + (message.text?.substring(0, 300) ?? "")}
  on:click={() => catchErrors(onOpen)}>
  <div class="subject">
    {message.subject}
  </div>
  <div class="body">
    {message.text?.substring(0, 120) ?? ""}
  </div>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { selectedAccount, selectedFolder, selectedMessage } from "../../Mail/Selected";
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
    openApp(mailMustangApp);
    await tick();
    $selectedAccount = message.folder?.account;
    $selectedFolder = message.folder;
    $selectedMessage = message;
  }
</script>

<style>
  .subject {
    font-weight: bold;
  }
  .subject,
  .body {
    max-height: 1.5em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
