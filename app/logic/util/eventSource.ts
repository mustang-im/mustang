/**
 * This is an Event that is returned from the EventSource server.
 *
 * Note: If we ever move this code into the backend, the class may or may not work,
 * and it may need to be a plain JSON object. */
export class EventMessage {
  name = "message";
  data = "";
  id = "";
  retry = 0;
}

/**
 * Implements a stream decoder for an EventSource from an HTTP server
 * See spec <https://www.w3.org/TR/eventsource/>
 *
 * Use it like this:
 * ```
 * let stream = await fetch(url, options);
 * if (!stream.ok) {
 *    throw new Error(`EventSource start failed with HTTP ${stream.status} ${stream.statusText}`);
 * }
 * let eventStream = stream.body.pipeThrough(new TextDecoderStream()).pipeThrough(new TransformStream(new EventDecoder()));
 * for await (let event of eventStream) {
 *   if (event.name == "...") { ...
 * ```
 */
export class EventDecoder {
  data = "";
  event = new EventMessage();

  transform(chunk: string, controller: TransformStreamDefaultController) {
    this.data += chunk;
    let lines = this.data.split(/\r\n?|\n/);
    this.data = lines.pop() as string;
    for (let line of lines) {
      if (!line) {
        this.event.data = this.event.data.slice(0, -1);
        controller.enqueue(this.event);
        this.event = new EventMessage();
        continue;
      }
      let value = "";
      let pos = line.indexOf(":");
      if (pos != -1) {
        value = line.slice(pos + 1);
        if (value[0] == " ") {
          value = value.slice(1);
        }
        line = line.slice(0, pos);
      }
      switch (line) {
        case "event":
          this.event.name = value;
          break;
        case "data":
          this.event.data += value + "\n";
          break;
        case "id":
          this.event.id = value;
          break;
        case "retry":
          if (Number.isInteger(value)) {
            this.event.retry = Number(value);
          }
          break;
      }
    }
  }
}
