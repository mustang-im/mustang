  <hbox></hbox>
  <hbox class="label">Protocol</hbox>
  <hbox class="label">Hostname</hbox>
  {#if stepFull}
    <hbox class="label">Port</hbox>
    <hbox class="label">Connection encryption</hbox>
    <hbox class="label">Authentication method</hbox>
    <hbox class="label">Username</hbox>
  {/if}

<script lang="ts">
  export let stepFull: boolean;
</script>

<style>
  .label {
    margin-top: 4px;
  }
</style>
