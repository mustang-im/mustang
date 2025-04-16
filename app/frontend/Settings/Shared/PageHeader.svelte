<hbox class="title">
  <slot name="title" />
  {title}
  <hbox flex />
  <hbox class="buttons">
    <slot name="buttons-top-right" />
  </hbox>
</hbox>
<hbox class="subtitle font-normal">
  <slot name="subtitle" />
  {subtitle}
</hbox>

<script lang="ts">
  export let title = "";
  export let subtitle = "";
</script>

<style>
  .title {
    font-size: 32px;
  }
  .subtitle {
  }
  .buttons {
    justify-content: center;
    align-items: center;
  }
</style>
