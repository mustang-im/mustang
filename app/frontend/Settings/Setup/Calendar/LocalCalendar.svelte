<Header
  title="Create your new local calendar"
  subtitle=""
/>
<vbox flex class="account">
  <grid>
    <label for="name">Name of the calendar</label>
    <input type="text" bind:value={config.name} name="name"
      placeholder="Private" />
  </grid>
</vbox>

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!config.name}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { Calendar } from "../../../../logic/Calendar/Calendar";
  import { SQLCalendar } from "../../../../logic/Calendar/SQL/SQLCalendar";
  import { appGlobal } from "../../../../logic/app";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";

  /** in/out */
  export let config: Calendar;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  async function onContinue() {
    await SQLCalendar.save(config);
    appGlobal.calendars.add(config);
    showPage = null;
  }
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    align-items: center;
    margin: 32px;
    gap: 8px 24px;
  }
</style>
