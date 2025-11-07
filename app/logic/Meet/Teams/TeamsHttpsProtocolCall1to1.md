# Teams HTTPS Protocol - Call 1 to 1

After having loaded the Microsoft Teams website, the following HTTPS requests are made while calling 1 to 1:
- PUT `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Acalllogs/properties?name=consumptionhorizon`
  ```json
  {
    "consumptionhorizon": "1762458559928;1762544090014;1762458559928"
  }
  ```
- PUT `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Acalllogs/properties?name=consumptionhorizon`
  ```json
  {
    "consumptionhorizon": "1762458559928;1762544090021;1762458559928"
  }
  ```
- PUT `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Acalllogs/properties?name=consumptionhorizon`
  ```json
  {
    "consumptionhorizon": "1762458559928;1762544090028;1762458559928"
  }
  ```
- PUT `https://teams.microsoft.com/api/chatsvc/de/v1/users/ME/conversations/48%3Acalllogs/properties?name=consumptionhorizon`
  ```json
  {
    "consumptionhorizon": "1762458559928;1762544090066;1762458559928"
  }
  ```
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/r_data-resolvers-update-client-state-f1bcac16619b604e.js`
  ```json
"(this.webpackChunk_msteams_react_web_client=this.webpackChunk_msteams_react_web_client||[]).push([[482526],{382912:s=>{var e=[{types:{UpdateClientStateSource:[5,[\"Calling\"]]}},{types:{Mutation:[2,{updateClientStateVeryActive:[2,{isVeryActive:7,source:\"UpdateClientStateSource!\"}]}]}}];s.exports=e},858648:(s,e,t)=>{\"use strict\";t.r(e),t.d(e,{resolvers:()=>l,typeDefs:()=>i});var i=t(382912);const l={Mutation:{async updateClientStateVeryActive(d,{isVeryActive:r,source:a},{clientState:c,loggerFactory:o}){const u=o.newLogger(\"UpdateClientStateResolver\",\"data-resolvers-update-client-state\"),n=c;return r?n.startVeryActive(a):n.stopVeryActive(a),u.log(`Client state changed: [isVeryActive=${r}][source=${a}]`),!0}}}}}]);\n"
  ```
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/r_data-resolvers-update-client-state-f1bcac16619b604e.js`
  ```json
"(this.webpackChunk_msteams_react_web_client=this.webpackChunk_msteams_react_web_client||[]).push([[482526],{382912:s=>{var e=[{types:{UpdateClientStateSource:[5,[\"Calling\"]]}},{types:{Mutation:[2,{updateClientStateVeryActive:[2,{isVeryActive:7,source:\"UpdateClientStateSource!\"}]}]}}];s.exports=e},858648:(s,e,t)=>{\"use strict\";t.r(e),t.d(e,{resolvers:()=>l,typeDefs:()=>i});var i=t(382912);const l={Mutation:{async updateClientStateVeryActive(d,{isVeryActive:r,source:a},{clientState:c,loggerFactory:o}){const u=o.newLogger(\"UpdateClientStateResolver\",\"data-resolvers-update-client-state\"),n=c;return r?n.startVeryActive(a):n.stopVeryActive(a),u.log(`Client state changed: [isVeryActive=${r}][source=${a}]`),!0}}}}}]);\n"
  ```
- GET `https://teams.microsoft.com/api/mt/emea/beta/tenant/privacyProfile`
  ```json
  {
    "statementUrl": ""
  }
  ```
- GET `https://teams.microsoft.com/api/mt/emea/beta/tenant/privacyProfile`
  ```json
  {
    "statementUrl": ""
  }
  ```
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/wasmvqe-web-worker-inner-0a9f758aa0651078.js`
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/wasmvqe-web-worker-inner-0a9f758aa0651078.js`
  ```json
"(this.webpackChunk_msteams_react_web_client=this.webpackChunk_msteams_react_web_client||[]).push([[173176],{422518:()=>{globalThis.addEventListener(\"message\",async e=>{if(console.log(\"Message received from main script\"),e.data.msg===\"compile\")if(e.data.buffer)try{const s=await WebAssembly.compile(e.data.buffer);globalThis.postMessage({msg:\"compile\",module:s})}catch(s){globalThis.postMessage({msg:\"error\",error:s.message})}else globalThis.postMessage({msg:\"error\",error:\"data buffer is empty\"})})}}]);\n"
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-04-prod-aks.broker.skype.com/api/v1/subscribe/1105cbe6-c6a5-4fe0-bf14-0f66bb4718a5/0?i=10-128-175-157`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-04-prod-aks.broker.skype.com/api/v1/subscribe/1105cbe6-c6a5-4fe0-bf14-0f66bb4718a5/0?i=10-128-175-157",
    "expirationTimeInSec": 30
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-04-prod-aks.broker.skype.com/api/v1/subscribe/1105cbe6-c6a5-4fe0-bf14-0f66bb4718a5/0?i=10-128-175-157`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-04-prod-aks.broker.skype.com/api/v1/subscribe/1105cbe6-c6a5-4fe0-bf14-0f66bb4718a5/0?i=10-128-175-157",
    "expirationTimeInSec": 30
  }
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  (Request was too long to pretty-print)
  ```json
  {
    "acc": 17
  }
  ```
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "scenarions",
    "time": "2025-11-07T19:34:38.412Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 72,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
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
        "SpanId": "8550ce7ee6d9f2fc",
        "isNS": "true"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "fetch_voicemails",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"useUpdatedGetVoicemailsPath\",\"delta\":0,\"elapsed\":84122,\"sequence\":1,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":630,\"elapsed\":84752,\"sequence\":2,\"stepDelta\":630,\"previousStep\":\"useUpdatedGetVoicemailsPath\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"commandSource\":\"CDLWorker\"},{\"commandSource\":\"CDLWorker\",\"callingDataBag\":\"{\\n    \\\"isOwnMailbox\\\": true,\\n  }\"}]"
      },
      "InstanceId": "6a96fe0f-2cdc-4548-ad79-dc4c79c662b3",
      "delta": "630",
      "elapsed": "84752",
      "sequence": "2",
      "stepDelta": "630",
      "previousStep": "useUpdatedGetVoicemailsPath",
      "commandSource": "CDLWorker",
      "callingDataBag": "{\n    \"isOwnMailbox\": true,\n  }",
      "isInEst": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "865f6c26-5860-45f5-84f4-c8b8e6bd194f"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "embed",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web"
      },
      "AppInfo": {
        "ClientType": "cdlworker",
        "ProcessArchitecture": "x64",
        "Language": "en-us",
        "Locale": "en-us",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
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
- PUT `https://teams.microsoft.com/ups/emea/v1/me/endpoints/`
  ```json
  {
    "availability": "Busy",
    "activity": "InACall",
    "id": "b40278a3-2bec-45ac-9f15-e4c6806bed8b",
    "activityReporting": "Transport",
    "deviceType": "Web"
  }
  ```
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&client-id=NO_AUTH&client-version=1DS-Web-JS-4.2.1&apikey=53fdaa090eb946b5a1d6cbdeb4f2ef66-bcbf6380-2590-41cc-ae60-9e467cd51835-7413&upload-time=1762544110291&ext.intweb.msfpc=GUID%3Dfbce5a52cc8f449f8a49e147bd2d3f25%26HASH%3Dfbce%26LV%3D202510%26V%3D4%26LU%3D1761758803913&time-delta-to-apply-millis=use-collector-delta&w=0&NoResponseBody=true`
  ```json
  {
    "name": "skypecosi_concore_web_ts_calling_call_setup_session",
    "time": "2025-11-07T19:35:10.283Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 1,
        "installId": "f15d7e43-3184-4cb8-ba62-711c520340e0",
        "epoch": "436055299"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "8SQtpBEWvd3h+0s/esVwFk"
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
      "ui_version": "1415/25101616511",
      "CorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "PreviousCorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "EndpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "ParticipantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "CallType": "1",
      "Direction": "Outgoing",
      "Origin": "0",
      "SelfParticipantRole": "caller",
      "Ring": "general",
      "Region": "de",
      "Partition": "de01",
      "IsHuddleGroupCall": "True",
      "IsEmergency": "False",
      "TsCallingVersion": "2025.40.01.4",
      "EventTimestampBag": "{\"eventStart\":1762544091815,\"events\":[{\"_SetCallOrigin\":{\"start\":1,\"causeId\":\"c5e8b78c\",\"data\":[{\"origin\":0}]}},{\"Initialize\":{\"start\":139,\"duration\":1,\"status\":\"Success\",\"causeId\":\"f5f33cba\"}},{\"StartCall\":{\"start\":172,\"duration\":18293,\"status\":\"Success\",\"causeId\":\"06df8c0c\"}},{\"_setMaxVbssChannels\":{\"start\":174,\"causeId\":\"06df8c0c\",\"data\":[{}]}},{\"_SetCallState\":{\"start\":175,\"causeId\":\"06df8c0c\",\"data\":[{\"state\":2,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":189,\"causeId\":\"06df8c0c\",\"data\":[{\"state\":2,\"reason\":0}]}},{\"_SetLocalAudio\":{\"start\":190,\"causeId\":\"06df8c0c\",\"data\":[{\"value\":true}]}},{\"CreatingConference\":{\"start\":190,\"causeId\":\"06df8c0c\"}},{\"_ReinvitelessConfig\":{\"start\":190,\"causeId\":\"06df8c0c\",\"data\":[{\"reinvitelessConfig\":{\"maxReinvitelessMediaForVBSSMultiparty\":1,\"maxReinvitelessMediaForVideoMultiparty\":6}}]}},{\"CreatedConference\":{\"start\":217,\"causeId\":\"06df8c0c\"}},{\"_SignalingStateChanged\":{\"start\":4120,\"causeId\":\"06df8c0c\",\"data\":[{\"status\":\"Connecting\"}]}},{\"_SignalingStateChanged\":{\"start\":5886,\"causeId\":\"ac5fb38c\",\"data\":[{\"status\":\"Ringing\"}]}},{\"_WebOnAnswer\":{\"start\":17689,\"causeId\":\"b30ca6dd\",\"data\":[{\"isRenegotiation\":false,\"isEscalation\":false,\"mediaTypes\":[\"Audio\"],\"newOffer\":false}]}},{\"_CallModeChanged\":{\"start\":17689,\"causeId\":\"b30ca6dd\",\"data\":[{\"newCallMode\":1,\"oldCallMode\":0}]}},{\"_SignalingStateChanged\":{\"start\":17691,\"causeId\":\"b30ca6dd\",\"data\":[{\"status\":\"Connected\"}]}},{\"_SetCallState\":{\"start\":17692,\"causeId\":\"b30ca6dd\",\"data\":[{\"state\":3,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":17741,\"causeId\":\"b30ca6dd\",\"data\":[{\"state\":3,\"reason\":0}]}},{\"_ParticipantJoined\":{\"start\":17757,\"duration\":0,\"status\":\"Success\",\"result\":[{\"participantId\":\"92dc4334-4445-48cc-8657-e46a4028f46f\"}],\"causeId\":\"e53e64f0\"}},{\"AddParticipant\":{\"start\":17758,\"duration\":1,\"status\":\"Success\",\"result\":{\"code\":0,\"phrase\":\"\",\"subCode\":0},\"causeId\":\"e53e64f0\",\"data\":[{\"participantLegId\":\"92dc4334-4445-48cc-8657-e46a4028f46f\"}]}},{\"AddParticipant\":{\"start\":17760,\"duration\":0,\"status\":\"Success\",\"result\":{\"code\":0,\"phrase\":\"\",\"subCode\":0},\"causeId\":\"e53e64f0\",\"data\":[{\"participantLegId\":\"92dc4334-4445-48cc-8657-e46a4028f46f\"}]}},{\"_ConnectCall\":{\"start\":18465,\"causeId\":\"06df8c0c\",\"data\":[{\"phases\":{\"InitializeMediaSession\":{\"t\":29},\"UpdateMediaModalities\":{\"t\":325},\"CreateOffer\":{\"t\":3132},\"GetSignalingMediaTypes\":{\"t\":1},\"MuteUnmute\":{\"t\":2},\"MuteUnmuteSpeakers\":{\"t\":11},\"CallStart\":{\"t\":8},\"WaitForConnect\":{\"t\":14048},\"WaitForAnswer\":{\"t\":15},\"ProcessAnswer\":{\"t\":654},\"CompleteNegotiation\":{\"t\":9}}}]}}]}",
      "HostName": "teams.microsoft.com",
      "ComplianceRecordingContentLength": "0",
      "ConversationStartTime": "2025-11-07T19:34:56.4571284Z",
      "ClientType": "enterprise",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "de",
      "Call.Type": "oneToOneCall",
      "Call.IsChatVersion2": "true",
      "Call.Id": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "Call.ParticipantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "Call.WasPoppedOut": "true",
      "AppInfo.UserRole": "Member",
      "AppInfo.UserType": "Aad",
      "DeviceInfo.Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  ```
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&client-id=NO_AUTH&client-version=1DS-Web-JS-4.2.1&apikey=1cae5691997646c98b01d15beddae7a3-ce16e198-bc32-420f-ac64-42bb916111af-6865&upload-time=1762544110371&ext.intweb.msfpc=GUID%3Dfbce5a52cc8f449f8a49e147bd2d3f25%26HASH%3Dfbce%26LV%3D202510%26V%3D4%26LU%3D1761758803913&w=0&NoResponseBody=true`
  ```json
  {
    "name": "mdsc_webrtc_session_initial",
    "time": "2025-11-07T19:35:10.368Z",
    "ver": "4.0",
    "iKey": "o:1cae5691997646c98b01d15beddae7a3",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 2,
        "installId": "f15d7e43-3184-4cb8-ba62-711c520340e0",
        "epoch": "436055299"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "8SQtpBEWvd3h+0s/esVwFk"
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
          "Extensions_ReflexiveLocalIP": {
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
      "uiVersion": "1415/25101616511",
      "agent_environment_id": "d1448933-349c-4b3f-bf44-eb1a64a58e3f",
      "CorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "participant_id": "44c27356-e699-4ade-b85e-257918a5fc42",
      "endpoint_id": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "media_leg_id": "A459AEF95DFD4DF3B67F6A16B288DD8B",
      "ts_calling_version": "2025.40.01.4",
      "metrics_MediaLegId": "A459AEF95DFD4DF3B67F6A16B288DD8B",
      "metrics_CreationTime": "17625440920120000",
      "metrics_CallNumber": "1",
      "metrics_SessionId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "metrics_MultiParty": "false",
      "metrics_ErrorType": "none",
      "metrics_IncompatibleOffer": "false",
      "metrics_TerminationTime": "NaN",
      "metrics_CallDuration": "183240000",
      "metrics_IceInitTime": "17625441098320000",
      "metrics_IceConnectedStateTime": "0",
      "metrics_NegotiationCount": "1",
      "metrics_RejectedNegotiationCount": "0",
      "metrics_InitialNegotiationCompleted": "true",
      "metrics_InitialNegotiationType": "Offering",
      "metrics_FinalAnswerTime": "17625441102710000",
      "metrics_TransportReconnectedCount": "0",
      "metrics_Relay": "{\"address\":\"euaz.relay.teams.microsoft.com\",\"expires\":604800,\"realm\":\"\\\"rtcmedia\\\"\",\"credentials\":true,\"ports\":\"udp:3478,tcp:443,tls:443\",\"fqdns\":\"euaz.relay.teams.microsoft.com\"}",
      "metrics_ActiveModalities": "{\"audio\":\"sendrecv\",\"video\":\"inactive\",\"data\":\"sendrecv\"}",
      "metrics_AllowedAudioSend": "true",
      "metrics_AllowedVideoSend": "true",
      "metrics_AllowedScreensharingSend": "true",
      "metrics_RelayManager": "{\"config\":{\"Service\":{\"url\":\"https://teams.microsoft.com/trap\",\"tokenUrl\":\"https://teams.microsoft.com/trap/tokens\",\"disabled\":false,\"supportedTokenTypes\":\"skype AAD CAE\"},\"Relay\":{\"Turn\":{\"realm\":\"rtcmedia\",\"addresses\":[\"euaz.relay.teams.microsoft.com\"],\"fqdns\":[\"euaz.relay.teams.microsoft.com\"],\"tcpPort\":443,\"tlsPort\":443,\"udpPort\":3478,\"url\":\"\"},\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478,\"Lync\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478},\"Skype\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478}},\"Token\":{\"earlyRefreshMinutes\":9720,\"earlyRefreshPercentage\":4}},\"stats\":{\"configFetch\":{\"time\":1762544018353,\"duration\":544,\"version\":2},\"skypeTokenFetch\":{\"time\":1762544018897,\"duration\":264,\"version\":2}}}",
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
      "metrics_ETag": "\"8KfQrXUitMM2XYCywLwTaMyh1R0UpOstIV7uPRvWxXM=\"",
      "metrics_ConfigIds": "P-E-1718359-2-4,P-E-1717750-C1-6,P-E-1717237-2-6,P-E-1716081-C1-6,P-E-1713802-2-6,P-E-1713707-C1-6,P-E-1713684-C1-6,P-E-1704515-2-6,P-E-1700450-2-7,P-E-1694641-2-6,P-E-1691036-2-6,P-E-1680105-2-6,P-E-1676936-C1-6,P-E-1675286-2-6,P-E-1670133-2-6,P-E-1660458-C1-5,P-E-1658080-C1-11,P-E-1656524-2-6,P-E-1655667-2-6,P-E-1653089-3-8,P-E-1651332-2-6,P-E-1643648-2-6,P-E-1641797-C1-6,P-E-1633843-2-6,P-E-1621471-2-6,P-E-1618933-2-6,P-E-1617149-2-6,P-E-1616887-2-6,P-E-1616819-2-6,P-E-1613942-2-6,P-E-1608951-C1-3,P-E-1608371-2-6,P-E-1604926-C1-5,P-E-1598909-C1-6,P-E-1575172-2-5,P-E-1574158-2-10,P-E-1570390-2-6,P-E-1566952-C1-6,P-E-1568381-C1-6,P-E-1566716-C1-10,P-E-1565836-2-6,P-E-1565831-2-6,P-E-1544576-2-3,P-R-1665746-12-10,P-R-1645583-12-13,P-R-1634465-12-13,P-R-1633491-12-13,P-R-1632047-12-13,P-R-1630681-12-10,P-R-1611700-12-14,P-R-1606855-12-14,P-R-1598296-12-12,P-R-1587774-12-12,P-R-1584387-12-13,P-R-1580901-12-15,P-R-1577920-12-13,P-R-1577892-18-3,P-R-1575005-C11-10,P-R-1563326-12-14,P-R-1558616-12-17,P-R-1553816-12-12,P-R-1551350-12-15,P-R-1543947-12-13,P-R-1523352-12-14,P-R-1534344-12-13,P-R-1521918-12-9,P-R-1475504-12-14,P-R-1477139-12-19,P-R-1472589-12-28,P-R-1470220-12-11,P-R-1282626-12-35,P-R-1458723-12-13,P-R-1457926-12-2,P-R-1446888-12-17,P-R-1442911-12-17,P-R-1442161-12-17,P-R-1438633-12-12,P-R-1417298-12-18,P-R-1416330-12-20,P-R-1102981-9-69,P-R-1270215-12-8,P-R-1264668-12-16,P-R-1262976-12-11,P-R-1223031-9-9,P-R-1244045-18-14,P-R-1175069-9-8,P-R-1226424-9-4,P-R-1224690-9-9,P-R-1168166-9-10,P-R-1160589-9-7,P-R-1156430-9-6,P-R-1154814-3-6,P-R-1150013-9-11,P-R-1148658-9-8,P-R-1141462-9-23,P-R-1136249-9-9,P-R-1133113-9-8,P-R-1130598-9-10,P-R-1128207-9-28,P-R-1117564-9-10,P-R-1111900-9-79,P-R-1111902-9-11,P-R-1101306-9-6,P-R-1096762-9-24,P-R-1082715-9-35,P-R-1082433-9-23,P-R-1082359-9-14,P-R-1082351-9-12,P-R-1080906-6-6,P-R-1070816-6-19,P-R-1070395-1-8,P-R-1036090-19-62,P-R-1016745-11-11,P-R-1006078-1-32,P-R-115866-10-27,P-R-107136-10-42,P-R-96498-10-27,P-R-95572-41-185,P-R-94120-1-6,P-R-88231-9-17,P-R-79878-11-70,P-R-71785-7-16,P-R-63313-1-4,P-D-38372-1-4,P-D-27831-1-40,pe17183592:1034641,pe1717750c1:1034986,pe17172372:1034484,pe1716081c1:1033550,pe17138022:1031142,pe1713707c1:1031006,pe1713684c1:1030981,pe17045152:1023158,pe17004502:1027959,pe16946412:1018058,pe16910362:1013539,pe16801052:1010383,pe1676936c1:1006853,pe16752862:1005633,pe16701332:1002053,pe1660458c1:304475,pe1658080c1:1010368,pe16565242:301668,pe16556672:300926,pe16530893:301201,pe16513322:296134,pe16436482:288428,pe1641797c1:286186,pe16338432:277836,pe16214712:266864,pe16189332:264581,pe16171492:262972,pe16168872:262654,pe16168192:262662,pe16139422:260005,pe16083712:254400,pe1604926c1:250956,pe1598909c1:245917,pe15751722:222344,pe15741582:224394,pe15703902:219213,pe1568381c1:218197,pe1566716c1:228730,pe15658362:216043,pe15658312:216047",
      "metrics_GPUName": "ANGLE (Intel, Intel(R) HD Graphics Direct3D9Ex vs_3_0 ps_3_0, igdumd64.dll)",
      "metrics_PermissionStates": "{\"microphone\":\"granted\",\"camera\":\"granted\"}",
      "metrics_DeviceList": "[{\"label\":\"046d:0825 Cam\",\"kind\":\"microphone\"},{\"label\":\"046d:0825 Cam\",\"kind\":\"camera\"},{\"label\":\"High Definition\",\"kind\":\"speaker\"}]",
      "metrics_DeviceListDebug": "{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}",
      "metrics_DevicesChangeCount": "0",
      "metrics_DevicesPollChangeCount": "0",
      "metrics_DeviceSelectionChangeCount": "0",
      "metrics_DeviceSelectionChangeFromInterfaceCount": "0",
      "metrics_DevicesCount": "{\"microphone\":1,\"camera\":1,\"speaker\":1,\"compositeAudio\":0,\"audioIngestDevice\":0,\"virtualDevice\":0}",
      "metrics_DeviceEnumerationTimings": "{\"max\":629,\"min\":7,\"avg\":126}",
      "metrics_UsedMicrophone": "046d:0825 Cam",
      "metrics_UsedSpeaker": "High Definition",
      "metrics_UsedCamera": "046d:0825 Cam",
      "metrics_DeviceEvents": "[{\"eventType\":\"permissions_state_changed\",\"timestamp\":-74134,\"payload\":{\"microphone\":\"granted\",\"camera\":\"unknown\"}},{\"eventType\":\"selected_devices_changed\",\"timestamp\":-74131,\"payload\":{\"microphone\":\"046d:0825 Cam\",\"camera\":\"046d:0825 Cam\",\"speaker\":\"High Definition\",\"fromInterface\":false}},{\"eventType\":\"devices_changed\",\"timestamp\":-74130,\"payload\":{\"devices\":[{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{\"autoGainControl\":[true,false],\"channelCount\":{\"max\":1,\"min\":1},\"echoCancellation\":[true,false,\"remote-only\"],\"latency\":{\"max\":0.01,\"min\":0},\"noiseSuppression\":[true,false],\"sampleRate\":{\"max\":48000,\"min\":48000},\"sampleSize\":{\"max\":16,\"min\":16},\"voiceIsolation\":[true,false]},\"groupId\":\"1\"},{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{\"aspectRatio\":{\"max\":1280,\"min\":0.0010416666666666667},\"facingMode\":[],\"frameRate\":{\"max\":30,\"min\":1},\"height\":{\"max\":960,\"min\":1},\"resizeMode\":[\"none\",\"crop-and-scale\"],\"width\":{\"max\":1280,\"min\":1}},\"groupId\":\"1\"},{\"label\":\"High Definition\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"2\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"permissions_state_changed\",\"timestamp\":-74109,\"payload\":{\"microphone\":\"granted\",\"camera\":\"granted\"}},{\"eventType\":\"stream_created\",\"timestamp\":-1868,\"payload\":{\"id\":0,\"mediaType\":\"Audio\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":2633,\"payload\":{\"id\":0,\"mediaType\":\"Audio\",\"timestamp\":3156,\"sampleRate\":16000}},{\"eventType\":\"ask_device_permission\",\"timestamp\":2641,\"payload\":{\"constraints\":{\"audio\":true,\"video\":false},\"resultConstraints\":{\"audio\":true,\"video\":false},\"reason\":\"stream_acquisition\"}}]",
      "metrics_AudioEffects": "[{\"timestamp\":11372,\"payload\":{\"audioEffectsCapability\":3,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":226,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep NS\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0.9990000128746033,\"5\":0},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"799;Avg,2.253942;0.500000,2.050000;0.700000,2.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,3.050000;0.990000,5.050000;Max,30.000000\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-57.585938,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-56.296875,\"nearEndOutputRMS_dBFS\":-113.671875},\"wasmCompilationTimeMs\":11,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.033,\"sampleRate\":16000,\"currentTime\":8.224,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}}]",
      "metrics_WorkerEvents": "[{\"timestamp\":2394,\"workerType\":\"wasmvqe\",\"workerLoadTimeMs\":1062,\"msg\":\"\\\"wasm-worker-loaded\\\"\"}]",
      "metrics_MediaByPassEnabled": "false",
      "metrics_DominantSpeaker": "{\"activeStrategy\":\"client\",\"changedCountContributingSources\":0,\"changedCountDSH\":0}",
      "metrics_AudioSourceNumOfReopenRequests": "1",
      "metrics_AudioSourceNumOfSuccessfulReopens": "1",
      "metrics_AudioCaptureErrorCodeFlagsInit": "0",
      "metrics_AudioRenderErrorCodeFlagsInit": "0",
      "metrics_AudioSinkNumOfReopenRequests": "0",
      "metrics_AudioSinkNumOfSuccessfulReopens": "0",
      "metrics_MicUnmutedButSilent": "false",
      "metrics_MicUnmutedButSilentUnreliable": "false",
      "metrics_CallSetupTimeTracker": "{\"createOfferAsync\":[[{\"name\":\"queryRelaysAsync\",\"duration\":9.6,\"ts\":1762544092389,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"checkVideoCodecsSupport\",\"duration\":362.4,\"ts\":1762544092398.6,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"encStreamsManagerInitialize\",\"duration\":0.2,\"ts\":1762544092762.9,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"initAudioCodec\",\"duration\":0.4,\"ts\":1762544092762.9,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"assurePeerConnectionAsync\",\"duration\":374.6,\"ts\":1762544092388.8,\"parentName\":\"createOfferAsync\"},{\"name\":\"updateStreamsWithModalities\",\"duration\":1879.6,\"ts\":1762544092774.7,\"parentName\":\"createOfferAsync|updateStreams\"},{\"name\":\"updateSenders\",\"duration\":78.2,\"ts\":1762544094654.3,\"parentName\":\"createOfferAsync|updateStreams\"},{\"name\":\"assureStreamsAndDataChannel\",\"duration\":1969.8,\"ts\":1762544092763.4,\"parentName\":\"createOfferAsync\"},{\"name\":\"createOffer\",\"duration\":37,\"ts\":1762544094733.2,\"parentName\":\"createOfferAsync\"},{\"name\":\"sLD\",\"duration\":171.9,\"ts\":1762544094770.2,\"parentName\":\"createOfferAsync\"},{\"name\":\"candidates\",\"duration\":526.3,\"ts\":1762544094942.1,\"parentName\":\"createOfferAsync\"},{\"name\":\"createOfferAsync\",\"duration\":3111.2,\"ts\":1762544092388.8,\"parentName\":\"\"},{\"name\":\"transportConnected\",\"duration\":0.3,\"ts\":1762544110334.9,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"}]],\"processAnswerAsync\":[[{\"name\":\"streamSendersManagerUpdate\",\"duration\":207,\"ts\":1762544109624.2,\"parentName\":\"processAnswerAsync\"},{\"name\":\"setRemoteDescription\",\"duration\":435.2,\"ts\":1762544109832.8,\"parentName\":\"processAnswerAsync\"},{\"name\":\"streamSendersManagerActivate\",\"duration\":1.4,\"ts\":1762544110268,\"parentName\":\"processAnswerAsync\"},{\"name\":\"processAnswerAsync\",\"duration\":646.2,\"ts\":1762544109624.2,\"parentName\":\"\"}]]}",
      "metrics_BrowserFingerprint": "{\"webdriver\":false,\"pluginsLength\":5,\"languageLength\":1,\"mimeTypesLength\":2,\"outerWidth\":1024,\"outerHeight\":728,\"innerWidth\":1024,\"innerHeight\":641,\"clientWidth\":1024,\"clientHeight\":641,\"loadEventEnd\":5528.5,\"loadEventStart\":5528.5,\"hasChrome\":true,\"hasPlaywright\":false,\"hasSelenium\":false,\"hasNightmare\":false,\"hasPhantom\":false,\"hasCypress\":false}",
      "metrics_ReportGenerationTimeMs": "9.4",
      "metrics_piiFields": "{\"IPAddress\":\"IPv4\",\"ReflexiveLocalIP\":\"IPv4\"}",
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
      "Extensions_OfferedSrtp": "\"unknown\"",
      "Extensions_RelayCandidate": "{\"priority\":\"41886207\",\"time\":671}",
      "Extensions_SdpSemantics": "unified-plan",
      "Extensions_SignalingState": "stable",
      "Extensions_SignalingStatePrevious": "have-local-offer",
      "Extensions_MaxSessionBandwidth": "4000",
      "Extensions_totalVideoControlMessages": "0",
      "Extensions_outOfOrderVideoControlMessages": "0",
      "Extensions_webcamFreezeIntervals": "0",
      "Extensions_processedStreamFreezeIntervals": "0",
      "Extensions_ReinvitelessContext": "{\"enabled\":false,\"maxStreamsForModality\":{\"video\":0,\"sharing\":0}}",
      "Extensions_IPAddress": "192.168.255.11",
      "Extensions_ReflexiveLocalIP": "82.19.9.88",
      "Extensions_NumberOfInterfaces": "1",
      "Extensions_StartTime": "1762544092013",
      "Extensions_AvgBwSendSide": "0",
      "Extensions_Audio_send_presentationAPIUserDuration": "0",
      "Extensions_Audio_send_presentationDuration": "0",
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
      "Extensions_FetchTimeMax": "-1",
      "Extensions_FetchTimeMedian": "-1",
      "Extensions_LoopIntervalMax": "-1",
      "Extensions_LoopIntervalMedian": "-1",
      "trouterUrl": "https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "de",
      "Call.Type": "oneToOneCall",
      "Call.IsChatVersion2": "true",
      "Call.Id": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "Call.ParticipantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "Call.WasPoppedOut": "true",
      "AppInfo.UserRole": "Member",
      "AppInfo.UserType": "Aad",
      "DeviceInfo.Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-04-prod-aks.broker.skype.com/api/v1/subscribe/1105cbe6-c6a5-4fe0-bf14-0f66bb4718a5/0?i=10-128-175-157`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-04-prod-aks.broker.skype.com/api/v1/subscribe/1105cbe6-c6a5-4fe0-bf14-0f66bb4718a5/0?i=10-128-175-157",
    "expirationTimeInSec": 30
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
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-frce-04-prod-aks.broker.skype.com/api/v1/subscribe/1105cbe6-c6a5-4fe0-bf14-0f66bb4718a5/0?i=10-128-175-157`
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:09.610Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 62,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "create_one_to_one_call",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "create_one_to_one_call",
        "SpanId": "1567f201b4ea7bc7",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "create_one_to_one_call",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"initiate_call\",\"delta\":1,\"elapsed\":93383,\"sequence\":1,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_conversation_fetched_startCall\",\"delta\":16,\"elapsed\":93398,\"sequence\":2,\"stepDelta\":15},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"preparing_call\",\"delta\":31,\"elapsed\":93413,\"sequence\":3,\"stepDelta\":15},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"verifying_call_state\",\"delta\":33,\"elapsed\":93415,\"sequence\":4,\"stepDelta\":2},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_conversation_fetched_prepareCall\",\"delta\":46,\"elapsed\":93428,\"sequence\":5,\"stepDelta\":13},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"creating_call\",\"delta\":48,\"elapsed\":93430,\"sequence\":6,\"stepDelta\":2},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"create_call\",\"delta\":141,\"elapsed\":93523,\"sequence\":7,\"stepDelta\":93},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_created\",\"delta\":144,\"elapsed\":93526,\"sequence\":8,\"stepDelta\":3},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"scenario_set_on_call\",\"delta\":165,\"elapsed\":93547,\"sequence\":9,\"stepDelta\":21},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"validate_mri\",\"delta\":167,\"elapsed\":93549,\"sequence\":10,\"stepDelta\":2},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"connecting\",\"delta\":303,\"elapsed\":93685,\"sequence\":11,\"stepDelta\":136},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"connected\",\"delta\":17819,\"elapsed\":111201,\"sequence\":12,\"stepDelta\":17516},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":17821,\"elapsed\":111203,\"sequence\":13,\"stepDelta\":2,\"previousStep\":\"connected\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false,\"createCallWithGroupId_CallObjectExists\":true,\"createCallWithGroupId_threadId\":null,\"createCallWithGroupId_NewCallId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"createCallWithGroupId_NewParticipantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"createCallWithGroupId_conversationId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false,\"callerMriPresence\":true,\"calleeMriPresence\":true},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false,\"isCrossCloudCall\":false,\"callParticipantUserRole\":\"default\",\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPreheatAttempted\":false,\"wasPreheatCompleted\":false,\"joinMediaSettings\":\"{\\\"withIncomingAudio\\\":true,\\\"withOutgoingAudio\\\":true,\\\"withOutgoingVideo\\\":false,\\\"withIncomingVideo\\\":true}\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"isScreenshareFromChat\":false,\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false,\"isCrossCloudCall\":false,\"callParticipantUserRole\":\"default\",\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPreheatAttempted\":false,\"wasPreheatCompleted\":false,\"renderStatus\":\"success\",\"renderStatusMessage\":\"calling Intent id = e13b01ea-485e-42e0-ac70-7838f0912774\",\"callType\":\"oneToOneCall\",\"causeId\":\"calling_update_token:254e8e21\",\"isVideoOn\":false},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"context\":\"CallHistory\",\"data\":\"{\\\"invokedWithDblClick\\\":false}\",\"call_dataBag\":\"{\\\"isFirstJoin\\\":false}\",\"clientId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"initContextId\":\"b0babd48-57c4-4b43-9412-6a38bbdf82a6\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"unifiedFlow\":true,\"participantId\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"constraints\":\"{\\\"video\\\":true,\\\"audio\\\":true}\",\"permissions\":\"{\\\"audio\\\":true,\\\"video\\\":true}\",\"acceptCallInCallMonitor\":false,\"fromMultiWindow\":\"true\",\"backgroundEffect\":\"Off\",\"inSurvivabilityMode\":false,\"isCrossCloudCall\":false,\"callParticipantUserRole\":\"default\",\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPreheatAttempted\":false,\"wasPreheatCompleted\":false,\"renderStatus\":\"success\",\"renderStatusMessage\":\"calling Intent id = e13b01ea-485e-42e0-ac70-7838f0912774\",\"callType\":\"oneToOneCall\",\"causeId\":\"calling_update_token:254e8e21\",\"totalNumberOfOngoingJoinAttempts\":1}]"
      },
      "InstanceId": "613a127f-9115-4a9d-a10c-08aa25c7e6ba",
      "delta": "17821",
      "elapsed": "111203",
      "sequence": "13",
      "stepDelta": "2",
      "previousStep": "connected",
      "commandSource": "ExternalCommand",
      "context": "CallHistory",
      "data": "{\"invokedWithDblClick\":false}",
      "call_dataBag": "{\"isFirstJoin\":false}",
      "clientId": "e13b01ea-485e-42e0-ac70-7838f0912774",
      "initContextId": "b0babd48-57c4-4b43-9412-6a38bbdf82a6",
      "correlationId": "0964c57b-3e74-4fca-a01a-55b125e26b93",
      "trouterState": "Connected",
      "trouterClientState": "Connected",
      "callId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "threadId": "19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces",
      "unifiedFlow": "true",
      "participantId": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
      "constraints": "{\"video\":true,\"audio\":true}",
      "permissions": "{\"audio\":true,\"video\":true}",
      "acceptCallInCallMonitor": "false",
      "fromMultiWindow": "true",
      "backgroundEffect": "Off",
      "inSurvivabilityMode": "false",
      "isCrossCloudCall": "false",
      "callParticipantUserRole": "default",
      "endpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "wasPreheatAttempted": "false",
      "wasPreheatCompleted": "false",
      "renderStatus": "success",
      "renderStatusMessage": "calling Intent id = e13b01ea-485e-42e0-ac70-7838f0912774",
      "callType": "oneToOneCall",
      "causeId": "calling_update_token:254e8e21",
      "totalNumberOfOngoingJoinAttempts": "1",
      "isInEst": "false",
      "uses_slimcore": "false",
      "nodeId": "3f5d5373-9f55-5f53-d377-d753d3bd971f",
      "isSlimCoreRunningOutproc": "true",
      "isSlimCoreDirectConnectionActive": "true",
      "tsTrouterVersion": "2025.40.01.1",
      "tsCallingVersion": "2025.40.01.4",
      "ndiWasCaptured": "false",
      "ndiEnabled": "false",
      "isolatedAudioEnabled": "true",
      "scdEnabled": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "ReactWebClient"
      },
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:10.170Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 63,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "should_allow_transcript",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "should_allow_transcript",
        "SpanId": "358a9fdc630bd5eb",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Scenario": {
        "Status": "failure",
        "Mode": "3",
        "Name": "should_allow_transcript",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"failure\",\"Scenario.Step\":\"stop\",\"delta\":4,\"elapsed\":114817,\"sequence\":1,\"stepDelta\":4,\"previousStep\":\"start\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"reason\":\"tenant mismatch\",\"transcriptData\":\"{\\\"profileTenantId\\\":\\\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\\\",\\\"conversationTenantId\\\":\\\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\\\"}\",\"transcriptError\":\"disable transcript due to tenant mismatch\"}]"
      },
      "InstanceId": "43a318e3-1dae-4cd1-a542-e788e6f9d434",
      "elapsedSinceCoreInit": "111989",
      "delta": "4",
      "elapsed": "114817",
      "sequence": "1",
      "stepDelta": "4",
      "previousStep": "start",
      "Window": {
        "ViewportContext": "primary",
        "Type": "ReactWebClient"
      },
      "mainEntityAction": "view",
      "mainEntityType": "calls",
      "contentSlotApp": "Calls",
      "endEntityAction": "view",
      "endEntityType": "speeddial",
      "Panel": {
        "WindowID": "main",
        "Context": "main"
      },
      "commandSource": "ExternalCommand",
      "reason": "tenant mismatch",
      "transcriptData": "{\"profileTenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\",\"conversationTenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\"}",
      "transcriptError": "disable transcript due to tenant mismatch",
      "isInEst": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "VeryActive",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:10.296Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 64,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "prepareCall",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "prepareCall",
        "SpanId": "316059aaec35a4d2",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "prepareCall",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"HandleOngoingCallStart\",\"delta\":2,\"elapsed\":93416,\"sequence\":1,\"stepDelta\":2},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"coordinate-start\",\"delta\":3,\"elapsed\":93417,\"sequence\":2,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"coordinate-callback-start\",\"delta\":3,\"elapsed\":93417,\"sequence\":3,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"coordinate-callback-success\",\"delta\":4,\"elapsed\":93418,\"sequence\":4,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"coordinate-succeeded\",\"delta\":5,\"elapsed\":93419,\"sequence\":5,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"NoActiveCallFound\",\"delta\":5,\"elapsed\":93419,\"sequence\":6,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"HandleOngoingCallNoActiveCalls\",\"delta\":6,\"elapsed\":93420,\"sequence\":7,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_conversation_fetched_prepareCall\",\"delta\":14,\"elapsed\":93428,\"sequence\":8,\"stepDelta\":8},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"callCreated\",\"delta\":112,\"elapsed\":93526,\"sequence\":9,\"stepDelta\":98},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"PostCallSetup\",\"delta\":113,\"elapsed\":93527,\"sequence\":10,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"InitCallGetConversation\",\"delta\":131,\"elapsed\":93545,\"sequence\":11,\"stepDelta\":18},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"InitCallDetails\",\"delta\":135,\"elapsed\":93549,\"sequence\":12,\"stepDelta\":4},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"InitCallInitialization\",\"delta\":168,\"elapsed\":93582,\"sequence\":13,\"stepDelta\":33},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"updatedCallStartOptions\",\"delta\":186,\"elapsed\":93600,\"sequence\":14,\"stepDelta\":18},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"InitCallStarted\",\"delta\":192,\"elapsed\":93606,\"sequence\":15,\"stepDelta\":6},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":18503,\"elapsed\":111917,\"sequence\":16,\"stepDelta\":18311,\"previousStep\":\"InitCallStarted\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"context\":\"is-call-active\",\"correlationId\":\"coordinate-c0211c18-54a3-43f3-8f0c-3fe31ceb49fc\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"originatingUser\":\"1c5958d5-e40a-4a35-a0e3-7eb65179096f\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":0,\"callType\":-1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"streamingData\":{},\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":0,\"callType\":-1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"streamingData\":{},\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":0,\"callType\":-1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"streamingData\":{},\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":0,\"callType\":-1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"streamingData\":{},\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\",\"ringOthers\":true},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":0,\"callType\":-1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"streamingData\":{},\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\",\"ringOthers\":true,\"conversationId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"clientId\":\"d993ab0b-6b77-4a2b-b194-8377191dd9cd\",\"message\":\"NumOfActiveCalls:0\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":0,\"callType\":-1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"streamingData\":{},\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\",\"ringOthers\":true}]"
      },
      "InstanceId": "00e377fc-0fa7-4468-b995-46737637a490",
      "delta": "18503",
      "elapsed": "111917",
      "sequence": "16",
      "stepDelta": "18311",
      "previousStep": "InitCallStarted",
      "commandSource": "ExternalCommand",
      "clientId": "d993ab0b-6b77-4a2b-b194-8377191dd9cd",
      "message": "NumOfActiveCalls:0",
      "id": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "callId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "callMode": "0",
      "callType": "-1",
      "intentType": "2",
      "teamsCallId": "1",
      "endpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "wasPoppedOut": "true",
      "isVideoOn": "false",
      "isMuted": "false",
      "threadId": "19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces",
      "stagingRoomEnabled": "false",
      "stagingRoomEventActive": "false",
      "stagingRoomEventEnded": "false",
      "trouterState": "Connected",
      "trouterClientState": "Connected",
      "trouterUrls": "https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/",
      "isManagedModeEnabled": "false",
      "selectedCameraId": "camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165",
      "selectedMicrophoneId": "microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797",
      "selectedSpeakerId": "speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203",
      "isCopilot": "false",
      "isTPManagement": "false",
      "isMultilingualMeeting": "false",
      "isOneToOnePstnCall": "false",
      "participantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "streamingData": "{}",
      "isMeetingAcrossTFLTFW": "false",
      "ringOthers": "true",
      "isInEst": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "VeryActive",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "ReactWebClient"
      },
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:10.362Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 65,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "media_connected",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "media_connected",
        "SpanId": "9a5e9213ce650c0d",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "media_connected",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":832,\"elapsed\":111977,\"sequence\":1,\"stepDelta\":832,\"previousStep\":\"start\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":1,\"callType\":1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"callParticipantUserRole\":\"default\",\"streamingData\":{},\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\",\"clientId\":\"1\",\"Call_Type\":\"oneToOneCall\",\"causeId\":\"calling_update_token:70bed808\"}]"
      },
      "InstanceId": "a78af157-2b67-4a87-b8e1-c3dff88a28a7",
      "delta": "832",
      "elapsed": "111977",
      "sequence": "1",
      "stepDelta": "832",
      "previousStep": "start",
      "commandSource": "ExternalCommand",
      "id": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "callId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "callMode": "1",
      "callType": "1",
      "intentType": "2",
      "teamsCallId": "1",
      "endpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "wasPoppedOut": "true",
      "isVideoOn": "false",
      "isMuted": "false",
      "threadId": "19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces",
      "stagingRoomEnabled": "false",
      "stagingRoomEventActive": "false",
      "stagingRoomEventEnded": "false",
      "trouterState": "Connected",
      "trouterClientState": "Connected",
      "trouterUrls": "https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/",
      "isManagedModeEnabled": "false",
      "selectedCameraId": "camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165",
      "selectedMicrophoneId": "microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797",
      "selectedSpeakerId": "speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203",
      "isCopilot": "false",
      "isTPManagement": "false",
      "isMultilingualMeeting": "false",
      "isOneToOnePstnCall": "false",
      "participantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "callParticipantUserRole": "default",
      "streamingData": "{}",
      "isMeetingAcrossTFLTFW": "false",
      "clientId": "1",
      "Call_Type": "oneToOneCall",
      "causeId": "calling_update_token:70bed808",
      "isInEst": "false",
      "uses_slimcore": "false",
      "nodeId": "9519b99d-bf9d-5d79-1b7f-5d7b19bfd7f7",
      "isSlimCoreRunningOutproc": "true",
      "isSlimCoreDirectConnectionActive": "true",
      "tsTrouterVersion": "2025.40.01.1",
      "tsCallingVersion": "2025.40.01.4",
      "ndiWasCaptured": "false",
      "ndiEnabled": "false",
      "isolatedAudioEnabled": "true",
      "scdEnabled": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "VeryActive",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "ReactWebClient"
      },
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:17.531Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 67,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "modern_stage_latency",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "modern_stage_latency",
        "SpanId": "a980227bc0ceea8f",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "modern_stage_latency",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"modern_stage_render_join\",\"delta\":1,\"elapsed\":114703,\"sequence\":1,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":7591,\"elapsed\":122293,\"sequence\":2,\"stepDelta\":7590,\"previousStep\":\"modern_stage_render_join\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\"},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"correlationId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"debouncePeriod\":1000,\"isInitialStageRender\":true,\"trigger\":\"modern_stage_render_join\",\"entityType\":\"calls\",\"selectedView\":\"MixedGridView\",\"callMode\":1}]"
      },
      "InstanceId": "f5525282-e23f-4c7f-8b5e-3339b0a01e90",
      "elapsedSinceCoreInit": "119465",
      "delta": "7591",
      "elapsed": "122293",
      "sequence": "2",
      "stepDelta": "7590",
      "previousStep": "modern_stage_render_join",
      "Window": {
        "ViewportContext": "primary",
        "Type": "ReactWebClient"
      },
      "mainEntityAction": "view",
      "mainEntityType": "calls",
      "contentSlotApp": "Calls",
      "endEntityAction": "view",
      "endEntityType": "speeddial",
      "Panel": {
        "WindowID": "main",
        "Context": "main"
      },
      "commandSource": "ExternalCommand",
      "callId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "correlationId": "e13b01ea-485e-42e0-ac70-7838f0912774",
      "participantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "debouncePeriod": "1000",
      "isInitialStageRender": "true",
      "trigger": "modern_stage_render_join",
      "entityType": "calls",
      "selectedView": "MixedGridView",
      "callMode": "1",
      "isInEst": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 50,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "VeryActive",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:17.531Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 68,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "mejco",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "mejco",
        "SpanId": "22b349526fbd3263",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "mejco",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_connecting\",\"delta\":396,\"elapsed\":96847,\"sequence\":1,\"stepDelta\":396},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"pause\",\"delta\":397,\"elapsed\":114762,\"sequence\":2,\"stepDelta\":17915},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_connected\",\"delta\":397,\"elapsed\":114762,\"sequence\":3,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"modern_stage_rendering_finished\",\"delta\":7928,\"elapsed\":122293,\"sequence\":4,\"stepDelta\":7531},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":7930,\"elapsed\":122295,\"sequence\":5,\"stepDelta\":2,\"previousStep\":\"modern_stage_rendering_finished\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"\",\"intentId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"conversationId\":\"\",\"joinCallType\":\"OneToOneCall\",\"correlationId\":\"\",\"debouncePeriod\":0},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"intentId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"conversationId\":\"\",\"joinCallType\":\"OneToOneCall\",\"correlationId\":\"\",\"debouncePeriod\":0,\"rosterSize\":2,\"eventId\":null,\"templateId\":null,\"nativeMeetingStageEnabled\":false,\"isPreRenderingEnabled\":false,\"isMeetingAcrossTFLTFW\":false,\"isImmersiveEvent\":false,\"isDHHSigner\":false,\"isSignerInterpreter\":false,\"selectedView\":\"MixedGridView\"},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"intentId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"conversationId\":\"\",\"joinCallType\":\"OneToOneCall\",\"correlationId\":\"\",\"debouncePeriod\":0,\"rosterSize\":2,\"eventId\":null,\"templateId\":null,\"nativeMeetingStageEnabled\":false,\"isPreRenderingEnabled\":false,\"isMeetingAcrossTFLTFW\":false,\"isImmersiveEvent\":false,\"isDHHSigner\":false,\"isSignerInterpreter\":false,\"selectedView\":\"MixedGridView\"},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"intentId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"conversationId\":\"\",\"joinCallType\":\"OneToOneCall\",\"correlationId\":\"\",\"debouncePeriod\":0,\"rosterSize\":0,\"eventId\":null,\"templateId\":null,\"nativeMeetingStageEnabled\":false,\"isPreRenderingEnabled\":false,\"isMeetingAcrossTFLTFW\":false,\"isImmersiveEvent\":false,\"isDHHSigner\":false,\"isSignerInterpreter\":false,\"selectedView\":\"MixedGridView\"},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"intentId\":\"e13b01ea-485e-42e0-ac70-7838f0912774\",\"conversationId\":\"\",\"joinCallType\":\"OneToOneCall\",\"correlationId\":\"\",\"debouncePeriod\":0,\"rosterSize\":0,\"eventId\":null,\"templateId\":null,\"nativeMeetingStageEnabled\":false,\"isPreRenderingEnabled\":false,\"isMeetingAcrossTFLTFW\":false,\"isImmersiveEvent\":false,\"isDHHSigner\":false,\"isSignerInterpreter\":false,\"selectedView\":\"MixedGridView\",\"reason\":\"scenario modern_stage_latency stopped with state success\"}]"
      },
      "InstanceId": "4c5e60c8-e17b-490b-9395-dbd68ae321f1",
      "elapsedSinceCoreInit": "119467",
      "delta": "7930",
      "elapsed": "122295",
      "sequence": "5",
      "stepDelta": "2",
      "previousStep": "modern_stage_rendering_finished",
      "Window": {
        "ViewportContext": "primary",
        "Type": "ReactWebClient"
      },
      "mainEntityAction": "view",
      "mainEntityType": "calls",
      "contentSlotApp": "Calls",
      "endEntityAction": "view",
      "endEntityType": "speeddial",
      "Panel": {
        "WindowID": "main",
        "Context": "main"
      },
      "commandSource": "ExternalCommand",
      "callId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "intentId": "e13b01ea-485e-42e0-ac70-7838f0912774",
      "joinCallType": "OneToOneCall",
      "debouncePeriod": "0",
      "rosterSize": "0",
      "nativeMeetingStageEnabled": "false",
      "isPreRenderingEnabled": "false",
      "isMeetingAcrossTFLTFW": "false",
      "isImmersiveEvent": "false",
      "isDHHSigner": "false",
      "isSignerInterpreter": "false",
      "selectedView": "MixedGridView",
      "reason": "scenario modern_stage_latency stopped with state success",
      "isInEst": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "VeryActive",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-07T19:35:11.173Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 66,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      }
    },
    "data": {
      "baseType": "custom",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "conCore",
      "EventInfo": {
        "BaseType": "custom",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Ring": "general",
      "Region": "de",
      "Partition": "de01",
      "ClientType": "enterprise",
      "ParticipantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "EndpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "CorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "SignalingSessionId": "9b54a1be-5882-4f94-93bc-815b423c2ae7",
      "ClientInformation": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
      "NetworkRequestBag": "{\"eventStart\":1762544091815,\"events\":{\"name\":\"PUT-UpdateEndpointMetadata\",\"url\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-swce-03-prod-aks.conv.skype.com/conv/H3LnpEolG0-jH5gJz0aQ-Q/updateEndpointMetadata?i=10-128-44-168&e=638979768034953351\",\"eventStart\":17986,\"trouterReady\":30,\"requestReady\":417,\"status\":200,\"attempts\":[{\"status\":200,\"start\":512,\"end\":1372,\"online\":1}],\"rtt\":1372,\"uid\":\"8b0b5bbd-b273-46ab-b9c8-879c30ab8fce\",\"causeId\":\"70bed808\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[200,1000,5000],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":15000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"enabled\"]},\"enableRequestHedging\":true,\"tokenTelemetries\":[{\"requestCauseId\":\"70bed808\",\"responseCauseId\":\"70bed808\",\"supportTokenApi\":true,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"PUT\\\",\\\"path\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-swce-03-prod-aks.conv.skype.com/conv/H3LnpEolG0-jH5gJz0aQ-Q/updateEndpointMetadata?i=10-128-44-168&e=638979768034953351\\\"}\",\"tokenRequestTime\":1762544110110,\"tokenResponseTime\":1762544110204,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":94}]}}",
      "EcsEtag": "\"8KfQrXUitMM2XYCywLwTaMyh1R0UpOstIV7uPRvWxXM=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25101616511",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "VeryActive",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "ReactWebClient"
      },
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  ```
  ```json
  {
    "acc": 7
  }
  ```
- PUT `https://teams.microsoft.com/ups/emea/v1/me/endpoints/`
  ```json
  {
    "availability": "Available",
    "activity": "Available",
    "id": "b40278a3-2bec-45ac-9f15-e4c6806bed8b",
    "activityReporting": "Transport",
    "deviceType": "Web"
  }
  ```
- POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-swce-03-prod-aks.conv.skype.com/conv/H3LnpEolG0-jH5gJz0aQ-Q/leave?i=10-128-44-168&e=638979768034953351`
  ```json
  {
    "participants": {
      "from": {
        "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "displayName": "Neil Rashbrook",
        "endpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
        "participantId": "44c27356-e699-4ade-b85e-257918a5fc42",
        "languageId": "en-US"
      }
    },
    "conversationTransactionEnd": {
      "reason": "noError",
      "code": 0,
      "phrase": "ConversationEndNoModalityConnected"
    },
    "callTransactionEnd": {
      "code": 0,
      "subCode": 0,
      "phrase": "CallEndReasonLocalUserInitiated",
      "resultCategories": [
        "Success"
      ]
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
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/998566-b511dbe45fc1d76e.js`
  ```json
"\"use strict\";(this.webpackChunk_msteams_react_web_client=this.webpackChunk_msteams_react_web_client||[]).push([[998566],{998566:(n,a,e)=>{e.d(a,{X:()=>C});var s=e(513432),l=e.n(s),t=e(279372),C=(0,t.Ke)({svg:function(_){var c=_.classes;return s.createElement(\"svg\",{role:\"presentation\",focusable:\"false\",viewBox:\"2 2 16 16\",className:c.svg},s.createElement(\"path\",{d:\"M10 2C11.6569 2 13 3.34315 13 5V6H14C15.1046 6 16 6.89543 16 8V15C16 16.1046 15.1046 17 14 17H6C4.89543 17 4 16.1046 4 15V8C4 6.89543 4.89543 6 6 6H7V5C7 3.34315 8.34315 2 10 2ZM14 7H6C5.44772 7 5 7.44772 5 8V15C5 15.5523 5.44772 16 6 16H14C14.5523 16 15 15.5523 15 15V8C15 7.44772 14.5523 7 14 7ZM10 10.5C10.5523 10.5 11 10.9477 11 11.5C11 12.0523 10.5523 12.5 10 12.5C9.44772 12.5 9 12.0523 9 11.5C9 10.9477 9.44772 10.5 10 10.5ZM10 3C8.89543 3 8 3.89543 8 5V6H12V5C12 3.89543 11.1046 3 10 3Z\"}))},displayName:\"LockIcon\"})}}]);\n"
  ```
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/855333-6d1ff923217dff91.js`
  ```json
"\"use strict\";(this.webpackChunk_msteams_react_web_client=this.webpackChunk_msteams_react_web_client||[]).push([[855333],{855333:(r,l,s)=>{s.d(l,{G:()=>E});var e=s(513432),v=s.n(e),t=s(551422),_=s.n(t),c=s(279372),n=s(24842),E=(0,c.Ke)({svg:function(m){var a=m.classes;return e.createElement(\"svg\",{role:\"presentation\",focusable:\"false\",viewBox:\"8 8 16 16\",className:a.svg},e.createElement(\"g\",null,e.createElement(\"path\",{d:\"M16,8c-4.418,0-8,3.582-8,8s3.582,8,8,8s8-3.582,8-8S20.418,8,16,8z M16,22.85c-3.783,0-6.85-3.067-6.85-6.85S12.217,9.15,16,9.15s6.85,3.067,6.85,6.85S19.783,22.85,16,22.85z\"}),e.createElement(\"circle\",{className:_()(n.Q.filled,a.filledPart),cx:\"16\",cy:\"16\",r:\"8\"})))},displayName:\"CircleIcon\"})}}]);\n"
  ```
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/r_data-resolvers-search-a24acd23308f7bea.js`
  ```json
"\"use strict\";(this.webpackChunk_msteams_react_web_client=this.webpackChunk_msteams_react_web_client||[]).push([[151561],{917014:(t,_,s)=>{s.r(_),s.d(_,{typeDefs:()=>e,resolvers:()=>a.resolvers});var e=s(888971),m=s.n(e),a=s(36033)}}]);\n"
  ```
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/r_data-resolvers-search-a24acd23308f7bea.js`
  ```json
"\"use strict\";(this.webpackChunk_msteams_react_web_client=this.webpackChunk_msteams_react_web_client||[]).push([[151561],{917014:(t,_,s)=>{s.r(_),s.d(_,{typeDefs:()=>e,resolvers:()=>a.resolvers});var e=s(888971),m=s.n(e),a=s(36033)}}]);\n"
  ```
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&ext.intweb.msfpc=GUID%3Dfbce5a52cc8f449f8a49e147bd2d3f25%26HASH%3Dfbce%26LV%3D202510%26V%3D4%26LU%3D1761758803913&w=0&content-encoding=gzip`
  ```json
  {
    "name": "skypecosi_concore_web_pluginless_call_session",
    "time": "2025-11-07T19:35:49.754Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 3,
        "installId": "f15d7e43-3184-4cb8-ba62-711c520340e0",
        "epoch": "436055299"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "8SQtpBEWvd3h+0s/esVwFk"
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
      "ui_version": "1415/25101616511",
      "agent_environment_id": "d1448933-349c-4b3f-bf44-eb1a64a58e3f",
      "CorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "participant_id": "44c27356-e699-4ade-b85e-257918a5fc42",
      "endpoint_id": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "media_leg_id": "A459AEF95DFD4DF3B67F6A16B288DD8B",
      "ts_calling_version": "2025.40.01.4",
      "LocalUser": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "ResultCode": "1",
      "EventTimestampBag": "{\"eventStart\":1762544091988,\"events\":[{\"CallStateChanged\":3,\"data\":\"Connecting\"},{\"CallStateChanged\":17519,\"data\":\"Connected\"},{\"CallStateChanged\":57206,\"data\":\"Disconnecting\"},{\"CallStateChanged\":57675,\"data\":\"Disconnected\"}]}",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
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
  {
    "name": "skypecosi_concore_web_pluginless_modality_session",
    "time": "2025-11-07T19:35:49.757Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 4,
        "installId": "f15d7e43-3184-4cb8-ba62-711c520340e0",
        "epoch": "436055299"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "8SQtpBEWvd3h+0s/esVwFk"
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
      "ui_version": "1415/25101616511",
      "agent_environment_id": "d1448933-349c-4b3f-bf44-eb1a64a58e3f",
      "CorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "participant_id": "44c27356-e699-4ade-b85e-257918a5fc42",
      "endpoint_id": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "media_leg_id": "A459AEF95DFD4DF3B67F6A16B288DD8B",
      "ts_calling_version": "2025.40.01.4",
      "LocalUser": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "ResultCode": "0",
      "EventTimestampBag": "{\"eventStart\":1762544092004,\"events\":[{\"StartModality\":0},{\"StreamStateChanged\":18331,\"data\":{\"state\":\"StreamActive\",\"direction\":\"Receive\"}}]}",
      "MediaType": "Audio",
      "Role": "Bidirectional",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
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
  {
    "name": "skypecosi_concore_web_ts_calling_in_call_session",
    "time": "2025-11-07T19:35:49.805Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 6,
        "installId": "f15d7e43-3184-4cb8-ba62-711c520340e0",
        "epoch": "436055299"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "8SQtpBEWvd3h+0s/esVwFk"
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
      "ui_version": "1415/25101616511",
      "CorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "PreviousCorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "EndpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "ParticipantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "CallType": "1",
      "Direction": "Outgoing",
      "Origin": "0",
      "SelfParticipantRole": "caller",
      "Ring": "general",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "Region": "de",
      "Partition": "de01",
      "IsHuddleGroupCall": "True",
      "IsEmergency": "False",
      "TsCallingVersion": "2025.40.01.4",
      "TerminationState": "7",
      "TerminationReason": "1",
      "EventTimestampBag": "{\"eventStart\":1762544091815,\"events\":[{\"UpdateEndpointMetadata\":{\"start\":17985,\"duration\":1374,\"status\":\"Success\",\"causeId\":\"70bed808\"}},{\"AudioStateChanged\":{\"start\":18520,\"causeId\":\"495262d2\",\"data\":[{\"state\":{\"content\":\"audio\",\"direction\":\"receive\",\"stream\":\"active\"}}]}},{\"_UpdateLocalParticipantStream\":{\"start\":18582,\"causeId\":\"85a68b43\"}},{\"_UpdateLocalParticipantStream\":{\"start\":19343,\"causeId\":\"7b42df8c\"}},{\"StopCall\":{\"start\":57379,\"status\":\"Pending\",\"causeId\":\"b73adef6\"}},{\"_SetCallState\":{\"start\":57379,\"causeId\":\"b73adef6\",\"data\":[{\"state\":6,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":57393,\"causeId\":\"b73adef6\",\"data\":[{\"state\":6,\"reason\":0}]}},{\"_MediaCleanUp\":{\"start\":57393,\"duration\":275,\"status\":\"Success\",\"causeId\":\"b73adef6\"}},{\"_SignalingStateChanged\":{\"start\":57847,\"causeId\":\"b73adef6\",\"data\":[{\"status\":\"LocalTerminated\",\"reason\":{\"code\":0,\"subCode\":0,\"phrase\":\"CallEndReasonLocalUserInitiated\",\"resultCategories\":[\"Success\"]}}]}},{\"_SetCallState\":{\"start\":57848,\"causeId\":\"b73adef6\",\"data\":[{\"state\":7,\"reason\":1}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":57898,\"causeId\":\"b73adef6\",\"data\":[{\"state\":7,\"reason\":1}]}},{\"_MediaCleanUp\":{\"start\":57937,\"duration\":0,\"status\":\"Success\"}}]}",
      "HostName": "teams.microsoft.com",
      "ComplianceRecordingContentLength": "0",
      "ConversationStartTime": "2025-11-07T19:34:56.4571284Z",
      "ClientType": "enterprise",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
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
  {
    "name": "mdsc_webrtc_session",
    "time": "2025-11-07T19:35:49.792Z",
    "ver": "4.0",
    "iKey": "o:1cae5691997646c98b01d15beddae7a3",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 5,
        "installId": "f15d7e43-3184-4cb8-ba62-711c520340e0",
        "epoch": "436055299"
      },
      "app": {
        "locale": "en-gb",
        "sesId": "8SQtpBEWvd3h+0s/esVwFk"
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
          "Extensions_ReflexiveLocalIP": {
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
      "uiVersion": "1415/25101616511",
      "agent_environment_id": "d1448933-349c-4b3f-bf44-eb1a64a58e3f",
      "CorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "participant_id": "44c27356-e699-4ade-b85e-257918a5fc42",
      "endpoint_id": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "media_leg_id": "A459AEF95DFD4DF3B67F6A16B288DD8B",
      "ts_calling_version": "2025.40.01.4",
      "metrics_MediaLegId": "A459AEF95DFD4DF3B67F6A16B288DD8B",
      "metrics_CreationTime": "17625440920120000",
      "metrics_CallNumber": "1",
      "metrics_SessionId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "metrics_MultiParty": "false",
      "metrics_ErrorType": "none",
      "metrics_IncompatibleOffer": "false",
      "metrics_TerminationTime": "17625441492170000",
      "metrics_TerminationReason_code": "0",
      "metrics_TerminationReason_subCode": "0",
      "metrics_TerminationReason_phrase": "CallEndReasonLocalUserInitiated",
      "metrics_CallDuration": "572040000",
      "metrics_IceInitTime": "17625441098320000",
      "metrics_IceConnectedStateTime": "17625441103570000",
      "metrics_NegotiationCount": "1",
      "metrics_RejectedNegotiationCount": "0",
      "metrics_InitialNegotiationCompleted": "true",
      "metrics_InitialNegotiationType": "Offering",
      "metrics_FinalAnswerTime": "17625441102710000",
      "metrics_TransportReconnectedCount": "0",
      "metrics_Relay": "{\"address\":\"euaz.relay.teams.microsoft.com\",\"expires\":604800,\"realm\":\"\\\"rtcmedia\\\"\",\"credentials\":true,\"ports\":\"udp:3478,tcp:443,tls:443\",\"fqdns\":\"euaz.relay.teams.microsoft.com\"}",
      "metrics_ActiveModalities": "{\"audio\":\"sendrecv\",\"video\":\"inactive\",\"data\":\"sendrecv\"}",
      "metrics_AllowedAudioSend": "true",
      "metrics_AllowedVideoSend": "true",
      "metrics_AllowedScreensharingSend": "true",
      "metrics_RelayManager": "{\"config\":{\"Service\":{\"url\":\"https://teams.microsoft.com/trap\",\"tokenUrl\":\"https://teams.microsoft.com/trap/tokens\",\"disabled\":false,\"supportedTokenTypes\":\"skype AAD CAE\"},\"Relay\":{\"Turn\":{\"realm\":\"rtcmedia\",\"addresses\":[\"euaz.relay.teams.microsoft.com\"],\"fqdns\":[\"euaz.relay.teams.microsoft.com\"],\"tcpPort\":443,\"tlsPort\":443,\"udpPort\":3478,\"url\":\"\"},\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478,\"Lync\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478},\"Skype\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478}},\"Token\":{\"earlyRefreshMinutes\":9720,\"earlyRefreshPercentage\":4}},\"stats\":{\"configFetch\":{\"time\":1762544018353,\"duration\":544,\"version\":2},\"skypeTokenFetch\":{\"time\":1762544018897,\"duration\":264,\"version\":2}}}",
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
      "metrics_Connection_Downlink": "10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10",
      "metrics_Connection_EffectiveType": "4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g",
      "metrics_Connection_Rtt": "100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100",
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
      "metrics_ETag": "\"8KfQrXUitMM2XYCywLwTaMyh1R0UpOstIV7uPRvWxXM=\"",
      "metrics_ConfigIds": "P-E-1718359-2-4,P-E-1717750-C1-6,P-E-1717237-2-6,P-E-1716081-C1-6,P-E-1713802-2-6,P-E-1713707-C1-6,P-E-1713684-C1-6,P-E-1704515-2-6,P-E-1700450-2-7,P-E-1694641-2-6,P-E-1691036-2-6,P-E-1680105-2-6,P-E-1676936-C1-6,P-E-1675286-2-6,P-E-1670133-2-6,P-E-1660458-C1-5,P-E-1658080-C1-11,P-E-1656524-2-6,P-E-1655667-2-6,P-E-1653089-3-8,P-E-1651332-2-6,P-E-1643648-2-6,P-E-1641797-C1-6,P-E-1633843-2-6,P-E-1621471-2-6,P-E-1618933-2-6,P-E-1617149-2-6,P-E-1616887-2-6,P-E-1616819-2-6,P-E-1613942-2-6,P-E-1608951-C1-3,P-E-1608371-2-6,P-E-1604926-C1-5,P-E-1598909-C1-6,P-E-1575172-2-5,P-E-1574158-2-10,P-E-1570390-2-6,P-E-1566952-C1-6,P-E-1568381-C1-6,P-E-1566716-C1-10,P-E-1565836-2-6,P-E-1565831-2-6,P-E-1544576-2-3,P-R-1665746-12-10,P-R-1645583-12-13,P-R-1634465-12-13,P-R-1633491-12-13,P-R-1632047-12-13,P-R-1630681-12-10,P-R-1611700-12-14,P-R-1606855-12-14,P-R-1598296-12-12,P-R-1587774-12-12,P-R-1584387-12-13,P-R-1580901-12-15,P-R-1577920-12-13,P-R-1577892-18-3,P-R-1575005-C11-10,P-R-1563326-12-14,P-R-1558616-12-17,P-R-1553816-12-12,P-R-1551350-12-15,P-R-1543947-12-13,P-R-1523352-12-14,P-R-1534344-12-13,P-R-1521918-12-9,P-R-1475504-12-14,P-R-1477139-12-19,P-R-1472589-12-28,P-R-1470220-12-11,P-R-1282626-12-35,P-R-1458723-12-13,P-R-1457926-12-2,P-R-1446888-12-17,P-R-1442911-12-17,P-R-1442161-12-17,P-R-1438633-12-12,P-R-1417298-12-18,P-R-1416330-12-20,P-R-1102981-9-69,P-R-1270215-12-8,P-R-1264668-12-16,P-R-1262976-12-11,P-R-1223031-9-9,P-R-1244045-18-14,P-R-1175069-9-8,P-R-1226424-9-4,P-R-1224690-9-9,P-R-1168166-9-10,P-R-1160589-9-7,P-R-1156430-9-6,P-R-1154814-3-6,P-R-1150013-9-11,P-R-1148658-9-8,P-R-1141462-9-23,P-R-1136249-9-9,P-R-1133113-9-8,P-R-1130598-9-10,P-R-1128207-9-28,P-R-1117564-9-10,P-R-1111900-9-79,P-R-1111902-9-11,P-R-1101306-9-6,P-R-1096762-9-24,P-R-1082715-9-35,P-R-1082433-9-23,P-R-1082359-9-14,P-R-1082351-9-12,P-R-1080906-6-6,P-R-1070816-6-19,P-R-1070395-1-8,P-R-1036090-19-62,P-R-1016745-11-11,P-R-1006078-1-32,P-R-115866-10-27,P-R-107136-10-42,P-R-96498-10-27,P-R-95572-41-185,P-R-94120-1-6,P-R-88231-9-17,P-R-79878-11-70,P-R-71785-7-16,P-R-63313-1-4,P-D-38372-1-4,P-D-27831-1-40,pe17183592:1034641,pe1717750c1:1034986,pe17172372:1034484,pe1716081c1:1033550,pe17138022:1031142,pe1713707c1:1031006,pe1713684c1:1030981,pe17045152:1023158,pe17004502:1027959,pe16946412:1018058,pe16910362:1013539,pe16801052:1010383,pe1676936c1:1006853,pe16752862:1005633,pe16701332:1002053,pe1660458c1:304475,pe1658080c1:1010368,pe16565242:301668,pe16556672:300926,pe16530893:301201,pe16513322:296134,pe16436482:288428,pe1641797c1:286186,pe16338432:277836,pe16214712:266864,pe16189332:264581,pe16171492:262972,pe16168872:262654,pe16168192:262662,pe16139422:260005,pe16083712:254400,pe1604926c1:250956,pe1598909c1:245917,pe15751722:222344,pe15741582:224394,pe15703902:219213,pe1568381c1:218197,pe1566716c1:228730,pe15658362:216043,pe15658312:216047",
      "metrics_GPUName": "ANGLE (Intel, Intel(R) HD Graphics Direct3D9Ex vs_3_0 ps_3_0, igdumd64.dll)",
      "metrics_PermissionStates": "{\"microphone\":\"granted\",\"camera\":\"granted\"}",
      "metrics_DeviceList": "[{\"label\":\"046d:0825 Cam\",\"kind\":\"microphone\"},{\"label\":\"046d:0825 Cam\",\"kind\":\"camera\"},{\"label\":\"High Definition\",\"kind\":\"speaker\"}]",
      "metrics_DeviceListDebug": "{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}",
      "metrics_DevicesChangeCount": "0",
      "metrics_DevicesPollChangeCount": "0",
      "metrics_DeviceSelectionChangeCount": "0",
      "metrics_DeviceSelectionChangeFromInterfaceCount": "0",
      "metrics_DevicesCount": "{\"microphone\":1,\"camera\":1,\"speaker\":1,\"compositeAudio\":0,\"audioIngestDevice\":0,\"virtualDevice\":0}",
      "metrics_DeviceEnumerationTimings": "{\"max\":629,\"min\":7,\"avg\":64}",
      "metrics_UsedMicrophone": "046d:0825 Cam",
      "metrics_UsedSpeaker": "High Definition",
      "metrics_UsedCamera": "046d:0825 Cam",
      "metrics_DeviceEvents": "[{\"eventType\":\"permissions_state_changed\",\"timestamp\":-74134,\"payload\":{\"microphone\":\"granted\",\"camera\":\"unknown\"}},{\"eventType\":\"selected_devices_changed\",\"timestamp\":-74131,\"payload\":{\"microphone\":\"046d:0825 Cam\",\"camera\":\"046d:0825 Cam\",\"speaker\":\"High Definition\",\"fromInterface\":false}},{\"eventType\":\"devices_changed\",\"timestamp\":-74130,\"payload\":{\"devices\":[{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{\"autoGainControl\":[true,false],\"channelCount\":{\"max\":1,\"min\":1},\"echoCancellation\":[true,false,\"remote-only\"],\"latency\":{\"max\":0.01,\"min\":0},\"noiseSuppression\":[true,false],\"sampleRate\":{\"max\":48000,\"min\":48000},\"sampleSize\":{\"max\":16,\"min\":16},\"voiceIsolation\":[true,false]},\"groupId\":\"1\"},{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{\"aspectRatio\":{\"max\":1280,\"min\":0.0010416666666666667},\"facingMode\":[],\"frameRate\":{\"max\":30,\"min\":1},\"height\":{\"max\":960,\"min\":1},\"resizeMode\":[\"none\",\"crop-and-scale\"],\"width\":{\"max\":1280,\"min\":1}},\"groupId\":\"1\"},{\"label\":\"High Definition\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"2\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u1)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u2)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u3)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u1)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"permissions_state_changed\",\"timestamp\":-74109,\"payload\":{\"microphone\":\"granted\",\"camera\":\"granted\"}},{\"eventType\":\"stream_created\",\"timestamp\":-1868,\"payload\":{\"id\":0,\"mediaType\":\"Audio\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":2633,\"payload\":{\"id\":0,\"mediaType\":\"Audio\",\"timestamp\":3156,\"sampleRate\":16000}},{\"eventType\":\"ask_device_permission\",\"timestamp\":2641,\"payload\":{\"constraints\":{\"audio\":true,\"video\":false},\"resultConstraints\":{\"audio\":true,\"video\":false},\"reason\":\"stream_acquisition\"}},{\"eventType\":\"stream_disposed\",\"timestamp\":57230,\"payload\":{\"id\":0,\"mediaType\":\"Audio\"}}]",
      "metrics_AudioEffects": "[{\"timestamp\":11372,\"payload\":{\"audioEffectsCapability\":3,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":226,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep NS\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0.9990000128746033,\"5\":0},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"799;Avg,2.253942;0.500000,2.050000;0.700000,2.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,3.050000;0.990000,5.050000;Max,30.000000\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-57.585938,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-56.296875,\"nearEndOutputRMS_dBFS\":-113.671875},\"wasmCompilationTimeMs\":11,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.033,\"sampleRate\":16000,\"currentTime\":8.224,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":19463,\"payload\":{\"audioEffectsCapability\":3,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":226,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep NS\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0.9994999766349792,\"5\":0},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"1599;Avg,2.218199;0.500000,2.050000;0.700000,2.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,3.050000;0.990000,4.050000;Max,30.000000\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-57.09375,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-54.867188,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":11,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.032,\"sampleRate\":16000,\"currentTime\":16.32,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":27369,\"payload\":{\"audioEffectsCapability\":3,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":226,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep NS\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0.999666690826416,\"5\":0},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"2399;Avg,2.277574;0.500000,2.050000;0.700000,2.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,3.050000;0.990000,4.050000;Max,30.000000\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-54.726562,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-55.851562,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":11,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.033,\"sampleRate\":16000,\"currentTime\":24.224,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":35368,\"payload\":{\"audioEffectsCapability\":3,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":226,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep NS\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0.999750018119812,\"5\":0},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"3199;Avg,2.312879;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,4.050000;0.990000,4.050000;Max,30.000000\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-49.359375,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-55.898438,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":11,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.032,\"sampleRate\":16000,\"currentTime\":32.224,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":43369,\"payload\":{\"audioEffectsCapability\":3,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":226,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep NS\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0.9998000264167786,\"5\":0},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"3999;Avg,2.342311;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,4.050000;0.990000,4.050000;Max,30.000000\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-49.21875,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-54.210938,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":11,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.032,\"sampleRate\":16000,\"currentTime\":40.224,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":51368,\"payload\":{\"audioEffectsCapability\":3,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":226,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep NS\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0.999833345413208,\"5\":0},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"4799;Avg,2.380892;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,4.050000;0.990000,4.050000;Max,30.000000\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-49.125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-55.429688,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":11,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.032,\"sampleRate\":16000,\"currentTime\":48.224,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":57271,\"payload\":{\"audioEffectsCapability\":3,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":226,\"wasmInitDuration\":-1,\"error\":[],\"userNoiseSuppressionMethod\":null}}]",
      "metrics_WorkerEvents": "[{\"timestamp\":2394,\"workerType\":\"wasmvqe\",\"workerLoadTimeMs\":1062,\"msg\":\"\\\"wasm-worker-loaded\\\"\"}]",
      "metrics_MediaByPassEnabled": "false",
      "metrics_DominantSpeaker": "{\"activeStrategy\":\"client\",\"changedCountContributingSources\":0,\"changedCountDSH\":0}",
      "metrics_AudioSourceNumOfReopenRequests": "1",
      "metrics_AudioSourceNumOfSuccessfulReopens": "1",
      "metrics_AudioCaptureErrorCodeFlagsInit": "0",
      "metrics_AudioRenderErrorCodeFlagsInit": "0",
      "metrics_AudioSinkNumOfReopenRequests": "0",
      "metrics_AudioSinkNumOfSuccessfulReopens": "0",
      "metrics_MicUnmutedButSilent": "false",
      "metrics_MicUnmutedButSilentUnreliable": "false",
      "metrics_CallSetupTimeTracker": "{\"createOfferAsync\":[[{\"name\":\"queryRelaysAsync\",\"duration\":9.6,\"ts\":1762544092389,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"checkVideoCodecsSupport\",\"duration\":362.4,\"ts\":1762544092398.6,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"encStreamsManagerInitialize\",\"duration\":0.2,\"ts\":1762544092762.9,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"initAudioCodec\",\"duration\":0.4,\"ts\":1762544092762.9,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"assurePeerConnectionAsync\",\"duration\":374.6,\"ts\":1762544092388.8,\"parentName\":\"createOfferAsync\"},{\"name\":\"updateStreamsWithModalities\",\"duration\":1879.6,\"ts\":1762544092774.7,\"parentName\":\"createOfferAsync|updateStreams\"},{\"name\":\"updateSenders\",\"duration\":78.2,\"ts\":1762544094654.3,\"parentName\":\"createOfferAsync|updateStreams\"},{\"name\":\"assureStreamsAndDataChannel\",\"duration\":1969.8,\"ts\":1762544092763.4,\"parentName\":\"createOfferAsync\"},{\"name\":\"createOffer\",\"duration\":37,\"ts\":1762544094733.2,\"parentName\":\"createOfferAsync\"},{\"name\":\"sLD\",\"duration\":171.9,\"ts\":1762544094770.2,\"parentName\":\"createOfferAsync\"},{\"name\":\"candidates\",\"duration\":526.3,\"ts\":1762544094942.1,\"parentName\":\"createOfferAsync\"},{\"name\":\"createOfferAsync\",\"duration\":3111.2,\"ts\":1762544092388.8,\"parentName\":\"\"},{\"name\":\"transportConnected\",\"duration\":0.3,\"ts\":1762544110334.9,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"}]],\"processAnswerAsync\":[[{\"name\":\"streamSendersManagerUpdate\",\"duration\":207,\"ts\":1762544109624.2,\"parentName\":\"processAnswerAsync\"},{\"name\":\"setRemoteDescription\",\"duration\":435.2,\"ts\":1762544109832.8,\"parentName\":\"processAnswerAsync\"},{\"name\":\"streamSendersManagerActivate\",\"duration\":1.4,\"ts\":1762544110268,\"parentName\":\"processAnswerAsync\"},{\"name\":\"processAnswerAsync\",\"duration\":646.2,\"ts\":1762544109624.2,\"parentName\":\"\"}]]}",
      "metrics_BrowserFingerprint": "{\"webdriver\":false,\"pluginsLength\":5,\"languageLength\":1,\"mimeTypesLength\":2,\"outerWidth\":1024,\"outerHeight\":728,\"innerWidth\":1024,\"innerHeight\":641,\"clientWidth\":1024,\"clientHeight\":641,\"loadEventEnd\":5528.5,\"loadEventStart\":5528.5,\"hasChrome\":true,\"hasPlaywright\":false,\"hasSelenium\":false,\"hasNightmare\":false,\"hasPhantom\":false,\"hasCypress\":false}",
      "metrics_ReportGenerationTimeMs": "7",
      "metrics_piiFields": "{\"IPAddress\":\"IPv4\",\"ReflexiveLocalIP\":\"IPv4\",\"pair_googLocalAddress\":\"IPv4\",\"pair_googRemoteAddress\":\"IPv4\"}",
      "Extensions_WebRTCStats_data_bytesReceived": "0",
      "Extensions_WebRTCStats_data_bytesSent": "0",
      "Extensions_WebRTCStats_data_dataChannelIdentifier": "0",
      "Extensions_WebRTCStats_data_label": "main-channel",
      "Extensions_WebRTCStats_data_messagesReceived": "0",
      "Extensions_WebRTCStats_data_messagesSent": "0",
      "Extensions_WebRTCStats_data_state": "open",
      "Extensions_WebRTCStats_data_timestamp": "1762544149156.154",
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
      "Extensions_OfferedSrtp": "\"unknown\"",
      "Extensions_RelayCandidate": "{\"priority\":\"41886207\",\"time\":671}",
      "Extensions_SdpSemantics": "unified-plan",
      "Extensions_SignalingState": "stable",
      "Extensions_SignalingStatePrevious": "have-local-offer",
      "Extensions_MaxSessionBandwidth": "4000",
      "Extensions_Bandwidth_uplinkStabilizationTime": "{\"time\":0,\"bandwidth\":300000,\"finished\":true,\"modality\":\"audio\"}",
      "Extensions_Bandwidth_downlinkStabilizationTime": "{\"time\":39,\"bandwidth\":null,\"finished\":false,\"modality\":\"audio\"}",
      "Extensions_totalVideoControlMessages": "0",
      "Extensions_outOfOrderVideoControlMessages": "0",
      "Extensions_webcamFreezeIntervals": "0",
      "Extensions_processedStreamFreezeIntervals": "0",
      "Extensions_ReinvitelessContext": "{\"enabled\":false,\"maxStreamsForModality\":{\"video\":0,\"sharing\":0}}",
      "Extensions_IPAddress": "192.168.255.11",
      "Extensions_ReflexiveLocalIP": "82.19.9.88",
      "Extensions_NumberOfInterfaces": "1",
      "Extensions_StartTime": "1762544092013",
      "Extensions_EndTime": "1762544149217",
      "Extensions_AudioTransportRecvBitrate": "24748",
      "Extensions_AudioTransportSendBitrate": "1448",
      "Extensions_AudioPayloadRecvBitrate": "17738",
      "Extensions_AudioPayloadSendBitrate": "309",
      "Extensions_StartCallBWESendSide": "300000",
      "Extensions_EndCallBWESendSide": "2298858",
      "Extensions_BWEStdSendSide": "575759.55",
      "Extensions_BwPercentilesSendSide": "{\"5\":300000,\"50\":565916,\"95\":1984969.9000000001}",
      "Extensions_AvgBwSendSide": "800446.9",
      "Extensions_WebRTCStats_ssrc_audio_recv_id": "IT01A1678694648",
      "Extensions_WebRTCStats_ssrc_audio_recv_ssrc": "1678694648",
      "Extensions_WebRTCStats_ssrc_audio_recv_mediaType": "audio",
      "Extensions_WebRTCStats_ssrc_audio_recv_bytesReceived": "3260,7628,10714,14128,17528,20937,24251,26566,27376,28593,29774,32412,35287,36745,38756,39751,41270,42435,42575,44667,47367,50621,52791,53935,56989,59744,62561,65207,67338,70496,73198,76447,79511,82594,85003,87324,89307,89507,90703",
      "Extensions_WebRTCStats_ssrc_audio_recv_packetsReceived": "49,116,163,213,263,313,363,398,412,433,452,490,533,557,589,605,629,648,652,684,726,775,809,829,874,917,961,1002,1036,1085,1127,1177,1223,1271,1311,1346,1378,1384,1404",
      "Extensions_WebRTCStats_ssrc_audio_recv_packetsLost": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_recv_googCodecName": "opus",
      "Extensions_WebRTCStats_ssrc_audio_recv_googTrackId": "ff345d15-3dd4-45e9-8f62-c9bc64b96304",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_id": "T01",
      "Extensions_WebRTCStats_ssrc_audio_recv_transportId": "T01",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_selectedCandidatePairId": "CP4EqWUTuk_6AxODv7K",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_dtlsCipher": "TLS_CHACHA20_POLY1305_SHA256",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_srtpCipher": "AES_CM_128_HMAC_SHA1_80",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_id": "CP4EqWUTuk_6AxODv7K",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_responsesSent": "1,1,1,1,1,2,2,2,2,3,3,3,3,3,3,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,8,8,8,8",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_requestsReceived": "1,1,1,1,1,2,2,2,2,3,3,3,3,3,3,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,8,8,8,8",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRemoteCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_consentRequestsSent": "2,3,4,4,5,5,5,6,6,6,7,7,7,8,8,9,9,9,10,10,10,11,11,12,12,12,13,13,13,14,14,14,15,15,16,16,16,17,17",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googTransportType": "udp",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googLocalCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googWritable": "true",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_requestsSent": "3,4,5,5,6,6,6,7,7,7,8,8,8,9,9,10,10,10,11,11,11,12,12,13,13,13,14,14,14,15,15,15,16,16,17,17,17,18,18",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRtt": "1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googActiveConnection": "true",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_packetsDiscardedOnSend": "0",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_bytesReceived": "6383,12761,16953,21467,25967,30616,35030,38115,39233,40912,42511,46031,49946,51932,54693,56134,58181,59764,60038,62834,66552,70884,73802,75386,79524,83271,87056,90604,93483,97859,101535,105884,109960,114193,117528,120619,123306,123638,125368",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_responsesReceived": "3,4,5,5,6,6,6,7,7,7,8,8,8,9,9,10,10,10,11,11,11,12,12,13,13,13,14,14,14,15,15,15,16,16,17,17,17,18,18",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_remoteCandidateId": "I6AxODv7K",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_localCandidateId": "I4EqWUTuk",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_localNetworkType": "ethernet",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_packetsSent": "25,33,39,43,49,53,59,65,69,73,79,84,90,95,99,105,111,116,121,126,132,136,140,147,151,157,162,166,172,177,182,189,194,200,204,208,227,231,236",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googLocalAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRemoteAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_bytesSent": "1906,2162,2406,2534,2726,2846,3058,3202,3298,3394,3538,3704,3848,3990,4086,4230,4442,4563,4682,4824,4968,5064,5160,5374,5470,5614,5756,5852,5996,6138,6284,6498,6640,6784,6880,6976,8574,8670,8836",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googReadable": "true",
      "Extensions_WebRTCStats_ssrc_audio_recv_totalSamplesReceived": "5760,70080,115200,163200,211200,259200,307200,355680,403200,451200,499680,547680,595680,643200,691680,739680,787680,835200,883200,931680,979200,1027680,1075200,1123200,1171680,1219680,1267200,1315680,1363200,1411200,1459680,1507200,1555680,1603200,1651200,1699680,1747200,1795680,1844640",
      "Extensions_WebRTCStats_ssrc_audio_recv_totalAudioEnergy": "0.032672838889524866",
      "Extensions_WebRTCStats_ssrc_audio_recv_audioOutputLevel": "0.003906369212927641,0.0034485915707876827,0.0027771843623157445,0.004791405987731559,0.003143406476027711,0.0034485915707876827,0.003173924985503708,0.0022888882106997894,0.0032654805139316996,0.004119998779259621,0.004303109836115604,0.005371257667775506,0.003662221137119663,0.0034180730613116855,0.002380443739127781,0.0025940733054597613,0.0026551103244117557,0.0026245918149357585,0.002410962248603778,0.0036927396465956603,0.004119998779259621,0.0050050355540635395,0.0037232581560716575,0.003143406476027711,0.00445570238349559,0.005127109591967528,0.0043641468550675985,0.0029297769096957305,0.0030823694570757164,0.004425183874019593,0.0050050355540635395,0.0042115543076876125,0.00466933194982757,0.003967406231879635,0.0031128879665517136,0.007263405255287332,0.003173924985503708,0.0034180730613116855,0.004181035798211615",
      "Extensions_WebRTCStats_ssrc_audio_recv_concealedSamples": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1157,1157,1157,1157,1157,1157,1157,1157,1157,1157,1157,1157,1157",
      "Extensions_WebRTCStats_ssrc_audio_recv_silentConcealedSamples": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_recv_fecPacketsReceived": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_recv_fecPacketsDiscarded": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_recv_jitter": "0.009,0.012,0.01,0.01,0.01,0.01,0.01,0.01,0.009,0.009,0.009,0.011,0.01,0.01,0.01,0.009,0.009,0.009,0.008,0.01,0.01,0.01,0.01,0.009,0.01,0.01,0.015,0.011,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.008,0.009",
      "Extensions_WebRTCStats_ssrc_audio_recv_packetsDiscarded": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_send_id": "OT01A1110099171",
      "Extensions_WebRTCStats_ssrc_audio_send_ssrc": "1110099171",
      "Extensions_WebRTCStats_ssrc_audio_send_mediaType": "audio",
      "Extensions_WebRTCStats_ssrc_audio_send_bytesSent": "35,51,59,67,79,87,95,107,115,123,135,143,155,163,171,183,191,202,211,219,231,239,247,259,267,279,287,295,307,315,323,335,343,355,363,371,1527,1535,1543",
      "Extensions_WebRTCStats_ssrc_audio_send_packetsSent": "13,21,25,29,35,39,43,49,53,57,63,67,73,77,81,87,91,96,101,105,111,115,119,125,129,135,139,143,149,153,157,163,167,173,177,181,199,203,207",
      "Extensions_WebRTCStats_ssrc_audio_send_packetsLost": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_send_googCodecName": "opus",
      "Extensions_WebRTCStats_ssrc_audio_send_googTrackId": "dec9ede2-cc33-4797-98ab-7137552a17c6",
      "Extensions_WebRTCStats_ssrc_audio_send_googRtt": "3,3,3,3,3,3,2,2,2,1,1,1,1,2,2,2,2,2,2,2,1,1,1,1,2,2,2,2,2,1,1,1,1,1",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_id": "T01",
      "Extensions_WebRTCStats_ssrc_audio_send_transportId": "T01",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_selectedCandidatePairId": "CP4EqWUTuk_6AxODv7K",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_dtlsCipher": "TLS_CHACHA20_POLY1305_SHA256",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_srtpCipher": "AES_CM_128_HMAC_SHA1_80",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_localCertificateId": "CF05:1A:C0:2F:4D:B5:79:75:AF:CF:F8:89:FF:CD:DD:FA:88:E0:46:16:B1:6F:54:D2:9F:C4:22:C4:3A:24:38:B0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_id": "CP4EqWUTuk_6AxODv7K",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesSent": "1,1,1,1,1,2,2,2,2,3,3,3,3,3,3,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,8,8,8,8",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsReceived": "1,1,1,1,1,2,2,2,2,3,3,3,3,3,3,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,8,8,8,8",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_consentRequestsSent": "2,3,4,4,5,5,5,6,6,6,7,7,7,8,8,9,9,9,10,10,10,11,11,12,12,12,13,13,13,14,14,14,15,15,16,16,16,17,17",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googTransportType": "udp",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalCandidateType": "host",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googWritable": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsSent": "3,4,5,5,6,6,6,7,7,7,8,8,8,9,9,10,10,10,11,11,11,12,12,13,13,13,14,14,14,15,15,15,16,16,17,17,17,18,18",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRtt": "1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googActiveConnection": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsDiscardedOnSend": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesReceived": "6383,12761,16953,21467,25967,30616,35030,38115,39233,40912,42511,46031,49946,51932,54693,56134,58181,59764,60038,62834,66552,70884,73802,75386,79524,83271,87056,90604,93483,97859,101535,105884,109960,114193,117528,120619,123306,123638,125368",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesReceived": "3,4,5,5,6,6,6,7,7,7,8,8,8,9,9,10,10,10,11,11,11,12,12,13,13,13,14,14,14,15,15,15,16,16,17,17,17,18,18",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_remoteCandidateId": "I6AxODv7K",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_localCandidateId": "I4EqWUTuk",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_localNetworkType": "ethernet",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsSent": "25,33,39,43,49,53,59,65,69,73,79,84,90,95,99,105,111,116,121,126,132,136,140,147,151,157,162,166,172,177,182,189,194,200,204,208,227,231,236",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteAddress": "192.168.255.11",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesSent": "1906,2162,2406,2534,2726,2846,3058,3202,3298,3394,3538,3704,3848,3990,4086,4230,4442,4563,4682,4824,4968,5064,5160,5374,5470,5614,5756,5852,5996,6138,6284,6498,6640,6784,6880,6976,8574,8670,8836",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googReadable": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_audioInputLevel": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_send_totalAudioEnergy": "0.000058057145006021476",
      "Extensions_WebRTCStats_ssrc_audio_send_totalSamplesDuration": "53.75999999999787",
      "Extensions_WebRTCStats_ssrc_audio_send_jitter": "0.0006659999999999999,0.0006659999999999999,0.0006659999999999999,0.0006659999999999999,0.0006659999999999999,0.0006659999999999999,0.000625,0.000625,0.000625,0.000562,0.000562,0.000562,0.000562,0.000958,0.000958,0.000958,0.000958,0.000958,0.000958,0.000958,0.000812,0.000812,0.000812,0.000812,0.0008539999999999999,0.0008539999999999999,0.0008539999999999999,0.0008539999999999999,0.0008539999999999999,0.0007289999999999999,0.0007289999999999999,0.0007289999999999999,0.0007289999999999999,0.0007289999999999999",
      "Extensions_Audio_recv_jitterBufferAvgSize": "102",
      "Extensions_Audio_recv_jitterBufferAvgDelayMs": "0",
      "Extensions_Audio_recv_packetsLostRateMax": "0",
      "Extensions_Audio_recv_jitterAvg": "9.897",
      "Extensions_Audio_recv_jitterMax": "15",
      "Extensions_Audio_recv_networkAvgLossRate": "0",
      "Extensions_Audio_recv_packetsLostAvg": "0",
      "Extensions_Audio_recv_healedRatioAvg": "0",
      "Extensions_Audio_recv_healedRatioMax": "0",
      "Extensions_Audio_recv_audioLevelAvg": "0.00085",
      "Extensions_Audio_send_rttAvg": "2",
      "Extensions_Audio_send_rttMax": "3",
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
      "Extensions_TimeToFirstAudioPacket": "19114",
      "Extensions_FetchTimeMax": "270.1",
      "Extensions_FetchTimeMedian": "13",
      "Extensions_LoopIntervalMax": "1340.7",
      "Extensions_LoopIntervalMedian": "1012.8",
      "TerminatedReason": "1",
      "TerminatedState": "7",
      "DataHandlers": "{\"1\":[{\"added\":208,\"started\":18482,\"removed\":57388}],\"2\":[{\"added\":208,\"started\":18481,\"removed\":57387}],\"24\":[{\"added\":17689,\"started\":18482,\"removed\":57373}],\"25\":[{\"added\":17692,\"started\":18482,\"removed\":57375}],\"27\":[{\"added\":17690,\"started\":18482,\"removed\":57388}]}",
      "SharingControlEnabled": "true",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "react-web-client",
      "AppInfo.ExpIds": "P-E-1645529-2-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
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
  ```json
  {
    "acc": 4,
    "webResult": {}
  }
  ```
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "userbins",
    "time": "2025-11-07T19:35:49.560Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 69,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "panelaction",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "panelaction",
        "Identifier": "StopMeetingButton_click_CallStopMeeting",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "headerEntityType": "calls",
      "mainEntityAction": "view",
      "mainEntityType": "calls",
      "mainSlotApp": "Calls",
      "DataBag": {
        "callType": "oneToOneCall",
        "participantId": "44c27356-e699-4ade-b85e-257918a5fc42",
        "callId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
        "correlationId": "e13b01ea-485e-42e0-ac70-7838f0912774",
        "threadType": "OneOnOneChat",
        "appId": "8e55a7b1-6766-4f0a-8610-ecacfe3d569a",
        "appName": "oneToOneOrGroupCall"
      },
      "CMD": {
        "extendedCallType": "{\"isOneToOnePstn\":false,\"isScreenshareFromChat\":false,\"isFederated\":false,\"isInterop\":false,\"isVoicemailGreeting\":false,\"isEchoBotCall\":false,\"isContentOnlyMode\":false,\"isEmergencyCall\":false,\"isConsultCall\":false,\"isSkypeForConsumerCall\":false,\"isMeetingTransferred\":false,\"isHolographicCall\":false,\"isVideoTeleConferencingCall\":false,\"isAudioDropInCall\":false,\"isGroupCall\":false,\"__typename\":\"ExtendedCallType\"}",
        "isScreenSharing": "false",
        "callMonitorMode": "none",
        "isTranscriptEnabledByMeetingPolicy": "true",
        "isOTPUser": "false"
      },
      "Transcript": {
        "isMultilingualMeeting": "false"
      },
      "Call": {
        "skypeParticipantsCount": "0",
        "Id": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6"
      },
      "Extensibility": {
        "userType": "Unknown"
      },
      "Action": {
        "Gesture": "click",
        "InputDelay": "377.89999997615814",
        "Outcome": "submit",
        "Scenario": "CallStopMeeting",
        "ScenarioType": "callOrMeetup",
        "IsDuplicate": "true",
        "DuplicateDebugInfo": "[{\"enableUserbiDeduplication\":true,\"enableUserbiDeduplicationDebugInfo\":true,\"skipPanelViewOnMount\":true,\"data-testid\":\"telemetry-panel-app-layout\",\"panelRegion\":\"coreLayout\",\"panelType\":\"appLayoutArea\",\"disableWrapper\":true}]"
      },
      "Module": {
        "Name": "StopMeetingButton"
      },
      "Panel": {
        "Region": "popover",
        "Type": "Ubar",
        "WindowID": "main",
        "Context": "main"
      },
      "Participant": {
        "Id": "44c27356-e699-4ade-b85e-257918a5fc42"
      },
      "Thread": {
        "Type": "Meeting"
      },
      "TargetThread": {
        "Type": "Meeting"
      },
      "Entity": {
        "Type": "calls"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary",
        "Type": "ReactWebClient"
      },
      "UserInfo": {
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:49.727Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 71,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "calling_call_disconnected",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "calling_call_disconnected",
        "SpanId": "33bacdd5f289499e",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "calling_call_disconnected",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":4,\"elapsed\":151341,\"sequence\":1,\"stepDelta\":4,\"previousStep\":\"start\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":1,\"callType\":\"oneToOneCall\",\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"callParticipantUserRole\":\"default\",\"streamingData\":{},\"meetingRoles\":[],\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\",\"correlationId\":\"0964c57b-3e74-4fca-a01a-55b125e26b93\",\"deeplinkId\":\"\",\"ndiEnabled\":false,\"ndiWasCaptured\":false,\"isCCAMediaProxied\":false,\"call_dataBag\":{\"entryId\":\"46e775b0-2000-47bc-953b-f9b34f0a2b70\",\"sessionId\":\"9d3f5c8d-1360-4b67-b906-7f5ca5340ccd\",\"stateChanges\":\"None:1762544091832;Connecting:1762544091993;Connected:1762544109512;Disconnecting:1762544149197;Disconnected:1762544149667\",\"stagingRoomStateChanges\":\"\",\"events\":\"\",\"hadOffline\":false,\"hadSuspendEvent\":false,\"hadCriticalBattery\":false,\"hadScreenSharing\":false,\"hadDialInShown\":false,\"hadDialOutShown\":false,\"hadNetworkReconnect\":false,\"heartbeatTimestamp\":1762544141961,\"deviceCacheUsed\":false,\"meetingTransferred\":false,\"wasChildWindowShown\":true,\"stageSize\":0,\"nsMode\":\"Auto\",\"terminationInfo\":{},\"callEndActionReason\":\"Success\"},\"isBroadcast\":false,\"signalingScenarioName\":\"create_one_to_one_call_v2\",\"leaveCallContext\":\"multi-window_hangup-button_click\",\"terminatedReason\":\"Success\",\"callControllerCode\":0,\"callControllerSubCode\":0}]"
      },
      "InstanceId": "cfef9aa9-75e5-4bd4-8bf0-30aad0be1c4d",
      "delta": "4",
      "elapsed": "151341",
      "sequence": "1",
      "stepDelta": "4",
      "previousStep": "start",
      "commandSource": "ExternalCommand",
      "id": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "callId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "callMode": "1",
      "callType": "oneToOneCall",
      "intentType": "2",
      "teamsCallId": "1",
      "endpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "wasPoppedOut": "true",
      "isVideoOn": "false",
      "isMuted": "false",
      "threadId": "19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces",
      "stagingRoomEnabled": "false",
      "stagingRoomEventActive": "false",
      "stagingRoomEventEnded": "false",
      "trouterState": "Connected",
      "trouterClientState": "Connected",
      "trouterUrls": "https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/",
      "isManagedModeEnabled": "false",
      "selectedCameraId": "camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165",
      "selectedMicrophoneId": "microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797",
      "selectedSpeakerId": "speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203",
      "isCopilot": "false",
      "isTPManagement": "false",
      "isMultilingualMeeting": "false",
      "isOneToOnePstnCall": "false",
      "participantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "callParticipantUserRole": "default",
      "streamingData": "{}",
      "meetingRoles": "[]",
      "isMeetingAcrossTFLTFW": "false",
      "correlationId": "0964c57b-3e74-4fca-a01a-55b125e26b93",
      "ndiEnabled": "false",
      "ndiWasCaptured": "false",
      "isCCAMediaProxied": "false",
      "call_dataBag": "{\"entryId\":\"46e775b0-2000-47bc-953b-f9b34f0a2b70\",\"sessionId\":\"9d3f5c8d-1360-4b67-b906-7f5ca5340ccd\",\"stateChanges\":\"None:1762544091832;Connecting:1762544091993;Connected:1762544109512;Disconnecting:1762544149197;Disconnected:1762544149667\",\"stagingRoomStateChanges\":\"\",\"events\":\"\",\"hadOffline\":false,\"hadSuspendEvent\":false,\"hadCriticalBattery\":false,\"hadScreenSharing\":false,\"hadDialInShown\":false,\"hadDialOutShown\":false,\"hadNetworkReconnect\":false,\"heartbeatTimestamp\":1762544141961,\"deviceCacheUsed\":false,\"meetingTransferred\":false,\"wasChildWindowShown\":true,\"stageSize\":0,\"nsMode\":\"Auto\",\"terminationInfo\":{},\"callEndActionReason\":\"Success\"}",
      "isBroadcast": "false",
      "signalingScenarioName": "create_one_to_one_call_v2",
      "leaveCallContext": "multi-window_hangup-button_click",
      "terminatedReason": "Success",
      "callControllerCode": "0",
      "callControllerSubCode": "0",
      "isInEst": "false",
      "uses_slimcore": "false",
      "nodeId": "11dbfd57-1913-f3fb-bf73-959759f911f1",
      "isSlimCoreRunningOutproc": "true",
      "isSlimCoreDirectConnectionActive": "true",
      "tsTrouterVersion": "2025.40.01.1",
      "tsCallingVersion": "2025.40.01.4",
      "isolatedAudioEnabled": "true",
      "scdEnabled": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "ReactWebClient"
      },
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:49.837Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 73,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "leave_meetup",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "leave_meetup",
        "SpanId": "a1d2819722112821",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "leave_meetup",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"processed_connected_calls_handling_on_leave\",\"delta\":0,\"elapsed\":150813,\"sequence\":1,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"slimcore_api_stop_call_invoked\",\"delta\":1,\"elapsed\":150814,\"sequence\":2,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"finish_call_end_scenarios_marking_complete\",\"delta\":47,\"elapsed\":150860,\"sequence\":3,\"stepDelta\":46},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":643,\"elapsed\":151456,\"sequence\":4,\"stepDelta\":596,\"previousStep\":\"finish_call_end_scenarios_marking_complete\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":1,\"callType\":1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"callParticipantUserRole\":\"default\",\"streamingData\":{},\"meetingRoles\":[],\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\",\"context\":\"multi-window_hangup-button_click\",\"clientId\":\"1\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":1,\"callType\":1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"callParticipantUserRole\":\"default\",\"streamingData\":{},\"meetingRoles\":[],\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\",\"context\":\"multi-window_hangup-button_click\",\"clientId\":\"1\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":1,\"callType\":1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"callParticipantUserRole\":\"default\",\"streamingData\":{},\"meetingRoles\":[],\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\",\"context\":\"multi-window_hangup-button_click\",\"clientId\":\"1\",\"Call_Type\":\"oneToOneCall\"},{\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"id\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"callMode\":1,\"callType\":1,\"intentType\":2,\"teamsCallId\":1,\"endpointId\":\"02adcfba-81ac-44a2-a44b-389b72cf3a92\",\"wasPoppedOut\":true,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165\",\"selectedMicrophoneId\":\"microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797\",\"selectedSpeakerId\":\"speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203\",\"isCopilot\":false,\"isTPManagement\":false,\"isMultilingualMeeting\":false,\"isOneToOnePstnCall\":false,\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"callParticipantUserRole\":\"default\",\"streamingData\":{},\"meetingRoles\":[],\"isMeetingAcrossTFLTFW\":false,\"productionMeetingType\":\"\",\"context\":\"multi-window_hangup-button_click\",\"clientId\":\"1\",\"Call_Type\":\"oneToOneCall\",\"terminatedReason\":1,\"callControllerCode\":0,\"callControllerSubCode\":0,\"callLeaveStatus\":\"Success\"}]"
      },
      "InstanceId": "581c2b2d-7739-4840-a132-90757236848e",
      "delta": "643",
      "elapsed": "151456",
      "sequence": "4",
      "stepDelta": "596",
      "previousStep": "finish_call_end_scenarios_marking_complete",
      "commandSource": "ExternalCommand",
      "id": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "callId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "callMode": "1",
      "callType": "1",
      "intentType": "2",
      "teamsCallId": "1",
      "endpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "wasPoppedOut": "true",
      "isVideoOn": "false",
      "isMuted": "false",
      "threadId": "19:1c5958d5-e40a-4a35-a0e3-7eb65179096f_50a17a93-7e33-44f1-baef-8f234457f3e7@unq.gbl.spaces",
      "stagingRoomEnabled": "false",
      "stagingRoomEventActive": "false",
      "stagingRoomEventEnded": "false",
      "trouterState": "Connected",
      "trouterClientState": "Connected",
      "trouterUrls": "https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/",
      "isManagedModeEnabled": "false",
      "selectedCameraId": "camera:a244eb82dc777f4925e6c64ea8bc8b862e2e56588e607576f2968c154fe86165",
      "selectedMicrophoneId": "microphone:14797a694df49aab5643a7076c2b2d321709411f454c9998854308e3ce5b1797",
      "selectedSpeakerId": "speaker:48daff312fdbeff1364cbf9c0d336b492989d7b7c809afac84d692baf453e203",
      "isCopilot": "false",
      "isTPManagement": "false",
      "isMultilingualMeeting": "false",
      "isOneToOnePstnCall": "false",
      "participantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "callParticipantUserRole": "default",
      "streamingData": "{}",
      "meetingRoles": "[]",
      "isMeetingAcrossTFLTFW": "false",
      "context": "multi-window_hangup-button_click",
      "clientId": "1",
      "Call_Type": "oneToOneCall",
      "terminatedReason": "1",
      "callControllerCode": "0",
      "callControllerSubCode": "0",
      "callLeaveStatus": "Success",
      "isInEst": "false",
      "uses_slimcore": "false",
      "nodeId": "1b117d77-9b9b-53fd-9751-5155d37bd5ff",
      "isSlimCoreRunningOutproc": "true",
      "isSlimCoreDirectConnectionActive": "true",
      "tsTrouterVersion": "2025.40.01.1",
      "tsCallingVersion": "2025.40.01.4",
      "ndiWasCaptured": "false",
      "ndiEnabled": "false",
      "isolatedAudioEnabled": "true",
      "scdEnabled": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 10,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "ReactWebClient"
      },
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:50.172Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 74,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "call_hangup_latency",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "call_hangup_latency",
        "SpanId": "fa43559d216e19df",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "call_hangup_latency",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"end_slot_hidden\",\"delta\":1,\"elapsed\":153950,\"sequence\":1,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stopping_call\",\"delta\":2,\"elapsed\":153951,\"sequence\":2,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_leave_triggered\",\"delta\":9,\"elapsed\":153958,\"sequence\":3,\"stepDelta\":7},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"disconnecting\",\"delta\":155,\"elapsed\":154104,\"sequence\":4,\"stepDelta\":146},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stage_unmounted\",\"delta\":181,\"elapsed\":154130,\"sequence\":5,\"stepDelta\":26},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"client_state_lowered\",\"delta\":286,\"elapsed\":154235,\"sequence\":6,\"stepDelta\":105},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_event_disconnected\",\"delta\":489,\"elapsed\":154438,\"sequence\":7,\"stepDelta\":203},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_removed_from_registry\",\"delta\":521,\"elapsed\":154470,\"sequence\":8,\"stepDelta\":32},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_disposed\",\"delta\":535,\"elapsed\":154484,\"sequence\":9,\"stepDelta\":14},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"disconnected\",\"delta\":610,\"elapsed\":154559,\"sequence\":10,\"stepDelta\":75},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"calling_screen_reset\",\"delta\":623,\"elapsed\":154572,\"sequence\":11,\"stepDelta\":13},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"end_screen_completed\",\"delta\":771,\"elapsed\":154720,\"sequence\":12,\"stepDelta\":148},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":969,\"elapsed\":154918,\"sequence\":13,\"stepDelta\":198,\"previousStep\":\"end_screen_completed\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\"},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\"},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\"},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false,\"terminatedReason\":1},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false,\"terminatedReason\":1},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"calls\",\"contentSlotApp\":\"Calls\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false,\"terminatedReason\":1,\"context\":\"None\"},{\"Window.ViewportContext\":\"primary\",\"mainEntityAction\":\"view\",\"mainEntityType\":\"callsmain\",\"contentSlotApp\":\"CallsMain\",\"endSlotApp\":\"CallsMain\",\"endEntityAction\":\"view\",\"endEntityType\":\"speeddial\",\"Panel.WindowID\":\"main\",\"EventInfo.CorrelationId\":\"Core-6e140964-6650-4409-be31-9ac778a9d24e\",\"commandSource\":\"ExternalCommand\",\"callId\":\"d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6\",\"participantId\":\"44c27356-e699-4ade-b85e-257918a5fc42\",\"locationDone\":\"HangupButton\",\"actionDone\":\"Click\",\"endedForAll\":false,\"participantCount\":3,\"callMode\":1,\"operationType\":\"ForMe\",\"isScreenShare\":false,\"isVideoOn\":false,\"terminatedReason\":1,\"context\":\"None\"}]"
      },
      "InstanceId": "072bfee3-9aa3-45d9-b9f4-b8248c614214",
      "elapsedSinceCoreInit": "152090",
      "delta": "969",
      "elapsed": "154918",
      "sequence": "13",
      "stepDelta": "198",
      "previousStep": "end_screen_completed",
      "Window": {
        "ViewportContext": "primary",
        "Type": "ReactWebClient"
      },
      "mainEntityAction": "view",
      "mainEntityType": "callsmain",
      "contentSlotApp": "CallsMain",
      "endSlotApp": "CallsMain",
      "endEntityAction": "view",
      "endEntityType": "speeddial",
      "Panel": {
        "WindowID": "main",
        "Context": "main"
      },
      "commandSource": "ExternalCommand",
      "callId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "participantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "locationDone": "HangupButton",
      "actionDone": "Click",
      "endedForAll": "false",
      "participantCount": "3",
      "callMode": "1",
      "operationType": "ForMe",
      "isScreenShare": "false",
      "isVideoOn": "false",
      "terminatedReason": "1",
      "context": "None",
      "isInEst": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-07T19:35:50.270Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 75,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "panelview",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "panelview",
        "Identifier": "header_CallHeader",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "endEntityType": "speeddial",
      "headerEntityType": "callsmain",
      "mainEntityAction": "view",
      "mainEntityType": "callsmain",
      "startEntityType": "callsmain",
      "mainSlotApp": "CallsMain",
      "Panel": {
        "Region": "header",
        "Type": "CallHeader",
        "WindowID": "main",
        "Context": "main"
      },
      "Entity": {
        "Type": "callsmain"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary",
        "Type": "ReactWebClient"
      },
      "UserInfo": {
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-07T19:35:50.433Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 76,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "panelaction",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "panelaction",
        "Identifier": "dialpadPeoplePicker_peoplePicker_click_peoplePickerInitiate",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "endEntityType": "speeddial",
      "headerEntityType": "callsmain",
      "mainEntityAction": "view",
      "mainEntityType": "callsmain",
      "startEntityType": "callsmain",
      "mainSlotApp": "CallsMain",
      "Action": {
        "Gesture": "click",
        "Outcome": "select",
        "Scenario": "peoplePickerInitiate",
        "ScenarioType": "people",
        "WorkLoad": "peopleContent",
        "SubWorkLoad": "peoplePickerInitiate"
      },
      "Module": {
        "Name": "dialpadPeoplePicker",
        "Type": "peoplePicker"
      },
      "Panel": {
        "Region": "main",
        "Type": "Dialpad",
        "WindowID": "main",
        "Context": "main"
      },
      "Entity": {
        "Type": "callsmain"
      },
      "DataBag": {
        "searchTextLength": "0",
        "mtResultCount": "0",
        "netTimeTaken": "112",
        "timeFromFirstInput": "0",
        "pickerUsageArea": "dialPadPeoplePicker",
        "networkSearchCount": "0",
        "chatMembersCount": "0",
        "numUsersSelectedViaPicker": "1",
        "directSubstrateCallEnabled": "true",
        "implicitContactsCount": "0",
        "implicitContactsRate": "0",
        "googleImplicitContactsCount": "0",
        "substrateCallResultCount": "0",
        "namedGroupChatsResultsCount": "0",
        "cachedPeopleResultsCount": "0",
        "zeroStateSuggestionsDiscardedByEscCount": "0",
        "zeroStateSuggestionsDiscardedByTabCount": "0"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary",
        "Type": "ReactWebClient"
      },
      "UserInfo": {
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-07T19:35:50.450Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 77,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "panelview",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "panelview",
        "Identifier": "left_Call",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "endEntityType": "speeddial",
      "headerEntityType": "callsmain",
      "mainEntityAction": "view",
      "mainEntityType": "callsmain",
      "startEntityType": "callsmain",
      "mainSlotApp": "CallsMain",
      "Panel": {
        "Region": "left",
        "Type": "Call",
        "WindowID": "main",
        "Context": "main"
      },
      "Entity": {
        "Type": "callsmain"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary",
        "Type": "ReactWebClient"
      },
      "UserInfo": {
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-07T19:35:50.535Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 78,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      "baseType": "panelview",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "panelview",
        "Identifier": "main_Call",
        "CorrelationId": "Core-6e140964-6650-4409-be31-9ac778a9d24e",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "endEntityType": "speeddial",
      "headerEntityType": "callsmain",
      "mainEntityAction": "view",
      "mainEntityType": "callsmain",
      "startEntityType": "callsmain",
      "mainSlotApp": "CallsMain",
      "Panel": {
        "Region": "main",
        "Type": "Call",
        "WindowID": "main",
        "Context": "main"
      },
      "Entity": {
        "Type": "callsmain"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary",
        "Type": "ReactWebClient"
      },
      "UserInfo": {
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-07T19:35:49.661Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 70,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      }
    },
    "data": {
      "baseType": "custom",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "conCore",
      "EventInfo": {
        "BaseType": "custom",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Ring": "general",
      "Region": "de",
      "Partition": "de01",
      "ClientType": "enterprise",
      "ParticipantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "EndpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "CorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "SignalingSessionId": "9b54a1be-5882-4f94-93bc-815b423c2ae7",
      "ClientInformation": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
      "NetworkRequestBag": "{\"eventStart\":1762544091815,\"events\":{\"name\":\"POST-LeaveConversation\",\"url\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-swce-03-prod-aks.conv.skype.com/conv/H3LnpEolG0-jH5gJz0aQ-Q/leave?i=10-128-44-168&e=638979768034953351\",\"eventStart\":57400,\"trouterReady\":17,\"requestReady\":303,\"status\":204,\"attempts\":[{\"status\":204,\"start\":337,\"end\":446,\"online\":1}],\"rtt\":446,\"uid\":\"c36fbfd8-198d-4cec-aeec-95b81e7c6314\",\"causeId\":\"b73adef6\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[200,1000,5000],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":15000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"enabled\"]},\"enableRequestHedging\":true,\"tokenTelemetries\":[{\"requestCauseId\":\"b73adef6\",\"responseCauseId\":\"b73adef6\",\"supportTokenApi\":true,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"POST\\\",\\\"path\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-swce-03-prod-aks.conv.skype.com/conv/H3LnpEolG0-jH5gJz0aQ-Q/leave?i=10-128-44-168&e=638979768034953351\\\"}\",\"tokenRequestTime\":1762544149242,\"tokenResponseTime\":1762544149508,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":266}]}}",
      "EcsEtag": "\"8KfQrXUitMM2XYCywLwTaMyh1R0UpOstIV7uPRvWxXM=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25101616511",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "ReactWebClient"
      },
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_callmodality",
    "time": "2025-11-07T19:35:49.821Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 72,
        "epoch": "3273314714"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "chrome",
        "browserVer": "141.0.7390.67",
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
      }
    },
    "data": {
      "baseType": "custom",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "conCore",
      "EventInfo": {
        "BaseType": "custom",
        "isNS": "true",
        "TraceId": "f7921b0fd382a42be5835826014bb52b"
      },
      "Type": "SkypeConcore",
      "ResultDetail": "CallEndReasonLocalUserInitiated",
      "ResultValue": "Success",
      "ResultCode": "0",
      "ResultCauseId": "b73adef6",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "CorrelationId": "d6dbeaa4-7a4f-447c-a00b-d3ef65304fa6",
      "SignalingSessionId": "9b54a1be-5882-4f94-93bc-815b423c2ae7",
      "EndpointId": "02adcfba-81ac-44a2-a44b-389b72cf3a92",
      "ParticipantId": "44c27356-e699-4ade-b85e-257918a5fc42",
      "EcsEtag": "\"8KfQrXUitMM2XYCywLwTaMyh1R0UpOstIV7uPRvWxXM=\"",
      "ConversationServiceUrl": "https://api-emea.flightproxy.teams.microsoft.com/api/v2/epconv",
      "CallStartTime": "1762544091815",
      "CallEndTime": "1762544149820",
      "MessagingChannel": "[\"Trouter:9\"]",
      "IsGroupCall": "false",
      "IsHostLessCall": "false",
      "IsCastCall": "false",
      "IsHuddleGroupCall": "false",
      "IsOnBehalfOfCall": "false",
      "ClientInformation": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
      "SdpInCallNotification": "false",
      "CallTerminatingEnd": "Local",
      "Code": "0",
      "SubCode": "0",
      "Direction": "Outgoing",
      "SelfParticipantRole": "caller",
      "ConnectedDurationInMsecs": "40324",
      "TimeToRingInMsecs": "5713",
      "NetworkRequestsCompleted": "[\"StartCall:Success:390:4100\",\"BrokerSubscribe:Success:1214:5332\",\"SendAcceptanceAcknowledgement:Success:17679\",\"UpdateEndpointMetadata:Success:1372:19358\",\"LeaveConversation:Success:446:57846\",\"LeaveConversation:Success:447:57847\"]",
      "NetworkRequestsPending": "[\"BrokerSubscribe:5362\"]",
      "LocalOperationsPerformed": "[\"AddParticipant:101\",\"SetMultiparty:101\",\"SetCallOptions:139\",\"StartCall:172\",\"UpdateEndpointState:3690\",\"StartOrJoinCall:3705\",\"GetEmergencyContent:3708\",\"SubscribeUrlFound:4116\",\"UpdateEndpointState:4119\",\"UpdateCallStatus:4119\",\"HandleCallProgress:5885\",\"UpdateCallStatus:5886\",\"HandleCallAcceptanceSync:17678\",\"ProcessCallAcceptance:17681\",\"MediaFsmStateChanged:17681\",\"UpdateCallStatus:17691\",\"HandleRosterUpdate:17752\",\"HandleConversationUpdate:18570\",\"SubscribeUrlMissing:18576\",\"Connected:18580\",\"HandleRosterUpdate:18591\",\"HandleRosterUpdate:19341\",\"HandleRosterUpdate:19350\",\"HandleRosterUpdate:19356\",\"UpdateEndpointMetadataSuccess:19359\",\"EndCall:57399\",\"UpdateCallStatus:57847\"]",
      "EventTimestampBag": "{\"eventStart\":1762544091815,\"events\":[{\"AddParticipant\":101,\"data\":{\"causeId\":\"e53e64f0\"}},{\"SetMultiparty\":101,\"data\":{\"isMultiparty\":false,\"causeId\":\"e53e64f0\"}},{\"SetCallOptions\":139},{\"StartCall\":172,\"data\":{\"causeId\":\"06df8c0c\"}},{\"UpdateEndpointState\":3690,\"data\":{\"newEndpointState\":{\"state\":{\"isMuted\":false},\"endpointStateSequenceNumber\":1},\"causeId\":\"06df8c0c\"}},{\"StartOrJoinCall\":3705,\"data\":{\"causeId\":\"06df8c0c\",\"requestName\":\"StartCall\"}},{\"GetEmergencyContent\":3708},{\"SubscribeUrlFound\":4116,\"data\":\"06df8c0c\"},{\"UpdateEndpointState\":4119,\"data\":{\"newEndpointState\":{\"endpointStateSequenceNumber\":2,\"endpointProperties\":{\"additionalEndpointProperties\":{\"infoShownInReportMode\":\"FullInformation\"}},\"state\":{\"isMuted\":false}},\"causeId\":\"06df8c0c\"}},{\"UpdateCallStatus\":4119,\"data\":{\"callStatus\":\"Connecting\",\"causeId\":\"06df8c0c\"}},{\"HandleCallProgress\":5885,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"ac5fb38c\"}},{\"UpdateCallStatus\":5886,\"data\":{\"callStatus\":\"Ringing\",\"causeId\":\"ac5fb38c\"}},{\"HandleCallAcceptanceSync\":17678,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"b30ca6dd\",\"data\":{\"enableQuickSendAcceptanceAck\":true,\"causeId\":\"b30ca6dd\"}}},{\"ProcessCallAcceptance\":17681,\"data\":{\"causeId\":\"b30ca6dd\"}},{\"MediaFsmStateChanged\":17681,\"data\":{\"state\":\"Connected\",\"causeId\":\"b30ca6dd\"}},{\"UpdateCallStatus\":17691,\"data\":{\"callStatus\":\"Connected\",\"causeId\":\"b30ca6dd\"}},{\"HandleConversationUpdate\":18570,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"5edb17e4\"}},{\"SubscribeUrlMissing\":18576,\"data\":\"5edb17e4\"},{\"Connected\":18580,\"data\":{\"causeId\":\"85a68b43\"}},{\"UpdateEndpointMetadataSuccess\":19359,\"data\":{\"causeId\":\"70bed808\"}},{\"EndCall\":57399,\"data\":{\"code\":0,\"subCode\":0,\"causeId\":\"b73adef6\"}},{\"UpdateCallStatus\":57847,\"data\":{\"callStatus\":\"LocalTerminated\",\"statusCode\":{\"code\":0,\"subCode\":0,\"phrase\":\"CallEndReasonLocalUserInitiated\",\"resultCategories\":[\"Success\"]},\"causeId\":\"b73adef6\"}}]}",
      "RosterUpdatesBag": "{\"eventStart\":1762544091815,\"events\":[{\"eventName\":17752,\"data\":{\"data\":{\"participantCountInLastRoster\":1,\"participantCountInFirstRoster\":-1,\"sequenceNumberOfLastRoster\":-1,\"sequenceNumberOfLastFullRoster\":-1,\"sequenceNumberOfFirstRoster\":-1,\"rosterType\":\"MultiPartyEndpoint\",\"isFullRoster\":true,\"maxConcurrentParticipantsDuringLeg\":-1,\"totalParticipantsDuringLifetimeOfLeg\":0,\"countOfMissingNotifications\":0},\"causeId\":\"b30ca6dd\"}},{\"eventName\":18591,\"data\":{\"data\":{\"participantCountInLastRoster\":2,\"participantCountInFirstRoster\":2,\"sequenceNumberOfLastRoster\":1,\"sequenceNumberOfLastFullRoster\":-1,\"sequenceNumberOfFirstRoster\":1,\"rosterType\":\"Delta\",\"isFullRoster\":false,\"maxConcurrentParticipantsDuringLeg\":2,\"totalParticipantsDuringLifetimeOfLeg\":2,\"countOfMissingNotifications\":0},\"causeId\":\"85a68b43\"}},{\"eventName\":19341,\"data\":{\"data\":{\"participantCountInLastRoster\":1,\"participantCountInFirstRoster\":2,\"sequenceNumberOfLastRoster\":2,\"sequenceNumberOfLastFullRoster\":-1,\"sequenceNumberOfFirstRoster\":1,\"rosterType\":\"Delta\",\"isFullRoster\":false,\"maxConcurrentParticipantsDuringLeg\":2,\"totalParticipantsDuringLifetimeOfLeg\":2,\"countOfMissingNotifications\":0},\"causeId\":\"16a02871\"}},{\"eventName\":19350,\"data\":{\"data\":{\"participantCountInLastRoster\":1,\"participantCountInFirstRoster\":2,\"sequenceNumberOfLastRoster\":3,\"sequenceNumberOfLastFullRoster\":-1,\"sequenceNumberOfFirstRoster\":1,\"rosterType\":\"Delta\",\"isFullRoster\":false,\"maxConcurrentParticipantsDuringLeg\":2,\"totalParticipantsDuringLifetimeOfLeg\":2,\"countOfMissingNotifications\":0},\"causeId\":\"7b42df8c\"}},{\"eventName\":19356,\"data\":{\"data\":{\"participantCountInLastRoster\":1,\"participantCountInFirstRoster\":2,\"sequenceNumberOfLastRoster\":4,\"sequenceNumberOfLastFullRoster\":-1,\"sequenceNumberOfFirstRoster\":1,\"rosterType\":\"Delta\",\"isFullRoster\":false,\"maxConcurrentParticipantsDuringLeg\":2,\"totalParticipantsDuringLifetimeOfLeg\":2,\"countOfMissingNotifications\":0},\"causeId\":\"789fa700\"}}]}",
      "TrouterWaitOperations": "[\"Started:StartCall:3712\",\"Ended:StartCall:3712\",\"Started:BrokerSubscribe:4121\",\"Ended:BrokerSubscribe:4121\",\"Started:BrokerSubscribe:5334\",\"Ended:BrokerSubscribe:5334\",\"Started:UpdateEndpointMetadata:18008\",\"Ended:UpdateEndpointMetadata:18008\",\"Started:BrokerSubscribe:25437\",\"Ended:BrokerSubscribe:25437\",\"Started:BrokerSubscribe:45531\",\"Ended:BrokerSubscribe:45531\"]",
      "LocalOfferAnswerGenerationTimestamps": "[\"InitialOfferGenerationStarted:555\",\"InitialOfferGenerationEnded:3687\",\"InitialAnswerProcessingStarted:17802\",\"InitialAnswerProcessingEnded:18455\",\"NegotiationCompleted:18462\"]",
      "Outgoing_Modalities": "[[\"Audio\"]]",
      "Incoming_Modalities": "[[\"Audio\"]]",
      "CallAnsweredModalities": "Audio[0] = Bidirectional, Video[0] = Inactive",
      "Caller_Type": "8",
      "Callee_Type": "8",
      "IsPreheated": "0",
      "ResultCategories": "Success",
      "Ring": "general",
      "Region": "de",
      "Partition": "de01",
      "MeetingRoles": "[]",
      "ParticipantType": "inTenant",
      "ClientSupportsAudioOnlyWatermark": "true",
      "IsReinviteless": "0",
      "ClientType": "enterprise",
      "Call_Type": "default",
      "hostName": "<redacted>",
      "ui_version": "1415/25101616511",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "f01d2d01-6488-480f-83e5-270ee0481a46"
      },
      "authStatus": "post auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web",
        "WebId": "8baccb5a-547e-4321-9318-0937ccbabda8"
      },
      "telemetryRegionFetchComplete": "true",
      "UserInfo": {
        "TelemetryRegion": "EMEA",
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "ETag": "\"TPgGJF3hllVlEgqFsl/PLypFpSzijP8StS2AWysKMsY=\"",
        "Id": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "CountryCode": "GB",
        "NewChatAndChannelEnabled": "true",
        "CollabAppEnabled": "false",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Aad",
        "Role": "Member",
        "HomeAccountId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "IsSkypeUser": "false",
        "LicenseType": "SmbNonVoice",
        "LicenseTypes": "SmbNonVoice",
        "TenantRole": "3",
        "IsMRU": "true",
        "AuthState": "Up",
        "Region": "de",
        "CallingStackInitState": "Success"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "BootType": "Warm",
        "ServiceWorkerState": "ActiveAndFullyCached",
        "ExpIds": "P-E-1645529-C1-3,P-E-1604925-C1-5,P-E-1575171-2-5,P-E-1568388-2-32,P-E-1562979-2-3,P-E-1531617-2-3,P-E-1531618-2-3,P-E-1531616-2-3,P-E-1531614-2-3,P-E-1531613-2-3,P-E-1531611-2-3,P-E-1531601-C1-3,P-E-1531597-C1-3,P-E-1531577-2-3,P-E-1527548-2-3,P-E-1476285-2-3,P-E-1470642-C1-3,P-E-1454774-C1-4,P-E-1440598-5-4,P-E-1249015-C1-6,P-E-1249004-2-6,P-E-1248158-2-5,P-E-1244274-2-3,P-E-1078273-2-6,P-E-1131711-C1-3,P-E-1104133-C1-3,P-E-1074820-4-5,P-E-1072021-C1-7,P-E-1062820-C3-4,P-E-1005612-4-4,P-E-48348-2-5",
        "ExpRolloutIds": "P-R-1293775-910-32,P-R-1446898-3-29,P-R-1293776-583-24",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "warm"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "415bba8a-89fd-4dda-a9ef-3d58f5af9ee7",
        "OsVersion": "NT 10.0"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "ReactWebClient"
      },
      "Tenant": {
        "SmbTenantSizeSegment": "VSB"
      },
      "appswitcherEffectivePolicy": "T21ONLY",
      "appswitcherCohort": "WebCohort",
      "uniqueCredentialCount": "1",
      "mtmaAccounts": "1",
      "primaryUserInfoId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "primaryUserInfoTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
    }
  }
  ```
  ```json
  {
    "acc": 10
  }
  ```
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "scenarions",
    "time": "2025-11-07T19:35:51.115Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 73,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
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
        "SpanId": "3591aaac5bbb4659",
        "isNS": "true"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "fetch_voicemails",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"useUpdatedGetVoicemailsPath\",\"delta\":0,\"elapsed\":157239,\"sequence\":1,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":216,\"elapsed\":157455,\"sequence\":2,\"stepDelta\":216,\"previousStep\":\"useUpdatedGetVoicemailsPath\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"commandSource\":\"CDLWorker\"},{\"commandSource\":\"CDLWorker\",\"callingDataBag\":\"{\\n    \\\"isOwnMailbox\\\": true,\\n  }\"}]"
      },
      "InstanceId": "8e6a615d-a4ea-4fd5-a2c9-c65ecc66177e",
      "delta": "216",
      "elapsed": "157455",
      "sequence": "2",
      "stepDelta": "216",
      "previousStep": "useUpdatedGetVoicemailsPath",
      "commandSource": "CDLWorker",
      "callingDataBag": "{\n    \"isOwnMailbox\": true,\n  }",
      "isInEst": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "865f6c26-5860-45f5-84f4-c8b8e6bd194f"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "embed",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web"
      },
      "AppInfo": {
        "ClientType": "cdlworker",
        "ProcessArchitecture": "x64",
        "Language": "en-us",
        "Locale": "en-us",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
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
- GET `https://go-eu.trouter.teams.microsoft.com/?check=1762544331893&cor_id=9d3f5c8d-1360-4b67-b906-7f5ca5340ccd&epid=9f97f0fe-0079-4ff4-827f-ac8b0539837b&tc=%7B%22cv%22%3A%222025.40.01.1%22%2C%22ua%22%3A%22SkypeSpaces%22%2C%22hr%22%3A%22%22%2C%22v%22%3A%220.0.0%22%7D`
  ```json
"Trouter"
  ```
- GET `wss://pub-ent-euno-11-t.trouter.teams.microsoft.com/v4/c?tc=%7B%22cv%22:%222025.40.01.1%22,%22ua%22:%22SkypeSpaces%22,%22hr%22:%22%22,%22v%22:%220.0.0%22%7D&timeout=40&epid=9f97f0fe-0079-4ff4-827f-ac8b0539837b&ccid=jl10qtAEobw&dom=teams.microsoft.com&cor_id=9d3f5c8d-1360-4b67-b906-7f5ca5340ccd&con_num=1762544017781_0`
- POST `https://teams.microsoft.com/registrar/prod/V2/registrations`
  ```json
  {
    "clientDescription": {
      "appId": "SkypeSpacesWeb",
      "aesKey": "",
      "languageId": "en-US",
      "platform": "chrome",
      "templateKey": "SkypeSpacesWeb_2.4",
      "platformUIVersion": "0.0.0"
    },
    "registrationId": "9f97f0fe-0079-4ff4-827f-ac8b0539837b",
    "nodeId": "",
    "transports": {
      "TROUTER": [
        {
          "context": "",
          "path": "https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/",
          "ttl": 3600
        }
      ]
    }
  }
  ```
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  (Request was too long to pretty-print)
  ```json
  {
    "acc": 51
  }
  ```
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "Office_AugLoop_Client_WebSocketWorker",
    "time": "2025-11-07T19:38:53.173Z",
    "ver": "4.0",
    "iKey": "o:3de4087d4de34817b1c376e3d1e6e293",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 74,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
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
          "Event": {
            "f": {
              "Sequence": {
                "t": 6
              },
              "ReceivedTime": {
                "t": 6
              }
            }
          },
          "Activity": {
            "f": {
              "Duration": {
                "t": 6
              },
              "Count": {
                "t": 6
              },
              "AggMode": {
                "t": 6
              }
            }
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "App": {
        "Name": "Teams",
        "Platform": "Web",
        "Version": "1415/25101616511"
      },
      "Event": {
        "Contract": "Office.System.Activity",
        "Sequence": 49,
        "Source": "OneDS",
        "Time": "2025-11-07T19:38:53.173Z",
        "Name": "Office_AugLoop_Client_WebSocketWorker",
        "ReceivedTime": 1762544333173
      },
      "Release": {
        "AudienceGroup": "Dogfood",
        "Channel": "general"
      },
      "Session": {
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "Browser": {
        "Name": "Chrome"
      },
      "ALSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187",
      "Data": {
        "DocSessionId": "86385b2c-6220-49d9-8b73-98d308f70586",
        "ResourceId": "OnClose",
        "ResultDescription": "code: 1006. reason: ",
        "Dimension0": "0",
        "ServerSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187"
      },
      "Activity": {
        "Duration": 335430000,
        "Count": 1,
        "AggMode": 2,
        "Success": true
      }
    }
  }
  {
    "name": "Office_AugLoop_Client_WebSocketReliabilityManager",
    "time": "2025-11-07T19:38:53.176Z",
    "ver": "4.0",
    "iKey": "o:3de4087d4de34817b1c376e3d1e6e293",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 75,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
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
          "Event": {
            "f": {
              "Sequence": {
                "t": 6
              },
              "ReceivedTime": {
                "t": 6
              }
            }
          },
          "Activity": {
            "f": {
              "Duration": {
                "t": 6
              },
              "Count": {
                "t": 6
              },
              "AggMode": {
                "t": 6
              }
            }
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "App": {
        "Name": "Teams",
        "Platform": "Web",
        "Version": "1415/25101616511"
      },
      "Event": {
        "Contract": "Office.System.Activity",
        "Sequence": 50,
        "Source": "OneDS",
        "Time": "2025-11-07T19:38:53.176Z",
        "Name": "Office_AugLoop_Client_WebSocketReliabilityManager",
        "ReceivedTime": 1762544333176
      },
      "Release": {
        "AudienceGroup": "Dogfood",
        "Channel": "general"
      },
      "Session": {
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "Browser": {
        "Name": "Chrome"
      },
      "ALSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187",
      "Data": {
        "ResultDescription": "close",
        "ResultSignature": "ping",
        "ServerSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187"
      },
      "Activity": {
        "Duration": 0,
        "Count": 1,
        "AggMode": 2,
        "Success": true
      }
    }
  }
  {
    "name": "Office_AugLoop_Client_NetworkRateControllerClose",
    "time": "2025-11-07T19:38:53.178Z",
    "ver": "4.0",
    "iKey": "o:3de4087d4de34817b1c376e3d1e6e293",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 76,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
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
          "Event": {
            "f": {
              "Sequence": {
                "t": 6
              },
              "ReceivedTime": {
                "t": 6
              }
            }
          },
          "Activity": {
            "f": {
              "Duration": {
                "t": 6
              },
              "Count": {
                "t": 6
              },
              "AggMode": {
                "t": 6
              }
            }
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "App": {
        "Name": "Teams",
        "Platform": "Web",
        "Version": "1415/25101616511"
      },
      "Event": {
        "Contract": "Office.System.Activity",
        "Sequence": 51,
        "Source": "OneDS",
        "Time": "2025-11-07T19:38:53.178Z",
        "Name": "Office_AugLoop_Client_NetworkRateControllerClose",
        "ReceivedTime": 1762544333178
      },
      "Release": {
        "AudienceGroup": "Dogfood",
        "Channel": "general"
      },
      "Session": {
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "Browser": {
        "Name": "Chrome"
      },
      "ALSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187",
      "Data": {
        "DocSessionId": "86385b2c-6220-49d9-8b73-98d308f70586",
        "Dimension3": "networkMode: 0",
        "ServerSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187"
      },
      "Activity": {
        "Duration": 3000,
        "Count": 1,
        "AggMode": 2,
        "Success": true
      }
    }
  }
  {
    "name": "Office_AugLoop_Client_SessionState",
    "time": "2025-11-07T19:38:53.180Z",
    "ver": "4.0",
    "iKey": "o:3de4087d4de34817b1c376e3d1e6e293",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 77,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
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
          "Event": {
            "f": {
              "Sequence": {
                "t": 6
              },
              "ReceivedTime": {
                "t": 6
              }
            }
          },
          "Activity": {
            "f": {
              "Duration": {
                "t": 6
              },
              "Count": {
                "t": 6
              },
              "AggMode": {
                "t": 6
              }
            }
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "App": {
        "Name": "Teams",
        "Platform": "Web",
        "Version": "1415/25101616511"
      },
      "Event": {
        "Contract": "Office.System.Activity",
        "Sequence": 52,
        "Source": "OneDS",
        "Time": "2025-11-07T19:38:53.179Z",
        "Name": "Office_AugLoop_Client_SessionState",
        "ReceivedTime": 1762544333179
      },
      "Release": {
        "AudienceGroup": "Dogfood",
        "Channel": "general"
      },
      "Session": {
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "Browser": {
        "Name": "Chrome"
      },
      "ALSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187",
      "Data": {
        "ResourceId": "New state: Disconnected",
        "ResultDescription": "Previous state: Running",
        "ResultSignature": "undefined",
        "Dimension0": "Attempted state: Disconnected",
        "ServerSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187"
      },
      "Activity": {
        "Duration": 334848000,
        "Count": 1,
        "AggMode": 2,
        "Success": true
      }
    }
  }
  {
    "name": "Office_AugLoop_Client_WebSocketWorker",
    "time": "2025-11-07T19:38:53.385Z",
    "ver": "4.0",
    "iKey": "o:3de4087d4de34817b1c376e3d1e6e293",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 78,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
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
          "Event": {
            "f": {
              "Sequence": {
                "t": 6
              },
              "ReceivedTime": {
                "t": 6
              }
            }
          },
          "Activity": {
            "f": {
              "Duration": {
                "t": 6
              },
              "Count": {
                "t": 6
              },
              "AggMode": {
                "t": 6
              }
            }
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "App": {
        "Name": "Teams",
        "Platform": "Web",
        "Version": "1415/25101616511"
      },
      "Event": {
        "Contract": "Office.System.Activity",
        "Sequence": 53,
        "Source": "OneDS",
        "Time": "2025-11-07T19:38:53.385Z",
        "Name": "Office_AugLoop_Client_WebSocketWorker",
        "ReceivedTime": 1762544333385
      },
      "Release": {
        "AudienceGroup": "Dogfood",
        "Channel": "general"
      },
      "Session": {
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "Browser": {
        "Name": "Chrome"
      },
      "ALSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187",
      "Data": {
        "DocSessionId": "17a7b590-607d-43a3-9d1a-245f4bffde72",
        "ResourceId": "OnClose",
        "ResultDescription": "code: 1006. reason: ",
        "Dimension0": "0",
        "ServerSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187"
      },
      "Activity": {
        "Duration": 335638000,
        "Count": 1,
        "AggMode": 2,
        "Success": true
      }
    }
  }
  {
    "name": "Office_AugLoop_Client_WebSocketReliabilityManager",
    "time": "2025-11-07T19:38:53.386Z",
    "ver": "4.0",
    "iKey": "o:3de4087d4de34817b1c376e3d1e6e293",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 79,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
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
          "Event": {
            "f": {
              "Sequence": {
                "t": 6
              },
              "ReceivedTime": {
                "t": 6
              }
            }
          },
          "Activity": {
            "f": {
              "Duration": {
                "t": 6
              },
              "Count": {
                "t": 6
              },
              "AggMode": {
                "t": 6
              }
            }
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "App": {
        "Name": "Teams",
        "Platform": "Web",
        "Version": "1415/25101616511"
      },
      "Event": {
        "Contract": "Office.System.Activity",
        "Sequence": 54,
        "Source": "OneDS",
        "Time": "2025-11-07T19:38:53.386Z",
        "Name": "Office_AugLoop_Client_WebSocketReliabilityManager",
        "ReceivedTime": 1762544333386
      },
      "Release": {
        "AudienceGroup": "Dogfood",
        "Channel": "general"
      },
      "Session": {
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "Browser": {
        "Name": "Chrome"
      },
      "ALSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187",
      "Data": {
        "ResultDescription": "close",
        "ResultSignature": "ping",
        "ServerSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187"
      },
      "Activity": {
        "Duration": 0,
        "Count": 1,
        "AggMode": 2,
        "Success": true
      }
    }
  }
  {
    "name": "Office_AugLoop_Client_NetworkRateControllerClose",
    "time": "2025-11-07T19:38:53.387Z",
    "ver": "4.0",
    "iKey": "o:3de4087d4de34817b1c376e3d1e6e293",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 80,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
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
          "Event": {
            "f": {
              "Sequence": {
                "t": 6
              },
              "ReceivedTime": {
                "t": 6
              }
            }
          },
          "Activity": {
            "f": {
              "Duration": {
                "t": 6
              },
              "Count": {
                "t": 6
              },
              "AggMode": {
                "t": 6
              }
            }
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "App": {
        "Name": "Teams",
        "Platform": "Web",
        "Version": "1415/25101616511"
      },
      "Event": {
        "Contract": "Office.System.Activity",
        "Sequence": 55,
        "Source": "OneDS",
        "Time": "2025-11-07T19:38:53.387Z",
        "Name": "Office_AugLoop_Client_NetworkRateControllerClose",
        "ReceivedTime": 1762544333387
      },
      "Release": {
        "AudienceGroup": "Dogfood",
        "Channel": "general"
      },
      "Session": {
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "Browser": {
        "Name": "Chrome"
      },
      "ALSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187",
      "Data": {
        "DocSessionId": "17a7b590-607d-43a3-9d1a-245f4bffde72",
        "Dimension3": "networkMode: 0",
        "ServerSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187"
      },
      "Activity": {
        "Duration": 1000,
        "Count": 1,
        "AggMode": 2,
        "Success": true
      }
    }
  }
  {
    "name": "Office_AugLoop_Client_SessionState",
    "time": "2025-11-07T19:38:53.388Z",
    "ver": "4.0",
    "iKey": "o:3de4087d4de34817b1c376e3d1e6e293",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 81,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "user": {
        "locale": "en-GB"
      },
      "web": {
        "domain": "teams.microsoft.com",
        "browser": "Chrome",
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
          "Event": {
            "f": {
              "Sequence": {
                "t": 6
              },
              "ReceivedTime": {
                "t": 6
              }
            }
          },
          "Activity": {
            "f": {
              "Duration": {
                "t": 6
              },
              "Count": {
                "t": 6
              },
              "AggMode": {
                "t": 6
              }
            }
          }
        }
      }
    },
    "data": {
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "App": {
        "Name": "Teams",
        "Platform": "Web",
        "Version": "1415/25101616511"
      },
      "Event": {
        "Contract": "Office.System.Activity",
        "Sequence": 56,
        "Source": "OneDS",
        "Time": "2025-11-07T19:38:53.388Z",
        "Name": "Office_AugLoop_Client_SessionState",
        "ReceivedTime": 1762544333388
      },
      "Release": {
        "AudienceGroup": "Dogfood",
        "Channel": "general"
      },
      "Session": {
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
      },
      "Browser": {
        "Name": "Chrome"
      },
      "ALSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187",
      "Data": {
        "ResourceId": "New state: Disconnected",
        "ResultDescription": "Previous state: Running",
        "ResultSignature": "undefined",
        "Dimension0": "Attempted state: Disconnected",
        "ServerSessionKey": "3a8af816-7edf-4d13-8968-6f6d9c3e3187"
      },
      "Activity": {
        "Duration": 334935000,
        "Count": 1,
        "AggMode": 2,
        "Success": true
      }
    }
  }
  ```
  ```json
  {
    "acc": 8
  }
  ```
- POST `https://teams.microsoft.com/ups/emea/v1/pubsub/subscriptions/b40278a3-2bec-45ac-9f15-e4c6806bed8b`
  ```json
  {
    "trouterUri": "https://pub-ent-euno-10-f.trouter.teams.microsoft.com:3443/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "shouldPurgePreviousSubscriptions": false,
    "subscriptionsToAdd": [],
    "subscriptionsToRemove": [
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
        "mri": "8:orgid:dee1afdb-9ece-4498-a506-15c6b484ac6b",
        "source": "ups",
        "status": 20200
      }
    ]
  }
  ```
- GET `https://substrate.office.com/search/api/v2/init?cvid=b3a4cf21-f9ed-4893-8fd3-1c5bd4c42859&scenario=peoplepicker.addToCall`
  ```json
  {
    "Instrumentation": {
      "TraceId": "434f054d-8d25-8598-4f9b-8f26be5155c4"
    }
  }
  ```
- GET `https://go-eu.trouter.teams.microsoft.com/?check=1762544645872&cor_id=9d3f5c8d-1360-4b67-b906-7f5ca5340ccd&epid=9f97f0fe-0079-4ff4-827f-ac8b0539837b&tc=%7B%22cv%22%3A%222025.40.01.1%22%2C%22ua%22%3A%22SkypeSpaces%22%2C%22hr%22%3A%22%22%2C%22v%22%3A%220.0.0%22%7D`
  ```json
"Trouter"
  ```
- GET `wss://pub-ent-euno-11-t.trouter.teams.microsoft.com/v4/c?tc=%7B%22cv%22:%222025.40.01.1%22,%22ua%22:%22SkypeSpaces%22,%22hr%22:%22%22,%22v%22:%220.0.0%22%7D&timeout=40&epid=9f97f0fe-0079-4ff4-827f-ac8b0539837b&ccid=jl10qtAEobw&dom=teams.microsoft.com&cor_id=9d3f5c8d-1360-4b67-b906-7f5ca5340ccd&con_num=1762544017781_0`
- POST `https://teams.microsoft.com/registrar/prod/V2/registrations`
  ```json
  {
    "clientDescription": {
      "appId": "SkypeSpacesWeb",
      "aesKey": "",
      "languageId": "en-US",
      "platform": "chrome",
      "templateKey": "SkypeSpacesWeb_2.4",
      "platformUIVersion": "0.0.0"
    },
    "registrationId": "9f97f0fe-0079-4ff4-827f-ac8b0539837b",
    "nodeId": "",
    "transports": {
      "TROUTER": [
        {
          "context": "",
          "path": "https://pub-ent-euno-11-f.trouter.teams.microsoft.com:3443/v4/f/tKU-KRZQD0qjl10qtAEobw/",
          "ttl": 3600
        }
      ]
    }
  }
  ```
- GET `https://config.edge.skype.com/config/v1/CHILL/0.0.13?disableexperiments=true&disablerollouts=false&Audience=general&BuildType=production&ClientType=web&Environment=prod&Experience=react-web-client&Language=en-gb&Platform=web&Ring=general&Os=windows&Agent=ChillTeams&TenantId=338de7e8-b10a-4a7c-aeb4-4cdf726fc818&Application=MsTeams&version=2.5.2&language=en-gb`
- GET `https://outlook.office.com/api/v2.0/me/messages?$expand=SingleValueExtendedProperties($filter=PropertyId%20eq%20%27Integer%20{00020328-0000-0000-c000-000000000046}%20Id%200x6801%27%20or%20PropertyId%20eq%20%27String%20{00020386-0000-0000-c000-000000000046}%20Name%20X-VoiceMessageConfidenceLevel%27%20or%20PropertyId%20eq%20%27String%20{00020386-0000-0000-c000-000000000046}%20Name%20X-VoiceMessageTranscription%27)&$top=30&$select=From,Body,IsRead,Id,ReceivedDateTime,InternetMessageHeaders&$filter=(SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.Microsoft.Voicemail.UM.CA%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.rpmsg.Microsoft.Voicemail.UM.CA%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.rpmsg.Microsoft.Voicemail.UM%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.Microsoft.Exchange.Voice.UM.CA%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.Microsoft.Voicemail.UM%27)%20or%20SingleValueExtendedProperties/Any(ep:%20ep/PropertyId%20eq%20%27String%200x1a%27%20and%20ep/Value%20eq%20%27IPM.Note.Microsoft.Exchange.Voice.UM%27))%20and%20parentFolderId%20ne%20%27deleteditems%27`
  ```json
  {
    "value": []
  }
  ```
- POST `https://eu-teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "scenarions",
    "time": "2025-11-07T19:50:51.207Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 82,
        "epoch": "3692008002"
      },
      "app": {
        "sesId": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd"
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
        "SpanId": "9556a11d007b3557",
        "isNS": "true"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "fetch_voicemails",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"useUpdatedGetVoicemailsPath\",\"delta\":1,\"elapsed\":1057219,\"sequence\":1,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":329,\"elapsed\":1057547,\"sequence\":2,\"stepDelta\":328,\"previousStep\":\"useUpdatedGetVoicemailsPath\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"commandSource\":\"CDLWorker\"},{\"commandSource\":\"CDLWorker\",\"callingDataBag\":\"{\\n    \\\"isOwnMailbox\\\": true,\\n  }\"}]"
      },
      "InstanceId": "9dff0ff3-f31b-4e02-b5d6-5a208ecf6cba",
      "delta": "329",
      "elapsed": "1057547",
      "sequence": "2",
      "stepDelta": "328",
      "previousStep": "useUpdatedGetVoicemailsPath",
      "commandSource": "CDLWorker",
      "callingDataBag": "{\n    \"isOwnMailbox\": true,\n  }",
      "isInEst": "false",
      "sampleCohortUserId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
      "sampleCohortValue": 2.0353,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "865f6c26-5860-45f5-84f4-c8b8e6bd194f"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "embed",
        "Id": "9d3f5c8d-1360-4b67-b906-7f5ca5340ccd",
        "TelemetryContext": "web"
      },
      "AppInfo": {
        "ClientType": "cdlworker",
        "ProcessArchitecture": "x64",
        "Language": "en-us",
        "Locale": "en-us",
        "PlatformId": "1415",
        "Version": "1415/25101616511",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25101616511",
        "ReactAppVersion": "1415/25101616511",
        "ExperienceName": "react-web-client",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ClientState": "Inactive",
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
