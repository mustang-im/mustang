<input bind:value={userValue} on:change={onChange} bind:this={inputE} />

<script lang="ts">
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
      do {
        let parts = userValue.match(/^(\d{1,2})(:?(\d\d))?\s*(am?|(pm?))?$/i);
        if (!parts) break;
        let hour = Number(parts[1]);
        if (parts[4]) {
          if (hour < 1 || hour > 12) break;
          hour %= 12;
          if (parts[5]) {
            hour += 12;
          }
        } else {
          if (hour > 23) break;
        }
        let minute = Number(parts[3] || 0);
        if (minute > 59) break;
        time.setHours(hour, minute, 0, 0);
        time = time; // force refresh
        return;
      } while (false);
      inputE.setCustomValidity("A valid time is required");
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

