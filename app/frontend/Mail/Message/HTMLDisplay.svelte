<WebView {html} {headHTML} allowServerCalls={allowExternalImages} title="Text" />

<script lang="ts">
  import cssContent from "./content.css?inline";
  import cssBody from "./content-body.css?inline";
  import WebView from "../../Shared/WebView.svelte";

  /** DANGER Attention: You must sanitize the HTML. It comes from untrusted sources.
   * @see also Chat Message.svelte */
  export let html: string;
  export let allowExternalImages = false;

  $: headHTML = `<style>${cssBody}\n${cssContent}</style>`;
</script>
