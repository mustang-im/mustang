<vbox flex class="message-body">
  {#await message.loadBody()}
    {#await sleep(1)}
      <hbox></hbox>
    {:then}
      {$t`Loading...`}
    {/await}
  {:then}
    {#if mode == DisplayMode.HTML || mode == DisplayMode.HTMLWithExternal}
      <HTMLDisplay html={$message.html} allowExternalImages={mode == DisplayMode.HTMLWithExternal} />
    {:else if mode == DisplayMode.Plaintext}
      <PlaintextDisplay plaintext={$message.text} />
      <!--<HTMLDisplay html={convertTextToHTML($message.text)} />-->
    {:else if mode == DisplayMode.Source}
      {#await message.loadMIME()}
        {$t`Loading...`}
      {:then}
        <PlaintextDisplay plaintext={getSource($message)} />
      {/await}
    {:else if mode == DisplayMode.Thread}
      <ThreadDisplay {message} />
    {:else}
      {$t`Unknown display mode`}
    {/if}
  {:catch ex}
    {ex.message ?? ex + ""}
  {/await}
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import HTMLDisplay from "./HTMLDisplay.svelte";
  import PlaintextDisplay from "./PlaintextDisplay.svelte";
  import ThreadDisplay from "./ThreadDisplay.svelte";
  import { showError } from "../../Util/error";
  import { sleep } from "../../../logic/util/util";
  import { t } from "svelte-i18n-lingui";

  export let message: EMail;

  let modeSetting = getLocalStorage("mail.contentRendering", "html");
  $: mode = $modeSetting.value as DisplayMode;

  function getSource(message: EMail): string {
    if (!message.mime) {
      return $t`Source not available`;
    }
    return new TextDecoder().decode($message.mime);
  }
</script>

<script lang="ts" context="module">
  export enum DisplayMode {
    HTML = "html",
    HTMLWithExternal = "with-external",
    Plaintext = "plaintext",
    Source = "source",
    Thread = "thread",
  }
</script>
