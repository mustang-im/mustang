<hbox flex class="backstage">
  <vbox class="backstage-nav">
    <button class="nav-item back" title={$t`Back`} aria-label={$t`Back`} on:click={onBack}>
      <BackIcon size="20" />
    </button>
    <button class="nav-item" class:selected={$backstageState.page == "info"}
      on:click={() => backstageState.open("info")}>
      <InfoIcon size="18" />
      <hbox class="label">{$t`Info`}</hbox>
    </button>
    <button class="nav-item" class:selected={$backstageState.page == "options"}
      on:click={() => backstageState.open("options")}>
      <OptionsIcon size="18" />
      <hbox class="label">{$t`Options`}</hbox>
    </button>
    <vbox flex class="spacer" />
    <button class="nav-item" on:click={onExit}>
      <ExitIcon size="18" />
      <hbox class="label">{$t`Exit`}</hbox>
    </button>
  </vbox>
  <vbox flex class="backstage-page">
    {#if $backstageState.page == "options"}
      <vbox flex class="options">
        <SettingsApp />
      </vbox>
    {:else}
      <vbox flex class="info">
        <h1>{$t`Account Information`}</h1>
        <vbox class="accounts">
          {#each $emailAccounts.each as account (account.id)}
            <hbox class="account lo-card">
              <hbox class="account-icon"><AccountIcon size="24" /></hbox>
              <vbox flex class="account-names">
                <hbox class="account-name">{account.name}</hbox>
                <hbox class="account-address lo-secondary">{account.emailAddress ?? ""}</hbox>
              </vbox>
              <button class="action" on:click={() => catchErrors(() => onAccountSettings(account))}>
                <AccountSettingsIcon size="16" />
                {$t`Account Settings`}
              </button>
            </hbox>
          {/each}
        </vbox>
        <hbox>
          <button class="action add" on:click={() => catchErrors(onAddAccount)}>
            <AddIcon size="16" />
            {$t`Add Account`}
          </button>
        </hbox>
      </vbox>
    {/if}
  </vbox>
</hbox>
<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import { backstageState } from "./BackstageState";
  import type { MailAccount } from "../../logic/Mail/MailAccount";
  import { appGlobal } from "../../logic/app";
  import { goTo } from "../../frontend/AppsBar/selectedApp";
  import { openSettingsCategoryForAccount } from "../../frontend/Settings/Window/CategoriesUtils";
  import SettingsApp from "../../frontend/Settings/Window/SettingsApp.svelte";
  import { catchErrors } from "../../frontend/Util/error";
  import BackIcon from "lucide-svelte/icons/arrow-left";
  import InfoIcon from "lucide-svelte/icons/info";
  import OptionsIcon from "lucide-svelte/icons/sliders-horizontal";
  import ExitIcon from "lucide-svelte/icons/log-out";
  import AccountIcon from "lucide-svelte/icons/mail";
  import AccountSettingsIcon from "lucide-svelte/icons/settings";
  import AddIcon from "lucide-svelte/icons/plus";
  import { t } from "../../l10n/l10n";

  const emailAccounts = appGlobal.emailAccounts;

  function onBack() {
    backstageState.close();
  }

  function onAddAccount() {
    backstageState.close();
    goTo("/setup/mail", {});
  }

  function onAccountSettings(account: MailAccount) {
    backstageState.close();
    openSettingsCategoryForAccount(account);
  }

  function onExit() {
    window.close();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key == "Escape") {
      backstageState.close();
    }
  }
</script>

<style>
  .backstage {
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    min-height: 0;
  }
  .backstage-nav {
    flex: 0 0 auto;
    width: 200px;
    padding: 8px 0;
    background-color: var(--lo-backstage-nav-bg);
    color: var(--lo-backstage-nav-fg);
  }
  .nav-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    height: 40px;
    padding: 0 20px;
    border: none;
    background-color: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 15px;
    text-align: start;
  }
  .nav-item.back {
    width: 40px;
    height: 40px;
    margin: 0 0 12px 8px;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
  }
  .nav-item:hover {
    background-color: var(--lo-backstage-nav-hover-bg);
  }
  .nav-item.selected {
    background-color: var(--lo-backstage-nav-selected-bg);
    font-weight: 600;
  }
  .backstage-page {
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }
  .info {
    padding: 24px 40px;
    gap: 16px;
    max-width: 760px;
  }
  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 300;
  }
  .accounts {
    gap: 8px;
  }
  .account {
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid var(--lo-border);
    box-shadow: none;
  }
  .account-icon {
    color: var(--lo-accent-text);
  }
  .account-name {
    font-weight: 600;
  }
  .account-address {
    font-size: var(--lo-font-size-small);
  }
  .action {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font-family: inherit;
    font-size: var(--lo-font-size);
  }
  .action:hover {
    background-color: var(--lo-hover-bg);
  }
  .action.add {
    background-color: var(--lo-accent);
    border-color: var(--lo-accent);
    color: var(--lo-accent-fg);
  }
  .action.add:hover {
    background-color: var(--lo-accent-hover);
  }
</style>
