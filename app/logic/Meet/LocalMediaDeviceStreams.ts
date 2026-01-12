import { MediaDeviceStreams } from "./MediaDeviceStreams";
import { notifyChangedAccessor, notifyChangedProperty } from "../util/Observable";
import { Lock } from "../util/Lock";
import { assert } from "../util/util";
import { gt } from "../../l10n/l10n";
// #if [!WEBMAIL && !MOBILE]
import { appGlobal } from "../app";
// #endif

/** Grabs the user's camera, mic or screen, and
 * returns the WebRTC `MediaStream` */
export class LocalMediaDeviceStreams extends MediaDeviceStreams {
  @notifyChangedProperty
  protected _cameraOn: boolean = false;
  @notifyChangedProperty
  protected _micOn: boolean = false;
  protected _cameraDevice: string;
  protected _micDevice: string;
  protected _lock = new Lock();

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
    device ??= this._cameraDevice;
    await this.setCameraMicOn(on, this._micOn, device, this._micDevice);
  }
  async setMicOn(on: boolean, device: string = this._micDevice) {
    device ??= this._micDevice;
    await this.setCameraMicOn(this._cameraOn, on, this._cameraDevice, device);
  }
  async setCameraMicOn(cameraOn: boolean, micOn: boolean, cameraDevice: string = this._cameraDevice, micDevice: string = this._micDevice) {
    // #if [!WEBMAIL && !MOBILE]
    if (cameraOn) {
      let cameraAccess = await appGlobal.remoteApp.askForMediaAccess('camera');
      assert(cameraAccess, gt`Camera access denied`);
    }
    if (micOn) {
      let micAccess = await appGlobal.remoteApp.askForMediaAccess('microphone');
      assert(micAccess, gt`Microphone access denied`);
    }
    // #endif

    cameraDevice ??= this._cameraDevice;
    micDevice ??= this._micDevice;
    let lock = await this._lock.lock();
    try {
      console.log(
        " cam on", this._cameraOn == cameraOn ? cameraOn : this._cameraOn + " => " + cameraOn, "\n",
        "mic on", this.micOn == micOn ? micOn : this._micOn + " => " + micOn, "\n",
        "cam device", this._cameraDevice == cameraDevice ? cameraDevice?.substring(0, 4) : this._cameraDevice?.substring(0, 4) + " => " + cameraDevice?.substring(0, 4), "\n",
        "mic device", this._micDevice == micDevice ? micDevice?.substring(0, 4) : this._micDevice?.substring(0, 4) + " => " + micDevice?.substring(0, 4), "\n");
      let deviceChanged = cameraDevice != this._cameraDevice || micDevice != this._micDevice;
      let camToggled = cameraOn != this._cameraOn;
      let micToggled = micOn != this._micOn;
      if (micToggled && this.cameraOn && cameraOn && !deviceChanged && this.cameraMicStream) {
        // Mute/unmute only, don't restart video stream
        this.enableAudio(micOn);
        return;
      }
      if ((deviceChanged || camToggled) && (cameraOn || micOn) && this.cameraMicStream) {
        await this.stopCameraMicStream();
        await this.startCameraMicStream(cameraOn, micOn, cameraDevice, micDevice);
        return;
      }
      if (this.cameraOn === cameraOn && this.micOn === micOn) {
        return;
      }
      if ((cameraOn || micOn) && !this.cameraMicStream) {
        await this.startCameraMicStream(cameraOn, micOn, cameraDevice, micDevice);
        return;
      }
      if (!cameraOn && !micOn && this.cameraMicStream) {
        await this.stopCameraMicStream();
        return;
      }
    } finally {
      lock.release();
    }
  }
  protected async startCameraMicStream(cameraOn: boolean, micOn: boolean, cameraDevice: string, micDevice: string): Promise<void> {
    let setup = {
      video: cameraOn ? {
        deviceId: cameraDevice,
        facingMode: "user",
      } : false,
      audio: { // Mic always on, to avoid camera flicker on mute/unmute
        deviceId: micDevice,
        echoCancellation: "system" as any as boolean, // (wrong TypeScript declaration)
        noiseSuppression: true,
        autoGainControl: true,
      },
    };
    this.cameraMicStream = await navigator.mediaDevices.getUserMedia(setup);
    assert(this.cameraMicStream, gt`Unable to start your camera/mic`);
    this._cameraDevice = cameraDevice;
    this._micDevice = micDevice;
    this._cameraOn = cameraOn;
    this._micOn = true; // We started the mic unconditionally
    if (!micOn) {
      this.enableAudio(false); // mute
    }
  }
  /** mute/unmute
   * @param on
   *   true = unmute
   *   false = mute */
  protected enableAudio(on: boolean) {
    let audioTracks = this.cameraMicStream?.getAudioTracks() ?? [];
    for (let audioTrack of audioTracks) {
      audioTrack.enabled = on;
    }
    this._micOn = on;
  }
  protected async stopCameraMicStream(): Promise<void> {
    if (!this.cameraMicStream) {
      return;
    }
    for (let track of this.cameraMicStream.getTracks()) {
      track.stop();
    }
    this.cameraMicStream = null;
    this._cameraOn = false;
    this._micOn = false;
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
  protected async stopScreenShare(): Promise<void> {
    if (!this.screenStream) {
      return;
    }
    for (let track of this.screenStream.getTracks()) {
      track.stop();
    }
    this.screenStream = null;
  }
}
