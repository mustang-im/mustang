# jpc-ws - Remote procedure calls between JS objects over WebSocket

jpc allows you to call JS objects in other processes. From your JS objects, it automatically
creates an API that resembles your object API, just with an `await` in front of every call.
It then transmits the call over the channel and call the objects in the remote process,
and returns the result back to you.

See the [jpc API](https://github.com/benbucksch/jpc/#README.md)

This implements the WebSocket protocol.

# WebSocket server

```
import { JPCWebSocket } from "jpc-ws";

let jpc = new JPCWebSocket(myApp);
await jpc.listen("test", kPort, false);
```


# WebSocket client

```
import { JPCWebSocket } from "jpc-ws";

let jpc = new JPCWebSocket();
await jpc.connect("test", null, kPort);
let myApp = await jpc.getRemoteStartObject();
```
