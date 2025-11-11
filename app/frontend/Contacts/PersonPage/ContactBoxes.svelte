<vbox class="boxes {fontSize}">
  {#if showEmail}
    <GroupBox classes="email" headerName={$t`Mail`}
      {isEditing} addFunc={addEmail} addLabel={$t`Add mail address`}>
      <Icon data={MailIcon} size="16px" slot="icon" />
      <grid class="items" slot="content">
        {#each $emailAddresses.each as entry}
          <ContactEntryUI {entry} coll={emailAddresses}
            on:save={save} bind:isEditing={isEditing}>
            <EmailAddressDisplay slot="display" value={entry.value} />
            <EmailAddressEdit slot="edit" bind:value={entry.value} />
            <a href="mailto:{entry.value}" slot="actions">
              <Button icon={MailIcon}
                label={$t`Write mail`}
                iconOnly plain classes="write" />
            </a>
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  {#if showChat}
    <GroupBox classes="chat" headerName={$t`Chat`}
      {isEditing} addFunc={addChatAccount} addLabel={$t`Add chat contact`}>
      <Icon data={ChatIcon} size="16px" slot="icon" />
      <grid class="items" slot="content">
        {#each $chatAccounts.each as entry}
          <ContactEntryUI {entry} coll={chatAccounts}
            protocolLabels={chatProtocols}
            on:save={save} bind:isEditing={isEditing}>
            <EmailAddressDisplay slot="display" value={entry.value} /><!-- TODO chat link -->
            <EmailAddressEdit slot="edit" bind:value={entry.value} /><!-- TODO chat editor -->
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  {#if showPhone}
    <GroupBox classes="phone" headerName={$t`Phone numbers`}
      {isEditing} addFunc={addPhoneNumber} addLabel={$t`Add phone number`}>
      <Icon data={PhoneIcon} size="16px" slot="icon" />
      <grid class="items" slot="content">
        {#each $phoneNumbers.each as entry}
          <ContactEntryUI {entry} coll={phoneNumbers}
            on:save={save} bind:isEditing={isEditing}>
            <PhoneNumberDisplay slot="display" value={entry.value} />
            <PhoneNumberEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  {#if showURLs}
    <GroupBox classes="url" headerName={$t`Website`}
      {isEditing} addFunc={addURL} addLabel={$t`Add website link`}>
      <WebsiteIcon size="16px" slot="icon" />
      <grid class="items" slot="content">
        {#each $urls.each as entry}
          <ContactEntryUI {entry} coll={urls}
            on:save={save} bind:isEditing={isEditing}>
            <URLDisplay slot="display" value={entry.value} />
            <URLEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  {#if showStreet}
    <GroupBox classes="street-addresses" headerName={$t`Street address`}
      {isEditing} addFunc={addStreetAddress} addLabel={$t`Add street address`}>
      <StreetIcon size="16px" slot="icon" />
      <grid class="items" slot="content">
        {#each $streetAddresses.each as entry}
          <ContactEntryUI {entry} coll={streetAddresses}
            on:save={save} bind:isEditing={isEditing}>
            <StreetAddressDisplay slot="display" value={entry.value} />
            <StreetAddressEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  {#if showGroups}
    <GroupBox classes="groups" headerName={$t`Groups`} {isEditing}>
      <Icon data={GroupIcon} size="16px" slot="icon" />
      <grid class="items" slot="content">
        {#each $groups.each as entry}
          <ContactEntryUI {entry} coll={groups}
            on:save={save} bind:isEditing={isEditing}>
            <hbox slot="display">{entry.value}</hbox>
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  <!--
  <GroupBox classes="preferences" headerName={$t`Preferences`}>
    <Icon data={ChatIcon} size="16px" slot="icon" />
    <vbox class="preferred" slot="content">
      <hbox>Preferred communication tool</hbox>
      <hbox>WhatsApp</hbox>
      <hbox>[o] Notifications</hbox>
    </vbox>
  </GroupBox>
  -->

  <SameName bind:person {isEditing} />

  {#if showExpanders}
    <vbox class="expanders font-small">
      <ExpanderButtons>
        <ExpanderButton bind:expanded={showEmail} on:expand={addEmail}
          label={$t`Mail`} icon={MailIcon} classes="mail" addIconSize="18px" />
        <ExpanderButton bind:expanded={showChat} on:expand={addChatAccount}
          label={$t`Chat`} icon={ChatIcon} classes="chat" addIconSize="18px" />
        <ExpanderButton bind:expanded={showPhone} on:expand={addPhoneNumber}
          label={$t`Phone`} icon={PhoneIcon} classes="phone" addIconSize="18px" />
        <ExpanderButton bind:expanded={showStreet} on:expand={addStreetAddress}
          label={$t`Street address`} icon={StreetIcon} classes="street" addIconSize="18px" />
        <ExpanderButton bind:expanded={showURLs} on:expand={addURL}
          label={$t`Website`} icon={WebsiteIcon} classes="website" addIconSize="18px" />
        <!--<ExpanderButton bind:expanded={showGroups} on:expand={addGroup}
          label="Groups" icon={GroupIcon} classes="group" addIconSize="18px" />-->
        <ExpanderButton bind:expanded={showNotes} on:expand={addNotes}
          label={$t`Notes`} icon={NotesIcon} classes="notes" addIconSize="18px" />
      </ExpanderButtons>
    </vbox>
  {/if}

  {#if showNotes}
    <vbox flex class="notes">
      <textarea
        bind:value={person.notes}
        placeholder={$t`Personal notes`}
        autofocus={person.notes == " "}
        readonly={!isEditing}
        class="font-small" />
    </vbox>
  {/if}
</vbox>

<script lang="ts">
  import { ContactEntry, type Person } from "../../../logic/Abstract/Person";
  import { StreetAddress } from "../../../logic/Contacts/StreetAddress";
  import { selectedContactEntry } from "../Person/Selected";
  import { appGlobal } from "../../../logic/app";
  import ContactEntryUI from "./ContactEntryUI.svelte";
  import EmailAddressDisplay from "./EmailAddressDisplay.svelte";
  import EmailAddressEdit from "./EmailAddressEdit.svelte";
  import GroupBox from "./GroupBox.svelte";
  import PhoneNumberDisplay from "./PhoneNumberDisplay.svelte";
  import PhoneNumberEdit from "./PhoneNumberEdit.svelte";
  import URLDisplay from "./URLDisplay.svelte";
  import URLEdit from "./URLEdit.svelte";
  import StreetAddressDisplay from "./StreetAddressDisplay.svelte";
  import StreetAddressEdit from "./StreetAddressEdit.svelte";
  import SameName from "./SameName.svelte";
  import ExpanderButtons from "../../Shared/ExpanderButtons.svelte";
  import ExpanderButton from "../../Shared/ExpanderButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import MailIcon from '../../asset/icon/appBar/mail.svg?raw';
  import ChatIcon from '../../asset/icon/appBar/chat.svg?raw';
  import ContactsIcon from '../../asset/icon/appBar/contacts.svg?raw';
  import PhoneIcon from '../../asset/icon/meet/call.svg?raw';
  import StreetIcon from "lucide-svelte/icons/house";
  import WebsiteIcon from "lucide-svelte/icons/globe";
  import GroupIcon from "lucide-svelte/icons/users-round";
  import NotesIcon from "lucide-svelte/icons/notebook-pen";
  import { showError } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  export let person: Person;
  /** in/out */
  export let isEditing: boolean;
  export let showExpanders: boolean;

  $: emailAddresses = person.emailAddresses;
  $: phoneNumbers = person.phoneNumbers;
  $: chatAccounts = person.chatAccounts;
  $: streetAddresses = person.streetAddresses;
  $: urls = person.urls;
  $: groups = person.groups;

  $: showEmail = $emailAddresses.hasItems;
  $: showChat = $chatAccounts.hasItems;
  $: showPhone = $phoneNumbers.hasItems;
  $: showStreet = $streetAddresses.hasItems;
  $: showURLs = $urls.hasItems;
  $: showGroups = $groups.hasItems;
  $: showNotes = !!$person.notes;

  function addEmail() {
    let entry = new ContactEntry("", "work");
    person.emailAddresses.push(entry);
    isEditing = true;
    $selectedContactEntry = entry;
  }
  function addChatAccount() {
    let entry = new ContactEntry("", "work");
    person.chatAccounts.push(entry);
    isEditing = true;
    $selectedContactEntry = entry;
  }
  function addPhoneNumber() {
    let entry = new ContactEntry("", "work");
    person.phoneNumbers.push(entry);
    isEditing = true;
    $selectedContactEntry = entry;
  }
  function addStreetAddress() {
    let entry = new ContactEntry(new StreetAddress().toString(), "work");
    person.streetAddresses.push(entry);
    isEditing = true;
    $selectedContactEntry = entry;
  }
  function addURL() {
    let entry = new ContactEntry("", "work");
    person.urls.push(entry);
    isEditing = true;
    $selectedContactEntry = entry;
  }
  function addNotes() {
    person.notes = " ";
    isEditing = true;
  }

  async function save() {
    try {
      await person.save();
    } catch (ex) {
      showError(ex);
    }
  }

  $: fontSize = appGlobal.isMobile ? "font-normal" : "font-small";

  /** Contains the Purpose values that we want to show to the user for him to select from.
   *
   * Do *not* translate `$t` brand names.
   * The names *must* be short (<= 8 chars), otherwise the dropdown is long and
   * the address field has no space left. */
  const chatProtocols = {
    "xmpp": `XMPP`,
    "matrix": `Matrix`,
    "irc": `IRC`,
    "teams": `Teams`,
    "slack": `Slack`,
    "signal": `Signal`,
    "whatsapp": `WhatsApp`,
    "threema": `Threema`,
    "telegram": `Telegram`,
    "facebook": `Facebook`,
    "wechat": `WeChat`,
    "qq": `QQ`,
    "discord": `Discord`,
  }
</script>

<style>
  .boxes {
    height: 100%;
  }
  grid.items {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: start;
  }
  .phone :global(path),
  .expanders :global(.phone .icon path) {
    fill: transparent;
    stroke: #27c1aa;
  }
  .expanders :global(.phone .icon path) {
    stroke-width: 1.5px;
  }
  .notes {
    margin: 6px;
    margin-block-start: 16px;
    border: 1px solid var(--border);
  }
  .notes textarea {
    height: 100%;
    min-height: 10em;
    background-color: var(--main-bg);
    color: var(--main-fg);
    font-family: sans-serif;
    border: 1px solid var(--border);
    padding: 8px;
  }
  .notes,
  .notes textarea {
    border-radius: 2px;
  }
  :global(.mobile) .notes,
  :global(.mobile) .notes textarea {
    border-radius: 12px;
  }
  .notes textarea::placeholder {
    color: grey;
  }
  .notes textarea:focus {
    outline: 2px solid var(--input-focus);
  }
  .expanders {
    margin-block-start: 12px;
  }
  :global(.mobile) .expanders {
    margin-block-start: 24px;
  }
  .expanders :global(.content) {
    padding: 4px 8px 4px 4px;
  }
</style>
