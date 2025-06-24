<vbox class="group {classes}">
  <hbox class="header">
    <slot name="header" />
  </hbox>
  <vbox class="content" flex>
    <slot name="content" />
  </vbox>
</vbox>

<script lang="ts">
  export let classes = "";
</script>

<style>
  .group {
    margin: 5px;
    border: 1px solid var(--border);
    border-radius: 2px;
  }
  .header {
    align-items: center;
    padding: 8px 16px 8px 20px;
    background-color: rgba(32, 174, 158, 5%); /* #20AE9E0C */
  }
  @media (prefers-color-scheme: dark) {
    .header {
      background-color: #20202270;
    }
  }
  .content {
    background-color: var(--main-bg);
    color: var(--main-fg);
    padding: 8px 16px 10px 20px;
  }
</style>
