<Browser
  title={$t`Authentication`}
  url={startURL}
  on:page-change={onPageChange}
  on:close={onClose}
  {sessionSaveID}
  {withURLbar}
  >
  <hbox class="account" slot="urlbar-left">
    {dialog.oAuth2.account?.name}
  </hbox>
</Browser>

<script lang="ts">
  import type { OAuth2Tab } from "../../../logic/Auth/UI/OAuth2Tab";
  import { OAuth2Embed } from "../../../logic/Auth/UI/OAuth2Embed";
  import Browser from "../Browser.svelte";
  import { UserCancelled, UserError, type URLString, sleep } from "../../../logic/util/util";
  import { onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let dialog: OAuth2Tab | OAuth2Embed;
  export let withURLbar = true;

  let sessionSaveID = "login:" + dialog.oAuth2.account?.id;
  let startURL: URLString;

  async function onPageChange(event: CustomEvent<URLString>) {
    let url = event.detail;
    dialog.urlChanged(url);
  }

  function onClose() {
    dialog.failed(new UserCancelled($t`Login dialog was closed`));
  }

  onMount(async () => {
    dialog.subscribe(() => {
      if (!startURL && dialog.startURL) {
        startURL = dialog.startURL;
      }
    });
    await sleep(15 * 60); // 15 mins
    // Not `UserCancelled`, because we want to show that error msg to the user
    dialog.failed(new UserError($t`Login dialog was closed due to inaction`));
  });
</script>

<style>
</style>
