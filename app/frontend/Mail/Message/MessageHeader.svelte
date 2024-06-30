<vbox class="message-header" class:outgoing={$message.outgoing}>
  <hbox>
    {#if $message.contact instanceof Person && $message.contact.picture}
      <PersonPicture person={$message.contact} />
    {/if}
    <vbox>
      <hbox class="from">
        {#if $message.outgoing}
          <value class="from" title={$message.from.emailAddress}>
            {from}
          </value>
        {:else}
          <Recipient recipient={$message.from} />
        {/if}
      </hbox>
      {#if $message.to.hasItems}
        <hbox class="to">
          {$t`to`}&nbsp;
          <RecipientList recipients={$message.to} />
        </hbox>
      {/if}
      {#if $message.cc.hasItems}
        <hbox class="cc">
          {$t`cc`}&nbsp;
          <RecipientList recipients={$message.cc} />
        </hbox>
      {/if}
      {#if $message.bcc.hasItems}
        <hbox class="bcc">
          {$t`bcc`}&nbsp;
          <RecipientList recipients={$message.bcc} />
        </hbox>
      {/if}
    </vbox>
    <hbox flex />
    <vbox>
      <MessageToolbar {message} />
      <value class="date" title={$message.sent?.toLocaleString(getUILocale())}>
        {getDateString($message.sent)}
      </value>
    </vbox>
  </hbox>
  <hbox class="subject-line">
    <value class="subject">{$message.subject}</value>
    <hbox flex />
    <vbox class="display-mode">
      <DisplayModeSwitcher />
    </vbox>
  </hbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { Person } from "../../../logic/Abstract/Person";
  import type { PersonOrGroup } from "../../Shared/Person/PersonOrGroup";
  import { selectedPerson } from "../../Shared/Person/Selected";
  import MessageToolbar from "./MessageToolbar.svelte";
  import RecipientList from "./RecipientList.svelte";
  import Recipient from "./Recipient.svelte";
  import PersonPicture from "../../Shared/Person/PersonPicture.svelte";
  import DisplayModeSwitcher from "./DisplayModeSwitcher.svelte";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { catchErrors, backgroundError } from "../../Util/error";
  import { getDateString } from "../../Util/date";
  import { onDestroy } from "svelte";
  import { getUILocale, t } from "../../../l10n/l10n";

  export let message: EMail;

  $: from = message.outgoing
    ? "me"
    : message.contact?.name
      ?? message.from.emailAddress;

  let readDelaySetting = getLocalStorage("mail.read.after", 0); // 0 = Immediately; -1 = Manually; 1 to 20 = delay in seconds
  $: readDelay = $readDelaySetting.value;
  $: catchErrors(() => markMessageAsRead(message, readDelay), backgroundError);
  let readTimeout: NodeJS.Timeout;
  function markMessageAsRead(message: EMail, readDelay: number) {
    if (readDelay < 0) {
      return;
    }
    if (readDelay == 0) {
      message.markRead(true).catch(backgroundError);
      return;
    }
    clearTimeout(readTimeout);
    readTimeout = setTimeout(() => {
      message.markRead(true).catch(backgroundError);
    }, readDelay * 1000);
  }
  onDestroy(() => {
    clearTimeout(readTimeout);
  });

  $: selectPerson(message?.contact);
  function selectPerson(contact: PersonOrGroup | PersonUID) {
    if (!(contact instanceof Person)) {
      return;
    }
    $selectedPerson = contact;
  }
</script>

<style>
  .message-header {
    min-height: 5em;
    padding: 12px 20px 8px 20px;
    box-shadow: 0px -1px 5px 0px rgba(0, 0, 0, 8%);
    z-index: 1;
  }
  .subject {
    font-weight: 700;
    margin-block-start: 12px;
  }
  .from {
    font-weight: bold;
  }
  .from :global(.domain) {
    font-weight: normal;
  }
  .outgoing .from {
    font-weight: normal;
    color: grey;
  }
  .to {
    font-size: 13px;
    color: grey;
  }
  .cc, .bcc {
    font-size: 13px;
    color: grey;
  }
  .outgoing .to {
    font-weight: bold;
    color: inherit;
  }
  .date {
    align-self: end;
  }
  .subject-line {
    flex-wrap: wrap;
    justify-content: end;
  }
  .display-mode {
    justify-content: end;
  }
</style>
