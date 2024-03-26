<grid class="manual-config">
  <hbox class="label">Protocol</hbox>
  <hbox class="protocol">{config.protocol}</hbox>

  <hbox class="label">Hostname</hbox>
  <hbox class="hostname" class:error={hostnameError}>
    <input type="text" bind:value={config.hostname} required />
  </hbox>

  {#if !stepHostname}
    <hbox class="label">Port</hbox>
    <hbox class="port" class:error={portError}>
      <input type="number" bind:value={config.port} required on:change={onPortChanged} />
    </hbox>

    <hbox class="label">Connection encryption</hbox>
    <hbox class:error={tlsError}>
      <select bind:value={config.tls} required on:change={onTLSChanged}>
        <option value={TLSSocketType.TLS}>TLS</option>
        <option value={TLSSocketType.STARTTLS}>STARTTLS</option>
        <option value={TLSSocketType.Plain}>Plain</option>
      </select>
      <hbox class="tls-icon">
        {#if noEncryption(config.tls)}
          <ShieldAlertIcon />
        {:else}
          <ShieldOKIcon />
        {/if}
      </hbox>
    </hbox>

    <hbox class="label">Authentication method</hbox>
    <hbox class:error={authError}>
      <select bind:value={config.authMethod} required>
        <option value={AuthMethod.Password}>Password</option>
        <option value={AuthMethod.OAuth2}>OAuth2 / Multi-factor authentication</option>
        <option value={AuthMethod.GSSAPI}>Kerberos / GSSAPI</option>
        <option value={AuthMethod.CRAMMD5}>CRAM MD5</option>
        <option value={AuthMethod.NTLM}>NTLM</option>
      </select>
    </hbox>

    <hbox class="label">Username</hbox>
    <hbox class="username">
      <input type="text" bind:value={config.username} />
    </hbox>
  {/if}
</grid>

<script lang="ts">
  import { TLSSocketType, type MailAccount, AuthMethod } from "../../../../logic/Mail/MailAccount";
  import ShieldOKIcon from "lucide-svelte/icons/shield-check";
  import ShieldAlertIcon from "lucide-svelte/icons/shield-alert";
  import { kStandardPorts } from "../../../../logic/Mail/AutoConfig/configInfo";

  /** in */
  export let config: MailAccount;

  function noEncryption(tls: TLSSocketType): boolean {
    return tls != TLSSocketType.TLS && tls != TLSSocketType.STARTTLS;
  }

  function onTLSChanged() {
    let newP = kStandardPorts.find(p => p.protocol == config.protocol && p.tls == config.tls);
    let oldIsStandardPort = kStandardPorts.find(p => p.port == config.port); // even if wrong protocol, i.e. confused user
    let oldPortStillValid = kStandardPorts.find(p => p.port == config.port && p.protocol == config.protocol && p.tls == config.tls); // Port 25, TLS changed -> keep port
    if (newP && (oldIsStandardPort && !oldPortStillValid || !config.port)) {
      config.port = newP.port;
    }
  }

  function onPortChanged() {
    let alreadyIsStandardPort = kStandardPorts.find(p => p.protocol == config.protocol && p.port == config.port && p.tls == config.tls);
    let newPreferred = kStandardPorts.find(p => p.protocol == config.protocol && p.port == config.port);
    if (newPreferred && !alreadyIsStandardPort) {
      config.tls = newPreferred.tls;
    }
  }

  let stepHostname = true;
  let hostnameError: Error | null = null;
  let portError: Error | null = null;
  let tlsError: Error | null = null;
  let authError: Error | null = null;

  /** User just pressed the [Next] button
   * @returns true = can continue, false or exception: Don't continue
   */
  export async function onContinue(): Promise<boolean> {
    if (!config.hostname) {
      hostnameError = new Error("Please enter the correct hostname");
      throw hostnameError;
    } else {
      hostnameError = null;
    }
    if (stepHostname) {
      stepHostname = false;
      return false;
    }
    if (!config.port) {
      portError = new Error("Please enter the correct port number");
      throw portError;
    } else {
      portError = null;
    }
    if (config.tls == TLSSocketType.Unknown) {
      tlsError = new Error("Please set the correct connection encryption");
      throw tlsError;
    } else {
      tlsError = null;
    }
    if (config.authMethod == AuthMethod.Unknown) {
      authError = new Error("Please enter the authentication method");
      throw authError;
    } else {
      authError = null;
    }
    if (config.hostname?.endsWith("example.com")) { // TODO replace with real checks
      throw new Error("example.com is not a real domain");
    }
    return true;
  }
</script>

<style>
  grid {
    grid-template-columns: auto auto;
  }
  grid > * {
    align-items: end;
  }
  .label {
    margin-top: 4px;
  }
  .protocol {
    text-transform: uppercase;
  }
  .port input[type=number] {
    width: 5em;
  }
  .tls {
    text-transform: uppercase;
  }
  .tls-icon {
    margin-left: 4px;
  }
  .error select {
    border: 1px solid red;
  }
  .error input {
    border: 1px solid red;
  }
</style>
