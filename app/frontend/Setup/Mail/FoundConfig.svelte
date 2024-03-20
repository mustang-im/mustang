<StatusMessage status="success"
  message="We found the configuration in our database.">
  <CheckIcon slot="icon" />
</StatusMessage>

<hbox class="display">
  <DisplayConfig {config} />
</hbox>

{#if $alternativeConfigs.hasItems}
  {#each $alternativeConfigs.each as altConfig}
    <hbox>(o) Alternative</hbox>
    <DisplayConfig config={altConfig} />
  {/each}
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import DisplayConfig from "./DisplayConfig.svelte";
  import StatusMessage from "./StatusMessage.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import type { ArrayColl } from "svelte-collections";

  export let config: MailAccount;
  export let altConfigs: ArrayColl<MailAccount>;

  $: alternativeConfigs = altConfigs?.filter(c => c != config);
</script>

<style>
  .display {
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 24px;
  }
</style>
