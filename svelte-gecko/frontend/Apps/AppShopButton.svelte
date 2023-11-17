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
    <Button classes="add" label="Add" on:click={add} disabled={isAdded} />
  </hbox>
</vbox>

<script lang="ts">
  import type AppListed from "../../logic/Apps/AppListed";
  import Button from "../Shared/Button.svelte";

  export let app: AppListed;
  export let selectedApp: AppListed; /* in/out */

  function onSelect() {
    selectedApp = app;
  }

  let isAdded = false;
  function add() {
    isAdded = true;
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
</style>
