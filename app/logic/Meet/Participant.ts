// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { Person } from "../Abstract/Person";
import { notifyChangedProperty } from "../util/Observable";

export class MeetingParticipant extends Person {
  @notifyChangedProperty
  role: ParticipantRole;
  @notifyChangedProperty
  handUp = false;
  @notifyChangedProperty
  micOn = false;
  @notifyChangedProperty
  cameraOn = false;
  @notifyChangedProperty
  screenSharing = false;

  peerConnection: RTCPeerConnection;  // prevent garbage collection
  screenPeerConnection: RTCPeerConnection; // ditto
}

export enum ParticipantRole {
  Moderator = "moderator",
  User = "user",
  Guest = "guest",
}
