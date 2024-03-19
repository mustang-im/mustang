<hbox flex class="middle">
  <hbox flex class="message">
    <slot name="icon" />
    <hbox>{message}</hbox>
  </hbox>
</hbox>

<script lang="ts">
  export let message: string;
</script>

<style>
  .middle {
    margin-top: 24px;
    margin-bottom: 20px;
  }
  .message {
    margin-left: 8px;
    margin-right: 24px;
    padding: 4px 24px;
    border-radius: 16px;
  }
</style>
