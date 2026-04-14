<input type="time"
  bind:value={userValue}
  on:change={onChangeEvent}
  on:blur={onChange}
  on:keydown={() => isUsingKeyboard = true}
  on:mousedown={() => isUsingKeyboard = false}
  on:pointerdown={() => isUsingKeyboard = false}
  bind:this={inputE}
  {disabled}
  />

<script lang="ts">
  import { t } from "../../../l10n/l10n";
  import debounce from "lodash/debounce";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ change: Date }>();

  export let time: Date; /* in/out */
  export let disabled = false;
  /** true (default): automatically set `time` to the user-entered value
   * false: let caller handle updates by listen to the `change` event */
  export let changeTime = true;

  let inputE: HTMLInputElement;
  let userValue: string = "";

  $: updateUserValue(time);
  function updateUserValue(time: Date) {
    try {
      // <input type="time" value="14:23" />, independent of user locale, as string
      userValue = time.toLocaleTimeString("de", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (ex) {
      inputE.setCustomValidity(ex.message);
    }
  }

  // <copied from="DateInput.svelte">
  const onChangeDebounced = debounce(() => onChange(), 1000);
  let isUsingKeyboard = false;
  function onChangeEvent() {
    if (isUsingKeyboard) {
      onChangeDebounced();
    } else {
      onChange();
    }
  }
  // </copied>

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

      if (changeTime) {
        time.setHours(hour, minute, 0, 0);
        time = time; // force refresh - TODO Doesn't work on `event.startTime` to trigger `event` notifications
        dispatchEvent("change", time);
      } else {
        let newTime = new Date(time);
        newTime.setHours(hour, minute, 0, 0);
        dispatchEvent("change", newTime);
      }
    } catch (ex) {
      inputE.setCustomValidity(ex.message);
    }
  }
</script>

<style>
</style>
