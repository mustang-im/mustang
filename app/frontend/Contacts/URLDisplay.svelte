<hbox class="value">
  <a href="{value}"
    target="_blank"
    class="link-button"
    on:click={event => event.stopPropagation()}>
    {value}
  </a>
</hbox>

<script lang="ts">
  export let value: string;
</script>
