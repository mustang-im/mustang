<hbox flex class="checking">
  <Spinner size="24px" />
  <hbox flex class="message">
    Verifying that the configuration works...
  </hbox>
</hbox>

<hbox class="display">
  <DisplayConfig {config} />
</hbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import DisplayConfig from "./DisplayConfig.svelte";
  import Spinner from "./Spinner.svelte";
  import { sleep } from "../../../logic/util/util";
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatchEvent = createEventDispatcher();

  /** in */
  export let config: MailAccount;

  onMount(async () => {
    await sleep(3);
    dispatchEvent("continue");
    // dispatchEvent("fail");
  });
</script>

<style>
  .message {
    margin-left: 8px;
    margin-right: 24px;
    padding: 4px 24px;
    border-radius: 16px;
  }
  .checking .message {
    margin-left: 16px;
    background-color: #F0F9F8;
    color: #455468;
  }
  .display {
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 24px;
  }
</style>
