import type { Event } from "../../logic/Calendar/Event";

export const kMinutesPerRow = 5;
export const kRowsPerHour = 60 / kMinutesPerRow;

export interface EventInTimeColumn {
  event: Event;
  startRow: number;
  endRow: number;
  lane: number;
  lanes: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

export function layoutTimeColumn(events: Event[], day: Date, startHour = 0, endHour = 24): EventInTimeColumn[] {
  let columnStart = new Date(day);
  columnStart.setHours(startHour, 0, 0, 0);
  let columnEnd = new Date(day);
  columnEnd.setHours(endHour, 0, 0, 0);
  let rows = (endHour - startHour) * kRowsPerHour;
  let rowOf = (time: Date) => ((time.getHours() - startHour) * 60 + time.getMinutes()) / kMinutesPerRow;

  let items: EventInTimeColumn[] = [];
  for (let event of events) {
    if (!(event.startTime < columnEnd && event.endTime > columnStart)) {
      continue;
    }
    let continuesBefore = event.startTime < columnStart;
    let continuesAfter = event.endTime > columnEnd;
    let startRow = continuesBefore ? 0 : Math.min(Math.floor(rowOf(event.startTime)), rows - 1);
    let endRow = event.endTime >= columnEnd ? rows : Math.ceil(rowOf(event.endTime));
    endRow = Math.max(endRow, startRow + 1);
    items.push({ event, startRow, endRow, lane: 0, lanes: 1, continuesBefore, continuesAfter });
  }

  items.sort((a, b) => a.startRow - b.startRow || b.endRow - a.endRow);
  let cluster: EventInTimeColumn[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = 0;
  for (let item of items) {
    if (item.startRow >= clusterEnd) {
      setLanes(cluster, laneEnds.length);
      cluster = [];
      laneEnds = [];
    }
    let lane = laneEnds.findIndex(laneEnd => laneEnd <= item.startRow);
    if (lane < 0) {
      lane = laneEnds.length;
    }
    laneEnds[lane] = item.endRow;
    item.lane = lane;
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.endRow);
  }
  setLanes(cluster, laneEnds.length);
  return items;
}

function setLanes(cluster: EventInTimeColumn[], lanes: number) {
  for (let item of cluster) {
    item.lanes = lanes;
  }
}

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
