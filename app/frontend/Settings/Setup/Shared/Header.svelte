<vbox class="header">
  <h1>{title}</h1>
  <div class="subtitle">{subtitle}</div>
</vbox>

<script lang="ts">
  export let title: string;
  export let subtitle: string = "";
</script>

<style>
  .header {
    margin-block-end: 32px;
  }
  h1 {
    margin: 0px;
    font-size: 28px;
  }
  .subtitle {
    margin-block-start: 2px;
    opacity: 65%;
    font-weight: 300;
    line-height: 1.4;
  }
</style>
