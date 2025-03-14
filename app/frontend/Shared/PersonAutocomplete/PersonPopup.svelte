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
          bind:value={personUID.name}
          bind:this={nameInputEl}
          on:keydown={(event) => onKeyEnter(event, onClose)}
          placeholder={$t`Enter a name for the person`} />
        <input class="email" type="email"
          bind:value={personUID.emailAddress}
          placeholder={$t`Email address to be used here`} />
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
          label={$t`Edit name and email address`}
          icon={EditIcon}
          on:click={() => isEditing = true}
          {disabled}
          />
      </vbox>
    {/if}
  </hbox>
  {#if $personUID.name == $personUID.emailAddress && nameInputEl == document.activeElement}
    <hbox class="helptext">{$t`Add the name of the person, and press ENTER`}</hbox>
  {/if}
  {#if !disabled}
    {#if person?.emailAddresses.hasItems}
      <vbox class="other-email-addresses">
        {#each person.emailAddresses.each as altContactEntry}
          {#if contactEntry != altContactEntry}
            <hbox class="other-email-address" on:click={() => catchErrors(() => useOtherEmailAddress(altContactEntry.value))}>
              <MailIcon size={12} />
              {altContactEntry.value}
            </hbox>
          {/if}
        {/each}
      </vbox>
    {/if}
    <hbox class="addressbooks" class:top-border={person?.emailAddresses.length > 1}>
      <AddressbookChanger {person} />
    </hbox>
    <hbox class="bottom buttons">
      <Button plain
        label={$t`Edit`}
        onClick={onEditPerson}
        />
      <Button plain
        label={$t`Remove`}
        onClick={onRemovePerson}
        />
      <slot name="buttons" {personUID} />
    </hbox>
  {/if}
</vbox>
<svelte:window on:click={onClickOutside} />

<script lang="ts">
  import { kDummyPerson, PersonUID } from "../../../logic/Abstract/PersonUID";
  import type { ContactEntry, Person } from "../../../logic/Abstract/Person";
  import { openUIFor } from "../../AppsBar/changeTo";
  import { appGlobal } from "../../../logic/app";
  import AddressbookChanger from "../../Contacts/AddressbookChanger.svelte";
  import PersonPicture from "../Person/PersonPicture.svelte";
  import Button from "../Button.svelte";
  import RoundButton from "../RoundButton.svelte";
  import AvatarFallbackIcon from "lucide-svelte/icons/user";
  import EditIcon from "lucide-svelte/icons/pencil";
  import CheckIcon from "lucide-svelte/icons/check";
  import MailIcon from "lucide-svelte/icons/mail";
  import { onKeyEnter } from "../../Util/util";
  import { backgroundError, catchErrors } from "../../Util/error";
  import { createEventDispatcher, onMount } from 'svelte';
  import { t } from "../../../l10n/l10n";
  const dispatch = createEventDispatcher<{ removePerson: PersonUID, close: void }>();

  export let personUID: PersonUID;

  let person: Person;
  let contactEntry: ContactEntry;
  let isEditing = false;
  let disabled = false;
  let nameInputEl: HTMLInputElement;

  onMount(() => {
    if (nameInputEl) {
      nameInputEl.select();
    }
  });
  $: nameInputEl?.focus();

  $: onLoad(personUID);
  function onLoad(personUID: PersonUID) {
    personUID ??= new PersonUID();
    personUID.emailAddress ??= kDummyPerson.emailAddress;
    person = personUID.createPerson();
    contactEntry = person.emailAddresses.find(c => c.value == personUID.emailAddress);
    isEditing = (!person.addressbook || person.addressbook == appGlobal.collectedAddressbook) && !disabled;
  }

  function onClose() {
    onSave()
      .catch(backgroundError);
    dispatch("close");
  }
  function onClickInside(event: MouseEvent) {
    event.stopPropagation();
  }
  function onClickOutside(event: MouseEvent) {
    onClose();
  }
  async function onSave() {
    let person = personUID.createPerson();
    person.name = personUID.name;
    contactEntry.value = personUID.emailAddress;
    if (!person.addressbook) {
      person.addressbook = appGlobal.personalAddressbook;
      person.addressbook.persons.add(person);
    }
    await person.save();
  }
  function onEditPerson() {
    onClose();
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
    margin-block-end: 3px;
  }
  .name-primary-mail,
  .name-primary-mail input {
    font-size: 15px;
  }
  input {
    font-size: 15px;
    min-width: 15em;
  }
  .helptext {
    font-size: 14px;
    max-width: 15em;
    margin: 0px 24px;
    opacity: 50%;
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
    margin-inline-end: 6px;
  }
  .addressbooks {
    padding: 12px;
    max-width: 280px;
  }
  .addressbooks.top-border {
    border-top: 1px solid var(--border);
  }
  .addressbooks:not(.top-border) {
    margin-block-start: -6px;
    padding-block-start: 0px;
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
