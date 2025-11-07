<vbox class="boxes {fontSize}">
  {#if showEmail}
    <GroupBox classes="email">
      <svelte:fragment slot="header">
        <Icon data={MailIcon} size="16px" />
        <h3>{$t`Mail`}</h3>
        <hbox flex class="header actions">
          <Button
            on:click={addEmail}
            icon={AddIcon}
            label={$t`Add mail address`}
            iconOnly plain classes="add" />
        </hbox>
      </svelte:fragment>
      <grid class="items" slot="content">
        {#each $emailAddresses.each as entry}
          <ContactEntryUI {entry} coll={emailAddresses}
            on:save={save} bind:isEditing={isEditingContacts}>
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
    <GroupBox classes="chat">
      <svelte:fragment slot="header">
        <Icon data={ChatIcon} size="16px" />
        <h3>{$t`Chat`}</h3>
        <hbox flex class="header actions">
          <Button
            on:click={addChatAccount}
            icon={AddIcon}
            label={$t`Add chat contact`}
            iconOnly plain classes="add" />
        </hbox>
      </svelte:fragment>
      <grid class="items" slot="content">
        {#each $chatAccounts.each as entry}
          <ContactEntryUI {entry} coll={chatAccounts}
            on:save={save} bind:isEditing={isEditingContacts}>
            <EmailAddressDisplay slot="display" value={entry.value} /><!-- TODO chat link -->
            <EmailAddressEdit slot="edit" bind:value={entry.value} /><!-- TODO chat editor -->
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  {#if showPhone}
    <GroupBox classes="phone">
      <svelte:fragment slot="header">
        <hbox class="phone">
          <Icon data={PhoneIcon} size="16px" />
        </hbox>
        <h3>{$t`Phone numbers`}</h3>
        <hbox flex class="header actions">
          <Button
            on:click={addPhoneNumber}
            icon={AddIcon}
            label={$t`Add phone number`}
            iconOnly plain classes="add" />
        </hbox>
      </svelte:fragment>
      <grid class="items" slot="content">
        {#each $phoneNumbers.each as entry}
          <ContactEntryUI {entry} coll={phoneNumbers}
            on:save={save} bind:isEditing={isEditingContacts}>
            <PhoneNumberDisplay slot="display" value={entry.value} />
            <PhoneNumberEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  {#if showURLs}
    <GroupBox classes="url">
      <svelte:fragment slot="header">
        <hbox class="url">
          <WebsiteIcon size="16px" />
        </hbox>
        <h3>{$t`Website`}</h3>
        <hbox flex class="header actions">
          <Button
            on:click={addURL}
            icon={AddIcon}
            label={$t`Add website link`}
            iconOnly plain classes="add" />
        </hbox>
      </svelte:fragment>
      <grid class="items" slot="content">
        {#each $urls.each as entry}
          <ContactEntryUI {entry} coll={urls}
            on:save={save} bind:isEditing={isEditingContacts}>
            <URLDisplay slot="display" value={entry.value} />
            <URLEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  {#if showStreet}
    <GroupBox classes="street-addresses">
      <svelte:fragment slot="header">
        <StreetIcon size="16px" />
        <h3>{$t`Street address`}</h3>
        <hbox flex class="header actions">
          <Button
            on:click={addStreetAddress}
            label={$t`Add street address`}
            icon={AddIcon}
            iconOnly plain classes="add" />
        </hbox>
      </svelte:fragment>
      <grid class="items" slot="content">
        {#each $streetAddresses.each as entry}
          <ContactEntryUI {entry} coll={streetAddresses}
            on:save={save} bind:isEditing={isEditingContacts}>
            <StreetAddressDisplay slot="display" value={entry.value} />
            <StreetAddressEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  {#if showGroups}
    <GroupBox classes="categories">
      <svelte:fragment slot="header">
        <Icon data={ContactsIcon} size="16px" />
        <h3>{$t`Groups`}</h3>
        <hbox flex class="header actions">
          <!--
          <Button
            on:click={addEmail}
            icon={AddIcon}
            label={$t`Add to group`}
            iconOnly plain classes="add" />
          -->
        </hbox>
      </svelte:fragment>
      <grid class="items" slot="content">
        {#each $groups.each as entry}
          <ContactEntryUI {entry} coll={groups}
            on:save={save} bind:isEditing={isEditingContacts}>
            <hbox slot="display">{entry.value}</hbox>
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>
  {/if}

  <!--
  <GroupBox classes="preferences">
    <svelte:fragment slot="header">
      <Icon data={ChatIcon} size="16px" />
      <h3>Preferences</h3>
    </svelte:fragment>
    <vbox class="preferred" slot="content">
      <hbox>Preferred communication tool</hbox>
      <hbox>WhatsApp</hbox>
      <hbox>[o] Notifications</hbox>
    </vbox>
  </GroupBox>
  -->

  <SameName bind:person />

  {#if showExpanders}
    <vbox class="expanders">
      <ExpanderButtons>
        <ExpanderButton bind:expanded={showEmail} on:expand={addEmail}
          label={$t`Mail`} icon={MailIcon} classes="mail" />
        <ExpanderButton bind:expanded={showChat} on:expand={addChatAccount}
          label={$t`Chat`} icon={ChatIcon} classes="chat" />
        <ExpanderButton bind:expanded={showPhone} on:expand={addPhoneNumber}
          label={$t`Phone`} icon={PhoneIcon} classes="phone" />
        <ExpanderButton bind:expanded={showStreet} on:expand={addStreetAddress}
          label={$t`Street address`} icon={StreetIcon} classes="street" />
        <ExpanderButton bind:expanded={showURLs} on:expand={addURL}
          label={$t`Website`} icon={WebsiteIcon} classes="website" />
        <!--<ExpanderButton bind:expanded={showGroups} on:expand={addGroup}
          label="Groups" icon={GroupIcon} classes="group" />-->
        <ExpanderButton bind:expanded={showNotes} on:expand={addNotes}
          label={$t`Notes`} icon={NotesIcon} classes="notes" />
      </ExpanderButtons>
    </vbox>
  {/if}

  {#if showNotes}
    <vbox flex class="notes">
      <textarea
        bind:value={person.notes}
        placeholder={$t`Personal notes`}
        autofocus={person.notes == " "}
        readonly={!isEditingContacts}
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
  import AddIcon from "lucide-svelte/icons/plus";
  import { showError } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  export let person: Person;
  /** in/out */
  export let isEditingContacts: boolean;
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
    isEditingContacts = true;
    $selectedContactEntry = entry;
  }
  function addChatAccount() {
    let entry = new ContactEntry("", "work");
    person.chatAccounts.push(entry);
    isEditingContacts = true;
    $selectedContactEntry = entry;
  }
  function addPhoneNumber() {
    let entry = new ContactEntry("", "work");
    person.phoneNumbers.push(entry);
    isEditingContacts = true;
    $selectedContactEntry = entry;
  }
  function addStreetAddress() {
    let entry = new ContactEntry(new StreetAddress().toString(), "work");
    person.streetAddresses.push(entry);
    isEditingContacts = true;
    $selectedContactEntry = entry;
  }
  function addURL() {
    let entry = new ContactEntry("", "work");
    person.urls.push(entry);
    isEditingContacts = true;
    $selectedContactEntry = entry;
  }
  function addNotes() {
    person.notes = " ";
    isEditingContacts = true;
  }

  async function save() {
    try {
      await person.save();
    } catch (ex) {
      showError(ex);
    }
  }

  $: fontSize = appGlobal.isMobile ? "font-normal" : "font-small";
</script>

<style>
  .boxes {
    height: 100%;
  }
  .boxes :global(.group .header h3) {
    margin-inline-start: 10px;
    margin-block-start: 0px;
    margin-block-end: 0px;
    vertical-align: middle;
    font-size: 14px;
  }
  :global(.mobile) .boxes :global(h3) {
    font-size: 16px;
    font-weight: 500;
  }
  .boxes :global(grid.items) {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: start;
  }
  .boxes :global(.group button.add) {
    color: grey;
  }
  .header.actions {
    justify-content: end;
  }
  :global(.group:not(:hover)) .header.actions {
    visibility: hidden;
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
    border-radius: 2px;
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
  .notes textarea::placeholder {
    color: grey;
  }
  .notes textarea:focus {
    outline: 2px solid var(--input-focus);
  }
  .expanders {
    margin-block-start: 12px;
  }
  .expanders :global(.content) {
    padding: 4px 8px 4px 4px;
  }
</style>
