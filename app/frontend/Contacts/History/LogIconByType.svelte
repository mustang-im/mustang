{#if message instanceof EMail}
  <LogIcon type="email" outgoing={message.outgoing}
    repeatType={previousMessage instanceof EMail}
    color="#0080fd" fgcolor="white"
    tooltip={(message.outgoing ? $t`To *=> email to a person` : $t`From *=> email to a person`) + " " + (message.contact?.name ?? "")}>
    <MailIcon {size} slot="icon" />
  </LogIcon>
{:else if message instanceof ChatMessage}
  <LogIcon type="chat" outgoing={message.outgoing}
    repeatType={previousMessage instanceof EMail}
    color="#2ab116" fgcolor="white"
    tooltip={(message.outgoing ? $t`To *=> email to a person` : $t`From *=> email to a person`) + " " + (message.contact?.name ?? "")}>
    <ChatIcon {size} slot="icon" />
  </LogIcon>
{:else if message instanceof File}
  <LogIcon type="call" outgoing={false}
    repeatType={previousMessage instanceof File}
    color="#2ecccd" fgcolor="black"
    tooltip={message.name ?? ""}>
    <FileIcon {size} slot="icon" />
  </LogIcon>
{:else if message instanceof Event}
  <LogIcon type="event" outgoing={message.isIncomingMeeting}
    repeatType={previousMessage instanceof Event}
    color="#f4c81d" fgcolor="black"
    tooltip={message.title ?? ""}>
    <EventIcon {size} slot="icon" />
  </LogIcon>
{:else if message instanceof VideoConfMeeting}
  <LogIcon type="call" outgoing={message.event?.isIncomingMeeting}
    repeatType={previousMessage instanceof VideoConfMeeting}
    color="#ff4747" fgcolor="black"
    tooltip={message.title ?? message.event?.title ?? ""}>
    <CallIcon {size} slot="icon" />
  </LogIcon>
{:else}
  <LogIcon type="call" outgoing={false}
    color="white" fgcolor="black"
    tooltip="Unknown">
    <UnknownIcon {size} slot="icon" />
  </LogIcon>
{/if}

<script lang="ts">
  import type { LogEntry } from "../../../logic/Contacts/History/History";
  import { EMail } from "../../../logic/Mail/EMail";
  import { ChatMessage } from "../../../logic/Chat/Message";
  import { File } from "../../../logic/Files/File";
  import { Event } from "../../../logic/Calendar/Event";
  import { VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import LogIcon from "./LogIcon.svelte";
  import MailIcon from "lucide-svelte/icons/mail";
  import ChatIcon from "lucide-svelte/icons/message-square";
  import EventIcon from "lucide-svelte/icons/calendar";
  import CallIcon from "lucide-svelte/icons/phone";
  import FileIcon from "lucide-svelte/icons/file";
  import UnknownIcon from "lucide-svelte/icons/badge-question-mark";
  import { t } from "../../../l10n/l10n";

  export let message: LogEntry;
  export let previousMessage: LogEntry;

  let size = "24px";
</script>
