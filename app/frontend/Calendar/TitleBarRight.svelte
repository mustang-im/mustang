<hbox class="title-bar">
  <RoundButton
    classes="sync-button"
    label={$t`Sync all calendars`}
    icon={SyncIcon}
    onClick={sync}
    loadDelayMS={0}
    iconSize="14px"
    padding="6px"
    border={false}
    />
</hbox>
<ViewSelector bind:dateInterval />

<script lang="ts">
  import type { DateInterval } from "./selected";
  import ViewSelector from "./ViewSelector.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import SyncIcon from "lucide-svelte/icons/refresh-cw";
  import { t } from "../../l10n/l10n";
  import { appGlobal } from "../../logic/app";

  export let dateInterval: DateInterval = 7; /* in/out */

  async function sync() {
    await Promise.all(appGlobal.calendars.contents.map(cal =>
      cal.listEvents()));
  }
</script>

<style>
  .title-bar {
    align-items: center;
    justify-content: center;
    margin: 12px;
  }
</style>
