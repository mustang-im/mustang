<TimeInput
  time={toTimezone(time)}
  {disabled}
  on:change={(ev) => catchErrors(() => onChange(ev.currentTarget.value))}
  />

<script lang="ts">
  import TimeInput from "./TimeInput.svelte";
  import { catchErrors } from "../../Util/error";

  export let time: Date; /* in/out */
  /** IANA timezone.
   * in only */
  export let timezone: string;
  export let disabled = false;

  function toTimezone(time: Date): Date {
    let str = time.toLocaleString("ja-JP", { // "ja-JP" matches ISO most closely
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).replace(" ", "T").replaceAll("/", "-");
    console.log("converting from", time.toISOString(), time.toLocaleString(), "as", str, "=", new Date(str).toLocaleString());
    return new Date(str);
  }

  function onChange(value: string) {
    console.log("time value", value, value.split(":"), value.split(":").map(parseInt), value.split(":").map(Number));
    let [hours, minutes] = value.split(":").map(Number);
    let base = new Date(time);
    let year = base.getFullYear();
    let month = base.getMonth();
    let day = base.getDate();

    // 1. Build a date at local time
    console.log("ymd", year, month, day, hours, minutes, 0);
    let date = new Date(year, month, day, hours, minutes, 0);
    console.log("date", date, date.toISOString(), date.toLocaleString(), date + "");

    // 2. Get the timezone offset for the target IANA timezone
    let parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);
    let tzHour = Number(parts.find(p => p.type === "hour").value);
    let tzMinute = Number(parts.find(p => p.type === "minute").value);
    let tzSecond = Number(parts.find(p => p.type === "second").value);

    // 3. Build the date as if it were in the target timezone
    let dateInTz = new Date(Date.UTC(year, month, day, tzHour, tzMinute, tzSecond));

    // 4. dateInTz is now a Date object in UTC
    console.log(dateInTz);
    time = dateInTz;
  }
</script>

<style>
</style>
