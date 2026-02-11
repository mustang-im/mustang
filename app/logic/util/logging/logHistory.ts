import { ArrayColl } from "svelte-collections";

export abstract class LogEntry {
  time = new Date();
  abstract message(): string;
}

export const logHistory = new ArrayColl<LogEntry>();
