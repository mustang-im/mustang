<!-- Create special SML actions to attach to your message.
  First, add the empty data structure to `sml`.
  This component will then show the appropriate edit UI.
  This file only contains conditional statements, and
  loads the specific UI components only when applicable. -->
{#if sml}
  {#if $sml.type == "SimplePoll"}
    <PollEdit {sml} />
  {/if}
  {#if $sml.type == "MeetingTimePoll"}
    <TimePollEdit {sml} />
  {/if}
  {#if $sml.type == "BookMe"}
    <TimePollEdit {sml} />
  {/if}
{/if}

<script lang="ts">
  import { SMLData } from "../../../logic/Mail/SML/SMLData";
  import PollEdit from "./PollEdit.svelte";
  import TimePollEdit from "../../Calendar/SML/Shared/PollEdit.svelte";

  export let sml: SMLData;
</script>
