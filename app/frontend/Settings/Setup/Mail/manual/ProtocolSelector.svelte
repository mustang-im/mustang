<select value={config.protocol} required disabled={!isSetup}
  on:change={onProtocolChanged}
  class="protocol">
  <option value="imap">IMAP</option>
  <option value="pop3">POP3</option>
  <option value="ews">EWS</option>
  <option value="owa">OWA</option>
</select>

<script lang="ts">
  import type { MailAccount } from "../../../../../logic/Mail/MailAccount";
  import { newAccountForProtocol } from "../../../../../logic/Mail/AccountsList/MailAccounts";

  /** in/out */
  export let config: MailAccount;
  export let isSetup: boolean;

  function onProtocolChanged(event: Event) {
    let el = event.target as HTMLSelectElement;
    let protocol = el.value;
    console.log("new protocol", protocol);
    let newConfig = newAccountForProtocol(protocol);
    newConfig.cloneFrom(config);
    config = newConfig;
  }
</script>

<style>
  select.protocol {
    opacity: unset;
  }
  select {
    min-width: 7em;
  }
</style>
