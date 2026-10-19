<vbox class="group {classes}">
  <hbox class="header font-normal">
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
    border-radius: var(--group-box-radius);
    margin-block-start: 24px;
  }
  .header {
    background-color: var(--group-box-header-bg);
    color: var(--headerbar-fg);
    border-bottom: var(--group-box-header-border);
    padding: var(--group-box-header-padding);
    font-weight: var(--group-box-header-weight);
    align-items: center;
  }
  .content {
    background-color: var(--main-bg);
    color: var(--main-fg);
    padding: var(--group-box-content-padding);
  }
</style>
