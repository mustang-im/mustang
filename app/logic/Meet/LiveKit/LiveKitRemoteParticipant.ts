import { MeetingParticipant, ParticipantRole } from "../Participant";
import { ParticipantVideo, ScreenShare, VideoStream } from "../VideoStream";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { catchErrors } from "../../../frontend/Util/error";
import { assert } from "../../util/util";
import type { LiveKitConf } from "./LiveKitConf";
import { ParticipantEvent, RemoteParticipant, Track, TrackPublication } from "livekit-client";

export class LiveKitRemoteParticipant extends MeetingParticipant {
  rp: RemoteParticipant;
  conf: LiveKitConf;
  video: ParticipantVideo;
  screenShare: ScreenShare;

  constructor(rp: RemoteParticipant, conf: LiveKitConf) {
    super();
    this.rp = rp;
    this.conf = conf;
    this.id = rp.identity;
    this.role = rp.isAgent ? ParticipantRole.Agent : ParticipantRole.User;
    this.updateProps();
    rp.on(ParticipantEvent.ParticipantNameChanged, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.AttributesChanged, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.ParticipantMetadataChanged, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackPublished, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackUnpublished, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.IsSpeakingChanged, () => catchErrors(() => this.speakingChanged(), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackSubscribed, track => catchErrors(() => this.addTrack(track), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackUnsubscribed, track => catchErrors(() => this.removeTrack(track), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackMuted, trackPub => catchErrors(() => this.trackMuted(trackPub), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackUnmuted, trackPub => catchErrors(() => this.trackUnmuted(trackPub), this.conf.errorCallback));

    for (let trackPub of rp.trackPublications.values()) {
      if (!trackPub.isSubscribed || !trackPub.track) {
        continue;
      }
      this.addTrack(trackPub.track);
    }
  }
  protected updateProps() {
    let rp = this.rp;
    console.log("Participant", rp.identity, rp);
    this.name = rp.name || rp.identity;
    this.cameraOn = rp.isCameraEnabled;
    this.micOn = rp.isMicrophoneEnabled;
    this.screenSharing = rp.isScreenShareEnabled;
    this.handUp = sanitize.boolean(rp.attributes.handUp);
  }
  protected speakingChanged() {
    this.isSpeaking = this.rp.isSpeaking;
    if (this.rp.isSpeaking) {
      this.conf.speaker = this;
    } else if (this.conf.speaker == this) {
      this.conf.speaker = null;
    }
  }

  async addTrack(track: Track) {
    console.log("Participant", this.rp.identity, "added a track", track.mediaStream, track.mediaStream.getTracks());
    assert(track.mediaStream, "Need mediaStream for Track");
    let isScreen = track.source == Track.Source.ScreenShare || track.source == Track.Source.ScreenShareAudio;
    let video: VideoStream;
    if (isScreen) {
      if (!this.screenShare) {
        this.screenShare = new ScreenShare(new MediaStream(), this);
        this.conf.videos.add(this.screenShare);
      }
      video = this.screenShare;
    } else {
      if (!this.video) {
        this.video = new ParticipantVideo(new MediaStream(), this);
        this.conf.videos.add(this.video);
      }
      video = this.video;
    }
    if (track.kind == Track.Kind.Video) {
      video.hasVideo = true;
    }

    video.stream.addTrack(track.mediaStreamTrack);
  }
  async removeTrack(track: Track) {
    console.log("Participant", this.rp.identity, "removed a track");
    let isScreen = track.source == Track.Source.ScreenShare || track.source == Track.Source.ScreenShareAudio;
    let video = isScreen ? this.screenShare : this.video;
    if (!video) {
      return;
    }

    video.stream.removeTrack(track.mediaStreamTrack);

    let remainingTracks = video.stream.getTracks();
    video.hasVideo = remainingTracks.some(t => t.kind == "video");
    if (!remainingTracks.length) {
      this.conf.videos.remove(video);
      if (isScreen) {
        this.screenShare = null;
      } else {
        this.video = null;
      }
    }
  }
  async trackMuted(trackPub: TrackPublication) {
    this.updateProps();
    if (trackPub.videoTrack) {
      this.removeTrack(trackPub.videoTrack);
    }
  }
  async trackUnmuted(trackPub: TrackPublication) {
    this.updateProps();
    if (trackPub.videoTrack) {
      this.addTrack(trackPub.videoTrack);
    }
  }
}
