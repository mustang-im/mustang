<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<vbox flex class="apps-launcher">
  <vbox flex />

  <vbox class="center">
    <div class="apps">
      {#each $apps.each as app}
        <span class="app">
          <AppLaunchButton {app} bind:runningApp />
        </span>
      {/each}
    </div>

    <hbox class="actions">
      <hbox flex />
      <Button on:click={startStore} label={$t`More apps`} />
    </hbox>
  </vbox>
  <vbox flex />
</vbox>

<script lang="ts">
  import type WebAppListed from "../../../logic/WebApps/WebAppListed";
  import AppLaunchButton from "./WebAppLaunchButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let apps: Collection<WebAppListed>;
  export let runningApp: WebAppListed; /* in/out */
  export let showStore = false; /* in/out */

  function startStore() {
    showStore = true;
  }
</script>

<style>
  .center {
    align-self: center;
  }
  div.apps {
    flex: 1 0 0;
  }
  span.app {
    display: inline-flex;
  }
  .actions {
    margin: 32px;
  }
</style>
