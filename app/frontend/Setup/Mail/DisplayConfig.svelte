<grid class="result">
  <hbox class="direction"><ArrowRightIcon /></hbox>
  <hbox class="protocol">{config.protocol}</hbox>
  <hbox class="hostname">{config.hostname}{portLabel(config)}</hbox>
  <hbox class="tls-icon" class:noencryption={noEncIn}>
    {#if noEncIn}
      <ShieldAlertIcon size={20} />
    {:else}
      <ShieldOKIcon size={20} />
    {/if}
  </hbox>
  <hbox class="tls" class:noencryption={noEncIn}>
    {socketLabel(config.tls)}
  </hbox>

  <!-- TODO outgoing config -->
  <hbox class="direction"><ArrowLeftIcon /></hbox>
  <hbox class="protocol">SMTP</hbox>
  <hbox class="hostname">{config.hostname}{portLabel(config)}</hbox>
  <hbox class="tls-icon" class:noencryption={noEncOut}>
    {#if noEncOut}
      <ShieldAlertIcon size={20} />
    {:else}
      <ShieldOKIcon size={20} />
    {/if}
  </hbox>
  <hbox class="tls" class:noencryption={noEncOut}>
    {socketLabel(config.tls)}
  </hbox>
</grid>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import ShieldOKIcon from "lucide-svelte/icons/shield-check";
  import ShieldAlertIcon from "lucide-svelte/icons/shield-alert";
  import ArrowLeftIcon from "lucide-svelte/icons/arrow-big-left";
  import ArrowRightIcon from "lucide-svelte/icons/arrow-big-right";
  import { noEncryption, portLabel, socketLabel } from "./DisplayConfig";

  /** in */
  export let config: MailAccount;

  $: console.log("display config", config);

  $: noEncIn = noEncryption(config.tls);
  $: noEncOut = noEncryption(config.tls);
</script>

<style>
  grid.result {
    grid-template-columns: auto auto auto auto auto;
  }
  .direction {
    margin-right: 4px;
  }
  .protocol {
    text-transform: uppercase;
  }
  .hostname {
    margin-left: 16px;
    margin-right: 16px;
  }
  .tls-icon {
    margin-right: 6px;
  }
  .tls-icon.noencryption {
    color: red;
  }
  .tls {
    text-transform: uppercase;
  }
</style>
