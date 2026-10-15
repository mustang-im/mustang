export class WorkingHours {
  static readonly startHour = 8;
  static readonly endHour = 17;

  static isWorkDay(day: Date): boolean {
    return day.getDay() >= 1 && day.getDay() <= 5;
  }
}
