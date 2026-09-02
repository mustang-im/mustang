<StatusMessage status="warning" message={$t`POP3 only downloads mails to this device. Your phone and other devices will not see which mails you read, moved or deleted, and once the mails are deleted from the server, they are gone there. If your provider offers IMAP, please use IMAP instead.`}>
  <AlertIcon slot="icon" size={20} />
</StatusMessage>

<script lang="ts">
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import AlertIcon from "lucide-svelte/icons/alert-triangle";
  import { t } from "../../../l10n/l10n";
</script>
