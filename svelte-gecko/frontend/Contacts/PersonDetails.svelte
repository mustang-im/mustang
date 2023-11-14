<vbox flex class="person-page">
  <GroupBox classes="person">
    <hbox flex class="main-left">
      <hbox flex>
        <vbox class="image">
          <img
            src={person.picture}
            width="128" height="128"
            title="Picture of {person.name}"
            alt="Picture of {person.name}" />
        </vbox>
        <vbox flex class="main-info">
          <h1 class="name">{person.name}</h1>
          <div class="position">Designer</div>
        </vbox>
      </hbox>
      <vbox flex class="main-right">
        <hbox class="main-call">
          <Button label="Video call" iconOnly>
            <Icon data={camera} slot="icon" size="24px" />
          </Button>
          {#if preferredPhoneNumber}
            <a href="tel:{preferredPhoneNumber}">
              <Button label="Call" iconOnly>
                <hbox slot="icon" style="font-size: 20px; width: 24px; height: 24px; align-items: center; justify-content: center;">📞</hbox>
              </Button>
            </a>
          {/if}
          <Button label="Message" iconOnly>
            <Icon data={chat} slot="icon" size="24px" />
          </Button>
          {#if preferredEmailAddress}
            <a href="tel:{preferredEmailAddress}">
              <Button label="Send mail" iconOnly>
                <Icon data={mail} slot="icon" size="24px" />
              </Button>
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
      <hbox class="subtitle">
        <hbox>📞</hbox>
        <h3>Phone numbers</h3>
      </hbox>
      <grid class="items">
        {#each person.phoneNumbers.each as entry}
          <ContactEntryUI {entry}>
            <PhoneNumberDisplay slot="display" value={entry.value} />
            <PhoneNumberEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
        <hbox flex class="actions">
          <Button on:click={addEmail} iconOnly plain classes="add">
            <hbox slot="icon">+</hbox>
          </Button>
        </hbox>
      </grid>
    </GroupBox>

    <GroupBox classes="email">
      <hbox class="subtitle">
        <Icon data={mail} size="16px" />
        <h3>Mail</h3>
      </hbox>
      <grid class="items">
        {#each person.emailAddresses.each as entry}
          <ContactEntryUI {entry}>
            <EmailAddressDisplay slot="display" value={entry.value} />
            <EmailAddressEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
        <hbox flex class="actions">
          <Button on:click={addEmail} iconOnly plain classes="add">
            <hbox slot="icon">+</hbox>
          </Button>
        </hbox>
      </grid>
    </GroupBox>

    <GroupBox classes="chat">
      <hbox class="subtitle">
        <Icon data={chat} size="16px" />
        <h3>Chat</h3>
      </hbox>
      <grid class="items">
        {#each person.chatAccount.each as entry}
          <ContactEntryUI {entry}>
            <EmailAddressDisplay slot="display" value={entry.value} />
            <EmailAddressEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
        <hbox flex class="actions">
          <Button on:click={addEmail} iconOnly plain classes="add">
            <hbox slot="icon">+</hbox>
          </Button>
        </hbox>
      </grid>
    </GroupBox>

    <GroupBox classes="categories">
      <hbox class="subtitle">
        <Icon data={contacts} size="16px" />
        <h3>Groups</h3>
      </hbox>
      <grid class="items">
        {#each person.groups.each as entry}
          <ContactEntryUI {entry}>
            <hbox slot="display">{entry.value}</hbox>
          </ContactEntryUI>
        {/each}
        <hbox flex class="actions">
          <Button on:click={addEmail} iconOnly plain classes="add">
            <hbox slot="icon">+</hbox>
          </Button>
        </hbox>
      </grid>
    </GroupBox>

    <GroupBox classes="street-addresses">
      <hbox class="subtitle">
        <Icon data={mail} size="16px" />
        <h3>Street addresses</h3>
      </hbox>
      <grid class="items">
        {#each person.streetAddresses.each as entry}
          <ContactEntryUI {entry}>
            <StreetAddressDisplay slot="display" value={entry.value} />
            <StreetAddressEdit slot="edit" bind:value={entry.value} />
          </ContactEntryUI>
        {/each}
        <hbox flex class="actions">
          <Button on:click={addEmail} iconOnly plain classes="add">
            <hbox slot="icon">+</hbox>
          </Button>
        </hbox>
      </grid>
    </GroupBox>

    <GroupBox classes="preferences">
      <hbox class="subtitle">
        <Icon data={chat} size="16px" />
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
  import type { Person } from "../../logic/Abstract/Person";
  import Button from "../Shared/Button.svelte";
  import ContactEntryUI from "./ContactEntryUI.svelte";
  import EmailAddressDisplay from "./EmailAddressDisplay.svelte";
  import EmailAddressEdit from "./EmailAddressEdit.svelte";
  import GroupBox from "./GroupBox.svelte";
  import PhoneNumberDisplay from "./PhoneNumberDisplay.svelte";
  import PhoneNumberEdit from "./PhoneNumberEdit.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import mail from '../asset/icon/appBar/mail.svg?raw';
  import chat from '../asset/icon/appBar/chat.svg?raw';
  import contacts from '../asset/icon/appBar/contacts.svg?raw';
  import camera from '../asset/icon/appBar/meet.svg?raw';
  import StreetAddressDisplay from "./StreetAddressDisplay.svelte";
  import StreetAddressEdit from "./StreetAddressEdit.svelte";

  export let person: Person;
  $: person.name = person.firstName + " " + person.lastName;

  $: preferredPhoneNumber = person.phoneNumbers.isEmpty ? null :
    person.phoneNumbers.find(p => p.preferred)?.value ||
    person.phoneNumbers.first.value;
    $: preferredEmailAddress = person.emailAddresses.isEmpty ? null :
    person.emailAddresses.find(p => p.preferred)?.value ||
    person.emailAddresses.first.value;

    function addEmail() {
    }
</script>

<style>
  .person-page {
    margin: 8px;
    font-size: 14px;
    background: url(../asset/chat/background-repeat.jpg) repeat;
  }
  .person-page :global(.group) {
    background-color: white;
  }
  .image {
    width: 128px;
    height: 128px;
    clip-path: circle();
  }
  .main-info {
    margin-left: 24px;
    margin-top: 8px;
    margin-bottom: 16px;
  }
  h1.name {
    font-size: 18px;
    margin-bottom: 8px;
  }
  .position {
    color: grey;
  }
  .main-right {
    margin: 16px;
  }
  .preferred {
    margin-top: 16px;
    margin-bottom: 24px;
  }
  .main-call :global(> *) {
    margin-right: 4px;
  }
  grid.boxes {
    grid-template-columns: 1fr 1fr;
  }
  .subtitle {
    align-items: center;
  }
  h3 {
    margin-left: 10px;
    font-size: 14px;
  }
  h3 > :global(svg) {
    color: transparent;
  }
  .notes {
    margin: 8px;
    margin-right: 26px;
  }
  .notes textarea {
    height: 100%;
    min-height: 10em;
    width: 100%;
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
    margin-top: 8px;
  }
  .person-page :global(.group button) {
    color: #333333;
  }
  .person-page :global(.group button.add),
  .preferred {
    color: grey;
  }

  .person-page :global(svg) { /* TODO fix icons */
    color: transparent;
  }
</style>
