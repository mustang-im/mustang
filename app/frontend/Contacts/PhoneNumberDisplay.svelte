<hbox class="value">
  <a href="tel:{value}"
    on:click={event => event.stopPropagation()}>
    {value}
  </a>
</hbox>

<script lang="ts">
  export let value: string;
</script>

<style>
</style>
