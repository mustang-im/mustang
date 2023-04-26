<vbox class="contact-list">
  <slot name="title" />
  <grid>
    {#each entries.each as entry}
      <ContactEntryUI {entry}>
        <slot title="edit" name="edit" />
        <slot title="display" name="display" />
      </ContactEntryUI>
    {/each}
  </grid>
</vbox>

<script lang="ts">
  import ContactEntryUI from "./ContactEntryUI.svelte";
  import type { ContactEntry } from "../../logic/Abstract/Person";
  import type { Collection } from "svelte-collections";

  export let entries: Collection<ContactEntry>;
</script>

<style>
  .contact-list {
    flex: 1 0 0;
    margin: 16px 24px 32px 0;
  }
  grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    margin-top: 16px;
  }
</style>
