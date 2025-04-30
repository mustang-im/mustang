import { MediaDeviceStreams } from "../MediaDeviceStreams";
import { notifyChangedAccessor } from "../../util/Observable";
import type { LocalParticipant } from "livekit-client";

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
  }
  async setMicOn(on: boolean, device?: string) {
    await this.localParticipant.setMicrophoneEnabled(on, {
      deviceId: device,
    });
  }

  async setScreenShare(on: boolean) {
    await this.localParticipant.setScreenShareEnabled(on);
  }
}
