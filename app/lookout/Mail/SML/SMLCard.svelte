{#if sml && kind}
  <ActionCard title={title} subtitle={subtitle} icon={SMLKinds.icon(kind)}>
    <svelte:fragment slot="actions">
      <slot name="actions" />
    </svelte:fragment>
    {#if kind == SMLKind.Poll}
      <PollCard {sml} {myReaction} />
    {:else if kind == SMLKind.SchedulingPoll}
      <SchedulingPollCard {sml} {myReaction} {isOrganizer} />
    {:else if kind == SMLKind.Bookings}
      <BookingCard {sml} {myReaction} {isOrganizer} />
    {/if}
  </ActionCard>
{/if}

<script lang="ts">
  import type { SMLData } from "../../../logic/Mail/SML/SMLData";
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { TSMLRequest, TSMLSimplePoll, TSMLThing } from "../../../logic/Mail/SML/TSML";
  import { SMLKind, SMLKinds } from "./SMLKinds";
  import ActionCard from "./ActionCard.svelte";
  import PollCard from "./PollCard.svelte";
  import SchedulingPollCard from "./SchedulingPollCard.svelte";
  import BookingCard from "./BookingCard.svelte";
  import { getDateTimeLocale, gt } from "../../../l10n/l10n";

  export let sml: SMLData;
  export let message: EMail;

  $: kind = SMLKinds.kindOf(sml);
  $: request = $sml?.sml as TSMLRequest & Partial<TSMLSimplePoll<TSMLThing>>;
  $: myReaction = kind ? sml.getMyReaction(message) : null;
  $: isOrganizer = !!myReaction?.agent?.email && myReaction.agent.email == request?.organizer?.email;
  $: title = cardTitle(kind);
  $: subtitle = cardSubtitle(request, isOrganizer);

  function cardTitle(kind: SMLKind): string {
    switch (kind) {
      case SMLKind.Poll: return gt`Poll`;
      case SMLKind.SchedulingPoll: return gt`Scheduling poll: Vote for the meeting time`;
      case SMLKind.Bookings: return gt`Book a meeting`;
      default: return "";
    }
  }

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
