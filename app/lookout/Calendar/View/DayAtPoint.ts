export class DayAtPoint {
  static find(row: HTMLElement, clientX: number, days: Date[]): Date {
    let rect = row.getBoundingClientRect();
    let index = Math.floor((clientX - rect.left) / rect.width * days.length);
    if (getComputedStyle(row).direction == "rtl") {
      index = days.length - 1 - index;
    }
    return days[Math.min(Math.max(index, 0), days.length - 1)];
  }
}
