<Header
  title={$t`Select the calendars you want to use`}
  subtitle=""
/>
{#await load()}
  <hbox class="loading">
    <Spinner size="24px" />
    <hbox class="label">{$t`Checking for your calendars…`}</hbox>
  </hbox>
{:then}
  <vbox flex class="calendar">
    {#each $calendars.each as calendar}
      <label>
        <input type="checkbox" bind:checked={calendar.enabled} value={calendar}>
        {calendar.name}
      </label>
    {/each}
  </vbox>
{:catch ex}
  {ex?.message ?? ex + ""}
{/await}

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!config.name}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { CalDAVAccount } from "../../../logic/Calendar/CalDAV/CalDAVAccount";
  import type { CalDAVCalendar } from "../../../logic/Calendar/CalDAV/CalDAVCalendar";
  import { appGlobal } from "../../../logic/app";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import Spinner from "../../Shared/Spinner.svelte";
  import type { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let config: CalDAVAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let calendars: ArrayColl<CalDAVCalendar>;

  async function load() {
    calendars = await config.listCalendarsOnServer(true);
    if (calendars.length == 1) {
      await onContinue();
    }
  }

  async function onContinue() {
    appGlobal.calendars.addAll(calendars.filterOnce(cal =>
      cal.enabled &&
      !config.calendars.some(existing => existing.url == cal.url)));
    for (let calendar of calendars) {
      if (calendar.enabled) {
        calendar.listEvents()
          .catch(config.errorCallback);
      }
    }
    await config.save();
    showPage = null;
  }
</script>

<style>
  .loading .label {
    margin-inline-start: 32px;
  }
</style>
