<vbox class="person-details">
  <h1>{person.name}</h1>
  <grid>

    <hbox class="label">First name</hbox>
    <hbox class="field name">{person.firstName}</hbox>

    <hbox class="label">Last name</hbox>
    <hbox class="field name">{person.lastName}</hbox>

    <hbox class="label">E-Mail addresses</hbox>
    <vbox>
      {#each person.emailAddresses.each as emailAddress}
        <hbox class="field email-address">{emailAddress}</hbox>
      {/each}
    </vbox>

    <hbox class="label">Phone numbers</hbox>
    <vbox>
      {#each person.phoneNumbers.each as phoneNumber}
        <hbox class="field phone-number">{phoneNumber}</hbox>
      {/each}
    </vbox>
  </grid>
</vbox>

<script lang="ts">
  import type { Person } from "../../logic/Person/Person";

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
</style>
