<Header
  title={$t`Select the calendar you want to use`}
  subtitle=""
/>
{#await load()}
  <hbox class="loading">
    <Spinner size="24px" />
    <hbox class="label">{$t`Checking for your calendars…`}</hbox>
  </hbox>
{:then}
  <vbox flex class="calendar">
    {#each calendars.each as calendar}
      <label>
        <input type="radio" bind:group={selectedCalendar} value={calendar}>
        {calendar.displayName}
      </label>
    {/each}
  </vbox>
{:catch ex}
  {ex?.message ?? ex + ""}
{/await}

<ErrorMessageInline bind:this={errorUI} />

<ButtonsBottom
  onContinue={() => catchErrors(onContinue, errorUI.showError)}
  canContinue={!!config.name}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import { CalDAVCalendar } from "../../../logic/Calendar/CalDAV/CalDAVCalendar";
  import { appGlobal } from "../../../logic/app";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import Spinner from "../../Shared/Spinner.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";
  import { Collection } from "svelte-collections";
  import type { DAVCalendar } from "tsdav";

  /** in/out */
  export let config: CalDAVCalendar;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let calendars: Collection<DAVCalendar>;
  let selectedCalendar: DAVCalendar;
  let errorUI: ErrorMessageInline;

  async function load() {
    calendars = await config.listCalendars();
    if (calendars.length == 1) {
      selectedCalendar = calendars.first;
      await onContinue();
    }
  }

  async function onContinue() {
    errorUI.clearError();
    config.calendarURL = selectedCalendar.url;
    await config.listEvents();
    appGlobal.calendars.add(config);
    await config.save();
    showPage = null;
  }
</script>

<style>
  .loading .label {
    margin-inline-start: 32px;
  }
</style>
