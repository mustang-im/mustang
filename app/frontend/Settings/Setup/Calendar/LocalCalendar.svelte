<Header
  title="Setup your new local calendar"
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
  on:continue={() => catchErrors(onContinue)}
  canContinue={!!config.name}
  canCancel={true}
  on:cancel
  />

<script lang="ts">
  import type { Calendar } from "../../../../logic/Calendar/Calendar";
  import { SQLCalendar } from "../../../../logic/Calendar/SQL/SQLCalendar";
  import { appGlobal } from "../../../../logic/app";
  import ButtonsBottom from "../ButtonsBottom.svelte";
  import Header from "../Header.svelte";
  import { catchErrors } from "../../../Util/error";

  /** in/out */
  export let config: Calendar;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;

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
