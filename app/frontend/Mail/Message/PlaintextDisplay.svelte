<Scroll>
  <pre class="plaintext value">
{plaintext || ''}
  </pre>
</Scroll>

<script lang="ts">
  import Scroll from "../../Shared/Scroll.svelte";

  export let plaintext: string;
</script>

<style>
  .plaintext {
    flex: 1 0 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    max-width: 50em;
    padding: 16px;
  }
</style>
