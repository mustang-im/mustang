import { MediaDeviceStreams } from "../MediaDeviceStreams";
import { notifyChangedAccessor } from "../../util/Observable";
import { NotSupported } from "../../util/util";
import { Track, type LocalParticipant } from "livekit-client";

/** Grabs the user's camera, mic or screen, and
 * returns the WebRTC `MediaStream` */
export class LiveKitMediaDeviceStreams extends MediaDeviceStreams {
  localParticipant: LocalParticipant;

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
    await this.localParticipant.setCameraEnabled(on, {
      deviceId: device,
    });
    this.cameraMicStream = this.getCameraMicStream();
  }
  async setMicOn(on: boolean, device?: string) {
    await this.localParticipant.setMicrophoneEnabled(on, {
      deviceId: device,
    });
    this.cameraMicStream = this.getCameraMicStream();
  }

  async setScreenShare(on: boolean) {
    throw new NotSupported("Not supported by LiveKit yet");
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
