<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<Browser
  title={$t`Authentication`}
  url={dialog.startURL}
  on:page-change={onPageChange}
  on:close={onClose}
  {sessionSaveID}
  />

<script lang="ts">
  import type { OAuth2Dialog } from "../../../logic/Auth/OAuth2Dialog";
  import Browser from "../Browser.svelte";
  import { UserCancelled, type URLString, sleep } from "../../../logic/util/util";
  import { onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let dialog: OAuth2Dialog;

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
