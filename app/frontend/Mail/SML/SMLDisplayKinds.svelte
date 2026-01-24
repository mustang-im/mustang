<!-- This file only contains conditional statements, and
 loads the specific UI components only when applicable. -->
{#if sml}
  {#if $sml.type == "SimplePoll"}
    <Poll {sml} />
  {/if}
  {#if $sml.type == "MeetingTimePoll"}
    <Poll {sml} />
  {/if}
  {#if $sml.type == "BookMe"}
    <Poll {sml} />
  {/if}
{/if}

<!-- Not SML, but fits here-->
{#if $message?.event || $message?.invitationMessage}
  <InvitationInMail {message} />
{/if}

<script lang="ts">
  import type { SMLData } from "../../../logic/Mail/SML/SMLParseProcessor";
  import type { EMail } from "../../../logic/Mail/EMail";
  import Poll from "./Poll.svelte";
  import InvitationInMail from "../../Calendar/DisplayEvent/InvitationInMail.svelte";

  export let sml: SMLData;
  export let message: EMail | null = null;
</script>
