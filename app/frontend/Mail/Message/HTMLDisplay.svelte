<!-- TODO Security: Test that this <webview> is untrusted and jailed -->
<webview class="html-display" src={"data:text/html;charset=utf-8," + displayHTML} title="Text" />

<script lang="ts">
  import cssContent from "./content.css?inline";
  import cssBody from "./content-body.css?inline";

  // TODO Check (using both docs and testing) that iframe doc cannot access the app UI
  // TODO Sanitize HTML. It comes from untrusted sources. Dangerous! @see also Chat Message.svelte
  export let html: string;

  $: displayHTML = `<style>${cssBody}\n${cssContent}</style>\n\n` + html;

  /*
  bind:this={iframeE}
  let iframeE: HTMLIFrameElement;

  $: iframeE && html && setSylesheet();
  function setSylesheet() {
    iframeE.onload = () => {
      const stylesheet = document.createElement("link");
      stylesheet.href = "content.css";
      stylesheet.rel = "stylesheet";
      stylesheet.type = "text/css";
      iframeE.contentWindow.document.body.appendChild(stylesheet);
    };
  }
  */
</script>

<style>
  .html-display {
    flex: 1 0 0;
    border: none;
  }
</style>
