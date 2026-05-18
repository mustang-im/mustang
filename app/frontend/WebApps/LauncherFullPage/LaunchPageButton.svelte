<Clickable onClick={startApp}>
  <vbox class="app">
    <vbox class="icon">
      <img src={app.icon} width="96" height="96" alt="" />
    </vbox>
    <vbox class="nameDescr">
      <h2 class="name font-normal">{app.nameTranslated}</h2>
    </vbox>
  </vbox>
</Clickable>

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import Clickable from "../../Shared/Clickable.svelte";

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
    margin: 0px;
    text-align: center;
  }
</style>
