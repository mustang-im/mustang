import { VideoConfMeeting, MeetingState } from "./VideoConfMeeting";
import { MeetingParticipant, ParticipantRole } from "./Participant";
import { VideoStream } from "./VideoStream";
import { MeetAccount } from "./MeetAccount";
import { LocalMediaDeviceStreams } from "./LocalMediaDeviceStreams";
import { DummyMeetStorage } from "./SQL/DummyMeetStorage";
import { PersonUID } from "../Abstract/PersonUID";
import { assert, type URLString } from "../util/util";
import { getUILocale } from "../../l10n/l10n";
import { faker } from '@faker-js/faker';

export class FakeMeeting extends VideoConfMeeting {

  constructor(account = new FakeMeetAccount()) {
    super();
    this.id = crypto.randomUUID();
    this.account = account;
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
  }

  /**
   * Login using OAuth2
   * If already logged in, does nothing.
   * @param relogin if true: Force a new login in any case.
   * @throws OAuth2Error
   */
  async login(interactive: boolean, relogin = false): Promise<void> {
  }

  async createNewConference() {
    let time = new Date().toLocaleString(getUILocale(), { hour: "numeric", minute: "numeric" });
    this.title = `Meeting ${time}`;
    this.state = MeetingState.Init;
  }

  async start() {
    assert(this.id, "Need to create the conference first");
    await super.start();
    this.myParticipant = new MeetingParticipant();
    this.myParticipant.id = crypto.randomUUID();
    this.myParticipant.name = "Me";
    this.myParticipant.role = ParticipantRole.Moderator;
    this.state = MeetingState.Ongoing;

    for (let i = 0; i < 8; i++) {
      await this.addParticipant();
    }
    this.setSpeakerRandomly();
  }

  async addParticipant(person?: PersonUID) {
    let p = new MeetingParticipant();
    p.id = crypto.randomUUID();
    p.name = person?.name ?? faker.person.fullName();
    p.role = ParticipantRole.User;
    p.cameraOn = Math.random() > 0.2;
    p.micOn = true;

    /*
    let video = document.createElement('video');
    video.src = "https://www.mustang.im/videos/ocean-birds.mp4"; // captureStream() denied for cross-domain
    video.muted = true; // Required for autoplay in most browsers
    await video.play();
    let stream = video.captureStream();
    */
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    this.participants.add(p);
    let video = new VideoStream(stream, p);
    video.hasVideo = p.cameraOn;
    this.videos.add(video);
  }

  async removeParticipant(participant?: MeetingParticipant) {
    participant ??= this.participants.first;
    this.videos.removeAll(this.videos.filter(v => v.participant == participant));
    this.participants.remove(participant);
  }

  setSpeakerRandomly() {
    let speaker = this.participants.contents[Math.floor(Math.random() * this.participants.length)];
    speaker.isSpeaking = true;
    let nextTime = Math.random() * 5 * 1000;
    setTimeout(() => this.setSpeakerRandomly(), nextTime);
    setTimeout(() => speaker.isSpeaking = false, nextTime + Math.random() * 3 * 1000 - 500);
  }

  async createInvitationURL(): Promise<URLString> {
    return "https://meet.example.com/room/" + this.id;
  }

  readonly canHandUp = true;
}


export class FakeMeetAccount extends MeetAccount {
  constructor() {
    super();
    this.name = faker.company.name();
    this.url = faker.internet.url();
    this.username = faker.internet.username();
    this.storage = new DummyMeetStorage();
    this.canAudio = true;
    this.canVideo = true;
    this.canScreenShare = true;
    this.canCreateURL = true;
    this.canMultipleParticipants = true;
  }
  newMeeting(): FakeMeeting {
    return new FakeMeeting(this);
  }

  isMeetingURL(url: URL): boolean {
    return url.hostname == "meet.example.com";
  }
}
