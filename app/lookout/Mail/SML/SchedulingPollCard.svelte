<vbox class="scheduling-poll">
  <span class="intro">
    {isOrganizer ? $t`You proposed these times. Recipients vote for the times that suit them.` : $t`Vote for each time: is it OK for you?`}
  </span>
  <TimeOptionList options={ensureArray(poll.options)} duration={poll.duration} let:time>
    {@const preference = SMLTimeOptions.preference(votes, time)}
    <hbox class="vote-buttons" role="group" aria-label={$t`Your vote`}>
      {#each voteChoices as choice}
        <button type="button" class="vote {choice.preference}"
          class:selected={preference == choice.preference}
          aria-pressed={preference == choice.preference}
          title={choice.label} aria-label={choice.label}
          on:click={() => vote(time, choice.preference)}>
          <svelte:component this={choice.icon} size={16} />
        </button>
      {/each}
    </hbox>
  </TimeOptionList>
</vbox>

<script lang="ts">
  import type { SMLData } from "../../../logic/Mail/SML/SMLData";
  import { TSMLMeetingTimePreference, type TSMLAction, type TSMLMeetingTimePoll, type TSMLMeetingTimeVote } from "../../../logic/Mail/SML/TSML";
  import { SMLTimeOptions } from "./SMLTimeOptions";
  import TimeOptionList from "./TimeOptionList.svelte";
  import AcceptIcon from "lucide-svelte/icons/check";
  import MaybeIcon from "lucide-svelte/icons/badge-question-mark";
  import BadIcon from "lucide-svelte/icons/frown";
  import RejectIcon from "lucide-svelte/icons/ban";
  import { ensureArray } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";

  export let sml: SMLData;
  export let myReaction: TSMLAction;
  export let isOrganizer = false;

  const voteChoices = [
    { preference: TSMLMeetingTimePreference.Accept, label: gt`This time is OK for me`, icon: AcceptIcon },
    { preference: TSMLMeetingTimePreference.Maybe, label: gt`Not sure yet`, icon: MaybeIcon },
    { preference: TSMLMeetingTimePreference.Bad, label: gt`It would be problematic for me`, icon: BadIcon },
    { preference: TSMLMeetingTimePreference.Reject, label: gt`I cannot attend at this time`, icon: RejectIcon },
  ];

  $: poll = $sml.sml as TSMLMeetingTimePoll;
  $: votes = myVotes(myReaction);

  function myVotes(reaction: TSMLAction): TSMLMeetingTimeVote[] {
    if (!Array.isArray(reaction.object)) {
      reaction.object = [];
    }
    return reaction.object as TSMLMeetingTimeVote[];
  }

  function vote(time: Date, preference: TSMLMeetingTimePreference) {
    SMLTimeOptions.vote(votes, time, preference);
    votes = votes;
  }
</script>

<style>
  .scheduling-poll {
    gap: 6px;
  }
  .intro {
    color: var(--lo-fg-secondary);
  }
  .vote-buttons {
    flex-shrink: 0;
  }
  .vote {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 28px;
    margin-inline-start: -1px;
    padding: 0;
    border: 1px solid var(--lo-border-strong);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg-secondary);
  }
  .vote:first-child {
    margin-inline-start: 0;
    border-start-start-radius: var(--lo-radius-small);
    border-end-start-radius: var(--lo-radius-small);
  }
  .vote:last-child {
    border-start-end-radius: var(--lo-radius-small);
    border-end-end-radius: var(--lo-radius-small);
  }
  .vote:hover {
    background-color: var(--lo-hover-bg);
  }
  .vote.accept {
    color: var(--lo-success);
  }
  .vote.maybe,
  .vote.bad {
    color: var(--lo-warning);
  }
  .vote.reject {
    color: var(--lo-danger);
  }
  .vote.selected {
    position: relative;
    border-color: var(--lo-accent);
    background-color: var(--lo-selected-bg);
  }
</style>
