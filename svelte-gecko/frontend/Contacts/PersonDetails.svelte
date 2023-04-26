<vbox class="person-details">
  <h1>{person.name}</h1>
  <grid>

    <hbox class="label">First name</hbox>
    <hbox class="field name">{person.firstName}</hbox>

    <hbox class="label">Last name</hbox>
    <hbox class="field name">{person.lastName}</hbox>
  </grid>

  <hbox>
    <ContactList entries={person.phoneNumbers}>
      <h3 slot="title">Phone numbers</h3>
    </ContactList>
    <ContactList entries={person.emailAddresses}>
      <h3 slot="title">Email addresses</h3>
    </ContactList>
  </hbox>
</vbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import ContactList from "./ContactList.svelte";

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
</style>
