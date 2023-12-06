<vbox flex class="person-page">
  <GroupBox classes="person">
    <hbox flex class="main-left">
      <hbox flex>
        <PersonPicture {person} size={128} />
        <vbox flex class="main-info">
          <h1 class="name">{person.name}</h1>
          {#if person.position}
            <div class="position">{person.position}</div>
          {/if}
          {#if person.department}
            <div class="department">{person.department}</div>
          {/if}
          {#if person.company}
            <div class="company">{person.company}</div>
          {/if}
        </vbox>
      </hbox>
      <vbox flex class="main-right">
        <hbox class="main-call">
          <RoundButton label="Video call" icon={CameraIcon} iconSize="24px" />
          {#if preferredPhoneNumber}
            <a href="tel:{preferredPhoneNumber}" class="phone-call">
              <RoundButton label="Call" icon={CallIcon} iconSize="22px" />
            </a>
          {/if}
          <RoundButton label="Message" icon={ChatIcon} iconSize="24px" />
          {#if preferredEmailAddress}
            <a href="mailto:{preferredEmailAddress}">
              <RoundButton label="Send mail" icon={MailIcon} iconSize="24px" />
            </a>
          {/if}
        </hbox>
      </vbox>
      <!--
        <vbox flex class="names">
          <grid>
            <hbox class="label">First name</hbox>
            <hbox class="field name">{person.firstName}</hbox>

            <hbox class="label">Last name</hbox>
            <hbox class="field name">{person.lastName}</hbox>
          </grid>
        </vbox>
      -->
    </hbox>
  </GroupBox>

  <grid class="boxes">
    <GroupBox classes="phone">
      <hbox class="subtitle phone">
        <Icon data={PhoneIcon} size="16px" />
        <h3>Phone numbers</h3>
        <hbox flex class="actions">
          <Button on:click={addPhoneNumber} icon={AddIcon} iconOnly plain classes="add" />
        </hbox>
      </hbox>
      <grid class="items">
        {#each $phoneNumbers.each as entry}
          <ContactEntryUI {entry} coll={phoneNumbers}>
            <PhoneNumberDisplay slot="display" value={entry.value} />
            <PhoneNumberEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>

    <GroupBox classes="email">
      <hbox class="subtitle">
        <Icon data={MailIcon} size="16px" />
        <h3>Mail</h3>
        <hbox flex class="actions">
          <Button on:click={addEmail} icon={AddIcon} iconOnly plain classes="add" />
        </hbox>
      </hbox>
      <grid class="items">
        {#each $emailAddresses.each as entry}
          <ContactEntryUI {entry} coll={emailAddresses}>
            <EmailAddressDisplay slot="display" value={entry.value} />
            <EmailAddressEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>

    <GroupBox classes="chat">
      <hbox class="subtitle">
        <Icon data={ChatIcon} size="16px" />
        <h3>Chat</h3>
        <hbox flex class="actions">
          <Button on:click={addChatAccount} icon={AddIcon} iconOnly plain classes="add" />
        </hbox>
      </hbox>
      <grid class="items">
        {#each $chatAccounts.each as entry}
          <ContactEntryUI {entry} coll={chatAccounts}>
            <EmailAddressDisplay slot="display" value={entry.value} /><!-- TODO chat link -->
            <EmailAddressEdit slot="edit" bind:value={entry.value} /><!-- TODO chat editor -->
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>

    <GroupBox classes="categories">
      <hbox class="subtitle">
        <Icon data={ContactsIcon} size="16px" />
        <h3>Groups</h3>
        <hbox flex class="actions">
          <!--
          <Button on:click={addEmail} icon={AddIcon} iconOnly plain classes="add" />
          -->
        </hbox>
      </hbox>
      <grid class="items">
        {#each $groups.each as entry}
          <ContactEntryUI {entry} coll={groups}>
            <hbox slot="display">{entry.value}</hbox>
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>

    <GroupBox classes="street-addresses">
      <hbox class="subtitle">
        <Icon data={MailIcon} size="16px" />
        <h3>Street addresses</h3>
        <hbox flex class="actions">
          <Button on:click={addStreetAddress} icon={AddIcon} iconOnly plain classes="add" />
        </hbox>
      </hbox>
      <grid class="items">
        {#each $streetAddresses.each as entry}
          <ContactEntryUI {entry} coll={streetAddresses}>
            <StreetAddressDisplay slot="display" value={entry.value} />
            <StreetAddressEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
      </grid>
    </GroupBox>

    <GroupBox classes="preferences">
      <hbox class="subtitle">
        <Icon data={ChatIcon} size="16px" />
        <h3>Preferences</h3>
      </hbox>
      <vbox class="preferred">
        <hbox>Preferred communication tool</hbox>
        <hbox>WhatsApp</hbox>
        <hbox>[o] Notifications</hbox>
      </vbox>
  </GroupBox>

  </grid>

  <vbox flex class="notes">
    <textarea bind:value={person.notes} placeholder="Personal notes" />
  </vbox>
</vbox>

<script lang="ts">
  import { ContactEntry, type Person } from "../../logic/Abstract/Person";
  import Button from "../Shared/Button.svelte";
  import ContactEntryUI from "./ContactEntryUI.svelte";
  import EmailAddressDisplay from "./EmailAddressDisplay.svelte";
  import EmailAddressEdit from "./EmailAddressEdit.svelte";
  import GroupBox from "./GroupBox.svelte";
  import PhoneNumberDisplay from "./PhoneNumberDisplay.svelte";
  import PhoneNumberEdit from "./PhoneNumberEdit.svelte";
  import StreetAddressDisplay from "./StreetAddressDisplay.svelte";
  import StreetAddressEdit from "./StreetAddressEdit.svelte";
  import PersonPicture from "../Shared/PersonPicture.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import MailIcon from '../asset/icon/appBar/mail.svg?raw';
  import ChatIcon from '../asset/icon/appBar/chat.svg?raw';
  import ContactsIcon from '../asset/icon/appBar/contacts.svg?raw';
  import CameraIcon from '../asset/icon/appBar/meet.svg?raw';
  import CallIcon from '../asset/icon/meet/callVoice.svg?raw';
  import PhoneIcon from '../asset/icon/meet/call.svg?raw';
  import AddIcon from "lucide-svelte/icons/plus";

  export let person: Person;
  $: person.name = person.name ?? person.firstName + " " + person.lastName;

  $: emailAddresses = person.emailAddresses;
  $: phoneNumbers = person.phoneNumbers;
  $: chatAccounts = person.chatAccounts;
  $: streetAddresses = person.streetAddresses;
  $: groups = person.groups;
  $: preferredPhoneNumber = person.phoneNumbers.isEmpty ? null :
    person.phoneNumbers.find(p => p.preferred)?.value ||
    person.phoneNumbers.first.value;
    $: preferredEmailAddress = person.emailAddresses.isEmpty ? null :
    person.emailAddresses.find(p => p.preferred)?.value ||
    person.emailAddresses.first.value;

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
</script>

<style>
  .person-page {
    padding: 8px;
    font-size: 14px;
    background: url(../asset/background-repeat.png) repeat;
    background-color: #E6F2F1;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%) inset;
  }
  .person-page :global(.group) {
    background-color: white;
  }
  .main-info {
    margin-left: 24px;
    margin-top: 8px;
    margin-bottom: 16px;
  }
  h1.name {
    font-size: 18px;
    margin-bottom: 8px;
    color: inherit;
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
    margin-right: 8px;
    border-color: #DCDBDF;
  }
  .main-call :global(button) {
    border-color: #DCDBDF;
  }
  .phone-call :global(.icon) {
    /* because the icon is only 22px */
    margin: 1px;
  }
  grid.boxes {
    grid-template-columns: 1fr 1fr;
  }
  .subtitle {
    align-items: center;
    margin-bottom: 8px;
  }
  .subtitle h3 {
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
    outline: 2px solid #20AE9E;
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
