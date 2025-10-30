import { ArrayColl } from "svelte-collections";

export const logHistory = new ArrayColl<string>();

const originalLog = console.log;
const originalError = console.error;

console.log = function(...args: any[]) {
  logHistory.push(args);
  originalLog.apply(console, args);
};
console.error = function(...args: any[]) {
  logHistory.push(args);
  originalError.apply(console, args);
};
