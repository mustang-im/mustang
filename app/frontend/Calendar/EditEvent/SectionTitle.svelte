<hbox flex class="section-title">
  <hbox class="label">{label}</hbox>
  <hbox class="content">
    <slot />
  </hbox>
</hbox>

<script lang="ts">
  export let label: string = "";
</script>

<style>
  .section-title {
    flex-wrap: wrap;
  }
  .label {
    margin-inline-end: 16px;
    flex: 1 0 0;
    min-width: fit-content;
    flex-wrap: wrap;
    max-width: 10em;
  }
  .content {
    flex: 5 0 0;
    flex-wrap: wrap;
  }
</style>
