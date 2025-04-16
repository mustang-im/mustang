<vbox flex class="person-page font-small" language={getUILocale()}>
  <GroupBox classes="person">
    <hbox flex class="main-left" slot="content">
      <hbox flex>
        <PersonPicture {person} size={64} allowPlaceholder={true} />
        <vbox class="main-info">
          <hbox class="name">
            <EditableSimpleText bind:value={person.name}
              on:save={save}
              bind:isEditing={isEditingName}
              placeholder={$t`First name Last name`} />
          </hbox>
          {#if isEditingName}
            <vbox class="names">
              <input type="text" bind:value={person.firstName}
                class="firstname" placeholder={$t`First name`} />
              <input type="text" bind:value={person.lastName}
                class="lastname" placeholder={$t`Last name`} />
            </vbox>
          {/if}
          <vbox class="job-company">
            {#if $person.position || isEditingName}
              <hbox class="position">
                <EditableSimpleText bind:value={person.position} on:save={save} placeholder={$t`Position`} />
              </hbox>
            {/if}
            {#if $person.department || isEditingName}
              <hbox class="department">
                <EditableSimpleText bind:value={person.department} on:save={save} placeholder={$t`Department`} />
              </hbox>
            {/if}
            {#if $person.company || isEditingName}
              <hbox class="company">
                <EditableSimpleText bind:value={person.company} on:save={save} placeholder={$t`First name Last name`} />
              </hbox>
            {/if}
          </vbox>
        </vbox>
      </hbox>
      <hbox flex class="main-right">
        <hbox class="main-call">
          {#if preferredVideoCall}
            <RoundButton label={$t`Video call`} icon={CameraIcon} classes="large secondary action"
              onClick={() => startVideoCall(person)} />
          {/if}
          {#if preferredPhoneNumber}
            <a href="tel:{preferredPhoneNumber}" class="phone-call">
              <RoundButton label={$t`Call`} icon={CallIcon} iconSize="19px" classes="large secondary action" />
            </a>
          {/if}
          {#if preferredChatAccount}
            <RoundButton label={$t`Message`} icon={ChatIcon} classes="large secondary action" />
          {/if}
          {#if preferredEmailAddress}
            <a href="mailto:{preferredEmailAddress}">
              <RoundButton label={$t`Send mail`} icon={MailIcon} classes="large secondary action" />
            </a>
          {/if}
        </hbox>
        <hbox flex />
        <hbox class="main-right-top">
          <AddressbookChanger {person} />
          <PersonMenu {person} />
        </hbox>
      </hbox>
    </hbox>
  </GroupBox>

  <grid class="boxes">
    {#if showEmail}
      <GroupBox classes="email">
        <svelte:fragment slot="header">
          <Icon data={MailIcon} size="16px" />
          <h3 class="font-small">{$t`Mail`}</h3>
          <hbox flex class="actions">
            <Button on:click={addEmail} icon={AddIcon} iconOnly plain classes="add" />
          </hbox>
        </svelte:fragment>
        <grid class="items" slot="content">
          {#each $emailAddresses.each as entry}
            <ContactEntryUI {entry} coll={emailAddresses} on:save={save}>
              <EmailAddressDisplay slot="display" value={entry.value} />
              <EmailAddressEdit slot="edit" bind:value={entry.value} />
            </ContactEntryUI>
          {/each}
        </grid>
      </GroupBox>
    {/if}

    {#if showChat}
      <GroupBox classes="chat">
        <svelte:fragment slot="header">
          <Icon data={ChatIcon} size="16px" />
          <h3 class="font-small">{$t`Chat`}</h3>
          <hbox flex class="actions">
            <Button on:click={addChatAccount} icon={AddIcon} iconOnly plain classes="add" />
          </hbox>
        </svelte:fragment>
        <grid class="items" slot="content">
          {#each $chatAccounts.each as entry}
            <ContactEntryUI {entry} coll={chatAccounts} on:save={save}>
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
          <h3 class="font-small">{$t`Phone numbers`}</h3>
          <hbox flex class="actions">
            <Button on:click={addPhoneNumber} icon={AddIcon} iconOnly plain classes="add" />
          </hbox>
        </svelte:fragment>
        <grid class="items" slot="content">
          {#each $phoneNumbers.each as entry}
            <ContactEntryUI {entry} coll={phoneNumbers} on:save={save}>
              <PhoneNumberDisplay slot="display" value={entry.value} />
              <PhoneNumberEdit slot="edit" bind:value={entry.value} />
            </ContactEntryUI>
          {/each}
        </grid>
      </GroupBox>
    {/if}

    {#if showStreet}
      <GroupBox classes="street-addresses">
        <svelte:fragment slot="header">
          <Icon data={MailIcon} size="16px" />
          <h3 class="font-small">{$t`Street addresses`}</h3>
          <hbox flex class="actions">
            <Button on:click={addStreetAddress} icon={AddIcon} iconOnly plain classes="add" />
          </hbox>
        </svelte:fragment>
        <grid class="items" slot="content">
          {#each $streetAddresses.each as entry}
            <ContactEntryUI {entry} coll={streetAddresses} on:save={save}>
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
          <h3 class="font-small">{$t`Groups`}</h3>
          <hbox flex class="actions">
            <!--
            <Button on:click={addEmail} icon={AddIcon} iconOnly plain classes="add" />
            -->
          </hbox>
        </svelte:fragment>
        <grid class="items" slot="content">
          {#each $groups.each as entry}
            <ContactEntryUI {entry} coll={groups} on:save={save}>
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
        <h3 class="font-small">Preferences</h3>
      </svelte:fragment>
      <vbox class="preferred" slot="content">
        <hbox>Preferred communication tool</hbox>
        <hbox>WhatsApp</hbox>
        <hbox>[o] Notifications</hbox>
      </vbox>
    </GroupBox>
    -->

    <SameName bind:person />
  </grid>

  <vbox class="expanders">
    <ExpanderButtons>
      <ExpanderButton bind:expanded={showEmail} label={$t`Mail`} on:expand={addEmail} />
      <ExpanderButton bind:expanded={showChat} label={$t`Chat`} on:expand={addChatAccount} />
      <ExpanderButton bind:expanded={showPhone} label={$t`Phone`} on:expand={addPhoneNumber} />
      <ExpanderButton bind:expanded={showStreet} label={$t`Street address`} on:expand={addStreetAddress} />
      <!--<ExpanderButton bind:expanded={showGroups} label="Groups" on:expand={addGroup} />-->
      <ExpanderButton bind:expanded={showNotes} label={$t`Notes`} on:expand={addNotes} />
    </ExpanderButtons>
  </vbox>

  {#if showNotes}
    <vbox flex class="notes">
      <textarea bind:value={person.notes} placeholder={$t`Personal notes`} autofocus={person.notes == " "} class="font-small" />
    </vbox>
  {/if}
</vbox>

<script lang="ts">
  import { ContactEntry, type Person } from "../../logic/Abstract/Person";
  import { startVideoCall } from "../../logic/Meet/StartCall";
  import EditableSimpleText from "./EditableSimpleText.svelte";
  import ContactEntryUI from "./ContactEntryUI.svelte";
  import EmailAddressDisplay from "./EmailAddressDisplay.svelte";
  import EmailAddressEdit from "./EmailAddressEdit.svelte";
  import GroupBox from "./GroupBox.svelte";
  import PhoneNumberDisplay from "./PhoneNumberDisplay.svelte";
  import PhoneNumberEdit from "./PhoneNumberEdit.svelte";
  import StreetAddressDisplay from "./StreetAddressDisplay.svelte";
  import StreetAddressEdit from "./StreetAddressEdit.svelte";
  import SameName from "./SameName.svelte";
  import PersonMenu from "./PersonMenu.svelte";
  import PersonPicture from "./Person/PersonPicture.svelte";
  import AddressbookChanger from "./AddressbookChanger.svelte";
  import ExpanderButtons from "../Shared/ExpanderButtons.svelte";
  import ExpanderButton from "../Shared/ExpanderButton.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Button from "../Shared/Button.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import MailIcon from '../asset/icon/appBar/mail.svg?raw';
  import ChatIcon from '../asset/icon/appBar/chat.svg?raw';
  import ContactsIcon from '../asset/icon/appBar/contacts.svg?raw';
  import CameraIcon from '../asset/icon/appBar/meet.svg?raw';
  import CallIcon from '../asset/icon/meet/callVoice.svg?raw';
  import PhoneIcon from '../asset/icon/meet/call.svg?raw';
  import AddIcon from "lucide-svelte/icons/plus";
  import { NotImplemented } from "../../logic/util/util";
  import { showError } from "../Util/error";
  import { getUILocale, t } from "../../l10n/l10n";

  export let person: Person;

  $: emailAddresses = person.emailAddresses;
  $: phoneNumbers = person.phoneNumbers;
  $: chatAccounts = person.chatAccounts;
  $: streetAddresses = person.streetAddresses;
  $: groups = person.groups;
  $: preferredPhoneNumber = $phoneNumbers.isEmpty ? null :
      phoneNumbers.sortBy(p => p.preference).first?.value ??
      phoneNumbers.first.value;
  $: preferredEmailAddress = $emailAddresses.isEmpty ? null :
      emailAddresses.sortBy(p => p.preference).first?.value ??
      emailAddresses.first.value;
  $: preferredVideoCall = null;
  $: preferredChatAccount = $chatAccounts.isEmpty ? null :
      chatAccounts.sortBy(p => p.preference).first?.value ??
      chatAccounts.first.value;

  let isEditingName: boolean;
  $: showEmail = $emailAddresses.hasItems;
  $: showChat = $chatAccounts.hasItems;
  $: showPhone = $phoneNumbers.hasItems;
  $: showStreet = $streetAddresses.hasItems;
  $: showGroups = $groups.hasItems;
  $: showNotes = !!$person.notes;

  function addEmail() {
    person.emailAddresses.push(new ContactEntry("", "work"));
  }
  function addChatAccount() {
    person.chatAccounts.push(new ContactEntry("", "matrix"));
  }
  function addPhoneNumber() {
    person.phoneNumbers.push(new ContactEntry("", "work"));
  }
  function addStreetAddress() {
    person.streetAddresses.push(new ContactEntry("", "work"));
  }
  function addGroup() {
    throw new NotImplemented();
  }
  function addNotes() {
    person.notes = " ";
  }

  async function save() {
    try {
      await person.save();
    } catch (ex) {
      showError(ex);
    }
  }
</script>

<style>
  .person-page {
    padding: 8px;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%) inset;

    /** for media query */
    container-type: inline-size;
    container-name: right-page;
  }
  .main-left {
    margin-inline-start: -16px;
    margin-inline-end: -8px;
    margin-block-end: -8px;
  }
  .main-info {
    margin-inline-start: 12px;
    margin-block-start: 16px;
    margin-block-end: 16px;
  }
  .name :global(input),
  .name {
    font-size: 18px;
    font-weight: bold;
    margin-block-end: 8px;
    color: inherit;
  }
  .names {
    margin-inline-end: 42px;
  }
  .names input {
    margin-block-end: 4px;
  }
  .person-page[language="fr"] .names input.lastname {
    text-transform: uppercase;
  }
  .job-company {
    color: grey;
  }
  .job-company :global(.actions),
  .job-company :global(.value) {
    margin-block-start: 2px;
  }
  .main-right {
    margin: 8px;
    flex-wrap: wrap;
  }
  .main-call {
    align-items: start;
    margin-block-start: 8px;
    margin-inline-end: 10px;
  }
  .main-call :global(> *) {
    margin-inline-end: 10px;
  }
  .main-right-top {
    justify-content: end;
    align-items: start;
    margin-block-start: px;
  }
  .preferred {
    margin-block-start: 8px;
    margin-block-end: 8px;
    font-size: 13px;
  }
  .phone-call :global(.icon) {
    /* because the icon is 1px smaller */
    margin: 1px;
  }
  grid.boxes {
    grid-template-columns: 1fr 1fr;
  }
  h3,
  .person-page :global(.group .header h3) {
    margin-inline-start: 10px;
    margin-block-start: 0px;
    margin-block-end: 0px;
    font-size: 14px;
    vertical-align: middle;
  }
  .notes {
    margin: 4px;
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
  grid.boxes {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  @container right-page (max-width: 600px) {
    grid.boxes {
      display: grid;
      grid-template-columns: 1fr;
    }
  }
  grid.items {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: start;
  }
  .expanders {
    margin-block-start: 12px;
  }
  .actions {
    justify-content: end;
  }
  :global(.group:not(:hover)) .actions {
    visibility: hidden;
  }
  .person-page :global(.group .actions.contact-entry button) {
    color: #9894A0;
  }
  .person-page :global(.group button.add),
  .preferred {
    color: grey;
  }
  .phone :global(path) {
    fill: transparent;
    stroke: #27c1aa;
  }
</style>
