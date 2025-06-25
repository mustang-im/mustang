{#if message instanceof EMail}
  <EMailLog {message} />
{:else if message instanceof ChatMessage}
  <ChatLog {message} />
{:else if message instanceof Event}
  <EventLog event={message} />
{/if}

<script lang="ts">
  import type { LogEntry } from "../../../logic/Contacts/History/History";
  import type { Person } from "../../../logic/Abstract/Person";
  import { EMail } from "../../../logic/Mail/EMail";
  import { ChatMessage } from "../../../logic/Chat/Message";
  import { Event } from "../../../logic/Calendar/Event";
  import EMailLog from "./EMailLog.svelte";
  import EventLog from "./EventLog.svelte";
  import ChatLog from "./ChatLog.svelte";

  export let message: LogEntry;
</script>

<style>
</style>
