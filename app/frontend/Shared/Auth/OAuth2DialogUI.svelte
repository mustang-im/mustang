<Browser
  title="Authentication"
  url={dialog.startURL}
  on:page-change={onPageChange}
  on:close={onClose}
  />

<script lang="ts">
  import type { OAuth2Dialog } from "../../../logic/Auth/OAuth2Dialog";
  import Browser from "../Browser.svelte";
  import { UserCancelled, type URLString, sleep } from "../../../logic/util/util";
  import { onMount } from "svelte";

  export let dialog: OAuth2Dialog;

  async function onPageChange(event: CustomEvent<URLString>) {
    let url = event.detail;
    dialog.urlChange(url);
  }

  function onClose() {
    dialog.failed(new UserCancelled("Authentication dialog was closed"));
  }

  onMount(async () => {
    await sleep(15 * 60); // 15 mins
    dialog.failed(new UserCancelled("Authentication dialog was closed due to inaction"));
  });
</script>

<style>
</style>
