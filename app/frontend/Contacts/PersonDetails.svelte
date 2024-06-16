<vbox flex class="person-page" language={language2Char}>
  <GroupBox classes="person">
    <hbox flex class="main-left" slot="content">
      <hbox flex>
        <PersonPicture {person} size={128} />
        <vbox flex class="main-info">
          <hbox class="name">
            <EditableSimpleText bind:value={$person.name}
              on:save={save}
              bind:isEditing={isEditingName}
              placeholder="First name Last name" />
          </hbox>
          {#if isEditingName}
            <vbox class="names">
              <input type="text" bind:value={$person.firstName}
                class="firstname" placeholder="First name" />
              <input type="text" bind:value={$person.lastName}
                class="lastname" placeholder="Last name" />
            </vbox>
          {:else}
            {#if $person.position}
              <hbox class="position">
                <EditableSimpleText bind:value={$person.position} on:save={save} placeholder="Position" />
              </hbox>
            {/if}
            {#if $person.department}
              <hbox class="department">
                <EditableSimpleText bind:value={$person.department} on:save={save} placeholder="Department" />
              </hbox>
            {/if}
            {#if $person.company}
              <hbox class="company">
                <EditableSimpleText bind:value={$person.company} on:save={save} placeholder="First Lastname" />
              </hbox>
            {/if}
          {/if}
        </vbox>
      </hbox>
      <vbox flex class="main-right">
        <hbox class="main-call">
          <RoundButton label="Video call" icon={CameraIcon} classes="large secondary action"
            onClick={() => startVideoCall(person)} />
          {#if preferredPhoneNumber}
            <a href="tel:{preferredPhoneNumber}" class="phone-call">
              <RoundButton label="Call" icon={CallIcon} iconSize="19px" classes="large secondary action" />
            </a>
          {/if}
          <RoundButton label="Message" icon={ChatIcon} classes="large secondary action" />
          {#if preferredEmailAddress}
            <a href="mailto:{preferredEmailAddress}">
              <RoundButton label="Send mail" icon={MailIcon} classes="large secondary action" />
            </a>
          {/if}
        </hbox>
      </vbox>
    </hbox>
  </GroupBox>

  <grid class="boxes">
    <GroupBox classes="phone">
      <svelte:fragment slot="header">
        <hbox class="phone">
          <Icon data={PhoneIcon} size="16px" />
        </hbox>
        <h3>Phone numbers</h3>
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

    <GroupBox classes="email">
      <svelte:fragment slot="header">
        <Icon data={MailIcon} size="16px" />
        <h3>Mail</h3>
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

    <GroupBox classes="chat">
      <svelte:fragment slot="header">
        <Icon data={ChatIcon} size="16px" />
        <h3>Chat</h3>
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

    <GroupBox classes="categories">
      <svelte:fragment slot="header">
        <Icon data={ContactsIcon} size="16px" />
        <h3>Groups</h3>
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

    <GroupBox classes="street-addresses">
      <svelte:fragment slot="header">
        <Icon data={MailIcon} size="16px" />
        <h3>Street addresses</h3>
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

  </grid>

  <vbox flex class="notes">
    <textarea bind:value={person.notes} placeholder="Personal notes" />
  </vbox>
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
  import PersonPicture from "../Shared/Person/PersonPicture.svelte";
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
  import { showError } from "../Util/error";

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
  $: language2Char = navigator.language?.substring(0, 2) ?? "";

  let isEditingName: boolean;

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
    font-size: 14px;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%) inset;
  }
  .main-info {
    margin-left: 24px;
    margin-top: 8px;
    margin-bottom: 16px;
  }
  .name :global(input),
  .name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
    color: inherit;
  }
  .names {
    margin-right: 42px;
  }
  .names input {
    margin-bottom: 4px;
  }
  .person-page[language="fr"] .names input.lastname {
    text-transform: uppercase;
  }
  .position,
  .department,
  .company {
    color: grey;
  }
  .main-right {
    margin: 16px;
  }
  .preferred {
    margin-top: 8px;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .main-call :global(> *) {
    margin-right: 10px;
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
    margin-left: 10px;
    margin-top: 0px;
    margin-bottom: 0px;
    font-size: 14px;
    vertical-align: middle;
  }
  .notes {
    margin: 4px;
    border: 1px dashed #A8AEB5;
    border-radius: 2px;
  }
  .notes textarea {
    height: 100%;
    min-height: 10em;
    border: none;
    font-family: sans-serif;
    font-size: 14px;
    color: #555555;
    border: 1px dotted lightgray;
    padding: 8px;
  }
  .notes textarea::placeholder {
    color: grey;
  }
  .notes textarea:focus {
    outline: 2px solid var(--input-focus);
  }
  grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
  grid.items {
    display: grid;
    grid-template-columns: auto 1fr auto;
  }
  .actions {
    justify-content: end;
  }
  :global(.group:not(:hover)) .actions {
    visibility: hidden;
  }
  .person-page :global(.group button) {
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
