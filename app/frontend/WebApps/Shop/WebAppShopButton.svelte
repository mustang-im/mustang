<vbox class="app" class:selected={app == selectedApp} on:click={onSelect}>
  <vbox class="icon">
    <img src={app.icon} width="96" height="96" alt="" />
  </vbox>
  <vbox class="nameDescr" flex>
    <h2 class="name font-normal">{app.nameTranslated}</h2>
    <div class="description font-smallest">{app.descriptionTranslated}</div>
  </vbox>
  <hbox class="actions">
    {#each $myApps.filterObservable(a => a.id == app.id).each as selectedApp}
      <Button
        label={$t`Remove` + (app.account ? "\n" + app.account.name : "")}
        icon={app.account?.icon}
        classes="remove"
        onClick={() => remove(selectedApp)}
        />
    {/each}
  </hbox>
  <hbox class="actions">
    {#if app.homepage}
      <a class="homepage font-smallest" href={app.homepage} target="_blank">{$t`Website`}</a>
    {/if}
    <hbox flex />
    <AccountDropDown accounts={appGlobal.emailAccounts} bind:selectedAccount filterByWorkspace={false} showAllOption={true} />
    <Button
      label={$t`Add`}
      classes="add"
      onClick={add}
      />
  </hbox>
</vbox>

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import { selectedWebApp, showingWebApp, webAppsRunning } from "../Runner/WebAppsRunning";
  import { Account } from "../../../logic/Abstract/Account";
  import { appGlobal } from "../../../logic/app";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";

  export let app: WebAppListed;
  export let selectedApp: WebAppListed; /* in/out */

  let selectedAccount: Account | null = null;

  function onSelect() {
    selectedApp = app;
  }

  $: myApps = appGlobal.webApps.myApps;

  function add() {
    myApps.add(app.instantiate(selectedAccount));
    selectedAccount = null;
  }
  function remove(app: WebAppListed) {
    myApps.remove(app);
    webAppsRunning.remove(app);
    if ($selectedWebApp == app) {
      $selectedWebApp = webAppsRunning.last;
    }
    if ($showingWebApp == app) {
      $showingWebApp = webAppsRunning.last;
    }
  }
</script>

<style>
  .app {
    border: 1px solid var(--border);
    border-radius: 3px;
    margin: 4px;
    padding: 12px;
    height: 330px;
    max-width: 192px;
    overflow-y: auto;
  }
  .icon {
    margin: 8px;
    align-self: center;
  }
  .nameDescr {
    overflow-y: auto;
    overflow-x: hidden;
  }
  .name {
    margin-block-start: 16px;
  }
  .description {
  }
  .actions {
    align-items: center;
    justify-content: end;
    flex-wrap: wrap;
  }
  .actions :global(button) {
    margin-inline-start: 8px;
    margin-block-start: 4px;
  }
  .homepage {
  }
</style>
