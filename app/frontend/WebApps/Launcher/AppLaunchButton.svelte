<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox class="app" on:click={startApp}>
  <vbox class="icon">
    <img src={app.icon} width="96" height="96" alt="" />
  </vbox>
  <vbox class="nameDescr">
    <h2 class="name">{app.nameTranslated}</h2>
  </vbox>
</vbox>

<script lang="ts">
  import type AppListed from "../../../logic/Apps/AppListed";

  export let app: AppListed;
  export let runningApp: AppListed; /* in/out */

  function startApp() {
    runningApp = app;
  }
</script>

<style>
  .app {
    border-radius: 3px;
    margin: 4px;
    padding: 12px;
  }
  .icon {
    margin: 8px;
    align-self: center;
  }
  .nameDescr {
    max-width: 192px;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  .name {
    font-size: 16px;
    margin: 0px;
    text-align: center;
  }
</style>
