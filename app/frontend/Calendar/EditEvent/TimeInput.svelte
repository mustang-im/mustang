<input bind:value={userValue} on:change={onChange} bind:this={inputE} />

<script lang="ts">
  import { t } from "../../../l10n/l10n";

  export let time: Date; /* in/out */

  let inputE: HTMLInputElement;
  let userValue: string = "";

  $: updateUserValue(time);
  function updateUserValue(time: Date): string {
    try {
      userValue = time.toLocaleString(undefined, {
        hour: "numeric",
        minute: "numeric",
      });
    } catch (ex) {
      inputE.setCustomValidity(ex.message);
    }
  }

  export function onChange() {
    try {
      let parts = userValue.match(/^(\d{1,2})(:?(\d\d))?\s*(am?|(pm?))?$/i);
      if (!parts) {
        throw new Error($t`Could not interpret value as a time`);
      }
      let hour = Number(parts[1]);
      if (parts[4]) {
        if (hour < 1 || hour > 12) {
          throw new Error($t`Hour must be between 1 and 12 when using am or pm`);
        }
        hour %= 12;
        if (parts[5]) {
          hour += 12;
        }
      } else if (hour > 23) {
        throw new Error($t`Hour moust be less than 24`);
      }
      let minute = Number(parts[3] || 0);
      if (minute > 59) {
        throw new Error($t`Minute must be less than 59`);
      }
      time.setHours(hour, minute, 0, 0);
      time = time; // force refresh
      return;
    } catch (ex) {
      inputE.setCustomValidity(ex.message);
    }
  }
</script>

<style>
input {
  border-top: none;
  border-left: none;
  border-right: none;
  width: 100%;
}
</style>

