export class DayAtPoint {
  static find(row: HTMLElement, clientX: number, days: Date[]): Date {
    let cells = Array.from(row.querySelectorAll<HTMLElement>(":scope > [data-day-index]"));
    let index = cells.findIndex(cell => {
      let rect = cell.getBoundingClientRect();
      return rect.left <= clientX && clientX < rect.right;
    });
    if (index < 0) {
      let rect = row.getBoundingClientRect();
      index = Math.floor((clientX - rect.left) / rect.width * days.length);
      if (getComputedStyle(row).direction == "rtl") {
        index = days.length - 1 - index;
      }
    }
    return days[Math.min(Math.max(index, 0), days.length - 1)];
  }
}
