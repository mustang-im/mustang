<button class="activity" class:unread={email && !$email.isRead}
  title={tooltip} on:click={() => catchErrors(() => ContactActivities.open(entry))}>
  <hbox class="icon">
    {#if email}
      <svelte:component this={$email.isRead ? ReadIcon : UnreadIcon} size={16} />
    {:else if file}
      <FileIcon size={16} />
    {:else}
      <MeetingIcon size={16} />
    {/if}
  </hbox>
  <vbox class="text">
    {#if email}
      <hbox class="first-line">
        <span class="primary">{email.from?.name || email.from?.emailAddress || ""}</span>
        <span class="date">{MessageDates.listDate(time)}</span>
      </hbox>
      <span class="subject">{$email.subject || $t`(No subject)`}</span>
      {#if preview}
        <span class="secondary">{preview}</span>
      {/if}
    {:else if file}
      <hbox class="first-line">
        <span class="primary">{file.name ?? ""}</span>
        <span class="date">{MessageDates.listDate(time)}</span>
      </hbox>
      <span class="secondary">{file.size ? fileSize(file.size) : ""}</span>
    {:else if event}
      <hbox class="first-line">
        <span class="primary">{$event.title || $t`(No title)`}</span>
        <span class="date">{eventDate}</span>
      </hbox>
      {#if $event.location}
        <span class="secondary">{$event.location}</span>
      {/if}
    {/if}
  </vbox>
</button>

<script lang="ts">
  import { EMail } from "../../../logic/Mail/EMail";
  import { Event } from "../../../logic/Calendar/Event";
  import { File } from "../../../logic/Files/File";
  import type { LogEntry } from "../../../logic/Contacts/History/History";
  import { ContactActivities } from "./ContactActivities";
  import { MessageDates } from "../../Mail/MessageList/MessageDates";
  import { fileSize } from "../../../frontend/Files/file";
  import { catchErrors } from "../../../frontend/Util/error";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import ReadIcon from "lucide-svelte/icons/mail-open";
  import FileIcon from "lucide-svelte/icons/file";
  import MeetingIcon from "lucide-svelte/icons/calendar";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";

  export let entry: LogEntry;

  $: email = entry instanceof EMail ? entry : null;
  $: file = entry instanceof File ? entry : null;
  $: event = entry instanceof Event ? entry : null;
  $: time = ContactActivities.timeOf(entry);
  $: preview = entry instanceof EMail ? (entry.text ?? "").replace(/\s+/g, " ").trim().substring(0, 200) : "";
  $: eventDate = entry instanceof Event && entry.startTime
    ? entry.startTime.toLocaleString(getDateTimeLocale(), entry.allDay
      ? { weekday: "short", year: "numeric", month: "numeric", day: "numeric" }
      : { weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "";
  $: tooltip = entry instanceof EMail ? `${entry.subject ?? ""}\n${MessageDates.fullDate(time)}`
    : entry instanceof Event ? `${entry.title ?? ""}\n${eventDate}`
    : entry instanceof File ? `${entry.name ?? ""}\n${MessageDates.fullDate(time)}`
    : "";
</script>

<style>
  .activity {
    display: flex;
    align-items: start;
    gap: 10px;
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 4px;
    background: none;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .activity:hover {
    background-color: var(--lo-hover-bg);
  }
  .activity:focus-visible {
    outline: 2px solid var(--lo-focus-ring);
    outline-offset: -2px;
  }
  .icon {
    flex: none;
    margin-block-start: 2px;
    color: var(--lo-fg-secondary);
  }
  .text {
    flex: 1 1 0;
    min-width: 0;
    gap: 1px;
  }
  .first-line {
    align-items: baseline;
    gap: 8px;
  }
  .primary {
    flex: 1 1 0;
    min-width: 0;
  }
  .primary,
  .subject,
  .secondary {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .date {
    flex: none;
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
  .secondary {
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
  .unread .primary,
  .unread .subject {
    font-weight: 600;
  }
  .unread .subject {
    color: var(--lo-accent-text);
  }
</style>
