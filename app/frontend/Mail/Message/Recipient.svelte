<AppObject obj={recipient.person} createObject={recipient.person ? null : createPersonOnDemand}>
  <value class="name" title={recipient.emailAddress}>
    {recipient.name?.substring(0, 25) || recipient.emailAddress}
  </value>
  {#if !recipient.person && recipient.name}
    <value class="domain">
      @{getBaseDomainFromHost(getDomainForEmailAddress(recipient.emailAddress))}
    </value>
  {/if}
</AppObject>

<script lang="ts">
  import type { PersonEmailAddress } from "../../../logic/Mail/EMail";
  import { Person, ContactEntry } from "../../../logic/Abstract/Person";
  import { getDomainForEmailAddress, getBaseDomainFromHost } from "../../../logic/Mail/AutoConfig/fetchConfig";
  import { nameFromEmailAddress } from "../../../logic/Mail/AutoConfig/saveConfig";
  import AppObject from "../../AppsBar/AppObject.svelte";

  export let recipient: PersonEmailAddress;

  $: recipient.findPerson();

  // Using `||` instead of `??` above, so that the fallback also works for `name == ""`

  /** Allow to click on a person and see it in the Contacts page. */
  function createPersonOnDemand(): Person {
    if (recipient.person) {
      return recipient.person;
    }
    recipient.person = new Person();
    recipient.person.name = recipient.name || nameFromEmailAddress(recipient.emailAddress);
    recipient.person.emailAddresses.add(new ContactEntry(recipient.emailAddress, "Primary"));
    return recipient.person;
  }
</script>

<style>
  :global(.app-object):has(.name) {
    display: block;
  }
  .name {
    display: inline;
    margin-left: 4px;
  }
  .domain {
    display: inline;
    font-style: italic;
    margin-left: 4px;
  }
</style>
