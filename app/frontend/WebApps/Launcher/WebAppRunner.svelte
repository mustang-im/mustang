<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<WebView url={runningApp.start} title={runningApp.nameTranslated} />

<script lang="ts">
  import type WebAppListed from "../../../logic/WebApps/WebAppListed";
  import WebView from "../../Shared/WebView.svelte";

  export let runningApp: WebAppListed;

  $: console.log("running app", runningApp?.nameTranslated);
</script>
