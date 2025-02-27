import { OWANotifications } from "./OWANotifications";
import { appGlobal } from "../../../app";

export class OWAOffice365Notifications extends OWANotifications {
  async start(): Promise<never> {
    let cid = "00000000-0000-0000-0000-000000000000".replace(/0/g, () => Math.floor(Math.random() * 16).toString(16));
    let json: any;
    let options: { headers: { Authorization: string } };
    let pingTimer;
    let abortTimer;
    try {
      // This loop only ends by exception (e.g. logout) or app shutdown.
      while (true) {
        // Some of the endpoints use the canary; others use this access token.
        let request = new OWAGetAccessTokenforResourceRequest(this.account.url + "notificationchannel/");
        let response = await this.account.callOWA(request);
        options = {
          headers: {
            Authorization: `Bearer ${response.AccessToken}`,
          },
        };
        // Streaming requests require additional headers.
        let streamOptions = {
          headers: {
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
            "Last-Event-ID": "null", // TODO Will be needed for reconnection
            Authorization: `Bearer ${response.AccessToken}`,
          },
        };
        // The remaining requests require a connection token.
        // This request also gives us the transport and keep alive timeouts.
        let url = this.account.url + "notificationchannel/negotiate?cid=" + cid;
        response = await appGlobal.remoteApp.OWA.fetchJSON(this.account.partition, url);
        if (!response.ok) {
          throw new Error(`negotiate failed with HTTP ${response.status} ${response.statusText}`);
        }
        json = response.json;
        // Tell the server to start sending events.
        url = `${this.account.url}notificationchannel/start?transport=serverSentEvents&cid=${cid}&connectionToken=${encodeURIComponent(json.ConnectionToken)}`;
        response = await appGlobal.remoteApp.OWA.fetchJSON(this.account.partition, url);
        //console.log("response", response.ok ? "OK" : "Failed", "status", response.status, "statusText", response.statusText, "response obj", response);
        if (!response.ok) {
          throw new Error(`start failed with HTTP ${response.status} ${response.statusText}`);
        }
        // We have to request a ping every 5 minutes,
        // otherwise we stop receiving events.
        url = `${this.account.url}notificationchannel/ping?transport=serverSentEvents&cid=${cid}&connectionToken=${encodeURIComponent(json.ConnectionToken)}`;
        pingTimer = setInterval(appGlobal.remoteApp.OWA.fetchJSON, (json.TransportConnectTimeout || 5) * 60 * 1000, this.account.partition, url, options);
        // We have to abort the stream after 40 minutes,
        // because the access token will expire eventually.
        url = `${this.account.url}notificationchannel/abort?transport=serverSentEvents&cid=${cid}&connectionToken=${encodeURIComponent(json.ConnectionToken)}`;
        abortTimer = setTimeout(appGlobal.remoteApp.OWA.fetchJSON, (json.KeepAliveTimeout || 40) * 60 * 1000, this.account.partition, url, options);
        // Now set up the stream itself.
        url = `${this.account.url}notificationchannel/connect?transport=serverSentEvents&cid=${cid}&connectionToken=${encodeURIComponent(json.ConnectionToken)}`;
        let stream = await appGlobal.remoteApp.OWA.streamEvents(this.account.partition, url, streamOptions);
        //console.log("stream", stream.ok ? "OK" : "Failed", "status", stream.status, "statusText", stream.statusText, "stream obj", stream);
        if (!stream.ok) {
          throw new Error(`streamEvents failed with HTTP ${stream.status} ${stream.statusText}`);
        }
        for await (let chunk of stream.body) {
          //console.log(chunk);
          // Ignore the initial chunk and any heartbeat chunks
          if (chunk.data != "initialized" && chunk.data != "{}") {
            // Avoid racing with ourselves, if we caused the notification.
            await new Promise(resolve => setTimeout(resolve, 100));
            let json = JSON.parse(chunk.data);
            await this.account.onNotificationMessages(json.M);
          }
        }
        clearInterval(pingTimer);
        clearTimeout(abortTimer);
      }
    } finally {
      clearInterval(pingTimer);
      clearTimeout(abortTimer);
      if (json?.ConnectionToken) {
        let url = `${this.account.url}notificationchannel/abort?transport=serverSentEvents&cid=${cid}&connectionToken=${encodeURIComponent(json.ConnectionToken)}`;
        appGlobal.remoteApp.OWA.fetchJSON(this.account.partition, url, options);
      }
    }
  }
}

class OWAGetAccessTokenforResourceRequest {
  /* This request doesn't have the header and body that most requests have. */
  readonly __type = "TokenRequest:#Exchange";
  readonly Resource: string;

  constructor(url: string) {
    this.Resource = url;
  }

  get action() {
    return "GetAccessTokenforResource";
  }
}
