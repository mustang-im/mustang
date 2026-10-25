/** Calendar tests need a time zone with daylight saving time, which changes on 2026-03-29 and 2026-10-25.
 * It's set here, before the test workers start, because worker threads can't change the time zone. */
export function setup() {
  process.env.TZ = "Europe/Berlin";
}
