<WebView url={runningApp.start} title={runningApp.nameTranslated} />

<script lang="ts">
  import type AppListed from "../../../logic/Apps/AppListed";
  import WebView from "../../Shared/WebView.svelte";

  export let runningApp: AppListed;

  $: console.log("running app", runningApp?.nameTranslated);
</script>
