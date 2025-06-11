{#if $sameName?.hasItems}
  <GroupBox classes="merge">
    <svelte:fragment slot="header">
      <PersonsIcon size="16px" />
      <h3>{$t`Similar names`}</h3>
    </svelte:fragment>
    <vbox class="merge" slot="content">
      {#each $sameName.each as other}
        <hbox class="other-person">
          <hbox on:click={() => catchErrors(() => openPerson(other))} class="linked-object">
            {#if other?.picture}
              <PersonPicture person={other} size={24} />
            {/if}
            <hbox class="name">{other.name}</hbox>
          </hbox>
          <hbox class="email-address">{other.emailAddresses.first?.value ?? ""}</hbox>
          <hbox class="buttons">
            <Button label={$t`Merge`} iconOnly icon={MergeIcon} plain onClick={() => merge(other)} />
          </hbox>
        </hbox>
      {/each}
    </vbox>
  </GroupBox>
{/if}

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import GroupBox from "./GroupBox.svelte";
  import PersonPicture from "./Person/PersonPicture.svelte";
  import Button from "../Shared/Button.svelte";
  import MergeIcon from "lucide-svelte/icons/combine";
  import PersonsIcon from "lucide-svelte/icons/users";
  import { catchErrors } from "../Util/error";
  import { appGlobal } from "../../logic/app";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  export let person: Person;

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
  .email-address {
    margin-inline-start: 16px;
  }
  .other-person,
  .email-address {
    white-space: nowrap;
    overflow: hidden;
  }
  .buttons {
    align-items: end;
    margin-inline-start: 16px;
  }
  .other-person:not(:hover) .buttons {
    visibility: hidden;
  }
</style>
