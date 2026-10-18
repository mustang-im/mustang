<HeaderGroupBox>
  <hbox slot="header">JMAP - {$t`Advanced`}</hbox>

  <Checkbox bind:checked={account.callsOverWebSocket} allowIndetermined={false}
    label={$t`Use WebSocket for server requests`}
    tooltip={$t`Sends all requests to the server over one WebSocket connection, if the server supports it. Otherwise, each request is a separate HTTP request.`} />
  <Checkbox bind:checked={account.pushOverWebSocket} allowIndetermined={false}
    label={$t`Use WebSocket for push`}
    tooltip={$t`The server tells about new emails and other changes over the WebSocket connection, if the server supports it. Otherwise, over EventSource.`} />
</HeaderGroupBox>

<script lang="ts">
  import type { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
  import HeaderGroupBox from "../../../Shared/HeaderGroupBox.svelte";
  import Checkbox from "../../../Shared/Checkbox.svelte";
  import { t } from "../../../../l10n/l10n";

  export let account: JMAPAccount;
</script>
