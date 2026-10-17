<OptionsPage icon={ServerIcon} description={draft.isMailAccount
  ? $t`Enter the mail server settings of ${$account.name}. Your email provider or company can tell you these details.`
  : $t`Enter the server settings of ${$account.name}.`}>
  <OptionsSection title={draft.isMailAccount ? $t`Incoming Mail Server` : $t`Server Information`}>
    <OptionsRow icon={IncomingIcon}>
      <grid class="fields">
        <span>{$t`Account Type:`}</span>
        <span class="value">{AccountLabels.typeLabel(account)}</span>
        {#if draft.incoming.usesHostname}
          <label for="server-incoming">{$t`Server:`}</label>
          <input id="server-incoming" class="lo-text-field" type="text" bind:value={draft.incoming.hostname} required />
          <label for="server-incoming-port">{$t`Port:`}</label>
          <hbox class="port-row">
            <input id="server-incoming-port" class="lo-text-field port" type="number" min="1" max="65535" bind:value={draft.incoming.port} required />
            <DialogButton label={$t`Use Defaults`} onClick={() => { draft.incoming.useDefaultPort(); draft = draft; }} />
          </hbox>
          <span>{$t`Encrypted connection:`}</span>
          <ComboBox options={tlsChoices} value={draft.incoming.tls} label={$t`Encrypted connection of the incoming server`} width="200px"
            onChange={tls => { draft.incoming.setTLS(tls); draft = draft; }} />
        {:else}
          <label for="server-url">{$t`Server address:`}</label>
          <input id="server-url" class="lo-text-field" type="url" bind:value={draft.incoming.url} />
        {/if}
      </grid>
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Logon Information`}>
    <OptionsRow icon={LogonIcon}>
      <grid class="fields">
        {#if draft.incoming.authMethod == AuthMethod.OAuth2}
          <span>{$t`Sign-in:`}</span>
          <span class="value">{$t`With the sign-in page of your provider`}</span>
        {:else if draft.incoming.needsLogin}
          <label for="server-username">{$t`User Name:`}</label>
          <input id="server-username" class="lo-text-field" type="text" bind:value={draft.incoming.username} />
          <label for="server-password">{$t`Password:`}</label>
          <input id="server-password" class="lo-text-field" type="password" bind:value={draft.incoming.password} />
        {:else}
          <span>{$t`Sign-in:`}</span>
          <span class="value">{$t`Not needed`}</span>
        {/if}
      </grid>
    </OptionsRow>
  </OptionsSection>

  {#if draft.outgoing}
    <OptionsSection title={$t`Outgoing Mail Server (SMTP)`}>
      <OptionsRow icon={OutgoingIcon}>
        <grid class="fields">
          <label for="server-outgoing">{$t`Server:`}</label>
          <input id="server-outgoing" class="lo-text-field" type="text" bind:value={draft.outgoing.hostname} required />
          <label for="server-outgoing-port">{$t`Port:`}</label>
          <hbox class="port-row">
            <input id="server-outgoing-port" class="lo-text-field port" type="number" min="1" max="65535" bind:value={draft.outgoing.port} required />
            <DialogButton label={$t`Use Defaults`} onClick={() => { draft.outgoing.useDefaultPort(); draft = draft; }} />
          </hbox>
          <span>{$t`Encrypted connection:`}</span>
          <ComboBox options={tlsChoices} value={draft.outgoing.tls} label={$t`Encrypted connection of the outgoing server`} width="200px"
            onChange={tls => { draft.outgoing.setTLS(tls); draft = draft; }} />
        </grid>
        <CheckBox label={$t`My outgoing server (SMTP) requires authentication`} bind:checked={draft.outgoing.requiresAuthentication} />
        {#if draft.outgoing.requiresAuthentication}
          <grid class="fields indented">
            <span>{$t`Log on using:`}</span>
            <ComboBox options={authChoices} bind:value={draft.outgoing.authMethod} label={$t`Log on using`} width="280px" />
            {#if draft.outgoing.authMethod != AuthMethod.OAuth2}
              <label for="server-outgoing-username">{$t`User Name:`}</label>
              <input id="server-outgoing-username" class="lo-text-field" type="text" bind:value={draft.outgoing.username} />
              <label for="server-outgoing-password">{$t`Password:`}</label>
              <input id="server-outgoing-password" class="lo-text-field" type="password" bind:value={draft.outgoing.password} />
            {/if}
          </grid>
        {/if}
      </OptionsRow>
    </OptionsSection>
  {/if}
</OptionsPage>

<script lang="ts">
  import type { Account } from "../../../../logic/Abstract/Account";
  import { AuthMethod } from "../../../../logic/Abstract/Account";
  import { TLSSocketType } from "../../../../logic/Abstract/TCPAccount";
  import type { AccountDraft } from "../../Accounts/AccountDraft";
  import { AccountLabels } from "../../Accounts/AccountLabels";
  import OptionsPage from "../OptionsPage.svelte";
  import OptionsSection from "../OptionsSection.svelte";
  import OptionsRow from "../OptionsRow.svelte";
  import ComboBox from "../../../Shared/Form/ComboBox.svelte";
  import CheckBox from "../../../Shared/Form/CheckBox.svelte";
  import DialogButton from "../../../Shared/Dialog/DialogButton.svelte";
  import ServerIcon from "lucide-svelte/icons/server-cog";
  import IncomingIcon from "lucide-svelte/icons/inbox";
  import LogonIcon from "lucide-svelte/icons/key-round";
  import OutgoingIcon from "lucide-svelte/icons/send";
  import { t } from "../../../../l10n/l10n";

  export let account: Account;
  export let draft: AccountDraft;

  $: tlsChoices = [
    { value: TLSSocketType.Plain, label: $t`None` },
    { value: TLSSocketType.TLS, label: "SSL/TLS" },
    { value: TLSSocketType.STARTTLS, label: "STARTTLS" },
  ];
  $: authChoices = [
    { value: AuthMethod.Password, label: $t`Password` },
    { value: AuthMethod.OAuth2, label: $t`Sign-in page of the provider (OAuth2)` },
    { value: AuthMethod.CRAMMD5, label: "CRAM-MD5" },
  ];
</script>

<style>
  .fields {
    grid-template-columns: 160px minmax(200px, 360px);
    align-items: center;
    gap: 8px 12px;
  }
  .value {
    color: var(--lo-fg-secondary);
  }
  .port-row {
    align-items: center;
    gap: 8px;
  }
  input.port {
    width: 90px;
  }
</style>
