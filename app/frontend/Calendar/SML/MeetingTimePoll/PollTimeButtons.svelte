<hbox class="buttons">
  <Button
    label={$t`This time is OK for me`}
    icon={AcceptIcon}
    iconOnly
    selected={getPreference($myVotes, time) == TSMLMeetingTimePreference.Accept}
    onClick={() => onSelect(time, TSMLMeetingTimePreference.Accept)}
    classes="accept"
    plain
    />
  <Button
    label={$t`Not sure yet`}
    icon={MaybeIcon}
    iconOnly
    selected={getPreference($myVotes, time) == TSMLMeetingTimePreference.Maybe}
    onClick={() => onSelect(time, TSMLMeetingTimePreference.Maybe)}
    classes="maybe"
    plain
    />
  <Button
    label={$t`It would be problematic for me`}
    icon={BadIcon}
    iconOnly
    selected={getPreference($myVotes, time) == TSMLMeetingTimePreference.Bad}
    onClick={() => onSelect(time, TSMLMeetingTimePreference.Bad)}
    classes="bad"
    plain
    />
  <Button
    label={$t`Reject - I cannot attend at this time`}
    icon={RejectIcon}
    iconOnly
    selected={getPreference($myVotes, time) == TSMLMeetingTimePreference.Reject}
    onClick={() => onSelect(time, TSMLMeetingTimePreference.Reject)}
    classes="reject"
    plain
    />
</hbox>

<script lang="ts">
  import { type TSMLMeetingTimeVote, TSMLMeetingTimePreference } from "../../../../logic/Mail/SML/TSML";
  import Button from "../../../Shared/Button.svelte";
  import AcceptIcon from "lucide-svelte/icons/check";
  import MaybeIcon from "lucide-svelte/icons/badge-question-mark";
  import BadIcon from "lucide-svelte/icons/frown";
  import RejectIcon from "lucide-svelte/icons/ban";
  import { t } from "../../../../l10n/l10n";
  import type { ArrayColl } from "svelte-collections";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ changed: Date }>();

  export let time: Date;
  export let myVotes: ArrayColl<TSMLMeetingTimeVote>;

  function onSelect(time: Date, preference: TSMLMeetingTimePreference) {
    // Need to change array for observers to be called
    myVotes.remove(myVotes.find(r => r.time == time));
    myVotes.add({
      time,
      preference,
    } as TSMLMeetingTimeVote);
    dispatchEvent("changed", time);
  }

  function getPreference(myVotes: ArrayColl<TSMLMeetingTimeVote>, time: Date): TSMLMeetingTimePreference {
    return myVotes.find(r => r.time == time)?.preference;
  }
</script>

<style>
  .buttons :global(button.accept svg) {
    stroke-width: 3px;
  }
  .buttons :global(button.accept .icon) {
    color: rgb(0, 182, 0);
  }
  .buttons :global(button.maybe .icon) {
    color: orange;
  }
  .buttons :global(button.bad .icon) {
    color: rgb(255, 102, 0);
  }
  .buttons :global(button.reject .icon) {
    color: red;
  }
</style>
