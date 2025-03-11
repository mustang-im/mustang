<vbox class="app" on:click={startApp}>
  <vbox class="icon">
    <img src={app.icon} width="96" height="96" alt="" />
  </vbox>
  <vbox class="nameDescr">
    <h2 class="name">{app.nameTranslated}</h2>
  </vbox>
</vbox>

<script lang="ts">
  import type WebAppListed from "../../../logic/WebApps/WebAppListed";

  export let app: WebAppListed;
  export let runningApp: WebAppListed; /* in/out */

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
