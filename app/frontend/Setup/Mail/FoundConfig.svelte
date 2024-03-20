<vbox flex class="results">
  <hbox flex class="message">
    <CheckIcon />
    <vbox>
      <hbox>We found the configuration in our ISP database.</hbox>
    </vbox>
  </hbox>

  <hbox class="display">
    <DisplayConfig {config} />
  </hbox>

  {#if $alternativeConfigs.hasItems}
    {#each $alternativeConfigs.each as altConfig}
      <hbox>(o) Alternative</hbox>
      <DisplayConfig config={altConfig} />
    {/each}
  {/if}
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { ArrayColl } from "svelte-collections";
  import DisplayConfig from "./DisplayConfig.svelte";
  import CheckIcon from "lucide-svelte/icons/check";

  export let config: MailAccount;
  export let altConfigs: ArrayColl<MailAccount>;

  $: alternativeConfigs = altConfigs?.filter(c => c != config);
</script>

<style>
  .message {
    margin-left: 8px;
    margin-right: 24px;
    padding: 4px 24px;
    border-radius: 16px;
  }
  .results .message {
    padding-left: 16px;
    background-color: #E7F9EC;
    color: #0BC241;
    border: 1px solid #0BC241;
    justify-content: start;
  }
  .results .message :global(svg) {
    margin-right: 6px;
  }
  .display {
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 24px;
  }
</style>
