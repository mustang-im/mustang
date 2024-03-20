<StatusMessage status="warning"
  message="Please enter the configuration. Your email provider or company can tell you these details.">
  <ManualConfigIcon slot="icon" />
</StatusMessage>

<vbox>
  <h2>Manual configuration</h2>
  <hbox class="header">
    <hbox class="direction"><ArrowRightIcon /></hbox>
    Incoming server
  </hbox>
  <ManualConfigServer {config} />

  <hbox class="header">
    <hbox class="direction"><ArrowLeftIcon /></hbox>
    Outgoing server
  </hbox>
  <ManualConfigServer config={config.outgoing} />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import ManualConfigServer from "./ManualConfigServer.svelte";
  import StatusMessage from "../StatusMessage.svelte";
  import ManualConfigIcon from "lucide-svelte/icons/router";
  import ArrowLeftIcon from "lucide-svelte/icons/arrow-big-left";
  import ArrowRightIcon from "lucide-svelte/icons/arrow-big-right";

  /** in */
  export let config: MailAccount;
</script>

<style>
  h2 {
    margin-bottom: 0px;
  }
  .header {
    font-weight: bold;
    font-size: 18px;
    margin-top: 24px;
    margin-bottom: 8px;
  }
  .header .direction {
    margin-right: 6px;
  }
</style>
