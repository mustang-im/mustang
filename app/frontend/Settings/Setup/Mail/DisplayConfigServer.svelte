<hbox class="direction">
  {#if outgoing}
    <ArrowLeftIcon size={16} />
  {:else}
    <ArrowRightIcon size={16} />
  {/if}
</hbox>
<hbox class="protocol">{config.protocol}</hbox>
<hbox class="hostname"><HostnameDomain hostname={config.hostname} />{isStandardPort(config) ? "" : ":" + config.port}</hbox>
<hbox class="tls" class:has-encryption={hasEnc}>
  {socketLabel(config.tls)}
</hbox>
<hbox class="tls-icon" class:has-encryption={hasEnc}>
  {#if hasEnc}
    <ShieldOKIcon size={16} />
  {:else}
    <ShieldAlertIcon size={20} />
  {/if}
</hbox>
{#if tlsWarning}
  <hbox class="tls-warning">
    {tlsWarning}
  </hbox>
{:else}
  <hbox></hbox>
{/if}

<script lang="ts">
  import { type MailAccount, TLSSocketType } from "../../../../logic/Mail/MailAccount";
  import { isStandardPort, hasEncryption } from "../../../../logic/Mail/AutoConfig/configInfo";
  import HostnameDomain from "../Shared/HostnameDomain.svelte";
  import ShieldOKIcon from "lucide-svelte/icons/shield-check";
  import ShieldAlertIcon from "lucide-svelte/icons/shield-alert";
  import ArrowLeftIcon from "lucide-svelte/icons/arrow-big-left";
  import ArrowRightIcon from "lucide-svelte/icons/arrow-big-right";

  /** in */
  export let config: MailAccount;

  $: outgoing = config.protocol == "smtp";
  $: hasEnc = hasEncryption(config.tls);
  $: tlsWarning = !hasEncryption(config.tls) ? "Attackers can read your password and mails" : null;

  function socketLabel(tls: TLSSocketType): string {
    if (tls == TLSSocketType.TLS) {
      return "TLS";
    } else if (tls == TLSSocketType.STARTTLS) {
      return "STARTTLS";
    } else if (tls == TLSSocketType.Plain) {
      return "No encryption";
    } else {
      return "Unknown";
    }
  }
</script>

<style>
  .direction {
    margin-right: 4px;
  }
  .protocol {
    text-transform: uppercase;
  }
  .protocol, .tls {
    opacity: 60%;
  }
  .hostname {
    margin-left: 16px;
    margin-right: 16px;
  }
  .tls-icon {
    margin-left: 6px;
    color: green;
  }
  .tls-icon:not(.has-encryption) {
    color: red;
  }
  .tls-warning {
    color: red;
  }
</style>
