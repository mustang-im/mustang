# Teams WebSocket Protocol - Join URL

When loading the Microsoft Teams website and joining a meeting via a URL, four Websockets were created.

### Sockets 1 & 4: `wss://pub-ent-sece-11-t.trouter.teams.microsoft.com/socket.io/1/websocket/668b433c2da0dbdf-4c57f7f5500ac0ab`

Query string parameters:
- `sr`=`fzM_P6_9OkKhaTfnkJKf1g`
- `issuer`=
- `sp`=`pub-ent-sece-11`
- `se`=`1763719623073`
- `st`=`1763151024073`
- `sig`=`D5B7847DB8D9090F38E0AF07541977ADAAC777FE35B6C7A636F8D31F7BB672E5`
- `v`=`v4`
- `tc`=%7B%22cv%22:%222025.43.01.1%22,%22ua%22:%22SkypeSpaces%22,%22hr%22:%22%22,%22v%22:%221415/1.0.0.0%22%7D
  ```json
  {
    "cv": "2025.43.01.1",
    "ua": "SkypeSpaces",
    "hr": "",
    "v": "1415/1.0.0.0"
  }
  ```
- `timeout`=`40`
- `auth`=`true`
- `epid`=`71ef682f-d36c-4935-807c-da1c360c3d56`
- `ccid`=`haTfnkJKf1g`
- `dom`=`teams.microsoft.com`
- `cor_id`=`2faf8b42-e740-4eb8-87fd-90cfa3fef0ae`
- `con_num`=`1763151323246_1`

The following messages occurred in that session:
- receive: `1::`
- receive: `5:1::`
  ```json
  {
    "name": "trouter.connected",
    "args": [
      {
        "ttl": 568298,
        "dur": "1"
      }
    ]
  }
  ```
- receive: `5:2::`
  ```json
  {
    "name": "trouter.message_loss",
    "args": [
      {
        "droppedIndicators": [
          {
            "tag": "",
            "etag": "2025-11-14T20:15:24.4104953Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-14T20:15:24.4105370Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-14T20:15:24.4105456Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-14T20:15:24.4105517Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-14T20:15:24.4105566Z"
          }
        ]
      }
    ]
  }
  ```
- send: `5:1+::`
  ```json
  {
    "name": "trouter.processed_message_loss",
    "args": [
      {
        "droppedIndicators": [
          {
            "tag": "",
            "etag": "2025-11-14T20:15:24.4104953Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-14T20:15:24.4105370Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-14T20:15:24.4105456Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-14T20:15:24.4105517Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-14T20:15:24.4105566Z"
          }
        ]
      }
    ]
  }
  ```
- receive: `5:3::`
  ```json
  {
    "name": "trouter.message_loss",
    "args": [
      {
        "droppedIndicators": [
          {
            "tag": "",
            "etag": "2025-11-14T20:15:24.4104953Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-14T20:15:24.4105370Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-14T20:15:24.4105456Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-14T20:15:24.4105517Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-14T20:15:24.4105566Z"
          }
        ]
      }
    ]
  }
  ```
- send: `5:2+::`
  ```json
  {
    "name": "trouter.processed_message_loss",
    "args": [
      {
        "droppedIndicators": [
          {
            "tag": "",
            "etag": "2025-11-14T20:15:24.4104953Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-14T20:15:24.4105370Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-14T20:15:24.4105456Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-14T20:15:24.4105517Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-14T20:15:24.4105566Z"
          }
        ]
      }
    ]
  }
  ```
- receive: `6:::1+`
  ```json
  []
  ```
- receive: `6:::2+`
  ```json
  []
  ```
- receive: `3:::`
  ```json
  {
    "id": 1844165944,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/017386fe/conversation/conversationUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9902.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "99999999-9999-9999-9999-999999999999",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "ee6523ad-99c2-445d-ab6d-3b8bd24aafdb",
      "X-Microsoft-Skype-Message-ID": "2a98e603-f71c-4720-971b-d50e97a1b4c2",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-24b91d380d271ad9dac8249492b5acdd-25ecaa4b8528813c-00",
      "MS-CV": "odYhn/gLdkigKo7cSRo4iA.1",
      "trouter-request": "{\"id\":\"b491298e-e87e-4010-849e-337af7b1c099\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "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"
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "roster": null,
      "conversationController": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687",
      "sequenceNumber": 3,
      "subject": "",
      "activeModalities": null,
      "state": {
        "isMultiParty": true,
        "groupCallInitiator": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
        "isHostless": true,
        "conversationType": "scheduledMeeting",
        "isBroadcast": false,
        "isMeetingActivated": true
      },
      "links": {
        "leave": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/leave?i=10-128-165-183&e=638984925660033687",
        "notificationLinks": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/notificationLinks?i=10-128-165-183&e=638984925660033687",
        "updateEndpointMetadata": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointMetadata?i=10-128-165-183&e=638984925660033687",
        "updateEndpointState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointState?i=10-128-165-183&e=638984925660033687",
        "publishState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/publishState?i=10-128-165-183&e=638984925660033687"
      },
      "meetingDetails": {
        "capabilities": null,
        "pstnDetails": null,
        "invitation": null,
        "meetingCapability": {
          "showContentSharePreviewInManagedMode": null,
          "producerOption": null,
          "detectSensitiveContentDuringScreenSharing": null,
          "enableMultiLingualMeeting": null,
          "autoTranscriptionOnlyEnabled": null,
          "allowedUsersForMeetingDetails": "UsersAllowedToByPassTheLobby",
          "productionStudioMode": null,
          "enableProductionStudio": null,
          "raiseHands": null,
          "disableLobby": false,
          "allowBackroomChat": null,
          "verifyExternalPresentersJoin": null,
          "autoAdmittedUsers": null,
          "legalUrl": null,
          "allowIPVideo": false,
          "allowAnonymousUsersToDialOut": false,
          "allowAnonymousUsersToStartMeeting": false,
          "allowedAutoAdmittedUsers": null,
          "allowRegisteredUsersToBypassLobby": null,
          "enableAppDesktopSharing": null,
          "pstnConferencingDialOutType": null,
          "allowCloudRecording": false,
          "allowLocalRecording": false,
          "allowTranscription": false,
          "allowPowerPointSharing": false,
          "allowSharedNotes": false,
          "allowWhiteboard": false,
          "allowBreakoutRooms": false,
          "allowDocumentCollaboration": null,
          "allowPstnConferencing": false,
          "allowRaiseHands": false,
          "enableRealtimeTelemetry": false,
          "entryExitAnnouncementsEnabled": false,
          "allowPstnUsersToBypassLobby": false,
          "lockMeeting": false,
          "allowTeamsMeetingReactions": false,
          "yammerQNAEnabled": false,
          "breakoutRoomsEnabled": false,
          "overflowModeActive": false,
          "streamingModeActive": false,
          "attendeeViewModes": null,
          "rtmpEnabled": false,
          "stagingRoomEnabled": false,
          "meetingScenario": null,
          "cartCapability": null,
          "waterMarkCapability": null,
          "meetingLiveState": null,
          "mdpClientAudioRecordingEligible": false,
          "interpretationEnabled": false,
          "aiInterpretationEnabled": null,
          "aiInterpretationEnabledForAllParticipants": null,
          "byodEnabled": null,
          "sensitivityLabelId": null,
          "meetingEndToEndEncryptionEnabled": false,
          "maskIdentitiesForRole": false,
          "forceAttendeeStreaming": false,
          "disableMeetingBranding": true,
          "isCopyRestrictionEnforced": false,
          "enableParticipantRenaming": null,
          "allowSharingChatHistory": null,
          "allowTranslatedCaptions": false,
          "allowTranslatedTranscriptions": false,
          "isPresenterCapabilitiesReduced": false,
          "liveChatEnabled": false,
          "isModeratorEnabled": false,
          "enableBackroomChat": null,
          "copilotMode": null,
          "automaticallyStartCopilot": null,
          "groupCopilotDetails": null,
          "meetingSpokenLanguage": null,
          "disableAnonymousJoin": false,
          "anonymousUserAuthenticationMethod": "none",
          "externalPresenterJoinVerification": "eotp",
          "whoCanAccessTranscriptAndRecording": null,
          "whoCanManageQna": null,
          "transcriptAndRecordingUsers": null,
          "usersCanAdmitFromLobby": null,
          "preventScreenCapture": false,
          "visualInsightsEnabled": false,
          "townhallMaxResolution": null,
          "highBitrateForTownhall": null,
          "enforceConsentToJoin": "Disabled",
          "enforceConsentToJoinContent": null
        },
        "exchangeId": null,
        "iCalUid": null,
        "startTime": "0001-01-01T00:00:00",
        "endTime": "0001-01-01T00:00:00",
        "expiryTime": "0001-01-01T00:00:00",
        "isInGracePeriod": false,
        "isPresenterConnected": false,
        "isMeetingActiveWithinScheduleTime": true,
        "brandingInfo": {
          "enableLobbyLogoBranding": false,
          "lobbyLogoBrandingImages": null,
          "enableLobbyBackgroundBranding": false,
          "lobbyBackgroundBrandingImages": null,
          "enableNdiAssuranceSlate": false,
          "ndiAssuranceSlateImages": null,
          "enableMeetingBackgroundImages": false,
          "meetingBackgroundImages": null,
          "meetingBrandingThemes": null,
          "defaultTheme": null
        },
        "templateDetails": null,
        "eventDetails": null,
        "vivaEventDetails": null,
        "featureTypes": null,
        "meetingOptionsErrorState": "none",
        "recordingConsentDetails": {
          "explicitRecordingConsentEnabled": false,
          "consentActivelyRequired": false
        },
        "organizerRegion": null,
        "interpreters": null,
        "organizerCloud": null,
        "anyWaterMarkLegacyUserEverInMeeting": false,
        "disableReactions": false
      },
      "meetingInfo": {
        "organizerId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
        "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
      },
      "meetingData": {
        "meetingCode": "39563371502184",
        "passcode": "5gb7bf7j"
      },
      "streamingSetupFailureDebugInfo": null,
      "layoutDetails": null,
      "compositionServiceDetails": null,
      "originalGroupCallInitiator": null,
      "creatorClientVersion": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1844165944,
    "status": 200,
    "headers": {
      "MS-CV": "odYhn/gLdkigKo7cSRo4iA.1.0",
      "trouter-request": "{\"id\":\"b491298e-e87e-4010-849e-337af7b1c099\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "trouter-client": "{\"cd\":7}"
    },
    "body": ""
  }
  ```
- send: `5:3+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::3+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 1844166024,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/017386fe/conversation/conversationUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9902.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "99999999-9999-9999-9999-999999999999",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12297",
      "X-Microsoft-Skype-Original-Message-ID": "5d5a2d7a-3f66-4ca5-a450-a46ec66d650a",
      "X-Microsoft-Skype-Message-ID": "06988a47-ceca-421f-941d-f7e382247c12",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-24b91d380d271ad9dac8249492b5acdd-489d3f8db6ea7efa-00",
      "MS-CV": "P60+RjmuXECQlQRE3/3Hqg.1",
      "trouter-request": "{\"id\":\"7d51e57b-0c42-496a-8675-035ae35efb1d\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "Trouter-TimeoutMs": "12797"
    },
    "body": "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"
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "roster": null,
      "conversationController": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687",
      "sequenceNumber": 4,
      "subject": "",
      "activeModalities": null,
      "state": {
        "isMultiParty": true,
        "groupCallInitiator": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
        "isHostless": true,
        "conversationType": "scheduledMeeting",
        "isBroadcast": false,
        "isMeetingActivated": true
      },
      "links": {
        "leave": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/leave?i=10-128-165-183&e=638984925660033687",
        "notificationLinks": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/notificationLinks?i=10-128-165-183&e=638984925660033687",
        "updateEndpointMetadata": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointMetadata?i=10-128-165-183&e=638984925660033687",
        "updateEndpointState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointState?i=10-128-165-183&e=638984925660033687",
        "publishState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/publishState?i=10-128-165-183&e=638984925660033687"
      },
      "meetingDetails": {
        "capabilities": null,
        "pstnDetails": null,
        "invitation": null,
        "meetingCapability": {
          "showContentSharePreviewInManagedMode": null,
          "producerOption": null,
          "detectSensitiveContentDuringScreenSharing": null,
          "enableMultiLingualMeeting": null,
          "autoTranscriptionOnlyEnabled": null,
          "allowedUsersForMeetingDetails": "UsersAllowedToByPassTheLobby",
          "productionStudioMode": null,
          "enableProductionStudio": null,
          "raiseHands": null,
          "disableLobby": false,
          "allowBackroomChat": null,
          "verifyExternalPresentersJoin": null,
          "autoAdmittedUsers": null,
          "legalUrl": null,
          "allowIPVideo": false,
          "allowAnonymousUsersToDialOut": false,
          "allowAnonymousUsersToStartMeeting": false,
          "allowedAutoAdmittedUsers": null,
          "allowRegisteredUsersToBypassLobby": null,
          "enableAppDesktopSharing": null,
          "pstnConferencingDialOutType": null,
          "allowCloudRecording": false,
          "allowLocalRecording": false,
          "allowTranscription": false,
          "allowPowerPointSharing": false,
          "allowSharedNotes": false,
          "allowWhiteboard": false,
          "allowBreakoutRooms": false,
          "allowDocumentCollaboration": null,
          "allowPstnConferencing": false,
          "allowRaiseHands": false,
          "enableRealtimeTelemetry": false,
          "entryExitAnnouncementsEnabled": false,
          "allowPstnUsersToBypassLobby": false,
          "lockMeeting": false,
          "allowTeamsMeetingReactions": false,
          "yammerQNAEnabled": false,
          "breakoutRoomsEnabled": false,
          "overflowModeActive": false,
          "streamingModeActive": false,
          "attendeeViewModes": null,
          "rtmpEnabled": false,
          "stagingRoomEnabled": false,
          "meetingScenario": null,
          "cartCapability": null,
          "waterMarkCapability": null,
          "meetingLiveState": null,
          "mdpClientAudioRecordingEligible": false,
          "interpretationEnabled": false,
          "aiInterpretationEnabled": null,
          "aiInterpretationEnabledForAllParticipants": null,
          "byodEnabled": null,
          "sensitivityLabelId": null,
          "meetingEndToEndEncryptionEnabled": false,
          "maskIdentitiesForRole": false,
          "forceAttendeeStreaming": false,
          "disableMeetingBranding": true,
          "isCopyRestrictionEnforced": false,
          "enableParticipantRenaming": null,
          "allowSharingChatHistory": null,
          "allowTranslatedCaptions": false,
          "allowTranslatedTranscriptions": false,
          "isPresenterCapabilitiesReduced": false,
          "liveChatEnabled": false,
          "isModeratorEnabled": false,
          "enableBackroomChat": null,
          "copilotMode": null,
          "automaticallyStartCopilot": null,
          "groupCopilotDetails": null,
          "meetingSpokenLanguage": null,
          "disableAnonymousJoin": false,
          "anonymousUserAuthenticationMethod": "none",
          "externalPresenterJoinVerification": "eotp",
          "whoCanAccessTranscriptAndRecording": null,
          "whoCanManageQna": null,
          "transcriptAndRecordingUsers": null,
          "usersCanAdmitFromLobby": null,
          "preventScreenCapture": false,
          "visualInsightsEnabled": false,
          "townhallMaxResolution": null,
          "highBitrateForTownhall": null,
          "enforceConsentToJoin": "Disabled",
          "enforceConsentToJoinContent": null
        },
        "exchangeId": null,
        "iCalUid": null,
        "startTime": "0001-01-01T00:00:00",
        "endTime": "0001-01-01T00:00:00",
        "expiryTime": "0001-01-01T00:00:00",
        "isInGracePeriod": false,
        "isPresenterConnected": false,
        "isMeetingActiveWithinScheduleTime": true,
        "brandingInfo": {
          "enableLobbyLogoBranding": false,
          "lobbyLogoBrandingImages": null,
          "enableLobbyBackgroundBranding": false,
          "lobbyBackgroundBrandingImages": null,
          "enableNdiAssuranceSlate": false,
          "ndiAssuranceSlateImages": null,
          "enableMeetingBackgroundImages": false,
          "meetingBackgroundImages": null,
          "meetingBrandingThemes": null,
          "defaultTheme": null
        },
        "templateDetails": null,
        "eventDetails": null,
        "vivaEventDetails": null,
        "featureTypes": null,
        "meetingOptionsErrorState": "none",
        "recordingConsentDetails": {
          "explicitRecordingConsentEnabled": false,
          "consentActivelyRequired": false
        },
        "organizerRegion": null,
        "interpreters": null,
        "organizerCloud": null,
        "anyWaterMarkLegacyUserEverInMeeting": false,
        "disableReactions": false
      },
      "meetingInfo": {
        "organizerId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
        "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
      },
      "meetingData": {
        "meetingCode": "39563371502184",
        "passcode": "5gb7bf7j"
      },
      "streamingSetupFailureDebugInfo": null,
      "layoutDetails": null,
      "compositionServiceDetails": null,
      "originalGroupCallInitiator": null,
      "creatorClientVersion": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1844166024,
    "status": 200,
    "headers": {
      "MS-CV": "P60+RjmuXECQlQRE3/3Hqg.1.0",
      "trouter-request": "{\"id\":\"7d51e57b-0c42-496a-8675-035ae35efb1d\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "trouter-client": "{\"cd\":2}"
    },
    "body": ""
  }
  ```
- send: `5:4+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::4+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": -2042713650,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fe6cbb30/call/acceptance/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "CallController/2.47.4557.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "99999999-9999-9999-9999-999999999999",
      "Trouter-Timeout": "12299",
      "X-Microsoft-Skype-Original-Message-ID": "3177cac9-da63-4384-ac3f-38d47ace41c7",
      "X-Microsoft-Skype-Message-ID": "451f4ee7-32ac-43ab-a234-bc8a369474cf",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-870cd2abd02b35f9609816ab73886d62-ea4b77eccba21277-00",
      "MS-CV": "p5fxQBBDqEu/DcBcPphTgg.1",
      "trouter-request": "{\"id\":\"df15bf52-9a0e-4abd-bf64-821cae81df22\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "Trouter-TimeoutMs": "12799"
    },
    "body": "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"
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "callAcceptance": {
        "acceptedCallModalities": [],
        "links": {
          "acknowledgement": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/callAcceptance/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/a3/697/acknowledge?i=10-128-210-112",
          "callLeg": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/a3/697?i=10-128-210-112&e=638985327425314572",
          "callControllerHttpTransport": "http://52.123.137.159/enc",
          "mediaRenegotiation": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/a3/697/renegotiate?i=10-128-210-112&e=638985327425314572",
          "transfer": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/a3/697/transfer?i=10-128-210-112&e=638985327425314572",
          "replacement": "https://cc-euwe-01-prod-aks.cc.skype.com:443/cc/v1/active/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/a3/697/replacement?i=10-128-210-112&e=638985327425314572",
          "startOutgoingNegotiation": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/a3/697/startOutgoingNegotiation?i=10-128-210-112&e=638985327425314572",
          "hold": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/a3/697/hold?i=10-128-210-112&e=638985327425314572",
          "monitor": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/a3/697/monitor?i=10-128-210-112&e=638985327425314572",
          "controlVideoStreaming": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/k27/525/controlVideoStreaming?i=10-128-210-112&e=638985327425314572",
          "applyChannelParameters": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/k27/525/applyChannelParameters?i=10-128-210-112&e=638985327425314572"
        },
        "mediaContent": {
          "contentType": "application/sdp-ngc-1.0",
          "blob": "v=0\r\no=- 347914 0 IN IP4 127.0.0.1\r\ns=session\r\nc=IN IP4 52.112.143.212\r\nb=CT:10000000\r\nt=0 0\r\na=group:BUNDLE 0 1 2 3 4 5 6 7 8 9 10 11 12\r\na=x-plaza-msi-range:1-100 101-200\r\na=x-mediabw:main-video send=8100;recv=8100\r\na=x-mediabw:applicationsharing-video send=8100;recv=8100\r\nm=audio 3480 RTP/SAVP 120 111 97 9 0 8 13 101\r\nc=IN IP4 52.112.143.212\r\na=x-signaling-fb:* x-message app send:dsh\r\na=x-source-streamid:201\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=candidate:1 1 UDP 54001663 52.112.143.212 3480 typ relay raddr 10.0.22.127 rport 3480 MTURNID 12802342406253994546\r\na=candidate:3 1 tcp-pass 18087935 52.112.143.212 3478 typ relay raddr 10.0.22.127 rport 3478\r\na=candidate:4 1 UDP 54001663 2603:1063:118:2::170 3480 typ relay raddr fd00:db8:deca:1::6bd rport 3480 MTURNID 12802705918396220728\r\na=candidate:5 1 tcp-pass 18087935 2603:1063:118:2::170 3478 typ relay raddr fd00:db8:deca:1::6bd rport 3478\r\na=label:main-audio\r\na=mid:0\r\na=rtpmap:120 CN/48000\r\na=rtpmap:111 OPUS/48000/2\r\na=rtpmap:97 RED/8000\r\na=rtpmap:9 G722/8000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:101 telephone-event/8000\r\na=fmtp:101 0-16\r\na=ptime:20\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=x-ssrc-range:1000-1000\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1001 1051\r\na=x-source-streamid:202\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:1\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1001-1100\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1101 1151\r\na=x-source-streamid:203\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:2\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1101-1200\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1201 1251\r\na=x-source-streamid:204\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:3\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1201-1300\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1301 1351\r\na=x-source-streamid:205\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:4\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1301-1400\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1401 1451\r\na=x-source-streamid:206\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:5\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1401-1500\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1501 1551\r\na=x-source-streamid:207\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:6\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1501-1600\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1601 1651\r\na=x-source-streamid:208\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:7\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1601-1700\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1701 1751\r\na=x-source-streamid:209\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:8\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1701-1800\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1801 1851\r\na=x-source-streamid:210\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:9\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1801-1900\r\nm=video 3480 RTP/SAVP 107 99\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 1901 1951\r\na=x-source-streamid:211\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:10\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:1901-2000\r\nm=video 3480 RTP/SAVP 107 116 99 112\r\nc=IN IP4 52.112.143.212\r\nb=AS:2400\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2001 2051\r\na=x-source-streamid:212\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:applicationsharing-video\r\na=mid:11\r\na=sendonly\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 profile-level-id=42C01E;packetization-mode=1;max-mbps=108000;max-fs=3600;max-br=2000;max-fps=3000\r\na=rtpmap:116 AV1/90000\r\na=fmtp:116 profile=0;level-idx=4;tier=0\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtpmap:112 rtx/90000\r\na=fmtp:112 apt=116;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:9 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2001-2100\r\nm=x-data 3480 RTP/SAVP 127 126\r\nc=IN IP4 52.112.143.212\r\na=ssrc-group:FID 2101 2151\r\na=x-source-streamid:213\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:eGjs\r\na=ice-pwd:NQuKh1STRCP6yCIkWnMof4MZ\r\na=rtcp-mux\r\na=label:data\r\na=mid:12\r\na=rtpmap:127 x-data/90000\r\na=rtpmap:126 rtx/90000\r\na=fmtp:126 apt=127;rtx-time=3000\r\na=fingerprint:sha-256 1C:85:A1:BB:8F:2E:3B:DD:B1:1D:03:46:87:A2:51:B0:A8:E0:E6:C2:C1:AC:11:1B:38:37:58:AA:EC:2D:68:0C\r\na=x-ssrc-range:2101-2200\r\na=x-data-protocol:sctp\r\n",
          "mediaLegId": "1227147444F448C4B7C754AF8D086AF8",
          "escalationOccurring": false,
          "newOffer": false,
          "fromMixer": true,
          "callLabel": "lobby",
          "skipIceReinvite": true
        },
        "callKeepAliveInterval": 2700,
        "controllerName": "lobby"
      },
      "debugContent": {
        "MPInstanceServiceUri": "https://a-swce-55.mp.skype.com:10064/mediaprocessor/v1",
        "MPInstanceId": "a-swce-55.mp.skype.com.MpRole_IN_67",
        "MPPublicIpTagUsed": "Business",
        "ProcessingCallControllerInstance": "https://cc-euwe-01-prod-aks.cc.skype.com/"
      }
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2042713650,
    "status": 200,
    "headers": {
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Message-ID": "451f4ee7-32ac-43ab-a234-bc8a369474cf",
      "MS-CV": "p5fxQBBDqEu/DcBcPphTgg.1.0",
      "trouter-request": "{\"id\":\"df15bf52-9a0e-4abd-bf64-821cae81df22\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "trouter-client": "{\"cd\":7}"
    },
    "body": "{\n  \"callAcceptanceAcknowledgement\": {\n    \"links\": {\n      \"mediaRenegotiation\": \"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fcb56228/call/mediaRenegotiation/\",\n      \"transfer\": \"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/51640056/call/transfer/\",\n      \"replacement\": \"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/2ea40210/call/replacement/\",\n      \"balanceUpdate\": \"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/c6ce708d/call/balanceUpdate/\",\n      \"retargetCompletion\": \"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/93c039a1/call/retargetCompletion/\",\n      \"controlVideoStreaming\": \"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/cb446060/call/controlVideoStreaming/\",\n      \"updateMediaDescriptions\": \"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/78bbd91e/call/updateMediaDescriptions\"\n    }\n  }\n}"
  }
  ```
  - `body`:
    ```json
    {
      "callAcceptanceAcknowledgement": {
        "links": {
          "mediaRenegotiation": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fcb56228/call/mediaRenegotiation/",
          "transfer": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/51640056/call/transfer/",
          "replacement": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/2ea40210/call/replacement/",
          "balanceUpdate": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/c6ce708d/call/balanceUpdate/",
          "retargetCompletion": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/93c039a1/call/retargetCompletion/",
          "controlVideoStreaming": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/cb446060/call/controlVideoStreaming/",
          "updateMediaDescriptions": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/78bbd91e/call/updateMediaDescriptions"
        }
      }
    }
    ```
- send: `5:5+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::5+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 1844175199,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/63acc6bd/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9902.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "99999999-9999-9999-9999-999999999999",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "6931dea4-119c-44da-a30c-bf4231a161bc",
      "X-Microsoft-Skype-Message-ID": "cdda0c27-9eab-4155-ba24-8bb5c77f8217",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-7fd60b40e2ffdcd13fcb966662b8bb35-9d0f5231b3340550-00",
      "MS-CV": "6IUxS5S0ekGAv0VcHgNqNg.1",
      "trouter-request": "{\"id\":\"52cc8770-c475-44f7-b2d0-587bc949f0e2\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "H4sIAAAAAAAAA9VWTY/jNgy9768IfF5nJNux4wxyaLNFMUVnWswEPXSxB1miE2Fky7XkpMFi/nspTz7srL3TBQoUm0MAk48U9UiR/PxuMvEqVlvJZcVKa7zF5DPKUDpfWGCF2Ukjra4XSTwLSBpDmsU0omGcxjnNIeDJLObzZJaeDdF0B7WRukQRfX+SGcssoMRj3ModeGcFEztWchD3AFaWm0etWlhVg4HSQn1BCrBMKtM5CYVSOPS3Bvv+4kBIUyl2eGBFe+4DSDV5ZGab1Vo/jwCfdFPzFt6Uz6Xel11cVesKanv4kW0QUTZKdZR4q9b2Tnyp6+RhfaheySp1eSh0Y7oHQCkqLUvb+vDI8ecP/J1+3vApQ0EoVm4athkMcCuFAJfWnCkDR/nLOT+nuK4yxHieRmQ281OggR/NGfMzllI/IXlEISQEItKzcFHoLDtcCVFcgJDsydYu16j92NNOrtCthT0R2QipOzR07puBcoiCydIfhXWyFhA6ABCyBqzstuo9rFyBn7tBT1Dj+7hvLDhntm5gAFRqe1d+gJw1yj7qxj2Mn2vdVCfuh/w22bFqPn660r5cw79C1E4K+BdEjcJ6RAX/HVFj1/7/mGJVpSRn7ipmy2o8eJyVM3nfYtSlkr5JpaNRl+rwPVIpmGVfpW0M0KMo/O6qrffd1fbIOzfWFatYJpW0Elz7i5MeiiuJA/OnYWwQJ4SSHv56EHhEzDlN55GfRYL5UZDE2LI59QMyD4M5hFGcx97AkX+cx7339IxXfaoYB3ODk3d2E8woJSGJI0JvtFnuZSn03txOtEGr5cN6QsmU3E4E7CQHx9OS66LCLNS3E5zAe0zLkm9rXcD52xmi7ymZtqbwN05bDIODm8xLJQu4WZsVUwqTcwxtia1oNo3CKaHT8Oa3XbZMaE44D8OA5knKck6SmKcBxLM8ABKneQYCbfLAG0zEPW4ibUnihOqnqjc+Ee/3RnfHxS/4t5avO4eLzqfUp9E6IAsaLzDMKJhHSOCffetCC4Y5PTjrtlC9X9tJORLleaP6clp2FqyO/FKDp9q8jPf6uJltGjD2spUVb+5txVgcA+DX/Uk0/BLXp86CkWt87ivsnWi11o6F3jbigm4DPneWD6COnQNf+F9NWyZNkaH343LafQYr3fRWYKstU7/3t+PjG3KhbwFXWjGibzeYEd2r39Pdu5raxWgcWz9Yi1qs3UFc66GFCIA3HAzBNPa6XOn9Sdfe/Nr/nTsV7/l2jCNI025qCFy1faJVuQy9e/kH3Iwf8ngMAAA="
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "participants": {
        "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759": {
          "version": 1,
          "state": "active",
          "advancedMeetingRole": "presenter",
          "details": {
            "id": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
            "displayName": "Neil Rashbrook",
            "displayNameSource": "unknown",
            "propertyBag": null,
            "resourceId": null,
            "participantType": "anonymous",
            "endpointId": "00000000-0000-0000-0000-000000000000",
            "participantId": null,
            "languageId": null,
            "hidden": false
          },
          "endpoints": {
            "acf94055-9e12-48aa-ba91-70f41e300e40": {
              "lobby": {
                "mediaStreams": [
                  {
                    "type": "audio",
                    "label": "main-audio",
                    "sourceId": 201,
                    "direction": "sendrecv",
                    "serverMuted": true,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "video",
                    "label": "main-video",
                    "sourceId": 202,
                    "direction": "sendrecv",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "applicationsharing-video",
                    "label": "applicationsharing-video",
                    "sourceId": 212,
                    "direction": "recvonly",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "data",
                    "label": "data",
                    "sourceId": 213,
                    "direction": "sendrecv",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  }
                ]
              },
              "endpointCapabilities": 67,
              "clientEndpointCapabilities": 267010,
              "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
              "clientVersion": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
              "endpointMetadata": {},
              "languageId": "en-us",
              "endpointJoinTime": "2025-11-14T20:16:01.4284415Z",
              "modalityJoined": "Lobby",
              "endpointMeetingRoles": [
                "presenter"
              ]
            }
          },
          "role": "guest",
          "meetingRole": "presenter",
          "meetingRoles": [
            "presenter",
            "producer"
          ],
          "enforceConsentToJoin": false
        }
      },
      "type": "Delta",
      "sequenceNumber": 1,
      "participantCounts": {
        "totalParticipants": 0,
        "preheatedParticipants": 0,
        "lobbyParticipants": 0,
        "totalPresenters": 0,
        "requestingAttentionPresenters": 0,
        "totalAttendees": 0,
        "requestingAttentionAttendees": 0,
        "overflowAttendeeCount": 0,
        "totalInterpreters": 0,
        "requestingAttentionInterpreters": 0,
        "streamingClients": 0
      }
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1844175199,
    "status": 200,
    "headers": {
      "MS-CV": "6IUxS5S0ekGAv0VcHgNqNg.1.0",
      "trouter-request": "{\"id\":\"52cc8770-c475-44f7-b2d0-587bc949f0e2\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "trouter-client": "{\"cd\":2}"
    },
    "body": ""
  }
  ```
- send: `5:6+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::6+`
  ```json
  [
    "pong"
  ]
  ```
- send: `5:7+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::7+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 1844186112,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fe0cc137/conversation/conversationUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9902.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12297",
      "X-Microsoft-Skype-Original-Message-ID": "5b05c696-c598-4693-9552-f426422ee1e8",
      "X-Microsoft-Skype-Message-ID": "0d40cca3-6601-417a-a274-1c55788ce27b",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-023bba1aad920d1f379bcb34cfe2b126-3e03cc7a6ff4f058-00",
      "MS-CV": "h3z31guTWUa32w15peuJbQ.1",
      "trouter-request": "{\"id\":\"c1185fcd-a6df-46c0-9396-bfa9898df882\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "Trouter-TimeoutMs": "12797"
    },
    "body": "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"
  }
  ```
  - `body` (gzipped)
    ```json
    {
      "roster": null,
      "conversationController": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687",
      "sequenceNumber": 6,
      "subject": "",
      "activeModalities": null,
      "state": {
        "isMultiParty": true,
        "groupCallInitiator": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
        "isHostless": true,
        "conversationType": "scheduledMeeting",
        "isBroadcast": false,
        "isMeetingActivated": true
      },
      "links": {
        "leave": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/leave?i=10-128-165-183&e=638984925660033687",
        "notificationLinks": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/notificationLinks?i=10-128-165-183&e=638984925660033687",
        "updateEndpointMetadata": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointMetadata?i=10-128-165-183&e=638984925660033687",
        "updateEndpointState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointState?i=10-128-165-183&e=638984925660033687",
        "publishState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/publishState?i=10-128-165-183&e=638984925660033687"
      },
      "meetingDetails": {
        "capabilities": null,
        "pstnDetails": null,
        "invitation": null,
        "meetingCapability": {
          "showContentSharePreviewInManagedMode": null,
          "producerOption": null,
          "detectSensitiveContentDuringScreenSharing": null,
          "enableMultiLingualMeeting": null,
          "autoTranscriptionOnlyEnabled": null,
          "allowedUsersForMeetingDetails": "UsersAllowedToByPassTheLobby",
          "productionStudioMode": null,
          "enableProductionStudio": null,
          "raiseHands": null,
          "disableLobby": false,
          "allowBackroomChat": null,
          "verifyExternalPresentersJoin": null,
          "autoAdmittedUsers": null,
          "legalUrl": null,
          "allowIPVideo": false,
          "allowAnonymousUsersToDialOut": false,
          "allowAnonymousUsersToStartMeeting": false,
          "allowedAutoAdmittedUsers": null,
          "allowRegisteredUsersToBypassLobby": null,
          "enableAppDesktopSharing": null,
          "pstnConferencingDialOutType": null,
          "allowCloudRecording": false,
          "allowLocalRecording": false,
          "allowTranscription": false,
          "allowPowerPointSharing": false,
          "allowSharedNotes": false,
          "allowWhiteboard": false,
          "allowBreakoutRooms": false,
          "allowDocumentCollaboration": null,
          "allowPstnConferencing": false,
          "allowRaiseHands": false,
          "enableRealtimeTelemetry": false,
          "entryExitAnnouncementsEnabled": false,
          "allowPstnUsersToBypassLobby": false,
          "lockMeeting": false,
          "allowTeamsMeetingReactions": false,
          "yammerQNAEnabled": false,
          "breakoutRoomsEnabled": false,
          "overflowModeActive": false,
          "streamingModeActive": false,
          "attendeeViewModes": null,
          "rtmpEnabled": false,
          "stagingRoomEnabled": false,
          "meetingScenario": null,
          "cartCapability": null,
          "waterMarkCapability": null,
          "meetingLiveState": null,
          "mdpClientAudioRecordingEligible": false,
          "interpretationEnabled": false,
          "aiInterpretationEnabled": null,
          "aiInterpretationEnabledForAllParticipants": null,
          "byodEnabled": null,
          "sensitivityLabelId": null,
          "meetingEndToEndEncryptionEnabled": false,
          "maskIdentitiesForRole": false,
          "forceAttendeeStreaming": false,
          "disableMeetingBranding": true,
          "isCopyRestrictionEnforced": false,
          "enableParticipantRenaming": null,
          "allowSharingChatHistory": null,
          "allowTranslatedCaptions": false,
          "allowTranslatedTranscriptions": false,
          "isPresenterCapabilitiesReduced": false,
          "liveChatEnabled": false,
          "isModeratorEnabled": false,
          "enableBackroomChat": null,
          "copilotMode": null,
          "automaticallyStartCopilot": null,
          "groupCopilotDetails": null,
          "meetingSpokenLanguage": null,
          "disableAnonymousJoin": false,
          "anonymousUserAuthenticationMethod": "none",
          "externalPresenterJoinVerification": "eotp",
          "whoCanAccessTranscriptAndRecording": null,
          "whoCanManageQna": null,
          "transcriptAndRecordingUsers": null,
          "usersCanAdmitFromLobby": null,
          "preventScreenCapture": false,
          "visualInsightsEnabled": false,
          "townhallMaxResolution": null,
          "highBitrateForTownhall": null,
          "enforceConsentToJoin": "Disabled",
          "enforceConsentToJoinContent": null
        },
        "exchangeId": null,
        "iCalUid": null,
        "startTime": "0001-01-01T00:00:00",
        "endTime": "0001-01-01T00:00:00",
        "expiryTime": "0001-01-01T00:00:00",
        "isInGracePeriod": false,
        "isPresenterConnected": false,
        "isMeetingActiveWithinScheduleTime": true,
        "brandingInfo": {
          "enableLobbyLogoBranding": false,
          "lobbyLogoBrandingImages": null,
          "enableLobbyBackgroundBranding": false,
          "lobbyBackgroundBrandingImages": null,
          "enableNdiAssuranceSlate": false,
          "ndiAssuranceSlateImages": null,
          "enableMeetingBackgroundImages": false,
          "meetingBackgroundImages": null,
          "meetingBrandingThemes": null,
          "defaultTheme": null
        },
        "templateDetails": null,
        "eventDetails": null,
        "vivaEventDetails": null,
        "featureTypes": null,
        "meetingOptionsErrorState": "none",
        "recordingConsentDetails": {
          "explicitRecordingConsentEnabled": false,
          "consentActivelyRequired": false
        },
        "organizerRegion": null,
        "interpreters": null,
        "organizerCloud": null,
        "anyWaterMarkLegacyUserEverInMeeting": false,
        "disableReactions": false
      },
      "meetingInfo": {
        "organizerId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
        "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
      },
      "meetingData": {
        "meetingCode": "39563371502184",
        "passcode": "5gb7bf7j"
      },
      "streamingSetupFailureDebugInfo": null,
      "layoutDetails": null,
      "compositionServiceDetails": null,
      "originalGroupCallInitiator": null,
      "creatorClientVersion": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1844186112,
    "status": 200,
    "headers": {
      "MS-CV": "h3z31guTWUa32w15peuJbQ.1.0",
      "trouter-request": "{\"id\":\"c1185fcd-a6df-46c0-9396-bfa9898df882\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "trouter-client": "{\"cd\":7}"
    },
    "body": ""
  }
  ```
- send: `5:8+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::8+`
  ```json
  [
    "pong"
  ]
  ```
- send: `5:9+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::9+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 1844186989,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fe0cc137/conversation/conversationUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9902.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "2e7b06fa-f088-4e19-9825-dc576174c9f4",
      "X-Microsoft-Skype-Message-ID": "16c1cace-bfe0-4210-a317-467cd441a81b",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-343d6cb9109291fafce9b7917f5e067f-cfc1cdc00f676c29-00",
      "MS-CV": "TdnFqRw6DUibqLir05tsiA.1",
      "trouter-request": "{\"id\":\"ba4484fa-94e0-4436-8987-c4cef000e86d\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "H4sIAAAAAAAAA8xYS28bORK+z68IdNhTZOst2cBgIctOooWdOJKSDOayYLOrJUZssodky+4N8t+3yKZa6pcnwR6ygGFAzY/FqmI9vuK331696iipDajO9SuRcv7afqFSHEBpYpgUCymMkpw7RGdnTKKvLy9Jwi4izrY7kyj5nF0YILG+iBlFYTIyF1TGFnN5GFxCcmnldSF9gm5v0MUNYZfs9YX9eqH3WQIObn9eBpuvH2XyvDCf3q7/nJrbTfbv7R8f/8l+7/e6/cGs25+Mu/3Z8B/w+2Q4u5qNrgbjyaTXGw4ns2nH6a7hrxQEhfdpHDidJ/nnNPgK1Fgbchyhhh3gQYaEM8NAn9uvDTGAH77hD/zJ9EPKDXskymT41agUXucrWyXTZEE4XwoUQox0TppdO3ccmGb45Xo6GQ96VxO4Cib9UX84uZpE/QgGdDqe0Nl0fNV5fTzmHd4EB63Lh5zfxga9ZY/QdAdhyiF8ADBMbE8ybpQkISXamhoRrqFY8dC5NRztC/0puPzdWc2Z2OuT1RzIAX7dnV+683/i5lFlIQ2LGHWeuvfW/Cr1a7r8nClpEuId3YkwkUyYBzAEf5NfaE+zQv+LUWufZf8fFjltfs6cJA0407tfbce5Gj9oQJHzcV4TbvE6GT9LfkoSErBaZbRGayNO8LMFJg7MuHAvf/dHLI4Ss+IUW2l38sl2GMAL2BEFjwoODJ6W4oEIssXyJkMoibMaoI9SCupDUjsMV0MwWOfXILD4YoH3wm9ThTqsqQIQ9iBbMisbQZCAg6v0mK/blPBjba0ASWrkRhGhqWJOhQ+CZ3dud1jDci6fIPyksYC/keqh6u6OW5nnqI28yR6J1psd3MsgyDoVk+1Za5OGTDa5Jdf/sYKsohRhGt4REeqa45i2AvKTS73jaMcNoXslZbzYEVPdjR2KRdndMzIJQTheo0avo2n/wtxqcuA8jJkx3jNVAIct4Z8Ub/Tm8vEzC0E2qzgXUmSxTLWTu5G3jPAPqfkxMGaQMqdLb9gB4fzvdHe4FWyZJVUeYy82wYs9+rbh3uZJcgt6b2TSEp427zCYIxQqqI2h3DJPCOoqLLhMwxVQqcJWc+4lJfxvMKVIb4Y8omPUoyuihe4NMJfg4XtpXElpAHzZMQOBJCpsiT8FZC9Ts8IYbBFxK2kaY+QtkLGSQKp6PSqUrvizWd7qPF3K6/m9rYBgwYhhAxxiMKqeOqiNwsRgZi6ETJGZWv30qV40ORR1awycMpZLun8xXDe28XgEKurKQt2QjMQxqI/v5206Bed+bwNJrAARnmlLk6OYUINog4Ji1OUFDMHEEiHAZ+wCFlbLL2XipE0H5O1bayrq2Qbx3WhN8fpUvTxSrAClTlVafcIOqx6I2rdDvPx7tO3IC8rrYbLgDCNgbqtzkXt3SBcYKlzTl9kqmijIO2tr1LBlC64c+M0wbEzYgex4wyhLCEZndWOQybBFpvadFn1xTwLgyxrCuwSJ1kbivztBVZa8ZE1M9H4Zoo8c/UDtVrLBM5FUFOY+XNbH0KrBfFvzWXCD1czXutOE5aajhUyyFWCIMprr5uTXlfNt9uSsFX6Jm2jCseZZ8oMd8x12BKlqAXMqstwOZRhZzVlawZXKch3NdNGCF2dUbgWWOdWN4pYpoY5tN4LDI+aisgNuGyT3y0sUgcqEcWmauItlBDGGJLYjnrk2vMjBVWA+cOdrTSz0LMMTuQdxTyyT29YO9FFRMABPUyouP+cH2Ph3NiTziQ7nn520TsCZU8CJqEGVAFnBny038hvtFpAmOW152skFEXNKcfA/3epclJp3uQy5HTlD/ihIddk0CmkkK6n9aE+3jOaNknEjQ8F6cbAE3bFnG6CpqqfjgWmkzEssBjj3tHYJI5/EDi/5gTxjskmeNvXnHYq4YWiGAUz+jd9S500uQ7GHW09vpL/Czm1+tWHnRaSfC7xQh/zuBxZ4pjsMG6hUsg5bIClllY/aBusGCYA9utfr9bvub9PrXbu/46yIVepHUM8JU9kPAJleireKUHjE2JIVP5eyXwqB81Dx2tP4GgRfmNkxsfaPSv78M3jgy+YSPXk+vuVJ74LmXm7lWXWtMpUKYhlj7NbC8UycLSQ22UX4stA67iXR70M21zpFJIU1z9tzWaioIl4Sd2wqhQ4FuJF0NOCaKtfREBwD4zoohIjgjOoWm6LXQJxYvRtndJfHjSsHdiB3rasREJv0dtiorHid81lc3yklVfEeclYaO+pYh3wWVl8c8uDn2FPNqgJtqyU0X84jmGPz/itl6oQreUWqLRHsP6DsZFZ9oSg4VrVCnra5aaq8RkT25cgH73FgpZktsehDtRSNrPzYdM6ZeOkB1vuylGQnFVw56ox7pD8lV8PuFIbD7mgU9bsBgag7iwbD0Wg8jYZQvE9hgUN+ku8bDmchTGHWDfo90h2RKe0SCEbdEQ2j6WAS0Vl/Vn8Wyp8cv5UfcvL+3RlejSfD4bQ/7g36s1HxJobTCvWI8TaYBtH060luMQGswaTJG4wAjKpbCNKj0cUTPCcZThz1YMRbjxNpGacUa1AHRhsiHZ2GdBrb8Num9/mTKFQGP+V8HJu0PkXGb9//CwAA//8DACcYlW8bGQAA"
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "roster": null,
      "conversationController": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687",
      "sequenceNumber": 6,
      "subject": "",
      "activeModalities": null,
      "state": {
        "isMultiParty": true,
        "groupCallInitiator": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
        "isHostless": true,
        "conversationType": "scheduledMeeting",
        "isBroadcast": false,
        "isMeetingActivated": true
      },
      "links": {
        "leave": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/leave?i=10-128-165-183&e=638984925660033687",
        "notificationLinks": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/notificationLinks?i=10-128-165-183&e=638984925660033687",
        "updateEndpointMetadata": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointMetadata?i=10-128-165-183&e=638984925660033687",
        "updateEndpointState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointState?i=10-128-165-183&e=638984925660033687",
        "publishState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/publishState?i=10-128-165-183&e=638984925660033687"
      },
      "meetingDetails": {
        "capabilities": null,
        "pstnDetails": null,
        "invitation": null,
        "meetingCapability": {
          "showContentSharePreviewInManagedMode": null,
          "producerOption": null,
          "detectSensitiveContentDuringScreenSharing": null,
          "enableMultiLingualMeeting": null,
          "autoTranscriptionOnlyEnabled": null,
          "allowedUsersForMeetingDetails": "UsersAllowedToByPassTheLobby",
          "productionStudioMode": null,
          "enableProductionStudio": null,
          "raiseHands": null,
          "disableLobby": false,
          "allowBackroomChat": null,
          "verifyExternalPresentersJoin": null,
          "autoAdmittedUsers": null,
          "legalUrl": null,
          "allowIPVideo": false,
          "allowAnonymousUsersToDialOut": false,
          "allowAnonymousUsersToStartMeeting": false,
          "allowedAutoAdmittedUsers": null,
          "allowRegisteredUsersToBypassLobby": null,
          "enableAppDesktopSharing": null,
          "pstnConferencingDialOutType": null,
          "allowCloudRecording": false,
          "allowLocalRecording": false,
          "allowTranscription": false,
          "allowPowerPointSharing": false,
          "allowSharedNotes": false,
          "allowWhiteboard": false,
          "allowBreakoutRooms": false,
          "allowDocumentCollaboration": null,
          "allowPstnConferencing": false,
          "allowRaiseHands": false,
          "enableRealtimeTelemetry": false,
          "entryExitAnnouncementsEnabled": false,
          "allowPstnUsersToBypassLobby": false,
          "lockMeeting": false,
          "allowTeamsMeetingReactions": false,
          "yammerQNAEnabled": false,
          "breakoutRoomsEnabled": false,
          "overflowModeActive": false,
          "streamingModeActive": false,
          "attendeeViewModes": null,
          "rtmpEnabled": false,
          "stagingRoomEnabled": false,
          "meetingScenario": null,
          "cartCapability": null,
          "waterMarkCapability": null,
          "meetingLiveState": null,
          "mdpClientAudioRecordingEligible": false,
          "interpretationEnabled": false,
          "aiInterpretationEnabled": null,
          "aiInterpretationEnabledForAllParticipants": null,
          "byodEnabled": null,
          "sensitivityLabelId": null,
          "meetingEndToEndEncryptionEnabled": false,
          "maskIdentitiesForRole": false,
          "forceAttendeeStreaming": false,
          "disableMeetingBranding": true,
          "isCopyRestrictionEnforced": false,
          "enableParticipantRenaming": null,
          "allowSharingChatHistory": null,
          "allowTranslatedCaptions": false,
          "allowTranslatedTranscriptions": false,
          "isPresenterCapabilitiesReduced": false,
          "liveChatEnabled": false,
          "isModeratorEnabled": false,
          "enableBackroomChat": null,
          "copilotMode": null,
          "automaticallyStartCopilot": null,
          "groupCopilotDetails": null,
          "meetingSpokenLanguage": null,
          "disableAnonymousJoin": false,
          "anonymousUserAuthenticationMethod": "none",
          "externalPresenterJoinVerification": "eotp",
          "whoCanAccessTranscriptAndRecording": null,
          "whoCanManageQna": null,
          "transcriptAndRecordingUsers": null,
          "usersCanAdmitFromLobby": null,
          "preventScreenCapture": false,
          "visualInsightsEnabled": false,
          "townhallMaxResolution": null,
          "highBitrateForTownhall": null,
          "enforceConsentToJoin": "Disabled",
          "enforceConsentToJoinContent": null
        },
        "exchangeId": null,
        "iCalUid": null,
        "startTime": "0001-01-01T00:00:00",
        "endTime": "0001-01-01T00:00:00",
        "expiryTime": "0001-01-01T00:00:00",
        "isInGracePeriod": false,
        "isPresenterConnected": true,
        "isMeetingActiveWithinScheduleTime": true,
        "brandingInfo": {
          "enableLobbyLogoBranding": false,
          "lobbyLogoBrandingImages": null,
          "enableLobbyBackgroundBranding": false,
          "lobbyBackgroundBrandingImages": null,
          "enableNdiAssuranceSlate": false,
          "ndiAssuranceSlateImages": null,
          "enableMeetingBackgroundImages": false,
          "meetingBackgroundImages": null,
          "meetingBrandingThemes": null,
          "defaultTheme": null
        },
        "templateDetails": null,
        "eventDetails": null,
        "vivaEventDetails": null,
        "featureTypes": null,
        "meetingOptionsErrorState": "none",
        "recordingConsentDetails": {
          "explicitRecordingConsentEnabled": false,
          "consentActivelyRequired": false
        },
        "organizerRegion": null,
        "interpreters": null,
        "organizerCloud": null,
        "anyWaterMarkLegacyUserEverInMeeting": false,
        "disableReactions": true
      },
      "meetingInfo": {
        "organizerId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
        "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
      },
      "meetingData": {
        "meetingCode": "39563371502184",
        "passcode": "5gb7bf7j"
      },
      "streamingSetupFailureDebugInfo": null,
      "layoutDetails": null,
      "compositionServiceDetails": null,
      "originalGroupCallInitiator": null,
      "creatorClientVersion": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1844186989,
    "status": 200,
    "headers": {
      "MS-CV": "TdnFqRw6DUibqLir05tsiA.1.0",
      "trouter-request": "{\"id\":\"ba4484fa-94e0-4436-8987-c4cef000e86d\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "trouter-client": "{\"cd\":2}"
    },
    "body": ""
  }
  ```
- send: `5:10+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::10+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 1844188037,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fe0cc137/conversation/conversationUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9902.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "a58b245e-875e-4252-88c1-8d32776b1807",
      "X-Microsoft-Skype-Message-ID": "8c0f4f1a-a9e6-487e-a32b-2a14a862f24c",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-0e2d387a440e5a645db33859ad1f1513-cbac6ba768cd854c-00",
      "MS-CV": "emx91VaNc0y3/LiJuR+bjw.1",
      "trouter-request": "{\"id\":\"f17c4e92-80bb-4284-82fb-1401edcf5b8d\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "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"
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "conversationController": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687",
      "sequenceNumber": 8,
      "subject": "",
      "activeModalities": {
        "call": null,
        "groupChat": {
          "threadId": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
          "messageId": "0"
        },
        "lobby": null,
        "realTimeActivityFeed": {
          "links": {
            "getArtifacts": "https://conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/getArtifacts?region=de",
            "postArtifacts": "https://conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/postArtifacts?region=de",
            "postArtifactsV2": "https://conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/postArtifactsV2?region=de",
            "postArtifactsEntriesV2": "https://conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/postArtifactsEntriesV2?region=de",
            "updateArtifact": "https://conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/updateArtifact?region=de",
            "updateArtifactEntry": "https://conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/updateArtifactEntry?region=de",
            "speakerEdit": "https://conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/speakerEdit?region=de"
          }
        }
      },
      "state": {
        "isMultiParty": true,
        "groupCallInitiator": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
        "isHostless": true,
        "conversationType": "scheduledMeeting",
        "isBroadcast": false,
        "isMeetingActivated": true
      },
      "links": {
        "leave": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/leave?i=10-128-165-183&e=638984925660033687",
        "addParticipant": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/addParticipant?i=10-128-165-183&e=638984925660033687",
        "removeParticipant": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/removeParticipant?i=10-128-165-183&e=638984925660033687",
        "addModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/addModality?i=10-128-165-183&e=638984925660033687",
        "addParticipantAndModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/add?i=10-128-165-183&e=638984925660033687",
        "removeModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/removeModality?i=10-128-165-183&e=638984925660033687",
        "mute": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/mute?i=10-128-165-183&e=638984925660033687",
        "unmute": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/unmute?i=10-128-165-183&e=638984925660033687",
        "notificationLinks": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/notificationLinks?i=10-128-165-183&e=638984925660033687",
        "merge": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/merge?i=10-128-165-183&e=638984925660033687",
        "updateEndpointMetadata": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointMetadata?i=10-128-165-183&e=638984925660033687",
        "updateEndpointState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateEndpointState?i=10-128-165-183&e=638984925660033687",
        "admit": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/admit?i=10-128-165-183&e=638984925660033687",
        "conversationHttpTransport": "http://52.123.144.240/enc",
        "updateParticipantRole": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateParticipantRole?i=10-128-165-183&e=638984925660033687",
        "setMeetingLayout": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/setMeetingLayout?i=10-128-165-183&e=638984925660033687",
        "updateParticipantProperties": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateParticipantProperties?i=10-128-165-183&e=638984925660033687",
        "publishState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/publishState?i=10-128-165-183&e=638984925660033687",
        "removeState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/removeState?i=10-128-165-183&e=638984925660033687",
        "updateMeetingSettings": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateMeetingSettings?i=10-128-165-183&e=638984925660033687",
        "searchParticipants": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/searchParticipants?i=10-128-165-183&e=638984925660033687",
        "getAllParticipants": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/getAllParticipants?i=10-128-165-183&e=638984925660033687",
        "admitAll": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/admitAll?i=10-128-165-183&e=638984925660033687",
        "updateParticipantMapping": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateParticipantMapping?i=10-128-165-183&e=638984925660033687",
        "sendMessage": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/sendMessage?i=10-128-165-183&e=638984925660033687",
        "updateMeetingStates": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/updateMeetingStates?i=10-128-165-183&e=638984925660033687"
      },
      "meetingDetails": {
        "capabilities": {
          "allowAnonymousUsersToDialOut": false,
          "admissionType": "open",
          "allowAnonymousUsersToStartMeeting": false,
          "admitAnonymousUsersByDefault": false,
          "appDesktopSharingType": "desktop",
          "allowVideo": true,
          "allowDialinConferencing": false,
          "allowCloudRecording": true,
          "pstnConferencingDialoutType": "internationalAndDomestic"
        },
        "pstnDetails": null,
        "realTimeActivityFeedDetails": {
          "links": {
            "getArtifacts": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/getArtifacts?region=de",
            "postArtifacts": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/postArtifacts?region=de",
            "postArtifactsV2": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/postArtifactsV2?region=de",
            "postArtifactsEntriesV2": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/postArtifactsEntriesV2?region=de",
            "updateArtifact": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/updateArtifact?region=de",
            "updateArtifactEntry": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/updateArtifactEntry?region=de",
            "speakerEdit": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/rtaf/storage/conversations/a2d0386d-429c-41b5-9267-bb434f2fe05d/speakerEdit?region=de"
          }
        },
        "invitation": "%3cdiv+style%3d%22max-width%3a+1024px%3b+color%3a+%23242424%3b+font-family%3a%27Segoe+UI%27%2c%27Helvetica+Neue%27%2cHelvetica%2cArial%2csans-serif%22+class%3d%22me-email-text%22+lang%3d%22en-US%22%3e%0a++%3cdiv+style%3d%22margin-bottom%3a24px%3boverflow%3ahidden%3bwhite-space%3anowrap%3b%22+aria-hidden%3d%22true%22%3e________________________________________________________________________________%3c%2fdiv%3e%0a%0a++%3cdiv+style%3d%22margin-bottom%3a+12px%3b%22%3e%0a++++%3cspan+class%3d%22me-email-text%22+style%3d%22font-size%3a+24px%3bfont-weight%3a+700%3b+margin-right%3a12px%3b%22%3eMicrosoft+Teams%3c%2fspan%3e%0a++++%3ca+id%3d%22meet_invite_block.action.help%22+class%3d%22me-email-link%22+style%3d%22font-size%3a14px%3b+text-decoration%3aunderline%3b+color%3a+%235B5FC7%3b%22+href%3d%22https%3a%2f%2faka.ms%2fJoinTeamsMeeting%3fomkt%3den-US%22%3eNeed+help%3f%3c%2fa%3e%0a++%3c%2fdiv%3e%0a%0a++%3cdiv+style%3d%22margin-bottom%3a+6px%3b%22%3e%0a++++%3ca+id%3d%22meet_invite_block.action.join_link%22+title%3d%22Meeting+join+link%22+class%3d%22me-email-headline%22+style%3d%22font-size%3a+20px%3b+font-weight%3a600%3b+text-decoration%3a+underline%3b+color%3a+%235B5FC7%3b%22+href%3d%22https%3a%2f%2fteams.microsoft.com%2fl%2fmeetup-join%2f19%253ameeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl%2540thread.v2%2f0%3fcontext%3d%257b%2522Tid%2522%253a%2522338de7e8-b10a-4a7c-aeb4-4cdf726fc818%2522%252c%2522Oid%2522%253a%252250a17a93-7e33-44f1-baef-8f234457f3e7%2522%257d%22+target%3d%22_blank%22+rel%3d%22noreferrer+noopener%22%3eJoin+the+meeting+now%3c%2fa%3e%0a++%3c%2fdiv%3e%0a%0a++%3cdiv+style%3d%22margin-bottom%3a+6px%3b%22%3e%0a++++%3cspan+class%3d%22me-email-text-secondary%22+style%3d%22font-size%3a+14px%3b+color%3a+%23616161%3b%22%3eMeeting+ID%3a+%3c%2fspan%3e%0a++++%3cspan+class%3d%22me-email-text%22+style%3d%22font-size%3a+14px%3b+color%3a+%23242424%3b%22%3e395+633+715+021+84%3c%2fspan%3e%0a++%3c%2fdiv%3e%0a%0a++%3cdiv+style%3d%22margin-bottom%3a+32px%3b%22%3e%0a++++%3cspan+class%3d%22me-email-text-secondary%22+style%3d%22font-size%3a+14px%3b+color%3a+%23616161%3b%22%3ePasscode%3a+%3c%2fspan%3e%0a++++%3cspan+class%3d%22me-email-text%22+style%3d%22font-size%3a+14px%3b+color%3a+%23242424%3b%22%3e5gb7bf7j%3c%2fspan%3e%0a++%3c%2fdiv%3e%0a%0a++%3cdiv+style%3d%22margin-bottom%3a+12px%3b+max-width%3a+1024px%3b%22%3e%0a++++%3chr+style%3d%22border%3a+0%3b+background%3a+%23616161%3b+height%3a+1px%3b%22%3e%3c%2fhr%3e%0a++%3c%2fdiv%3e%0a%0a%0a%0a%0a%0a%0a%0a++%3cdiv+style%3d%22margin-top%3a+24px%3b+margin-bottom%3a+6px%3b%22%3e%0a++++%0a++++%0a++%3c%2fdiv%3e%0a%0a++%3cdiv+style%3d%22margin-bottom%3a+24px%3b%22%3e%0a++++%0a++%3c%2fdiv%3e%0a%0a++%3cdiv+style%3d%22margin-bottom%3a24px%3boverflow%3ahidden%3bwhite-space%3anowrap%3b%22+aria-hidden%3d%22true%22%3e________________________________________________________________________________%3c%2fdiv%3e%0a%0a%3c%2fdiv%3e",
        "meetingCapability": {
          "showContentSharePreviewInManagedMode": false,
          "producerOption": "OrganizersAndPresentersOnly",
          "detectSensitiveContentDuringScreenSharing": false,
          "enableMultiLingualMeeting": false,
          "autoTranscriptionOnlyEnabled": false,
          "allowedUsersForMeetingDetails": "UsersAllowedToByPassTheLobby",
          "productionStudioMode": "Off",
          "enableProductionStudio": false,
          "raiseHands": "Enabled",
          "disableLobby": false,
          "allowBackroomChat": "Disabled",
          "verifyExternalPresentersJoin": "NoVerification",
          "autoAdmittedUsers": "EveryoneInCompany",
          "legalUrl": null,
          "presenterOption": "Everyone",
          "recorderOption": "OrganizersAndPresentersOnly",
          "attendeeRestrictions": "UnRestricted",
          "allowIPVideo": true,
          "allowAnonymousUsersToDialOut": false,
          "allowAnonymousUsersToStartMeeting": false,
          "allowedAutoAdmittedUsers": [
            "EveryoneInCompany"
          ],
          "allowRegisteredUsersToBypassLobby": null,
          "enableAppDesktopSharing": "Desktop",
          "pstnConferencingDialOutType": "InternationalAndDomestic",
          "allowCloudRecording": true,
          "allowLocalRecording": false,
          "allowTranscription": true,
          "allowPowerPointSharing": true,
          "allowSharedNotes": true,
          "allowWhiteboard": true,
          "allowBreakoutRooms": true,
          "allowDocumentCollaboration": "Enabled",
          "allowPstnConferencing": false,
          "allowRaiseHands": true,
          "enableRealtimeTelemetry": false,
          "entryExitAnnouncementsEnabled": true,
          "allowPstnUsersToBypassLobby": false,
          "lockMeeting": false,
          "allowTeamsMeetingReactions": true,
          "yammerQNAEnabled": false,
          "breakoutRoomsEnabled": false,
          "overflowModeActive": false,
          "streamingModeActive": false,
          "attendeeViewModes": "Default",
          "rtmpEnabled": false,
          "stagingRoomEnabled": false,
          "meetingScenario": null,
          "cartCapability": {
            "cartEnabled": false
          },
          "waterMarkCapability": {
            "enabledForVbss": false,
            "enabledForVideo": false,
            "anonymousUsers": "WatermarkWithDisplayName",
            "vbssSettings": null,
            "videoSettings": null
          },
          "meetingLiveState": {
            "phase": "staging",
            "sequenceNumber": 0,
            "seqNum": 0
          },
          "mdpClientAudioRecordingEligible": false,
          "interpretationEnabled": false,
          "aiInterpretationEnabled": null,
          "aiInterpretationEnabledForAllParticipants": null,
          "byodEnabled": null,
          "segmentationTypeForAiInterpreter": "Normal",
          "sensitivityLabelId": null,
          "meetingEndToEndEncryptionEnabled": false,
          "maskIdentitiesForRole": false,
          "forceAttendeeStreaming": false,
          "disableMeetingBranding": true,
          "isCopyRestrictionEnforced": false,
          "enableParticipantRenaming": null,
          "allowSharingChatHistory": null,
          "allowTranslatedCaptions": false,
          "allowTranslatedTranscriptions": false,
          "isPresenterCapabilitiesReduced": false,
          "liveChatEnabled": false,
          "isModeratorEnabled": false,
          "enableBackroomChat": null,
          "copilotMode": "EnabledWithTranscript",
          "automaticallyStartCopilot": "Disabled",
          "groupCopilotDetails": {
            "enabled": false,
            "liveNotesEnabled": false
          },
          "meetingSpokenLanguage": null,
          "disableAnonymousJoin": false,
          "anonymousUserAuthenticationMethod": "none",
          "externalPresenterJoinVerification": "eotp",
          "whoCanAccessTranscriptAndRecording": "Default",
          "whoCanManageQna": "OrganizersAndCoorganizers",
          "transcriptAndRecordingUsers": null,
          "usersCanAdmitFromLobby": "OrganizersAndPresentersOnly",
          "preventScreenCapture": false,
          "visualInsightsEnabled": false,
          "townhallMaxResolution": "MicrosoftManaged",
          "highBitrateForTownhall": "Disabled",
          "enforceConsentToJoin": "Disabled",
          "enforceConsentToJoinContent": null
        },
        "exchangeId": null,
        "iCalUid": "040000008200E00074C5B7101A82E0080000000072A50B2CA355DC01000000000000000010000000E1BEE7FF021EDF42B3A330E714CBA3F1",
        "organizerUpn": "ben@beonex.onmicrosoft.com",
        "meetingChatProperties": "{\"subject\":\"Join URL\",\"startTime\":\"2025-11-14T20:15:00Z\",\"location\":\"Microsoft Teams Meeting\",\"endTime\":\"2025-11-14T20:30:00Z\",\"exchangeId\":null,\"iCalUid\":\"040000008200E00074C5B7101A82E0080000000072A50B2CA355DC01000000000000000010000000E1BEE7FF021EDF42B3A330E714CBA3F1\",\"isCancelled\":false,\"meetingType\":\"Scheduled\",\"yammerQNAEnabled\":null,\"scenario\":null,\"eventRecurrenceRange\":null,\"eventRecurrencePattern\":null,\"eventType\":null,\"attendeeSupport\":null,\"organizerId\":\"50a17a93-7e33-44f1-baef-8f234457f3e7\",\"tenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\",\"meetingData\":null,\"meetingJoinUrl\":\"https://teams.microsoft.com/l/meetup-join/19%3ameeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl%40thread.v2/0?context=%7b%22Tid%22%3a%22338de7e8-b10a-4a7c-aeb4-4cdf726fc818%22%2c%22Oid%22%3a%2250a17a93-7e33-44f1-baef-8f234457f3e7%22%7d\",\"isCopyRestrictionEnforced\":false,\"templateDetails\":null,\"messagingPolicy\":null,\"groupCopilotDetails\":{\"enabled\":false,\"liveNotesEnabled\":false},\"exchangeDetails\":null,\"lobbyThreadId\":null,\"backroomThreadId\":null,\"meetingSpokenLanguage\":null,\"maxEventCapacity\":null,\"mcoIdentifier\":null,\"networkId\":null}",
        "joinUrl": "https://teams.microsoft.com/l/meetup-join/19%3ameeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl%40thread.v2/0?context=%7b%22Tid%22%3a%22338de7e8-b10a-4a7c-aeb4-4cdf726fc818%22%2c%22Oid%22%3a%2250a17a93-7e33-44f1-baef-8f234457f3e7%22%7d",
        "shortJoinUrl": "https://teams.microsoft.com/meet/39563371502184?p=thXZPsOTBKX0jKt2RM",
        "meetingType": "Scheduled",
        "threadType": "meeting",
        "startTime": "2025-11-14T20:15:00Z",
        "endTime": "2025-11-14T20:30:00Z",
        "expiryTime": "2026-01-13T20:30:00Z",
        "isInGracePeriod": false,
        "isPresenterConnected": true,
        "isMeetingActiveWithinScheduleTime": true,
        "collabDetails": {
          "id": "150a17a93-7e33-44f1-baef-8f234457f3e7338de7e8-b10a-4a7c-aeb4-4cdf726fc818040000008200E00074C5B7101A82E0080000000072a50b2ca355dc01000000000000000010000000e1bee7ff021edf42b3a330e714cba3f1",
          "changeKey": "W/\"iZnWZ15U5k6qAr7b+5FQnQAGOuxW9w==\"",
          "resources": []
        },
        "brandingInfo": {
          "enableLobbyLogoBranding": false,
          "lobbyLogoBrandingImages": null,
          "enableLobbyBackgroundBranding": false,
          "lobbyBackgroundBrandingImages": null,
          "enableNdiAssuranceSlate": false,
          "ndiAssuranceSlateImages": null,
          "enableMeetingBackgroundImages": false,
          "meetingBackgroundImages": null,
          "meetingBrandingThemes": null,
          "defaultTheme": null
        },
        "invitees": {
          "coOrganizers": []
        },
        "templateDetails": null,
        "eventDetails": null,
        "vivaEventDetails": {
          "networkId": null,
          "groupId": null
        },
        "featureTypes": [
          "Teams"
        ],
        "meetingOptionsErrorState": "none",
        "recordingConsentDetails": {
          "explicitRecordingConsentEnabled": false,
          "consentActivelyRequired": false
        },
        "organizerRegion": "de",
        "interpreters": [],
        "organizerCloud": "Public",
        "anyWaterMarkLegacyUserEverInMeeting": false,
        "disableReactions": true
      },
      "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "region": "de",
      "meetingInfo": {
        "organizerId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
        "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
      },
      "meetingData": {
        "meetingCode": "39563371502184",
        "passcode": "5gb7bf7j"
      },
      "callLimits": {
        "remainingDurationInMinutes": 60,
        "maxAllowedParticipants": 100,
        "sponsor": "",
        "enforcePaywallLimits": false
      },
      "streamingSetupFailureDebugInfo": null,
      "layoutDetails": null,
      "compositionServiceDetails": null,
      "originalGroupCallInitiator": null,
      "creatorClientVersion": null,
      "conversationStartTime": "2025-11-14T20:15:26.3213066Z"
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1844188037,
    "status": 200,
    "headers": {
      "MS-CV": "emx91VaNc0y3/LiJuR+bjw.1.0",
      "trouter-request": "{\"id\":\"f17c4e92-80bb-4284-82fb-1401edcf5b8d\",\"src\":\"10.129.103.61\",\"port\":3443}",
      "trouter-client": "{\"cd\":12}"
    },
    "body": ""
  }
  ```
- send: `5:11+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `3:::`
  ```json
  {
    "id": -2101615781,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/63acc6bd/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9902.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "f107fa57-0708-493f-bbec-04a7d4ccc0d5",
      "X-Microsoft-Skype-Message-ID": "96bab611-1176-47ef-8177-cddfa8848ba5",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-0e2d387a440e5a645db33859ad1f1513-f341cb95e2f4a61c-00",
      "MS-CV": "cNOoi0/cKE62dS6OK/sfOA.1",
      "trouter-request": "{\"id\":\"7e59bacd-2d66-4580-b65e-1a7804d25fd7\",\"src\":\"10.128.2.198\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "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"
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "participants": {
        "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7": {
          "version": 3,
          "state": "active",
          "advancedMeetingRole": "organizer",
          "details": {
            "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
            "displayName": "Ben Bucksch",
            "displayNameSource": "AAD",
            "propertyBag": {
              "aiVoiceConsent": {
                "value": {
                  "aiVoiceConsentValue": "0"
                },
                "sequenceNumber": 1
              }
            },
            "resourceId": null,
            "participantType": "inTenant",
            "endpointId": "00000000-0000-0000-0000-000000000000",
            "participantId": null,
            "languageId": null,
            "hidden": false,
            "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
            "objectId": "50a17a93-7e33-44f1-baef-8f234457f3e7"
          },
          "endpoints": {
            "0ee99dd3-73c5-4580-b1f2-eb63da9d1c10": {
              "call": {
                "mediaStreams": [
                  {
                    "type": "audio",
                    "label": "main-audio",
                    "sourceId": 201,
                    "direction": "sendrecv",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "video",
                    "label": "main-video",
                    "sourceId": 202,
                    "direction": "recvonly",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "applicationsharing-video",
                    "label": "applicationsharing-video",
                    "sourceId": 212,
                    "direction": "recvonly",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "data",
                    "label": "data",
                    "sourceId": 213,
                    "direction": "sendrecv",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  }
                ],
                "serverMuteVersion": 1,
                "appliedInteractivityLevel": "interactive"
              },
              "endpointCapabilities": 67,
              "clientEndpointCapabilities": 8812226,
              "participantId": "c3c66e90-81b9-4aae-9869-5e82ebaa5b0c",
              "clientVersion": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {
                "holographicCapabilities": 3
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-euwe-01-prod-aks.cc.skype.com:443/cc/v1/callParticipant/00c6d532-771d-4c57-9973-89d0bb713212/13/k3/494/replacement?rt=c3c66e9081b94aae98695e82ebaa5b0c&rc=eyJydGlkIjoiODpvcmdpZDo1MGExN2E5My03ZTMzLTQ0ZjEtYmFlZi04ZjIzNDQ1N2YzZTciLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5IiwicnRwZnMiOnsicmVxdWVzdGVkSW50ZXJhY3Rpdml0eUxldmVsIjoiYWx3YXlzSW50ZXJhY3RpdmUifX0%253D&i=10-128-210-112&e=638985327425314572"
              },
              "endpointJoinTime": "2025-11-14T20:16:43.5679254Z",
              "modalityJoined": "Call",
              "endpointMeetingRoles": [
                "organizer"
              ]
            }
          },
          "role": "admin",
          "meetingRole": "organizer",
          "meetingRoles": [
            "organizer",
            "producer"
          ],
          "enforceConsentToJoin": false
        },
        "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759": {
          "version": 1,
          "state": "active",
          "advancedMeetingRole": "presenter",
          "details": {
            "id": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
            "displayName": "Neil Rashbrook",
            "displayNameSource": "unknown",
            "propertyBag": null,
            "resourceId": null,
            "participantType": "anonymous",
            "endpointId": "00000000-0000-0000-0000-000000000000",
            "participantId": null,
            "languageId": null,
            "hidden": false
          },
          "endpoints": {
            "acf94055-9e12-48aa-ba91-70f41e300e40": {
              "lobby": {
                "mediaStreams": [
                  {
                    "type": "audio",
                    "label": "main-audio",
                    "sourceId": 201,
                    "direction": "sendrecv",
                    "serverMuted": true,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "video",
                    "label": "main-video",
                    "sourceId": 202,
                    "direction": "sendrecv",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "applicationsharing-video",
                    "label": "applicationsharing-video",
                    "sourceId": 212,
                    "direction": "recvonly",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "data",
                    "label": "data",
                    "sourceId": 213,
                    "direction": "sendrecv",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  }
                ]
              },
              "endpointCapabilities": 67,
              "clientEndpointCapabilities": 267010,
              "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
              "clientVersion": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
              "endpointMetadata": {},
              "languageId": "en-us",
              "endpointJoinTime": "2025-11-14T20:16:01.4284415Z",
              "modalityJoined": "Lobby",
              "endpointMeetingRoles": [
                "presenter"
              ]
            }
          },
          "role": "guest",
          "meetingRole": "presenter",
          "meetingRoles": [
            "presenter",
            "producer"
          ],
          "enforceConsentToJoin": false
        }
      },
      "type": "Delta",
      "sequenceNumber": 3,
      "participantCounts": {
        "totalParticipants": 2,
        "preheatedParticipants": 0,
        "lobbyParticipants": 1,
        "totalPresenters": 1,
        "requestingAttentionPresenters": 0,
        "totalAttendees": 0,
        "requestingAttentionAttendees": 0,
        "overflowAttendeeCount": 0,
        "totalInterpreters": 0,
        "requestingAttentionInterpreters": 0,
        "streamingClients": 0,
        "totalOrganizers": 1
      }
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2101615781,
    "status": 200,
    "headers": {
      "MS-CV": "cNOoi0/cKE62dS6OK/sfOA.1.0",
      "trouter-request": "{\"id\":\"7e59bacd-2d66-4580-b65e-1a7804d25fd7\",\"src\":\"10.128.2.198\",\"port\":3443}",
      "trouter-client": "{\"cd\":4}"
    },
    "body": ""
  }
  ```
- receive: `6:::11+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": -2042701071,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fcb56228/call/mediaRenegotiation/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "CallController/2.47.4557.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-Microsoft-Skype-Client": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "bec11d11-2bbc-474d-9b12-3d9152e39395",
      "X-Microsoft-Skype-Message-ID": "5ed01167-257b-4a40-bd2f-d29da7e0d099",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-5a00abf7784138db00cbe33de5ad0f5e-1e1122c376c7a59e-00",
      "MS-CV": "Mnl0LL2K+ku0qKKFQtgfYg.1",
      "trouter-request": "{\"id\":\"7f4b1551-4aa3-40e9-873b-673bdcbc4fdc\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "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"
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "mediaNegotiation": {
        "sender": {
          "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "displayName": "Ben Bucksch",
          "displayNameSource": "unknown",
          "endpointId": "0ee99dd3-73c5-4580-b1f2-eb63da9d1c10",
          "languageId": null,
          "participantId": "c3c66e90-81b9-4aae-9869-5e82ebaa5b0c",
          "hidden": false,
          "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
          "propertyBag": null
        },
        "mediaContent": {
          "contentType": "application/sdp-ngc-0.5",
          "blob": "v=0\r\no=- 226928 0 IN IP4 127.0.0.1\r\ns=session\r\nc=IN IP4 52.112.227.109\r\nb=CT:10000000\r\nt=0 0\r\na=group:BUNDLE 1 2 5 6 7 8 9 10 11 12 13 3 4\r\na=x-plaza-msi-range:214-313 314-413\r\na=x-mediabw:main-video send=8100;recv=8100\r\na=x-mediabw:applicationsharing-video send=8100;recv=8100\r\nm=audio 3480 RTP/AVP 113 109 108 104 102 9 103 111 18 0 8 97 101 13 118 120\r\nc=IN IP4 52.112.227.109\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:dsh recv:dsh\r\na=x-signaling-fb:* x-message app send:dsh\r\na=x-source-streamid:414\r\na=rtcp:3481\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=candidate:1 1 UDP 54001663 52.112.227.109 3480 typ relay raddr 10.0.17.133 rport 3480 MTURNID 15594095257016262594\r\na=candidate:1 2 UDP 54001662 52.112.227.109 3481 typ relay raddr 10.0.17.133 rport 3481 MTURNID 15594434477259377719\r\na=candidate:3 1 tcp-pass 18087935 52.112.227.109 3478 typ relay raddr 10.0.17.133 rport 3478\r\na=candidate:3 2 tcp-pass 18087935 52.112.227.109 3478 typ relay raddr 10.0.17.133 rport 3478\r\na=candidate:4 1 UDP 54001663 2603:1063:118::2e4 3480 typ relay raddr fd00:db8:deca:1::211 rport 3480 MTURNID 15594638339355700002\r\na=candidate:4 2 UDP 54001662 2603:1063:118::2e4 3481 typ relay raddr fd00:db8:deca:1::211 rport 3481 MTURNID 15595006729671867441\r\na=candidate:5 1 tcp-pass 18087935 2603:1063:118::2e4 3478 typ relay raddr fd00:db8:deca:1::211 rport 3478\r\na=candidate:5 2 tcp-pass 18087935 2603:1063:118::2e4 3478 typ relay raddr fd00:db8:deca:1::211 rport 3478\r\na=label:main-audio\r\na=mid:1\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:113 x-much2/48000/2\r\na=rtpmap:109 SATINFB/48000/2\r\na=fmtp:109 decoderversion=1\r\na=rtpmap:108 SATIN/48000\r\na=rtpmap:104 SILK/16000\r\na=rtpmap:102 OPUS/48000/2\r\na=rtpmap:9 G722/8000\r\na=rtpmap:103 SILK/8000\r\na=rtpmap:111 SIREN/16000\r\na=fmtp:111 bitrate=16000\r\na=rtpmap:18 G729/8000\r\na=fmtp:18 annexb=no\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:97 RED/8000\r\na=rtpmap:101 telephone-event/8000\r\na=fmtp:101 0-16\r\na=rtpmap:13 CN/8000\r\na=rtpmap:118 CN/16000\r\na=rtpmap:120 CN/48000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=x-ssrc-range:2201-2201\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2202 2252\r\na=x-source-streamid:415\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=candidate:1 1 UDP 54001663 52.112.227.109 3480 typ relay raddr 10.0.17.133 rport 3480 MTURNID 15595381655050374476\r\na=candidate:1 2 UDP 54001662 52.112.227.109 3481 typ relay raddr 10.0.17.133 rport 3481 MTURNID 15595480148474077365\r\na=candidate:3 1 tcp-pass 18087935 52.112.227.109 3478 typ relay raddr 10.0.17.133 rport 3478\r\na=candidate:3 2 tcp-pass 18087935 52.112.227.109 3478 typ relay raddr 10.0.17.133 rport 3478\r\na=candidate:4 1 UDP 54001663 2603:1063:118::2e4 3480 typ relay raddr fd00:db8:deca:1::211 rport 3480 MTURNID 15595737369301898457\r\na=candidate:4 2 UDP 54001662 2603:1063:118::2e4 3481 typ relay raddr fd00:db8:deca:1::211 rport 3481 MTURNID 15596149279261845506\r\na=candidate:5 1 tcp-pass 18087935 2603:1063:118::2e4 3478 typ relay raddr fd00:db8:deca:1::211 rport 3478\r\na=candidate:5 2 tcp-pass 18087935 2603:1063:118::2e4 3478 typ relay raddr fd00:db8:deca:1::211 rport 3478\r\na=label:main-video\r\na=mid:2\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2202-2301\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2302 2352\r\na=x-source-streamid:416\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:5\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2302-2401\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2402 2452\r\na=x-source-streamid:417\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:6\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2402-2501\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2502 2552\r\na=x-source-streamid:418\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:7\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2502-2601\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2602 2652\r\na=x-source-streamid:419\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:8\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2602-2701\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2702 2752\r\na=x-source-streamid:420\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:9\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2702-2801\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2802 2852\r\na=x-source-streamid:421\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:10\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2802-2901\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2902 2952\r\na=x-source-streamid:422\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:11\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2902-3001\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 3002 3052\r\na=x-source-streamid:423\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:12\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:3002-3101\r\nm=video 3480 RTP/AVP 122 107 123 125 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 3102 3152\r\na=x-multi-stream:1 3102 100 50\r\na=x-source-streamid:424\r\na=rtcp:3481\r\na=ice-ufrag:MJb8\r\na=ice-pwd:4J2Q/l3stfXA7y+xhoF1d3oG\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:13\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:3102-3201\r\nm=video 3481 RTP/AVP 122 107 116 123 125 99 112\r\nc=IN IP4 52.112.227.109\r\nb=AS:4000\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app send:src,x-pli recv:src,x-pli\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 23102 23152\r\na=x-multi-stream:2 23102 100 50\r\na=x-source-streamid:425\r\na=rtcp:3482\r\na=ice-ufrag:Ibb8\r\na=ice-pwd:0vSsPQVeE4LiDj32qGePnTgd\r\na=rtcp-mux\r\na=candidate:1 1 UDP 54001663 52.112.227.109 3481 typ relay raddr 10.0.17.133 rport 3481 MTURNID 15596415993607552027\r\na=candidate:1 2 UDP 54001662 52.112.227.109 3482 typ relay raddr 10.0.17.133 rport 3482 MTURNID 15596646087154526517\r\na=candidate:3 1 tcp-pass 18087935 52.112.227.109 3478 typ relay raddr 10.0.17.133 rport 3478\r\na=candidate:3 2 tcp-pass 18087935 52.112.227.109 3478 typ relay raddr 10.0.17.133 rport 3478\r\na=candidate:4 1 UDP 54001663 2603:1063:118::2e4 3481 typ relay raddr fd00:db8:deca:1::211 rport 3481 MTURNID 15596926795125905824\r\na=candidate:4 2 UDP 54001662 2603:1063:118::2e4 3482 typ relay raddr fd00:db8:deca:1::211 rport 3482 MTURNID 15597300298111506928\r\na=candidate:5 1 tcp-pass 18087935 2603:1063:118::2e4 3478 typ relay raddr fd00:db8:deca:1::211 rport 3478\r\na=candidate:5 2 tcp-pass 18087935 2603:1063:118::2e4 3478 typ relay raddr fd00:db8:deca:1::211 rport 3478\r\na=label:applicationsharing-video\r\na=mid:3\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=375;profile-level-id=42C02A;max-br=3333;max-fs=8160;max-mbps=30600\r\na=rtpmap:116 AV1/90000\r\na=fmtp:116 profile=0;level-idx=4;tier=0\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:125 rtx/90000\r\na=fmtp:125 apt=122;rtx-time=3000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtpmap:112 rtx/90000\r\na=fmtp:112 apt=116;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\\\\skype.com\\experiments\\rtp-hdrext\\frame-counters-gvc\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:23102-23201\r\nm=x-data 3480 RTP/AVP 127 126\r\nc=IN IP4 52.112.227.109\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=ssrc-group:FID 24102 24152\r\na=x-source-streamid:426\r\na=rtcp:3481\r\na=ice-ufrag:AnNj\r\na=ice-pwd:0K91K2iYp4THZJH6wkZThhr6\r\na=rtcp-mux\r\na=candidate:1 1 UDP 54001663 52.112.227.109 3480 typ relay raddr 10.0.17.133 rport 3480 MTURNID 15597427700041043563\r\na=candidate:1 2 UDP 54001662 52.112.227.109 3481 typ relay raddr 10.0.17.133 rport 3481 MTURNID 15597674414400293917\r\na=candidate:3 1 tcp-pass 18087935 52.112.227.109 3478 typ relay raddr 10.0.17.133 rport 3478\r\na=candidate:3 2 tcp-pass 18087935 52.112.227.109 3478 typ relay raddr 10.0.17.133 rport 3478\r\na=candidate:4 1 UDP 54001663 2603:1063:118::2e4 3480 typ relay raddr fd00:db8:deca:1::211 rport 3480 MTURNID 15598048841258469391\r\na=candidate:4 2 UDP 54001662 2603:1063:118::2e4 3481 typ relay raddr fd00:db8:deca:1::211 rport 3481 MTURNID 15598389816739013764\r\na=candidate:5 1 tcp-pass 18087935 2603:1063:118::2e4 3478 typ relay raddr fd00:db8:deca:1::211 rport 3478\r\na=candidate:5 2 tcp-pass 18087935 2603:1063:118::2e4 3478 typ relay raddr fd00:db8:deca:1::211 rport 3478\r\na=label:data\r\na=mid:4\r\na=x-bwealgorithm:rmestimator bwc packetpair webrtc\r\na=cryptoscale:1 server AES_CM_128_HMAC_SHA1_80 inline:KA7/ZEjNliU7JsjOaSZ8IKrzux2PDXH/94ptfJlz|2^31|1:1\r\na=crypto:2 AES_CM_128_HMAC_SHA1_80 inline:wOqswwApXwSVkLwl66Qg2mCprUPmsvaCqjkNiEf8|2^31|1:1\r\na=crypto:3 AES_CM_128_HMAC_SHA1_80 inline:5OLt9CfErm+Phy3vyPTLY0+ZLD1G5H2aggPWJ8+7|2^31\r\na=crypto:4 AEAD_AES_256_GCM inline:yeTB480ldbOpJrAFmmyMxsXy+/ZUw+CECRDZt5siXQzvQvMqmHR5d26l+t8=|2^31|1:1\r\na=crypto:5 AEAD_AES_256_GCM inline:qDN9Tar0yHpAq3llS4kxIN0x8u9hufZp/RaVvDeIcBkvJ5x2Qf5sxkAgmDM=|2^31\r\na=rtpmap:127 x-data/90000\r\na=rtpmap:126 rtx/90000\r\na=fmtp:126 apt=127;rtx-time=3000\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\skype.com\\experiments\\rtp-hdrext\\fast_bandwidth_feedback#version_3\r\na=x-ssrc-range:24102-24201\r\na=x-data-protocol:rtp sctp\r\n",
          "mediaLegId": "9495a715-0c01-4878-857b-8d7605c7cb42",
          "escalationOccurring": false,
          "newOffer": true,
          "fromMixer": true,
          "originator": "mcGvc",
          "skipIceReinvite": true
        },
        "callModalities": [],
        "links": {
          "mediaAnswer": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/t/981/answer?i=10-128-210-112",
          "rejection": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/t/981/reject?i=10-128-210-112"
        }
      },
      "debugContent": {
        "causeId": "acb14e1b-b068-42f0-8359-be92f76f92ed",
        "callStartTime": "2025-11-14T20:16:49.7156088Z",
        "callId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
        "IsRetargetNegotiationPending": false,
        "MPInstanceServiceUri": "https://a-swce-34.mp.skype.com:10021/mediaprocessor/v1",
        "MPInstanceId": "a-swce-34.mp.skype.com.MpRole_IN_28",
        "MPPublicIpTagUsed": "Business",
        "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6"
      }
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2042701071,
    "status": 200,
    "headers": {
      "MS-CV": "Mnl0LL2K+ku0qKKFQtgfYg.1.0",
      "trouter-request": "{\"id\":\"7f4b1551-4aa3-40e9-873b-673bdcbc4fdc\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "trouter-client": "{\"cd\":9}"
    },
    "body": ""
  }
  ```
- send: `5:12+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::12+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": -2042700765,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fae22cbb/call/mediaAcknowledgement/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "CallController/2.47.4557.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "99999999-9999-9999-9999-999999999999",
      "X-Microsoft-Skype-Client": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "Trouter-Timeout": "12299",
      "X-Microsoft-Skype-Original-Message-ID": "f68916e5-83f0-4eed-a4f7-fe29ea3da251",
      "X-Microsoft-Skype-Message-ID": "900644d3-fcb8-4389-a084-2f0991c0256a",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-a375d1f30c2331aedbb19528f8fd6e0e-e855c9f048c10985-00",
      "MS-CV": "tw3Xl5N2cEGHHz4cHjlhsw.1",
      "trouter-request": "{\"id\":\"8d227d63-0a71-4d4f-9b87-7b04a51ffce1\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "Trouter-TimeoutMs": "12799"
    },
    "body": "H4sIAAAAAAAAA8yWW0/bMBTHvwqyNJ5I7dyapFKFtsIYiHKnpZn24NqnraljR7ZLL4jvvoSbmMS0vEzqU+Kjv07+P5/jEz+iArigX9lc6aUEPoUClEOdR2SAWq1QByl9aIw2aA9ZUBwM6qiFlHuIaQ6oQ6rwYtx7fveJT7I9VM4MtdUSXVDjBBMlVW7HgKNmCm5nSe2OXTAG1k4WslWlNWAX0vWog6k2Aizq/ETXLwr062kPSaHmtrbEqJSnMH038LZEM+dK28GYlqI1kWI6c6XRq3XLAS1sqxDMaKsnrsV0UWvwQ4ChxIx5sFiCR3yvknOPzm2LsZadr0t4ljKGH3xMmRMPgAlhbR6HgZckPvciFideliWhl2acjMeJHwZ+gNMkwjTCfhKm+6LrE88PUi+on36wC912mGZplSOJgjj0ozgJKvznAlyBquidoE48b/o2EmHzbhIa0zlDlZ3UXbOdTG/+GgMZKCVlr8fknelfLjtRFL46rdv2w8loZtkP8TzEURbhD9/fN67LQtZuQ0ZSf5xFlEKWtrMY0gDGlMZjwnYN68L6ZM2P5Pz4Xovzg/KBFbzMD7TfPzpcnQWHcX9Nwvymvzm9uST5/aEbFd9lLkiU3x9vzg4u/bNgtMlvmDjt1XlWZZ0nH0ZuMOi/xH6cbOrY1TAm+d3JkhVykw++rcfhLD4WS8HU1TJXfXGurGDFYMWHgw0/GsyvX/SzUXhV8kISuF1JXgxsnWs0XIWjO7n5U3MrJnfkS1WNg92m9bLV3HHnCzfVQk3Ptv+Q/c1v4wadacm3Fa721nwwaiWc3trJ8WqvMQ7TyhktB4KDvnbV77WoCvy/4Qp2USdrTjcPEhyQdow/tdsYlpalXPdmVCmohx0twIGx20v7ud+GuNUdhcN4Me1VW/Zye3p6+g0AAP//AwAbantqWQkAAA=="
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "mediaAcknowledgement": {
        "reason": "noError",
        "sender": null,
        "code": 0,
        "subCode": 10109,
        "phrase": "Participant retarget was successful.",
        "resultCategories": [
          "Success"
        ]
      },
      "links": {
        "callLeg": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/00c6d532-771d-4c57-9973-89d0bb713212/874/a4/1738?i=10-128-210-112&e=638985327425314572",
        "mediaRenegotiation": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/00c6d532-771d-4c57-9973-89d0bb713212/874/a4/1738/renegotiate?i=10-128-210-112&e=638985327425314572",
        "transfer": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/00c6d532-771d-4c57-9973-89d0bb713212/874/a4/1738/transfer?i=10-128-210-112&e=638985327425314572",
        "replacement": "https://cc-euwe-01-prod-aks.cc.skype.com:443/cc/v1/callParticipant/00c6d532-771d-4c57-9973-89d0bb713212/13/k3/494/replacement?rt=c3c66e9081b94aae98695e82ebaa5b0c&rc=eyJydGlkIjoiODpvcmdpZDo1MGExN2E5My03ZTMzLTQ0ZjEtYmFlZi04ZjIzNDQ1N2YzZTciLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5IiwicnRwZnMiOnsicmVxdWVzdGVkSW50ZXJhY3Rpdml0eUxldmVsIjoiYWx3YXlzSW50ZXJhY3RpdmUifX0%253D&i=10-128-210-112&e=638985327425314572",
        "startOutgoingNegotiation": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/00c6d532-771d-4c57-9973-89d0bb713212/874/a4/1738/startOutgoingNegotiation?i=10-128-210-112&e=638985327425314572",
        "hold": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/00c6d532-771d-4c57-9973-89d0bb713212/874/a4/1738/hold?i=10-128-210-112&e=638985327425314572",
        "monitor": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/active/00c6d532-771d-4c57-9973-89d0bb713212/874/a4/1738/monitor?i=10-128-210-112&e=638985327425314572",
        "controlVideoStreaming": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/00c6d532-771d-4c57-9973-89d0bb713212/874/k27/2065/controlVideoStreaming?i=10-128-210-112&e=638985327425314572",
        "applyChannelParameters": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/00c6d532-771d-4c57-9973-89d0bb713212/874/k27/2065/applyChannelParameters?i=10-128-210-112&e=638985327425314572"
      },
      "debugContent": {}
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2042700765,
    "status": 200,
    "headers": {
      "MS-CV": "tw3Xl5N2cEGHHz4cHjlhsw.1.0",
      "trouter-request": "{\"id\":\"8d227d63-0a71-4d4f-9b87-7b04a51ffce1\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "trouter-client": "{\"cd\":7}"
    },
    "body": ""
  }
  ```
- send: `5:13+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::13+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": -2101615309,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/63acc6bd/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9902.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "fbc6d8b5-9d7c-4af1-a79d-335387d7e034",
      "X-Microsoft-Skype-Message-ID": "7c5a45c0-1226-4966-b194-b0eee1cb2853",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-a48471a38255690dad927d7741d800f5-6757292c051a24ca-00",
      "MS-CV": "3t7TKwYKq02dQ/2qabwHGg.1",
      "trouter-request": "{\"id\":\"fe4a7d1f-b9b8-411b-bdab-3f7337fb2004\",\"src\":\"10.128.2.198\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "H4sIAAAAAAAAA91XS4/bOAy+91cEBranOpb8jFMEi3am7c6gky5m0sek6EGW5EQT2/LactKkmP++lPOyU6fdHrs5JDD5kaI+0iTz7UmvZ+SkUIKKnGSqNIa9byAD6WCoOEnLpSiFksUw8D0bhT4PIx+72PFDP8Yxt2ng+XQQeOHBEEyXvCiFzEDkPtvLSkUUB4lBqBJLbhwUhC1JRjm74VyJbHYrkxqWF7zkmeLFEcm4IiIpGyeBUDCN/tVgnx0dMFHmCVmPSVqfO+Yi6d2Sch4VUi7OAO9kVdAaXmWLTK6yJi4vZM4LtX5JZoDIqiRpKOFWte0V+17XyMNknW/JymS2TmVVNg/gGculyFTtw0C7j9nxtf8Y3ad0BZGQbFaRWWeAc8EY12mNSVLynfzxkJ99XCcZIjQOXeR5ZsixbboDQsyIhNgMUOxi7iDEXdSyABtKkuREBtKUM0HuVKFTDdrPLW3vBF1bqD2PFROywULjuhHXJxkpEZl5FtZImovdDgATBYfCrovegMJl8Ljs9MQLeD1uKsXZnsgOVCbVVXbJY1Il6lZW+sV4U8gq/4FJWUW7qvn85UT7eAr/AVNLwfh/YOosrMWU939miuR5IijRVynnpICDz7NyIO9XjJpU2j+lUtMos2T9O1LJiCI/pO0coEWR/9tVW+v5S9u4EdGHwzzFDUiL4EPzvSA5iUQilOC6R/pBC0UTAUP1VTfW9gOEUQt/OiwMxAYUhwPXjFxGTNcOfGjrFJs2Gjj2gDuuH/tGx5HHKxh3C6DjLieUlxZMZ8+yPYyRg3wXYUuWo5XImFyVz3uyBKvReNLDqI+e9xhfCso1lyMq0xx4KZ73YEqvgKgRnRcy5YdnbQi++6hfm/KvMJEhDMr19B4lIuXWpLyAIQMJ3IU2spHt9V2nj3Dfsd4to1GAY0Sp49g4DkISUxT4NLS578U2R34YR5yBTWwbnYm4gW2lLlsYY+1UtUYs4M3WeN9Nv7ciW7QHaa0qOOwglKdAqTaeK5WXQ8ui1OTVipsIm7B+MJMsyj6l/VJT3Qe2hq7rAMhaYks7//uYVgsh6jPPsc0gwMx0qReYYRg45iBkKIoCDNe3rUHgWgvbCj3PakTwZ6FG+4LQ9aDLQVdDsxieFnTE19dr9iZZXD1I8e4yR9OPrxV1pjm1ExQ5V/54c49vHl544/S9d/9w/3V8+WozfljY04fX6XRy/TDevLfvNzNnPFmItxfa19dc+5p+dBX7dLOV/XW90bLbjx6afrpe0TTZTD+8XEfO3LvK0B+251w+FSOMTGwPTFv/YvspH/nOIBzA9QNosQ52vcA2fvqOXcPXRGz3RV014MrE7sRGQ+wPoXxce+BCYU/bWU0lI/CurbV13WSMtzKK1s90GZ4rocNK/P2+09iQG/Jji9k3l+N+VuxW61nFS3Vcq9OfLt7puTg6wNsFmFX0GNehscHFYgn9+gKGH1hNpKaitU7qoOuAD6Phkie71g8N8Z+qfoerNALvu38XzR51IavWfxglFWkWe93lttHo0Occ/pOwE/2uARqJTs4Z3dbv/u5Nr4WOsdRsvVAKtNBYWriWhxrCOG8qOhx0wSSMhjiRq72uvvmp/yt9Ktzz5OyOI84gy3rXBuBF3cS/u8C7YkYysdka6dn0+OTxX7G//f1TDgAA"
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "participants": {
        "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759": {
          "version": 4,
          "state": "active",
          "advancedMeetingRole": "presenter",
          "details": {
            "id": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
            "displayName": "Neil Rashbrook",
            "displayNameSource": "unknown",
            "propertyBag": null,
            "resourceId": null,
            "participantType": "anonymous",
            "endpointId": "00000000-0000-0000-0000-000000000000",
            "participantId": null,
            "languageId": null,
            "hidden": false
          },
          "endpoints": {
            "acf94055-9e12-48aa-ba91-70f41e300e40": {
              "call": {
                "mediaStreams": [
                  {
                    "type": "audio",
                    "label": "main-audio",
                    "sourceId": 414,
                    "direction": "sendrecv",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "video",
                    "label": "main-video",
                    "sourceId": 415,
                    "direction": "sendrecv",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "applicationsharing-video",
                    "label": "applicationsharing-video",
                    "sourceId": 425,
                    "direction": "recvonly",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  },
                  {
                    "type": "data",
                    "label": "data",
                    "sourceId": 426,
                    "direction": "sendrecv",
                    "serverMuted": false,
                    "notInDefaultRoutingGroup": false,
                    "subType": []
                  }
                ],
                "serverMuteVersion": 1
              },
              "endpointCapabilities": 67,
              "clientEndpointCapabilities": 267010,
              "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
              "clientVersion": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
              "endpointMetadata": {},
              "languageId": "en-us",
              "callLinks": {
                "replacement": "https://cc-euwe-01-prod-aks.cc.skype.com:443/cc/v1/callParticipant/00c6d532-771d-4c57-9973-89d0bb713212/874/k2/955/replacement?rt=0d8c1984b4da42769ec1208328e346f6&rc=eyJydGlkIjoiODp0ZWFtc3Zpc2l0b3I6NzY1MjA5NmU5YjYxNDEzNjk2ZjFmZTJjNzU2Yzg3NTkiLCJydGxpIjoiZW4tdXMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5In0%253D&i=10-128-210-112&e=638985327425314572"
              },
              "endpointJoinTime": "2025-11-14T20:16:01.4284415Z",
              "modalityJoined": "Lobby,Call",
              "endpointMeetingRoles": [
                "presenter"
              ]
            }
          },
          "role": "guest",
          "meetingRole": "presenter",
          "meetingRoles": [
            "presenter",
            "producer"
          ],
          "enforceConsentToJoin": false
        }
      },
      "type": "Delta",
      "sequenceNumber": 4,
      "participantCounts": {
        "totalParticipants": 2,
        "preheatedParticipants": 0,
        "lobbyParticipants": 0,
        "totalPresenters": 2,
        "requestingAttentionPresenters": 0,
        "totalAttendees": 0,
        "requestingAttentionAttendees": 0,
        "overflowAttendeeCount": 0,
        "totalInterpreters": 0,
        "requestingAttentionInterpreters": 0,
        "streamingClients": 0,
        "totalOrganizers": 1
      }
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2101615309,
    "status": 200,
    "headers": {
      "MS-CV": "3t7TKwYKq02dQ/2qabwHGg.1.0",
      "trouter-request": "{\"id\":\"fe4a7d1f-b9b8-411b-bdab-3f7337fb2004\",\"src\":\"10.128.2.198\",\"port\":3443}",
      "trouter-client": "{\"cd\":3}"
    },
    "body": ""
  }
  ```
- send: `5:14+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::14+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": -2042699449,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fcb56228/call/mediaRenegotiation/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "CallController/2.47.4557.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "e8c8baf8-0c43-44d3-b923-11c0bf261a23",
      "X-Microsoft-Skype-Message-ID": "dc01119c-3313-4dbe-b06a-85fe5b6b99d0",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-48b21c2670f5f1d9d84231cc067d9b10-6713a60b67fb4c87-00",
      "MS-CV": "H5Y8oRcAiESyhW8oUk/IBQ.1",
      "trouter-request": "{\"id\":\"72d1278b-a41e-407d-844f-a928fe717672\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "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"
  }
  ```
  - `body` (gzipped):
    ```json
    {
      "mediaNegotiation": {
        "sender": null,
        "mediaContent": {
          "contentType": "application/sdp-ngc-1.0",
          "blob": "v=0\r\no=- 226928 1 IN IP4 127.0.0.1\r\ns=session\r\nc=IN IP4 52.112.227.109\r\nb=CT:10000000\r\nt=0 0\r\na=group:BUNDLE 1 2 5 6 7 8 9 10 11 12 13 3 4\r\na=x-plaza-msi-range:214-313 314-413\r\na=x-mediabw:main-video send=8100;recv=8100\r\na=x-mediabw:applicationsharing-video send=8100;recv=8100\r\nm=audio 3480 RTP/SAVP 113 109 108 104 102 9 103 111 18 0 8 97 101 13 118 120\r\nc=IN IP4 52.112.227.109\r\na=x-signaling-fb:* x-message app send:dsh\r\na=x-source-streamid:414\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=candidate:1 1 UDP 1849163775 52.112.227.109 3480 typ prflx raddr 10.0.17.133 rport 3480 MTURNID 15594095257016262594\r\na=remote-candidates:1 82.19.9.88 55539 2 82.19.9.88 55539\r\na=label:main-audio\r\na=mid:1\r\na=rtpmap:113 x-much2/48000/2\r\na=rtpmap:109 SATINFB/48000/2\r\na=fmtp:109 decoderversion=1\r\na=rtpmap:108 SATIN/48000\r\na=rtpmap:104 SILK/16000\r\na=rtpmap:102 OPUS/48000/2\r\na=rtpmap:9 G722/8000\r\na=rtpmap:103 SILK/8000\r\na=rtpmap:111 SIREN/16000\r\na=fmtp:111 bitrate=16000\r\na=rtpmap:18 G729/8000\r\na=fmtp:18 annexb=no\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:97 RED/8000\r\na=rtpmap:101 telephone-event/8000\r\na=fmtp:101 0-16\r\na=rtpmap:13 CN/8000\r\na=rtpmap:118 CN/16000\r\na=rtpmap:120 CN/48000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=x-ssrc-range:2201-2201\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2202 2252\r\na=x-source-streamid:415\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:2\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2202-2301\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2302 2352\r\na=x-source-streamid:416\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:5\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2302-2401\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2402 2452\r\na=x-source-streamid:417\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:6\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2402-2501\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2502 2552\r\na=x-source-streamid:418\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:7\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2502-2601\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2602 2652\r\na=x-source-streamid:419\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:8\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2602-2701\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2702 2752\r\na=x-source-streamid:420\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:9\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2702-2801\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2802 2852\r\na=x-source-streamid:421\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:10\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2802-2901\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 2902 2952\r\na=x-source-streamid:422\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:11\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:2902-3001\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 3002 3052\r\na=x-source-streamid:423\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:12\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:3002-3101\r\nm=video 3480 RTP/SAVP 122 107 123 99\r\nc=IN IP4 52.112.227.109\r\nb=AS:250\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 3102 3152\r\na=x-source-streamid:424\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:main-video\r\na=mid:13\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=1500;profile-level-id=42C02A;max-br=208;max-fs=240;max-mbps=3600\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:3102-3201\r\nm=video 3480 RTP/SAVP 122 107 116 123 99 112\r\nc=IN IP4 52.112.227.109\r\nb=AS:4000\r\na=rtcp-rsize\r\na=rtcp-fb:* x-message app\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* transport-cc\r\na=x-signaling-fb:* x-message app send:src,csrc,vc recv:src\r\na=ssrc-group:FID 23102 23152\r\na=x-source-streamid:425\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:applicationsharing-video\r\na=mid:3\r\na=sendonly\r\na=rtpmap:122 x-h264uc/90000\r\na=fmtp:122 packetization-mode=1;mst-mode=NI-TC\r\na=rtpmap:107 H264/90000\r\na=fmtp:107 packetization-mode=1;max-fps=375;profile-level-id=42C02A;max-br=3333;max-fs=8160;max-mbps=30600\r\na=rtpmap:116 AV1/90000\r\na=fmtp:116 profile=0;level-idx=4;tier=0\r\na=rtpmap:123 x-ulpfecuc/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtpmap:112 rtx/90000\r\na=fmtp:112 apt=116;rtx-time=3000\r\na=ptime:20\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\video-layers-allocation00-non-advertised\r\na=x-ssrc-range:23102-23201\r\nm=x-data 3480 RTP/SAVP 127 126\r\nc=IN IP4 52.112.227.109\r\na=ssrc-group:FID 24102 24152\r\na=x-source-streamid:426\r\na=rtcp:3480\r\na=setup:passive\r\na=ice-ufrag:r2xz\r\na=ice-pwd:Iw9FNIkoyBDCRRDnDEhPam6+\r\na=rtcp-mux\r\na=label:data\r\na=mid:4\r\na=rtpmap:127 x-data/90000\r\na=rtpmap:126 rtx/90000\r\na=fmtp:126 apt=127;rtx-time=3000\r\na=fingerprint:sha-256 0A:BC:A6:6F:05:8E:BD:17:2E:11:1D:80:7C:92:9D:F0:74:86:DB:03:78:80:6A:4B:CF:D9:5E:8D:58:E5:40:E0\r\na=x-ssrc-range:24102-24201\r\na=x-data-protocol:sctp\r\n",
          "mediaLegId": "9495a715-0c01-4878-857b-8d7605c7cb42",
          "escalationOccurring": false,
          "newOffer": false,
          "fromMixer": true,
          "originator": "mcGvc",
          "skipIceReinvite": true
        },
        "callModalities": [],
        "links": {
          "mediaAnswer": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/00c6d532-771d-4c57-9973-89d0bb713212/874/t/2470/answer?i=10-128-210-112",
          "rejection": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/00c6d532-771d-4c57-9973-89d0bb713212/874/t/2470/reject?i=10-128-210-112"
        }
      },
      "debugContent": {
        "IsRetargetNegotiationPending": false,
        "MPInstanceServiceUri": "https://a-swce-34.mp.skype.com:10021/mediaprocessor/v1",
        "MPInstanceId": "a-swce-34.mp.skype.com.MpRole_IN_28",
        "MPPublicIpTagUsed": "Business",
        "callId": "056391c5-feb6-4960-9209-36d8c0fc1be5"
      }
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2042699449,
    "status": 200,
    "headers": {
      "MS-CV": "H5Y8oRcAiESyhW8oUk/IBQ.1.0",
      "trouter-request": "{\"id\":\"72d1278b-a41e-407d-844f-a928fe717672\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "trouter-client": "{\"cd\":7}"
    },
    "body": ""
  }
  ```
- send: `5:15+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::15+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": -2042699339,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/b98cfe07/call/mediaAcknowledgement/",
    "headers": {
      "Content-Length": "173",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "User-Agent": "CallController/2.47.4557.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "c8723803-111d-4230-9119-ce3fc6dca236",
      "X-Microsoft-Skype-Message-ID": "2f0daa51-50da-41e7-b74f-85558485937f",
      "traceparent": "00-c6e389fe4305a8b633338458b44891c5-2b518c054200336c-00",
      "MS-CV": "lttmaYD2iEyJXQhpApVqng.1",
      "trouter-request": "{\"id\":\"801aa753-8eb3-48aa-8f30-17a494a601d5\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"mediaAcknowledgement\":{\"reason\":\"noError\",\"sender\":null,\"code\":0,\"subCode\":0,\"phrase\":\"Success\",\"resultCategories\":[\"Success\"]},\"links\":{\"callLeg\":null},\"debugContent\":{}}"
  }
  ```
  - `body`:
    ```json
    {
      "mediaAcknowledgement": {
        "reason": "noError",
        "sender": null,
        "code": 0,
        "subCode": 0,
        "phrase": "Success",
        "resultCategories": [
          "Success"
        ]
      },
      "links": {
        "callLeg": null
      },
      "debugContent": {}
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2042699339,
    "status": 200,
    "headers": {
      "MS-CV": "lttmaYD2iEyJXQhpApVqng.1.0",
      "trouter-request": "{\"id\":\"801aa753-8eb3-48aa-8f30-17a494a601d5\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "trouter-client": "{\"cd\":0}"
    },
    "body": ""
  }
  ```
- send: `5:16+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::16+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 240399292,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/3e7b64c2/call/controlVideoStreaming/",
    "headers": {
      "Content-Length": "457",
      "Content-Type": "application/vnd.skype.mc.v2.0+json",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "73c3f6db-6657-4b63-911a-add365697eb7",
      "X-Microsoft-Skype-Message-ID": "ab6c2afb-c8c0-4fbc-9fa5-e3837f4b0608",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "traceparent": "00-1ae07b58484d7773d45ec074335d85d3-1ccb9d99b6d4347d-00",
      "MS-CV": "mydV5Pp93USroxtKhcHUFw.1",
      "trouter-request": "{\"id\":\"243a7ab8-07ae-455b-b9ef-5603de89b3ba\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"controlVideoStreaming\":{\"sequenceNumber\":1,\"globalTimeStamp\":\"11/14/2025 8:16:58 PM\",\"controlInfo\":[{\"control\":0,\"sourceId\":415,\"fmtParams\":\"KeyFrame=1;max-br=397;max-fps=3000.000000;max-fs=920;max-mbps=27600;rid=1;ssrc=1070193489;profile-level-id=42C02A;packetization-mode=1\",\"fmtParamsList\":[\"KeyFrame=1;max-br=397;max-fps=3000.000000;max-fs=920;max-mbps=27600;rid=1;ssrc=1070193489;profile-level-id=42C02A;packetization-mode=1\"]}]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "controlVideoStreaming": {
        "sequenceNumber": 1,
        "globalTimeStamp": "11/14/2025 8:16:58 PM",
        "controlInfo": [
          {
            "control": 0,
            "sourceId": 415,
            "fmtParams": "KeyFrame=1;max-br=397;max-fps=3000.000000;max-fs=920;max-mbps=27600;rid=1;ssrc=1070193489;profile-level-id=42C02A;packetization-mode=1",
            "fmtParamsList": [
              "KeyFrame=1;max-br=397;max-fps=3000.000000;max-fs=920;max-mbps=27600;rid=1;ssrc=1070193489;profile-level-id=42C02A;packetization-mode=1"
            ]
          }
        ]
      },
      "debugContent": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 240399292,
    "status": 200,
    "headers": {
      "MS-CV": "mydV5Pp93USroxtKhcHUFw.1.0",
      "trouter-request": "{\"id\":\"243a7ab8-07ae-455b-b9ef-5603de89b3ba\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "trouter-client": "{\"cd\":0}"
    },
    "body": ""
  }
  ```
- send: `5:17+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::17+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 240399828,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/3e7b64c2/call/controlVideoStreaming/",
    "headers": {
      "Content-Length": "513",
      "Content-Type": "application/vnd.skype.mc.v2.0+json",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "a5534208-8957-4156-934f-120ac5f0fe65",
      "X-Microsoft-Skype-Message-ID": "26fe1baa-5608-47a2-a4e1-8e1e0036bf97",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "traceparent": "00-d88c78250808eb78755f7238ba6475a4-54029ba640af193d-00",
      "MS-CV": "ITneFFAn5E6e9YZ39OVscw.1",
      "trouter-request": "{\"id\":\"f600d95d-79bf-4ae5-b08f-cec70b5b56da\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"controlVideoStreaming\":{\"sequenceNumber\":2,\"globalTimeStamp\":\"11/14/2025 8:17:00 PM\",\"controlInfo\":[{\"control\":0,\"sourceId\":415,\"fmtParams\":\"KeyFrame=0;max-br=1003;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=640x360@15x476;profile-level-id=42C02A;packetization-mode=1\",\"fmtParamsList\":[\"KeyFrame=0;max-br=1003;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=640x360@15x476;profile-level-id=42C02A;packetization-mode=1\"]}]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "controlVideoStreaming": {
        "sequenceNumber": 2,
        "globalTimeStamp": "11/14/2025 8:17:00 PM",
        "controlInfo": [
          {
            "control": 0,
            "sourceId": 415,
            "fmtParams": "KeyFrame=0;max-br=1003;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=640x360@15x476;profile-level-id=42C02A;packetization-mode=1",
            "fmtParamsList": [
              "KeyFrame=0;max-br=1003;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=640x360@15x476;profile-level-id=42C02A;packetization-mode=1"
            ]
          }
        ]
      },
      "debugContent": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 240399828,
    "status": 200,
    "headers": {
      "MS-CV": "ITneFFAn5E6e9YZ39OVscw.1.0",
      "trouter-request": "{\"id\":\"f600d95d-79bf-4ae5-b08f-cec70b5b56da\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
  }
  ```
- send: `5:18+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::18+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 240400073,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/3e7b64c2/call/controlVideoStreaming/",
    "headers": {
      "Content-Length": "515",
      "Content-Type": "application/vnd.skype.mc.v2.0+json",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "1fb50e87-5491-4e36-b304-3ee234700e69",
      "X-Microsoft-Skype-Message-ID": "94e149c4-9246-4baa-a985-f2573b714e76",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "traceparent": "00-7ffbaa3f42a2868692683ef527b944db-e2216d1ff2b08066-00",
      "MS-CV": "XkBPJSsdKUiYDtjjL57o+w.1",
      "trouter-request": "{\"id\":\"b69dabbd-21c0-4dfa-9164-b495d9e8298a\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"controlVideoStreaming\":{\"sequenceNumber\":3,\"globalTimeStamp\":\"11/14/2025 8:17:01 PM\",\"controlInfo\":[{\"control\":0,\"sourceId\":415,\"fmtParams\":\"KeyFrame=0;max-br=910;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1203;profile-level-id=42C02A;packetization-mode=1\",\"fmtParamsList\":[\"KeyFrame=0;max-br=910;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1203;profile-level-id=42C02A;packetization-mode=1\"]}]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "controlVideoStreaming": {
        "sequenceNumber": 3,
        "globalTimeStamp": "11/14/2025 8:17:01 PM",
        "controlInfo": [
          {
            "control": 0,
            "sourceId": 415,
            "fmtParams": "KeyFrame=0;max-br=910;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1203;profile-level-id=42C02A;packetization-mode=1",
            "fmtParamsList": [
              "KeyFrame=0;max-br=910;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1203;profile-level-id=42C02A;packetization-mode=1"
            ]
          }
        ]
      },
      "debugContent": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 240400073,
    "status": 200,
    "headers": {
      "MS-CV": "XkBPJSsdKUiYDtjjL57o+w.1.0",
      "trouter-request": "{\"id\":\"b69dabbd-21c0-4dfa-9164-b495d9e8298a\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "trouter-client": "{\"cd\":0}"
    },
    "body": ""
  }
  ```
- send: `5:19+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::19+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 240400364,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/3e7b64c2/call/controlVideoStreaming/",
    "headers": {
      "Content-Length": "515",
      "Content-Type": "application/vnd.skype.mc.v2.0+json",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "3c847ac4-d841-4116-b128-6e427a898583",
      "X-Microsoft-Skype-Message-ID": "d9408436-dede-45a5-84c4-88879d027176",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "traceparent": "00-4e32da8c4172df28b606f83f05dcd04e-ad39d22e96d3d57a-00",
      "MS-CV": "/P9t2yjFYEKWwz2qEjDv7A.1",
      "trouter-request": "{\"id\":\"75888edb-904f-496e-a2af-c00de1df823f\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"controlVideoStreaming\":{\"sequenceNumber\":4,\"globalTimeStamp\":\"11/14/2025 8:17:02 PM\",\"controlInfo\":[{\"control\":0,\"sourceId\":415,\"fmtParams\":\"KeyFrame=0;max-br=955;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1203;profile-level-id=42C02A;packetization-mode=1\",\"fmtParamsList\":[\"KeyFrame=0;max-br=955;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1203;profile-level-id=42C02A;packetization-mode=1\"]}]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "controlVideoStreaming": {
        "sequenceNumber": 4,
        "globalTimeStamp": "11/14/2025 8:17:02 PM",
        "controlInfo": [
          {
            "control": 0,
            "sourceId": 415,
            "fmtParams": "KeyFrame=0;max-br=955;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1203;profile-level-id=42C02A;packetization-mode=1",
            "fmtParamsList": [
              "KeyFrame=0;max-br=955;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1203;profile-level-id=42C02A;packetization-mode=1"
            ]
          }
        ]
      },
      "debugContent": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 240400364,
    "status": 200,
    "headers": {
      "MS-CV": "/P9t2yjFYEKWwz2qEjDv7A.1.0",
      "trouter-request": "{\"id\":\"75888edb-904f-496e-a2af-c00de1df823f\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "trouter-client": "{\"cd\":0}"
    },
    "body": ""
  }
  ```
- send: `5:20+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `3:::`
  ```json
  {
    "id": -2065975451,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/3e7b64c2/call/controlVideoStreaming/",
    "headers": {
      "Content-Length": "517",
      "Content-Type": "application/vnd.skype.mc.v2.0+json",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "3a3a21ea-b527-4da4-93f8-ab595843076f",
      "X-Microsoft-Skype-Message-ID": "009290b8-3239-4858-9351-6f1e2985818e",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "traceparent": "00-a07bf506c960c57da14bb151d83592b7-7d228e93da75066f-00",
      "MS-CV": "sZW6YmftJ0S5HfWdBF7XWw.1",
      "trouter-request": "{\"id\":\"c7dfc72a-684f-47b1-9fac-32c9b0c13188\",\"src\":\"10.128.111.83\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"controlVideoStreaming\":{\"sequenceNumber\":5,\"globalTimeStamp\":\"11/14/2025 8:17:03 PM\",\"controlInfo\":[{\"control\":0,\"sourceId\":415,\"fmtParams\":\"KeyFrame=0;max-br=1219;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1092;profile-level-id=42C02A;packetization-mode=1\",\"fmtParamsList\":[\"KeyFrame=0;max-br=1219;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1092;profile-level-id=42C02A;packetization-mode=1\"]}]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "controlVideoStreaming": {
        "sequenceNumber": 5,
        "globalTimeStamp": "11/14/2025 8:17:03 PM",
        "controlInfo": [
          {
            "control": 0,
            "sourceId": 415,
            "fmtParams": "KeyFrame=0;max-br=1219;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1092;profile-level-id=42C02A;packetization-mode=1",
            "fmtParamsList": [
              "KeyFrame=0;max-br=1219;max-fps=3000.000000;max-fs=3600;max-mbps=108000;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1092;profile-level-id=42C02A;packetization-mode=1"
            ]
          }
        ]
      },
      "debugContent": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2065975451,
    "status": 200,
    "headers": {
      "MS-CV": "sZW6YmftJ0S5HfWdBF7XWw.1.0",
      "trouter-request": "{\"id\":\"c7dfc72a-684f-47b1-9fac-32c9b0c13188\",\"src\":\"10.128.111.83\",\"port\":3443}",
      "trouter-client": "{\"cd\":5}"
    },
    "body": ""
  }
  ```
- receive: `6:::20+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 240400909,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/3e7b64c2/call/controlVideoStreaming/",
    "headers": {
      "Content-Length": "515",
      "Content-Type": "application/vnd.skype.mc.v2.0+json",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "Trouter-Timeout": "12297",
      "X-Microsoft-Skype-Original-Message-ID": "90d461d1-a903-4724-bff8-910d3147cb5a",
      "X-Microsoft-Skype-Message-ID": "401e5df8-01a0-4a32-a125-cc8a38ba8c47",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "traceparent": "00-ae9bdfe65eca80fd3e1bd4f58e121423-696edb8d84abd190-00",
      "MS-CV": "6o0zFgJA2E+hgIrr2OFtjA.1",
      "trouter-request": "{\"id\":\"8590600c-aa4d-4207-87f9-cc5eb5997c3a\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "Trouter-TimeoutMs": "12797"
    },
    "body": "{\"controlVideoStreaming\":{\"sequenceNumber\":6,\"globalTimeStamp\":\"11/14/2025 8:17:05 PM\",\"controlInfo\":[{\"control\":0,\"sourceId\":415,\"fmtParams\":\"KeyFrame=1;max-br=1477;max-fps=3000.000000;max-fs=2040;max-mbps=61200;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1092;profile-level-id=42C02A;packetization-mode=1\",\"fmtParamsList\":[\"KeyFrame=1;max-br=1477;max-fps=3000.000000;max-fs=2040;max-mbps=61200;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1092;profile-level-id=42C02A;packetization-mode=1\"]}]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "controlVideoStreaming": {
        "sequenceNumber": 6,
        "globalTimeStamp": "11/14/2025 8:17:05 PM",
        "controlInfo": [
          {
            "control": 0,
            "sourceId": 415,
            "fmtParams": "KeyFrame=1;max-br=1477;max-fps=3000.000000;max-fs=2040;max-mbps=61200;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1092;profile-level-id=42C02A;packetization-mode=1",
            "fmtParamsList": [
              "KeyFrame=1;max-br=1477;max-fps=3000.000000;max-fs=2040;max-mbps=61200;rid=1;ssrc=1070193489;vla-debug=1280x720@15x1092;profile-level-id=42C02A;packetization-mode=1"
            ]
          }
        ]
      },
      "debugContent": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 240400909,
    "status": 200,
    "headers": {
      "MS-CV": "6o0zFgJA2E+hgIrr2OFtjA.1.0",
      "trouter-request": "{\"id\":\"8590600c-aa4d-4207-87f9-cc5eb5997c3a\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "trouter-client": "{\"cd\":2}"
    },
    "body": ""
  }
  ```
- send: `5:21+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::21+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 240402702,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/3e7b64c2/call/controlVideoStreaming/",
    "headers": {
      "Content-Length": "513",
      "Content-Type": "application/vnd.skype.mc.v2.0+json",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "Trouter-Timeout": "12297",
      "X-Microsoft-Skype-Original-Message-ID": "96d03b6a-10ab-4cad-bceb-b8dc4bf38c74",
      "X-Microsoft-Skype-Message-ID": "e11fc5a0-6426-48ff-bd5d-65ce4047010b",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "traceparent": "00-b4a8882c99a67e54d22070e6a3b878fa-8e5b6d17d9e84ba2-00",
      "MS-CV": "EbtkbtpWW0iooNhYGfWvNQ.1",
      "trouter-request": "{\"id\":\"0e6189cb-62a6-439f-a411-06187d865863\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "Trouter-TimeoutMs": "12797"
    },
    "body": "{\"controlVideoStreaming\":{\"sequenceNumber\":7,\"globalTimeStamp\":\"11/14/2025 8:17:11 PM\",\"controlInfo\":[{\"control\":0,\"sourceId\":415,\"fmtParams\":\"KeyFrame=0;max-br=1666;max-fps=3000.000000;max-fs=2040;max-mbps=61200;rid=1;ssrc=1070193489;vla-debug=960x540@15x1772;profile-level-id=42C02A;packetization-mode=1\",\"fmtParamsList\":[\"KeyFrame=0;max-br=1666;max-fps=3000.000000;max-fs=2040;max-mbps=61200;rid=1;ssrc=1070193489;vla-debug=960x540@15x1772;profile-level-id=42C02A;packetization-mode=1\"]}]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "controlVideoStreaming": {
        "sequenceNumber": 7,
        "globalTimeStamp": "11/14/2025 8:17:11 PM",
        "controlInfo": [
          {
            "control": 0,
            "sourceId": 415,
            "fmtParams": "KeyFrame=0;max-br=1666;max-fps=3000.000000;max-fs=2040;max-mbps=61200;rid=1;ssrc=1070193489;vla-debug=960x540@15x1772;profile-level-id=42C02A;packetization-mode=1",
            "fmtParamsList": [
              "KeyFrame=0;max-br=1666;max-fps=3000.000000;max-fs=2040;max-mbps=61200;rid=1;ssrc=1070193489;vla-debug=960x540@15x1772;profile-level-id=42C02A;packetization-mode=1"
            ]
          }
        ]
      },
      "debugContent": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 240402702,
    "status": 200,
    "headers": {
      "MS-CV": "EbtkbtpWW0iooNhYGfWvNQ.1.0",
      "trouter-request": "{\"id\":\"0e6189cb-62a6-439f-a411-06187d865863\",\"src\":\"10.129.74.195\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
  }
  ```
- send: `5:22+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::22+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": -2042694128,
    "method": "POST",
    "url": "/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/dc2fceac/call/end/",
    "headers": {
      "Content-Length": "403",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "User-Agent": "CallController/2.47.4557.0",
      "X-Microsoft-Skype-Chain-ID": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "X-Microsoft-Skype-Tenant-Id": "99999999-9999-9999-9999-999999999999",
      "X-Microsoft-Skype-Client": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "4dfa62dd-c912-4a00-86d5-d6e9b28dd2c5",
      "X-Microsoft-Skype-Message-ID": "c67ca9f2-ba39-43cb-af8e-44c1600d5bbf",
      "traceparent": "00-24bfbddbd42db2e1450085f4b7f309e2-90f1d47aa69852ce-00",
      "MS-CV": "YGjkjIb7KkGGevvm5dJC7Q.1",
      "trouter-request": "{\"id\":\"75d2aec6-7705-4cf4-ad42-33fa8fdb590c\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"callEnd\":{\"reason\":\"noError\",\"sender\":{\"id\":\"8:teamsvisitor:7652096e9b61413696f1fe2c756c8759\",\"displayName\":\"Neil Rashbrook\",\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"languageId\":null,\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"hidden\":false,\"propertyBag\":null},\"code\":0,\"subCode\":0,\"phrase\":\"CallEndReasonLocalUserInitiated\",\"resultCategories\":[\"Success\"]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "callEnd": {
        "reason": "noError",
        "sender": {
          "id": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
          "displayName": "Neil Rashbrook",
          "endpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
          "languageId": null,
          "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
          "hidden": false,
          "propertyBag": null
        },
        "code": 0,
        "subCode": 0,
        "phrase": "CallEndReasonLocalUserInitiated",
        "resultCategories": [
          "Success"
        ]
      },
      "debugContent": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2042694128,
    "status": 404,
    "headers": {
      "MS-CV": "YGjkjIb7KkGGevvm5dJC7Q.1.0",
      "trouter-request": "{\"id\":\"75d2aec6-7705-4cf4-ad42-33fa8fdb590c\",\"src\":\"10.128.46.41\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
  }
  ```
- send: `5:23+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::23+`
  ```json
  [
    "pong"
  ]
  ```
- send: `5:24+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::24+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `1::`
- receive: `5:1::`
  ```json
  {
    "name": "trouter.connected",
    "args": [
      {
        "ttl": 551040,
        "dur": "1"
      }
    ]
  }
  ```
- send: `5:1+::`
  ```json
  {
    "name": "user.activity",
    "args": [
      {
        "state": "active",
        "cv": "SuoXPAa56QgJGmJPwB4Rlg.2"
      }
    ]
  }
  ```
- receive: `5:2::`
  ```json
  {
    "name": "trouter.message_loss",
    "args": [
      {
        "droppedIndicators": [
          {
            "tag": "",
            "etag": "2025-11-14T20:17:07.1226645Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-14T20:17:07.1227080Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-14T20:17:07.1227166Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-14T20:17:07.1227219Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-14T20:17:07.1227284Z"
          }
        ]
      }
    ]
  }
  ```
- receive: `5:3::`
  ```json
  {
    "name": "trouter.message_loss",
    "args": [
      {
        "droppedIndicators": [
          {
            "tag": "",
            "etag": "2025-11-14T20:17:07.1226645Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-14T20:17:07.1227080Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-14T20:17:07.1227166Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-14T20:17:07.1227219Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-14T20:17:07.1227284Z"
          }
        ]
      }
    ]
  }
  ```
- receive: `6:::1+`
  ```json
  []
  ```
- send: `5:2+::`
  ```json
  {
    "name": "trouter.processed_message_loss",
    "args": [
      {
        "droppedIndicators": [
          {
            "tag": "",
            "etag": "2025-11-14T20:17:07.1226645Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-14T20:17:07.1227080Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-14T20:17:07.1227166Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-14T20:17:07.1227219Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-14T20:17:07.1227284Z"
          }
        ]
      }
    ]
  }
  ```
- send: `5:3+::`
  ```json
  {
    "name": "trouter.processed_message_loss",
    "args": [
      {
        "droppedIndicators": [
          {
            "tag": "",
            "etag": "2025-11-14T20:17:07.1226645Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-14T20:17:07.1227080Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-14T20:17:07.1227166Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-14T20:17:07.1227219Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-14T20:17:07.1227284Z"
          }
        ]
      }
    ]
  }
  ```
- receive: `6:::2+`
  ```json
  []
  ```
- receive: `6:::3+`
  ```json
  []
  ```
- send: `5:4+::`
  ```json
  {
    "name": "user.activity",
    "args": [
      {
        "state": "active",
        "cv": "SuoXPAa56QgJGmJPwB4Rlg.3"
      }
    ]
  }
  ```
- receive: `6:::4+`
  ```json
  []
  ```
- receive: `3:::`
  ```json
  {
    "id": 1388932250,
    "method": "POST",
    "url": "/v4/f/pGhn0N5INkuIrCMF3fSVCw/messaging",
    "headers": {
      "Accept-Encoding": "gzip, deflate, br",
      "Trouter-Timeout": "117049",
      "Content-Length": "1284",
      "Content-Type": "text/xml",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "User-Agent": "Skype-NotificationHub/1.0.0-25.11.10.5+96aeae78c4e87a04dbd4046a5ec98b3ce3cd60d7 (North Europe)",
      "X-Trouter-Delivery-Control": "async; ttl=900; flow=messaging; prio=normal",
      "X-Microsoft-Skype-Message-ID": "b956241f-5ef6-406e-b799-880779ebf875",
      "MS-CV": "wdaLFxwsFUiI9JZU70XBOA.1.1.1.986802776.1.2.2.1.986830345.1.2.0.1.1",
      "traceparent": "00-ffe32c71ac3a003c7671d3659df822b2-40a5e7b899cb9670-01",
      "trouter-request": "{\"id\":\"afd41e6f-8cd5-4739-bbfc-e2ca63686ca2\",\"src\":\"10.128.0.162\",\"port\":3443}",
      "Trouter-TimeoutMs": "117549"
    },
    "body": "{\"time\":\"2025-11-14T20:17:22.5756197Z\",\"type\":\"EventMessage\",\"resourceLink\":\"https://notifications.skype.net/v1/users/ME/conversations/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2/messages/1763151436795\",\"resourceType\":\"NewMessage\",\"resource\":{\"clientmessageid\":null,\"content\":\"{\\\"eventtime\\\":1763151442537,\\\"initiator\\\":\\\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"members\\\":[{\\\"id\\\":\\\"8:teamsvisitor:7652096e9b61413696f1fe2c756c8759\\\",\\\"friendlyname\\\":\\\"Neil Rashbrook\\\"}]}\",\"from\":\"https://notifications.skype.net/v1/users/ME/contacts/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"imdisplayname\":null,\"prioritizeimdisplayname\":null,\"id\":\"1763151436795\",\"messagetype\":\"ThreadActivity/MemberLeft\",\"originalarrivaltime\":\"2025-11-14T20:17:16.7950000Z\",\"properties\":{\"importance\":\"\",\"subject\":\"\"},\"sequenceId\":6,\"version\":\"1763151436795\",\"composetime\":\"2025-11-14T20:17:16.7950000Z\",\"type\":\"Message\",\"conversationLink\":\"https://notifications.skype.net/v1/users/ME/conversations/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"to\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"threadtype\":\"meeting\",\"isactive\":false,\"threadtopic\":\"Join URL\",\"inQuarantine\":false},\"isactive\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "time": "2025-11-14T20:17:22.5756197Z",
      "type": "EventMessage",
      "resourceLink": "https://notifications.skype.net/v1/users/ME/conversations/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2/messages/1763151436795",
      "resourceType": "NewMessage",
      "resource": {
        "clientmessageid": null,
        "content": "{\"eventtime\":1763151442537,\"initiator\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"members\":[{\"id\":\"8:teamsvisitor:7652096e9b61413696f1fe2c756c8759\",\"friendlyname\":\"Neil Rashbrook\"}]}",
        "from": "https://notifications.skype.net/v1/users/ME/contacts/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "imdisplayname": null,
        "prioritizeimdisplayname": null,
        "id": "1763151436795",
        "messagetype": "ThreadActivity/MemberLeft",
        "originalarrivaltime": "2025-11-14T20:17:16.7950000Z",
        "properties": {
          "importance": "",
          "subject": ""
        },
        "sequenceId": 6,
        "version": "1763151436795",
        "composetime": "2025-11-14T20:17:16.7950000Z",
        "type": "Message",
        "conversationLink": "https://notifications.skype.net/v1/users/ME/conversations/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "to": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "threadtype": "meeting",
        "isactive": false,
        "threadtopic": "Join URL",
        "inQuarantine": false
      },
      "isactive": true
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1388932250,
    "status": 200,
    "headers": {
      "MS-CV": "wdaLFxwsFUiI9JZU70XBOA.1.1.1.986802776.1.2.2.1.986830345.1.2.0.1.1.0",
      "trouter-request": "{\"id\":\"afd41e6f-8cd5-4739-bbfc-e2ca63686ca2\",\"src\":\"10.128.0.162\",\"port\":3443}",
      "trouter-client": "{\"cd\":18}"
    },
    "body": ""
  }
  ```
- send: `5:5+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `3:::`
  ```json
  {
    "id": 581432625,
    "method": "POST",
    "url": "/v4/f/pGhn0N5INkuIrCMF3fSVCw/messaging",
    "headers": {
      "Accept-Encoding": "gzip, deflate, br",
      "Trouter-Timeout": "117048",
      "Content-Length": "3226",
      "Content-Type": "text/xml",
      "Host": "pub-ent-sece-11-t.trouter.teams.microsoft.com",
      "User-Agent": "Skype-NotificationHub/1.0.0-25.11.10.5+96aeae78c4e87a04dbd4046a5ec98b3ce3cd60d7 (West Europe)",
      "X-Trouter-Delivery-Control": "async; ttl=900; flow=messaging; prio=normal",
      "X-Microsoft-Skype-Message-ID": "3b320319-cecf-4e28-8cec-fd47cc437626",
      "MS-CV": "wdaLFxwsFUiI9JZU70XBOA.1.1.1.986802776.1.2.1.1.986817409.1.1.0.1.1",
      "traceparent": "00-e417cf464c16011768f5dd558a49123b-77fffb37ac817754-00",
      "trouter-request": "{\"id\":\"91c620c5-2bca-4e98-9818-761929482c26\",\"src\":\"10.128.139.57\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548"
    },
    "body": "{\"time\":\"2025-11-14T20:17:22.5546202Z\",\"type\":\"EventMessage\",\"resourceType\":\"ThreadUpdate\",\"resource\":{\"id\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"messages\":\"https://notifications.skype.net/v1/users/ME/conversations/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2/messages\",\"version\":1763151436795,\"type\":\"Thread\",\"properties\":{\"meeting\":\"{\\\"subject\\\":\\\"Join URL\\\",\\\"startTime\\\":\\\"2025-11-14T20:15:00Z\\\",\\\"location\\\":\\\"Microsoft Teams Meeting\\\",\\\"endTime\\\":\\\"2025-11-14T20:30:00Z\\\",\\\"exchangeId\\\":null,\\\"iCalUid\\\":\\\"040000008200E00074C5B7101A82E0080000000072A50B2CA355DC01000000000000000010000000E1BEE7FF021EDF42B3A330E714CBA3F1\\\",\\\"isCancelled\\\":false,\\\"meetingType\\\":\\\"Scheduled\\\",\\\"yammerQNAEnabled\\\":null,\\\"scenario\\\":null,\\\"eventRecurrenceRange\\\":null,\\\"eventRecurrencePattern\\\":null,\\\"eventType\\\":null,\\\"attendeeSupport\\\":null,\\\"organizerId\\\":\\\"50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"tenantId\\\":\\\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\\\",\\\"meetingData\\\":null,\\\"meetingJoinUrl\\\":\\\"https://teams.microsoft.com/l/meetup-join/19%3ameeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl%40thread.v2/0?context=%7b%22Tid%22%3a%22338de7e8-b10a-4a7c-aeb4-4cdf726fc818%22%2c%22Oid%22%3a%2250a17a93-7e33-44f1-baef-8f234457f3e7%22%7d\\\",\\\"isCopyRestrictionEnforced\\\":false,\\\"templateDetails\\\":null,\\\"messagingPolicy\\\":null,\\\"groupCopilotDetails\\\":{\\\"enabled\\\":false,\\\"liveNotesEnabled\\\":false},\\\"exchangeDetails\\\":null,\\\"lobbyThreadId\\\":null,\\\"backroomThreadId\\\":null,\\\"meetingSpokenLanguage\\\":null,\\\"maxEventCapacity\\\":null,\\\"mcoIdentifier\\\":null,\\\"networkId\\\":null}\",\"hidden\":\"false\",\"partnerName\":\"concore_gvc\",\"isMigrated\":true,\"topic\":\"Join URL\",\"awareness_conversationLiveState:0\":\"{\\\"conversationUrl\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687\\\",\\\"conversationId\\\":\\\"056391c5-feb6-4960-9209-36d8c0fc1be5\\\",\\\"groupCallInitiator\\\":\\\"8:teamsvisitor:7652096e9b61413696f1fe2c756c8759\\\",\\\"expiration\\\":1763158561,\\\"status\\\":\\\"Active\\\",\\\"callStartTime\\\":\\\"2025-11-14T20:15:26.3213066Z\\\",\\\"conversationType\\\":\\\"scheduledMeeting\\\",\\\"isHostless\\\":true,\\\"meetingInfo\\\":{\\\"organizerId\\\":\\\"50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"tenantId\\\":\\\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\\\",\\\"isBroadcast\\\":false},\\\"meetingData\\\":{\\\"meetingCode\\\":\\\"39563371502184\\\",\\\"passcode\\\":\\\"5gb7bf7j\\\"},\\\"iCalUid\\\":\\\"040000008200E00074C5B7101A82E0080000000072A50B2CA355DC01000000000000000010000000E1BEE7FF021EDF42B3A330E714CBA3F1\\\",\\\"wasInitiatorInLobby\\\":true}\",\"ongoingCallChatEnforcement\":\"true\",\"createdat\":\"1763151215657\",\"creator\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"historydisclosed\":\"false\",\"threadType\":\"meeting\",\"tenantid\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\",\"gapDetectionEnabled\":\"True\",\"threadSubType\":null},\"rosterVersion\":1763151436795,\"members\":[{\"alerts\":\"true\",\"id\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"secondaryId\":null,\"role\":\"Admin\"},{\"meetingInfo\":\"{\\\"rsvpStatus\\\":\\\"None\\\"}\",\"id\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"secondaryId\":null,\"role\":\"Admin\",\"shareHistoryTime\":1763151223578}],\"inQuarantine\":false},\"isactive\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "time": "2025-11-14T20:17:22.5546202Z",
      "type": "EventMessage",
      "resourceType": "ThreadUpdate",
      "resource": {
        "id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "messages": "https://notifications.skype.net/v1/users/ME/conversations/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2/messages",
        "version": 1763151436795,
        "type": "Thread",
        "properties": {
          "meeting": "{\"subject\":\"Join URL\",\"startTime\":\"2025-11-14T20:15:00Z\",\"location\":\"Microsoft Teams Meeting\",\"endTime\":\"2025-11-14T20:30:00Z\",\"exchangeId\":null,\"iCalUid\":\"040000008200E00074C5B7101A82E0080000000072A50B2CA355DC01000000000000000010000000E1BEE7FF021EDF42B3A330E714CBA3F1\",\"isCancelled\":false,\"meetingType\":\"Scheduled\",\"yammerQNAEnabled\":null,\"scenario\":null,\"eventRecurrenceRange\":null,\"eventRecurrencePattern\":null,\"eventType\":null,\"attendeeSupport\":null,\"organizerId\":\"50a17a93-7e33-44f1-baef-8f234457f3e7\",\"tenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\",\"meetingData\":null,\"meetingJoinUrl\":\"https://teams.microsoft.com/l/meetup-join/19%3ameeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl%40thread.v2/0?context=%7b%22Tid%22%3a%22338de7e8-b10a-4a7c-aeb4-4cdf726fc818%22%2c%22Oid%22%3a%2250a17a93-7e33-44f1-baef-8f234457f3e7%22%7d\",\"isCopyRestrictionEnforced\":false,\"templateDetails\":null,\"messagingPolicy\":null,\"groupCopilotDetails\":{\"enabled\":false,\"liveNotesEnabled\":false},\"exchangeDetails\":null,\"lobbyThreadId\":null,\"backroomThreadId\":null,\"meetingSpokenLanguage\":null,\"maxEventCapacity\":null,\"mcoIdentifier\":null,\"networkId\":null}",
          "hidden": "false",
          "partnerName": "concore_gvc",
          "isMigrated": true,
          "topic": "Join URL",
          "awareness_conversationLiveState:0": "{\"conversationUrl\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687\",\"conversationId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"groupCallInitiator\":\"8:teamsvisitor:7652096e9b61413696f1fe2c756c8759\",\"expiration\":1763158561,\"status\":\"Active\",\"callStartTime\":\"2025-11-14T20:15:26.3213066Z\",\"conversationType\":\"scheduledMeeting\",\"isHostless\":true,\"meetingInfo\":{\"organizerId\":\"50a17a93-7e33-44f1-baef-8f234457f3e7\",\"tenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\",\"isBroadcast\":false},\"meetingData\":{\"meetingCode\":\"39563371502184\",\"passcode\":\"5gb7bf7j\"},\"iCalUid\":\"040000008200E00074C5B7101A82E0080000000072A50B2CA355DC01000000000000000010000000E1BEE7FF021EDF42B3A330E714CBA3F1\",\"wasInitiatorInLobby\":true}",
          "ongoingCallChatEnforcement": "true",
          "createdat": "1763151215657",
          "creator": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "historydisclosed": "false",
          "threadType": "meeting",
          "tenantid": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
          "gapDetectionEnabled": "True",
          "threadSubType": null
        },
        "rosterVersion": 1763151436795,
        "members": [
          {
            "alerts": "true",
            "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
            "secondaryId": null,
            "role": "Admin"
          },
          {
            "meetingInfo": "{\"rsvpStatus\":\"None\"}",
            "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
            "secondaryId": null,
            "role": "Admin",
            "shareHistoryTime": 1763151223578
          }
        ],
        "inQuarantine": false
      },
      "isactive": true
    }
    ```
    - `meeting`:
      ```json
      {
        "subject": "Join URL",
        "startTime": "2025-11-14T20:15:00Z",
        "location": "Microsoft Teams Meeting",
        "endTime": "2025-11-14T20:30:00Z",
        "exchangeId": null,
        "iCalUid": "040000008200E00074C5B7101A82E0080000000072A50B2CA355DC01000000000000000010000000E1BEE7FF021EDF42B3A330E714CBA3F1",
        "isCancelled": false,
        "meetingType": "Scheduled",
        "yammerQNAEnabled": null,
        "scenario": null,
        "eventRecurrenceRange": null,
        "eventRecurrencePattern": null,
        "eventType": null,
        "attendeeSupport": null,
        "organizerId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
        "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "meetingData": null,
        "meetingJoinUrl": "https://teams.microsoft.com/l/meetup-join/19%3ameeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl%40thread.v2/0?context=%7b%22Tid%22%3a%22338de7e8-b10a-4a7c-aeb4-4cdf726fc818%22%2c%22Oid%22%3a%2250a17a93-7e33-44f1-baef-8f234457f3e7%22%7d",
        "isCopyRestrictionEnforced": false,
        "templateDetails": null,
        "messagingPolicy": null,
        "groupCopilotDetails": {
          "enabled": false,
          "liveNotesEnabled": false
        },
        "exchangeDetails": null,
        "lobbyThreadId": null,
        "backroomThreadId": null,
        "meetingSpokenLanguage": null,
        "maxEventCapacity": null,
        "mcoIdentifier": null,
        "networkId": null
      }
      ```
- send: `3:::`
  ```json
  {
    "id": 581432625,
    "status": 200,
    "headers": {
      "MS-CV": "wdaLFxwsFUiI9JZU70XBOA.1.1.1.986802776.1.2.1.1.986817409.1.1.0.1.1.0",
      "trouter-request": "{\"id\":\"91c620c5-2bca-4e98-9818-761929482c26\",\"src\":\"10.128.139.57\",\"port\":3443}",
      "trouter-client": "{\"cd\":2}"
    },
    "body": ""
  }
  ```
- receive: `6:::5+`
  ```json
  [
    "pong"
  ]
  ```
- send: `5:6+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::6+`
  ```json
  [
    "pong"
  ]
  ```

### Socket 2: `wss://emea.pptservicescast.officeapps.live.com/StateServiceHandler.ashx`

Query string parameters:
- `docId`=`call_056391c5-feb6-4960-9209-36d8c0fc1be5`
- `clientType`=`Teams`
- `cid`=`1c48806a-aea1-4261-83b8-6160766362eb`
- `routing`=`true`
- `clientId`=`ae704c8a-1663-4f08-8798-af1543ca2a24`

The following messages occurred in that session:
- send:
  ```json
  {
    "messageId": "b1e8a90a-8eb2-4add-9982-82bdcf055db9",
    "senderId": "ae704c8a-1663-4f08-8798-af1543ca2a24",
    "objectId": "config",
    "type": "",
    "operation": "",
    "value": "{\"authorization\":\"eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxOUQzMTYyMzQ0RTQ4REEwNUU1OUQxMzYwNkYwQkFDRjU4QTQwRUMiLCJ4NXQiOiJBWjB4WWpST1NOb0Y1WjBUWUc4THJQV0tRT3ciLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3NjMxNTEzMjMsImV4cCI6MTc2MzIzNzcyMywic2t5cGVpZCI6InRlYW1zdmlzaXRvcjo3NjUyMDk2ZTliNjE0MTM2OTZmMWZlMmM3NTZjODc1OSIsInNjcCI6NzgwLCJjc2kiOiIxNzYzMTUxMzIzIiwicmduIjoiZW1lYSJ9.VY8ocO7ztPxy7WmZAtyTAbZr_WO5GR-V0NUPz-kOsDAWnOzNa6oq9EsxILsTjPHLR1EgMlyCnIDQAnyD0iR4pjjrHxYLRQQ5WWIwPJSAFJqQugRnQU-VWt87F_1gydp_KPhimqIesjzBE6IMdt7SywjNMm8LkW4bzBC8uN-sPTM8tNHlEjj0zik06R_kIRndjVHglCkFB4j4UbyDresXxp-gx2uz55sfJf1mMlL8gkYeLieTa3sZ-X6hCLoKe2t8RFy_ivgAUhcbf_6FtAn86uXB-VQZi0g5LhCpdzx002dGQh_xsAnu09z45Zrd66RpCrh2uAc4poobdsbrLJewpA\",\"authProvider\":\"SKYPE\",\"mri\":\"8:teamsvisitor:7652096e9b61413696f1fe2c756c8759\",\"huid\":\"\",\"metadata\":\"{\\\"platform\\\":\\\"windows\\\",\\\"osVersion\\\":\\\"NT 10.0\\\",\\\"ring\\\":\\\"general\\\",\\\"version\\\":\\\"1415/25110306401\\\",\\\"tenantId\\\":\\\"\\\"}\"}"
  }
  ```
  - `value`:
    ```json
    {
      "authorization": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxOUQzMTYyMzQ0RTQ4REEwNUU1OUQxMzYwNkYwQkFDRjU4QTQwRUMiLCJ4NXQiOiJBWjB4WWpST1NOb0Y1WjBUWUc4THJQV0tRT3ciLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3NjMxNTEzMjMsImV4cCI6MTc2MzIzNzcyMywic2t5cGVpZCI6InRlYW1zdmlzaXRvcjo3NjUyMDk2ZTliNjE0MTM2OTZmMWZlMmM3NTZjODc1OSIsInNjcCI6NzgwLCJjc2kiOiIxNzYzMTUxMzIzIiwicmduIjoiZW1lYSJ9.VY8ocO7ztPxy7WmZAtyTAbZr_WO5GR-V0NUPz-kOsDAWnOzNa6oq9EsxILsTjPHLR1EgMlyCnIDQAnyD0iR4pjjrHxYLRQQ5WWIwPJSAFJqQugRnQU-VWt87F_1gydp_KPhimqIesjzBE6IMdt7SywjNMm8LkW4bzBC8uN-sPTM8tNHlEjj0zik06R_kIRndjVHglCkFB4j4UbyDresXxp-gx2uz55sfJf1mMlL8gkYeLieTa3sZ-X6hCLoKe2t8RFy_ivgAUhcbf_6FtAn86uXB-VQZi0g5LhCpdzx002dGQh_xsAnu09z45Zrd66RpCrh2uAc4poobdsbrLJewpA",
      "authProvider": "SKYPE",
      "mri": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
      "huid": "",
      "metadata": "{\"platform\":\"windows\",\"osVersion\":\"NT 10.0\",\"ring\":\"general\",\"version\":\"1415/25110306401\",\"tenantId\":\"\"}"
    }
    ```
    - `metadata`:
      ```json
      {
        "platform": "windows",
        "osVersion": "NT 10.0",
        "ring": "general",
        "version": "1415/25110306401",
        "tenantId": ""
      }
      ```
- send: `__ping__`
- receive: `__pong__`
- send: `__ping__`
- receive: `__pong__`
- send: `__ping__`
- receive: `__pong__`

### Socket 3: `wss://augloop.office.com/`

This socket has no query string parameters. The following messages occurred in the above session:
- send: `~`
- send:
  ```json
  {
    "protocolVersion": 2,
    "clientMetadata": {
      "appName": "Teams",
      "appPlatform": "Web",
      "uiLanguage": "en-gb",
      "flights": "Microsoft.Teams.Augloop.AllowPartialResults:true;Microsoft.Teams.Augloop.DefaultModelOverride:GPT41_ShortCo_0414;Microsoft.Teams.Augloop.FLIGHT_OMNI_MIGRATION:true;Microsoft.Teams.Augloop.ForceCallFlux:false;Microsoft.Office.WordOnline.Augloop.EnableEditorAiPreview:true;Microsoft.Teams.Augloop.EnableMeetingSydneyNativeQnASkill:true;Microsoft.Teams.Augloop.EnableMeetingCopilotHistory:true;Microsoft.Office.SharedOnline.Augloop.Copilot.EnableSydneyErrorDetails:true;Microsoft.Teams.Augloop.EnableMeetingCopilotOptimizedStreaming:true;Microsoft.Office.AugLoop.AnnotationsOrderingEnabled:true;Microsoft.Teams.Augloop.IgnoreByDesignSydneyErrors:true;_acceptsClaimsChallengeMessages;_acceptsSeedingStatusChangeMessages",
      "releaseAudienceGroup": "Dogfood",
      "releaseChannel": "general",
      "sessionId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
      "runtimeVersion": "2.35.2213",
      "docSessionId": "1a6bf9f7-44b0-423b-b40d-7476a8599529",
      "userSystemTimezone": "Europe/London"
    },
    "extensionConfigs": [],
    "returnWorkflowInputTypes": true,
    "enableRemoteExecutionNotification": false,
    "H_": {
      "T_": "AugLoop_Session_Protocol_SessionInitMessage",
      "B_": [
        "AugLoop_Session_Protocol_Message"
      ]
    },
    "cv": "nvG1r3cUdtsw0349SzLxea.1",
    "messageId": "c1"
  }
  ```
- receive: `~`
- receive:
  ```json
  {
    "sessionUrlBase": "https://northeurope-pa01.augloop.office.com/v2/session",
    "sliceUrl": "wss://northeurope-pa01.augloop.office.com/v2/?x-origin=A1134EDEC66F7CF089E6CFB5E6A453BAF48152922EA6A699FC9B8EC3262A1978",
    "sessionKey": "f674d8d5-1c63-467f-a2df-552ccff275f7",
    "origin": "A1134EDEC66F7CF089E6CFB5E6A453BAF48152922EA6A699FC9B8EC3262A1978",
    "messageId": "c1",
    "routingSessionKey": "cHJvZF9ub3J0aGV1cm9wZS1wYTAxLkExMTM0RURFQzY2RjdDRjA4OUU2Q0ZCNUU2QTQ1M0JBRjQ4MTUyOTIyRUE2QTY5OUZDOUI4RUMzMjYyQTE5NzguZjY3NGQ4ZDUtMWM2My00NjdmLWEyZGYtNTUyY2NmZjI3NWY3",
    "forceReconnect": false,
    "workflowInputTypes": [
      "AugLoop_Core_GridCell",
      "AugLoop_Core_Document",
      "AugLoop_Automatic_Clp_SensitiveItemAnnotation",
      "AugLoop_Image_ImageTestTile",
      "AugLoop_Image_ImageTile",
      "AugLoop_OdspPhotos_OdspPhotosImageGenSignal",
      "AugLoop_TextToSuggestions_TextToSuggestionSignal",
      "AugLoop_TextToImage_TextToImageSignal",
      "AugLoop_TextToIcon_TextToIconSignal",
      "AugLoop_TextToImage_TextToGettyImageSignal",
      "AugLoop_TextToImage_TextToMultiTierImageSignal",
      "AugLoop_TextToImage_TextToImageTraceSignal",
      "AugLoop_TextToIcon_TextToIconTraceSignal",
      "AugLoop_AcsImageTransform_ACSBackgroundRemovalSignal",
      "AugLoop_MultimodalTransformation_MultimodalTransformationSignal",
      "AugLoop_CopilotLicensing_CopilotLicensingAnnotation",
      "AugLoop_DocumentIdentifierProducer_DocumentIdentifierAnnotation",
      "AugLoop_DlpPolicy_DLPContentFilteringAnnotation",
      "AugLoop_AiAssistedTasks_SuggestedTasksHandshakeSignal",
      "AugLoop_AiAssistedTasks_TranscriptMetadataSignal",
      "AugLoop_Text_FormattedTextTile",
      "AugLoop_AiFeedback_OnDemandRewriteSignal",
      "AugLoop_Word_MainSubDocument",
      "AugLoop_AiFeedback_FeedbackRequest",
      "AugLoop_AzureKeyPhrases_AzureKeyPhraseRequest",
      "AugLoop_Text_TextTile",
      "AugLoop_ObservationalAssistance_FlagRequest",
      "AugLoop_ObservationalAssistance_SystemInitiatedRequest",
      "AugLoop_ObservationalAssistance_SessionConfig",
      "AugLoop_CopilotCompose_CopilotComposeSignal",
      "AugLoop_CopilotSharedConversation_CopilotSharedConversationAnnotation",
      "AugLoop_DocumentTextContentGenerator_DocumentTextContentGeneratorStreamedSignal",
      "AugLoop_AiInsert_AiInsertSignal",
      "AugLoop_CopilotCompose_CopilotComposeMultiTurnStreamedSignal",
      "AugLoop_CopilotComposeModelsMetadata_CopilotComposeModelsMetadataSignal",
      "AugLoop_Table_WordTable",
      "AugLoop_Table_TableRow",
      "AugLoop_Table_TableCell",
      "AugLoop_CopilotDocReuse_FormatReuseSignal",
      "AugLoop_CopilotDocReuse_FormatReuseContentGenerationRequest",
      "AugLoop_CopilotDocReuse_FormatReuseBackgroundContentGenerationRequest",
      "AugLoop_CopilotDocReuse_FormatReuseDocUrlGenerationSignal",
      "AugLoop_CopilotDocReuse_FormatReuseSelectionSignal",
      "AugLoop_CopilotDocReuse_FormatReuseSelectionWithHtmlSignal",
      "AugLoop_CopilotDocReuse_FormatReuseEvaluationSignal",
      "AugLoop_FetchImplicitGroundingEntities_ImplicitGroundingSignal",
      "AugLoop_FetchImplicitGroundingEntities_ImplicitGroundingInternalSignal",
      "AugLoop_FetchImplicitGroundingEntities_GeneratePresentationSignal",
      "AugLoop_Copywriter_CopywriterSignal",
      "AugLoop_Copywriter_RewriteSignal",
      "AugLoop_OfficeCopilotWritingStyle_WritingStyleDetails",
      "AugLoop_DynamicBlocklist_DynamicBlockListSignal",
      "AugLoop_TextTranslation_TranslationTile",
      "AugLoop_Signals_NeuralRewriteSignal",
      "AugLoop_Mail_MailDocument",
      "AugLoop_ObservationalAssistance_HostConfig",
      "AugLoop_Signals_TextPredictorSignal",
      "AugLoop_TextPrediction_InDocumentLearnedModel",
      "AugLoop_Substrate_OfficePersonalizationModel",
      "AugLoop_TextPredictionEngagement_TextPredictionInfoAnnotation",
      "AugLoop_TextPredictionEngagement_TextPredictionInfoSignal",
      "AugLoop_Core_UserContextHolder",
      "AugLoop_TextTransliteration_TransliterationTile",
      "AugLoop_PromptAssistance_PromptAssistanceSignal",
      "AugLoop_PromptAssistance_PromptAssistanceSignalV2",
      "AugLoop_PromptGeneration_PromptGenerationAnnotation",
      "AugLoop_WordCoach_CoachSignal",
      "AugLoop_CopilotDocDraft_CopilotDocDraftSignal",
      "AugLoop_CopilotDocDraft_CopilotCuratedDocDraftSignal",
      "AugLoop_WordClarification_WordClarificationSignal",
      "AugLoop_RoleDetection_DocumentRoleDetectionAnnotation",
      "AugLoop_RoleDetection_RoleDetectionAnnotation",
      "AugLoop_RoleDetection_RoleDetectionSettings",
      "AugLoop_ThemeGenerator_ThemeGeneratorSignal",
      "AugLoop_OrganizationMetadata_OrganizationMetadataAnnotation",
      "AugLoop_DocumentTypeClassifier_DocumentTypeClassifierAnnotation",
      "AugLoop_Goals_GoalsAnnotation",
      "AugLoop_Insights_WordCount",
      "AugLoop_Insights_CharacterCount",
      "AugLoop_Insights_CharacterWithoutSpacesCount",
      "AugLoop_Insights_ParagraphCount",
      "AugLoop_CommercialUserLicensing_LicensingAnnotation",
      "AugLoop_ThemeGenerator_ThemeOperationSignal",
      "AugLoop_ThemeGenerator_PersonalizerThemesRankedAnnotation",
      "AugLoop_ThemeGenerator_ThemeOperationHistoryAnnotation",
      "AugLoop_PullQuotes_PullQuotesSignal",
      "AugLoop_Embeddings_DocumentEmbeddingAnnotationV3",
      "AugLoop_Signals_DocumentTypeClassifierSignal",
      "AugLoop_Signals_SimilarityCheckSignal",
      "AugLoop_Insights_InsightsAnalyzerData",
      "AugLoop_Goals_GoalSelected",
      "AugLoop_SmartCompose_Message",
      "AugLoop_SmartCompose_ConversationContext",
      "AugLoop_SmartCompose_SCTelemetry",
      "AugLoop_SmartCompose_SmartComposeSignal",
      "AugLoop_Voice_BatchTranscriptionConversation",
      "AugLoop_TranscriptionOnedriveUpload_OneDriveFastUploadInput",
      "AugLoop_TranscriptionOnedriveUpload_OneDriveFastTranscriptDownloadInput",
      "AugLoop_TranscriptionOnedriveUpload_TranscriptionStatusRequest",
      "AugLoop_Voice_VoiceTile",
      "AugLoop_ImageRehearsal_ImageRehearsalTile",
      "AugLoop_Voice_VoiceBlobTile",
      "AugLoop_Powerpoint_PowerPointSlide",
      "AugLoop_Voice_SpeechToTextFinalResult",
      "AugLoop_VoiceUxo_UxoConnectionTile",
      "AugLoop_VoiceUxo_UxoMessageTile",
      "AugLoop_VoiceUxo_UxoBinaryMessageTile",
      "AugLoop_VoiceBlobStorage_TranscriptionClose",
      "AugLoop_Voice_SpeechSessionEvent",
      "AugLoop_Voice_SpeechErrorEvent",
      "AugLoop_Voice_SpeechToTextPartialResult",
      "AugLoop_VoiceBlobStorage_VoiceBlobStorage",
      "AugLoop_VoiceOnedrive_OneDriveFileUploadInput",
      "AugLoop_AcsTextToSpeech_ACSTextToSpeechSynthesizeTextSignal",
      "AugLoop_AcsTextToSpeech_ACSTextToSpeechSynthesizeSSMLSignal",
      "AugLoop_AcsTextToSpeech_ACSTextToSpeechGetVoicesSignal",
      "AugLoop_AcsTextToSpeech_ReadAloudSpeechGetVoicesSignal",
      "AugLoop_AcsTextToSpeech_ReadAloudSpeechSynthesizeTextSignal",
      "AugLoop_SharepointLibrarianAgent_SharepointLibrarianAgentSignal",
      "AugLoop_Text_LanguageCountAnnotationLocalized",
      "AugLoop_PlannerFileRecommendations_PlannerTask",
      "AugLoop_PlannerFileRecommendations_RecommendationTraceSignal",
      "AugLoop_Signals_BaseSubstrateSignal",
      "AugLoop_ThemeExtractor_ThemeExtractorSignal",
      "AugLoop_Example_LoopbackTile",
      "AugLoop_Example_LoopbackSignal",
      "AugLoop_PromptGeneration_PromptGenerationSignal",
      "AugLoop_RoamingSettings_RoamingSettingsSignal",
      "AugLoop_Core_TenantContextHolder",
      "AugLoop_RichContent_RichContentPPTSignal",
      "AugLoop_Core_Session",
      "AugLoop_TeamsRoomsAi_AgentSignal",
      "AugLoop_TeamsRoomsAi_GenerateContentSignal",
      "AugLoop_TeamsRoomsAi_GenerateTextSignal",
      "AugLoop_TeamsGroupCopilot_SchedulingSignal",
      "AugLoop_ContentSummary_ContentSummarySignal",
      "AugLoop_HtmlParserProxy_HtmlParseSignal",
      "AugLoop_Translator_TranslateContentSignal",
      "AugLoop_Translator_TranslateContentArraySignal",
      "AugLoop_Translator_TranslateFileSignal",
      "AugLoop_Translator_TranslateFileBlobSignal",
      "AugLoop_Translator_DictionaryLookupSignal",
      "AugLoop_Translator_SupportedLanguagesSignal",
      "AugLoop_Translator_DictionaryExamplesSignal",
      "AugLoop_Translator_DetectLanguagesArraySignal",
      "AugLoop_Translator_BreakSentencesSignal",
      "AugLoop_Translator_TranslatePptAuditSignal",
      "AugLoop_Translator_TranslateChunkedFileChunk",
      "AugLoop_Translator_TranslateChunkedFileSignal",
      "AugLoop_TextExtractiveSummarization_GenerateTextExtractiveSummarySignal",
      "AugLoop_AzureTextAbstractiveSummarization_GenerateTextAbstractiveSummarySignal",
      "AugLoop_LoopChangeSummary_ChangeSummaryRequest",
      "AugLoop_LoopChangeSummary_AttributionChangeSummaryRequest",
      "AugLoop_Loop_ComponentDocument",
      "AugLoop_Loop_TableComponentDocument",
      "AugLoop_Loop_TableCellDocument",
      "AugLoop_Loop_CanvasDocument",
      "AugLoop_Loop_TitleDocument",
      "AugLoop_Loop_TableNestedDataTile",
      "AugLoop_Loop_DeepLink",
      "AugLoop_Loop_PageDocument",
      "AugLoop_Loop_LoopAttributionUserTable",
      "AugLoop_SendToKindle_PrepareSendToKindleSignal",
      "AugLoop_SendToKindle_StartSendToKindleSignal",
      "AugLoop_SendToKindle_LogoutFromAmazonSignal",
      "AugLoop_ActionAi_ActionAISignal",
      "AugLoop_CopilotChatHistory_CopilotChatHistorySignal",
      "AugLoop_ActionAi_AdminControlAnnotation",
      "AugLoop_AnswerContentQuestion_AnswerContentQuestionSignal",
      "AugLoop_CopilotLicensing_CopilotLicenseEnabledAnnotation",
      "AugLoop_PptInsights_PptInsightsSignal",
      "AugLoop_PptVisuals_PPTSlideVisualDescription",
      "AugLoop_PptInsights_PptInsightsPostSeedingSignal",
      "AugLoop_AdmincenterCopilot_AdminCenterCopilotOdslSignal",
      "AugLoop_M365adminCopilot_M365adminCopilotOdslSignal",
      "AugLoop_CopilotOdsl_CopilotOdslSignal",
      "AugLoop_Assist_Assist365InputSignal",
      "AugLoop_AlchemyWorkflow_AlchemyRequest",
      "AugLoop_SkillInvoker_SkillInput",
      "AugLoop_UrlPreviewAndThumbnail_PreviewAndThumbnailSignal",
      "AugLoop_TenantFeedbackData_FeedbackDiagnosticDataSignal",
      "AugLoop_CopilotSubstrateIntegration_SubstrateSignal",
      "AugLoop_ObservationalAssistanceAction_OAActionSignal",
      "AugLoop_ObservationalAssistanceAction_OAPromptActionSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenGetUserStoriesSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenGetProcessesOverviewSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenGetProcessFlowDiagramSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenGetDataModelSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenGetArtifactsProposalSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenGetProblemSummarySignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenGetProblemSummaryWithUserContextSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenGetSecurityRolesSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenUpdateUserStoriesSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenUpdateArtifactsProposalSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenUpdateProcessFlowDiagramSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenDevOnlyTestSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenUpdateProcessMapProcessFxSignal",
      "AugLoop_PowerplatformSolutionGenerator_SolutionGenEnhanceBusinessProblemSignal",
      "AugLoop_PowerplatformSolutionGenerator_OneWorkspaceChatSignal",
      "AugLoop_PowerplatformLiveEvaluator_EvaluationSignal",
      "AugLoop_PowerplatformLiveEvaluator_BusinessProblemClassificationSignal",
      "AugLoop_SemanticDocument_SemanticDocumentTextChunkAnnotation",
      "AugLoop_SemanticDocument_SemanticDocumentChunkFailureAnnotation",
      "AugLoop_SemanticDocument_SearchDocumentSignal",
      "AugLoop_Powerpoint_PowerPointDocumentIntegrity",
      "AugLoop_CopilotPluginConfigBrokering_CopilotPluginSignal",
      "AugLoop_CopilotLicensing_CopilotLicensingOnDemandAnnotation",
      "AugLoop_SparkCopilot_SparkAIHubCopilotInputSignal",
      "AugLoop_SparkCopilot_HandoffSignal",
      "AugLoop_SparkCopilot_AuditSignal",
      "AugLoop_SparkCopilot_ContentGenerationInputSignal",
      "AugLoop_SparkCopilot_TextArtifactGenerationSignal",
      "AugLoop_SparkCopilot_ContentConversionSignal",
      "AugLoop_SparkCopilot_DesignerArtifactGenerationSignal",
      "AugLoop_FormsInsights_FormsInsightsSignal",
      "AugLoop_VideoPlugins_MakeVideoPluginSignal",
      "AugLoop_AvaContentFetcher_AvaFetchContentSignal",
      "AugLoop_AvaContentIntelligence_AvaContentIntelligenceRequestSignal",
      "AugLoop_AvaLlmChatCompletion_AvaLlmChatCompletionSignal",
      "AugLoop_ClipchampPptToVideo_ClipchampSIMSSignal",
      "AugLoop_ClipchampPptToVideo_ClipchampParsePptSignal",
      "AugLoop_CopilotHandoff_SharepointPageHandoffSignal",
      "AugLoop_CreditBalance_CreditBalanceSignal",
      "AugLoop_CreditBalance_MeterBalanceSignal",
      "AugLoop_CreditBalance_MeterSpinSignal",
      "AugLoop_CopilotChatTeachingUi_CopilotChatTeachingUISignal",
      "AugLoop_SharepointDesignIdeasPersonalizer_DesignIdeasRankSignal",
      "AugLoop_SharepointDesignIdeasPersonalizer_DesignIdeasRewardSignal",
      "AugLoop_TeamsGroupCopilot_TeamsMeetingVisualizeIdeasSignal",
      "AugLoop_TeamsGroupCopilot_MarsSkillSignal",
      "AugLoop_PptSpeakerNotes_SpeakerNotesSignal",
      "AugLoop_PowerpointDocumentIntegrityChecker_PowerPointDocumentIntegrityStatus",
      "AugLoop_PptHtml_PptGetSlideHtmlSignal",
      "AugLoop_PptHtml_PptSlideHtmlToJsonCmdSignal",
      "AugLoop_ContentPrefetch_ContentPrefetchSignal",
      "AugLoop_TeamsMeetingInfoQna_MeetingInfoQnASignal",
      "AugLoop_TeamsGroupCopilot_TeamsTaskManagementSkillSignal",
      "AugLoop_TeamsTaskManagementV2_TeamsTaskManagementSkillV2Signal",
      "AugLoop_TeamsTaskManagementV2_TeamsCopilotTasksQnASignal",
      "AugLoop_LatticeEvaluation_LatticeEvaluationSignal",
      "AugLoop_LatticeEvaluation_LatticeEvaluationSignalV2",
      "AugLoop_ExcelScratchpad_ExcelScratchpadSignal",
      "AugLoop_ExcelIntelligence_ExcelIntelligenceTableSignal",
      "AugLoop_CopilotLicensing_CopilotLicenseEnabledForM365AppsAnnotation",
      "AugLoop_Excel_EcsAccessInfo",
      "AugLoop_SharepointSmaRecommendations_SharepointSmaRecommendationsSignal",
      "AugLoop_SharepointSmaRecommendations_SMAContentGapSignal",
      "AugLoop_SharepointSmaRecommendations_SharepointSMAContentPageReasonSignal",
      "AugLoop_SharepointSmaRecommendations_SMABrokenLinksSignal",
      "AugLoop_OdspSummarization_OdspSummarizationSignal",
      "AugLoop_OdspSummarization_OdspSummarizationSignalWithPacTokens",
      "AugLoop_PptSlideIterate_SlideIterateSignal",
      "AugLoop_TeamsGroupCopilot_TeamsPlanManagementSignal",
      "AugLoop_WorkbackPlanDraftGenerator_WorkbackPlanDraftGeneratorSignal",
      "AugLoop_ExcelAgentExperimental_ExcelAgentExperimentalSignal",
      "AugLoop_ExcelAgentExperimental_ExcelAgentExperimentalCancelQuerySignal",
      "AugLoop_ExcelAgentExperimental_ExcelAgentExperimentalCheckPermissionSignal",
      "AugLoop_OaiGatherAgent_RequestDocumentReviewSignal",
      "AugLoop_SharepointSiteCopilot_GetRecentSitesSignal",
      "AugLoop_SharepointSiteCopilot_SearchSiteSignal",
      "AugLoop_SharepointSiteCopilot_ValidateSiteUrlSignal",
      "AugLoop_ConversationalScheduledPrompts_ConversationalScheduledPromptsSignal",
      "AugLoop_LanguageDetection_LanguageDetectionSignal",
      "AugLoop_DesignerContentRetrieval_DesignerContentRetrievalSignal",
      "AugLoop_Proofing_UserProofingAnnotation",
      "AugLoop_Text_Critique",
      "AugLoop_ProofingSettings_ProofingSettingSignal",
      "AugLoop_OaSettings_OASettingSignal",
      "AugLoop_QuickStart_SelectedTheme",
      "AugLoop_QuickStart_GetThemesSignal",
      "AugLoop_QuickStart_ExcludeThemes",
      "AugLoop_SearchProvider_SearchProviderSignal",
      "AugLoop_SearchSuggestion_SearchSuggestionSignal",
      "AugLoop_CollabActions_LoopCollabActionsRequest",
      "AugLoop_WorkspaceStatus_WorkspaceStatusLoopRequest",
      "AugLoop_WordConvertAndUpload_ConvertAndUploadSignal",
      "AugLoop_FixAll_FixAllSignal",
      "AugLoop_ConditionalFormattingSuggestion_ConditionalFormattingSuggestionSignal",
      "AugLoop_Excel_ExcelBlock",
      "AugLoop_Excel_Worksheet",
      "AugLoop_ExcelTableai_ExcelBoundaryDetectionConfiguration",
      "AugLoop_ExcelTableai_ExcelBoundaryDetectionLimitExceededAnnotation",
      "AugLoop_Excel_ExcelDetectedTableBoundaryPartNew",
      "AugLoop_Excel_BaseExcelTable",
      "AugLoop_Excel_DirtyDocumentSignalForBdReducer",
      "AugLoop_Excel_ExcelMergedCell",
      "AugLoop_Excel_DirtyRangeSignal",
      "AugLoop_Excel_WorkflowLimitsRestoredSignal",
      "AugLoop_Excel_ExcelExtendedBlock",
      "AugLoop_ExcelCleanData_ExtraSpacesColumnAnnotation",
      "AugLoop_ExcelAdvancedTableMetadata_ExcelRecognizedTablePersisted",
      "AugLoop_ExcelTableAi_ExcelRecognizedTableNew",
      "AugLoop_Excel_ExcelTableColumn",
      "AugLoop_ExcelCleanData_UnprintableCharactersColumnAnnotation",
      "AugLoop_Tablelint_TableLintWorksheetAggregateAnnotation",
      "AugLoop_ExcelCleanData_ExtraSpacesTableAnnotation",
      "AugLoop_ExcelCleanData_ExcelCleanDataAnnotation",
      "AugLoop_Core_DirtyDocumentSignal",
      "AugLoop_ExcelCleanData_ExcelCleanDataClientConfiguration",
      "AugLoop_Tablelint_TableLintColumnAnnotation",
      "AugLoop_ExcelCopilot_ExcelCopilotOdslSignal",
      "AugLoop_ExcelCopilot_ExcelCopilotInputSignal",
      "AugLoop_ExcelCopilot_ExcelCopilotProgramResponseSignal",
      "AugLoop_CopilotGpt_CopilotGPTSignal",
      "AugLoop_ExcelTrackedRangeInvalidator_ExcelInvalidatedRangeAnnotation",
      "AugLoop_DlpPromptCheck_DLPPromptPolicyAnnotation",
      "AugLoop_ExcelCopilot_ExcelHandoffInboundMessage",
      "AugLoop_ExcelCopilot_ExcelHandoffMessageId",
      "AugLoop_ExcelDynamicSuggestions_DynamicSuggestionSignal",
      "AugLoop_ExcelFormulaCompletion_ExcelFormulaCompletionSignal",
      "AugLoop_ExcelFormulaCopilot_ExcelCopilotIncubationSignal",
      "AugLoop_ExcelFormulaCopilot_ExcelFormulaCopilotSignal",
      "AugLoop_ExcelProactiveSuggestion_PivotTableProactiveSuggestionSignal",
      "AugLoop_ExcelTableai_RangeDataSignal",
      "AugLoop_ExcelTableAi_ExcelDetectedTableBoundaryNew",
      "AugLoop_ExcelTableai_ExcelBoundaryDetectionStatus",
      "AugLoop_Excel_ExcelPivotTable",
      "AugLoop_ExcelTableai_XLIMCorrelationIdentifier",
      "AugLoop_ExcelTrackedRangeInvalidator_ExcelTrackedRangeAnnotation",
      "AugLoop_Excel_ExcelTable",
      "AugLoop_UnitTelemetry_UnitTelemetryAnnotation",
      "AugLoop_FormulaByExample_FormulaByExampleSignal",
      "AugLoop_FormulaByExample_FormulaByExampleWarmUpSignal",
      "AugLoop_ExcelStartCopilot_ExcelStartCopilotInputSignal",
      "AugLoop_ExcelStartCopilot_ExcelStartCopilotProgramResponseSignal",
      "AugLoop_ExcelStartCopilot_ExcelStartCopilotChatHistorySignal",
      "AugLoop_ExcelImportData_ExcelImportDataFileMetadataSignal",
      "AugLoop_ExcelImportData_ExcelImportDataSourcesRelevancySignal",
      "AugLoop_ExcelImportData_ExcelStartRelevantMetadataSignal",
      "AugLoop_WorkbookTableMetadata_WorkbookTableMetadataSignal",
      "AugLoop_Ink_InkSignal",
      "AugLoop_ConversationalCopilot_AudioCopilotTile",
      "AugLoop_ConversationalCopilot_DocumentHandlerSignal",
      "AugLoop_Hubble_AssetDownloadSignal",
      "AugLoop_Hubble_ContentSearchSignal",
      "AugLoop_Hubble_ContentDownloadSignal",
      "AugLoop_Hubble_ProviderContentAnnotation",
      "AugLoop_OdspCopilot_ODSPAnalyzeImageSkillSignal",
      "AugLoop_OdspCopilot_ODSPCreatePodcastScriptSkillSignal",
      "AugLoop_OdspCopilot_ODSPRenderAceCardSkillSignal",
      "AugLoop_OdspCopilot_ODSPLocalFetchFileContentSkillSignal",
      "AugLoop_PptTranslation_TranslatePptSignal",
      "AugLoop_SubstrateEvents_SubstrateEventsInput",
      "AugLoop_HandoffSkill_HandoffInboundMessage",
      "AugLoop_HandoffSkill_HandoffDocUrlSignal",
      "AugLoop_Userconfig_UserConfigAnnotation",
      "AugLoop_ObservationalAssistance_SessionStartRequest",
      "AugLoop_GraphIntentDetection_SystemInitiatedWithIntent",
      "AugLoop_ObservationalAssistance_UserInitiatedRequest",
      "AugLoop_GraphIntentDetection_FlagWithIntent",
      "AugLoop_GraphSearch_GraphSearchSignalHybrid",
      "AugLoop_GraphIntentDetection_EntityPrediction",
      "AugLoop_ObservationalAssistance_ClientConfigSignal",
      "AugLoop_OaSettings_OASettingsAnnotation",
      "AugLoop_ObservationalAssistance_FlagAnnotation",
      "AugLoop_ObservationalAssistance_EccAnnotation",
      "AugLoop_ObservationalAssistance_NudgeAnnotation",
      "AugLoop_ObservationalAssistance_PredictionAnnotation",
      "AugLoop_ObservationalAssistance_UserInitiatedAnnotation",
      "AugLoop_ObservationalAssistance_ControlSignal",
      "AugLoop_CopilotLicensing_CheckCopilotLicenseSignal",
      "AugLoop_FormsAi_SurveyAgentSignal",
      "AugLoop_FormsAi_FormsCopilotSignal",
      "AugLoop_FormsAi_FormsFileInfoSignal",
      "AugLoop_FormsAi_FormsChatHistorySignal",
      "AugLoop_FormsAi_FormsGroundingSignal",
      "AugLoop_FormsAi_FormsInsightQuestionsSignal",
      "AugLoop_FormsAi_EduCreateQuizSignal",
      "AugLoop_OfficeCopilotOrchestration_CopilotPromptsSignal",
      "AugLoop_SecuritySitFetch_SecurityPolicyAnnotation",
      "AugLoop_SecurityShared_CLP",
      "AugLoop_SecurityShared_DLP",
      "AugLoop_Mail_MailAttachments",
      "AugLoop_Mail_AttachmentBody",
      "AugLoop_Mail_MailBody",
      "AugLoop_Mail_AttachmentsUpdatedSignal",
      "AugLoop_Signals_MailDocumentSignal",
      "AugLoop_Powerpoint_PowerPointSlideBase",
      "AugLoop_SecurityShared_ClpWorkflowDoneSignal",
      "AugLoop_SecurityShared_SensitiveItemRangeAnnotation",
      "AugLoop_SecurityShared_SensitiveItemRangeSetAnnotation",
      "AugLoop_SecurityShared_SensitiveItemFullDocumentAnnotation",
      "AugLoop_SecurityClp_LabellingAnnotation",
      "AugLoop_Mail_MailHeaders",
      "AugLoop_SecurityDlp_GroupMembership",
      "AugLoop_SecurityDlp_MailTipArray",
      "AugLoop_SecurityShared_SensitiveItemRangeAnnotationImmediate",
      "AugLoop_SecurityShared_SensitiveItemRangeSetAnnotationImmediate",
      "AugLoop_SecurityShared_SensitiveItemFullDocumentAnnotationImmediate",
      "AugLoop_AiHub_AIHubSummarizeCopilotInputSignal",
      "AugLoop_AudioCastGenerator_GenerateAudioCastSignal",
      "AugLoop_CalendarScheduling_CalendarSchedulingSignal",
      "AugLoop_ComprehensionSummary_ComprehensionSummarySignal",
      "AugLoop_PptVisuals_PPTVisualsCompleteOutput",
      "AugLoop_ComprehensionSummary_SecondaryComprehensionSummarySignal",
      "AugLoop_ComprehensionSummary_ComprehensionSummaryAppTokenSignal",
      "AugLoop_ComprehensionSummary_NonSeedingComprehensionSummarySignal",
      "AugLoop_CommentAnchoredText_CommentContextSignal",
      "AugLoop_ContentProcessing_ContentProcessingSignal",
      "AugLoop_ContentValidator_ContentValidatorSignal",
      "AugLoop_Text_CommentTile",
      "AugLoop_Text_HTMLContent",
      "AugLoop_CopilotComprehensionArchitecture_CopilotComprehensionSignal",
      "AugLoop_CopilotComprehensionArchitecture_CopilotComprehensionSignalFAQs",
      "AugLoop_CopilotComprehensionArchitecture_CopilotComprehensionSignalWithDocumentUrl",
      "AugLoop_CopilotComprehensionArchitecture_CopilotComprehensionCatchUpSignalWithDocumentUrl",
      "AugLoop_CopilotComprehensionArchitecture_CopilotCommentSuggestionSignalWithDocumentUrl",
      "AugLoop_CopilotComprehensionArchitecture_CopilotComprehensionSignalWithLocalization",
      "AugLoop_CopilotComprehensionArchitecture_CopilotComprehensionSignalWithExchangeAttachment",
      "AugLoop_CopilotComprehensionArchitecture_CopilotComprehensionSignalFromSydneyPlugin",
      "AugLoop_CopilotComprehensionArchitecture_CopilotComprehensionSignalWithUserPromptNoSeeding",
      "AugLoop_CopilotComprehensionArchitecture_CopilotCommentSuggestionSignalWithDocumentContent",
      "AugLoop_CopilotComprehensionArchitecture_CopilotComprehensionSignalWithPacToken",
      "AugLoop_CopilotComprehensionArchitecture_BaseCocoaPluginSignal",
      "AugLoop_FetchImplicitGroundingEntities_GroundingDetails",
      "AugLoop_PowerpointSemanticOrchestrator_PowerPointSemanticOrchestratorAnnotation",
      "AugLoop_SemanticDocument_SearchDocumentAnnotation",
      "AugLoop_PptBotspeakCurrentDocument_BotSpeakBlobTokenWriterAnnotation",
      "AugLoop_CopilotWarmup_CopilotGetUserContextSignal",
      "AugLoop_DeveloperportalAppvalidation_AppValidationTextValidatorSignal",
      "AugLoop_DragonCopilot_DragonCopilotSignal",
      "AugLoop_DragonCopilot_Note",
      "AugLoop_DragonCopilot_Transcript",
      "AugLoop_DynamicQuestionGenerator_DynamicQuestionGeneratorSignal",
      "AugLoop_CopilotOdsl_AdminControlAnnotation",
      "AugLoop_Education_EducationEnhanceSuggestionsSignal",
      "AugLoop_Education_EducationFeedbackSignal",
      "AugLoop_Education_EducationRubricInfoTile",
      "AugLoop_Education_EducationLessonPlanOutlineSignal",
      "AugLoop_Education_EducationRubricGenerationSignal",
      "AugLoop_Education_EducationRubricRegenerationSignal",
      "AugLoop_Education_EducationRubricCriteriaSuggestionsSignal",
      "AugLoop_Education_EducationFlashcardsSignal",
      "AugLoop_Education_EducationFillInTheBlanksSignal",
      "AugLoop_Education_EducationStudyGuideKeyTopicsSignal",
      "AugLoop_Education_EducationStudyGuideSummarySignal",
      "AugLoop_Education_EducationStudyGuideTopicSignal",
      "AugLoop_Education_EducationStudyGuideLearningActivitiesSignal",
      "AugLoop_Education_EducationStudyGuideSummaryProducerSignal",
      "AugLoop_Education_EducationStudyGuideTopicProducerSignal",
      "AugLoop_Education_EducationStudyGuideLearningActivitiesProducerSignal",
      "AugLoop_Education_EducationStudyGuideQuizProducerSignal",
      "AugLoop_GetDocumentContext_GetDocumentContextSignal",
      "AugLoop_OnenoteCopilot_OneNotePageChangeSignal",
      "AugLoop_RichContent_BotSpeakDocParserAnnotation",
      "AugLoop_RichContent_PowerPointSlideImages",
      "AugLoop_IntelligentOdataGenerator_IntelligentOdataGeneratorSignal",
      "AugLoop_LoopAppCopilot_LoopAppCopilotInputSignal",
      "AugLoop_LoopAppCopilot_LoopAppCopilotProgramResponseSignal",
      "AugLoop_LoopAppCopilot_LoopAppCopilotSessionDumpRequest",
      "AugLoop_LoopCopilot_MarkdownPageContentResponse",
      "AugLoop_LoopCopilot_MarkdownPageContentRequest",
      "AugLoop_LoopCopilot_JSONTilesPageContentRequest",
      "AugLoop_LoopCopilot_LoopCopilotRequest",
      "AugLoop_OdspCopilot_ODSPCopilotScopeContext",
      "AugLoop_SemanticDocument_SearchExternalDocumentSignal",
      "AugLoop_OdspCopilot_ODSPCopilotChatHistorySignal",
      "AugLoop_OdspCopilot_ODSPCopilotFileContextAnnotation",
      "AugLoop_OdspCopilot_ODSPCopilotFlightOverrides",
      "AugLoop_OdspCopilot_ODSPCopilotInputSignal",
      "AugLoop_OdspCopilot_ODSPCopilotProgramResponseSignal",
      "AugLoop_OdspCopilot_ODSPCopilot3SDynamicSlotsAnnotation",
      "AugLoop_OdspCopilot_ODSPCopilotListContentAnnotation",
      "AugLoop_OdspCopilot_ODSPValidateGptSignal",
      "AugLoop_OdspCopilot_SharePointEmbeddedContext",
      "AugLoop_OffpeakProcessing_OffPeakProcessingInputSignal",
      "AugLoop_OnenoteContentCreationCopilot_OneNoteContentCreationSignal",
      "AugLoop_OnenoteCopilot_OneNoteCopilotSignal",
      "AugLoop_OnenoteCopilot_OneNoteCopilotInputSignal",
      "AugLoop_OnenoteCopilot_OneNoteCopilotProgramResponseSignal",
      "AugLoop_OnenoteCopilot_OneNoteCopilotContextMenuInputSignal",
      "AugLoop_OnenoteCopilot_OneNoteCopilotContextMenuProgramResponseSignal",
      "AugLoop_OrganizeContent_OrganizeContentSignal",
      "AugLoop_OrganizeContent_CreateHierarchySignal",
      "AugLoop_OrganizeContent_FileIntoExistingHierarchySignal",
      "AugLoop_OrganizePresentation_OrganizePresentationSignal",
      "AugLoop_OutlookCopilot_OutlookCopilotInputSignal",
      "AugLoop_OutlookCopilot_OutlookCopilotProgramResponseSignal",
      "AugLoop_OutlookCopilot_OutlookHandoffInboundMessage",
      "AugLoop_OutlookCopilot_OutlookHandoffMessageId",
      "AugLoop_PlannerAppCopilot_PlannerAppCopilotInputSignal",
      "AugLoop_PlannerAppCopilot_PlannerAppCopilotProgramResponseSignal",
      "AugLoop_PlannerAppCopilot_PlannerPremiumTask",
      "AugLoop_PlannerAppCopilot_PlannerPremiumGoal",
      "AugLoop_PlannerAppCopilot_PlannerPremiumBucket",
      "AugLoop_PlannerAppCopilot_PlannerPremiumPlan",
      "AugLoop_PlannerAppPlugin_PlannerSearchPlanSignal",
      "AugLoop_PlannerAppPlugin_PlannerEditPlanSignal",
      "AugLoop_PowerappsStudioCopilot_PAStudioCopilotGetHelpSignal",
      "AugLoop_PowerplatformCanvasAppGenerator_AppBuilderSignal",
      "AugLoop_PowerpointCopilot_PowerPointCopilotOdslSignal",
      "AugLoop_PowerpointCopilot_PowerPointCopilotInputSignal",
      "AugLoop_PowerpointCopilot_PowerPointCopilotProgramResponseSignal",
      "AugLoop_SydneyUserSettings_UserSettingsSignal",
      "AugLoop_Powerpoint_PowerPointShape",
      "AugLoop_PowerpointCopilot_PowerPointHandoffInboundMessage",
      "AugLoop_PowerpointCopilot_PowerPointHandoffMessageId",
      "AugLoop_PptAddSlide_PptAddSlideSignal",
      "AugLoop_PptAddSlide_PptUpdateSlideSignal",
      "AugLoop_RuntimeEvaluate_RuntimeEvaluateSignal",
      "AugLoop_PptFetchOutline_OutlineGenerationSignal",
      "AugLoop_Powerpoint_SectionList",
      "AugLoop_PptHeadless_PptHeadlessSignal",
      "AugLoop_PptNarrativeTopics_NarrativeTopicsSignal",
      "AugLoop_PptNarrativeTopics_NarrativeTopicsAddTopicsSignal",
      "AugLoop_PptNarrativeTopics_NarrativeTopicsEditTopicsSignal",
      "AugLoop_SemanticContentTree_BaseSemanticContentAnnotation",
      "AugLoop_PptImageSettings_ImageSettingsSignal",
      "AugLoop_PptProactiveSuggestions_ProactiveSuggestionSignal",
      "AugLoop_PptSlidesGenerator_SlidesGeneratorSignal",
      "AugLoop_PptInternal_PptTopicTextStoreInternal",
      "AugLoop_SemanticContentTree_ArchetypeAnnotation",
      "AugLoop_SemanticContentTree_SummaryAnnotation",
      "AugLoop_SemanticContentTree_TitleAnnotation",
      "AugLoop_SemanticContentTree_EmbeddingAnnotation",
      "AugLoop_SemanticContentTree_TokenInformationAnnotation",
      "AugLoop_SemanticContentTree_LanguageAnnotation",
      "AugLoop_SemanticContentTree_MediaSemanticAnnotation",
      "AugLoop_SemanticContentTree_NodeInformationAnnotation",
      "AugLoop_SemanticContentTree_ImageSemanticInfoAnnotation",
      "AugLoop_SemanticContentTree_EvaluationDataAnnotation",
      "AugLoop_SemanticContentTree_ModelReasoningAnnotation",
      "AugLoop_SemanticContentTree_SlideInfoAnnotation",
      "AugLoop_SemanticContentTree_ImageAssetTypeAnnotation",
      "AugLoop_SemanticContentTree_ContentGuidanceAnnotation",
      "AugLoop_SemanticContentTree_DocumentSetPayloadAnnotation",
      "AugLoop_SemanticContentTree_DocumentPayloadAnnotation",
      "AugLoop_SemanticContentTree_SectionPayloadAnnotation",
      "AugLoop_SemanticContentTree_GroupPayloadAnnotation",
      "AugLoop_SemanticContentTree_TextPayloadAnnotation",
      "AugLoop_SemanticContentTree_HeadingPayloadAnnotation",
      "AugLoop_SemanticContentTree_ListItemPayloadAnnotation",
      "AugLoop_SemanticContentTree_ListPayloadAnnotation",
      "AugLoop_SemanticContentTree_NotePayloadAnnotation",
      "AugLoop_SemanticContentTree_ImagePayloadAnnotation",
      "AugLoop_SemanticContentTree_TablePayloadAnnotation",
      "AugLoop_SemanticContentTree_TableOfContentPayloadAnnotation",
      "AugLoop_SemanticContentTree_CommentPayloadAnnotation",
      "AugLoop_SemanticContentTree_FootNotePayloadAnnotation",
      "AugLoop_SemanticContentTree_EndNotePayloadAnnotation",
      "AugLoop_SemanticContentTree_HeaderPayloadAnnotation",
      "AugLoop_SemanticContentTree_FooterPayloadAnnotation",
      "AugLoop_SemanticContentTree_PositionedPayloadAnnotation",
      "AugLoop_SemanticContentTree_SmartArtPayloadAnnotation",
      "AugLoop_SemanticContentTree_ChartPayloadAnnotation",
      "AugLoop_PptVisuals_PPTVisualsSignal",
      "AugLoop_PptVisuals_PPTMeTAVisualsSignal",
      "AugLoop_Rewrite_RewriteSignal",
      "AugLoop_Rewrite_RewriteEvalSignal",
      "AugLoop_SharepointCopilot_SharepointCopilotRequest",
      "AugLoop_SharepointCopilot_SharePointCopilotOdslSignal",
      "AugLoop_SharepointCopilot_PageAuthoringRequest",
      "AugLoop_SharepointCopilot_SectionSubtopicRequest",
      "AugLoop_SharepointCopilot_PageSkeletonRequest",
      "AugLoop_SharepointCopilot_PageOutlineRequest",
      "AugLoop_SharepointCopilot_WebPartsAuthoringRequest",
      "AugLoop_SharepointCopilot_CommonAuthoringRequest",
      "AugLoop_SharepointCopilot_DraftComposeRequest",
      "AugLoop_SharepointAuthoringCopilot_DocumentStructureSignal",
      "AugLoop_SharepointCopilot_PageFreePromptSignal",
      "AugLoop_SharepointAuthoringCopilot_DocumentContentSignal",
      "AugLoop_SharepointCopilot_BizChatPageSignal",
      "AugLoop_SharepointCopilot_SmartSectionSelectDataVariantsPromptSignalV2",
      "AugLoop_SharepointCopilot_SmartSectionCreateSignalV2",
      "AugLoop_SharepointCopilot_SmartSectionRefineSignalV2",
      "AugLoop_SharepointCopilot_DesignIdeasSignal",
      "AugLoop_SharepointCopilot_AIReachGenerateTitleSignal",
      "AugLoop_SharepointCopilot_AIReachGenerateDescriptionSignal",
      "AugLoop_SharepointCopilot_AIReachGenerateThumbnailSignal",
      "AugLoop_SharepointCopilot_AIReachGenerateAltTextSignal",
      "AugLoop_SharepointCopilot_SharepointHandoffInboundMessage",
      "AugLoop_SharepointCopilot_SharepointHandoffMessageId",
      "AugLoop_SharepointCopilot_AIPropertiesCreationSignal",
      "AugLoop_SharepointCopilot_AIPropertiesModificationSignal",
      "AugLoop_SharepointDynamicFaq_DynamicFAQTopicSuggestionRequest",
      "AugLoop_SharepointDynamicFaq_DynamicFAQQuestionGenerationRequest",
      "AugLoop_SharepointDynamicFaq_DynamicFAQAnswerGenerationRequest",
      "AugLoop_SharepointDynamicFaq_DynamicFAQQuestionAggregateRequest",
      "AugLoop_SharepointDynamicFaq_DynamicFAQContentUpdateRequest",
      "AugLoop_SharepointDynamicFaq_DynamicFAQContentExtractionRequest",
      "AugLoop_SharepointDynamicFaq_DynamicFAQAutoPromptGenerationRequest",
      "AugLoop_SharepointDynamicFaq_DynamicFAQTypeDetectionRequest",
      "AugLoop_Storyteller_StorytellerSignal",
      "AugLoop_Storyteller_StorytellerWithTopicsInputSignal",
      "AugLoop_StreamCopilotApp_StreamCopilotAppInputSignal",
      "AugLoop_StreamCopilotApp_StreamCopilotAppProgramResponseSignal",
      "AugLoop_SyntexContentAssembly_SyntexContentAssemblySignal",
      "AugLoop_TeamsSmbCopilot_TeamsSmbCopilotSignal",
      "AugLoop_TeamsCopilot_TeamsCopilotAgentSignal",
      "AugLoop_TeamsCopilotAgent_TeamsCopilotAgentS1ReportSignal",
      "AugLoop_TeamsCopilotAgent_TeamsCopilotAgentFinalReportSignal",
      "AugLoop_TeamsCopilotAgent_TeamsCopilotAgentAsyncFollowupSignal",
      "AugLoop_TeamsCopilotAgent_TeamsCopilotAgentBackgroundTaskSignal",
      "AugLoop_TeamsCopilotApp_TeamsCopilotInputSignal",
      "AugLoop_TeamsCopilotApp_TeamsCopilotMeetingSignal",
      "AugLoop_TeamsCopilotApp_TeamsCopilotProgramResponseSignal",
      "AugLoop_TeamsCopilotApp_TeamsCopilotMeetingHistorySignal",
      "AugLoop_TeamsCopilotApp_CopilotOrTeamsPremiumLicenseAggregation",
      "AugLoop_CopilotLicensing_TeamsPremiumLicenseEnabledAnnotation",
      "AugLoop_TeamsCopilotApp_TeamsCopilotFluxMeetingHistorySignal",
      "AugLoop_TeamsCopilotApp_TeamsCopilotAgentSignal",
      "AugLoop_TeamsCopilotApp_TeamsCopilotGetGPTSignal",
      "AugLoop_TeamsCopilotApp_TeamsCopilotFluxAgentHistorySignal",
      "AugLoop_TeamsCopilotSynthesis_TeamsCopilotSynthesisSignal",
      "AugLoop_TeamsCopilot_TeamsCopilotSignal",
      "AugLoop_TeamsCopilot_TeamsCopilotComposeRewriteSignal",
      "AugLoop_TeamsCopilot_TeamsCopilotSearchSummariesSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastDeleteSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastDetailSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastGenerationSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastListSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastValidationSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastAgentSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastSchedulingSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastListEventsSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastEvaluationSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastGetMeetingInfosSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapInteractivePodcastEvaluationSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastRecurringActionCreationSignal",
      "AugLoop_TeamsRecapPodcast_TeamsRecapPodcastBatchNotificationSettingSignal",
      "AugLoop_TeamsRecommendations_TeamsRecommendationsSignal",
      "AugLoop_TeamsChatAgent_TeamsChatAgentSignal",
      "AugLoop_TeamsChatAgent_BizChatSessionHandoffToTeamsSignal",
      "AugLoop_TeamsWebSearch_WebCopilotSignal",
      "AugLoop_TextSummarization_GptSummarySignal",
      "AugLoop_RaiCustomizability_RaiPolicyAnnotation",
      "AugLoop_TextSummarization_TestGptSummarySignal",
      "AugLoop_TranscriptEnricher_TranscriptEnricherSignal",
      "AugLoop_VisualDataAnalyzer_VisualDataAnalyzerSignal",
      "AugLoop_VisualDataAnalyzer_VisualDataAnalyzerAppTokenSignal",
      "AugLoop_VivaEngageCopilot_VivaEngageCopilotInputSignal",
      "AugLoop_VivaEngageCopilot_VivaEngageCopilotProgramResponseSignal",
      "AugLoop_VivaEngagePlugins_VivaEngageCommunityCatchUpSignal",
      "AugLoop_VivaEngagePlugins_VivaEngageNetworkCatchUpSignal",
      "AugLoop_VivaEngagePlugins_VivaEngageThreadCatchUpSignal",
      "AugLoop_VivaEngagePlugins_VivaEngageCommunitySuggestionsInputSignal",
      "AugLoop_VivaEngagePlugins_VivaEngageAnswersSearchInputSignal",
      "AugLoop_VivaEngagePlugins_VivaEngageConversationsSearchInputSignal",
      "AugLoop_VivaEngagePlugins_VivaEngageCampaignsSearchInputSignal",
      "AugLoop_VivaEngagePlugins_VivaEngageExpertsSearchInputSignal",
      "AugLoop_VivaEngageAgents_VivaEngageAgentSignal",
      "AugLoop_VivaPulse_VivaPulseGenerateQuestionsSignal",
      "AugLoop_VivaPulse_VivaPulseReportSummarySignal",
      "AugLoop_VivaGlintPlugin_VivaGlintResultSummarySignal",
      "AugLoop_WhiteboardCopilot_WhiteboardCopilotCategorizeRequest",
      "AugLoop_WhiteboardCopilot_WhiteboardCopilotSuggestRequest",
      "AugLoop_WhiteboardCopilot_WhiteboardCopilotSummarizeRequest",
      "AugLoop_WordCopilotApp_WordCopilotInputSignal",
      "AugLoop_WordCopilotApp_WordCopilotProgramResponseSignal",
      "AugLoop_WordCopilotApp_WordHandoffInboundMessage",
      "AugLoop_WordCopilotApp_WordHandoffMessageId",
      "AugLoop_TeamsGroupCopilot_TeamsGroupCopilotIdentitySkillSignal",
      "AugLoop_TeamsMeetingTimer_MeetingTimerSkillSignal",
      "AugLoop_AiHubAssist_DashboardRequestSignal",
      "AugLoop_AiHubAssist_SearchRequestSignal",
      "AugLoop_TeamsFlwCopilot_TeamsFlwCopilotSignal",
      "AugLoop_TeamsGroupCopilot_AtMentionSkillSignal",
      "AugLoop_TeamsGroupCopilot_AtMentionReactiveSkillSignal",
      "AugLoop_TeamsTimeModerator_TimeModeratorSignal",
      "AugLoop_TeamsTimeModerator_TimeModeratorReactiveS2SSignal",
      "AugLoop_TeamsTimeModerator_TimeModeratorReactiveBotSignal",
      "AugLoop_TeamsGroupCopilot_GroupCopilotSignal",
      "AugLoop_TeamsLiveMeetingNotesSkill_LiveMeetingNotesV1SkillSignal",
      "AugLoop_TeamsLiveMeetingNotesSkill_LiveMeetingNotesV2SkillSignal",
      "AugLoop_TeamsMeetingQna_TeamsMeetingQnASignal",
      "AugLoop_TeamsQualityEvaluator_TeamsQualityEvaluatorSignal",
      "AugLoop_CopilotNotebooksContentGeneration_ContentGenerationFAQsSignal",
      "AugLoop_CopilotNotebooksContentGeneration_OverviewPageSignal",
      "AugLoop_CopilotNotebooksContentGeneration_ReplacePageContentSignal",
      "AugLoop_CopilotNotebooksContentGeneration_GeneratePageContentSignal",
      "AugLoop_CopilotNotebooksContentGeneration_ReplacePageWithContentSignal",
      "AugLoop_CopilotNotebooksContentGeneration_CreatePageWithContentSignal",
      "AugLoop_SimpleAutomation_SimpleAutomationSignal",
      "AugLoop_SimpleAutomation_SimpleAutomationParameterSignal",
      "AugLoop_TeamsMeetingAgenda_TeamsMeetingAgendaSkillSignal",
      "AugLoop_TeamsMeetingAgenda_TeamsMeetingAgendaReactiveSkillSignal",
      "AugLoop_TeamsMeetingAgenda_TeamsMeetingAgendaAppSkillSignal",
      "AugLoop_DirectoryService_DirectoryServiceSignal",
      "AugLoop_OfficeAgentManager_OfficeAgentStartSignal",
      "AugLoop_OfficeAgentManager_AgentManagementSignal",
      "AugLoop_OfficeAgentManager_BizChatActionsCreationSignal",
      "AugLoop_CopilotActionsHeartbeat_CopilotActionsHeartbeatSignal",
      "AugLoop_CopilotActionsSydneyFrontdoor_CopilotActionsSydneyFrontDoorSignal",
      "AugLoop_ReviewerAgent_GenerateCommentsSignal",
      "AugLoop_ReviewerAgent_AddCommentToWordDocSignal",
      "AugLoop_ReviewerAgent_AsyncGenerateCommentsSignal",
      "AugLoop_ReviewerAgent_AsyncAddCommentToWordDocSignal",
      "AugLoop_ReviewerAgent_GetReviewerStatusSignal",
      "AugLoop_CopilotBoards_FileUnfurlSignal",
      "AugLoop_CopilotBoards_CopilotSignal",
      "AugLoop_CopilotBoards_SubstrateLLMSignal",
      "AugLoop_CopilotBoards_GraphSignal",
      "AugLoop_CopilotBoards_GPTListSignal",
      "AugLoop_CopilotBoards_BingSearchXAPSignal",
      "AugLoop_CopilotBoards_CreateConversationSignal",
      "AugLoop_CopilotBoards_ConversationHistorySignal",
      "AugLoop_CopilotBoards_ConversationMessagesSignal",
      "AugLoop_CopilotBoards_CopilotWarmupSignal",
      "AugLoop_CopilotBoards_ConversationUpdateSignal",
      "AugLoop_OfficeAgent_OfficeAgentAsyncSignal",
      "AugLoop_CameraTranscript_CameraTranscriptSignalV2",
      "AugLoop_VideoGeneration_VideoGenerationSignal",
      "AugLoop_VideoGeneration_VideoGenerationPollSignal",
      "AugLoop_VideoGeneration_VideoGenerationDeleteSignal",
      "AugLoop_AdmincenterFluxCopilot_AdminCenterFluxCopilotInputSignal",
      "AugLoop_AdmincenterFluxCopilot_AdminCenterFluxCopilotProgramResponseSignal",
      "AugLoop_AdmincenterCopilotApp_AdminCenterCopilotInputSignal",
      "AugLoop_AdmincenterCopilotApp_AdminCenterCopilotProgramResponseSignal",
      "AugLoop_AdmincenterPlugins_AdminOdslSkillInput",
      "AugLoop_TeamsAdminAi_TeamsAdminAIRequest",
      "AugLoop_TeamsQueuesIntelligence_TeamsQueuesIntelligenceSignal",
      "AugLoop_PeopleSkills_IndividualSkillsSignal",
      "AugLoop_PeopleSkills_RelatedSkillsSignal",
      "AugLoop_PeopleSkills_UpdateSkillsSignal"
    ],
    "downstreamRuntimeWorkflows": [],
    "H_": {
      "T_": "AugLoop_Session_Protocol_SessionInitResponse",
      "B_": [
        "AugLoop_Session_Protocol_Response"
      ]
    },
    "anonymousToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNjYmI0MzdkYjE1NzQzNWM5MjZhZGI4NTg0MWI5MjI4In0.eyJhcHBpZCI6IjQzNTRlMjI1LTUwYzktNDQyMy05ZWNlLTJkNWFmZDkwNDg3MCIsImlzcyI6Imh0dHBzOi8vYXVnbG9vcC5vZmZpY2UuY29tL2Fub255bW91c1Rva2VuIiwiYXVkIjoiaHR0cHM6Ly9hdWdsb29wLm9mZmljZS5jb20vYW5vbnltb3VzVG9rZW4iLCJpYXQiOjE3NjMxNTE0MjIsIm5iZiI6MTc2MzE1MTEyMiwiZXhwIjoxNzYzMjM3ODIyLCJvaWQiOiJENTdBTEhxYllCeDJUL21adnh2T1c0VDdnZ0tVQkxoRXlCV2xPWjdCcGtvPSIsInNpZCI6ImY2NzRkOGQ1LTFjNjMtNDY3Zi1hMmRmLTU1MmNjZmYyNzVmNyJ9.idG4wkBx_DiYex3U87S3u_u_sV77fTe7qP5vz3J5lKDXwi76iUc9AsG1CTOEgPp4D0ABMHaITHWRKbiAAPo04N18FV5AkErpk9QVKNQhq_OBlzNpHxms2NpyRadCivh9TkxO6eSvdVL88Dhqt1CRWfpHQUfZpSG8akJCpKDdZvTZmj1Fh-h1-KpqiqorMiNVxo8N_LZd8HlYozWt2g-7t8qFHinOPcoRne7vS9CZSmrZZeBYy03dmn1ARrZpDHdax4YHpku4nmb1XmFB6zeI_6j6hqbYuXY7tjjYTjd5oxHjaNzt0dhQ4wNQ8zdX8pEMcVBmxplJHQtsK99T7CNJYw",
    "tokenExpirationTime": 1763237822,
    "tokenExpirationSeconds": 86399,
    "maxRPS": 250,
    "maxBPS": 1000000000
  }
  ```
- send:
  ```json
  {
    "cv": "70sCx6FqgT8Fq1UaLADTPf",
    "seq": 0,
    "ops": [
      {
        "parentPath": [
          "session"
        ],
        "items": [
          {
            "id": "doc",
            "body": {
              "isReadonly": false,
              "H_": {
                "T_": "AugLoop_Core_Document",
                "B_": [
                  "AugLoop_Core_TileGroup"
                ]
              }
            }
          }
        ],
        "H_": {
          "T_": "AugLoop_Core_AddOperation",
          "B_": [
            "AugLoop_Core_OperationWithSiblingContext",
            "AugLoop_Core_Operation"
          ]
        }
      }
    ],
    "groupId": "Seed",
    "groupSize": 1,
    "groupComplete": true,
    "H_": {
      "T_": "AugLoop_Session_Protocol_SyncMessage",
      "B_": [
        "AugLoop_Session_Protocol_Message"
      ]
    },
    "messageId": "c2"
  }
  ```
- receive:
  ```json
  {
    "newStatus": 3,
    "H_": {
      "T_": "AugLoop_Session_Protocol_SeedingStatusChangeMessage",
      "B_": [
        "AugLoop_Session_Protocol_Message"
      ]
    },
    "messageId": "s1"
  }
  ```
- send:
  ```json
  {
    "H_": {
      "T_": "AugLoop_Session_Protocol_Response",
      "B_": []
    },
    "messageId": "s1"
  }
  ```
- receive:
  ```json
  {
    "H_": {
      "T_": "AugLoop_Session_Protocol_SyncResponse",
      "B_": [
        "AugLoop_Session_Protocol_Response"
      ]
    },
    "messageId": "c2"
  }
  ```
- send: `~`
- receive: `~`
