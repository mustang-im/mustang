export class HourLabel {
  readonly format: Intl.DateTimeFormat;

  constructor(locale: string) {
    let hourCycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
    this.format = hourCycle == "h11" || hourCycle == "h12"
      ? new Intl.DateTimeFormat(locale, { hour: "numeric" })
      : new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  }

  label(hour: number): string {
    return this.format.format(new Date(2000, 0, 1, hour));
  }
}
