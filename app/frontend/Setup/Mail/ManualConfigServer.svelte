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
    <hbox class="tls" class:noencryption={noEncryption(config.tls)}>
      {socketLabel(config.tls)}
    </hbox>
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
    <hbox class="tls" class:noencryption={noEncryption(config.tls)}>
      {socketLabel(config.tls)}
    </hbox>
  </hbox>

  <hbox class="label">Username</hbox>
  <hbox class="username">
    <input type="text" bind:value={config.username} />
  </hbox>
</grid>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import ShieldOKIcon from "lucide-svelte/icons/shield-check";
  import ShieldAlertIcon from "lucide-svelte/icons/shield-alert";
  import { noEncryption, socketLabel } from "./DisplayConfig";

  /** in */
  export let config: MailAccount;
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
