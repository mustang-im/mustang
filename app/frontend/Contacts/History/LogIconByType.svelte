{#if message instanceof EMail}
  <LogIcon type="email" outgoing={message.outgoing}
    tooltip={(message.outgoing ? $t`To *=> email to a person` : $t`From *=> email to a person`) + " " + (message.contact?.name ?? "")}>
    <MailIcon size="24px" slot="icon" />
  </LogIcon>
{:else if message instanceof ChatMessage}
  <LogIcon type="chat" outgoing={message.outgoing}
    tooltip={(message.outgoing ? $t`To *=> email to a person` : $t`From *=> email to a person`) + " " + (message.contact?.name ?? "")}>
    <ChatIcon size="24px" slot="icon" />
  </LogIcon>
{:else if message instanceof Event}
  <LogIcon type="event" outgoing={message.isIncomingMeeting}>
    <EventIcon size="24px" slot="icon" />
  </LogIcon>
{:else if message instanceof VideoConfMeeting}
  <LogIcon type="call" outgoing={message.event?.isIncomingMeeting}>
    <CallIcon size="24px" slot="icon" />
  </LogIcon>
{/if}

<script lang="ts">
  import type { LogEntry } from "../../../logic/Contacts/History/History";
  import { EMail } from "../../../logic/Mail/EMail";
  import { ChatMessage } from "../../../logic/Chat/Message";
  import { Event } from "../../../logic/Calendar/Event";
  import { VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import LogIcon from "./LogIcon.svelte";
  import MailIcon from "lucide-svelte/icons/mail";
  import ChatIcon from "lucide-svelte/icons/message-square";
  import EventIcon from "lucide-svelte/icons/calendar";
  import CallIcon from "lucide-svelte/icons/phone";
  import { t } from "../../../l10n/l10n";

  export let message: LogEntry;
</script>
