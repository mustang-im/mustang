<WebView url={runningApp.start} title={runningApp.nameTranslated} />

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import WebView from "../../Shared/WebView.svelte";

  export let runningApp: WebAppListed;
</script>
