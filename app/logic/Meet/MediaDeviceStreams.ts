import { Observable, notifyChangedAccessor, notifyChangedProperty } from "../util/Observable";
import { AbstractFunction } from "../util/util";

/** Grabs the user's camera, mic or screen, and
 * returns the WebRTC `MediaStream` */
export class MediaDeviceStreams extends Observable {
  @notifyChangedProperty
  cameraMicStream: MediaStream;
  @notifyChangedProperty
  screenStream: MediaStream;

  /** Mutes or unmutes camera */
  @notifyChangedAccessor
  get cameraOn(): boolean {
    throw new AbstractFunction();
  }
  /** Mutes or unmutes microphone */
  @notifyChangedAccessor
  get micOn(): boolean {
    throw new AbstractFunction();
  }
  get screenShareOn(): boolean {
    throw new AbstractFunction();
  }

  async setCameraOn(on: boolean, device?: string) {
    throw new AbstractFunction();
  }
  async setMicOn(on: boolean, device?: string) {
    throw new AbstractFunction();
  }
  async setCameraMicOn(cameraOn: boolean, micOn: boolean, cameraDevice: string = undefined, micDevice: string = undefined) {
    throw new AbstractFunction();
  }

  async setScreenShare(on: boolean) {
    throw new AbstractFunction();
  }
}
