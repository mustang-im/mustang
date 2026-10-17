<Dialog title={firstRun ? $t`Welcome to ${appName}` : $t`Add Account`} width="600px" on:close={onClose}>
  <vbox class="add-account">
    {#if flow.step == AddAccountStep.EMailAddress}
      <vbox class="brand">
        <span class="logo">{@html logo}</span>
        <span class="app-name">{appName}</span>
      </vbox>
      <vbox class="field">
        <label for="add-account-email">{$t`Email address`}</label>
        <input id="add-account-email" type="email" class="lo-text-field" bind:value={flow.emailAddress}
          autofocus on:keydown={event => event.key == "Enter" && run(connect)} />
      </vbox>
      <button class="advanced" on:click={() => { showAdvanced = !showAdvanced; }} aria-expanded={showAdvanced}>
        {$t`Advanced options`}
        <svelte:component this={showAdvanced ? CollapseIcon : ExpandIcon} size="14" />
      </button>
      {#if showAdvanced}
        <CheckBox label={$t`Let me set up my account manually`} bind:checked={flow.isManual} />
      {/if}
      <hbox flex />
      <button class="link import" on:click={openImport}>
        {hasThunderbird ? $t`Import your accounts and contacts from Thunderbird…` : $t`Import from another program…`}
      </button>
    {:else if flow.step == AddAccountStep.Searching || flow.step == AddAccountStep.Checking}
      <vbox class="progress-page">
        <span class="progress-title">
          {flow.step == AddAccountStep.Searching ? $t`Looking for the settings of ${flow.domain}…` : $t`Adding ${flow.emailAddress}…`}
        </span>
        <ProgressBar />
      </vbox>
    {:else if flow.step == AddAccountStep.Password}
      <vbox class="account-head">
        {#if flow.config}
          <span class="type">{AccountLabels.typeLabel(flow.config)}</span>
        {/if}
        <hbox class="who">
          <span>{flow.emailAddress}</span>
          {#if !flow.isPrepared}
            <button class="link" on:click={startOver}>{$t`(Not you?)`}</button>
          {:else if flow.preparedCount > 1}
            <span class="lo-secondary">{$t`(Account ${flow.preparedNumber} of ${flow.preparedCount})`}</span>
          {/if}
        </hbox>
      </vbox>
      {#if flow.notice}
        <hbox class="notice">{flow.notice}</hbox>
      {/if}
      {#if flow.instructions.length}
        <ol class="instructions">
          {#each flow.instructions as instruction}
            <li>
              {#if instruction.url}
                <a href={instruction.url} target="_blank">{instruction.instruction || $t`Open the account settings of ${flow.config.name}`}</a>
              {:else if instruction.enterUsername}
                <vbox class="field">
                  <label for="add-account-username">{instruction.instruction || $t`User Name`}</label>
                  <input id="add-account-username" class="lo-text-field" bind:value={flow.config.username} />
                </vbox>
              {:else if !instruction.enterPassword}
                {instruction.instruction}
              {/if}
            </li>
          {/each}
        </ol>
      {/if}
      <vbox class="field">
        <label for="add-account-password">{$t`Password`}</label>
        <input id="add-account-password" type="password" class="lo-text-field" bind:value={flow.password}
          autofocus on:keydown={event => event.key == "Enter" && run(submitPassword)} />
      </vbox>
    {:else if flow.step == AddAccountStep.Login}
      <vbox class="account-head">
        <span class="type">{AccountLabels.typeLabel(flow.config)}</span>
        <span>{flow.emailAddress}</span>
      </vbox>
      <vbox class="browser">
        {#if flow.embed}
          <OAuth2EmbeddedBrowser dialog={flow.embed} withURLbar={false} />
        {:else}
          <span class="lo-secondary">{$t`Opening the sign-in page of your provider…`}</span>
        {/if}
      </vbox>
    {:else if flow.step == AddAccountStep.Manual && flow.draft}
      <h2>{flow.usesURL ? $t`${labelForMailProtocol(flow.config.protocol)} Account Settings` : $t`POP and IMAP Account Settings`}</h2>
      {#if flow.notice}
        <hbox class="notice">{flow.notice}</hbox>
      {/if}
      <FormGrid columns="220px minmax(0, 1fr)">
        <span class="section">{$t`User Information`}</span>
        <label for="manual-name">{$t`Your Name:`}</label>
        <input id="manual-name" class="lo-text-field" bind:value={flow.draft.realname} />
        <label for="manual-email">{$t`Email Address:`}</label>
        <input id="manual-email" class="lo-text-field" type="email" bind:value={flow.draft.emailAddress} />
        <span class="section">{$t`Server Information`}</span>
        <span>{$t`Account Type:`}</span>
        <ComboBox options={accountTypes} value={flow.config.protocol} label={$t`Account Type`}
          onChange={protocol => { flow.setAccountType(protocol); flow = flow; }} />
        {#if flow.usesURL}
          <label for="manual-url">{$t`Server URL:`}</label>
          <input id="manual-url" class="lo-text-field" type="url" bind:value={flow.draft.incoming.url} />
        {:else}
          <label for="manual-incoming">{$t`Incoming mail server:`}</label>
          <input id="manual-incoming" class="lo-text-field" bind:value={flow.draft.incoming.hostname} />
          <label for="manual-incoming-port" class="indented">{$t`Port and encryption:`}</label>
          <hbox class="port-row">
            <input id="manual-incoming-port" class="lo-text-field port" type="number" min="1" max="65535" bind:value={flow.draft.incoming.port} />
            <ComboBox options={tlsChoices} value={flow.draft.incoming.tls} label={$t`Encrypted connection of the incoming server`}
              onChange={tls => { flow.draft.incoming.setTLS(tls); flow = flow; }} />
          </hbox>
        {/if}
        {#if flow.draft.outgoing}
          <label for="manual-outgoing">{$t`Outgoing mail server (SMTP):`}</label>
          <input id="manual-outgoing" class="lo-text-field" bind:value={flow.draft.outgoing.hostname} />
          <label for="manual-outgoing-port" class="indented">{$t`Port and encryption:`}</label>
          <hbox class="port-row">
            <input id="manual-outgoing-port" class="lo-text-field port" type="number" min="1" max="65535" bind:value={flow.draft.outgoing.port} />
            <ComboBox options={tlsChoices} value={flow.draft.outgoing.tls} label={$t`Encrypted connection of the outgoing server`}
              onChange={tls => { flow.draft.outgoing.setTLS(tls); flow = flow; }} />
          </hbox>
        {/if}
        <span class="section">{$t`Logon Information`}</span>
        {#if flow.usesURL}
          <span>{$t`Logon method:`}</span>
          <ComboBox options={logonMethods} bind:value={flow.draft.incoming.authMethod} label={$t`Logon method`} />
        {/if}
        <label for="manual-username">{$t`User Name:`}</label>
        <input id="manual-username" class="lo-text-field" bind:value={flow.draft.incoming.username} />
        {#if flow.draft.incoming.authMethod != AuthMethod.OAuth2}
          <label for="manual-password">{$t`Password:`}</label>
          <input id="manual-password" class="lo-text-field" type="password" bind:value={flow.draft.incoming.password} />
        {/if}
        {#if flow.draft.outgoing && !flow.usesURL}
          <span />
          <CheckBox label={$t`My outgoing server (SMTP) requires authentication`} bind:checked={flow.draft.outgoing.requiresAuthentication} />
          {#if flow.draft.outgoing.requiresAuthentication}
            <span class="indented">{$t`Log on using:`}</span>
            <ComboBox options={outgoingAuthMethods} bind:value={flow.draft.outgoing.authMethod} label={$t`Log on using`} />
            {#if flow.draft.outgoing.authMethod != AuthMethod.OAuth2}
              <label for="manual-outgoing-username" class="indented">{$t`Outgoing user name:`}</label>
              <input id="manual-outgoing-username" class="lo-text-field" bind:value={flow.draft.outgoing.username} />
              <label for="manual-outgoing-password" class="indented">{$t`Outgoing password:`}</label>
              <input id="manual-outgoing-password" class="lo-text-field" type="password" bind:value={flow.draft.outgoing.password} />
            {/if}
          {/if}
        {/if}
      </FormGrid>
    {:else if flow.step == AddAccountStep.Done}
      <vbox class="done">
        <span class="done-icon"><DoneIcon size="40" /></span>
        <span class="done-title">{flow.added.length > 1 ? $t`Accounts successfully added` : $t`Account successfully added`}</span>
        {#each flow.added as account}
          <hbox class="done-account">
            <MailIcon size="20" />
            <vbox>
              <span>{account.emailAddress}</span>
              <span class="lo-secondary">{AccountLabels.typeLabel(account)}</span>
            </vbox>
          </hbox>
        {/each}
        <button class="link" on:click={startOver}>{$t`Add another email address`}</button>
      </vbox>
    {/if}
  </vbox>
  <svelte:fragment slot="footer">
    <hbox flex />
    {#if flow.step == AddAccountStep.EMailAddress}
      <DialogButton label={$t`Connect`} primary onClick={connect}
        disabled={!flow.isEMailAddressValid && $t`Enter your email address`} />
    {:else if flow.step == AddAccountStep.Password}
      <DialogButton label={$t`Connect`} primary onClick={submitPassword}
        disabled={!flow.password && $t`Enter your password`} />
    {:else if flow.step == AddAccountStep.Manual}
      <DialogButton label={$t`Next`} primary onClick={finish} />
    {/if}
    {#if flow.isPrepared && (flow.step == AddAccountStep.Password || flow.step == AddAccountStep.Login)}
      <DialogButton label={$t`Skip`} onClick={skip} />
    {/if}
    {#if flow.step == AddAccountStep.Done}
      <DialogButton label={$t`Done`} primary onClick={onClose} />
    {:else}
      <DialogButton label={$t`Cancel`} onClick={onClose} />
    {/if}
  </svelte:fragment>
</Dialog>


<script lang="ts">
  import { AddAccountFlow, AddAccountStep } from "./AddAccountFlow";
  import { AccountLabels } from "../../Settings/Shared/AccountLabels";
  import { appName } from "../../../logic/build";
  import { AuthMethod } from "../../../logic/Abstract/Account";
  import { listMailProtocols, labelForMailProtocol } from "../../../logic/Mail/AccountsList/MailAccounts";
  import { backgroundError, showError } from "../../../frontend/Util/error";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import { TLSSocketType } from "../../../logic/Abstract/TCPAccount";
  import ProgressBar from "../../Settings/Shared/ProgressBar.svelte";
  import { MessageBox } from "../../Shared/Dialog/MessageBox";
  import OAuth2EmbeddedBrowser from "../../../frontend/Shared/Auth/OAuth2EmbeddedBrowser.svelte";
  import logo from "../../../frontend/asset/icon/general/logo.svg?raw";
  import ExpandIcon from "lucide-svelte/icons/chevron-down";
  import CollapseIcon from "lucide-svelte/icons/chevron-up";
  import DoneIcon from "lucide-svelte/icons/circle-check";
  import MailIcon from "lucide-svelte/icons/mail";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { SettingsDialogs } from "../../Settings/SettingsDialogs";
  import { ThunderbirdImport } from "../../Settings/ImportExport/ThunderbirdImport";
  import { openApp } from "../../../frontend/AppsBar/selectedApp";
  import { mailMustangApp } from "../../../frontend/Mail/MailMustangApp";
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

  const dispatch = createEventDispatcher<{ close: void }>();
  const accountTypes = listMailProtocols().map(protocol => ({ value: protocol, label: labelForMailProtocol(protocol) }));

  export let prepared: MailAccount[] = [];
  export let firstRun = false;

  let flow = new AddAccountFlow(prepared ?? []);

  $: logonMethods = [
    { value: AuthMethod.Password, label: $t`Password` },
    ...(flow.config?.protocol == "ews" ? [{ value: AuthMethod.NTLM, label: "NTLM" }] : []),
    { value: AuthMethod.OAuth2, label: $t`OAuth2 / MFA *=> Multi-factor authentication` },
  ];
  $: tlsChoices = [
    { value: TLSSocketType.Plain, label: $t`None` },
    { value: TLSSocketType.TLS, label: "SSL/TLS" },
    { value: TLSSocketType.STARTTLS, label: "STARTTLS" },
  ];
  $: outgoingAuthMethods = [
    { value: AuthMethod.Password, label: $t`Password` },
    { value: AuthMethod.OAuth2, label: $t`Sign-in page of the provider (OAuth2)` },
    { value: AuthMethod.CRAMMD5, label: "CRAM-MD5" },
  ];
  let showAdvanced = false;

  let hasThunderbird = false;
  onMount(() => {
    if (flow.step == AddAccountStep.Login) {
      run(login);
    }
    if (firstRun) {
      findThunderbird().catch(backgroundError);
    }
  });

  async function findThunderbird() {
    hasThunderbird = await ThunderbirdImport.isThunderbirdInstalled();
  }
  onDestroy(() => flow.cancel());

  function run(action: () => Promise<void>) {
    action().catch(showError);
  }

  async function confirmRedirect(emailAddress: string, redirectDomain: string): Promise<boolean> {
    return await MessageBox.confirm($t`Add Account`,
      $t`Allow ${redirectDomain} to configure the server settings of ${emailAddress}? Your account was redirected to this website for its settings, and your password will be sent there. You should only allow settings from sources you know and trust.`,
      $t`Allow`, $t`Cancel`);
  }

  async function connect() {
    let pending = flow.connect(confirmRedirect);
    flow = flow;
    try {
      await pending;
    } finally {
      flow = flow;
    }
    if (flow.step == AddAccountStep.Login) {
      run(login);
    }
  }

  async function login() {
    let config = flow.config;
    let pending = flow.loginWithOAuth2();
    await Promise.resolve();
    flow = flow;
    try {
      await pending;
    } catch (ex) {
      if (flow.config == config) {
        throw ex;
      }
      return;
    } finally {
      flow = flow;
    }
    if (flow.step == AddAccountStep.Login && flow.config != config) {
      run(login);
    }
  }

  async function submitPassword() {
    let pending = flow.submitPassword(confirmRedirect);
    flow = flow;
    try {
      await pending;
    } finally {
      flow = flow;
    }
    if (flow.step == AddAccountStep.Login) {
      run(login);
    }
  }

  async function finish() {
    let pending = flow.finish();
    flow = flow;
    try {
      await pending;
    } finally {
      flow = flow;
    }
    if (flow.step == AddAccountStep.Login) {
      run(login);
    }
  }

  function skip() {
    flow.skip();
    flow = flow;
    if (flow.step == AddAccountStep.Login) {
      run(login);
    }
  }

  function openImport() {
    flow.cancel();
    SettingsDialogs.openImportFromProgram(firstRun);
  }

  function startOver() {
    flow.cancel();
    let emailAddress = flow.step == AddAccountStep.Done ? "" : flow.emailAddress;
    flow = new AddAccountFlow();
    flow.emailAddress = emailAddress;
  }

  function onClose() {
    flow.cancel();
    dispatch("close");
    if (firstRun && flow.added.length) {
      // <copied from="../../../frontend/Setup/Mail/SetupPredefinedMail.svelte" onClose()>
      openApp(mailMustangApp, { account: flow.added[0] });
      // </copied>
    }
  }
</script>

<style>
  .add-account {
    gap: 12px;
    min-height: 320px;
  }
  .brand {
    align-items: center;
    gap: 8px;
    margin-block: 24px 32px;
  }
  .logo {
    display: flex;
    width: 64px;
    height: 64px;
  }
  .logo :global(svg) {
    width: 100%;
    height: 100%;
  }
  .logo :global(.horse),
  .logo :global(.circle-bars) {
    fill: var(--lo-accent);
    stroke: var(--lo-accent);
  }
  .app-name {
    font-size: 32px;
    font-weight: 300;
    color: var(--lo-accent-text);
  }
  .field {
    gap: 4px;
  }
  .import {
    align-self: center;
    margin-block-start: 24px;
  }
  .advanced {
    align-self: center;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: none;
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  .progress-page {
    flex: 1;
    justify-content: center;
    gap: 16px;
  }
  .progress-title {
    font-size: 16px;
  }
  .account-head {
    gap: 2px;
  }
  .type {
    font-size: 20px;
    font-weight: 300;
  }
  .who {
    align-items: center;
    gap: 8px;
  }
  .link {
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    cursor: pointer;
  }
  .link:hover {
    text-decoration: underline;
  }
  .browser {
    flex: 1;
    min-height: 360px;
  }
  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  .notice {
    padding: 8px 12px;
    border-radius: var(--lo-radius-small);
    background-color: color-mix(in srgb, var(--lo-warning) 15%, var(--lo-pane-bg));
  }
  .section {
    grid-column: 1 / -1;
    margin-block-start: 6px;
    font-weight: 600;
  }
  .indented {
    padding-inline-start: 16px;
  }
  .port-row {
    align-items: center;
    gap: 8px;
  }
  .port-row :global(.lo-combobox) {
    flex: 1 1 0;
    min-width: 0;
  }
  input.port {
    width: 90px;
  }
  .instructions {
    margin: 0;
    padding-inline-start: 20px;
  }
  .instructions li {
    margin-block-end: 8px;
  }
  .instructions a {
    color: var(--lo-accent-text);
  }
  .done {
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .done-icon {
    color: var(--lo-success);
  }
  .done-title {
    font-size: 20px;
    font-weight: 300;
  }
  .done-account {
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
  }
</style>
