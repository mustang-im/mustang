import { MediaDeviceStreams } from "../MediaDeviceStreams";
import { notifyChangedAccessor } from "../../util/Observable";
import { NotSupported, assert } from "../../util/util";
import { Track, type LocalParticipant, LocalTrack } from "livekit-client";
import { gt } from "../../../l10n/l10n";

/** Grabs the user's camera, mic or screen, and
 * returns the WebRTC `MediaStream` */
export class LiveKitMediaDeviceStreams extends MediaDeviceStreams {
  localParticipant: LocalParticipant;
  currentCameraID: string;
  currentMicID: string;

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
    assert(this.localParticipant, gt`Cannot send yet, because we're still connecting`);
    if (device && device != this.currentCameraID && this.cameraMicStream) {
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
    this.currentCameraID = device;
    this.cameraMicStream = this.getCameraMicStream();
  }
  async setMicOn(on: boolean, device?: string) {
    assert(this.localParticipant, gt`Cannot send yet, because we're still connecting`);
    if (device && device != this.currentMicID && this.cameraMicStream) {
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
    this.currentMicID = device;
    this.cameraMicStream = this.getCameraMicStream();
  }

  async setScreenShare(on: boolean) {
    if (on) {
      throw new NotSupported("Not supported by LiveKit yet");
    } else {
      return;
    }
    assert(this.localParticipant, gt`Cannot send yet, because we're still connecting`);
    await this.localParticipant.setScreenShareEnabled(on);
    this.screenStream = this.getScreenStream();
  }

  protected getCameraMicStream(): MediaStream {
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

  protected getScreenStream(): MediaStream {
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
