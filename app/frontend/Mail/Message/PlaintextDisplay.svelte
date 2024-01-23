<div class="plaintext value">
  {plaintext || ''}
</div>

<script lang="ts">
  export let plaintext: string;
</script>

<style>
  .plaintext {
    flex: 1 0 0;
    white-space: pre-wrap;
    max-width: 50em;
  }
</style>
