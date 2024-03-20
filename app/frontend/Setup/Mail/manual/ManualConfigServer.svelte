<grid class="manual-config">
  <hbox class="label">Protocol</hbox>
  <hbox class="protocol">{config.protocol}</hbox>

  <hbox class="label">Hostname</hbox>
  <hbox class="hostname">
    <input type="text" bind:value={config.hostname} />
  </hbox>

  <hbox class="label">Port</hbox>
  <hbox class="port">
    <input type="number" bind:value={config.port} />
  </hbox>

  <hbox class="label">Connection encryption</hbox>
  <hbox>
    <select bind:value={config.tls}>
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
  <hbox>
    <select bind:value={config.authMethod}>
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
</grid>

<script lang="ts">
  import { TLSSocketType, type MailAccount, AuthMethod } from "../../../../logic/Mail/MailAccount";
  import ShieldOKIcon from "lucide-svelte/icons/shield-check";
  import ShieldAlertIcon from "lucide-svelte/icons/shield-alert";

  /** in */
  export let config: MailAccount;

  export function noEncryption(tls: TLSSocketType): boolean {
    return tls != TLSSocketType.TLS && tls != TLSSocketType.STARTTLS;
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
</style>
