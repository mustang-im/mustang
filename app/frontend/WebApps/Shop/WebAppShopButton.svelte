<vbox class="app" class:selected={app == selectedApp} on:click={onSelect}>
  <vbox class="icon">
    <img src={app.icon} width="96" height="96" alt="" />
  </vbox>
  <vbox class="nameDescr" flex>
    <h2 class="app-name font-normal">{app.nameTranslated}</h2>
    <div class="description font-smallest">{app.descriptionTranslated}</div>
  </vbox>
  <hbox class="actions">
    {#if app.homepage}
      <a class="homepage font-smallest" href={app.homepage} target="_blank">{$t`Info`}</a>
    {/if}
    <hbox flex />
    <AccountDropDown accounts={appGlobal.emailAccounts} bind:selectedAccount filterByWorkspace={false} showAllOption={true} />
    <RoundButton
      label={$t`Add`}
      classes="add create"
      icon={AddIcon}
      onClick={add}
      />
  </hbox>
  {#if instances.hasItems}
    <vbox class="instances-separator" />
    <vbox class="instances">
      {#each instances.each as iapp, i}
        <hbox class="instance">
          {#if iapp.account}
            <RoundButton
              label={iapp.account.name}
              icon={iapp.account.icon}
              classes="account plain" border={false}
              />
            <hbox class="account-name" flex>
              {iapp.account.name}
            </hbox>
          {:else}
            <RoundButton label="" icon={CircleIcon} disabled border={false}
              classes="no-account plain" />
            <hbox class="account-name" flex>
              {iapp.nameTranslated?.split(" ").pop() + " " + i}
            </hbox>
          {/if}
          <RoundButton
            label={$t`Remove`}
            icon={TrashIcon}
            onClick={() => remove(iapp)}
            classes="remove plain" border={false}
            />
        </hbox>
      {/each}
    </vbox>
  {/if}
</vbox>

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import { selectedWebApp, showingWebApp, webAppsRunning } from "../Runner/WebAppsRunning";
  import { Account } from "../../../logic/Abstract/Account";
  import { appGlobal } from "../../../logic/app";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import CircleIcon from "lucide-svelte/icons/circle";
  import { t } from "../../../l10n/l10n";

  export let app: WebAppListed;
  export let selectedApp: WebAppListed; /* in/out */

  let selectedAccount: Account | null = null;

  function onSelect() {
    selectedApp = app;
  }

  $: myApps = appGlobal.webApps.myApps;
  $: instances = $myApps.filterObservable(a => a.id == app.id);

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
  .app-name {
    margin-block-start: 16px;
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
  .instances-separator {
    border-top: 1px solid var(--border);
    margin-block-start: 16px;
    margin-block-end: 8px;
  }
  .instance {
    align-items: center;
  }
  .account-name {
    justify-items: center;
  }
  .instance :global(.no-account svg) {
    stroke-width: 4px;
  }
</style>
