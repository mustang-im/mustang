<Dialog title={$t`Change Account`}
  okLabel={$t`OK`}
  okDisabled={!!draft.missingField && $t`Please fill in all required fields`}
  onOK={onOK}
  width="720px"
  on:close>
  <vbox class="header-band">
    <span class="heading">{$t`${typeLabel} Account Settings`}</span>
    <span class="lo-secondary">{draft.isMailAccount
      ? $t`Enter the mail server settings for your account.`
      : $t`Enter the settings for this account.`}</span>
  </vbox>
  <hbox class="body">
    <grid class="fields">
      <h3>{$t`User Information`}</h3>
      <label for="change-account-name">{$t`Account name:`}</label>
      <input id="change-account-name" class="lo-text-field" type="text" bind:value={draft.name}
        autofocus={page == "general"} />
      {#if draft.isMailAccount}
        <label for="change-account-realname">{$t`Your Name:`}</label>
        <input id="change-account-realname" class="lo-text-field" type="text" bind:value={draft.realname} />
        <label for="change-account-email">{$t`Email Address:`}</label>
        <input id="change-account-email" class="lo-text-field" type="email" bind:value={draft.emailAddress} />
      {/if}

      {#if draft.hasServer}
        <h3>{$t`Server Information`}</h3>
        <span class="label">{$t`Account Type:`}</span>
        <span class="value">{typeLabel}</span>
        {#if draft.incoming.usesHostname}
          <label for="change-account-incoming">{$t`Incoming mail server:`}</label>
          <input id="change-account-incoming" class="lo-text-field" type="text" bind:value={draft.incoming.hostname}
            autofocus={page == "server"} />
        {:else}
          <label for="change-account-url">{$t`Server address:`}</label>
          <input id="change-account-url" class="lo-text-field" type="url" bind:value={draft.incoming.url}
            autofocus={page == "server"} />
        {/if}
        {#if draft.outgoing}
          <label for="change-account-outgoing">{$t`Outgoing mail server (SMTP):`}</label>
          <input id="change-account-outgoing" class="lo-text-field" type="text" bind:value={draft.outgoing.hostname} />
        {/if}

        <h3>{$t`Logon Information`}</h3>
        {#if draft.incoming.authMethod == AuthMethod.OAuth2}
          <span class="label">{$t`Sign-in:`}</span>
          <span class="value">{$t`With the sign-in page of your provider`}</span>
        {:else if draft.incoming.needsLogin}
          <label for="change-account-username">{$t`User Name:`}</label>
          <input id="change-account-username" class="lo-text-field" type="text" bind:value={draft.incoming.username} />
          <label for="change-account-password">{$t`Password:`}</label>
          <input id="change-account-password" class="lo-text-field" type="password" bind:value={draft.incoming.password} />
        {/if}
      {/if}
    </grid>
    {#if draft.outgoing}
      <vbox class="side">
        <hbox flex />
        <DialogButton label={$t`More Settings…`} onClick={() => { isMoreSettingsOpen = true; }} />
      </vbox>
    {/if}
  </hbox>
</Dialog>

{#if isMoreSettingsOpen}
  <InternetEmailSettingsDialog {draft} on:close={() => isMoreSettingsOpen = false} />
{/if}

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import { AuthMethod } from "../../../logic/Abstract/Account";
  import type { ChangeAccountPage } from "../SettingsDialogs";
  import { AccountDraft } from "./AccountDraft";
  import { AccountLabels } from "./AccountLabels";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import InternetEmailSettingsDialog from "./InternetEmailSettingsDialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: Account;
  export let page: ChangeAccountPage = "general";

  let draft = new AccountDraft(account);
  let isMoreSettingsOpen = false;
  $: typeLabel = AccountLabels.typeLabel(account);

  async function onOK() {
    await draft.save();
  }
</script>

<style>
  .header-band {
    gap: 2px;
    margin: -8px -20px 12px -20px;
    padding: 8px 20px 12px 20px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .heading {
    font-weight: 600;
  }
  .body {
    gap: 24px;
    align-items: stretch;
  }
  grid.fields {
    flex: 1;
    display: grid;
    grid-template-columns: 200px minmax(200px, 1fr);
    align-items: center;
    gap: 8px 12px;
  }
  h3 {
    grid-column: 1 / -1;
    margin: 8px 0 0 0;
    font-size: var(--lo-font-size);
    font-weight: 600;
  }
  h3:first-child {
    margin-block-start: 0;
  }
  .label {
    color: var(--lo-fg);
  }
  .value {
    color: var(--lo-fg-secondary);
  }
  .side {
    flex-shrink: 0;
    width: 168px;
  }
  .side :global(.dialog-button) {
    width: 100%;
  }
</style>
