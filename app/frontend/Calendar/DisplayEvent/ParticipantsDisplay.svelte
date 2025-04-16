<hbox class="participants font-normal">
  {#each $participants.each as participant, i}
    {#if showAllParticipants || i < showNumParticipants}
      {#if i > 0}
        <hbox class="separator">,</hbox>
      {/if}
      <hbox class="participant-name"
        on:click={() => onOpenParticipant(participant)}>
        {participant.name}
      </hbox>
    {/if}
  {/each}
  <hbox class="collapse buttons">
    {#if showAllParticipants}
      <Button
        icon={ChevronUpIcon}
        label={$t`Collapse`}
        onClick={() => showAllParticipants = false}
        classes="small collapse font-small"
        iconOnly
        />
    {:else if $participants?.length > showNumParticipants}
      <MoreBubble
        plusNum={$participants.length - showNumParticipants}
        onClick={() => showAllParticipants = true} />
    {/if}
  </hbox>
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import MoreBubble from "./MoreBubble.svelte";
  import Button from "../../Shared/Button.svelte";
  import ChevronUpIcon from "lucide-svelte/icons/chevron-up";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  $: participants = event.participants;
  const showNumParticipants = 3;
  let showAllParticipants = false;

  function onOpenParticipant(personUID: PersonUID) {
    let person = personUID.findPerson();
    alert("Open " + person.name);
  }
</script>

<style>
  .participants {
    flex-wrap: wrap;
    max-width: 100%; /* TODO */
  }
  .participants .separator {
    margin-inline-end: 0.3em;
  }
  .participant-name:hover {
    /*background-color: var(--hover-bg);
    color: var(--hover-fg);*/
    color: var(--link-hover-fg);
  }
  .participants .buttons {
    margin-inline-start: 8px;
  }
  .participants .buttons :global(button.collapse) {
    border: none;
    padding: 0px 4px;
  }
</style>
