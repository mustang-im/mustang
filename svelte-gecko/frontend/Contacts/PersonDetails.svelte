<vbox class="person-details">
  <h1>{person.name}</h1>
  <grid>
    <hbox class="label">First name</hbox>
    <hbox class="field name">{person.firstName}</hbox>

    <hbox class="label">Last name</hbox>
    <hbox class="field name">{person.lastName}</hbox>
  </grid>

  <hbox>
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
      </grid>
    </vbox>
  
    <vbox class="contact-list">
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
      </grid>
    </vbox>
 </hbox>
</vbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import ContactEntryUI from "./ContactEntryUI.svelte";
  import EmailAddressDisplay from "./EmailAddressDisplay.svelte";
  import EmailAddressEdit from "./EmailAddressEdit.svelte";
  import PhoneNumberDisplay from "./PhoneNumberDisplay.svelte";
  import PhoneNumberEdit from "./PhoneNumberEdit.svelte";

  export let person: Person;
  $: person.name = person.firstName + " " + person.lastName;
</script>

<style>
  .person-details {
    flex: 1 0 0;
    margin: 30px;
  }
  grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
  h3 {
    margin-bottom: 0;
  }
  .contact-list {
    flex: 1 0 0;
    margin: 16px 24px 32px 0;
  }
  .contact-list grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    margin-top: 16px;
  }
</style>
