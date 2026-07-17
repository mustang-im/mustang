/** Debug logging for the Signal protocol: every inbound/outbound WebSocket frame
 * and HTTPS request/response. On by default while the live wire is being shaken
 * out; set `signalDebugState.enabled = false` (or via SignalAccount) to quiet it. */
export const signalDebugState = { enabled: true };

export function signalLog(...args: any[]): void {
  if (signalDebugState.enabled) {
    console.log("Signal:", ...args);
  }
}

/** A short, secret-free preview of a path/URL for logging (strips the password). */
export function redactURL(url: string): string {
  return url.replace(/password=[^&]*/i, "password=…");
}
