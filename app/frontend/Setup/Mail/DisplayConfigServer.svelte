<hbox class="direction">
  {#if outgoing}
    <ArrowLeftIcon size={16} />
  {:else if config.protocol == "imap" || config.protocol == "pop3"}
    <ArrowRightIcon size={16} />
  {/if}
</hbox>
<hbox class="protocol">{labelForMailProtocol(config.protocol)}</hbox>
<hbox class="hostname">
  <HostnameDomain hostname={getHostname(config) ?? ""} />{config instanceof TCPAccount && !isStandardPort(config) ? ":" + config.port : ""}
</hbox>
<hbox class="tls" class:tls-warning={tlsWarning} class:has-encryption={hasEnc}>
  {socketLabel(tls)}
  {#if tlsWarning}
    - {tlsWarning}
  {/if}
</hbox>
<hbox class="tls-icon" class:has-encryption={hasEnc}>
  {#if hasEnc}
    <ShieldOKIcon size={16} />
  {:else}
    <ShieldAlertIcon size={20} />
  {/if}
</hbox>

<script lang="ts">
  import { Account } from "../../../logic/Abstract/Account";
  import { TCPAccount, TLSSocketType } from "../../../logic/Abstract/TCPAccount";
  import { isStandardPort, hasEncryption, getTLS, getHostname } from "../../../logic/Mail/AutoConfig/configInfo";
  import { labelForMailProtocol } from "../../../logic/Mail/AccountsList/MailAccounts";
  import HostnameDomain from "../Shared/HostnameDomain.svelte";
  import ShieldOKIcon from "lucide-svelte/icons/shield-check";
  import ShieldAlertIcon from "lucide-svelte/icons/shield-alert";
  import ArrowLeftIcon from "lucide-svelte/icons/arrow-big-left";
  import ArrowRightIcon from "lucide-svelte/icons/arrow-big-right";
  import { t } from "../../../l10n/l10n";

  /** in */
  export let config: Account;

  $: console.log(config);

  $: tls = getTLS(config);
  $: hasEnc = hasEncryption(tls);
  $: tlsWarning = !hasEncryption(tls) ? $t`Attackers can read your password and mails` : null;
  $: outgoing = config.protocol == "smtp";

  function socketLabel(tls: TLSSocketType): string {
    if (tls == TLSSocketType.TLS) {
      return "TLS";
    } else if (tls == TLSSocketType.STARTTLS) {
      return "STARTTLS";
    } else if (tls == TLSSocketType.Plain) {
      return $t`No encryption`;
    } else {
      return $t`Unknown`;
    }
  }
</script>

<style>
  .direction {
    margin-inline-end: 4px;
  }
  .protocol, .tls {
    opacity: 60%;
  }
  .hostname {
    justify-content: end;
    margin-inline-start: 16px;
    margin-inline-end: 16px;
  }
  .tls-icon {
    margin-inline-start: 6px;
    color: green;
  }
  .tls-icon:not(.has-encryption) {
    color: red;
  }
  .tls-warning {
    color: red;
  }
</style>
