<hbox class="recent-persons">
  {#each lastPersons.getIndexRange(lastPersons.length - 5, lastPersons.length) as person}
    <PersonPicture {person} placeholder="icon" />
  {/each}
</hbox>

<script lang="ts">
  import PersonPicture from "../../Contacts/Person/PersonPicture.svelte";
  import { getContactsSelection } from "../../Contacts/Person/Selected";

  const { lastPersons } = getContactsSelection();

</script>

<style>
  .recent-persons {
    flex-wrap: wrap;
  }
  .recent-persons :global(> *) {
    margin-inline: 4px;
  }
</style>
