<MenuItem label={$t`Messages in This Conversation`} icon={ConversationIcon}
  disabled={!MailSearch.isInConversation(message) && $t`This message is not part of a conversation`}
  onClick={() => MailSearch.findConversation(message)} />
<MenuItem label={$t`Messages from or to Sender`} icon={SenderIcon}
  disabled={!sender && (message.outgoing ? $t`You sent this message` : $t`The sender is not in your address books`)}
  onClick={() => MailSearch.findRelated({ person: sender })} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { MailSearch } from "../Search/MailSearch";
  import { MessageActions } from "../MessageActions";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import ConversationIcon from "lucide-svelte/icons/messages-square";
  import SenderIcon from "lucide-svelte/icons/user-search";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  $: sender = MessageActions.senderPerson(message);
</script>
