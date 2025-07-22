{#if message instanceof EMail}
  <EMailLog {message} />
{:else if message instanceof ChatMessage}
  <ChatLog {message} />
{:else if message instanceof File}
  <FileLog file={message} />
{:else if message instanceof Event}
  <EventLog event={message} />
{:else}
  <hbox />
{/if}

<script lang="ts">
  import type { LogEntry } from "../../../logic/Contacts/History/History";
  import { EMail } from "../../../logic/Mail/EMail";
  import { ChatMessage } from "../../../logic/Chat/Message";
  import { File } from "../../../logic/Files/File";
  import { Event } from "../../../logic/Calendar/Event";
  import EMailLog from "./EMailLog.svelte";
  import ChatLog from "./ChatLog.svelte";
  import FileLog from "./FileLog.svelte";
  import EventLog from "./EventLog.svelte";

  export let message: LogEntry;
</script>

<style>
</style>
