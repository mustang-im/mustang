<hbox class="recipient"
  on:click={(event) => catchErrors(() => onOpen(event))}
  bind:this={anchor}
  class:is-contact={recipient.findPerson()}
  >
  <div class="name" title={recipient.name + "\n" + recipient.emailAddress}>
    {personDisplayName(recipient)}
  </div>
  {#if !recipient.findPerson()}
    {#if recipient.emailAddress}
      <div class="domain" title={recipient.emailAddress}>
        @{getBaseDomainFromHost(getDomainForEmailAddress(recipient.emailAddress))}
      </div>
    {:else}
      <hbox class="invalid">{$t`Invalid address`}</hbox>
    {/if}
  {/if}
</hbox>

<Menu bind:isMenuOpen={isPopupOpen} {anchor} placement="bottom-start">
  {#if existingPersons?.hasItems}
    <MenuLabel label={$t`Add ${recipient.emailAddress} to existing contact`} />
    {#each existingPersons.each as otherPerson}
      <MenuItem
        label="{otherPerson.name} - {otherPerson.emailAddresses.first?.value ?? otherPerson.chatAccounts.first?.value ?? otherPerson.name}"
        onClick={() => addToPerson(otherPerson)} />
    {/each}
  {/if}

  <MenuLabel label={$t`Add ${recipient.emailAddress} to addressbook`} />
  {#each appGlobal.addressbooks.each as addressbook}
    <MenuItem
      label={$t`Add to ${addressbook.name}`}
      onClick={() => addToAddressbook(addressbook)} />
  {/each}
</Menu>

<script lang="ts">
  import { type PersonUID, findPersonsWithName, personDisplayName } from "../../../logic/Abstract/PersonUID";
  import { ContactEntry, Person } from "../../../logic/Abstract/Person";
  import { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { openUIFor } from "../../AppsBar/changeTo";
  import { getBaseDomainFromHost, getDomainForEmailAddress } from "../../../logic/util/netUtil";
  import { appGlobal } from "../../../logic/app";
  import Menu from "../../Shared/Menu/Menu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../Shared/Menu/MenuLabel.svelte";
  import { catchErrors } from "../../Util/error";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let recipient: PersonUID;

  let anchor: HTMLDivElement;
  let isPopupOpen: boolean;
  let existingPersons: ArrayColl<Person>;

  function onOpen(event: Event) {
    event.stopPropagation();
    let person = recipient.findPerson(); // based on email address
    if (person) {
      openUIFor(person);
      return;
    }
    if (recipient.isProxyAddress) {
      return;
    }
    existingPersons = recipient.name ? findPersonsWithName(recipient.name) : null;
    isPopupOpen = true;
  }

  function addToAddressbook(addressbook: Addressbook) {
    let person = recipient.createPerson();
    addressbook.persons.add(person);
    recipient = recipient;
  }

  function addToPerson(otherPerson: Person) {
    otherPerson.emailAddresses.add(new ContactEntry(recipient.emailAddress));
    recipient.person = otherPerson;
  }
</script>

<style>
  :global(.app-object):has(.name) {
    display: block;
  }
  .recipient {
    cursor: pointer;
  }
  .recipient.is-contact:hover {
    color: var(--link-hover-fg);
  }
  .name {
    display: inline;
  }
  .domain,
  .invalid {
    display: inline;
    font-weight: normal;
    font-style: italic;
    margin-inline-start: 6px;
  }
</style>
