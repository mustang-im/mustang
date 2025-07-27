<WebView url={app.start} title={app.nameTranslated} {hidden} />

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import WebView from "../../Shared/WebView.svelte";

  export let app: WebAppListed;
  export let hidden = false;

  $: console.log("running app", app?.nameTranslated, hidden ? "hidden" : "showing");
</script>
