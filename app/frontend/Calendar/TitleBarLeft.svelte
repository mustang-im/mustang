<hbox class="title-bar">
  <RoundButton
    classes="add-button create"
    label={$t`New event`}
    icon={AddToCalendarIcon}
    onClick={addEvent}
    iconSize="22px"
    padding="6px"
    />
</hbox>

<script lang="ts">
  import RoundButton from "../Shared/RoundButton.svelte";
  import AddToCalendarIcon from "lucide-svelte/icons/plus";
  import { t } from "../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ addEvent: void }>();

  function addEvent() {
    dispatch('addEvent');
  }
</script>

<style>
  .title-bar {
    align-items: center;
    justify-content: center;
    margin: 4px;
  }
  .title-bar :global(.add-button) {
    margin: 4px;
    align-items: center;
    justify-content: center;
    position: relative;
  }
</style>
