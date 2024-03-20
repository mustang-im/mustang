<vbox>
  <h2>Manual configuration</h2>
  <grid class="manual-config">
    <hbox class="direction"><ArrowRightIcon /></hbox>
    <hbox class="protocol">{config.protocol}</hbox>
    <hbox class="hostname">{config.hostname}{portLabel(config)}</hbox>
    <hbox class="tls-icon">
      {#if noEncryption(config.tls)}
        <ShieldAlertIcon />
      {:else}
        <ShieldOKIcon />
      {/if}
    </hbox>
    <hbox class="tls" class:noencryption={noEncryption(config.tls)}>
      {socketLabel(config.tls)}
    </hbox>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import ShieldOKIcon from "lucide-svelte/icons/shield-check";
  import ShieldAlertIcon from "lucide-svelte/icons/shield-alert";
  import ArrowLeftIcon from "lucide-svelte/icons/arrow-big-left";
  import ArrowRightIcon from "lucide-svelte/icons/arrow-big-right";
  import { noEncryption, portLabel, socketLabel } from "./DisplayConfig";

  /** in */
  export let config: MailAccount;

  $: console.log("manual config", config);
</script>

<style>
  .protocol {
    text-transform: uppercase;
  }
  .tls {
    text-transform: uppercase;
  }
</style>
