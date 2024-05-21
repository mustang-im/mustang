<vbox class="group {classes}">
  <hbox class="header">
    <slot name="header" />
    <hbox flex />
    <hbox class="buttons">
      <slot name="buttons-top-right" />
    </hbox>
  </hbox>
  <vbox class="content" flex>
    <slot />
  </vbox>
</vbox>

<script lang="ts">
  export let classes = "";
</script>

<style>
  .group {
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-top: 24px;
  }
  .header {
    background-color: var(--headerbar-bg);
    color: var(--headerbar-fg);
    border-bottom: 1px solid var(--border);
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 500;
  }
  .content {
    background-color: var(--main-bg);
    color: var(--main-fg);
    padding: 24px 20px 16px 20px;
  }
</style>
