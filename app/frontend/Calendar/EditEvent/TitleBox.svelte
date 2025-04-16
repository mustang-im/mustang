<hbox class="title">
  <input type="text" placeholder={$t`Title - Enter the topic of the meeting`} bind:value={event.title} class="font-normal"/>
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
</script>

<style>
  .title input {
    font-size: 100%;
    font-weight: bold;
    padding: 6px 12px;
    max-width: 40em;
  }
</style>
