export namespace Track {
  export enum Kind {
    Audio = 'audio',
    Video = 'video',
    Unknown = 'unknown',
  }
  export enum Source {
    Camera = 'camera',
    Microphone = 'microphone',
    ScreenShare = 'screen_share',
    ScreenShareAudio = 'screen_share_audio',
    Unknown = 'unknown',
  }
}

export enum ParticipantEvent {
  /**
   * When a new track is published to room *after* the local
   * participant has joined. It will not fire for tracks that are already published.
   *
   * A track published doesn't mean the participant has subscribed to it. It's
   * simply reflecting the state of the room.
   *
   * args: ([[RemoteTrackPublication]])
   */
  TrackPublished = 'trackPublished',

  /**
   * Successfully subscribed to the [[RemoteParticipant]]'s track.
   * This event will **always** fire as long as new tracks are ready for use.
   *
   * args: ([[RemoteTrack]], [[RemoteTrackPublication]])
   */
  TrackSubscribed = 'trackSubscribed',

  /**
   * Could not subscribe to a track
   *
   * args: (track sid)
   */
  TrackSubscriptionFailed = 'trackSubscriptionFailed',

  /**
   * A [[RemoteParticipant]] has unpublished a track
   *
   * args: ([[RemoteTrackPublication]])
   */
  TrackUnpublished = 'trackUnpublished',

  /**
   * A subscribed track is no longer available. Clients should listen to this
   * event and ensure they detach tracks.
   *
   * args: ([[RemoteTrack]], [[RemoteTrackPublication]])
   */
  TrackUnsubscribed = 'trackUnsubscribed',

  /**
   * A track that was muted, fires on both [[RemoteParticipant]]s and [[LocalParticipant]]
   *
   * args: ([[TrackPublication]])
   */
  TrackMuted = 'trackMuted',

  /**
   * A track that was unmuted, fires on both [[RemoteParticipant]]s and [[LocalParticipant]]
   *
   * args: ([[TrackPublication]])
   */
  TrackUnmuted = 'trackUnmuted',

  /**
   * A local track was published successfully. This event is helpful to know
   * when to update your local UI with the newly published track.
   *
   * args: ([[LocalTrackPublication]])
   */
  LocalTrackPublished = 'localTrackPublished',

  /**
   * A local track was unpublished. This event is helpful to know when to remove
   * the local track from your UI.
   *
   * When a user stops sharing their screen by pressing "End" on the browser UI,
   * this event will also fire.
   *
   * args: ([[LocalTrackPublication]])
   */
  LocalTrackUnpublished = 'localTrackUnpublished',

  /**
   * A local track has been constrained by cpu.
   * This event is useful to know when to reduce the capture resolution of the track.
   *
   * This event is emitted on the local participant.
   *
   * args: ([[LocalVideoTrack]], [[LocalTrackPublication]])
   */
  LocalTrackCpuConstrained = 'localTrackCpuConstrained',

  /**
   * @internal
   */
  LocalSenderCreated = 'localSenderCreated',

  /**
   * Participant metadata is a simple way for app-specific state to be pushed to
   * all users.
   * When RoomService.UpdateParticipantMetadata is called to change a participant's
   * state, *all*  participants in the room will fire this event.
   * To access the current metadata, see [[Participant.metadata]].
   *
   * args: (prevMetadata: string)
   *
   */
  ParticipantMetadataChanged = 'participantMetadataChanged',

  /**
   * Participant's display name changed
   *
   * args: (name: string, [[Participant]])
   *
   */
  ParticipantNameChanged = 'participantNameChanged',

  /**
   * Data received from this participant as sender.
   * Data packets provides the ability to use LiveKit to send/receive arbitrary payloads.
   * All participants in the room will receive the messages sent to the room.
   *
   * args: (payload: Uint8Array, kind: [[DataPacket_Kind]])
   */
  DataReceived = 'dataReceived',

  /**
   * SIP DTMF tones received from this participant as sender.
   *
   * args: (dtmf: [[DataPacket_Kind]])
   */
  SipDTMFReceived = 'sipDTMFReceived',

  /**
   * Transcription received from this participant as data source.
   * @beta
   */
  TranscriptionReceived = 'transcriptionReceived',

  /**
   * Has speaking status changed for the current participant
   *
   * args: (speaking: boolean)
   */
  IsSpeakingChanged = 'isSpeakingChanged',

  /**
   * Connection quality was changed for a Participant. It'll receive updates
   * from the local participant, as well as any [[RemoteParticipant]]s that we are
   * subscribed to.
   *
   * args: (connectionQuality: [[ConnectionQuality]])
   */
  ConnectionQualityChanged = 'connectionQualityChanged',

  /**
   * StreamState indicates if a subscribed track has been paused by the SFU
   * (typically this happens because of subscriber's bandwidth constraints)
   *
   * When bandwidth conditions allow, the track will be resumed automatically.
   * TrackStreamStateChanged will also be emitted when that happens.
   *
   * args: (pub: [[RemoteTrackPublication]], streamState: [[Track.StreamState]])
   */
  TrackStreamStateChanged = 'trackStreamStateChanged',

  /**
   * One of subscribed tracks have changed its permissions for the current
   * participant. If permission was revoked, then the track will no longer
   * be subscribed. If permission was granted, a TrackSubscribed event will
   * be emitted.
   *
   * args: (pub: [[RemoteTrackPublication]],
   *        status: [[TrackPublication.SubscriptionStatus]])
   */
  TrackSubscriptionPermissionChanged = 'trackSubscriptionPermissionChanged',

  /**
   * One of the remote participants publications has changed its subscription status.
   *
   */
  TrackSubscriptionStatusChanged = 'trackSubscriptionStatusChanged',

  /**
   * a local track has been constrained by cpu
   */
  TrackCpuConstrained = 'trackCpuConstrained',

  // fired only on LocalParticipant
  /** @internal */
  MediaDevicesError = 'mediaDevicesError',

  // fired only on LocalParticipant
  /** @internal */
  AudioStreamAcquired = 'audioStreamAcquired',

  /**
   * A participant's permission has changed.
   * args: (prevPermissions: [[ParticipantPermission]])
   */
  ParticipantPermissionsChanged = 'participantPermissionsChanged',

  /** @internal */
  PCTrackAdded = 'pcTrackAdded',

  /**
   * Participant attributes is an app-specific key value state to be pushed to
   * all users.
   * When a participant's attributes changed, this event will be emitted with the changed attributes
   * args: (changedAttributes: [[Record<string, string]])
   */
  AttributesChanged = 'attributesChanged',

  /**
   * fired on local participant only, when the first remote participant has subscribed to the track specified in the payload
   */
  LocalTrackSubscribed = 'localTrackSubscribed',

  /** only emitted on local participant */
  ChatMessage = 'chatMessage',

  /**
   * Emitted when the participant's state changes to ACTIVE and is ready to send/receive data messages
   */
  Active = 'active',
}
