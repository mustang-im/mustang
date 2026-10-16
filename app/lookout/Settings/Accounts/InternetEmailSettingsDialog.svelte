<Dialog title={$t`Internet Email Settings`}
  okLabel={$t`OK`}
  onOK={onOK}
  width="520px"
  on:close>
  <DialogTabs tabs={[
      { id: "outgoing", label: $t`Outgoing Server` },
      { id: "advanced", label: $t`Advanced` },
    ]}
    bind:selected={tab} />
  <vbox class="tab-page">
    {#if tab == "outgoing" && outgoing}
      <CheckBox label={$t`My outgoing server (SMTP) requires authentication`} bind:checked={outgoingNeedsLogin} />
      <grid class="fields indented" class:disabled={!outgoingNeedsLogin}>
        <label for="outgoing-auth">{$t`Log on using:`}</label>
        <ComboBox options={[
            { value: AuthMethod.Password, label: $t`Password` },
            { value: AuthMethod.OAuth2, label: $t`Sign-in page of the provider (OAuth2)` },
            { value: AuthMethod.CRAMMD5, label: "CRAM-MD5" },
          ]}
          bind:value={outgoingAuthMethod} disabled={!outgoingNeedsLogin} label={$t`Log on using`} />
        {#if outgoingAuthMethod != AuthMethod.OAuth2}
          <label for="outgoing-username">{$t`User Name:`}</label>
          <input id="outgoing-username" class="lo-text-field" type="text" bind:value={outgoingUsername} disabled={!outgoingNeedsLogin} />
          <label for="outgoing-password">{$t`Password:`}</label>
          <input id="outgoing-password" class="lo-text-field" type="password" bind:value={outgoingPassword} disabled={!outgoingNeedsLogin} />
        {/if}
      </grid>
    {:else if tab == "advanced"}
      <h3>{$t`Server Port Numbers`}</h3>
      <grid class="ports">
        <label for="incoming-port">{$t`Incoming server (${protocolLabel(incoming.protocol)}):`}</label>
        <hbox class="port-row">
          <input id="incoming-port" class="lo-text-field port" type="number" min="1" max="65535" bind:value={incomingPort} />
          <DialogButton label={$t`Use Defaults`} onClick={useDefaults} />
        </hbox>
        <label for="incoming-tls" class="indented">{$t`Use the following type of encrypted connection:`}</label>
        <ComboBox options={tlsChoices} bind:value={incomingTLS} label={$t`Encrypted connection of the incoming server`}
          onChange={() => { incomingPort = StandardPorts.afterTLSChange(incoming.protocol, incomingTLS, incomingPort); }} />
        {#if outgoing}
          <label for="outgoing-port">{$t`Outgoing server (SMTP):`}</label>
          <hbox class="port-row">
            <input id="outgoing-port" class="lo-text-field port" type="number" min="1" max="65535" bind:value={outgoingPort} />
          </hbox>
          <label for="outgoing-tls" class="indented">{$t`Use the following type of encrypted connection:`}</label>
          <ComboBox options={tlsChoices} bind:value={outgoingTLS} label={$t`Encrypted connection of the outgoing server`}
            onChange={() => { outgoingPort = StandardPorts.afterTLSChange("smtp", outgoingTLS, outgoingPort); }} />
        {/if}
      </grid>
    {/if}
  </vbox>
</Dialog>

<script lang="ts">
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import { StandardPorts, type AccountDraft } from "./AccountDraft";
  import { AuthMethod } from "../../../logic/Abstract/Account";
  import { TLSSocketType } from "../../../logic/Abstract/TCPAccount";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import DialogTabs from "../../Shared/Dialog/DialogTabs.svelte";
  import { t } from "../../../l10n/l10n";

  export let draft: AccountDraft;

  const incoming = draft.incoming;
  const outgoing = draft.outgoing;
  let tab = outgoing ? "outgoing" : "advanced";

  let incomingPort = incoming.port;
  let incomingTLS = incoming.tls;
  let outgoingPort = outgoing?.port;
  let outgoingTLS = outgoing?.tls;
  let outgoingNeedsLogin = outgoing && outgoing.authMethod != AuthMethod.None;
  let outgoingAuthMethod = outgoing?.authMethod == AuthMethod.None || outgoing?.authMethod == AuthMethod.Unknown
    ? AuthMethod.Password
    : outgoing?.authMethod;
  let outgoingUsername = outgoing?.username;
  let outgoingPassword = outgoing?.password;

  $: tlsChoices = [
    { value: TLSSocketType.Plain, label: $t`None` },
    { value: TLSSocketType.TLS, label: "SSL/TLS" },
    { value: TLSSocketType.STARTTLS, label: "STARTTLS" },
  ];

  function protocolLabel(protocol: string): string {
    return protocol == "pop3" ? "POP3" : protocol.toUpperCase();
  }

  function useDefaults() {
    incomingPort = StandardPorts.portFor(incoming.protocol, incomingTLS) ?? incomingPort;
    if (outgoing) {
      outgoingPort = StandardPorts.portFor("smtp", outgoingTLS) ?? outgoingPort;
    }
  }

  function onOK() {
    incoming.port = incomingPort;
    incoming.tls = incomingTLS;
    if (outgoing) {
      outgoing.port = outgoingPort;
      outgoing.tls = outgoingTLS;
      outgoing.authMethod = outgoingNeedsLogin ? outgoingAuthMethod : AuthMethod.None;
      outgoing.username = outgoingUsername;
      outgoing.password = outgoingPassword;
    }
  }
</script>

<style>
  .tab-page {
    gap: 8px;
    min-height: 220px;
    padding-block-start: 16px;
  }
  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .indented {
    padding-inline-start: 24px;
  }
  grid.fields {
    display: grid;
    grid-template-columns: 140px 1fr;
    align-items: center;
    gap: 8px 12px;
  }
  grid.fields.disabled label {
    color: var(--lo-fg-disabled);
  }
  h3 {
    margin: 0;
    font-size: var(--lo-font-size);
    font-weight: 600;
  }
  grid.ports {
    display: grid;
    grid-template-columns: 1fr max-content;
    align-items: center;
    gap: 8px 12px;
  }
  .port-row {
    align-items: center;
    gap: 8px;
  }
  input.port {
    width: 80px;
  }
  grid.ports select {
    width: 140px;
  }
</style>
