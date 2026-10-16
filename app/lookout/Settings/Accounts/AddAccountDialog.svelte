<Dialog title={$t`Add Account`} width="600px" on:close={onClose}>
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
    {:else if flow.step == AddAccountStep.Searching || flow.step == AddAccountStep.Checking}
      <vbox class="progress-page">
        <span class="progress-title">
          {flow.step == AddAccountStep.Searching ? $t`Looking for the settings of ${flow.domain}…` : $t`Adding ${flow.emailAddress}…`}
        </span>
        <div class="progress-bar"><div class="progress-value" /></div>
      </vbox>
    {:else if flow.step == AddAccountStep.Password}
      <vbox class="account-head">
        {#if flow.config}
          <span class="type">{AccountLabels.typeLabel(flow.config)}</span>
        {/if}
        <hbox class="who">
          <span>{flow.emailAddress}</span>
          <button class="link" on:click={startOver}>{$t`(Not you?)`}</button>
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
        {/if}
        {#if flow.draft.outgoing}
          <label for="manual-outgoing">{$t`Outgoing mail server (SMTP):`}</label>
          <input id="manual-outgoing" class="lo-text-field" bind:value={flow.draft.outgoing.hostname} />
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
      </FormGrid>
    {:else if flow.step == AddAccountStep.Done}
      <vbox class="done">
        <span class="done-icon"><DoneIcon size="40" /></span>
        <span class="done-title">{$t`Account successfully added`}</span>
        <hbox class="done-account">
          <MailIcon size="20" />
          <vbox>
            <span>{flow.emailAddress}</span>
            <span class="lo-secondary">{AccountLabels.typeLabel(flow.config)}</span>
          </vbox>
        </hbox>
        <button class="link" on:click={startOver}>{$t`Add another email address`}</button>
      </vbox>
    {/if}
  </vbox>
  <svelte:fragment slot="footer">
    {#if flow.step == AddAccountStep.Manual && !flow.usesURL}
      <DialogButton label={$t`More Settings…`} onClick={() => { isMoreSettingsOpen = true; }} />
    {/if}
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
    {#if flow.step == AddAccountStep.Done}
      <DialogButton label={$t`Done`} primary onClick={onClose} />
    {:else}
      <DialogButton label={$t`Cancel`} onClick={onClose} />
    {/if}
  </svelte:fragment>
</Dialog>

{#if isMoreSettingsOpen && flow.draft}
  <InternetEmailSettingsDialog draft={flow.draft} on:close={() => { isMoreSettingsOpen = false; }} />
{/if}

<script lang="ts">
  import { AddAccountFlow, AddAccountStep } from "./AddAccountFlow";
  import { AccountLabels } from "./AccountLabels";
  import { appName } from "../../../logic/build";
  import { AuthMethod } from "../../../logic/Abstract/Account";
  import { listMailProtocols, labelForMailProtocol } from "../../../logic/Mail/AccountsList/MailAccounts";
  import { showError } from "../../../frontend/Util/error";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import InternetEmailSettingsDialog from "./InternetEmailSettingsDialog.svelte";
  import { MessageBox } from "../../Shared/Dialog/MessageBox";
  import OAuth2EmbeddedBrowser from "../../../frontend/Shared/Auth/OAuth2EmbeddedBrowser.svelte";
  import logo from "../../../frontend/asset/icon/general/logo.svg?raw";
  import ExpandIcon from "lucide-svelte/icons/chevron-down";
  import CollapseIcon from "lucide-svelte/icons/chevron-up";
  import DoneIcon from "lucide-svelte/icons/circle-check";
  import MailIcon from "lucide-svelte/icons/mail";
  import { createEventDispatcher, onDestroy } from "svelte";
  import { t } from "../../../l10n/l10n";

  const dispatch = createEventDispatcher<{ close: void }>();
  const accountTypes = listMailProtocols().map(protocol => ({ value: protocol, label: labelForMailProtocol(protocol) }));

  let flow = new AddAccountFlow();

  $: logonMethods = [
    { value: AuthMethod.Password, label: $t`Password` },
    ...(flow.config?.protocol == "ews" ? [{ value: AuthMethod.NTLM, label: "NTLM" }] : []),
    { value: AuthMethod.OAuth2, label: $t`OAuth2 / MFA *=> Multi-factor authentication` },
  ];
  let showAdvanced = false;
  let isMoreSettingsOpen = false;

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
    let pending = flow.loginWithOAuth2();
    await Promise.resolve();
    flow = flow;
    try {
      await pending;
    } finally {
      flow = flow;
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

  function startOver() {
    flow.cancel();
    let emailAddress = flow.step == AddAccountStep.Done ? "" : flow.emailAddress;
    flow = new AddAccountFlow();
    flow.emailAddress = emailAddress;
  }

  function onClose() {
    flow.cancel();
    dispatch("close");
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
  .progress-bar {
    position: relative;
    height: 4px;
    overflow: hidden;
    border-radius: 2px;
    background-color: var(--lo-divider);
  }
  .progress-value {
    position: absolute;
    width: 30%;
    height: 100%;
    background-color: var(--lo-accent);
    animation: progress 1.4s ease-in-out infinite;
  }
  @keyframes progress {
    from { left: -30%; }
    to { left: 100%; }
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
