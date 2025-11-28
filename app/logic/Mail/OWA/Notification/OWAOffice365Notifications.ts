import { OWANotifications } from "./OWANotifications";
import { appGlobal } from "../../../app";
import { URLPart } from "../../../../frontend/Util/util";

export class OWAOffice365Notifications extends OWANotifications {
  async start(): Promise<never> {
    let cid = "00000000-0000-0000-0000-000000000000".replace(/0/g, () => Math.floor(Math.random() * 16).toString(16));
    let json: any;
    let timerOptions: { headers: { Authorization: string } };
    let pingTimer;
    let abortTimer;
    try {
      // This loop only ends by exception (e.g. logout) or app shutdown.
      while (true) {
        // The ping, abort and stream requests use this access token.
        let request = new OWAGetAccessTokenforResourceRequest(this.account.url + "notificationchannel/");
        let response = await this.account.callOWA(request);
        timerOptions = {
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
        // Negotiate and start requests use the main access token.
        let options = {
          headers: {
            Authorization: this.account.authorizationHeader,
          },
        };
        // The remaining requests require a connection token.
        // This request also gives us the transport and keep alive timeouts.
        let url = this.account.url + "notificationchannel/negotiate?cid=" + cid;
        response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`negotiate failed with HTTP ${response.status} ${response.statusText}`);
        }
        json = await response.json();
        // Tell the server to start sending events.
        url = this.account.url + URLPart`notificationchannel/start?transport=serverSentEvents&cid=${cid}&connectionToken=${json.ConnectionToken}`;
        response = await fetch(url, options);
        //console.log("response", response.ok ? "OK" : "Failed", "status", response.status, "statusText", response.statusText, "response obj", response);
        if (!response.ok) {
          throw new Error(`start failed with HTTP ${response.status} ${response.statusText}`);
        }
        // We have to request a ping every 5 minutes,
        // otherwise we stop receiving events.
        url = this.account.url + URLPart`notificationchannel/ping?transport=serverSentEvents&cid=${cid}&connectionToken=${json.ConnectionToken}`;
        pingTimer = setInterval(fetch, (json.TransportConnectTimeout || 5) * 60 * 1000, url, timerOptions);
        // We have to abort the stream after 40 minutes,
        // because the access token will expire eventually.
        url = this.account.url + URLPart`notificationchannel/abort?transport=serverSentEvents&cid=${cid}&connectionToken=${json.ConnectionToken}`;
        abortTimer = setTimeout(fetch, (json.KeepAliveTimeout || 40) * 60 * 1000, url, timerOptions);
        // Now set up the stream itself.
        url = this.account.url + URLPart`notificationchannel/connect?transport=serverSentEvents&cid=${cid}&connectionToken=${json.ConnectionToken}`;
        let stream = await fetch(url, streamOptions);
        //console.log("stream", stream.ok ? "OK" : "Failed", "status", stream.status, "statusText", stream.statusText, "stream obj", stream);
        if (!stream.ok) {
          throw new Error(`stream fetch failed with HTTP ${stream.status} ${stream.statusText}`);
        }
        for await (let chunk of stream.body.pipeThrough(new TextDecoderStream()).pipeThrough(new TransformStream(new EventDecoder()))) {
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
        let url = this.account.url + URLPart`notificationchannel/abort?transport=serverSentEvents&cid=${cid}&connectionToken=${json.ConnectionToken}`;
        fetch(url, timerOptions);
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

function newEvent() {
  return {
    name: 'message',
    data: '',
    id: '',
    retry: 0,
  };
}

class EventDecoder {
  data = '';
  event = newEvent();
  transform(chunk, controller) {
    this.data += chunk;
    let lines = this.data.split(/\r\n?|\n/);
    this.data = lines.pop();
    for (let line of lines) {
      if (!line) {
        this.event.data = this.event.data.slice(0, -1);
        controller.enqueue(this.event);
        this.event = newEvent();
        continue;
      }
      let value = '';
      let pos = line.indexOf(":");
      if (pos != -1) {
        value = line.slice(pos + 1);
        if (value[0] == ' ') {
          value = value.slice(1);
        }
        line = line.slice(0, pos);
      }
      switch (line) {
      case 'event':
        this.event.name = value;
        break;
      case 'data':
        this.event.data += value + "\n";
        break;
      case 'id':
        this.event.id = value;
        break;
      case 'retry':
        if (Number.isInteger(value)) {
          this.event.retry = Number(value);
        }
        break;
      }
    }
  }
}
