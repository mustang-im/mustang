<vbox flex class="person-page">
  <vbox flex class="person-info">
    <h1 class="name">{person.name}</h1>
    <hbox class="main-info">
      <vbox class="image">
        <img
          src={person.picture}
          width="128" height="128"
          title="Picture of {person.name}"
          alt="Picture of {person.name}" />
      </vbox>
      <vbox flex class="names">
        <grid>
          <hbox class="label">First name</hbox>
          <hbox class="field name">{person.firstName}</hbox>

          <hbox class="label">Last name</hbox>
          <hbox class="field name">{person.lastName}</hbox>
        </grid>
      </vbox>
    </hbox>

    <hbox class="contact-buttons">
      {#if preferredPhoneNumber}
        <a href="tel:{preferredPhoneNumber}"><button class="big">📞</button></a>
      {/if}
      {#if preferredEmailAddress}
        <a href="mailto:{preferredEmailAddress}"><button class="big">✉</button></a>
      {/if}
    </hbox>

    <hbox class="contact-info">
      <vbox class="contact-list">
        <h3>Phone numbers</h3>
        <grid>
          {#each person.phoneNumbers.each as entry}
            <ContactEntryUI {entry}>
              <PhoneNumberDisplay slot="display" value={entry.value} />
              <PhoneNumberEdit slot="edit" bind:value={entry.value} />
              <svelte:fragment slot="actions">
                <a href="tel:{entry.value}">📞</a>
              </svelte:fragment>
            </ContactEntryUI>
          {/each}
          <hbox></hbox>
          <hbox></hbox>
          <hbox flex class="actions">
            <button class="simple">+</button>
          </hbox>
      </grid>
      </vbox>
    
      <vbox flex class="contact-list">
        <h3>Email addresses</h3>
        <grid>
          {#each person.emailAddresses.each as entry}
            <ContactEntryUI {entry}>
              <EmailAddressDisplay slot="display" value={entry.value} />
              <EmailAddressEdit slot="edit" bind:value={entry.value} />
              <svelte:fragment slot="actions">
                <a href="mailto:{entry.value}">✉</a>
              </svelte:fragment>
            </ContactEntryUI>
          {/each}
          <hbox></hbox>
          <hbox></hbox>
          <hbox flex class="actions">
            <button class="simple">+</button>
          </hbox>
        </grid>
      </vbox>
    </hbox>

    <vbox flex class="notes">
      <h3>Notes</h3>
      <textarea bind:value={person.notes} />
    </vbox>
  </vbox>

  <vbox flex class="recent-messages">
    {#if mailMessages }
      <vbox flex class="mails">
        <h3>Mails</h3>
      </vbox>
    {/if}
    {#if chatMessages }
      <vbox flex class="chat">
        <h3>Chat</h3>
        <vbox flex class="chat-messages">
            <MessageList messages={chatMessages} />
        </vbox>
        <vbox class="editor">
          <MsgEditor to={chatPerson} from={chatAccount} />
        </vbox>
      </vbox>
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import ContactEntryUI from "./ContactEntryUI.svelte";
  import EmailAddressDisplay from "./EmailAddressDisplay.svelte";
  import EmailAddressEdit from "./EmailAddressEdit.svelte";
  import PhoneNumberDisplay from "./PhoneNumberDisplay.svelte";
  import PhoneNumberEdit from "./PhoneNumberEdit.svelte";
  import MessageList from "../Chat/MessageView/MessageList.svelte";
  import MsgEditor from "../Chat/MsgEditor.svelte";
  import { appGlobal } from "../../logic/app";

  export let person: Person;
  $: person.name = person.firstName + " " + person.lastName;

  $: preferredPhoneNumber = person.phoneNumbers.isEmpty ? null :
    person.phoneNumbers.find(p => p.preferred)?.value ||
    person.phoneNumbers.first.value;
    $: preferredEmailAddress = person.emailAddresses.isEmpty ? null :
    person.emailAddresses.find(p => p.preferred)?.value ||
    person.emailAddresses.first.value;

  $: chatAccount = appGlobal.chatAccounts?.first;
  $: chatPerson = chatAccount?.persons.find(p => p.id == person.id);
  $: chatMessages = chatAccount?.chats.get(chatPerson)?.messages;
  $: mailMessages = null;
</script>

<style>
  .person-info,
  .recent-messages h3 {
    margin-left: 32px;
    margin-right: 32px;
  }
  h1.name {
    margin-top: 32px;
    margin-bottom: 16px;
  }
  h3 {
    margin-top: 16px;
    margin-bottom: 8px;
  }
  .names {
    margin: 0 48px;
  }
  .image {
    width: 128px;
    height: 128px;
    margin: 10px;
    clip-path: circle();
  }
  .contact-buttons {
    margin-top: 32px;
  }
  .contact-buttons a {
    margin-right: 12px;
  }
  .contact-buttons button {
    padding: 12px;
  }
  .notes {
    margin-bottom: 32px;
  }
  .notes textarea {
    height: 100%;
    width: 100%;
    border: none;
    font-family: sans-serif;
  }
  grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
  .contact-list {
    margin: 16px 24px 24px 0;
  }
  .contact-list grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
  }
  .contact-list .actions {
    justify-content: center;
  }
</style>
