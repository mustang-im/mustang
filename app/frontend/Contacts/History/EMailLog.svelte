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
  import { openEMailMessage } from "../../Mail/open";
  import { SearchView } from "../../Mail/LeftPane/SearchSwitcher.svelte";
  import { catchErrors } from "../../Util/error";

  export let message: EMail;

  async function onOpen() {
    openEMailMessage(message, SearchView.Person);
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
