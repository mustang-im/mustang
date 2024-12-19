<Browser
  title={$t`Authentication`}
  url={dialog.startURL}
  on:page-change={onPageChange}
  on:close={onClose}
  {sessionSaveID}
  />

<script lang="ts">
  import type { OAuth2Tab } from "../../../logic/Auth/UI/OAuth2Tab";
  import Browser from "../Browser.svelte";
  import { UserCancelled, type URLString, sleep } from "../../../logic/util/util";
  import { onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let dialog: OAuth2Tab;

  let sessionSaveID = "login:" + dialog.oAuth2.account?.id;

  async function onPageChange(event: CustomEvent<URLString>) {
    let url = event.detail;
    dialog.urlChange(url);
  }

  function onClose() {
    dialog.failed(new UserCancelled($t`Authentication dialog was closed`));
  }

  onMount(async () => {
    await sleep(15 * 60); // 15 mins
    dialog.failed(new UserCancelled($t`Authentication dialog was closed due to inaction`));
  });
</script>

<style>
</style>
