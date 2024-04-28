<AppObject obj={recipient.person}>
  <value title={recipient.emailAddress}>
    {recipient.name || recipient.emailAddress}
  </value>
</AppObject>

<script lang="ts">
  import type { PersonEmailAddress } from "../../../logic/Mail/EMail";
  import { Person, ContactEntry } from "../../../logic/Abstract/Person";
  import AppObject from "../../AppsBar/AppObject.svelte";

  export let recipient: PersonEmailAddress;

  // Using `||` instead of `??` above, so that the fallback also works for `name == ""`

  $: recipient && createPersonOnDemand()
  /** Allow to click on a person and see it in the Contacts page. */
  function createPersonOnDemand() {
    if (!recipient.person) {
      recipient.person = new Person();
      recipient.person.name = recipient.name;
      recipient.person.emailAddresses.add(new ContactEntry(recipient.emailAddress, "Primary"));
    }
  }
</script>
