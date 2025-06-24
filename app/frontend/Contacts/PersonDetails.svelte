<vbox flex class="person-page font-small">
  <NameBox {person} />

  <Splitter initialRightRatio={1} name="contact-history">
    <vbox class="boxes" slot="left">
      {#if showEmail}
        <GroupBox classes="email">
          <svelte:fragment slot="header">
            <Icon data={MailIcon} size="16px" />
            <h3 class="font-small">{$t`Mail`}</h3>
            <hbox flex class="header actions">
              <Button on:click={addEmail} icon={AddIcon} iconOnly plain classes="add" />
            </hbox>
          </svelte:fragment>
          <grid class="items" slot="content">
            {#each $emailAddresses.each as entry}
              <ContactEntryUI {entry} coll={emailAddresses}
                on:save={save} bind:isEditing={isEditingContacts}>
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
            <hbox flex class="header actions">
              <Button on:click={addChatAccount} icon={AddIcon} iconOnly plain classes="add" />
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
            <h3 class="font-small">{$t`Phone numbers`}</h3>
            <hbox flex class="header actions">
              <Button on:click={addPhoneNumber} icon={AddIcon} iconOnly plain classes="add" />
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

      {#if showStreet}
        <GroupBox classes="street-addresses">
          <svelte:fragment slot="header">
            <Icon data={MailIcon} size="16px" />
            <h3 class="font-small">{$t`Street addresses`}</h3>
            <hbox flex class="header actions">
              <Button on:click={addStreetAddress} icon={AddIcon} iconOnly plain classes="add" />
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
            <h3 class="font-small">{$t`Groups`}</h3>
            <hbox flex class="header actions">
              <!--
              <Button on:click={addEmail} icon={AddIcon} iconOnly plain classes="add" />
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

    <vbox class="history" slot="right" />

  </Splitter>
</vbox>

<script lang="ts">
  import { ContactEntry, type Person } from "../../logic/Abstract/Person";
  import ContactEntryUI from "./ContactEntryUI.svelte";
  import EmailAddressDisplay from "./EmailAddressDisplay.svelte";
  import EmailAddressEdit from "./EmailAddressEdit.svelte";
  import GroupBox from "./GroupBox.svelte";
  import PhoneNumberDisplay from "./PhoneNumberDisplay.svelte";
  import PhoneNumberEdit from "./PhoneNumberEdit.svelte";
  import StreetAddressDisplay from "./StreetAddressDisplay.svelte";
  import StreetAddressEdit from "./StreetAddressEdit.svelte";
  import SameName from "./SameName.svelte";
  import ExpanderButtons from "../Shared/ExpanderButtons.svelte";
  import ExpanderButton from "../Shared/ExpanderButton.svelte";
  import Button from "../Shared/Button.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import MailIcon from '../asset/icon/appBar/mail.svg?raw';
  import ChatIcon from '../asset/icon/appBar/chat.svg?raw';
  import ContactsIcon from '../asset/icon/appBar/contacts.svg?raw';
  import PhoneIcon from '../asset/icon/meet/call.svg?raw';
  import AddIcon from "lucide-svelte/icons/plus";
  import { showError } from "../Util/error";
  import { t } from "../../l10n/l10n";
  import Splitter from "../Shared/Splitter.svelte";
  import NameBox from "./NameBox.svelte";

  export let person: Person;

  $: emailAddresses = person.emailAddresses;
  $: phoneNumbers = person.phoneNumbers;
  $: chatAccounts = person.chatAccounts;
  $: streetAddresses = person.streetAddresses;
  $: groups = person.groups;

  let isEditingContacts: boolean;
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
  .person-page :global(grid.items) {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: start;
  }
  .person-page :global(.group button.add) {
    color: grey;
  }
  .expanders {
    margin-block-start: 12px;
  }
  .header.actions {
    justify-content: end;
  }
  :global(.group:not(:hover)) .header.actions {
    visibility: hidden;
  }
  .person-page :global(.group button.add) {
    color: grey;
  }
  .phone :global(path) {
    fill: transparent;
    stroke: #27c1aa;
  }
  .notes {
    margin-block-start: 16px;
  }
</style>
