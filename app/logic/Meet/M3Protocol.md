# M3 Protocol

This documents the on-the-wire protocol that is needed to login, set up a video conference, join, and administrate it.

## Login

1. OAuth2
TODO

scope: openid phone profile email
expires_in 300
refresh_expires_in 1800

2. Login to controller
https://<controller-host>/v1/auth/login
e.g. https://controller.mustang.im/v1/auth/login
no authentication header
POST Request
{
  "id_token": <bearer-token>
}
Reponse:
empty

## General

authorization: Bearer <token>
content-type: application/json

User-Agent: ...
Accept: */*
Accept-Language: de,en-US;q=0.7,en;q=0.3
Accept-Encoding: gzip, deflate, br

Host: controller.mustang.im
Origin: https://mustang.im
Referer: https://mustang.im/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-site

## Create conference event

1. Create event

https://<controller-host>/v1/events
e.g. https://controller.mustang.im/v1/events
POST Request:
{
  "title": "Ad-hoc Meeting 13:54",
  "description": "",
  "is_time_independent": true,
  "waiting_room": false,
  "recurrence_pattern": [],
  "is_adhoc": true
}
Response:
{
  "id": "9b117da0-210c-4b31-9729-7ea1ad96602a",
  "title": "Ad-hoc Meeting 13:54",
  "description": "",
  "room": {
    "id": "1fe81f50-c619-4106-86a2-2c3d0c96cee1",
    "waiting_room": false,
    "sip_id": "9926697184",
    "sip_password": "0148622352"
  },
  "invitees_truncated": false,
  "invitees": [],
  "is_time_independent": true,
  "is_adhoc": true,
  "type": "single",
  "invite_status": "accepted",
  "is_favorite": false,
  "created_by": {
    "display_name": "Ben Bucksch",
    "same-as": "me"
  },
  "created_at": "2023-12-12T12:54:52.173799Z",
  "updated_by": {
    "display_name": "Ben Bucksch",
    "same-as": "me"
  },
  "updated_at": "2023-12-12T12:54:52.173799Z",
  "can_edit": true
}

2. Get invitation URL (optional)

https://<controller-host>/v1/rooms/<room.id>/invites
e.g. https://controller.mustang.im/v1/rooms/1fe81f50-c619-4106-86a2-2c3d0c96cee1/invites
POST Request:
{}
Response:
{
  "invite_code": "95e00679-12b5-4e8a-9eaa-b0b3d2423798",
  "room_id": "1fe81f50-c619-4106-86a2-2c3d0c96cee1",
  "active": true,
  "expiration":null
}
becomes:
https://<web-frontend-host>/invite/<invite_code>
e.g. https://mustang.im/invite/95e00679-12b5-4e8a-9eaa-b0b3d2423798

## Join conference as guest using invite code

1. Invitation URL
https://<controller-host>/invite/<invite-code>
e.g. https://mustang.im/invite/8709c31e-ff01-43da-abfc-c09c817a1b5c
Received out-of-band (using other communication methods) from conference owner,
who did "Get invitation URL" (see above).

2. Get room ID
https://<controller-host>/v1/invite/verify
e.g. https://controller.mustang.im/v1/invite/verify
POST Request:
{
  "invite_code": "8709c31e-ff01-43da-abfc-c09c817a1b5c"
}
Response:
{
  "room_id": "671206b3-a445-4a81-9efe-bfa3e11356ba"
}

3. Start conference (for me)
https://<controller-host>/v1/rooms/<room.id>/start_invited
e.g. https://controller.mustang.im/v1/rooms/671206b3-a445-4a81-9efe-bfa3e11356ba/start_invited
POST Request:
{
  "breakout_room": null,
  "invite_code": "8709c31e-ff01-43da-abfc-c09c817a1b5c"
}
Response:
{
  "ticket": "tnjG1SCou7qCMMVwPTSdTDt2vOSirou8ULxchR8RrILILnsnhbDihoWTUpbkjFG7","resumption": "xHRDKwzCwTykATMQS2IEVndt6LAXsQE01z0lIAkjfScJ300aKXpI236vofdzjY6R"
}

## Start conference as owner

1. Who am I? (optional)
https://<controller-host>/v1/users/me
e.g. https://controller.mustang.im/v1/users/me
GET
Response:
{
  "id": "7190e1aa-767e-40d5-af15-9a9db507831a",
  "email": "ben.bucksch@...",
  "title": "",
  "firstname": "Ben",
  "lastname": "Bucksch",
  "display_name": "Ben Bucksch",
  "avatar_url": "https://seccdn.libravatar.org/avatar/...",
  "dashboard_theme": "system",
  "conference_theme": "system",
  "language": ""
}

2. Start conference
https://<controller-host>/v1/rooms/<room.id>/start
e.g. https://controller.mustang.im/v1/rooms/1fe81f50-c619-4106-86a2-2c3d0c96cee1/start
POST
{
  "breakout_room": null
}
Response:
{
  "ticket": "ItZHj8uhFVREG1Mh1si6asVWljTk0VKCMFHoy9rCXbJvSD10MWMJunqwJvDkqEe6",
  "resumption": "1fqj7PWdRsStHleIcf8XbhfbiPP7KKQj2duAIsV6KoJoopPqP2o3JYuYnFqtI9VW"
}

3. TURN
https://<controller-host>/v1/turn
e.g. https://controller.mustang.im/v1/turn
GET
Response:
empty

4. Get room
https://<controller-host>/v1/rooms/<room-id>
e.g. https://controller.mustang.im/v1/rooms/1fe81f50-c619-4106-86a2-2c3d0c96cee1
GET
Response:
{
  "id":"1fe81f50-c619-4106-86a2-2c3d0c96cee1",
  "created_by":{},
  "password": null,
  "waiting_room": false
}

5. Conference WebSocket
Starts after 2., before 3.
wss://<controller-host>/signaling
e.g. wss://controller.mustang.im/signaling
Header:
{
  Sec-WebSocket-Protocol: "ticket#<ticket-from-start>, k3k-signaling-json-v1.0"
}
WebSocket content:
See next section "Receive and send video"

## Receive and send video

On Conference WebSocket (see above):

1. Join
Send:
{
  "namespace": "control",
  "payload": {
    "action": "join",
    "display_name": "Ben Bucksch"
  }
}
Response:
{
  "namespace": "control",
  "timestamp": "2023-12-12T13:12:32.665873161Z",
  "payload": {
    "message": "join_success",
    "id": "35b94009-38db-453f-8e38-fb2635236e59",
    "display_name": "Ben Bucksch",
    "avatar_url": "https://seccdn.libravatar.org/avatar/...",
    "role": "moderator",
    "chat": {
      "enabled": true,
      "groups_history": [],
      "last_seen_timestamp_global": null,
      "last_seen_timestamps_group": {},
      "last_seen_timestamps_private": {},
      "room_history": []
    },
    "media": {
      "is_presenter": true
    },
    "moderation": {
      "raise_hands_enabled": true,
      "waiting_room_enabled": false,
      "waiting_room_participants": []
    },
    "recording": null,
    "participants": [
      {
        id: "...",
        media: {
          is_presenter: true,
          video: {
            audio: true,
            video: true
          }
        },
        control: {
          display_name: "Somebody else",
          avatar_url: "https://libavatar.org/...",
          role: "moderator",
          hand_is_up: false,
          left_at: "2024-02-07T00:41:37Z", // or null if participating
          participation_kind: "user"
        },
        chat: {
          groups: []
        },
      }
    ]
  }
}

2. Send video

Send:
{
  "namespace": "media",
  "payload": {
    "action": "publish",
    "media_session_type": "video",
    "target": "35b94009-38db-453f-8e38-fb2635236e59",
    "sdp": "v=0
o=mozilla...THIS_IS_SDPARTA-99.0 3716088884621913920 0 IN IP4 0.0.0.0
s=-
t=0 0
a=fingerprint:sha-256 AD:...:A1
a=group:BUNDLE 0 1
a=ice-options:trickle
a=msid-semantic:WMS *
m=audio 9 UDP/TLS/RTP/SAVPF 109 9 0 8 101
c=IN IP4 0.0.0.0
a=sendonly
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2/recvonly urn:ietf:params:rtp-hdrext:csrc-audio-level
a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid
a=fmtp:109 maxplaybackrate=48000;stereo=1;useinbandfec=1
a=fmtp:101 0-15
a=ice-pwd:cc70eb1ce669a3d8a480636a9cf5c4d2
a=ice-ufrag:e163e2b8
a=mid:0
a=msid:{95e4f527-fbfe-49dc-a5f6-359a77c79832} {cd286440-1bf6-4dfd-b1a7-b27c1d00f984}
a=rtcp-mux
a=rtpmap:109 opus/48000/2
a=rtpmap:9 G722/8000/1
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:101 telephone-event/8000/1
a=setup:actpass
a=ssrc:357877601 cname:{59f23370-43c1-49f2-b6ea-a9284a56677d}
m=video 9 UDP/TLS/RTP/SAVPF 120 124 121 125 126 127 97 98
c=IN IP4 0.0.0.0
a=sendonly
a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:4 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:5 urn:ietf:params:rtp-hdrext:toffset
a=extmap:6/recvonly http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=extmap:7 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:8/sendonly urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
a=extmap:9/sendonly urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
a=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1
a=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1
a=fmtp:120 max-fs=12288;max-fr=60
a=fmtp:124 apt=120
a=fmtp:121 max-fs=12288;max-fr=60
a=fmtp:125 apt=121
a=fmtp:127 apt=126
a=fmtp:98 apt=97
a=ice-pwd:cc70eb1ce669a3d8a480636a9cf5c4d2
a=ice-ufrag:e163e2b8
a=mid:1
a=msid:{95e4f527-fbfe-49dc-a5f6-359a77c79832} {0617bb13-9336-4f05-9495-8e94c4cff86e}
a=rid:high send
a=rid:medium send
a=rid:low send
a=rtcp-fb:120 nack
a=rtcp-fb:120 nack pli
a=rtcp-fb:120 ccm fir
a=rtcp-fb:120 goog-remb
a=rtcp-fb:120 transport-cc
a=rtcp-fb:121 nack
a=rtcp-fb:121 nack pli
a=rtcp-fb:121 ccm fir
a=rtcp-fb:121 goog-remb
a=rtcp-fb:121 transport-cc
a=rtcp-fb:126 nack
a=rtcp-fb:126 nack pli
a=rtcp-fb:126 ccm fir
a=rtcp-fb:126 goog-remb
a=rtcp-fb:126 transport-cc
a=rtcp-fb:97 nack
a=rtcp-fb:97 nack pli
a=rtcp-fb:97 ccm fir
a=rtcp-fb:97 goog-remb
a=rtcp-fb:97 transport-cc
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:120 VP8/90000
a=rtpmap:124 rtx/90000
a=rtpmap:121 VP9/90000
a=rtpmap:125 rtx/90000
a=rtpmap:126 H264/90000
a=rtpmap:127 rtx/90000
a=rtpmap:97 H264/90000
a=rtpmap:98 rtx/90000
a=setup:actpass
a=simulcast:send high;medium;low
a=ssrc:1971525940 cname:{59f23370-43c1-49f2-b6ea-a9284a56677d}
a=ssrc:4134942961 cname:{59f23370-43c1-49f2-b6ea-a9284a56677d}
a=ssrc:3676181775 cname:{59f23370-43c1-49f2-b6ea-a9284a56677d}
a=ssrc:2729935507 cname:{59f23370-43c1-49f2-b6ea-a9284a56677d}
a=ssrc:2073390829 cname:{59f23370-43c1-49f2-b6ea-a9284a56677d}
a=ssrc:3211939474 cname:{59f23370-43c1-49f2-b6ea-a9284a56677d}
a=ssrc-group:FID 1971525940 4134942961
a=ssrc-group:FID 3676181775 2729935507
a=ssrc-group:FID 2073390829 3211939474
"
  }
}
Request 2 (repeated many times):
{
  "namespace": "media",
  "payload": {
    "action": "sdp_candidate",
    "target": "35b94009-38db-453f-8e38-fb2635236e59",
    "media_session_type": "video",
    "candidate": {
      "sdpMid": "0",
      "sdpMLineIndex": 0,
      "candidate": "candidate:0 1 UDP 2122252543 <user-ip> <port> typ host"
    }
  }
}
Request 3:
{
  "namespace": "media",
  "payload": {
    "action": "sdp_end_of_candidates",
    "target": "35b94009-38db-453f-8e38-fb2635236e59",
    "media_session_type":"video"
  }
}
Response:
{
  "namespace": "media",
  "timestamp": "2023-12-12T13:12:32.991252790Z",
  "payload": {
    "message": "sdp_answer",
    "source": "35b94009-38db-453f-8e38-fb2635236e59",
    "media_session_type": "video",
    "sdp": "v=0
o=mozilla...THIS_IS_SDPARTA-99.0 1702386752999680 1 IN IP4 <server-ip>
s=VideoRoom 1346491345067577t=0 0
a=group:BUNDLE 0 1
a=extmap-allow-mixed
a=msid-semantic: WMS janus
a=ice-lite
m=audio 9 UDP/TLS/RTP/SAVPF 109
c=IN IP4 <server-ip>
a=recvonly
a=mid:0
a=rtcp-mux
a=ice-ufrag:u4nW
a=ice-pwd:fColI1dbiYa9lAGL238wjB
a=ice-options:trickle
a=fingerprint:sha-256 15:...:36
a=setup:active
a=rtpmap:109 opus/48000/2
a=fmtp:109 useinbandfec=1;stereo=1
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid
a=msid:janus janusa0
a=ssrc:1555850533 cname:janus
a=ssrc:1555850533 msid:janus janusa0
a=ssrc:1555850533 mslabel:janus
a=ssrc:1555850533 label:janusa0
a=candidate:1 1 udp 2015363583 <server-ip> 20007 typ host
a=candidate:2 1 udp 2015363327 <server-ipv6> 21450 typ host
a=end-of-candidates
m=video 9 UDP/TLS/RTP/SAVPF 120 124
c=IN IP4 <server-ip>
b=TIAS:1600000
a=recvonly
a=mid:1
a=rtcp-mux
a=ice-ufrag:u4nW
a=ice-pwd:fColI1dbiYa9lAGL238wjB
a=ice-options:trickle
a=fingerprint:sha-256 15:...:36
a=setup:active
a=rtpmap:120 VP8/90000
a=rtcp-fb:120 ccm fir
a=rtcp-fb:120 nack
a=rtcp-fb:120 nack pli
a=rtcp-fb:120 goog-remb
a=rtcp-fb:120 transport-cc
a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:6/sendonly http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=extmap:7 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:8/recvonly urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
a=extmap:9/recvonly urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
a=fmtp:120 max-fs=12288;max-fr=60
a=rtpmap:124 rtx/90000
a=fmtp:124 apt=120
a=msid:janus janusv0
a=ssrc:4229922707 cname:janus
a=ssrc:4229922707 msid:janus janusv0
a=ssrc:4229922707 mslabel:janus
a=ssrc:4229922707 label:janusv0
a=rid:high recv
a=rid:medium recv
a=rid:low recv
a=simulcast:recv high;medium;low
a=candidate:1 1 udp 2015363583 <server-ip> 20007 typ host
a=candidate:2 1 udp 2015363327 <server-ipv6> 21450 typ host
a=end-of-candidates
"
  }
}
Response 2:
{
  "namespace": "media",
  "timestamp": "2023-12-12T13:12:33.106041169Z",
  "payload": {
    "message": "webrtc_up",
    "source": "35b94009-38db-453f-8e38-fb2635236e59",
    "media_session_type": "video"
  }
}
Response 3:
{
  "namespace": "media",
  "timestamp": "2023-12-12T13:12:33.122989197Z",
  "payload": {
    "message": "media_status",
    "source": "35b94009-38db-453f-8e38-fb2635236e59",
    "media_session_type": "video",
    "kind": "audio",
    "receiving": true
  }
}
Reponse 4 and 5 - like 3, but with "kind": "video"

3. Success confirmation

Send
{
  "namespace": "media",
  "payload": {
    "action": "publish_complete",
    "media_session_type": "video",
    "media_session_state": {
      "audio": true,
      "video": true,
      "video_settings": 2
    }
  }
}
Receive
{
  "namespace": "media",
  "timestamp": "2023-12-12T13:12:33.195785877Z",
  "payload": {
    "message": "media_status",
    "source": "35b94009-38db-453f-8e38-fb2635236e59",
    "media_session_type": "video",
    "kind": "video",
    "receiving": true
  }
}

Receive
{
  "namespace": "media",
  "timestamp": "2023-12-12T13:41:40Z",
  "payload": {
    "message": "focus_update",
    "focus": "35b94009-38db-453f-8e38-fb2635236e59"
  }
}
or "focus": null

## Share my screen

Send:
{
  "namespace": "media",
  "payload": {
    "action": "publish",
    "media_session_type": "screen",
    "target": "<participant ID>",
    "sdp": "v=0o=mozilla...THIS_IS_SDPARTA-99.0 5844649763247960872 0 IN IP4 0.0.0.0
s=-
t=0 0
a=fingerprint:sha-256 EA:F2:E3:45:74:CB:CB:E7:A6:25:79:BB:04:4B:A1:A7:8A:EE:5E:90:00:31:04:1C:C2:63:00:AF:9C:E9:7F:A0
a=group:BUNDLE 0
a=ice-options:trickle
a=msid-semantic:WMS *
m=video 9 UDP/TLS/RTP/SAVPF 120 124 121 125 126 127 97 98
c=IN IP4 0.0.0.0
a=sendonly
a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:4 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:5 urn:ietf:params:rtp-hdrext:toffset
a=extmap:6/recvonly http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=extmap:7 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:8/sendonly urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
a=extmap:9/sendonly urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
a=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1
a=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1
a=fmtp:120 max-fs=12288;max-fr=60
a=fmtp:124 apt=120
a=fmtp:121 max-fs=12288;max-fr=60
a=fmtp:125 apt=121
a=fmtp:127 apt=126
a=fmtp:98 apt=97
a=ice-pwd:4090af78c2da63583d517d296db5c728
a=ice-ufrag:e1718ec8
a=mid:0
a=msid:{6cff529a-1155-4354-8f47-10b43ab70bd9} {9547d315-7924-4154-9e41-4dd992df13dd}
a=rid:high send
a=rid:medium send
a=rid:low send
a=rtcp-fb:120 nack
a=rtcp-fb:120 nack pli
a=rtcp-fb:120 ccm fir
a=rtcp-fb:120 goog-remb
a=rtcp-fb:120 transport-cc
a=rtcp-fb:121 nack
a=rtcp-fb:121 nack pli
a=rtcp-fb:121 ccm fir
a=rtcp-fb:121 goog-remb
a=rtcp-fb:121 transport-cc
a=rtcp-fb:126 nack
a=rtcp-fb:126 nack pli
a=rtcp-fb:126 ccm fir
a=rtcp-fb:126 goog-remb
a=rtcp-fb:126 transport-cc
a=rtcp-fb:97 nack
a=rtcp-fb:97 nack pli
a=rtcp-fb:97 ccm fir
a=rtcp-fb:97 goog-remb
a=rtcp-fb:97 transport-cc
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:120 VP8/90000
a=rtpmap:124 rtx/90000
a=rtpmap:121 VP9/90000
a=rtpmap:125 rtx/90000
a=rtpmap:126 H264/90000
a=rtpmap:127 rtx/90000
a=rtpmap:97 H264/90000
a=rtpmap:98 rtx/90000
a=setup:actpass
a=simulcast:send high;medium;low
a=ssrc:1834408214 cname:{b8ed5455-6e6a-4a53-8f1c-c38e4de6d830}
a=ssrc:3154509049 cname:{b8ed5455-6e6a-4a53-8f1c-c38e4de6d830}
a=ssrc:1351143671 cname:{b8ed5455-6e6a-4a53-8f1c-c38e4de6d830}
a=ssrc:3907003787 cname:{b8ed5455-6e6a-4a53-8f1c-c38e4de6d830}
a=ssrc:2748267265 cname:{b8ed5455-6e6a-4a53-8f1c-c38e4de6d830}
a=ssrc:2373546068 cname:{b8ed5455-6e6a-4a53-8f1c-c38e4de6d830}
a=ssrc-group:FID 1834408214 3154509049
a=ssrc-group:FID 1351143671 3907003787
a=ssrc-group:FID 2748267265 2373546068
"
  }
}
Send: ICE candidates
Received 1:
{
  "namespace": "media",
  "timestamp": "2024-01-10T13:11:18.737053384Z",
  "payload": {
    "message": "sdp_answer",
    "media_session_type": "screen",
    "source": "<participant ID>",
    "sdp": "v=0
o=mozilla...THIS_IS_SDPARTA-99.0 1704892278747730 1 IN IP4 <server-ipv4>
s=VideoRoom 6641754593197169
t=0 0
a=group:BUNDLE 0
a=extmap-allow-mixed
a=msid-semantic: WMS janus
a=ice-lite
m=video 9 UDP/TLS/RTP/SAVPF 120 124
c=IN IP4 <server-ipv4>
b=TIAS:8000000
a=recvonly
a=mid:0
a=rtcp-mux
a=ice-ufrag:nvy2
a=ice-pwd:laUSRget3/AmjfCpM3zcTF
a=ice-options:trickle
a=fingerprint:sha-256 44:70:B6:2C:76:FA:1F:C8:AF:D1:33:F4:A1:7A:B3:DB:58:A2:75:34:20:58:6A:AB:3A:AE:67:4C:74:86:91:6D
a=setup:active
a=rtpmap:120 VP8/90000
a=rtcp-fb:120 ccm fir
a=rtcp-fb:120 nack
a=rtcp-fb:120 nack pli
a=rtcp-fb:120 goog-remb
a=rtcp-fb:120 transport-cc
a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:6/sendonly http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=extmap:7 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:8/recvonly urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
a=extmap:9/recvonly urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
a=fmtp:120 max-fs=12288;max-fr=60
a=rtpmap:124 rtx/90000
a=fmtp:124 apt=120
a=msid:janus janusv0
a=ssrc:3281693362 cname:janus
a=ssrc:3281693362 msid:janus janusv0
a=ssrc:3281693362 mslabel:janus
a=ssrc:3281693362 label:janusv0
a=rid:high recv
a=rid:medium recv
a=rid:low recv
a=simulcast:recv high;medium;low
a=candidate:1 1 udp 2015363583 <server-ipv4> 21837 typ host
a=candidate:2 1 udp 2015363327 <server-ipv6> 23368 typ host
a=end-of-candidates
"
  }
}
Recieve 2:
{
  "namespace": "media",
  "timestamp": "2024-01-10T13:11:18.851358130Z",
  "payload": {
    "message": "webrtc_up",
    "source":"fabcf123-884b-4420-a96e-4e4a51f17f8e",
    "media_session_type": "screen"
  }
}
Receive 3:
{
  "namespace": "media",
  "timestamp": "2024-01-10T13:11:18.882869836Z",
  "payload": {
    "message": "media_status",
    "source": "fabcf123-884b-4420-a96e-4e4a51f17f8e",
    "media_session_type": "screen",
    "kind": "video",
    "receiving": true
  }
}
Send:
{
  "namespace": "media",
  "payload": {
    "action": "publish_complete",
    "media_session_type": "screen",
    "media_session_state": {
      "audio": false,
      "video": true,
      "video_settings": 2
    }
  }
}
Received:
{
  "namespace": "media",
  "timestamp": "2024-01-10T13:11:54.545949596Z",
  "payload": {
    "message": "media_status",
    "source": "fabcf123-884b-4420-a96e-4e4a51f17f8e",
    "media_session_type": "screen",
    "kind": "video",
    "receiving": false
  }
}

## Stop sharing my screen

Send:
{
  "namespace": "media",
  "payload": {
    "action": "unpublish",
    "media_session_type": "screen"
  }
}

## Open/close cam/mic

Send:
{
  "namespace": "media",
  "payload": {
    "action": "update_media_session",
    "media_session_type": "video",
    "media_session_state": {
      "audio": true,
      "video": true,
      "video_settings": 2
    }
  }
}

## Raise hand

Send:
{
  "namespace": "control",
  "payload": {
    "action": "raise_hand"
  }
}
or "lower_hand"

## New participant with video

On Conference WebSocket:
Received:
{
  "namespace": "control",
  "timestamp": "2023-12-12T13:46:41Z",
  "payload": {
    "message": "joined",
    "id": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "control": {
      "display_name": "Other user",
      "hand_is_up": false,
      "hand_updated_at": "2023-12-12T13:46:41Z",
      "joined_at": "2023-12-12T13:46:41Z",
      "left_at": null,
      "participation_kind": "guest",
      "role": "guest"
    },
    "media": {
      "is_presenter": true
    }
  }
}
Received 2:
{
  "namespace": "control",
  "timestamp": "2023-12-12T13:46:41Z",
  "payload": {
    "message": "update",
    "id": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "control": {
      "display_name": "Other user",
      "hand_is_up": false,
      "hand_updated_at": "2023-12-12T13:46:41Z",
      "joined_at": "2023-12-12T13:46:41Z",
      "left_at": null,
      "participation_kind": "guest",
      "role": "guest"
    },
    "media": {
      "is_presenter": true,
      "video": {
        "audio": true,
        "video": false
      }
    }
  }
}

Send:
{
  "namespace": "media",
  "payload": {
    "action": "subscribe",
    "target": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "media_session_type": "video"
  }
}
Received:
{
  "namespace": "media",
  "timestamp": "2023-12-12T13:46:43.303692385Z",
  "payload": {
    "message": "sdp_offer",
    "source": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "media_session_type": "video"
    "sdp": "v=0
o=- 1702388802075465 1 IN IP4 <server-ip>
s=VideoRoom 6773946862685037
t=0 0
a=group:BUNDLE a v
a=extmap-allow-mixed
a=msid-semantic: WMS janus
a=ice-lite
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 <server-ip>
a=sendonly
a=mid:a
a=rtcp-mux
a=ice-ufrag:s43P
a=ice-pwd:LFY1hKoZGFYxQ73zc/XaSx
a=ice-options:trickle
a=fingerprint:sha-256 15:...:36
a=setup:actpass
a=rtpmap:111 opus/48000/2
a=fmtp:111 useinbandfec=1;stereo=1
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 urn:ietf:params:rtp-hdrext:sdes:mid
a=rtcp-fb:111 transport-cc
a=msid:janus janusa0
a=ssrc:2759914810 cname:janus
a=ssrc:2759914810 msid:janus janusa0
a=ssrc:2759914810 mslabel:janus
a=ssrc:2759914810 label:janusa0
a=candidate:1 1 udp 2015363583 <server-ip> 22739 typ host
a=candidate:2 1 udp 2015363327 <server-ipv6> 24689 typ host
a=end-of-candidates
m=video 9 UDP/TLS/RTP/SAVPF 96 97
c=IN IP4 <server-ip>
a=sendonly
a=mid:v
a=rtcp-mux
a=ice-ufrag:s43P
a=ice-pwd:LFY1hKoZGFYxQ73zc/XaSx
a=ice-options:trickle
a=fingerprint:sha-256 15:...:36
a=setup:actpass
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=extmap:2 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=fmtp:96 max-fs=12288;max-fr=60
a=rtpmap:97 rtx/90000
a=fmtp:97 apt=96
a=ssrc-group:FID 868792023 3130596887
a=msid:janus janusv0
a=ssrc:868792023 cname:janus
a=ssrc:868792023 msid:janus janusv0
a=ssrc:868792023 mslabel:janus
a=ssrc:868792023 label:janusv0
a=ssrc:3130596887 cname:janus
a=ssrc:3130596887 msid:janus janusv0
a=ssrc:3130596887 mslabel:janus
a=ssrc:3130596887 label:janusv0
a=candidate:1 1 udp 2015363583 <server-ip> 22739 typ host
a=candidate:2 1 udp 2015363327 <server-ipv6> 24689 typ host
a=end-of-candidates
"
  }
}
Send:
{
  "namespace": "media",
  "payload": {
    "action": "sdp_answer",
    "target": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "media_session_type": "video",
    "sdp": "v=0
o=mozilla...THIS_IS_SDPARTA-99.0 3937553338159104265 0 IN IP4 0.0.0.0
s=-
t=0 0
a=fingerprint:sha-256 D3:...:BF
a=group:BUNDLE a v
a=ice-options:trickle
a=msid-semantic:WMS *
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=recvonly
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 urn:ietf:params:rtp-hdrext:sdes:mid
a=fmtp:111 maxplaybackrate=48000;stereo=1;useinbandfec=1
a=ice-pwd:2809881ad8cb836ea36e5f075a937900
a=ice-ufrag:cc110daf
a=mid:a
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=setup:active
a=ssrc:4084941442 cname:{b3fc4bc5-d08f-4322-8aa6-cd11ee978786}
m=video 9 UDP/TLS/RTP/SAVPF 96 97
c=IN IP4 0.0.0.0
a=recvonly
a=extmap:2 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:6/recvonly http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=fmtp:96 max-fs=12288;max-fr=60
a=fmtp:97 apt=96
a=ice-pwd:2809881ad8cb836ea36e5f075a937900
a=ice-ufrag:cc110daf
a=mid:v
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-mux
a=rtpmap:96 VP8/90000
a=rtpmap:97 rtx/90000
a=setup:active
a=ssrc:3511531742 cname:{b3fc4bc5-d08f-4322-8aa6-cd11ee978786}
"
  }
}
Send 2 (repeated multiple times):
{
  "namespace": "media",
  "payload": {
    "action": "sdp_candidate",
    "target": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "media_session_type": "video",
    "candidate": {
      "sdpMid": "a",
      "sdpMLineIndex": 0,
      "candidate": "candidate:0 1 UDP 2122252543 <user-id> <port> typ host"
    }
  }
}
Send 3:
{
  "namespace": "media",
  "payload": {
    "action": "sdp_end_of_candidates",
    "target": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "media_session_type": "video"
  }
}
Response:
{
  "namespace": "media",
  "timestamp": "2023-12-12T13:46:43.565228372Z",
  "payload": {
    "message": "webrtc_up",
    "source": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "media_session_type": "video"
  }
}
Send:
{
  "namespace": "media",
  "payload": {
    "action": "configure",
    "target": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "media_session_type": "video",
    "configuration": {
      "video": false
    }
  }
}

## Participant leaves

Received:
{
  "namespace": "media",
  "timestamp": "2023-12-12T13:55:46.780093774Z",
  "payload": {
    "message": "webrtc_down",
    "source":"34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "media_session_type": "video"
  }
}
Received 2:
{
  "namespace": "control",
  "timestamp": "2023-12-12T13:55:46Z",
  "payload": {
    "message": "update",
    "id": "34589bb4-25e3-45b3-afc6-2925d1beaf70",
    "control": {
      "display_name": "Other user",
      "hand_is_up": false,
      "hand_updated_at": "2023-12-12T13:46:41Z",
      "joined_at": "2023-12-12T13:46:41Z",
      "left_at": null,
      "participation_kind": "guest",
      "role": "guest"
    },
    "media": {
      "is_presenter": true
    }
  }
}
Received 3:
{
  "namespace": "control",
  "timestamp": "2023-12-12T13:55:46Z",
  "payload": {
    "message": "left",
    "id": "34589bb4-25e3-45b3-afc6-2925d1beaf70"
  }
}

## Participant shares screen

Receive:
{
  "namespace": "control",
  "timestamp":"2024-01-10T22:23:38Z",
  "payload": {
    "message": "update",
    "id": "9dbc692d-f745-4032-b1e8-1f4935f221c5",
    "control": {
      "avatar_url": "https://seccdn.libravatar.org/avatar/1a31769c00192ed0a23c3142d6deace0",
      "display_name": "Ben Bucksch",
      "hand_is_up": false,
      "hand_updated_at": "2024-01-10T22:22:03Z",
      "joined_at":"2024-01-10T22:22:03Z",
      "left_at":null,
      "participation_kind":"user",
      "role":"moderator"
    },
    "media": {
      "is_presenter": true,
      "screen": {
        "audio": false,
        "video": true
      }
    }
  }
}
Send:
{
  "namespace": "media",
  "payload": {
    "action": "subscribe",
    "target": "9dbc692d-f745-4032-b1e8-1f4935f221c5",
    "media_session_type": "screen"
  }
}
Receive:
{
  "namespace": "media",
  "timestamp": "2024-01-10T22:23:38.451862834Z",
  "payload": {
    "message": "sdp_offer",
    "source": "9dbc692d-f745-4032-b1e8-1f4935f221c5",
    "media_session_type": "screen",
    "sdp": "v=0
o=- 1704925418041281 1 IN IP4 168.119.249.127
s=VideoRoom 1946829638001542
t=0 0
a=group:BUNDLE v
a=extmap-allow-mixed
a=msid-semantic: WMS janus
a=ice-lite
m=video 9 UDP/TLS/RTP/SAVPF 96 97
c=IN IP4 168.119.249.127
a=sendonly
a=mid:v
a=rtcp-mux
a=ice-ufrag:eIuz
a=ice-pwd:8IjW3gS0yrOElNdPIfo5CJ
a=ice-options:trickle
a=fingerprint:sha-256 44:70:B6:2C:76:FA:1F:C8:AF:D1:33:F4:A1:7A:B3:DB:58:A2:75:34:20:58:6A:AB:3A:AE:67:4C:74:86:91:6D
a=setup:actpass
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=fmtp:96 max-fs=12288;max-fr=60
a=rtpmap:97 rtx/90000
a=fmtp:97 apt=96
a=ssrc-group:FID 658326470 3314428704
a=msid:janus janusv0
a=ssrc:658326470 cname:janus
a=ssrc:658326470 msid:janus janusv0
a=ssrc:658326470 mslabel:janus
a=ssrc:658326470 label:janusv0
a=ssrc:3314428704 cname:janus
a=ssrc:3314428704 msid:janus janusv0
a=ssrc:3314428704 mslabel:janus
a=ssrc:3314428704 label:janusv0
a=candidate:1 1 udp 2015363583 168.119.249.127 23016 typ host
a=candidate:2 1 udp 2015363327 2a01:4f8:c012:195f::1 24906 typ host
a=end-of-candidates
"
  }
}
Send:
{
  "namespace": "media",
  "payload": {
    "action": "sdp_answer",
    "target": "9dbc692d-f745-4032-b1e8-1f4935f221c5",
    "media_session_type": "screen",
    "sdp": "v=0
o=mozilla...THIS_IS_SDPARTA-99.0 978254878022545875 0 IN IP4 0.0.0.0
s=-
t=0 0
a=fingerprint:sha-256 E7:F8:33:D0:16:F6:C1:57:17:0A:94:A1:C8:65:38:57:C4:8F:AE:0B:72:6F:2B:AB:E3:42:6E:04:63:74:58:86
a=group:BUNDLE v
a=ice-options:trickle
a=msid-semantic:WMS *
m=video 9 UDP/TLS/RTP/SAVPF 96 97
c=IN IP4 0.0.0.0
a=recvonly
a=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:6/recvonly http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=fmtp:96 max-fs=12288;max-fr=60
a=fmtp:97 apt=96
a=ice-pwd:b357f8fc7684cc346a1c5069f356dacb
a=ice-ufrag:bcb1c6c4
a=mid:v
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-mux
a=rtpmap:96 VP8/90000
a=rtpmap:97 rtx/90000
a=setup:active
a=ssrc:435758065 cname:{fecb954e-7b7f-456c-bc56-fff295f3773f}
"
  }
}
Send: ICE candidates
Receive:
{
  "namespace": "media",
  "timestamp": "2024-01-10T22:23:38.586408226Z",
  "payload": {
    "message": "webrtc_up",
    "source": "9dbc692d-f745-4032-b1e8-1f4935f221c5",
    "media_session_type": "screen"
  }
}

## Leave conference

Send:
{
  "namespace": "media",
  "payload": {
    "action": "unpublish",
    "media_session_type": "video"
  }
}
