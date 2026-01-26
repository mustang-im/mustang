<!-- This file only contains conditional statements, and
 loads the specific UI components only when applicable. -->
{#if sml}
  {#if $sml.type == "SimplePoll"}
    <Poll {sml} {myReaction} />
  {/if}
  {#if $sml.type == "MeetingTimePoll"}
    <MeetingTimePoll {sml} {myReaction} />
  {/if}
  {#if $sml.type == "BookMe"}
    <MeetingTimePoll {sml} {myReaction} />
  {/if}
{/if}

<!-- Not SML, but fits here-->
{#if $message?.event || $message?.invitationMessage}
  <InvitationInMail {message} />
{/if}

<script lang="ts">
  import type { SMLData } from "../../../logic/Mail/SML/SMLData";
  import type { EMail } from "../../../logic/Mail/EMail";
  import Poll from "./Poll.svelte";
  import MeetingTimePoll from "../../Calendar/SML/Poll.svelte";
  import InvitationInMail from "../../Calendar/DisplayEvent/InvitationInMail.svelte";

  export let sml: SMLData;
  export let message: EMail | null = null;

  $: myReaction = sml.getMyReaction(message);
</script>
