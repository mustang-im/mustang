import type { Event } from "../../../logic/Calendar/Event";

export interface EventInDayRow {
  event: Event;
  startDay: number;
  endDay: number;
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

export interface DayRowLayout {
  events: EventInDayRow[];
  lanes: number;
}

export function layoutDayRow(events: Event[], days: Date[]): DayRowLayout {
  let dayEnds = days.map(day => {
    let dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return dayEnd;
  });
  let isOnDay = (event: Event, i: number) => event.startTime < dayEnds[i] && event.endTime > days[i];

  let items: EventInDayRow[] = [];
  for (let event of events) {
    let startDay = days.findIndex((day, i) => isOnDay(event, i));
    if (startDay < 0) {
      continue;
    }
    let endDay = startDay + 1;
    while (endDay < days.length && isOnDay(event, endDay)) {
      endDay++;
    }
    items.push({
      event, startDay, endDay, lane: 0,
      continuesBefore: event.startTime < days[startDay],
      continuesAfter: event.endTime > dayEnds[endDay - 1],
    });
  }

  items.sort((a, b) =>
    a.startDay - b.startDay ||
    (b.endDay - b.startDay) - (a.endDay - a.startDay) ||
    a.event.startTime.getTime() - b.event.startTime.getTime());
  let occupied: boolean[][] = [];
  for (let item of items) {
    let lane = 0;
    while (occupied[lane]?.slice(item.startDay, item.endDay).some(Boolean)) {
      lane++;
    }
    occupied[lane] ??= new Array(days.length).fill(false);
    occupied[lane].fill(true, item.startDay, item.endDay);
    item.lane = lane;
  }
  return { events: items, lanes: occupied.length };
}

export interface LimitedDayRowLayout {
  events: EventInDayRow[];
  hiddenEvents: Event[][];
}

export function limitLanes(layout: DayRowLayout, dayCount: number, maxLanes: number): LimitedDayRowLayout {
  let lastLane = maxLanes - 1;
  let overflowingDays = new Array(dayCount).fill(false);
  for (let item of layout.events) {
    if (item.lane > lastLane) {
      overflowingDays.fill(true, item.startDay, item.endDay);
    }
  }
  let isShown = (item: EventInDayRow) => item.lane < lastLane ||
    item.lane == lastLane && !overflowingDays.slice(item.startDay, item.endDay).some(Boolean);
  let hiddenEvents = overflowingDays.map((_, day) => layout.events
    .filter(item => !isShown(item) && item.startDay <= day && day < item.endDay)
    .map(item => item.event));
  return { events: layout.events.filter(isShown), hiddenEvents };
}
