<vbox class="value">
  {#each lines as line}
    <div>{line}</div>
  {/each}
</vbox>

<script lang="ts">
  export let value: string;

  $: lines = value.split("\n");
</script>

<style>
</style>
