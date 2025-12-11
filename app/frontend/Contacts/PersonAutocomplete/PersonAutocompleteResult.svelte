<hbox flex class="person">
  <PersonPicture person={person?.person} size={32} />
  <vbox flex class="right">
    <hbox class="top-row">
      <hbox flex class="name font-normal">{person.name}</hbox>
    </hbox>
    <hbox class="bottom-row">
      <hbox class="email-address font-small" let:person>
        {person.emailAddress}
      </hbox>
      <slot name="bottom-row" />
    </hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import PersonPicture from "../Person/PersonPicture.svelte";

  export let person: PersonUID;
</script>

<style>
  .person,
  .name {
    align-items: center;
  }
  .name {
  }
  .email-address {
    opacity: 50%;
    overflow: hidden;
    align-items: center;
  }
  .person :global(.avatar) {
    margin: 0px;
    margin-inline-end: 6px;
  }
  .top-row,
  .bottom-row {
    height: 16px;
    overflow: hidden;
    white-space: nowrap;
    align-items: center;
  }
</style>
