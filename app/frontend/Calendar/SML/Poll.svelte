<vbox class="meeting-time-poll">
  <vbox class="view-switcher">
    <IslandSwitcher large>
      <Button
        label={$t`List`}
        icon={ListIcon}
        onClick={() => showCalendar = false}
        selected={!showCalendar}
        />
      <Button
        label={$t`Calendar`}
        icon={CalendarIcon}
        onClick={() => showCalendar = true}
        selected={showCalendar}
        />
    </IslandSwitcher>
  </vbox>

  {#if showCalendar}
    <PollCalendar {options} duration={timePoll.duration} {myVotes} {focusOption} />
  {:else}
    <vbox class="list">
      <DisplayList {options} duration={timePoll.duration} showEndTime={true}>
        <Button
          label={$t`Show in calendar`}
          icon={CalendarIcon}
          iconOnly plain
          onClick={() => showOptionInCalendar(option)}
          slot="center"
          let:option
          />
        <PollTimeButtons slot="right" let:option time={option} {myVotes} />
      </DisplayList>
    </vbox>
  {/if}
</vbox>

<script lang="ts">
  import { SMLData } from "../../../logic/Mail/SML/SMLData";
  import { type TSMLTimePoll, type TSMLMeetingTimeVote, TSMLMeetingTimePreference, type TSMLAction } from "../../../logic/Mail/SML/TSML";
  import PollCalendar from "./PollCalendar.svelte";
  import PollTimeButtons from "./PollTimeButtons.svelte";
  import DisplayList from "./DisplayList.svelte";
  import IslandSwitcher from "../../Shared/IslandSwitcher.svelte";
  import Button from "../../Shared/Button.svelte";
  import ListIcon from "lucide-svelte/icons/list";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import { syncArrayColl } from "../../../logic/util/collections";
  import { t } from "../../../l10n/l10n";

  export let sml: SMLData;
  export let myReaction: TSMLAction;

  $: timePoll = $sml.sml as any as TSMLTimePoll;
  $: options = syncArrayColl(timePoll.options, date => date);
  $: myVotes = syncArrayColl(myReaction.object as TSMLMeetingTimeVote[] ?? []);

  let showCalendar = false;
  $: focusOption = $options.first;
  function showOptionInCalendar(option: Date) {
    focusOption = option;
    showCalendar = true;
  }
</script>

<style>
  .meeting-time-poll {
    margin: 16px;
  }
  .view-switcher {
    align-items: center;
  }
  .list {
    align-self: center;
    width: 320px;
  }
</style>
