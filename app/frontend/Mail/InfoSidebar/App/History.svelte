{#if p}
  <vbox class="contact-history" flex>
    <hbox class="person-header">
      {#if p.picture}
        <PersonPicture person={p} />
      {/if}
      <hbox class="name font-normal">
        {p.name}
      </hbox>
    </hbox>

    <ContactHistory person={p} headerName="" />
  </vbox>
{/if}

<script lang="ts">
  import { PersonUID } from "../../../../logic/Abstract/PersonUID";
  import { EMail } from "../../../../logic/Mail/EMail";
  import ContactHistory from "../../../Contacts/History/ContactHistory.svelte";
  import PersonPicture from "../../../Contacts/Person/PersonPicture.svelte";

  /** which person the content is about - in only */
  export let person: PersonUID;
  /** which email the content is about - in only */
  export let message: EMail;

  $: p = person?.findPerson();
</script>

<style>
  .person-header {
    margin: 8px 12px;
  }
  .name {
    font-weight: bold;
  }
</style>
