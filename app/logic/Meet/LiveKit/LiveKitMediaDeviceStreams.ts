import { MediaDeviceStreams } from "../MediaDeviceStreams";
import { notifyChangedProperty, notifyChangedAccessor } from "../../util/Observable";
import { Lock } from "../../util/Lock";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import type { LocalParticipant, LocalTrack } from "livekit-client";

/** Grabs the user's camera, mic or screen, and
 * returns the WebRTC `MediaStream` */
export class LiveKitMediaDeviceStreams extends MediaDeviceStreams {
  localParticipant: LocalParticipant;
  @notifyChangedProperty
  protected _cameraDevice: string;
  @notifyChangedProperty
  protected _micDevice: string;
  protected _lock = new Lock();

  @notifyChangedAccessor
  get cameraOn(): boolean {
    return this.localParticipant.isCameraEnabled;
  }
  @notifyChangedAccessor
  get micOn(): boolean {
    return this.localParticipant.isMicrophoneEnabled;
  }
  @notifyChangedAccessor
  get screenShareOn(): boolean {
    return this.localParticipant.isScreenShareEnabled;
  }

  async setCameraOn(on: boolean, device?: string) {
    const { Track } = await import("livekit-client");
    device ??= this._cameraDevice;
    assert(this.localParticipant, gt`Cannot send yet, because we're still connecting`);
    let lock = await this._lock.lock();
    try {
      if (device && device != this._cameraDevice && this.cameraMicStream) {
        /* `setCameraEnabled(false)` doesn't actually stop the stream, but just mutes/unmutes it.
        * So, the device is accepted initially, but device *changes* are ignored in
        * `setCameraEnabled(true, { deviceId: ... })`.
        * Source code: <https://github.com/livekit/client-sdk-js/blob/ff0de417aeaa71d9fcd07772facbb5ebdcdaf7f0/src/room/participant/LocalParticipant.ts#L482> */
        for (let trackPub of this.localParticipant.getTrackPublications()) {
          if (trackPub.source == Track.Source.Camera) {
            this.localParticipant.unpublishTrack(trackPub.track as LocalTrack);
          }
        }
      }
      await this.localParticipant.setCameraEnabled(on, {
        deviceId: device,
      });
      this._cameraDevice = device;
      this.cameraMicStream = await this.getCameraMicStream();
    } finally {
      lock.release();
    }
  }
  async setMicOn(on: boolean, device?: string) {
    const { Track } = await import("livekit-client");
    device ??= this._micDevice;
    assert(this.localParticipant, gt`Cannot send yet, because we're still connecting`);
    let lock = await this._lock.lock();
    try {
      if (device && device != this._micDevice && this.cameraMicStream) {
        for (let trackPub of this.localParticipant.getTrackPublications()) {
          if (trackPub.source == Track.Source.Microphone) {
            this.localParticipant.unpublishTrack(trackPub.track as LocalTrack);
          }
        }
      }
      await this.localParticipant.setMicrophoneEnabled(on, {
        deviceId: device,
        noiseSuppression: true,
        echoCancellation: true,
        voiceIsolation: true,
        autoGainControl: true,
      });
      this._micDevice = device;
      this.cameraMicStream = await this.getCameraMicStream();
    } finally {
      lock.release();
    }
  }
  async setCameraMicOn(cameraOn: boolean, micOn: boolean, cameraDevice: string = this._cameraDevice, micDevice: string = this._micDevice) {
    cameraDevice ??= this._cameraDevice;
    micDevice ??= this._micDevice;
    await this.setMicOn(micOn, micDevice);
    await this.setCameraOn(cameraOn, cameraDevice);
  }

  async setScreenShare(on: boolean) {
    assert(this.localParticipant, gt`Cannot send yet, because we're still connecting`);
    let lock = await this._lock.lock();
    try {
      await this.localParticipant.setScreenShareEnabled(on);
      this.screenStream = await this.getScreenStream();
    } finally {
      lock.release();
    }
  }

  protected async getCameraMicStream(): Promise<MediaStream> {
    const { Track } = await import("livekit-client");
    let mediaStream = new MediaStream();
    for (let trackPub of this.localParticipant.getTrackPublications()) {
      let isCam = trackPub.source == Track.Source.Camera || trackPub.source == Track.Source.Microphone;
      let track = trackPub.videoTrack || trackPub.audioTrack;
      if (!isCam || !track) {
        continue;
      }
      mediaStream.addTrack(track.mediaStreamTrack);
    }
    return mediaStream;
  }

  protected async getScreenStream(): Promise<MediaStream> {
    const { Track } = await import("livekit-client");
    let mediaStream = new MediaStream();
    for (let trackPub of this.localParticipant.getTrackPublications()) {
      let isScreen = trackPub.source == Track.Source.ScreenShare || trackPub.source == Track.Source.ScreenShareAudio;
      let track = trackPub.videoTrack || trackPub.audioTrack;
      if (!isScreen || !track) {
        continue;
      }
      mediaStream.addTrack(track.mediaStreamTrack);
    }
    return mediaStream;
  }
}
