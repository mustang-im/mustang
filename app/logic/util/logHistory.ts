import { ArrayColl } from "svelte-collections";

export abstract class LogEntry {
  time = new Date();
  abstract message(): string;
}

export const logHistory = new ArrayColl<LogEntry>();

// console log

export enum LogLevel {
  debug = 1,
  log = 2,
  warn = 4,
  error = 5,
}

export class ConsoleLogEntry extends LogEntry {
  level: LogLevel;
  args: string[];
  constructor(level: LogLevel, args: string[]) {
    super();
    this.level = level;
    this.args = args;
  }
  message() {
    return this.args.map(arg => safeStringify(arg)).join(" ");
  }
}

const originalLog = console.log;
const originalError = console.error;
const originalDebug = console.debug;
const originalWarn = console.warn;

console.log = function (...args: any[]) {
  logHistory.push(new ConsoleLogEntry(LogLevel.log, args));
  originalLog.apply(console, args);
};
console.error = function (...args: any[]) {
  logHistory.push(new ConsoleLogEntry(LogLevel.error, args));
  originalError.apply(console, args);
};
console.warn = function (...args: any[]) {
  logHistory.push(new ConsoleLogEntry(LogLevel.warn, args));
  originalWarn.apply(console, args);
};
console.debug = function (...args: any[]) {
  logHistory.push(new ConsoleLogEntry(LogLevel.debug, args));
  originalDebug.apply(console, args);
};

export function safeStringify(obj: any): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (value == null) { // or undefined
        return "";
      } else if (key && key.startsWith("_")) {
        return undefined;
      } else if (["nextTime"].includes(key)) { // noise useless properties
        return "(ignored)";
      } else if (typeof value === "object") {
        if (value instanceof Error) {
          return value.toString();
        }
        if (value instanceof Event) {
          return `[Event: ${value.type}]`;
        }
        if (value instanceof Node) {
          return `[${value.nodeName || "Node"}]`;
        }
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (error) {
    try {
      return String(obj);
    } catch {
      return "[Object]";
    }
  }
}
