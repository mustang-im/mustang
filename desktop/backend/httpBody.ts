import { text as textFromStream } from 'node:stream/consumers';

/**
 * Reads a HTTP response body as UTF-8 text.
 * Shared by our HTTP clients `HTTPConnection` and `NetSession`.
 *
 * @param onChunk If given, the text is not returned, but passed to `onChunk`
 *   in chunks, as they arrive from the network. Each call is awaited, which
 *   applies backpressure and keeps the chunks in order.
 * @returns the body, or "" if it was streamed to `onChunk`
 */
export async function readBodyText(stream: AsyncIterable<any>,
    onChunk?: (chunk: string) => Promise<void>): Promise<string> {
  if (!onChunk) {
    return await textFromStream(stream); // EWS and friends are always UTF-8
  }
  let decoder = new TextDecoder(); // EWS and friends are always UTF-8
  for await (let chunk of stream) {
    let text = decoder.decode(chunk, { stream: true });
    if (text) {
      await onChunk(text);
    }
  }
  let tail = decoder.decode(); // flush a split multi-byte char, if any
  if (tail) {
    await onChunk(tail);
  }
  return "";
}
