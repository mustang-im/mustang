<!-- Create special SML actions to attach to your message.
  First, add the empty data structure to `sml`.
  This component will then show the appropriate edit UI.
  This file only contains conditional statements, and
  loads the specific UI components only when applicable. -->
{#if sml}
  {#if $sml.type == "ChooseAction"}
    <PollEdit {sml} />
  {/if}
{/if}

<script lang="ts">
  import { SMLData } from "../../../logic/Mail/SML/SMLParseProcessor";
  import PollEdit from "./PollEdit.svelte";

  export let sml: SMLData;
</script>
