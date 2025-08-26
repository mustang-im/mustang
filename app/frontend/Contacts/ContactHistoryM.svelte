<vbox flex class="pane">
  <ContactHistory {person} />
</vbox>

{#if $appGlobal.isMobile}
  <ContactHistoryBarM {person} />
{/if}

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import ContactHistory from "./History/ContactHistory.svelte";
  import ContactHistoryBarM from "./ContactHistoryBarM.svelte";

  export let person: Person;
</script>

<style>
  .pane {
  }
</style>
