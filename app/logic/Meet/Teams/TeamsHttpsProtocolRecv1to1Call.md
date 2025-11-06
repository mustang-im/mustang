# Teams HTTPS Protocol - Receive 1 to 1 Call

After having loaded the Microsoft Teams website, the following HTTPS requests are made while receiving a 1 to 1 call:
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "scenarions",
    "time": "2025-11-06T19:47:47.762Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 82,
        "epoch": "1628522238"
      },
      "app": {
        "sesId": "3d4007dd-2b7e-454a-ac1a-870621e9235b"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141",
        "screenRes": "0X0",
        "userConsent": false
      },
      "os": {
        "name": "Windows",
        "ver": "NT 10.0"
      },
      "intweb": {},
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "sampleCohortValue": {
            "t": 6
          },
          "sampleRate": {
            "t": 6
          }
        }
      }
    },
    "data": {
      "baseType": "fetch_voicemails",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "CDL",
      "EventInfo": {
        "BaseType": "fetch_voicemails",
        "SpanId": "fae458f112da9785",
        "isNS": "true"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "fetch_voicemails",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"useUpdatedGetVoicemailsPath\",\"delta\":1,\"elapsed\":81969867,\"sequence\":1,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":624,\"elapsed\":81970490,\"sequence\":2,\"stepDelta\":623,\"previousStep\":\"useUpdatedGetVoicemailsPath\"}]",
        "DriftMs": "2196",
        "StepsEx": "[{\"commandSource\":\"CDLWorker\"},{\"commandSource\":\"CDLWorker\",\"callingDataBag\":\"{\\n    \\\"isOwnMailbox\\\": true,\\n  }\"}]"
      },
      "InstanceId": "dcdb33a1-fe65-470b-bd73-fca5a08abdf2",
      "delta": "624",
      "elapsed": "81970490",
      "sequence": "2",
      "stepDelta": "623",
      "previousStep": "useUpdatedGetVoicemailsPath",
      "commandSource": "CDLWorker",
      "callingDataBag": "{\n    \"isOwnMailbox\": true,\n  }",
      "isInEst": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "903d7af8-d328-44b5-9b38-5fdf995e1867"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "embed",
        "Id": "3d4007dd-2b7e-454a-ac1a-870621e9235b",
        "TelemetryContext": "web"
      },
      "AppInfo": {
        "ClientType": "cdlworker",
        "ProcessArchitecture": "x64",
        "Language": "en-us",
        "Locale": "en-us",
        "PlatformId": "1415",
        "Version": "1415/25101616509",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616509",
        "ReactAppVersion": "1415/25101616509",
        "ExperienceName": "react-web-client",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ClientState": "Active",
        "NetworkState": "Online"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7"
      },
      "Panel": {
        "Context": "Worker"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-us",
        "TelemetryRegion": "EMEA",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "Region": "de",
        "IsM365CopilotBusinessChat": "false",
        "IsCopilot": "false",
        "ExpTeamsLicense": "[\"TeamsSmb\"]",
        "ExpTeamsAddOnPlan": "[]",
        "IsSmb": "true"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "CDLWebWorker"
      },
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "telemetryRegionFetchComplete": "true",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  ```
  ```json
  {
    "acc": 1
  }
  ```
- GET `https://teams.microsoft.com/api/mt/emea/beta/tenant/privacyProfile`
  ```json
  {
    "statementUrl": ""
  }
  ```
- POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/forked/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/i1/1227/attach?i=10-128-140-4`
  ```json
  {
    "attach": {
      "requireMediaContent": false,
      "links": {
        "end": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/32620880/call/end/"
      },
      "locationContent": null,
      "networkContent": null,
      "areaContent": null
    },
    "capabilities": null,
    "endpointCapabilities": 72951,
    "additionalActions": [
      {
        "input": {
          "capabilities": null,
          "endpointCapabilities": 72951,
          "conversationRequest": {
            "roster": {
              "type": "Delta",
              "rosterUpdate": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/df617e97/conversation/rosterUpdate/"
            },
            "links": {
              "conversationEnd": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/56f4df91/conversation/conversationEnd/",
              "conversationUpdate": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/00da7a24/conversation/conversationUpdate/",
              "localParticipantUpdate": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/74507316/conversation/localParticipantUpdate/",
              "addParticipantSuccess": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/f959f5e2/conversation/addParticipantSuccess/",
              "addParticipantFailure": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/c104173d/conversation/addParticipantFailure/",
              "receiveMessage": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/43042c9b/conversation/receiveMessage/"
            }
          },
          "endpointMetadata": {},
          "participants": {
            "from": {
              "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
              "displayName": "Neil Rashbrook",
              "endpointId": "c6bcd1a5-b178-418d-82d1-164778781e82",
              "participantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
              "languageId": "en-US"
            }
          }
        },
        "name": "join",
        "url": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA?i=10-128-14-251&e=638979763943068167",
        "waitForResponse": true
      }
    ],
    "debugContent": {
      "ecsEtag": "\"0rGIRosivKTC3J+mxQ+trQRBFfRh1K7XUWHJ6XwnOsg=\""
    }
  }
  ```
  ```json
  {
    "participants": {
      "from": {
        "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
        "displayName": "Ben Bucksch",
        "displayNameSource": "aad",
        "endpointId": "e4b5d04e-2679-4bad-a612-dcb8096c4a2a",
        "languageId": "en-US",
        "participantId": "af1f8d1c-2de6-471d-a2f5-ed392293f08b",
        "hidden": false,
        "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "region": "de",
        "propertyBag": null
      },
      "to": {
        "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "displayName": "Neil Rashbrook",
        "displayNameSource": "runtimeAPI",
        "endpointId": "00000000-0000-0000-0000-000000000000",
        "languageId": null,
        "participantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
        "hidden": false,
        "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "propertyBag": null
      }
    },
    "callInvitation": {
      "callModalities": [
        "audio"
      ],
      "links": {
        "progress": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/incoming/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/t/1298/progress?i=10-128-140-4",
        "newOffer": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/incoming/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/t/1298/mediaOfferRequest?i=10-128-140-4",
        "mediaAnswer": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/incoming/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/t/1298/mediaAnswer?i=10-128-140-4",
        "acceptance": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/incoming/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/t/1298/accept?i=10-128-140-4",
        "redirection": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/incoming/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/t/1298/redirect?i=10-128-140-4",
        "callController": "http://callcontroller.invalid",
        "callLeg": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/incoming/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/t/1298/reject?i=10-128-140-4",
        "subscribe": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-03-prod-aks.broker.skype.com/api/v1/subscribe/040f400d-5525-4597-9354-bdbe6416ee2b/0?i=10-128-60-8",
        "brokerHttpTransport": "http://52.112.124.221/enc"
      },
      "mediaContent": null,
      "replaces": null,
      "voicemailSettings": {}
    },
    "additionalActionResponses": [
      {
        "url": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA?i=10-128-14-251&e=638979763943068167",
        "output": {
          "roster": {
            "participants": {
              "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7": {
                "version": 0,
                "state": "active",
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
                  "e4b5d04e-2679-4bad-a612-dcb8096c4a2a": {
                    "call": {
                      "serverMuteVersion": 0
                    },
                    "endpointCapabilities": 67,
                    "clientEndpointCapabilities": 8812226,
                    "participantId": "af1f8d1c-2de6-471d-a2f5-ed392293f08b",
                    "clientVersion": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
                    "endpointMetadata": {
                      "holographicCapabilities": 3
                    },
                    "endpointMeetingRoles": [
                      "none"
                    ]
                  }
                },
                "role": "admin",
                "meetingRoles": []
              }
            },
            "type": "Delta",
            "sequenceNumber": 0,
            "participantCounts": {
              "totalParticipants": 1,
              "preheatedParticipants": 0,
              "lobbyParticipants": 0,
              "totalPresenters": 0,
              "requestingAttentionPresenters": 0,
              "totalAttendees": 0,
              "requestingAttentionAttendees": 0,
              "overflowAttendeeCount": 0,
              "totalInterpreters": 0,
              "requestingAttentionInterpreters": 0,
              "streamingClients": 0,
              "totalOrganizers": 0
            }
          },
          "conversationController": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA?i=10-128-14-251&e=638979763943068167",
          "sequenceNumber": 1,
          "subject": "",
          "activeModalities": {
            "call": null,
            "realTimeActivityFeed": {
              "links": {}
            }
          },
          "state": {
            "isMultiParty": false,
            "groupCallInitiator": null,
            "isBroadcast": false,
            "isMeetingActivated": false
          },
          "links": {
            "leave": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/leave?i=10-128-14-251&e=638979763943068167",
            "addParticipant": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/addParticipant?i=10-128-14-251&e=638979763943068167",
            "removeParticipant": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/removeParticipant?i=10-128-14-251&e=638979763943068167",
            "addModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/addModality?i=10-128-14-251&e=638979763943068167",
            "addParticipantAndModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/add?i=10-128-14-251&e=638979763943068167",
            "removeModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/removeModality?i=10-128-14-251&e=638979763943068167",
            "mute": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/mute?i=10-128-14-251&e=638979763943068167",
            "unmute": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/unmute?i=10-128-14-251&e=638979763943068167",
            "notificationLinks": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/notificationLinks?i=10-128-14-251&e=638979763943068167",
            "merge": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/merge?i=10-128-14-251&e=638979763943068167",
            "updateEndpointMetadata": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/updateEndpointMetadata?i=10-128-14-251&e=638979763943068167",
            "updateEndpointState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/updateEndpointState?i=10-128-14-251&e=638979763943068167",
            "admit": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/admit?i=10-128-14-251&e=638979763943068167",
            "brokerPublish": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-03-prod-aks.broker.skype.com/api/v1/publish/040f400d-5525-4597-9354-bdbe6416ee2b?i=10-128-60-8",
            "conversationHttpTransport": "http://52.112.120.65/enc",
            "setMeetingLayout": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/setMeetingLayout?i=10-128-14-251&e=638979763943068167",
            "updateParticipantProperties": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/updateParticipantProperties?i=10-128-14-251&e=638979763943068167",
            "publishState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/publishState?i=10-128-14-251&e=638979763943068167",
            "removeState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/removeState?i=10-128-14-251&e=638979763943068167",
            "updateMeetingSettings": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/updateMeetingSettings?i=10-128-14-251&e=638979763943068167",
            "searchParticipants": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/searchParticipants?i=10-128-14-251&e=638979763943068167",
            "getAllParticipants": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/getAllParticipants?i=10-128-14-251&e=638979763943068167",
            "admitAll": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/admitAll?i=10-128-14-251&e=638979763943068167",
            "updateParticipantMapping": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/updateParticipantMapping?i=10-128-14-251&e=638979763943068167",
            "sendMessage": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/sendMessage?i=10-128-14-251&e=638979763943068167",
            "updateMeetingStates": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/updateMeetingStates?i=10-128-14-251&e=638979763943068167"
          },
          "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
          "region": "de",
          "subscriptionDetails": {
            "selfParticipant": {
              "version": 0,
              "state": "active",
              "details": {
                "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
                "displayName": "Neil Rashbrook",
                "displayNameSource": "unknown",
                "propertyBag": null,
                "resourceId": null,
                "participantType": "inTenant",
                "endpointId": "00000000-0000-0000-0000-000000000000",
                "participantId": null,
                "languageId": null,
                "hidden": false,
                "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
              },
              "endpoints": null,
              "role": "admin",
              "meetingRoles": []
            }
          },
          "streamingSetupFailureDebugInfo": null,
          "layoutDetails": null,
          "compositionServiceDetails": null,
          "originalGroupCallInitiator": null,
          "creatorClientVersion": null,
          "conversationStartTime": "2025-11-06T19:48:29.3891948Z"
        },
        "name": "join"
      }
    ],
    "debugContent": {
      "callId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "participantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122"
    }
  }
  ```
- POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/incoming/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/t/1298/progress?i=10-128-140-4`
  ```json
  {
    "callProgress": {
      "sender": {
        "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "displayName": "Neil Rashbrook",
        "endpointId": "c6bcd1a5-b178-418d-82d1-164778781e82",
        "participantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
        "languageId": "en-US"
      },
      "status": "ringing",
      "phrase": "ringing"
    }
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-03-prod-aks.broker.skype.com/api/v1/subscribe/040f400d-5525-4597-9354-bdbe6416ee2b/0?i=10-128-60-8`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-03-prod-aks.broker.skype.com/api/v1/subscribe/040f400d-5525-4597-9354-bdbe6416ee2b/0?i=10-128-60-8",
    "expirationTimeInSec": 30
  }
  ```
- GET `https://teams.microsoft.com/api/mt/emea/beta/tenant/privacyProfile`
  ```json
  {
    "statementUrl": ""
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-03-prod-aks.broker.skype.com/api/v1/subscribe/040f400d-5525-4597-9354-bdbe6416ee2b/0?i=10-128-60-8`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-03-prod-aks.broker.skype.com/api/v1/subscribe/040f400d-5525-4597-9354-bdbe6416ee2b/0?i=10-128-60-8",
    "expirationTimeInSec": 30
  }
  ```
- PUT `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Acalllogs/properties?name=consumptionhorizon`
  ```json
  {
    "consumptionhorizon": "1762376614222;1762458516351;1762376614222"
  }
  ```
- PUT `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Acalllogs/properties?name=consumptionhorizon`
  ```json
  {
    "consumptionhorizon": "1762376614222;1762458516357;1762376614222"
  }
  ```
- PUT `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Acalllogs/properties?name=consumptionhorizon`
  ```json
  {
    "consumptionhorizon": "1762376614222;1762458516369;1762376614222"
  }
  ```
- PUT `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Acalllogs/properties?name=consumptionhorizon`
  ```json
  {
    "consumptionhorizon": "1762376614222;1762458516383;1762376614222"
  }
  ```
- GET `https://graph.microsoft.com/v1.0/sites/?filter=siteCollection/root%20ne%20null%20or%20siteCollection/customRoot%20ne%20null%20or%20siteCollection/mySiteRoot%20ne%20null&select=webUrl,siteCollection&VroomTakeover=1`
  ```json
  {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#sites",
    "value": [
      {
        "webUrl": "https://beonex.sharepoint.com/",
        "siteCollection": {
          "hostname": "beonex.sharepoint.com",
          "root": {}
        }
      },
      {
        "webUrl": "https://beonex-my.sharepoint.com/",
        "siteCollection": {
          "hostname": "beonex-my.sharepoint.com"
        }
      }
    ]
  }
  ```
- GET `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Asharedcalllogs?view=msnp24Equivalent`
  ```json
  {
    "errorCode": 404,
    "message": "{\"errorCode\":404,\"message\":\"Conversation was not found\",\"subErrorCode\":\"RequestHandlerException\"}",
    "standardizedError": {
      "errorCode": 404,
      "errorSubCode": 1,
      "errorSubCodeString": "RequestHandlerException",
      "errorDescription": "RequestHandlerException-Conversation was not found"
    }
  }
  ```
- POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-03-prod-aks.conv.skype.com/conv/M8Hp2luHo02MwifEUzncZA/updateEndpointState?i=10-128-14-251&e=638979763943068167`
  ```json
  {
    "from": {
      "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "displayName": "Neil Rashbrook",
      "endpointId": "c6bcd1a5-b178-418d-82d1-164778781e82",
      "participantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
      "languageId": "en-US"
    },
    "endpointState": {
      "state": {
        "isMuted": false
      },
      "endpointProperties": {
        "additionalEndpointProperties": {
          "infoShownInReportMode": "FullInformation"
        }
      },
      "endpointStateSequenceNumber": 1
    }
  }
  ```
- GET `https://graph.microsoft.com/v1.0/domains/?$select=id,isVerified`
  ```json
  {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#domains(id,isVerified)",
    "value": [
      {
        "id": "beonex.onmicrosoft.com",
        "isVerified": true
      }
    ]
  }
  ```
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/wasmvqe-web-worker-inner-0a9f758aa0651078.js`
- POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/incoming/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/t/1298/accept?i=10-128-140-4`
  ```json
  {
    "callAcceptance": {
      "acceptedBy": {
        "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "displayName": "Neil Rashbrook",
        "endpointId": "c6bcd1a5-b178-418d-82d1-164778781e82",
        "participantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
        "languageId": "en-US"
      },
      "acceptedCallModalities": [
        "Audio"
      ],
      "capabilities": null,
      "endpointCapabilities": 72951,
      "clientEndpointCapabilities": 8812266,
      "links": {
        "mediaRenegotiation": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/5d2443d0/call/mediaRenegotiation/",
        "transfer": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/d8e178aa/call/transfer/",
        "replacement": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/e7357491/call/replacement/",
        "balanceUpdate": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/5df2b3c1/call/balanceUpdate/",
        "retargetCompletion": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/1c21b3f7/call/retargetCompletion/",
        "controlVideoStreaming": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/2dc0c446/call/controlVideoStreaming/",
        "updateMediaDescriptions": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/276eaad8/call/updateMediaDescriptions"
      },
      "clientContentForMediaController": {
        "controlVideoStreaming": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/de97e309/call/controlVideoStreaming/",
        "csrcInfo": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/d6cbad27/call/csrcInfo/",
        "dominantSpeakerInfo": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/e32dac1b-b777-4fa3-a319-4d5b8c6c98ed/fb522356/call/dominantSpeakerInfo/"
      },
      "mediaContent": {
        "blob": "v=0\r\no=- 24412771496575065 2 IN IP4 127.0.0.1\r\ns=-\r\nb=CT:4000\r\nt=0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS *\r\na=group:BUNDLE 0 1 3\r\nm=audio 62513 RTP/SAVP 96 109 9 0 8 101\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app recv:dsh\r\na=x-ssrc-range:3615918952-3615918952\r\na=rtpmap:96 CN/48000\r\na=rtpmap:109 opus/48000/2\r\na=rtpmap:9 G722/8000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:101 telephone-event/8000\r\na=fmtp:109 minptime=10;useinbandfec=1\r\na=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=setup:active\r\na=mid:0\r\na=msid:b2faad19-aad1-4a21-aff3-de06fe0cf0f2 0ef28e72-8363-4b52-9c5c-c257fe411de8\r\na=sendrecv\r\na=ice-ufrag:ZZ6b\r\na=ice-pwd:5ZQ5oF/rt5mHp10UJNZ4YjwN\r\na=fingerprint:sha-256 C8:31:72:48:F1:D6:00:23:A0:9F:08:77:5C:D4:95:79:14:EB:61:39:57:3D:E1:7D:8C:F2:26:B7:77:E7:3B:A2\r\na=candidate:2190757530 1 udp 2122260223 192.168.255.11 62513 typ host\r\na=ice-options:trickle\r\na=ssrc:3615918952 cname:SqkLuKuMehKZhXcn\r\na=rtcp-mux\r\na=label:main-audio\r\nm=video 62513 RTP/SAVP 120 124 121 125 126 127 97 98 105 106 103 104 99 100 123 122 119\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=rtpmap:120 VP8/90000\r\na=rtpmap:124 rtx/90000\r\na=rtpmap:121 VP9/90000\r\na=rtpmap:125 rtx/90000\r\na=rtpmap:126 H264/90000\r\na=rtpmap:127 rtx/90000\r\na=rtpmap:97 H264/90000\r\na=rtpmap:98 rtx/90000\r\na=rtpmap:105 H264/90000\r\na=rtpmap:106 rtx/90000\r\na=rtpmap:103 H264/90000\r\na=rtpmap:104 rtx/90000\r\na=rtpmap:99 AV1/90000\r\na=rtpmap:100 rtx/90000\r\na=rtpmap:123 ulpfec/90000\r\na=rtpmap:122 red/90000\r\na=rtpmap:119 rtx/90000\r\na=fmtp:124 apt=120\r\na=fmtp:121 profile-id=0\r\na=fmtp:125 apt=121\r\na=fmtp:126 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:127 apt=126\r\na=fmtp:97 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f\r\na=fmtp:98 apt=97\r\na=fmtp:105 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=fmtp:106 apt=105\r\na=fmtp:103 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f\r\na=fmtp:104 apt=103\r\na=fmtp:99 level-idx=5;profile=0;tier=0\r\na=fmtp:100 apt=99\r\na=fmtp:119 apt=122\r\na=rtcp-fb:120 goog-remb\r\na=rtcp-fb:120 transport-cc\r\na=rtcp-fb:120 ccm fir\r\na=rtcp-fb:120 nack\r\na=rtcp-fb:120 nack pli\r\na=rtcp-fb:121 goog-remb\r\na=rtcp-fb:121 transport-cc\r\na=rtcp-fb:121 ccm fir\r\na=rtcp-fb:121 nack\r\na=rtcp-fb:121 nack pli\r\na=rtcp-fb:126 goog-remb\r\na=rtcp-fb:126 transport-cc\r\na=rtcp-fb:126 ccm fir\r\na=rtcp-fb:126 nack\r\na=rtcp-fb:126 nack pli\r\na=rtcp-fb:97 goog-remb\r\na=rtcp-fb:97 transport-cc\r\na=rtcp-fb:97 ccm fir\r\na=rtcp-fb:97 nack\r\na=rtcp-fb:97 nack pli\r\na=rtcp-fb:105 goog-remb\r\na=rtcp-fb:105 transport-cc\r\na=rtcp-fb:105 ccm fir\r\na=rtcp-fb:105 nack\r\na=rtcp-fb:105 nack pli\r\na=rtcp-fb:103 goog-remb\r\na=rtcp-fb:103 transport-cc\r\na=rtcp-fb:103 ccm fir\r\na=rtcp-fb:103 nack\r\na=rtcp-fb:103 nack pli\r\na=rtcp-fb:99 goog-remb\r\na=rtcp-fb:99 transport-cc\r\na=rtcp-fb:99 ccm fir\r\na=rtcp-fb:99 nack\r\na=rtcp-fb:99 nack pli\r\na=extmap:4 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:7 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=setup:active\r\na=mid:1\r\na=inactive\r\na=ice-ufrag:ZZ6b\r\na=ice-pwd:5ZQ5oF/rt5mHp10UJNZ4YjwN\r\na=fingerprint:sha-256 C8:31:72:48:F1:D6:00:23:A0:9F:08:77:5C:D4:95:79:14:EB:61:39:57:3D:E1:7D:8C:F2:26:B7:77:E7:3B:A2\r\na=ice-options:trickle\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 0 RTP/SAVP 34\r\nm=x-data 62513 RTP/SAVP 127 126\r\nc=IN IP4 192.168.255.11\r\na=x-data-protocol:sctp\r\na=x-ssrc-range:2024831195-2024831195\r\na=rtpmap:127 x-data/90000\r\na=rtpmap:126 rtx/90000\r\na=fmtp:126 apt=127\r\na=setup:active\r\na=mid:3\r\na=sendrecv\r\na=ice-ufrag:ZZ6b\r\na=ice-pwd:5ZQ5oF/rt5mHp10UJNZ4YjwN\r\na=fingerprint:sha-256 C8:31:72:48:F1:D6:00:23:A0:9F:08:77:5C:D4:95:79:14:EB:61:39:57:3D:E1:7D:8C:F2:26:B7:77:E7:3B:A2\r\na=ice-options:trickle\r\na=rtcp-mux\r\na=label:data\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n",
        "contentType": "application/sdp-ngc-1.0",
        "clientLocation": "GB",
        "applyChannelParameters": {
          "multiChannelParameter": {
            "mids": [
              "*"
            ],
            "mediaParameter": "{\"sendSideBWSeed\":{\"seedValueBitsPerSec\":402592}}"
          }
        },
        "mediaLegId": "B0C08CA48E1647F0B35CECCE4EE995C0"
      },
      "pstnContent": {
        "emergencyCallCountry": "",
        "platformName": "SkypeSpaces/1415/25101616509/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
        "publicApiCall": false
      },
      "callKeepAliveInterval": null
    }
  }
  ```
  ```json
  {
    "callAcceptanceAcknowledgement": {
      "links": {
        "callLeg": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/active/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/a4/1299?i=10-128-140-4&e=638979269812626281",
        "mediaRenegotiation": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/active/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/a4/1299/renegotiate?i=10-128-140-4&e=638979269812626281",
        "transfer": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/active/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/a4/1299/transfer?i=10-128-140-4&e=638979269812626281",
        "replacement": "https://cc-frce-08-prod-aks.cc.skype.com:443/cc/v1/callParticipant/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/13/k3/490/replacement?rt=af1f8d1c2de6471da2f5ed392293f08b&rc=eyJydGlkIjoiODpvcmdpZDo1MGExN2E5My03ZTMzLTQ0ZjEtYmFlZi04ZjIzNDQ1N2YzZTciLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5IiwicnRwZnMiOnt9fQ%253D%253D&i=10-128-140-4&e=638979269812626281",
        "startOutgoingNegotiation": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/active/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/a4/1299/startOutgoingNegotiation?i=10-128-140-4&e=638979269812626281",
        "hold": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/active/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/a4/1299/hold?i=10-128-140-4&e=638979269812626281",
        "monitor": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-08-prod-aks.cc.skype.com/cc/v1/active/fe036d8d-c747-4e15-8f84-5d7a2adabbd1/27/a4/1299/monitor?i=10-128-140-4&e=638979269812626281",
        "controlVideoStreaming": "https://pub-ent-euwe-13-f.trouter.teams.microsoft.com:3443/v4/f/K1cv_RtuR0GY3mZb5QjcPw/callAgent/4fbc4b49-cfe2-4ebd-810a-13151596b29f/8feb22ad/call/controlVideoStreaming/",
        "updateMediaDescriptions": "https://pub-ent-euwe-13-f.trouter.teams.microsoft.com:3443/v4/f/K1cv_RtuR0GY3mZb5QjcPw/callAgent/4fbc4b49-cfe2-4ebd-810a-13151596b29f/1c90e836/call/updateMediaDescriptions"
      },
      "callKeepAliveInterval": 2700
    },
    "debugContent": null
  }
  ```
- PUT `https://teams.microsoft.com/ups/emea/v1/me/endpoints/`
  ```json
  {
    "availability": "Busy",
    "activity": "InACall",
    "id": "611e9e3d-02e3-46dd-a329-e9f52b211c54",
    "activityReporting": "Transport",
    "deviceType": "Web"
  }
  ```
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&ext.intweb.msfpc=GUID%3Dfbce5a52cc8f449f8a49e147bd2d3f25%26HASH%3Dfbce%26LV%3D202510%26V%3D4%26LU%3D1761758803913&w=0&content-encoding=gzip`
  ```json
  {
    "name": "skypecosi_concore_web_ts_calling_call_setup_session",
    "time": "2025-11-06T19:48:40.689Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 7,
        "installId": "e01734fd-ae1c-499b-b453-6041a5f01798",
        "epoch": "235386963"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "P1AqXxNU2Yxgnc1zUac0A6"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
        "browserVer": "141.0.7390.67",
        "screenRes": "1024X768",
        "userConsent": false
      },
      "os": {
        "name": "Windows",
        "ver": "10"
      },
      "intweb": {
        "msfpc": "GUID=fbce5a52cc8f449f8a49e147bd2d3f25&HASH=fbce&LV=202510&V=4&LU=1761758803913"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "user_id": {
            "t": 321
          },
          "Skype_InitiatingUser_Username": {
            "t": 321
          },
          "SkypeId": {
            "t": 321
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "LocalStorage=4.3.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.1"
        }
      },
      "user_id": "u11",
      "Skype_InitiatingUser_Username": "u11",
      "SkypeId": "u11",
      "ui_version": "1415/25101616509",
      "CorrelationId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "PreviousCorrelationId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "EndpointId": "c6bcd1a5-b178-418d-82d1-164778781e82",
      "ParticipantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
      "CallType": "1",
      "Direction": "Incoming",
      "Origin": "0",
      "SelfParticipantRole": "callee",
      "Ring": "general",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "Region": "de",
      "Partition": "de01",
      "IsHuddleGroupCall": "True",
      "IsEmergency": "False",
      "TsCallingVersion": "2025.40.01.4",
      "EventTimestampBag": "{\"eventStart\":1762458509445,\"events\":[{\"_SetCallOrigin\":{\"start\":3,\"causeId\":\"f3b77b32\",\"data\":[{\"origin\":0}]}},{\"Initialize\":{\"start\":186,\"duration\":9,\"status\":\"Success\",\"causeId\":\"3eab5c7e\"}},{\"Acknowledge\":{\"start\":204,\"duration\":730,\"status\":\"Success\",\"result\":{\"code\":1},\"causeId\":\"f3b83a0d\",\"data\":[{\"phases\":{\"ProcessIncomingCallRequest\":{\"t\":2},\"ResolvePotentialConflict\":{\"t\":0},\"SendAttach\":{\"t\":630},\"InitializeMediaSession\":{\"t\":27},\"WaitForMediaOffer\":{\"t\":1},\"ProcessOffer\":{\"t\":27},\"ProcessOfferedModalities\":{\"t\":14},\"TrySendingProvisionalAnswer\":{\"t\":60},\"OnAcknowledgeSuccess\":{\"t\":0}}}]}},{\"_SignalingStateChanged\":{\"start\":209,\"causeId\":\"f3b83a0d\",\"data\":[{\"status\":\"Idle\"}]}},{\"CreatingConference\":{\"start\":212,\"causeId\":\"f3b83a0d\"}},{\"_ReinvitelessConfig\":{\"start\":212,\"causeId\":\"f3b83a0d\",\"data\":[{\"reinvitelessConfig\":{\"maxReinvitelessMediaForVBSSMultiparty\":0,\"maxReinvitelessMediaForVideoMultiparty\":0}}]}},{\"CreatedConference\":{\"start\":237,\"causeId\":\"f3b83a0d\"}},{\"_WebOnOffer\":{\"start\":597,\"causeId\":\"f3b83a0d\",\"data\":[{\"isRenegotiation\":false,\"isEscalation\":false,\"mediaTypes\":[\"Audio\"],\"newOffer\":false}]}},{\"_UpdateLocalParticipantStream\":{\"start\":814,\"causeId\":\"f3b83a0d\"}},{\"_ParticipantJoined\":{\"start\":826,\"duration\":0,\"status\":\"Success\",\"result\":[{\"participantId\":\"af1f8d1c-2de6-471d-a2f5-ed392293f08b\"}],\"causeId\":\"f3b83a0d\"}},{\"_SignalingStateChanged\":{\"start\":836,\"causeId\":\"f3b83a0d\",\"data\":[{\"status\":\"Ringing\"}]}},{\"_SetCallState\":{\"start\":839,\"causeId\":\"f3b83a0d\",\"data\":[{\"state\":1,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":870,\"causeId\":\"f3b83a0d\",\"data\":[{\"state\":1,\"reason\":0}]}},{\"Accept\":{\"start\":6717,\"duration\":4455,\"status\":\"Success\",\"causeId\":\"1fc0fa35\",\"data\":[{\"phases\":{\"UpdateMediaModalities\":{\"t\":332},\"GetSignalingMediaTypes\":{\"t\":0},\"evaluateEndpointStatesForAccept\":{\"t\":55},\"MuteUnmuteSpeakers\":{\"t\":6},\"handleEndpointStatesForAccept\":{\"t\":2622},\"CreateAnswer\":{\"t\":3130},\"Accept\":{\"t\":283},\"WaitForConnect\":{\"t\":13},\"CompleteNegotiation\":{\"t\":586}}}]}},{\"_setMaxVbssChannels\":{\"start\":6717,\"causeId\":\"1fc0fa35\",\"data\":[{}]}},{\"_SetCallState\":{\"start\":6723,\"causeId\":\"1fc0fa35\",\"data\":[{\"state\":2,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":6737,\"causeId\":\"1fc0fa35\",\"data\":[{\"state\":2,\"reason\":0}]}},{\"_SetLocalAudio\":{\"start\":6738,\"causeId\":\"1fc0fa35\",\"data\":[{\"value\":true}]}},{\"_SignalingStateChanged\":{\"start\":10478,\"causeId\":\"1fc0fa35\",\"data\":[{\"status\":\"Connected\"}]}},{\"_SetCallState\":{\"start\":10478,\"causeId\":\"1fc0fa35\",\"data\":[{\"state\":3,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":10547,\"causeId\":\"1fc0fa35\",\"data\":[{\"state\":3,\"reason\":0}]}}]}",
      "HostName": "teams.microsoft.com",
      "ComplianceRecordingContentLength": "0",
      "ConversationStartTime": "2025-11-06T19:48:29.3891948Z",
      "ClientType": "enterprise",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-2-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "de",
      "Call.Type": "oneToOneCall",
      "Call.IsChatVersion2": "true",
      "Call.Id": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "Call.ParticipantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
      "Call.WasPoppedOut": "true",
      "AppInfo.UserRole": "Member",
      "AppInfo.UserType": "Aad",
      "DeviceInfo.Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  {
    "name": "mdsc_webrtc_session_initial",
    "time": "2025-11-06T19:48:41.356Z",
    "ver": "4.0",
    "iKey": "o:1cae5691997646c98b01d15beddae7a3",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 8,
        "installId": "e01734fd-ae1c-499b-b453-6041a5f01798",
        "epoch": "235386963"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "P1AqXxNU2Yxgnc1zUac0A6"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
        "browserVer": "141.0.7390.67",
        "screenRes": "1024X768",
        "userConsent": false
      },
      "os": {
        "name": "Windows",
        "ver": "10"
      },
      "intweb": {
        "msfpc": "GUID=fbce5a52cc8f449f8a49e147bd2d3f25&HASH=fbce&LV=202510&V=4&LU=1761758803913"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "Extensions_IPAddress": {
            "t": 417
          },
          "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalAddress": {
            "t": 417
          },
          "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteAddress": {
            "t": 417
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "LocalStorage=4.3.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.1"
        }
      },
      "uiVersion": "1415/25101616509",
      "agent_environment_id": "7e382dd6-ac2d-4d04-89f4-557f526a5396",
      "CorrelationId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "participant_id": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
      "endpoint_id": "c6bcd1a5-b178-418d-82d1-164778781e82",
      "media_leg_id": "B0C08CA48E1647F0B35CECCE4EE995C0",
      "ts_calling_version": "2025.40.01.4",
      "metrics_MediaLegId": "B0C08CA48E1647F0B35CECCE4EE995C0",
      "metrics_CreationTime": "17624585096670000",
      "metrics_CallNumber": "2",
      "metrics_SessionId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "metrics_MultiParty": "false",
      "metrics_ErrorType": "none",
      "metrics_IncompatibleOffer": "false",
      "metrics_TerminationTime": "NaN",
      "metrics_CallDuration": "116720000",
      "metrics_IceInitTime": "17624585196560000",
      "metrics_IceConnectedStateTime": "0",
      "metrics_NegotiationCount": "1",
      "metrics_RejectedNegotiationCount": "0",
      "metrics_InitialNegotiationCompleted": "true",
      "metrics_InitialNegotiationType": "Answering",
      "metrics_FinalAnswerTime": "17624585200250000",
      "metrics_TransportReconnectedCount": "0",
      "metrics_Relay": "{\"address\":\"euaz.relay.teams.microsoft.com\",\"expires\":604800,\"realm\":\"\\\"rtcmedia\\\"\",\"credentials\":true,\"ports\":\"udp:3478,tcp:443,tls:443\",\"fqdns\":\"euaz.relay.teams.microsoft.com\"}",
      "metrics_ActiveModalities": "{\"audio\":\"sendrecv\",\"video\":\"inactive\",\"data\":\"sendrecv\"}",
      "metrics_AllowedAudioSend": "true",
      "metrics_AllowedVideoSend": "true",
      "metrics_AllowedScreensharingSend": "true",
      "metrics_RelayManager": "{\"config\":{\"Service\":{\"url\":\"https://teams.microsoft.com/trap\",\"tokenUrl\":\"https://teams.microsoft.com/trap/tokens\",\"disabled\":false,\"supportedTokenTypes\":\"skype AAD CAE\"},\"Relay\":{\"Turn\":{\"realm\":\"rtcmedia\",\"addresses\":[\"euaz.relay.teams.microsoft.com\"],\"fqdns\":[\"euaz.relay.teams.microsoft.com\"],\"tcpPort\":443,\"tlsPort\":443,\"udpPort\":3478,\"url\":\"\"},\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478,\"Lync\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478},\"Skype\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478}},\"Token\":{\"earlyRefreshMinutes\":9720,\"earlyRefreshPercentage\":4}},\"stats\":{\"configFetch\":{\"time\":1762449108008,\"duration\":480,\"version\":2},\"skypeTokenFetch\":{\"time\":1762449108488,\"duration\":137,\"version\":2},\"configFetch_prev\":{\"time\":1762424912797,\"duration\":340,\"version\":2},\"skypeTokenFetch_prev\":{\"time\":1762424913137,\"duration\":315,\"version\":2}}}",
      "metrics_AuthTokenStats": "{\"tokenType\":1,\"errors\":[]}",
      "metrics_CallMutedRatio": "0",
      "metrics_CallOsMuted": "0",
      "metrics_CallHwSilent": "0",
      "metrics_CallSwMuted": "0",
      "metrics_CallSpeakerMuted": "0",
      "metrics_CallIsSpeaking": "0",
      "metrics_DtmfSuccess": "0",
      "metrics_DtmfFailure": "0",
      "metrics_ReconnectInProgress": "false",
      "metrics_RetargetIncomingCount": "0",
      "metrics_RetargetOutgoingCount": "0",
      "metrics_RetargetCompletedCount": "0",
      "metrics_RetargetRejectedCount": "0",
      "metrics_EscalationAttemptedCount": "0",
      "metrics_EscalationCompletedCount": "0",
      "metrics_EscalationRejectedCount": "0",
      "metrics_ReconnectAttemptedCount": "0",
      "metrics_ReconnectConnectedCount": "0",
      "metrics_NoIceCandidatesGoodEventCount": "0",
      "metrics_NoIceCandidatesBadEventCount": "0",
      "metrics_NoRelayIceCandidatesGoodEventCount": "0",
      "metrics_NoRelayIceCandidatesBadEventCount": "0",
      "metrics_MicrophoneInUseGoodEventCount": "0",
      "metrics_MicrophoneInUseBadEventCount": "0",
      "metrics_CameraInUseGoodEventCount": "0",
      "metrics_CameraInUseBadEventCount": "0",
      "metrics_CameraFreezeStartEventCount": "0",
      "metrics_CameraFreezeEndEventCount": "0",
      "metrics_NetworkRecvGood": "1",
      "metrics_NetworkRecvGoodRatio": "1",
      "metrics_NetworkRecvPoor": "0",
      "metrics_NetworkRecvPoorRatio": "0",
      "metrics_NetworkRecvBad": "0",
      "metrics_NetworkRecvBadRatio": "0",
      "metrics_NetworkSendGood": "1",
      "metrics_NetworkSendGoodRatio": "1",
      "metrics_NetworkSendPoor": "0",
      "metrics_NetworkSendPoorRatio": "0",
      "metrics_NetworkSendBad": "0",
      "metrics_NetworkSendBadRatio": "0",
      "metrics_Connection_Downlink": "5",
      "metrics_Connection_EffectiveType": "4g",
      "metrics_Connection_Rtt": "50",
      "metrics_Connection_SaveData": "false",
      "metrics_RawOutputAudioAccessAttempted": "0",
      "metrics_RawOutputAudioAccessDurationRatio": "0",
      "metrics_RawInputAudioOverrideAttempted": "0",
      "metrics_RawInputAudioOverrideDurationRatio": "0",
      "metrics_ZeroCaptureDevicesEnumeratedEventRatio": "0",
      "metrics_ZeroRenderDevicesEnumeratedEventRatio": "0",
      "metrics_DeviceCaptureNotFunctioningEventRatio": "0",
      "metrics_DeviceRenderNotFunctioningEventRatio": "0",
      "metrics_MediaQosEnabled": "false",
      "metrics_PortRangeConfigured": "false",
      "metrics_hardwareConcurrency": "4",
      "metrics_ETag": "\"0rGIRosivKTC3J+mxQ+trQRBFfRh1K7XUWHJ6XwnOsg=\"",
      "metrics_ConfigIds": "P-E-1716081-C1-6,P-E-1713802-2-6,P-E-1713707-C1-6,P-E-1713684-C1-6,P-E-1712881-2-6,P-E-1708523-2-8,P-E-1704515-2-6,P-E-1700450-2-7,P-E-1694641-2-6,P-E-1691036-2-6,P-E-1680105-2-6,P-E-1676936-C1-6,P-E-1675286-2-6,P-E-1670133-2-6,P-E-1660458-C1-5,P-E-1658080-C1-11,P-E-1656524-2-6,P-E-1655667-2-6,P-E-1653089-3-8,P-E-1651332-2-6,P-E-1643648-2-6,P-E-1641797-C1-6,P-E-1633843-2-6,P-E-1621471-2-6,P-E-1618933-2-6,P-E-1617149-2-6,P-E-1616887-2-6,P-E-1616819-2-6,P-E-1613942-2-6,P-E-1608951-C1-3,P-E-1608371-2-6,P-E-1604926-C1-5,P-E-1598909-C1-6,P-E-1595894-2-6,P-E-1575172-2-5,P-E-1574158-2-10,P-E-1570390-2-6,P-E-1566952-C1-6,P-E-1568381-C1-6,P-E-1566716-C1-10,P-E-1565836-2-6,P-E-1565831-2-6,P-R-1665746-12-10,P-R-1645583-12-13,P-R-1634465-12-13,P-R-1633491-12-13,P-R-1632047-12-13,P-R-1630681-C11-9,P-R-1613099-12-10,P-R-1611700-12-14,P-R-1606855-12-14,P-R-1598296-12-12,P-R-1587774-12-12,P-R-1584387-12-13,P-R-1580901-12-15,P-R-1577920-12-13,P-R-1577892-18-3,P-R-1575005-12-10,P-R-1563326-12-14,P-R-1558616-12-17,P-R-1553816-12-12,P-R-1551350-12-15,P-R-1543947-12-13,P-R-1523352-12-14,P-R-1534344-12-13,P-R-1521918-12-9,P-R-1475504-12-14,P-R-1477139-12-19,P-R-1472589-12-28,P-R-1470220-12-11,P-R-1282626-12-35,P-R-1458723-12-13,P-R-1457926-12-2,P-R-1446888-12-17,P-R-1442911-12-17,P-R-1442161-12-17,P-R-1438633-12-12,P-R-1417298-12-18,P-R-1416330-12-20,P-R-1102981-9-69,P-R-1270215-12-8,P-R-1264668-12-16,P-R-1262976-12-11,P-R-1223031-9-9,P-R-1244045-18-14,P-R-1175069-9-8,P-R-1226424-9-4,P-R-1224690-9-9,P-R-1168166-9-10,P-R-1160589-9-7,P-R-1156430-9-6,P-R-1154814-3-6,P-R-1150013-9-11,P-R-1148658-9-8,P-R-1141462-9-23,P-R-1136249-9-9,P-R-1133113-9-8,P-R-1130598-9-10,P-R-1128207-9-28,P-R-1117564-9-10,P-R-1111900-9-79,P-R-1111902-9-11,P-R-1101306-9-6,P-R-1096762-9-24,P-R-1082715-9-35,P-R-1082433-9-23,P-R-1082359-9-14,P-R-1082351-9-12,P-R-1080906-6-6,P-R-1070816-6-19,P-R-1070395-1-8,P-R-1036090-19-62,P-R-1016745-11-11,P-R-1006078-1-32,P-R-115866-10-27,P-R-107136-10-42,P-R-96498-10-27,P-R-95572-41-185,P-R-94120-1-6,P-R-88231-9-17,P-R-79878-11-70,P-R-71785-7-16,P-R-63313-1-4,P-D-38372-1-4,P-D-27831-1-40,pe1716081c1:1033550,pe17138022:1031142,pe1713707c1:1031006,pe1713684c1:1030981,pe17128812:1030029,pe17085232:1033251,pe17045152:1023158,pe17004502:1027959,pe16946412:1018058,pe16910362:1013539,pe16801052:1010383,pe1676936c1:1006853,pe16752862:1005633,pe16701332:1002053,pe1660458c1:304475,pe1658080c1:1010368,pe16565242:301668,pe16556672:300926,pe16530893:301201,pe16513322:296134,pe16436482:288428,pe1641797c1:286186,pe16338432:277836,pe16214712:266864,pe16189332:264581,pe16171492:262972,pe16168872:262654,pe16168192:262662,pe16139422:260005,pe16083712:254400,pe1604926c1:250956,pe1598909c1:245917,pe15958942:241863,pe15751722:222344,pe15741582:224394,pe15703902:219213,pe1568381c1:218197,pe1566716c1:228730,pe15658362:216043,pe15658312:216047",
      "metrics_GPUName": "ANGLE (Intel, Intel(R) HD Graphics Direct3D9Ex vs_3_0 ps_3_0, igdumd64.dll)",
      "metrics_PermissionStates": "{\"microphone\":\"granted\",\"camera\":\"granted\"}",
      "metrics_DeviceList": "[{\"label\":\"046d:0825 Cam\",\"kind\":\"microphone\"},{\"label\":\"046d:0825 Cam\",\"kind\":\"camera\"},{\"label\":\"High Definition\",\"kind\":\"speaker\"}]",
      "metrics_DeviceListDebug": "{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}",
      "metrics_DevicesChangeCount": "0",
      "metrics_DevicesPollChangeCount": "0",
      "metrics_DeviceSelectionChangeCount": "0",
      "metrics_DeviceSelectionChangeFromInterfaceCount": "0",
      "metrics_DevicesCount": "{\"microphone\":1,\"camera\":1,\"speaker\":1,\"compositeAudio\":0,\"audioIngestDevice\":0,\"virtualDevice\":0}",
      "metrics_DeviceEnumerationTimings": "{\"max\":1112,\"min\":6,\"avg\":78}",
      "metrics_UsedMicrophone": "046d:0825 Cam",
      "metrics_UsedSpeaker": "High Definition",
      "metrics_UsedCamera": "046d:0825 Cam",
      "metrics_DeviceEvents": "[{\"eventType\":\"stream_disposed\",\"timestamp\":-81896172,\"payload\":{\"id\":0,\"mediaType\":\"Audio\"}},{\"eventType\":\"devices_changed\",\"timestamp\":-4187,\"payload\":{\"devices\":[{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{\"autoGainControl\":[true,false],\"channelCount\":{\"max\":1,\"min\":1},\"echoCancellation\":[true,false,\"remote-only\"],\"latency\":{\"max\":0.01,\"min\":0},\"noiseSuppression\":[true,false],\"sampleRate\":{\"max\":48000,\"min\":48000},\"sampleSize\":{\"max\":16,\"min\":16},\"voiceIsolation\":[true,false]},\"groupId\":\"1\"},{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{},\"groupId\":\"1\"},{\"label\":\"High Definition\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"2\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"devices_changed\",\"timestamp\":-1046,\"payload\":{\"devices\":[{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{\"autoGainControl\":[true,false],\"channelCount\":{\"max\":1,\"min\":1},\"echoCancellation\":[true,false,\"remote-only\"],\"latency\":{\"max\":0.01,\"min\":0},\"noiseSuppression\":[true,false],\"sampleRate\":{\"max\":48000,\"min\":48000},\"sampleSize\":{\"max\":16,\"min\":16},\"voiceIsolation\":[true,false]},\"groupId\":\"1\"},{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{\"aspectRatio\":{\"max\":1280,\"min\":0.0010416666666666667},\"facingMode\":[],\"frameRate\":{\"max\":30,\"min\":1},\"height\":{\"max\":960,\"min\":1},\"resizeMode\":[\"none\",\"crop-and-scale\"],\"width\":{\"max\":1280,\"min\":1}},\"groupId\":\"1\"},{\"label\":\"High Definition\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"2\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"stream_created\",\"timestamp\":9530,\"payload\":{\"id\":1,\"mediaType\":\"Audio\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":9976,\"payload\":{\"id\":1,\"mediaType\":\"Audio\",\"timestamp\":283,\"sampleRate\":16000}}]",
      "metrics_AudioEffects": "[{\"timestamp\":-81896161,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":227,\"wasmInitDuration\":-1,\"error\":[],\"userNoiseSuppressionMethod\":null}}]",
      "metrics_WorkerEvents": "[{\"timestamp\":9933,\"workerType\":\"wasmvqe\",\"workerLoadTimeMs\":91,\"msg\":\"\\\"wasm-worker-loaded\\\"\"}]",
      "metrics_MediaByPassEnabled": "false",
      "metrics_DominantSpeaker": "{\"activeStrategy\":\"signaling\",\"changedCountContributingSources\":0,\"changedCountDSH\":0}",
      "metrics_AudioSourceNumOfReopenRequests": "1",
      "metrics_AudioSourceNumOfSuccessfulReopens": "1",
      "metrics_AudioCaptureErrorCodeFlagsInit": "0",
      "metrics_AudioRenderErrorCodeFlagsInit": "0",
      "metrics_AudioSinkNumOfReopenRequests": "0",
      "metrics_AudioSinkNumOfSuccessfulReopens": "0",
      "metrics_MicUnmutedButSilent": "false",
      "metrics_MicUnmutedButSilentUnreliable": "false",
      "metrics_CallSetupTimeTracker": "{\"processOfferAsync\":[[{\"name\":\"getCapabilities\",\"duration\":14.4,\"ts\":1762458507497.7,\"parentName\":\"processOfferAsync\"},{\"name\":\"processOfferAsync\",\"duration\":21.7,\"ts\":1762458507490.5,\"parentName\":\"\"}]],\"createAnswerAsync\":[[{\"name\":\"queryRelaysAsync\",\"duration\":4.6,\"ts\":1762458514385.2,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"checkVideoCodecsSupport\",\"duration\":70.7,\"ts\":1762458514389.8,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"encStreamsManagerInitialize\",\"duration\":7.1,\"ts\":1762458514461.9,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"initAudioCodec\",\"duration\":13.1,\"ts\":1762458514461.9,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"assurePeerConnectionAsync\",\"duration\":91.9,\"ts\":1762458514385,\"parentName\":\"createAnswerAsync\"},{\"name\":\"handleCodecSwitchUnsupported\",\"duration\":0.2,\"ts\":1762458514476.9,\"parentName\":\"createAnswerAsync\"},{\"name\":\"detectSendProfileSupport\",\"duration\":8.1,\"ts\":1762458514477.1,\"parentName\":\"createAnswerAsync\"},{\"name\":\"setRemoteDescription\",\"duration\":1797.2,\"ts\":1762458514485.2,\"parentName\":\"createAnswerAsync\"},{\"name\":\"updateStreamsWithModalities\",\"duration\":1162.2,\"ts\":1762458516285.6,\"parentName\":\"createAnswerAsync|updateStreams\"},{\"name\":\"updateSenders\",\"duration\":10.5,\"ts\":1762458517447.8,\"parentName\":\"createAnswerAsync|updateStreams\"},{\"name\":\"assureStreamsAndDataChannel\",\"duration\":1177.1,\"ts\":1762458516282.4,\"parentName\":\"createAnswerAsync\"},{\"name\":\"createAnswer\",\"duration\":15.8,\"ts\":1762458517459.5,\"parentName\":\"createAnswerAsync\"},{\"name\":\"sLD\",\"duration\":16.6,\"ts\":1762458517475.3,\"parentName\":\"createAnswerAsync\"},{\"name\":\"candidates\",\"duration\":5,\"ts\":1762458517491.9,\"parentName\":\"createAnswerAsync\"},{\"name\":\"streamSendersManagerActivate\",\"duration\":14.8,\"ts\":1762458517496.9,\"parentName\":\"createAnswerAsync\"},{\"name\":\"createAnswerAsync\",\"duration\":3128.9,\"ts\":1762458514385,\"parentName\":\"\"},{\"name\":\"transportConnected\",\"duration\":1642.3,\"ts\":1762458517495.9,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"}]]}",
      "metrics_BrowserFingerprint": "{\"webdriver\":false,\"pluginsLength\":5,\"languageLength\":1,\"mimeTypesLength\":2,\"outerWidth\":1024,\"outerHeight\":728,\"innerWidth\":1024,\"innerHeight\":641,\"clientWidth\":1024,\"clientHeight\":641,\"loadEventEnd\":6179,\"loadEventStart\":6178.899999976158,\"hasChrome\":true,\"hasPlaywright\":false,\"hasSelenium\":false,\"hasNightmare\":false,\"hasPhantom\":false,\"hasCypress\":false}",
      "metrics_ReportGenerationTimeMs": "7.4",
      "metrics_piiFields": "{\"IPAddress\":\"IPv4\",\"pair_googLocalAddress\":\"IPv4\",\"pair_googRemoteAddress\":\"IPv4\"}",
      "Extensions_WebRTCStats_data_bytesReceived": "0",
      "Extensions_WebRTCStats_data_bytesSent": "0",
      "Extensions_WebRTCStats_data_dataChannelIdentifier": "0",
      "Extensions_WebRTCStats_data_label": "main-channel",
      "Extensions_WebRTCStats_data_messagesReceived": "0",
      "Extensions_WebRTCStats_data_messagesSent": "0",
      "Extensions_WebRTCStats_data_state": "connecting",
      "Extensions_WebRTCStats_data_timestamp": "1762458518714.239",
      "Extensions_SessionState": "Active",
      "Extensions_BundlePolicy": "max-bundle",
      "Extensions_FakeIceCandidate": "false",
      "Extensions_h264AvailableProfiles": "[\"42001f\",\"42e01f\",\"4d001f\",\"f4001f\"]",
      "Extensions_h264CodecCapabilities": "{\"sendProfiles\":[\"42001f\",\"42e01f\",\"4d001f\"],\"receiveProfiles\":[\"42001f\",\"42e01f\",\"4d001f\",\"f4001f\"]}",
      "Extensions_IceConnectionState": "connected",
      "Extensions_IceConnectionStatePrevious": "checking",
      "Extensions_IceServers": "[{\"urls\":[\"turn:euaz.relay.teams.microsoft.com:3478?transport=udp\",\"turn:euaz.relay.teams.microsoft.com:443?transport=tcp\",\"turns:euaz.relay.teams.microsoft.com:443\"],\"credential\":\"true\",\"username\":\"true\"}]",
      "Extensions_IceTransportPolicy": "all",
      "Extensions_NegotiatedSrtp": "\"dtls\"",
      "Extensions_OfferedSrtp": "\"dtls\"",
      "Extensions_RelayCandidate": "none",
      "Extensions_SdpSemantics": "unified-plan",
      "Extensions_SignalingState": "stable",
      "Extensions_SignalingStatePrevious": "have-remote-offer",
      "Extensions_MaxSessionBandwidth": "4000",
      "Extensions_Bandwidth_uplinkStabilizationTime": "{\"time\":1,\"finished\":false,\"modality\":\"audio\"}",
      "Extensions_totalVideoControlMessages": "0",
      "Extensions_outOfOrderVideoControlMessages": "0",
      "Extensions_webcamFreezeIntervals": "0",
      "Extensions_processedStreamFreezeIntervals": "0",
      "Extensions_ReinvitelessContext": "{\"enabled\":false,\"maxStreamsForModality\":{\"video\":0,\"sharing\":0}}",
      "Extensions_IPAddress": "192.168.255.11",
      "Extensions_ReflexiveLocalIP": "none",
      "Extensions_NumberOfInterfaces": "1",
      "Extensions_StartTime": "1762458509668",
      "Extensions_AudioPayloadSendBitrate": "0",
      "Extensions_AvgBwSendSide": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_id": "OT01A3615918952",
      "Extensions_WebRTCStats_ssrc_audio_send_ssrc": "3615918952",
      "Extensions_WebRTCStats_ssrc_audio_send_mediaType": "audio",
      "Extensions_WebRTCStats_ssrc_audio_send_bytesSent": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_packetsSent": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_googCodecName": "opus",
      "Extensions_WebRTCStats_ssrc_audio_send_googTrackId": "036cad6f-0305-46f1-9f51-62cdb59b19e6",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_id": "T01",
      "Extensions_WebRTCStats_ssrc_audio_send_transportId": "T01",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_selectedCandidatePairId": "CPPEnEMeyL_27kOHvgX",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_localCertificateId": "CFC8:31:72:48:F1:D6:00:23:A0:9F:08:77:5C:D4:95:79:14:EB:61:39:57:3D:E1:7D:8C:F2:26:B7:77:E7:3B:A2",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_id": "CPPEnEMeyL_27kOHvgX",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesSent": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsReceived": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_consentRequestsSent": "2",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googTransportType": "udp",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googWritable": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsSent": "3",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googActiveConnection": "false",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsDiscardedOnSend": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesReceived": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesReceived": "3",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_remoteCandidateId": "I27kOHvgX",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_localCandidateId": "IPEnEMeyL",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsSent": "5",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesSent": "1080",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googReadable": "false",
      "Extensions_WebRTCStats_ssrc_audio_send_audioInputLevel": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_totalAudioEnergy": "0.00003245107520484697",
      "Extensions_WebRTCStats_ssrc_audio_send_totalSamplesDuration": "1.1600000000000008",
      "Extensions_Audio_send_rttAvg": "0",
      "Extensions_Audio_send_rttMax": "0",
      "Extensions_Audio_send_RawInputVolume": "0",
      "Extensions_Audio_send_packetsLostRateMax": "0",
      "Extensions_Audio_send_presentationAPIUserDuration": "0",
      "Extensions_Audio_send_presentationDuration": "0",
      "Extensions_Audio_send_audioLevelAvg": "0.000028",
      "Extensions_Video_recv_StreamsMax": "0",
      "Extensions_Video_recv_StreamsMin": "0",
      "Extensions_Video_recv_StreamsMode": "0",
      "Extensions_Video_recv_TimeToFirstFrame": "-1",
      "Extensions_Video_recv_TimeToFirstFrameSinceSubscriptionStart": "-1",
      "Extensions_totalVideoRecv_macroblockRateReceivedMax": "0",
      "Extensions_totalVideoRecv_macroblockRateReceivedAvg": "0",
      "Extensions_totalVideoRecv_macroblockRateDecodedMax": "0",
      "Extensions_totalVideoRecv_macroblockRateDecodedAvg": "0",
      "Extensions_totalVideoRecv_macroblockRateMaxDecoderLossPercent": "0",
      "Extensions_totalVideoRecv_macroblockRateDecoderLossPercent": "0",
      "Extensions_Video_SubscriptionCounters": "{\"attempted\":0,\"subscribed\":0,\"unsubscribed\":0,\"failed\":0}",
      "Extensions_Sharing_recv_StreamsMax": "0",
      "Extensions_Sharing_recv_StreamsMin": "0",
      "Extensions_Sharing_recv_StreamsMode": "0",
      "Extensions_Sharing_recv_TimeToFirstFrame": "-1",
      "Extensions_Sharing_recv_TimeToFirstFrameSinceSubscriptionStart": "-1",
      "Extensions_Sharing_SubscriptionCounters": "{\"attempted\":0,\"subscribed\":0,\"unsubscribed\":0,\"failed\":0}",
      "Extensions_EncodedStreamWorker": "false",
      "Extensions_AudioCodecEvents": "\"none\"",
      "Extensions_HevcCodecSupport": "[{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false}]",
      "Extensions_IsPstnCall": "false",
      "Extensions_UsesMixer": "false",
      "Extensions_InitialBWSeed": "402592",
      "Extensions_SentBWSeed": "402592",
      "Extensions_EarlyMedia_NumStatsPolls": "0",
      "Extensions_TimeToFirstAudioPacket": "0",
      "Extensions_FetchTimeMax": "37.1",
      "Extensions_FetchTimeMedian": "37.1",
      "Extensions_LoopIntervalMax": "-1",
      "Extensions_LoopIntervalMedian": "-1",
      "trouterUrl": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-2-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "de",
      "Call.Type": "oneToOneCall",
      "Call.IsChatVersion2": "true",
      "Call.Id": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "Call.ParticipantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
      "Call.WasPoppedOut": "true",
      "AppInfo.UserRole": "Member",
      "AppInfo.UserType": "Aad",
      "DeviceInfo.Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  ```
  ```json
  {
    "acc": 2,
    "webResult": {}
  }
  ```
- POST `https://teams.microsoft.com/ups/emea/v1/pubsub/subscriptions/611e9e3d-02e3-46dd-a329-e9f52b211c54`
  ```json
  {
    "trouterUri": "https://pub-ent-euno-10-f.trouter.teams.microsoft.com:3443/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "shouldPurgePreviousSubscriptions": false,
    "subscriptionsToAdd": [],
    "subscriptionsToRemove": [
      {
        "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
        "source": "ups"
      },
      {
        "mri": "8:orgid:dee1afdb-9ece-4498-a506-15c6b484ac6b",
        "source": "ups"
      }
    ]
  }
  ```
  ```json
  {
    "addStatuses": [],
    "removeStatuses": [
      {
        "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
        "source": "ups",
        "status": 20200
      },
      {
        "mri": "8:orgid:dee1afdb-9ece-4498-a506-15c6b484ac6b",
        "source": "ups",
        "status": 20200
      }
    ]
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-03-prod-aks.broker.skype.com/api/v1/subscribe/040f400d-5525-4597-9354-bdbe6416ee2b/0?i=10-128-60-8`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-03-prod-aks.broker.skype.com/api/v1/subscribe/040f400d-5525-4597-9354-bdbe6416ee2b/0?i=10-128-60-8",
    "expirationTimeInSec": 30
  }
  ```
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  (Request was too long to pretty-print)
  ```json
  {
    "acc": 23
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-03-prod-aks.broker.skype.com/api/v1/subscribe/040f400d-5525-4597-9354-bdbe6416ee2b/0?i=10-128-60-8`
- PUT `https://teams.microsoft.com/ups/emea/v1/me/endpoints/`
  ```json
  {
    "availability": "Available",
    "activity": "Available",
    "id": "611e9e3d-02e3-46dd-a329-e9f52b211c54",
    "activityReporting": "Transport",
    "deviceType": "Web"
  }
  ```
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&client-id=NO_AUTH&client-version=1DS-Web-JS-4.2.1&apikey=53fdaa090eb946b5a1d6cbdeb4f2ef66-bcbf6380-2590-41cc-ae60-9e467cd51835-7413&upload-time=1762458559904&ext.intweb.msfpc=GUID%3Dfbce5a52cc8f449f8a49e147bd2d3f25%26HASH%3Dfbce%26LV%3D202510%26V%3D4%26LU%3D1761758803913&time-delta-to-apply-millis=1123&w=0&NoResponseBody=true`
  ```json
  {
    "name": "skypecosi_concore_web_pluginless_call_session",
    "time": "2025-11-06T19:49:19.901Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 9,
        "installId": "e01734fd-ae1c-499b-b453-6041a5f01798",
        "epoch": "235386963"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "P1AqXxNU2Yxgnc1zUac0A6"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
        "browserVer": "141.0.7390.67",
        "screenRes": "1024X768",
        "userConsent": false
      },
      "os": {
        "name": "Windows",
        "ver": "10"
      },
      "intweb": {
        "msfpc": "GUID=fbce5a52cc8f449f8a49e147bd2d3f25&HASH=fbce&LV=202510&V=4&LU=1761758803913"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "LocalUser": {
            "t": 321
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "LocalStorage=4.3.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.1"
        }
      },
      "ui_version": "1415/25101616509",
      "agent_environment_id": "7e382dd6-ac2d-4d04-89f4-557f526a5396",
      "CorrelationId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "participant_id": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
      "endpoint_id": "c6bcd1a5-b178-418d-82d1-164778781e82",
      "media_leg_id": "B0C08CA48E1647F0B35CECCE4EE995C0",
      "ts_calling_version": "2025.40.01.4",
      "LocalUser": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "ResultCode": "1",
      "EventTimestampBag": "{\"eventStart\":1762458509651,\"events\":[{\"CallStateChanged\":634,\"data\":\"Notified\"},{\"CallStateChanged\":6517,\"data\":\"Connecting\"},{\"CallStateChanged\":10272,\"data\":\"Connected\"},{\"CallStateChanged\":49798,\"data\":\"Disconnected\"}]}",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-2-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "de",
      "AppInfo.UserRole": "Member",
      "AppInfo.UserType": "Aad",
      "DeviceInfo.Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  ```
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&client-id=NO_AUTH&client-version=1DS-Web-JS-4.2.1&apikey=53fdaa090eb946b5a1d6cbdeb4f2ef66-bcbf6380-2590-41cc-ae60-9e467cd51835-7413&upload-time=1762458559911&ext.intweb.msfpc=GUID%3Dfbce5a52cc8f449f8a49e147bd2d3f25%26HASH%3Dfbce%26LV%3D202510%26V%3D4%26LU%3D1761758803913&time-delta-to-apply-millis=1123&w=0&NoResponseBody=true`
  ```json
  {
    "name": "skypecosi_concore_web_pluginless_modality_session",
    "time": "2025-11-06T19:49:19.909Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 10,
        "installId": "e01734fd-ae1c-499b-b453-6041a5f01798",
        "epoch": "235386963"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "P1AqXxNU2Yxgnc1zUac0A6"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
        "browserVer": "141.0.7390.67",
        "screenRes": "1024X768",
        "userConsent": false
      },
      "os": {
        "name": "Windows",
        "ver": "10"
      },
      "intweb": {
        "msfpc": "GUID=fbce5a52cc8f449f8a49e147bd2d3f25&HASH=fbce&LV=202510&V=4&LU=1761758803913"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "LocalUser": {
            "t": 321
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "LocalStorage=4.3.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.1"
        }
      },
      "ui_version": "1415/25101616509",
      "agent_environment_id": "7e382dd6-ac2d-4d04-89f4-557f526a5396",
      "CorrelationId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "participant_id": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
      "endpoint_id": "c6bcd1a5-b178-418d-82d1-164778781e82",
      "media_leg_id": "B0C08CA48E1647F0B35CECCE4EE995C0",
      "ts_calling_version": "2025.40.01.4",
      "LocalUser": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "ResultCode": "0",
      "EventTimestampBag": "{\"eventStart\":1762458516165,\"events\":[{\"StartModality\":0},{\"StreamStateChanged\":5172,\"data\":{\"state\":\"StreamActive\",\"direction\":\"Receive\"}}]}",
      "MediaType": "Audio",
      "Role": "Bidirectional",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-2-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "de",
      "AppInfo.UserRole": "Member",
      "AppInfo.UserType": "Aad",
      "DeviceInfo.Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  ```
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&client-id=NO_AUTH&client-version=1DS-Web-JS-4.2.1&apikey=1cae5691997646c98b01d15beddae7a3-ce16e198-bc32-420f-ac64-42bb916111af-6865&upload-time=1762458559922&ext.intweb.msfpc=GUID%3Dfbce5a52cc8f449f8a49e147bd2d3f25%26HASH%3Dfbce%26LV%3D202510%26V%3D4%26LU%3D1761758803913&time-delta-to-apply-millis=1123&w=0&NoResponseBody=true`
  ```json
  {
    "name": "mdsc_webrtc_session",
    "time": "2025-11-06T19:49:19.920Z",
    "ver": "4.0",
    "iKey": "o:1cae5691997646c98b01d15beddae7a3",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 11,
        "installId": "e01734fd-ae1c-499b-b453-6041a5f01798",
        "epoch": "235386963"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "P1AqXxNU2Yxgnc1zUac0A6"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
        "browserVer": "141.0.7390.67",
        "screenRes": "1024X768",
        "userConsent": false
      },
      "os": {
        "name": "Windows",
        "ver": "10"
      },
      "intweb": {
        "msfpc": "GUID=fbce5a52cc8f449f8a49e147bd2d3f25&HASH=fbce&LV=202510&V=4&LU=1761758803913"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "Extensions_IPAddress": {
            "t": 417
          },
          "Extensions_WebRTCStats_ssrc_audio_recv_pair_googLocalAddress": {
            "t": 417
          },
          "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRemoteAddress": {
            "t": 417
          },
          "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalAddress": {
            "t": 417
          },
          "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteAddress": {
            "t": 417
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "LocalStorage=4.3.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.1"
        }
      },
      "uiVersion": "1415/25101616509",
      "agent_environment_id": "7e382dd6-ac2d-4d04-89f4-557f526a5396",
      "CorrelationId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "participant_id": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
      "endpoint_id": "c6bcd1a5-b178-418d-82d1-164778781e82",
      "media_leg_id": "B0C08CA48E1647F0B35CECCE4EE995C0",
      "ts_calling_version": "2025.40.01.4",
      "metrics_MediaLegId": "B0C08CA48E1647F0B35CECCE4EE995C0",
      "metrics_CreationTime": "17624585096670000",
      "metrics_CallNumber": "2",
      "metrics_SessionId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "metrics_MultiParty": "false",
      "metrics_ErrorType": "none",
      "metrics_IncompatibleOffer": "false",
      "metrics_TerminationTime": "17624585595200000",
      "metrics_TerminationReason_code": "0",
      "metrics_TerminationReason_subCode": "0",
      "metrics_TerminationReason_phrase": "CallEndReasonLocalUserInitiated",
      "metrics_TerminationReason_remoteTerminated": "true",
      "metrics_TerminationReason_resultCategories": "[\"Success\"]",
      "metrics_CallDuration": "498530000",
      "metrics_IceInitTime": "17624585196560000",
      "metrics_IceConnectedStateTime": "17624585213500000",
      "metrics_NegotiationCount": "1",
      "metrics_RejectedNegotiationCount": "0",
      "metrics_InitialNegotiationCompleted": "true",
      "metrics_InitialNegotiationType": "Answering",
      "metrics_FinalAnswerTime": "17624585200250000",
      "metrics_TransportReconnectedCount": "0",
      "metrics_Relay": "{\"address\":\"euaz.relay.teams.microsoft.com\",\"expires\":604800,\"realm\":\"\\\"rtcmedia\\\"\",\"credentials\":true,\"ports\":\"udp:3478,tcp:443,tls:443\",\"fqdns\":\"euaz.relay.teams.microsoft.com\"}",
      "metrics_ActiveModalities": "{\"audio\":\"sendrecv\",\"video\":\"inactive\",\"data\":\"sendrecv\"}",
      "metrics_AllowedAudioSend": "true",
      "metrics_AllowedVideoSend": "true",
      "metrics_AllowedScreensharingSend": "true",
      "metrics_RelayManager": "{\"config\":{\"Service\":{\"url\":\"https://teams.microsoft.com/trap\",\"tokenUrl\":\"https://teams.microsoft.com/trap/tokens\",\"disabled\":false,\"supportedTokenTypes\":\"skype AAD CAE\"},\"Relay\":{\"Turn\":{\"realm\":\"rtcmedia\",\"addresses\":[\"euaz.relay.teams.microsoft.com\"],\"fqdns\":[\"euaz.relay.teams.microsoft.com\"],\"tcpPort\":443,\"tlsPort\":443,\"udpPort\":3478,\"url\":\"\"},\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478,\"Lync\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478},\"Skype\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478}},\"Token\":{\"earlyRefreshMinutes\":9720,\"earlyRefreshPercentage\":4}},\"stats\":{\"configFetch\":{\"time\":1762449108008,\"duration\":480,\"version\":2},\"skypeTokenFetch\":{\"time\":1762449108488,\"duration\":137,\"version\":2},\"configFetch_prev\":{\"time\":1762424912797,\"duration\":340,\"version\":2},\"skypeTokenFetch_prev\":{\"time\":1762424913137,\"duration\":315,\"version\":2}}}",
      "metrics_AuthTokenStats": "{\"tokenType\":1,\"errors\":[]}",
      "metrics_CallMutedRatio": "0",
      "metrics_CallOsMuted": "0",
      "metrics_CallHwSilent": "0",
      "metrics_CallSwMuted": "0",
      "metrics_CallSpeakerMuted": "0",
      "metrics_CallIsSpeaking": "0",
      "metrics_DtmfSuccess": "0",
      "metrics_DtmfFailure": "0",
      "metrics_ReconnectInProgress": "false",
      "metrics_RetargetIncomingCount": "0",
      "metrics_RetargetOutgoingCount": "0",
      "metrics_RetargetCompletedCount": "0",
      "metrics_RetargetRejectedCount": "0",
      "metrics_EscalationAttemptedCount": "0",
      "metrics_EscalationCompletedCount": "0",
      "metrics_EscalationRejectedCount": "0",
      "metrics_ReconnectAttemptedCount": "0",
      "metrics_ReconnectConnectedCount": "0",
      "metrics_NoIceCandidatesGoodEventCount": "0",
      "metrics_NoIceCandidatesBadEventCount": "0",
      "metrics_NoRelayIceCandidatesGoodEventCount": "0",
      "metrics_NoRelayIceCandidatesBadEventCount": "0",
      "metrics_MicrophoneInUseGoodEventCount": "0",
      "metrics_MicrophoneInUseBadEventCount": "0",
      "metrics_CameraInUseGoodEventCount": "0",
      "metrics_CameraInUseBadEventCount": "0",
      "metrics_CameraFreezeStartEventCount": "0",
      "metrics_CameraFreezeEndEventCount": "0",
      "metrics_NetworkRecvGood": "1",
      "metrics_NetworkRecvGoodRatio": "1",
      "metrics_NetworkRecvPoor": "0",
      "metrics_NetworkRecvPoorRatio": "0",
      "metrics_NetworkRecvBad": "0",
      "metrics_NetworkRecvBadRatio": "0",
      "metrics_NetworkSendGood": "1",
      "metrics_NetworkSendGoodRatio": "1",
      "metrics_NetworkSendPoor": "0",
      "metrics_NetworkSendPoorRatio": "0",
      "metrics_NetworkSendBad": "0",
      "metrics_NetworkSendBadRatio": "0",
      "metrics_Connection_Downlink": "5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5",
      "metrics_Connection_EffectiveType": "4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g",
      "metrics_Connection_Rtt": "50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50",
      "metrics_Connection_SaveData": "false",
      "metrics_RawOutputAudioAccessAttempted": "0",
      "metrics_RawOutputAudioAccessDurationRatio": "0",
      "metrics_RawInputAudioOverrideAttempted": "0",
      "metrics_RawInputAudioOverrideDurationRatio": "0",
      "metrics_ZeroCaptureDevicesEnumeratedEventRatio": "0",
      "metrics_ZeroRenderDevicesEnumeratedEventRatio": "0",
      "metrics_DeviceCaptureNotFunctioningEventRatio": "0",
      "metrics_DeviceRenderNotFunctioningEventRatio": "0",
      "metrics_MediaQosEnabled": "false",
      "metrics_PortRangeConfigured": "false",
      "metrics_hardwareConcurrency": "4",
      "metrics_ETag": "\"0rGIRosivKTC3J+mxQ+trQRBFfRh1K7XUWHJ6XwnOsg=\"",
      "metrics_ConfigIds": "P-E-1716081-C1-6,P-E-1713802-2-6,P-E-1713707-C1-6,P-E-1713684-C1-6,P-E-1712881-2-6,P-E-1708523-2-8,P-E-1704515-2-6,P-E-1700450-2-7,P-E-1694641-2-6,P-E-1691036-2-6,P-E-1680105-2-6,P-E-1676936-C1-6,P-E-1675286-2-6,P-E-1670133-2-6,P-E-1660458-C1-5,P-E-1658080-C1-11,P-E-1656524-2-6,P-E-1655667-2-6,P-E-1653089-3-8,P-E-1651332-2-6,P-E-1643648-2-6,P-E-1641797-C1-6,P-E-1633843-2-6,P-E-1621471-2-6,P-E-1618933-2-6,P-E-1617149-2-6,P-E-1616887-2-6,P-E-1616819-2-6,P-E-1613942-2-6,P-E-1608951-C1-3,P-E-1608371-2-6,P-E-1604926-C1-5,P-E-1598909-C1-6,P-E-1595894-2-6,P-E-1575172-2-5,P-E-1574158-2-10,P-E-1570390-2-6,P-E-1566952-C1-6,P-E-1568381-C1-6,P-E-1566716-C1-10,P-E-1565836-2-6,P-E-1565831-2-6,P-R-1665746-12-10,P-R-1645583-12-13,P-R-1634465-12-13,P-R-1633491-12-13,P-R-1632047-12-13,P-R-1630681-C11-9,P-R-1613099-12-10,P-R-1611700-12-14,P-R-1606855-12-14,P-R-1598296-12-12,P-R-1587774-12-12,P-R-1584387-12-13,P-R-1580901-12-15,P-R-1577920-12-13,P-R-1577892-18-3,P-R-1575005-12-10,P-R-1563326-12-14,P-R-1558616-12-17,P-R-1553816-12-12,P-R-1551350-12-15,P-R-1543947-12-13,P-R-1523352-12-14,P-R-1534344-12-13,P-R-1521918-12-9,P-R-1475504-12-14,P-R-1477139-12-19,P-R-1472589-12-28,P-R-1470220-12-11,P-R-1282626-12-35,P-R-1458723-12-13,P-R-1457926-12-2,P-R-1446888-12-17,P-R-1442911-12-17,P-R-1442161-12-17,P-R-1438633-12-12,P-R-1417298-12-18,P-R-1416330-12-20,P-R-1102981-9-69,P-R-1270215-12-8,P-R-1264668-12-16,P-R-1262976-12-11,P-R-1223031-9-9,P-R-1244045-18-14,P-R-1175069-9-8,P-R-1226424-9-4,P-R-1224690-9-9,P-R-1168166-9-10,P-R-1160589-9-7,P-R-1156430-9-6,P-R-1154814-3-6,P-R-1150013-9-11,P-R-1148658-9-8,P-R-1141462-9-23,P-R-1136249-9-9,P-R-1133113-9-8,P-R-1130598-9-10,P-R-1128207-9-28,P-R-1117564-9-10,P-R-1111900-9-79,P-R-1111902-9-11,P-R-1101306-9-6,P-R-1096762-9-24,P-R-1082715-9-35,P-R-1082433-9-23,P-R-1082359-9-14,P-R-1082351-9-12,P-R-1080906-6-6,P-R-1070816-6-19,P-R-1070395-1-8,P-R-1036090-19-62,P-R-1016745-11-11,P-R-1006078-1-32,P-R-115866-10-27,P-R-107136-10-42,P-R-96498-10-27,P-R-95572-41-185,P-R-94120-1-6,P-R-88231-9-17,P-R-79878-11-70,P-R-71785-7-16,P-R-63313-1-4,P-D-38372-1-4,P-D-27831-1-40,pe1716081c1:1033550,pe17138022:1031142,pe1713707c1:1031006,pe1713684c1:1030981,pe17128812:1030029,pe17085232:1033251,pe17045152:1023158,pe17004502:1027959,pe16946412:1018058,pe16910362:1013539,pe16801052:1010383,pe1676936c1:1006853,pe16752862:1005633,pe16701332:1002053,pe1660458c1:304475,pe1658080c1:1010368,pe16565242:301668,pe16556672:300926,pe16530893:301201,pe16513322:296134,pe16436482:288428,pe1641797c1:286186,pe16338432:277836,pe16214712:266864,pe16189332:264581,pe16171492:262972,pe16168872:262654,pe16168192:262662,pe16139422:260005,pe16083712:254400,pe1604926c1:250956,pe1598909c1:245917,pe15958942:241863,pe15751722:222344,pe15741582:224394,pe15703902:219213,pe1568381c1:218197,pe1566716c1:228730,pe15658362:216043,pe15658312:216047",
      "metrics_GPUName": "ANGLE (Intel, Intel(R) HD Graphics Direct3D9Ex vs_3_0 ps_3_0, igdumd64.dll)",
      "metrics_PermissionStates": "{\"microphone\":\"granted\",\"camera\":\"granted\"}",
      "metrics_DeviceList": "[{\"label\":\"046d:0825 Cam\",\"kind\":\"microphone\"},{\"label\":\"046d:0825 Cam\",\"kind\":\"camera\"},{\"label\":\"High Definition\",\"kind\":\"speaker\"}]",
      "metrics_DeviceListDebug": "{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}",
      "metrics_DevicesChangeCount": "0",
      "metrics_DevicesPollChangeCount": "0",
      "metrics_DeviceSelectionChangeCount": "0",
      "metrics_DeviceSelectionChangeFromInterfaceCount": "0",
      "metrics_DevicesCount": "{\"microphone\":1,\"camera\":1,\"speaker\":1,\"compositeAudio\":0,\"audioIngestDevice\":0,\"virtualDevice\":0}",
      "metrics_DeviceEnumerationTimings": "{\"max\":1112,\"min\":6,\"avg\":59}",
      "metrics_UsedMicrophone": "046d:0825 Cam",
      "metrics_UsedSpeaker": "High Definition",
      "metrics_UsedCamera": "046d:0825 Cam",
      "metrics_DeviceEvents": "[{\"eventType\":\"stream_disposed\",\"timestamp\":-81896172,\"payload\":{\"id\":0,\"mediaType\":\"Audio\"}},{\"eventType\":\"devices_changed\",\"timestamp\":-4187,\"payload\":{\"devices\":[{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{\"autoGainControl\":[true,false],\"channelCount\":{\"max\":1,\"min\":1},\"echoCancellation\":[true,false,\"remote-only\"],\"latency\":{\"max\":0.01,\"min\":0},\"noiseSuppression\":[true,false],\"sampleRate\":{\"max\":48000,\"min\":48000},\"sampleSize\":{\"max\":16,\"min\":16},\"voiceIsolation\":[true,false]},\"groupId\":\"1\"},{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{},\"groupId\":\"1\"},{\"label\":\"High Definition\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"2\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"devices_changed\",\"timestamp\":-1046,\"payload\":{\"devices\":[{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{\"autoGainControl\":[true,false],\"channelCount\":{\"max\":1,\"min\":1},\"echoCancellation\":[true,false,\"remote-only\"],\"latency\":{\"max\":0.01,\"min\":0},\"noiseSuppression\":[true,false],\"sampleRate\":{\"max\":48000,\"min\":48000},\"sampleSize\":{\"max\":16,\"min\":16},\"voiceIsolation\":[true,false]},\"groupId\":\"1\"},{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{\"aspectRatio\":{\"max\":1280,\"min\":0.0010416666666666667},\"facingMode\":[],\"frameRate\":{\"max\":30,\"min\":1},\"height\":{\"max\":960,\"min\":1},\"resizeMode\":[\"none\",\"crop-and-scale\"],\"width\":{\"max\":1280,\"min\":1}},\"groupId\":\"1\"},{\"label\":\"High Definition\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"2\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"stream_created\",\"timestamp\":9530,\"payload\":{\"id\":1,\"mediaType\":\"Audio\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":9976,\"payload\":{\"id\":1,\"mediaType\":\"Audio\",\"timestamp\":283,\"sampleRate\":16000}},{\"eventType\":\"stream_disposed\",\"timestamp\":49895,\"payload\":{\"id\":1,\"mediaType\":\"Audio\"}}]",
      "metrics_AudioEffects": "[{\"timestamp\":-81896161,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":227,\"wasmInitDuration\":-1,\"error\":[],\"userNoiseSuppressionMethod\":null}},{\"timestamp\":18084,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":28,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.9990000128746033},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"799;Avg,2.172654;0.500000,2.050000;0.700000,2.050000;0.750000,2.050000;0.800000,2.050000;0.850000,3.050000;0.900000,3.050000;0.950000,3.050000;0.990000,4.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-63.351562,\"farEndOutputRMS_dBFS\":-46.5,\"loopbackInputRMS_dBFS\":-46.5,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-58.265625,\"farEndOutputRMS_dBFS\":-52.570312,\"loopbackInputRMS_dBFS\":-52.570312,\"nearEndInputRMS_dBFS\":-41.789062,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":24,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":7.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":26080,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":28,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.9994999766349792},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"1599;Avg,3.010600;0.500000,3.050000;0.700000,3.050000;0.750000,3.050000;0.800000,4.050000;0.850000,4.050000;0.900000,4.050000;0.950000,6.050000;0.990000,7.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-36.796875,\"farEndOutputRMS_dBFS\":-30.023438,\"loopbackInputRMS_dBFS\":-30.023438,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-59.367188,\"farEndOutputRMS_dBFS\":-54.609375,\"loopbackInputRMS_dBFS\":-54.609375,\"nearEndInputRMS_dBFS\":-41.765625,\"nearEndOutputRMS_dBFS\":-122.601562},\"wasmCompilationTimeMs\":24,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":15.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":34081,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":28,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.999666690826416},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"2399;Avg,3.091684;0.500000,3.050000;0.700000,3.050000;0.750000,4.050000;0.800000,4.050000;0.850000,4.050000;0.900000,4.050000;0.950000,6.050000;0.990000,7.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-36.796875,\"farEndOutputRMS_dBFS\":-30.023438,\"loopbackInputRMS_dBFS\":-30.023438,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-56.039062,\"farEndOutputRMS_dBFS\":-50.859375,\"loopbackInputRMS_dBFS\":-50.859375,\"nearEndInputRMS_dBFS\":-41.414062,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":24,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":23.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":42081,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":28,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.999750018119812},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"3199;Avg,3.090012;0.500000,3.050000;0.700000,3.050000;0.750000,4.050000;0.800000,4.050000;0.850000,4.050000;0.900000,4.050000;0.950000,5.050000;0.990000,7.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-36.796875,\"farEndOutputRMS_dBFS\":-30.023438,\"loopbackInputRMS_dBFS\":-30.023438,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-57.164062,\"farEndOutputRMS_dBFS\":-52.125,\"loopbackInputRMS_dBFS\":-52.125,\"nearEndInputRMS_dBFS\":-41.742188,\"nearEndOutputRMS_dBFS\":-120.140625},\"wasmCompilationTimeMs\":24,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":31.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":49914,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":28,\"wasmInitDuration\":-1,\"error\":[],\"userNoiseSuppressionMethod\":null}}]",
      "metrics_WorkerEvents": "[{\"timestamp\":9933,\"workerType\":\"wasmvqe\",\"workerLoadTimeMs\":91,\"msg\":\"\\\"wasm-worker-loaded\\\"\"}]",
      "metrics_MediaByPassEnabled": "false",
      "metrics_DominantSpeaker": "{\"activeStrategy\":\"signaling\",\"changedCountContributingSources\":0,\"changedCountDSH\":0}",
      "metrics_AudioSourceNumOfReopenRequests": "1",
      "metrics_AudioSourceNumOfSuccessfulReopens": "1",
      "metrics_AudioCaptureErrorCodeFlagsInit": "0",
      "metrics_AudioRenderErrorCodeFlagsInit": "0",
      "metrics_AudioSinkNumOfReopenRequests": "0",
      "metrics_AudioSinkNumOfSuccessfulReopens": "0",
      "metrics_MicUnmutedButSilent": "false",
      "metrics_MicUnmutedButSilentUnreliable": "false",
      "metrics_CallSetupTimeTracker": "{\"processOfferAsync\":[[{\"name\":\"getCapabilities\",\"duration\":14.4,\"ts\":1762458507497.7,\"parentName\":\"processOfferAsync\"},{\"name\":\"processOfferAsync\",\"duration\":21.7,\"ts\":1762458507490.5,\"parentName\":\"\"}]],\"createAnswerAsync\":[[{\"name\":\"queryRelaysAsync\",\"duration\":4.6,\"ts\":1762458514385.2,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"checkVideoCodecsSupport\",\"duration\":70.7,\"ts\":1762458514389.8,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"encStreamsManagerInitialize\",\"duration\":7.1,\"ts\":1762458514461.9,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"initAudioCodec\",\"duration\":13.1,\"ts\":1762458514461.9,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"assurePeerConnectionAsync\",\"duration\":91.9,\"ts\":1762458514385,\"parentName\":\"createAnswerAsync\"},{\"name\":\"handleCodecSwitchUnsupported\",\"duration\":0.2,\"ts\":1762458514476.9,\"parentName\":\"createAnswerAsync\"},{\"name\":\"detectSendProfileSupport\",\"duration\":8.1,\"ts\":1762458514477.1,\"parentName\":\"createAnswerAsync\"},{\"name\":\"setRemoteDescription\",\"duration\":1797.2,\"ts\":1762458514485.2,\"parentName\":\"createAnswerAsync\"},{\"name\":\"updateStreamsWithModalities\",\"duration\":1162.2,\"ts\":1762458516285.6,\"parentName\":\"createAnswerAsync|updateStreams\"},{\"name\":\"updateSenders\",\"duration\":10.5,\"ts\":1762458517447.8,\"parentName\":\"createAnswerAsync|updateStreams\"},{\"name\":\"assureStreamsAndDataChannel\",\"duration\":1177.1,\"ts\":1762458516282.4,\"parentName\":\"createAnswerAsync\"},{\"name\":\"createAnswer\",\"duration\":15.8,\"ts\":1762458517459.5,\"parentName\":\"createAnswerAsync\"},{\"name\":\"sLD\",\"duration\":16.6,\"ts\":1762458517475.3,\"parentName\":\"createAnswerAsync\"},{\"name\":\"candidates\",\"duration\":5,\"ts\":1762458517491.9,\"parentName\":\"createAnswerAsync\"},{\"name\":\"streamSendersManagerActivate\",\"duration\":14.8,\"ts\":1762458517496.9,\"parentName\":\"createAnswerAsync\"},{\"name\":\"createAnswerAsync\",\"duration\":3128.9,\"ts\":1762458514385,\"parentName\":\"\"},{\"name\":\"transportConnected\",\"duration\":1642.3,\"ts\":1762458517495.9,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"}]]}",
      "metrics_BrowserFingerprint": "{\"webdriver\":false,\"pluginsLength\":5,\"languageLength\":1,\"mimeTypesLength\":2,\"outerWidth\":1024,\"outerHeight\":728,\"innerWidth\":1024,\"innerHeight\":641,\"clientWidth\":1024,\"clientHeight\":641,\"loadEventEnd\":6179,\"loadEventStart\":6178.899999976158,\"hasChrome\":true,\"hasPlaywright\":false,\"hasSelenium\":false,\"hasNightmare\":false,\"hasPhantom\":false,\"hasCypress\":false}",
      "metrics_ReportGenerationTimeMs": "30.8",
      "metrics_piiFields": "{\"IPAddress\":\"IPv4\",\"pair_googLocalAddress\":\"IPv4\",\"pair_googRemoteAddress\":\"IPv4\"}",
      "Extensions_WebRTCStats_data_bytesReceived": "0",
      "Extensions_WebRTCStats_data_bytesSent": "0",
      "Extensions_WebRTCStats_data_dataChannelIdentifier": "0",
      "Extensions_WebRTCStats_data_label": "main-channel",
      "Extensions_WebRTCStats_data_messagesReceived": "0",
      "Extensions_WebRTCStats_data_messagesSent": "0",
      "Extensions_WebRTCStats_data_state": "open",
      "Extensions_WebRTCStats_data_timestamp": "1762458556406.217",
      "Extensions_SessionState": "Inactive",
      "Extensions_BundlePolicy": "max-bundle",
      "Extensions_FakeIceCandidate": "false",
      "Extensions_h264AvailableProfiles": "[\"42001f\",\"42e01f\",\"4d001f\",\"f4001f\"]",
      "Extensions_h264CodecCapabilities": "{\"sendProfiles\":[\"42001f\",\"42e01f\",\"4d001f\"],\"receiveProfiles\":[\"42001f\",\"42e01f\",\"4d001f\",\"f4001f\"]}",
      "Extensions_IceConnectionState": "connected",
      "Extensions_IceConnectionStatePrevious": "checking",
      "Extensions_IceServers": "[{\"urls\":[\"turn:euaz.relay.teams.microsoft.com:3478?transport=udp\",\"turn:euaz.relay.teams.microsoft.com:443?transport=tcp\",\"turns:euaz.relay.teams.microsoft.com:443\"],\"credential\":\"true\",\"username\":\"true\"}]",
      "Extensions_IceTransportPolicy": "all",
      "Extensions_NegotiatedSrtp": "\"dtls\"",
      "Extensions_OfferedSrtp": "\"dtls\"",
      "Extensions_RelayCandidate": "none",
      "Extensions_SdpSemantics": "unified-plan",
      "Extensions_SignalingState": "stable",
      "Extensions_SignalingStatePrevious": "have-remote-offer",
      "Extensions_MaxSessionBandwidth": "4000",
      "Extensions_Bandwidth_uplinkStabilizationTime": "{\"time\":1,\"bandwidth\":300000,\"finished\":true,\"modality\":\"audio\"}",
      "Extensions_totalVideoControlMessages": "0",
      "Extensions_outOfOrderVideoControlMessages": "0",
      "Extensions_webcamFreezeIntervals": "0",
      "Extensions_processedStreamFreezeIntervals": "0",
      "Extensions_ReinvitelessContext": "{\"enabled\":false,\"maxStreamsForModality\":{\"video\":0,\"sharing\":0}}",
      "Extensions_IPAddress": "192.168.255.11",
      "Extensions_ReflexiveLocalIP": "none",
      "Extensions_NumberOfInterfaces": "1",
      "Extensions_StartTime": "1762458509668",
      "Extensions_EndTime": "1762458559520",
      "Extensions_AudioTransportRecvBitrate": "22850",
      "Extensions_AudioTransportSendBitrate": "2392",
      "Extensions_AudioPayloadRecvBitrate": "15054",
      "Extensions_AudioPayloadSendBitrate": "301",
      "Extensions_StartCallBWESendSide": "300000",
      "Extensions_EndCallBWESendSide": "1969117",
      "Extensions_BWEStdSendSide": "527574.69",
      "Extensions_BwPercentilesSendSide": "{\"5\":300000,\"50\":544493,\"95\":1844348.9}",
      "Extensions_AvgBwSendSide": "764170.32",
      "Extensions_WebRTCStats_ssrc_audio_recv_id": "IT01A3290777784",
      "Extensions_WebRTCStats_ssrc_audio_recv_ssrc": "3290777784",
      "Extensions_WebRTCStats_ssrc_audio_recv_mediaType": "audio",
      "Extensions_WebRTCStats_ssrc_audio_recv_bytesReceived": "914,4280,7289,8765,10270,11721,13636,16700,20234,23617,26112,28260,31438,35219,36684,36816,38860,39573,42333,45355,48816,50615,51559,51689,52523,53986,55185,55711,57395,59089,62439,65364,66889,69078,69923,72163,72291,72420",
      "Extensions_WebRTCStats_ssrc_audio_recv_packetsReceived": "14,64,108,132,156,180,211,255,304,353,390,420,463,513,536,540,572,585,627,674,724,753,770,774,790,815,835,846,872,900,950,994,1019,1054,1070,1106,1110,1114",
      "Extensions_WebRTCStats_ssrc_audio_recv_packetsLost": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_recv_googCodecName": "opus",
      "Extensions_WebRTCStats_ssrc_audio_recv_googTrackId": "{b67f20b9-1d25-4e19-a18a-fe0634fc3a71}",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_id": "T01",
      "Extensions_WebRTCStats_ssrc_audio_recv_transportId": "T01",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_selectedCandidatePairId": "CPPEnEMeyL_27kOHvgX",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_dtlsCipher": "TLS_AES_128_GCM_SHA256",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_srtpCipher": "AEAD_AES_128_GCM",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_id": "CPPEnEMeyL_27kOHvgX",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_responsesSent": "1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,7,7,7,7,7,8,8,8",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_requestsReceived": "1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,7,7,7,7,7,8,8,8",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRemoteCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_consentRequestsSent": "3,4,4,4,5,5,5,6,6,7,7,7,8,8,8,9,9,10,10,10,11,11,11,12,12,13,13,13,14,14,14,15,15,16,16,16,17,17",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googTransportType": "udp",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googLocalCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googWritable": "true",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_requestsSent": "4,5,5,5,6,6,6,7,7,8,8,8,9,9,9,10,10,11,11,11,12,12,12,13,13,14,14,14,15,15,15,16,16,17,17,17,18,18",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRtt": "1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googActiveConnection": "true",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_packetsDiscardedOnSend": "0",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_bytesReceived": "3083,8249,12778,15026,17203,19326,22109,26457,31363,36218,39749,42737,47171,52352,54461,54805,57745,58822,62810,67148,72009,74720,76140,76382,77716,79979,81738,82572,84984,87462,92212,96571,98796,101965,103258,106506,106746,107087",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_responsesReceived": "4,5,5,5,6,6,6,7,7,8,8,8,9,9,9,10,10,11,11,11,12,12,12,13,13,14,14,14,15,15,15,16,16,17,17,17,18,18",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_remoteCandidateId": "I27kOHvgX",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_localCandidateId": "IPEnEMeyL",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_localNetworkType": "ethernet",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_packetsSent": "28,33,38,44,48,54,59,64,70,75,81,86,103,109,113,117,125,129,135,139,143,150,155,160,165,169,179,190,195,200,214,222,227,232,237,242,248,253",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googLocalAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRemoteAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_bytesSent": "2959,3187,3391,3619,3771,3999,4203,4431,4611,4783,5010,5159,6160,6340,6460,6580,6888,7008,7188,7308,7428,7684,7856,8007,8156,8276,8806,9141,9337,9646,10234,10516,10712,10863,11012,11184,11364,11560",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googReadable": "true",
      "Extensions_WebRTCStats_ssrc_audio_recv_totalSamplesReceived": "9600,57600,105600,153600,201600,249600,298560,345600,393600,441600,489600,537600,585600,633600,681600,729600,777600,825600,873600,921600,969600,1018080,1065600,1113600,1161600,1209600,1257600,1305600,1353600,1401600,1449600,1497600,1545600,1593600,1641600,1689600,1737600,1786080",
      "Extensions_WebRTCStats_ssrc_audio_recv_totalAudioEnergy": "0.0283980305538819",
      "Extensions_WebRTCStats_ssrc_audio_recv_audioOutputLevel": "0.003021332438123722,0.004089480269783624,0.004272591326639607,0.003204443494979705,0.002990813928647725,0.003997924741355632,0.004272591326639607,0.005523850215155492,0.053956724753563036,0.032319101535081024,0.0026551103244117557,0.00946073793755913,0.08600115970336009,0.006714072084719382,0.002563554795983764,0.0025940733054597613,0.004913480025635548,0.0035706656086916715,0.007019257179479354,0.006622516556291391,0.0195623645741142,0.002533036286507767,0.003173924985503708,0.0027771843623157445,0.0021057771538438063,0.002349925229651784,0.006134220404675436,0.002563554795983764,0.004974517044587542,0.0034485915707876827,0.006317331461531419,0.023865474410229806,0.0029297769096957305,0.0035401470992156743,0.0032349620044557024,0.0034485915707876827,0.002197332682271798,0.0025940733054597613",
      "Extensions_WebRTCStats_ssrc_audio_recv_concealedSamples": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,717,717,717,717,717,717,717,717",
      "Extensions_WebRTCStats_ssrc_audio_recv_silentConcealedSamples": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_recv_fecPacketsReceived": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_recv_fecPacketsDiscarded": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_recv_jitter": "0.001,0.003,0.001,0.001,0.001,0.001,0.003,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.001,0.002,0.001,0.001,0.001,0.003,0.001,0.002,0.001,0.001,0.001,0.001,0.001",
      "Extensions_WebRTCStats_ssrc_audio_recv_packetsDiscarded": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_send_id": "OT01A3615918952",
      "Extensions_WebRTCStats_ssrc_audio_send_ssrc": "3615918952",
      "Extensions_WebRTCStats_ssrc_audio_send_mediaType": "audio",
      "Extensions_WebRTCStats_ssrc_audio_send_bytesSent": "0,31,39,47,59,67,79,87,95,107,115,126,135,636,648,656,664,676,684,696,704,712,724,732,740,752,760,986,1013,1021,1190,1386,1398,1406,1417,1426,1434,1446,1454",
      "Extensions_WebRTCStats_ssrc_audio_send_packetsSent": "0,11,15,19,25,29,35,39,43,49,53,58,63,79,85,89,93,99,103,109,113,117,123,127,131,137,141,150,161,165,170,184,190,194,199,204,208,214,218",
      "Extensions_WebRTCStats_ssrc_audio_send_packetsLost": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_send_googCodecName": "opus",
      "Extensions_WebRTCStats_ssrc_audio_send_googTrackId": "036cad6f-0305-46f1-9f51-62cdb59b19e6",
      "Extensions_WebRTCStats_ssrc_audio_send_googRtt": "2,2,2,2,2,1,1,1,1,1,1,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_id": "T01",
      "Extensions_WebRTCStats_ssrc_audio_send_transportId": "T01",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_selectedCandidatePairId": "CPPEnEMeyL_27kOHvgX",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_dtlsCipher": "TLS_AES_128_GCM_SHA256",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_srtpCipher": "AEAD_AES_128_GCM",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_localCertificateId": "CFC8:31:72:48:F1:D6:00:23:A0:9F:08:77:5C:D4:95:79:14:EB:61:39:57:3D:E1:7D:8C:F2:26:B7:77:E7:3B:A2",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_id": "CPPEnEMeyL_27kOHvgX",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesSent": "0,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,7,7,7,7,7,8,8,8",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsReceived": "0,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,7,7,7,7,7,8,8,8",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_consentRequestsSent": "2,3,4,4,4,5,5,5,6,6,7,7,7,8,8,8,9,9,10,10,10,11,11,11,12,12,13,13,13,14,14,14,15,15,16,16,16,17,17",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googTransportType": "udp",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googWritable": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsSent": "3,4,5,5,5,6,6,6,7,7,8,8,8,9,9,9,10,10,11,11,11,12,12,12,13,13,14,14,14,15,15,15,16,16,17,17,17,18,18",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRtt": "1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googActiveConnection": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsDiscardedOnSend": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesReceived": "0,3083,8249,12778,15026,17203,19326,22109,26457,31363,36218,39749,42737,47171,52352,54461,54805,57745,58822,62810,67148,72009,74720,76140,76382,77716,79979,81738,82572,84984,87462,92212,96571,98796,101965,103258,106506,106746,107087",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesReceived": "3,4,5,5,5,6,6,6,7,7,8,8,8,9,9,9,10,10,11,11,11,12,12,12,13,13,14,14,14,15,15,15,16,16,17,17,17,18,18",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_remoteCandidateId": "I27kOHvgX",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_localCandidateId": "IPEnEMeyL",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_localNetworkType": "ethernet",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsSent": "5,28,33,38,44,48,54,59,64,70,75,81,86,103,109,113,117,125,129,135,139,143,150,155,160,165,169,179,190,195,200,214,222,227,232,237,242,248,253",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesSent": "1080,2959,3187,3391,3619,3771,3999,4203,4431,4611,4783,5010,5159,6160,6340,6460,6580,6888,7008,7188,7308,7428,7684,7856,8007,8156,8276,8806,9141,9337,9646,10234,10516,10712,10863,11012,11184,11364,11560",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googReadable": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_audioInputLevel": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.00006103701895199438,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_send_totalAudioEnergy": "0.00003245250952915483",
      "Extensions_WebRTCStats_ssrc_audio_send_totalSamplesDuration": "38.85000000000084",
      "Extensions_WebRTCStats_ssrc_audio_send_jitter": "0.000479,0.000479,0.000479,0.000479,0.000479,0.000416,0.000416,0.000416,0.000416,0.000416,0.000416,0.0007909999999999999,0.0007909999999999999,0.0007909999999999999,0.0007909999999999999,0.0007909999999999999,0.0007909999999999999,0.0005,0.0005,0.0005,0.0005,0.0005,0.0005,0.0005,0.001041,0.001041,0.001041,0.001041,0.001041,0.001041,0.001041",
      "Extensions_Audio_recv_jitterBufferAvgSize": "46",
      "Extensions_Audio_recv_jitterBufferAvgDelayMs": "0",
      "Extensions_Audio_recv_packetsLostRateMax": "0",
      "Extensions_Audio_recv_jitterAvg": "1.211",
      "Extensions_Audio_recv_jitterMax": "3",
      "Extensions_Audio_recv_networkAvgLossRate": "0",
      "Extensions_Audio_recv_packetsLostAvg": "0",
      "Extensions_Audio_recv_healedRatioAvg": "0",
      "Extensions_Audio_recv_healedRatioMax": "0",
      "Extensions_Audio_recv_audioLevelAvg": "0.000763",
      "Extensions_Audio_send_rttAvg": "2",
      "Extensions_Audio_send_rttMax": "4",
      "Extensions_Audio_send_RawInputVolume": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_Audio_send_packetsLostRateMax": "0",
      "Extensions_Audio_send_presentationAPIUserDuration": "0",
      "Extensions_Audio_send_presentationDuration": "0",
      "Extensions_Audio_send_audioLevelAvg": "0.000001",
      "Extensions_Video_recv_StreamsMax": "0",
      "Extensions_Video_recv_StreamsMin": "0",
      "Extensions_Video_recv_StreamsMode": "0",
      "Extensions_Video_recv_TimeToFirstFrame": "-1",
      "Extensions_Video_recv_TimeToFirstFrameSinceSubscriptionStart": "-1",
      "Extensions_totalVideoRecv_macroblockRateReceivedMax": "0",
      "Extensions_totalVideoRecv_macroblockRateReceivedAvg": "0",
      "Extensions_totalVideoRecv_macroblockRateDecodedMax": "0",
      "Extensions_totalVideoRecv_macroblockRateDecodedAvg": "0",
      "Extensions_totalVideoRecv_macroblockRateMaxDecoderLossPercent": "0",
      "Extensions_totalVideoRecv_macroblockRateDecoderLossPercent": "0",
      "Extensions_Video_SubscriptionCounters": "{\"attempted\":0,\"subscribed\":0,\"unsubscribed\":0,\"failed\":0}",
      "Extensions_Sharing_recv_StreamsMax": "0",
      "Extensions_Sharing_recv_StreamsMin": "0",
      "Extensions_Sharing_recv_StreamsMode": "0",
      "Extensions_Sharing_recv_TimeToFirstFrame": "-1",
      "Extensions_Sharing_recv_TimeToFirstFrameSinceSubscriptionStart": "-1",
      "Extensions_Sharing_SubscriptionCounters": "{\"attempted\":0,\"subscribed\":0,\"unsubscribed\":0,\"failed\":0}",
      "Extensions_EncodedStreamWorker": "false",
      "Extensions_AudioCodecEvents": "{\"negotiationAttempts\":[],\"toggleCount\":0,\"negotiatedCount\":0,\"failedNegotiationCount\":0,\"decoderInitError\":0,\"encoderInitError\":0}",
      "Extensions_HevcCodecSupport": "[{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false}]",
      "Extensions_IsPstnCall": "false",
      "Extensions_UsesMixer": "false",
      "Extensions_InitialBWSeed": "402592",
      "Extensions_SentBWSeed": "402592",
      "Extensions_EarlyMedia_NumStatsPolls": "0",
      "Extensions_TimeToFirstAudioPacket": "11925",
      "Extensions_FetchTimeMax": "37.1",
      "Extensions_FetchTimeMedian": "3.1",
      "Extensions_LoopIntervalMax": "1012.5",
      "Extensions_LoopIntervalMedian": "987.4",
      "TerminatedReason": "1",
      "TerminatedState": "7",
      "DataHandlers": "{\"1\":[{\"added\":173,\"started\":11822,\"removed\":49441}],\"2\":[{\"added\":173,\"started\":11822,\"removed\":49441}],\"24\":[{\"added\":10421,\"started\":11822,\"removed\":49441}],\"25\":[{\"added\":10424,\"started\":11822,\"removed\":49441}],\"27\":[{\"added\":10421,\"started\":11822,\"removed\":49441}]}",
      "SharingControlEnabled": "true",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-2-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "de",
      "AppInfo.UserRole": "Member",
      "AppInfo.UserType": "Aad",
      "DeviceInfo.Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  ```
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&client-id=NO_AUTH&client-version=1DS-Web-JS-4.2.1&apikey=53fdaa090eb946b5a1d6cbdeb4f2ef66-bcbf6380-2590-41cc-ae60-9e467cd51835-7413&upload-time=1762458559928&ext.intweb.msfpc=GUID%3Dfbce5a52cc8f449f8a49e147bd2d3f25%26HASH%3Dfbce%26LV%3D202510%26V%3D4%26LU%3D1761758803913&time-delta-to-apply-millis=1123&w=0&NoResponseBody=true`
  ```json
  {
    "name": "skypecosi_concore_web_ts_calling_in_call_session",
    "time": "2025-11-06T19:49:19.925Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 12,
        "installId": "e01734fd-ae1c-499b-b453-6041a5f01798",
        "epoch": "235386963"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "P1AqXxNU2Yxgnc1zUac0A6"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
        "browserVer": "141.0.7390.67",
        "screenRes": "1024X768",
        "userConsent": false
      },
      "os": {
        "name": "Windows",
        "ver": "10"
      },
      "intweb": {
        "msfpc": "GUID=fbce5a52cc8f449f8a49e147bd2d3f25&HASH=fbce&LV=202510&V=4&LU=1761758803913"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "user_id": {
            "t": 321
          },
          "Skype_InitiatingUser_Username": {
            "t": 321
          },
          "SkypeId": {
            "t": 321
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "LocalStorage=4.3.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.1"
        }
      },
      "user_id": "u11",
      "Skype_InitiatingUser_Username": "u11",
      "SkypeId": "u11",
      "ui_version": "1415/25101616509",
      "CorrelationId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "PreviousCorrelationId": "091a4287-dd68-4fd3-b118-68aa0be7f39c",
      "EndpointId": "c6bcd1a5-b178-418d-82d1-164778781e82",
      "ParticipantId": "13b6d305-f968-4960-9eaa-dcb9dbfc1122",
      "CallType": "1",
      "ConversationType": "default",
      "Direction": "Incoming",
      "Origin": "0",
      "SelfParticipantRole": "callee",
      "Ring": "general",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "Region": "de",
      "Partition": "de01",
      "IsHuddleGroupCall": "True",
      "IsEmergency": "False",
      "TsCallingVersion": "2025.40.01.4",
      "TerminationState": "7",
      "TerminationReason": "1",
      "EventTimestampBag": "{\"eventStart\":1762458509445,\"events\":[{\"UpdateEndpointMetadata\":{\"start\":11178,\"duration\":535,\"status\":\"Success\",\"causeId\":\"966432d1\"}},{\"_UpdateLocalParticipantStream\":{\"start\":11578,\"causeId\":\"a657e4a0\"}},{\"_UpdateLocalParticipantStream\":{\"start\":11684,\"causeId\":\"26c450f0\"}},{\"_UpdateLocalParticipantStream\":{\"start\":11728,\"causeId\":\"6c242b92\"}},{\"AudioStateChanged\":{\"start\":11892,\"causeId\":\"612670aa\",\"data\":[{\"state\":{\"content\":\"audio\",\"direction\":\"receive\",\"stream\":\"active\"}}]}},{\"_SignalingStateChanged\":{\"start\":50004,\"causeId\":\"26910fa3\",\"data\":[{\"status\":\"RemoteTerminated\",\"reason\":{\"code\":0,\"subCode\":0,\"phrase\":\"CallEndReasonLocalUserInitiated\",\"resultCategories\":[\"Success\"],\"pickupCode\":\"\"}}]}},{\"_SetCallState\":{\"start\":50004,\"causeId\":\"26910fa3\",\"data\":[{\"state\":7,\"reason\":1}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":50060,\"causeId\":\"26910fa3\",\"data\":[{\"state\":7,\"reason\":1}]}},{\"_MediaCleanUp\":{\"start\":50060,\"duration\":391,\"status\":\"Success\",\"causeId\":\"26910fa3\"}}]}",
      "HostName": "teams.microsoft.com",
      "ComplianceRecordingContentLength": "0",
      "ConversationStartTime": "2025-11-06T19:48:29.3891948Z",
      "ClientType": "enterprise",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-2-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "de",
      "AppInfo.UserRole": "Member",
      "AppInfo.UserType": "Aad",
      "DeviceInfo.Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  ```
- GET `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Asharedcalllogs?view=msnp24Equivalent`
  ```json
  {
    "errorCode": 404,
    "message": "{\"errorCode\":404,\"message\":\"Conversation was not found\",\"subErrorCode\":\"RequestHandlerException\"}",
    "standardizedError": {
      "errorCode": 404,
      "errorSubCode": 1,
      "errorSubCodeString": "RequestHandlerException",
      "errorDescription": "RequestHandlerException-Conversation was not found"
    }
  }
  ```
- GET `https://outlook.office.com/api/v2.0/me/messages?$expand=SingleValueExtendedProperties($filter=PropertyId%20eq%20%27Integer%20{00020328-0000-0000-c000-000000000046}%20Id%200x6801%27%20or%20PropertyId%20eq%20%27String%20{00020386-0000-0000-c000-000000000046}%20Name%20X-VoiceMessageConfidenceLevel%27%20or%20PropertyId%20eq%20%27String%20{00020386-0000-0000-c000-000000000046}%20Name%20X-VoiceMessageTranscription%27)&$top=30&$select=From,Body,IsRead,Id,ReceivedDateTime,InternetMessageHeaders&$filter=(SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.Microsoft.Voicemail.UM.CA%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.rpmsg.Microsoft.Voicemail.UM.CA%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.rpmsg.Microsoft.Voicemail.UM%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.Microsoft.Exchange.Voice.UM.CA%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.Microsoft.Voicemail.UM%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.Microsoft.Exchange.Voice.UM%27))%20and%20parentFolderId%20ne%20%27deleteditems%27`
  ```json
  {
    "value": []
  }
  ```
- POST `https://teams.microsoft.com/ups/emea/v1/pubsub/subscriptions/611e9e3d-02e3-46dd-a329-e9f52b211c54`
  ```json
  {
    "trouterUri": "https://pub-ent-euno-10-f.trouter.teams.microsoft.com:3443/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "shouldPurgePreviousSubscriptions": false,
    "subscriptionsToAdd": [
      {
        "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
        "source": "ups"
      }
    ],
    "subscriptionsToRemove": []
  }
  ```
  ```json
  {
    "addStatuses": [
      {
        "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
        "source": "ups",
        "status": 20200
      }
    ],
    "removeStatuses": []
  }
  ```

Note: Requests for image or audio media have been excluded.
