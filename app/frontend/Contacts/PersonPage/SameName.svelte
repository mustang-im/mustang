{#if $sameName?.hasItems}
  <GroupBox classes="merge" headerName={$t`Persons with the same name`}>
    <PersonsIcon size="16px" slot="icon" />
    <vbox class="merge" slot="content">
      {#if isEditing}
        <hbox class="intro">{$t`If these are the same person, you can merge these contacts into this contact`}</hbox>
      {/if}
      <grid class="other-person">
        {#each $sameName.each as other}
          <hbox on:click={() => catchErrors(() => openPerson(other))} class="linked-object">
            {#if other?.picture}
              <PersonPicture person={other} size={24} />
            {/if}
            <hbox class="name">{other.name}</hbox>
          </hbox>
          <hbox class="email-address">{other.emailAddresses.first?.value ?? ""}</hbox>
          <hbox class="addressbook-icon"
            style="color: {other.addressbook?.color ?? "black"}"
            title={other.addressbook?.name}>
            {#if isEditing || !appGlobal.isMobile}
              {#if typeof (other.addressbook?.icon) == "string"}
                <Icon data={other.addressbook.icon} />
              {:else}
                <AccountIcon />
              {/if}
            {/if}
          </hbox>
          <hbox class="addressbook">{other.addressbook?.name}</hbox>
          <hbox class="buttons">
            {#if isEditing || !appGlobal.isMobile}
              <Button label={$t`Merge`} iconOnly icon={MergeIcon} plain onClick={() => merge(other)} />
            {/if}
          </hbox>
        {/each}
      </grid>
  </vbox>
  </GroupBox>
{/if}

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { appGlobal } from "../../../logic/app";
  import GroupBox from "./GroupBox.svelte";
  import PersonPicture from "../Person/PersonPicture.svelte";
  import Button from "../../Shared/Button.svelte";
  import Icon from "../../Shared/Icon.svelte";
  import MergeIcon from "lucide-svelte/icons/combine";
  import PersonsIcon from "lucide-svelte/icons/users";
  import AccountIcon from "lucide-svelte/icons/book-user";
  import { catchErrors } from "../../Util/error";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let person: Person;
  export let isEditing = false;

  let sameName = new ArrayColl<Person>();
  $: findSameName(person);
  function findSameName(person: Person) {
    sameName.clear();
    if (!person) {
      return;
    }
    for (let ab of appGlobal.addressbooks) {
      for (let other of ab.persons) {
        if (other && other != person &&
          other.name?.toLowerCase() == person?.name?.toLowerCase()) {
          sameName.add(other);
        }
      }
    }
  }

  function openPerson(other: Person) {
    person = other;
  }

  async function merge(other: Person) {
    if (!confirm($t`Do you want to merge the 2 contacts, i.e. copy the data from the other contact into this contact, and delete the other contact?`)) {
      return;
    }
    await person.merge(other);
    person = person;
    await other.deleteIt();
    await person.save();
  }
</script>

<style>
  .intro {
    margin-block-start: 8px;
    margin-block-end: 12px;
  }
  .other-person {
    align-items: center;
    margin-block-end: 4px;
    flex-wrap: wrap;
  }
  .linked-object {
    align-items: center;
    color: var(--link-fg);
  }
  .linked-object:hover {
    color: var(--link-hover-fg);
    text-decoration: underline;
  }
  grid.other-person {
    grid-template-columns: auto auto auto auto;
    column-gap: 8px
  }
  .other-person,
  .email-address,
  .addressbook {
    white-space: nowrap;
    overflow: hidden;
  }
  .addressbook-icon :global(svg) {
    width: 16px;
    height: 16px;
  }
  .addressbook {
    align-items: start;
    opacity: 50%;
    max-width: 5em;
    display: none;
  }
  .addressbook-icon,
  .buttons {
    align-items: start;
  }
  .other-person:not(:hover) .buttons {
    visibility: hidden;
  }
</style>
