import { ArrayColl } from "svelte-collections";
import { registerPlugin } from "@capacitor/core";

export const logHistory = new ArrayColl<any[]>();

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

interface NativeLogger {
  addListener(event: string, callBack: CallableFunction)
}

const NativeLogger = registerPlugin<NativeLogger>("Logger");

NativeLogger.addListener("nativeLog", (e) => {
  console.log("[Native Log]", e.log);
});

NativeLogger.addListener("nativeError", (e) => {
  console.log("[Native Error]", e.error);
});
