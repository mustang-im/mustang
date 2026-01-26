{#if adding}
  <hbox class="add header">
    <vbox>
      {$t`Add`}
    </vbox>
  </hbox>
  <hbox class="add option">
    <vbox>
      <input type="time" class="time" bind:value={newTime} />
      <input type="date" class="time" bind:value={newTime} />
    </vbox>
    <RoundButton
      label={$t`Add this time option`}
      icon={OKIcon}
      onClick={onAddFinished}
      />
  </hbox>
{:else}
  <RoundButton
    label={$t`Add time option manually`}
    icon={PlusIcon}
    onClick={onAddStart}
    />
{/if}

<script lang="ts">
  import RoundButton from "../../Shared/RoundButton.svelte";
  import PlusIcon from "lucide-svelte/icons/plus";
  import OKIcon from "lucide-svelte/icons/check";
  import { t } from "../../../l10n/l10n";
  import { Collection } from "svelte-collections";

  export let options: Collection<Date>;
  export let duration: number;

  let adding = false;
  let newTime: Date;
  function onAddStart() {
    // default time
    if (options.length) {
      // directly following the last option
      newTime = new Date(options[options.length - 1]);
      newTime.setMinutes(newTime.getMinutes() + duration);
    } else {
      // tomorrow, same time as now
      newTime = new Date();
      newTime.setMinutes(0, 0, 0);
      newTime.setDate(newTime.getDate() + 1);
    }
    adding = true;
  }
  function onAddFinished() {
    options.add(newTime);
    newTime = null;
    adding = false;
  }
</script>

<style>
  .header {
    margin-inline-start: 8px;
    font-weight: 600;
  }
  .add input {
    margin-block: 4px;
  }
  .time {
    font-weight: bold;
  }
</style>
