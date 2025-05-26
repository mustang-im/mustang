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
        <hbox class="to font-small">
          {$t`to`}&nbsp;
          <RecipientList recipients={$message.to} />
        </hbox>
      {/if}
      {#if $message.cc.hasItems}
        <hbox class="cc font-small">
          {$t`cc`}&nbsp;
          <RecipientList recipients={$message.cc} />
        </hbox>
      {/if}
      {#if $message.bcc.hasItems}
        <hbox class="bcc font-small">
          {$t`bcc`}&nbsp;
          <RecipientList recipients={$message.bcc} />
        </hbox>
      {/if}
    </vbox>
    <hbox flex />
    <vbox class="top-right">
      <MessageToolbar {message} />
      <hbox>
        {#if $tags.hasItems}
          <hbox class="tags">
            <TagSelector tags={$tags} object={message} canAdd={false}>
              <RoundButton
                slot="tag-button"
                let:tag
                label={$t`Remove`}
                onClick={() => onTagRemove(tag)}
                icon={RemoveIcon}
                classes="small remove"
                iconSize="12px"
                padding="0px"
                border={false}
                />
            </TagSelector>
          </hbox>
        {/if}
      </hbox>
    </vbox>
  </hbox>
  <hbox class="subject-line">
    <value class="subject">{$message.subject}</value>
    <hbox flex />
    <value class="date font-small" title={$message.sent?.toLocaleString(getUILocale())}>
      {getDateTimeString($message.sent)}
    </value>
    <vbox class="display-mode">
      <DisplayModeSwitcher />
    </vbox>
  </hbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { Person } from "../../../logic/Abstract/Person";
  import type { PersonOrGroup } from "../../Contacts/Person/PersonOrGroup";
  import { selectedPerson } from "../../Contacts/Person/Selected";
  import type { Tag } from "../../../logic/Abstract/Tag";
  import MessageToolbar from "./MessageToolbar.svelte";
  import RecipientList from "./RecipientList.svelte";
  import Recipient from "./Recipient.svelte";
  import PersonPicture from "../../Contacts/Person/PersonPicture.svelte";
  import DisplayModeSwitcher from "./DisplayModeSwitcher.svelte";
  import TagSelector from "../../Shared/Tag/TagSelector.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import RemoveIcon from "lucide-svelte/icons/x";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { catchErrors, backgroundError } from "../../Util/error";
  import { getDateTimeString } from "../../Util/date";
  import { onDestroy } from "svelte";
  import { getUILocale, t } from "../../../l10n/l10n";

  export let message: EMail;

  $: from = message.outgoing
    ? "me"
    : message.contact?.name
      ?? message.from.emailAddress;
  $: tags = message.tags;

  let readDelaySetting = getLocalStorage("mail.read.after", 0); // 0 = Immediately; -1 = Manually; 1 to 20 = delay in seconds
  $: readDelay = $readDelaySetting.value;
  $: catchErrors(() => markMessageAsRead(message, readDelay), backgroundError);
  let readTimeout: NodeJS.Timeout;
  function markMessageAsRead(message: EMail, readDelay: number) {
    if (message.isRead) {
      return;
    }
    if (readDelay < 0) {
      return;
    }
    if (readDelay == 0) {
      readDelay = 0.2; // Avoid that normal scrolling marks all msgs as read
    }
    clearTimeout(readTimeout);
    readTimeout = setTimeout(() => {
      message.markRead(true)
        .catch(message.folder.account.errorCallback);
    }, readDelay * 1000);
  }
  onDestroy(() => {
    clearTimeout(readTimeout);
  });

  $: selectPerson(message?.contact);
  function selectPerson(contact: PersonOrGroup | PersonUID) {
    if (contact instanceof PersonUID) {
      contact = contact.findPerson();
    }
    if (!(contact instanceof Person)) {
      return;
    }
    $selectedPerson = contact;
  }

  async function onTagRemove(tag: Tag) {
    await message.removeTag(tag);
  }
</script>

<style>
  .message-header {
    min-height: 5em;
    padding: 12px 20px 2px 20px;
    box-shadow: 0px -1px 5px 0px rgba(0, 0, 0, 8%);
    z-index: 1;
  }
  .top-right {
    align-items: end;
  }
  .tags {
    margin-inline-end: 12px;
  }
  .subject {
    font-weight: 700;
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
    color: grey;
  }
  .cc, .bcc {
    color: grey;
  }
  .outgoing .to {
    font-weight: bold;
    color: inherit;
  }
  .date {
    align-self: center;
    margin-inline-end: 16px;
    font-weight: 300;
  }
  .subject-line {
    flex-wrap: wrap;
    justify-content: end;
    margin-block-start: 8px;
  }
  .display-mode {
    justify-content: end;
  }
</style>
