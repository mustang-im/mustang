<vbox class="person-details">
  <grid>
    <hbox class="label">Full name</hbox>
    <hbox class="field name">{person.name}</hbox>

    <hbox class="label">First name</hbox>
    <hbox class="field name">{person.firstName}</hbox>

    <hbox class="label">Last name</hbox>
    <hbox class="field name">{person.lastName}</hbox>

    <hbox class="label">E-Mail addresses</hbox>
    <vbox>
      {#each person.emailAddresses as emailAddress}
        <hbox class="field email-address">{emailAddress}</hbox>
      {/each}
    </vbox>

    <hbox class="label">Phone numbers</hbox>
    <vbox>
      {#each person.phoneNumbers as phoneNumber}
        <hbox class="field phone-number">{phoneNumber}</hbox>
      {/each}
    </vbox>
  </grid>
</vbox>

<script lang="ts">
  import type { Person } from "../../logic/Person/Person";

  export let person: Person;
</script>

<style>
  .person-details {
    flex: 1 0 0;
  }
  grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
</style>
