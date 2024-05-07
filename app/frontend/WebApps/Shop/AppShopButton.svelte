<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox class="app" class:selected={app == selectedApp} on:click={onSelect}>
  <vbox class="icon">
    <img src={app.icon} width="96" height="96" alt="" />
  </vbox>
  <vbox class="nameDescr">
    <h2 class="name">{app.nameTranslated}</h2>
    <div class="description">{app.descriptionTranslated}</div>
  </vbox>
  <hbox class="actions">
    {#if app.homepage}
      <a class="homepage" href={app.homepage} target="_blank">Website</a>
    {/if}
    <hbox flex />
    {#if $myApps.includes(app)}
      <Button classes="remove" label="Remove"
        onClick={remove}
        />
    {:else}
      <Button classes="add" label="Add"
        onClick={add}
        />
  {/if}
  </hbox>
</vbox>

<script lang="ts">
  import type AppListed from "../../../logic/Apps/AppListed";
  import { appGlobal } from "../../../logic/app";
  import Button from "../../Shared/Button.svelte";

  export let app: AppListed;
  export let selectedApp: AppListed; /* in/out */

  function onSelect() {
    selectedApp = app;
  }

  $: myApps = appGlobal.apps.myApps;

  function add() {
    myApps.add(app);
  }
  function remove() {
    myApps.remove(app);
  }
</script>

<style>
  .app {
    border: 1px dotted lightgray;
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
    height: 192px;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  .name {
    font-size: 16px;
    margin-top: 16px;
  }
  .description {
    font-size: 11px;
  }
  .actions {
    align-items: center;
  }
  .homepage {
    font-size: 12px;
  }
</style>
