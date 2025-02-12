<input type="url" bind:value={event.location} placeholder={$t`Location`} />

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
</script>

<style>
  input {
    max-width: 40em;
  }
</style>
