import { MediaDeviceStreams } from "./MediaDeviceStreams";
import { appGlobal } from "../app";
import { notifyChangedAccessor, notifyChangedProperty } from "../util/Observable";
import { Lock } from "../util/flow/Lock";
import { assert, exMessage } from "../util/util";
import { webMail } from "../build";
import { gt } from "../../l10n/l10n";

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

  /** Camera actually in use. May differ from selected, e.g. after a fallback. */
  get cameraDevice(): string {
    return this._cameraDevice;
  }
  get micDevice(): string {
    return this._micDevice;
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
    const isMac = navigator.platform?.includes("Mac") && !webMail;
    if (isMac) {
      if (cameraOn) {
        let cameraAccess = await appGlobal.remoteApp.askForMediaAccess('camera');
        assert(cameraAccess, gt`Camera access denied`);
      }
      if (micOn) {
        let micAccess = await appGlobal.remoteApp.askForMediaAccess('microphone');
        assert(micAccess, gt`Microphone access denied`);
      }
    }

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
    // Chrome ignores the `ideal` deviceId and only uses `exact` (Bug)
    let setup: MediaStreamConstraints = {
      video: cameraOn ? {
        deviceId: cameraDevice ? { exact: cameraDevice } : undefined,
        facingMode: "user",
      } : false,
      audio: { // Mic always on, to avoid camera flicker on mute/unmute
        deviceId: micDevice ? { exact: micDevice } : undefined,
        echoCancellation: "system" as any as boolean, // (wrong TypeScript declaration)
        noiseSuppression: true,
        autoGainControl: true,
      },
    };
    try {
      this.cameraMicStream = await navigator.mediaDevices.getUserMedia(setup);
    } catch (ex) {
      // If the selected device is gone or busy, then re-try with other device.
      // Without this, on Firefox, we cannot even list devices and the user cannot choose another.
      if (!(this.isDeviceStartError(ex) && (cameraDevice || micDevice))) {
        throw await this.getDeviceStartErrorMessage(ex, cameraOn);
      }
      let anyVideo: MediaTrackConstraints | false =
        cameraOn ? {
          facingMode: "user",
        } : false;
      let anyAudio: MediaTrackConstraints = {
        echoCancellation: "system" as any as boolean,
        noiseSuppression: true,
        autoGainControl: true,
      };
      let retries = [
        { video: setup.video, audio: anyAudio }, // mic broken, keep camera
        { video: anyVideo, audio: setup.audio }, // camera broken, keep mic
        { video: anyVideo, audio: anyAudio }, // both broken
      ] as MediaStreamConstraints[];
      for (let retry of retries) {
        try {
          this.cameraMicStream = await navigator.mediaDevices.getUserMedia(retry);
          break;
        } catch (ex2) {
          // try the next variation
        }
      }
      if (!this.cameraMicStream) {
        throw await this.getDeviceStartErrorMessage(ex, cameraOn);
      }
    }
    assert(this.cameraMicStream, gt`Unable to start your camera/mic`);
    // Save the actual device used, e.g. after a fallback above
    this._cameraDevice = this.cameraMicStream.getVideoTracks()[0]?.getSettings()?.deviceId ?? cameraDevice;
    this._micDevice = this.cameraMicStream.getAudioTracks()[0]?.getSettings()?.deviceId ?? micDevice;
    this._cameraOn = cameraOn;
    this._micOn = true; // We started the mic unconditionally
    if (!micOn) {
      this.enableAudio(false); // mute
    }
  }
  protected isDeviceStartError(ex: Error): boolean {
    return ex?.name == "NotReadableError" || ex?.name == "AbortError" || ex?.name == "OverconstrainedError";
  }
  protected async getDeviceStartErrorMessage(ex: Error, cameraOn: boolean): Promise<Error> {
    if (ex?.name == "OverconstrainedError") {
      return exMessage(ex, gt`The selected camera or microphone is disconnected. Please chose another device.`);
    }
    if (ex?.name == "NotReadableError" || ex?.name == "AbortError") {
      if (!cameraOn) {
        return exMessage(ex, gt`Your microphone is in use. Please stop the other application.`);
      }
      let devices = await navigator.mediaDevices.enumerateDevices();
      let cameras = devices?.filter(d => d.kind == "videoinput")?.length ?? 0;
      return exMessage(ex, cameras == 1
        ? gt`Your camera is in use. Please stop the other video application.`
        : gt`Your camera is in use. Please stop the other video application, or select another camera.`);
    }
    return ex;
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
