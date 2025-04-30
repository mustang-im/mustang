import { MediaDeviceStreams } from "./MediaDeviceStreams";
import { notifyChangedAccessor, notifyChangedProperty } from "../util/Observable";
import { NotImplemented, assert } from "../util/util";
import { gt } from "../../l10n/l10n";

/** Grabs the user's camera, mic or screen, and
 * returns the WebRTC `MediaStream` */
export class LocalMediaDeviceStreams extends MediaDeviceStreams {
  @notifyChangedProperty
  protected _cameraOn: boolean = true;
  @notifyChangedProperty
  protected _micOn: boolean = true;
  protected _cameraDevice: string;
  protected _micDevice: string;

  @notifyChangedAccessor
  get cameraOn(): boolean {
    return this._cameraOn;
  }
  @notifyChangedAccessor
  get micOn(): boolean {
    return this._micOn;
  }
  @notifyChangedAccessor
  get screenShareOn(): boolean {
    return !!this.screenStream;
  }

  async setCameraOn(on: boolean, device: string = this._cameraDevice) {
    let cameraChanged = device != this._cameraDevice;
    this._cameraDevice = device;
    if (cameraChanged && on && this.cameraMicStream) {
      await this.stopCameraMicStream();
      await this.startCameraMicStream();
      return;
    }
    if (on && !this.cameraMicStream) {
      this._cameraOn = true;
      await this.startCameraMicStream();
      return;
    }
    // Stop camera, don't just mute
    if (!on && this.cameraMicStream) {
      this._cameraOn = false;
      await this.stopCameraMicStream();
      return;
    }
    if (this._cameraOn === on) {
      return;
    }
    this._cameraOn = on;
  }
  async setMicOn(on: boolean, device: string = this._micDevice) {
    let micChanged = device != this._micDevice;
    this._micDevice = device;
    if (micChanged && on && this.cameraMicStream) {
      await this.stopCameraMicStream();
      await this.startCameraMicStream();
      return;
    }
    if (this._micOn === on) {
      return;
    }
    if (on && !this.cameraMicStream) {
      await this.startCameraMicStream();
      return;
    }
    // Mute only, don't restart
    let audioTracks = this.cameraMicStream?.getAudioTracks() ?? [];
    for (let audioTrack of audioTracks) {
      audioTrack.enabled = on;
    }
    this._micOn = on;
  }
  protected async startCameraMicStream(): Promise<void> {
    let setup = {
      video: this.cameraOn ? {
        deviceId: this._cameraDevice,
        facingMode: "user",
      } : false,
      audio: {
        deviceId: this._micDevice,
      },
    };
    this.cameraMicStream = await navigator.mediaDevices.getUserMedia(setup);
    assert(this.cameraMicStream, gt`Unable to start your camera/mic`);
    if (!this.micOn) {
      this._micOn = true;
      await this.setMicOn(false);
    }
  }
  protected async stopCameraMicStream(): Promise<void> {
    if (!this.cameraMicStream) {
      return;
    }
    for (let track of this.cameraMicStream.getTracks()) {
      track.stop();
    }
    this.cameraMicStream = null;
  }

  async setScreenShare(on: boolean) {
    if (on && !this.screenStream) {
      await this.startScreenShare();
    }
    if (!on && this.screenStream) {
      await this.stopScreenShare();
    }
  }
  protected async startScreenShare(): Promise<MediaStream> {
    // <https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture>
    this.screenStream = await navigator.mediaDevices.getDisplayMedia();
    assert(this.cameraMicStream, gt`Unable to share your screen`);
    return this.screenStream;
  }
  protected async stopScreenShare(): Promise<MediaStream> {
    if (!this.screenStream) {
      return;
    }
    for (let track of this.screenStream.getTracks()) {
      track.stop();
    }
    this.screenStream = null;
  }
}
