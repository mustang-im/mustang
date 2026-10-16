import type { Calendar } from "../../../logic/Calendar/Calendar";
import { gt } from "../../../l10n/l10n";

export class CalendarColors {
  static get palette(): { name: string, color: string }[] {
    return [
      { name: gt`Blue`, color: "#3B7DD8" },
      { name: gt`Green`, color: "#4CA45C" },
      { name: gt`Purple`, color: "#8A68BD" },
      { name: gt`Red`, color: "#D2504C" },
      { name: gt`Gray`, color: "#7D7D7D" },
      { name: gt`Yellow`, color: "#D6B02E" },
      { name: gt`Teal`, color: "#2B9C9C" },
      { name: gt`Orange`, color: "#DF7A36" },
      { name: gt`Pink`, color: "#CF6AA4" },
      { name: gt`Brown`, color: "#9B6A4D" },
      { name: gt`Light Blue`, color: "#7DB4E5" },
      { name: gt`Light Green`, color: "#8CC78E" },
      { name: gt`Lavender`, color: "#B49FDA" },
      { name: gt`Salmon`, color: "#EE8C82" },
      { name: gt`Olive`, color: "#909B3E" },
    ];
  }

  static async setColor(calendar: Calendar, color: string) {
    calendar.color = color;
    await calendar.save();
  }
}
