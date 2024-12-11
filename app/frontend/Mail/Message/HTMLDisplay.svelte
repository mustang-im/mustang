<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<WebView {html} {headHTML} allowServerCalls={allowExternalImages} title={$t`Text`} on:webview />

<script lang="ts">
  import cssContent from "./content.css?inline";
  import cssBody from "./content-body.css?inline";
  import cssFont from "../../asset/font/Karla.css?inline";
  import WebView from "../../Shared/WebView.svelte";
  import { t } from "../../../l10n/l10n";

  /** DANGER Attention: You must sanitize the HTML. It comes from untrusted sources.
   * @see also Chat Message.svelte */
  export let html: string;
  export let allowExternalImages = false;
  /** out only */
  export let webviewE: HTMLIFrameElement = null;

  $: headHTML = `<style>\n${cssBody}\n${cssContent}\n</style>`;
</script>
