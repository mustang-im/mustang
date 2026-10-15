export class Timeline {
  readonly day: Date;
  readonly hourWidth: number;

  constructor(day: Date, hourWidth = 88) {
    this.day = new Date(day);
    this.day.setHours(0, 0, 0, 0);
    this.hourWidth = hourWidth;
  }

  get width(): number {
    return 24 * this.hourWidth;
  }

  get dayEnd(): Date {
    let end = new Date(this.day);
    end.setDate(end.getDate() + 1);
    return end;
  }

  hours(): Date[] {
    let hours: Date[] = [];
    for (let hour = 0; hour < 24; hour++) {
      let time = new Date(this.day);
      time.setHours(hour);
      hours.push(time);
    }
    return hours;
  }

  x(time: Date): number {
    if (time <= this.day) {
      return 0;
    }
    if (time >= this.dayEnd) {
      return this.width;
    }
    return (time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600) * this.hourWidth;
  }

  span(from: Date, to: Date): { left: number, width: number } | null {
    if (to <= this.day || from >= this.dayEnd || to < from) {
      return null;
    }
    let left = this.x(from);
    return { left, width: Math.max(this.x(to) - left, 0) };
  }

  timeAt(x: number, snapMinutes = 30): Date {
    let minutes = Math.min(Math.max(x, 0), this.width) / this.hourWidth * 60;
    minutes = Math.round(minutes / snapMinutes) * snapMinutes;
    let time = new Date(this.day);
    time.setMinutes(minutes);
    return time;
  }

  slotAt(x: number, snapMinutes = 30): Date {
    let minutes = Math.min(Math.max(x, 0), this.width - 1) / this.hourWidth * 60;
    minutes = Math.floor(minutes / snapMinutes) * snapMinutes;
    let time = new Date(this.day);
    time.setMinutes(minutes);
    return time;
  }
}
