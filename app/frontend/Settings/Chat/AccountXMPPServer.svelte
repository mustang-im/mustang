<grid>
  <label for="hostname">Server</label>
  <hbox class="value">{account.hostname}:{account.port}</hbox>
  <label for="username">Username JID</label>
  <hbox class="value">{account.username}@{account.serverDomain}</hbox>
</grid>

<script lang="ts">
  import type { XMPPAccount } from "../../../logic/Chat/XMPP/XMPPAccount";

  export let account: XMPPAccount;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
