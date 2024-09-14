<vbox flex class="wrapper" bind:offsetWidth={overallWidth}>
  <!-- TODO the max-width here is slow, and it doesn't work right -->
  <div class="container" bind:this={containerE} style="max-width: {overallWidth}px" />
  <!-- TODO there is another max-width in Message.svelte. Use only one (or preferabley none) of them. -->
  <!-- TODO use:
  <template shadowrootmode="open">
    {@html html || ""}
  </template
  -->
</vbox>

<script lang="ts">
  import { onMount } from "svelte";

  /**
   * Displays trusted HTML.
   * Keeps CSS styles contained in this box, so that they do not affect the app.
   * Does run JavaScript, so you need to sanitize the HTML before passing it here.
   */

  /** The HTML to display.
   * DANGER Attention: The HTML should already be sanitized using `sanitizeHTML()` */
  export let html: string | null = null;

  let containerE: HTMLDivElement;
  let overallWidth: number;

  $: html, display();
  function display() {
    if (!containerE) {
      return;
    }
    let dom = new DOMParser().parseFromString(html, "text/html");
    let shadowRoot = containerE.shadowRoot;
    if (shadowRoot) {
      shadowRoot.innerHTML = "";
    } else {
      shadowRoot = containerE.attachShadow({ mode: "open" });
    }
    shadowRoot.appendChild(dom.body);
  }

  onMount(display);
</script>

<style>
  .wrapper {
    width: 100%;
  }
  .container {
    overflow-wrap: anywhere;
    overflow: hidden;
  }

  .container :global(blockquote) {
    border-left: 3px solid grey;
    padding-inline-start: 16px;
    margin-inline-start: 0px;
  }
  .container :global(pre) {
    white-space: pre-wrap !important;
  }
  .container :global(*) {
    text-wrap: wrap !important;
    overflow-wrap: anywhere !important;
  }
</style>
