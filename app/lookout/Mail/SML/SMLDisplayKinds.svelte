{#if sml && isKnownType}
  <ActionCard title={title} subtitle={subtitle} icon={icon(type)}>
    <svelte:fragment slot="actions">
      <slot name="actions" />
    </svelte:fragment>
    {#if type == "SimplePoll"}
      <Poll {sml} {myReaction} />
    {:else if type == "MeetingTimePoll"}
      <MeetingTimePoll {sml} {myReaction} {isOrganizer} />
    {:else if type == "BookMe"}
      <Book {sml} {myReaction} {isOrganizer} />
    {/if}
  </ActionCard>
{/if}

<script lang="ts">
  import type { SMLData } from "../../../logic/Mail/SML/SMLData";
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { TSMLRequest, TSMLSimplePoll, TSMLThing } from "../../../logic/Mail/SML/TSML";
  import PollIcon from "lucide-svelte/icons/list-checks";
  import SchedulingPollIcon from "lucide-svelte/icons/calendar-clock";
  import BookingsIcon from "lucide-svelte/icons/calendar-check";
  import ActionCard from "./ActionCard.svelte";
  import Poll from "./Poll.svelte";
  import MeetingTimePoll from "../../Calendar/SML/MeetingTimePoll/Poll.svelte";
  import Book from "../../Calendar/SML/BookMe/Book.svelte";
  import { getDateTimeLocale, gt } from "../../../l10n/l10n";

  export let sml: SMLData;
  export let message: EMail;

  $: type = sml?.type ?? sml?.sml?.["@type"];
  $: isKnownType = ["SimplePoll", "MeetingTimePoll", "BookMe"].includes(type);
  $: request = $sml?.sml as TSMLRequest & Partial<TSMLSimplePoll<TSMLThing>>;
  $: myReaction = isKnownType ? sml.getMyReaction(message) : null;
  $: isOrganizer = !!myReaction?.agent?.email && myReaction.agent.email == request?.organizer?.email;
  $: title = cardTitle(type);
  $: subtitle = cardSubtitle(request, isOrganizer);

  function cardTitle(type: string): string {
    switch (type) {
      case "SimplePoll": return gt`Poll`;
      case "MeetingTimePoll": return gt`Scheduling poll: Vote for the meeting time`;
      case "BookMe": return gt`Book a meeting`;
      default: return "";
    }
  }

  /* <copied to="../Composer/SMLComposer.svelte, ../Composer/PollsGroup.svelte"> */
  function icon(type: string): ConstructorOfATypedSvelteComponent {
    switch (type) {
      case "MeetingTimePoll": return SchedulingPollIcon;
      case "BookMe": return BookingsIcon;
      default: return PollIcon;
    }
  }
  /* </copied> */

  function cardSubtitle(request: TSMLRequest & Partial<TSMLSimplePoll<TSMLThing>>, isOrganizer: boolean): string {
    let parts: string[] = [];
    let organizer = request?.organizer?.name || request?.organizer?.email;
    if (organizer && !isOrganizer) {
      parts.push(gt`From ${organizer}`);
    }
    if (request?.ends instanceof Date && !isNaN(request.ends.getTime())) {
      let ends = request.ends.toLocaleDateString(getDateTimeLocale(), { weekday: "short", month: "short", day: "numeric" });
      parts.push(gt`Closes on ${ends}`);
    }
    return parts.join(" · ");
  }
</script>
