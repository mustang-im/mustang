<div class="container" bind:this={containerE}>
  {@html html || ""}
  <!-- TODO Use Shadow DOM - not working
  <template shadowrootmode="open">
    {@html html || ""}
  </template>
  -->
</div>

<script lang="ts">
  /**
   * Displays trusted HTML.
   * Keeps CSS styles contained in this box, so that they do not affect the app.
   * Does run JavaScript, so you need to sanitize the HTML before passing it here.
   */

  /** The HTML to display.
   * DANGER Attention: The HTML should already be sanitized using `sanitizeHTML()` */
  export let html: string | null = null;

  let containerE: HTMLDivElement;

  /*
  $: html, display();
  function display() {
    if (!containerE) {
      return;
    }
    let dom = new DOMParser().parseFromString(html, "text/html");
    const shadowRoot = containerE.attachShadow({ mode: "open" });
    shadowRoot.appendChild(dom.documentElement.firstChild);
  }

  onMount(display);
  */
</script>

<style>
  .container {
    flex: 1 0 0;
  }
</style>
