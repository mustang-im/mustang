<vbox class="group {classes}">
  <slot />
</vbox>

<script lang="ts">
  export let classes = "";
</script>

<style>
  .group {
    margin: 8px;
    padding: 16px;
    border: 1px dotted lightgray;
  }
</style>
