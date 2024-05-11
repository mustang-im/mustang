<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox class="person-popup" on:click={onClickInside}>
  <hbox class="picture-name">
    <vbox class="picture">
      {#if person?.picture}
        <PersonPicture {person} size={32} />
      {:else}
        <RoundButton
          icon={AvatarFallbackIcon}
          iconSize="24px" filled
          onClick={onEditPerson}
          />
      {/if}
    </vbox>
    {#if isEditing}
      <vbox class="name-primary-mail" flex>
        <input class="name" type="text"
          bind:value={$personUID.name}
          on:input={onSaveDebounced}
          placeholder="Enter a name for the person" />
        <input class="email" type="email"
          bind:value={$personUID.emailAddress}
          on:input={onSaveDebounced}
          placeholder="Email address to be used here" />
      </vbox>
      <!--
      <vbox class="top-right buttons">
        <Button plain iconOnly iconSize="14px"
          label="Save"
          icon={CheckIcon}
          onClick={onSave}
          />
      </vbox>
      -->
    {:else}
      <vbox class="name-primary-mail" flex>
        <value class="name">{$personUID.name}</value>
        <value class="email">{$personUID.emailAddress}</value>
      </vbox>
      <vbox class="top-right buttons">
        <Button plain iconOnly iconSize="14px"
          label="Edit name and email address"
          icon={EditIcon}
          on:click={() => isEditing = true}
          />
      </vbox>
    {/if}
  </hbox>
  {#if person?.emailAddresses.hasItems}
    <vbox class="other-email-addresses">
      {#each person.emailAddresses.each as altContactEntry}
        {#if contactEntry != altContactEntry}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <hbox class="other-email-address" on:click={() => catchErrors(() => useOtherEmailAddress(altContactEntry.value))}>
            <MailIcon size={12} />
            {altContactEntry.value}
          </hbox>
        {/if}
      {/each}
    </vbox>
  {/if}
  <hbox class="addressbooks" class:top-border={person?.emailAddresses.length > 1}>
    <AddressbookSelector addressbooks={appGlobal.addressbooks} bind:selectedAddressbook />
  </hbox>
  <hbox class="bottom buttons">
    <Button plain
      label="Edit"
      onClick={onEditPerson}
      />
    <Button plain
      label="Remove"
      onClick={onRemovePerson}
      />
    <slot name="buttons" {personUID} />
  </hbox>
</vbox>
<svelte:window on:click={onClickOutside} />

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import type { ContactEntry, Person } from "../../../logic/Abstract/Person";
  import type { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { openUIFor } from "../../AppsBar/changeTo";
  import { appGlobal } from "../../../logic/app";
  import PersonPicture from "../Person/PersonPicture.svelte";
  import Button from "../Button.svelte";
  import RoundButton from "../RoundButton.svelte";
  import AvatarFallbackIcon from "lucide-svelte/icons/user";
  import EditIcon from "lucide-svelte/icons/pencil";
  import CheckIcon from "lucide-svelte/icons/check";
  import MailIcon from "lucide-svelte/icons/mail";
  import { catchErrors } from "../../Util/error";
  import { useDebounce } from "@svelteuidev/composables";
  import { createEventDispatcher } from 'svelte';
  import AddressbookSelector from "../../Contacts/AddressbookSelector.svelte";
  const dispatch = createEventDispatcher<{ removePerson: PersonUID, close: void }>();

  export let personUID: PersonUID;

  let person: Person;
  let contactEntry: ContactEntry;
  let addressbook: Addressbook;
  let selectedAddressbook: Addressbook;
  let isEditing = false;

  $: onLoad(personUID);
  function onLoad(personUID: PersonUID) {
    person = personUID.createPerson();
    contactEntry = person.emailAddresses.find(c => c.value == personUID.emailAddress);
    addressbook = selectedAddressbook = appGlobal.addressbooks.find(ab => ab.persons.contains(person));
    isEditing = !addressbook || appGlobal.collectedAddressbook.persons.contains(person);
  }

  $: catchErrors(() => onChangeAddressbook(selectedAddressbook));
  async function onChangeAddressbook(newAddressbook: Addressbook) {
    if (addressbook == newAddressbook) {
      return;
    }
    addressbook?.persons.remove(person);
    newAddressbook.persons.add(person);
    person.addressbook = addressbook = newAddressbook;
    await person.save();
  }

  function onClickInside(event: MouseEvent) {
    event.stopPropagation();
  }
  function onClickOutside(event: MouseEvent) {
    dispatch("close");
  }
  const onSaveDebounced = useDebounce(() => catchErrors(onSave), 1000);
  async function onSave() {
    let person = personUID.createPerson();
    person.name = personUID.name;
    contactEntry.value = personUID.emailAddress;
    if (!addressbook) {
      addressbook = appGlobal.addressbooks.find(ab => ab.persons.contains(person));
    }
    if (!addressbook) {
      addressbook = appGlobal.personalAddressbook;
      addressbook.persons.add(person);
    }
    await person.save();
  }
  function onEditPerson() {
    dispatch("close");
    openUIFor(personUID.createPerson());
  }
  function onRemovePerson() {
    console.log("remove contact");
    dispatch("removePerson", personUID);
  }
  function useOtherEmailAddress(emailAddress: string) {
    personUID.emailAddress = emailAddress;
    contactEntry = person.emailAddresses.find(c => c.value == personUID.emailAddress);
  }
</script>

<style>
  .person-popup {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    border-radius: 5px;
    box-shadow: 2.281px 1.14px 9.123px 0px rgba(var(--shadow-color), 20%);
  }
  @media (prefers-color-scheme: dark) {
    .person-popup {
      box-shadow: none;
    }
  }
  .picture {
    justify-content: center;
    margin: 0px 12px;
  }
  .name-primary-mail {
    margin: 12px 18px 12px 0px;
  }
  .name-primary-mail .name {
    margin-bottom: 3px;
  }
  .name-primary-mail,
  .name-primary-mail input {
    font-size: 15px;
  }
  input {
    font-size: 15px;
    min-width: 15em;
  }
  .top-right.buttons {
    justify-content: start;
    align-items: end;
    margin: 8px 8px;
  }
  .other-email-addresses {
    margin: 0px 12px 12px 68px;
  }
  .other-email-address {
    align-items: center;
    font-size: 13px;
    color: #555555;
    cursor: pointer;
  }
  .other-email-address :global(svg) {
    margin-right: 6px;
  }
  .addressbooks {
    padding: 12px;
  }
  .addressbooks.top-border {
    border-top: 1px solid var(--border);
  }
  .addressbooks:not(.top-border) {
    margin-top: -6px;
    padding-top: 0px;
  }
  .bottom.buttons {
    border-top: 1px solid var(--border);
  }
  .bottom.buttons > :global(button:not(:first-child)) {
    border-left: 1px solid var(--border);
  }
  .bottom.buttons > :global(button) {
    padding: 8px 16px;
    border-radius: 0px;
  }
</style>
