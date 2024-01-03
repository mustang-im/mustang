<vbox class="group {classes}">
  <slot />
</vbox>

<script lang="ts">
  export let classes = "";
</script>

<style>
  .group {
    margin: 5px;
    padding: 16px;
    padding-left: 20px;
    border: 1px solid #E6E4E8;
    border-radius: 2px;
  }
</style>
