# Teams HTTPS Protocol - Join URL

When loading the Microsoft Teams website and joining a meeting via a URL, the following HTTPS requests were made:
- GET `https://teams.microsoft.com/favicon.ico`
- POST `https://teams.microsoft.com/api/authsvc/v1.0/authz/visitor`
  ```json
  {
    "tokens": {
      "skypeToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxOUQzMTYyMzQ0RTQ4REEwNUU1OUQxMzYwNkYwQkFDRjU4QTQwRUMiLCJ4NXQiOiJBWjB4WWpST1NOb0Y1WjBUWUc4THJQV0tRT3ciLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3NjMxNTEzMjMsImV4cCI6MTc2MzIzNzcyMywic2t5cGVpZCI6InRlYW1zdmlzaXRvcjo3NjUyMDk2ZTliNjE0MTM2OTZmMWZlMmM3NTZjODc1OSIsInNjcCI6NzgwLCJjc2kiOiIxNzYzMTUxMzIzIiwicmduIjoiZW1lYSJ9.VY8ocO7ztPxy7WmZAtyTAbZr_WO5GR-V0NUPz-kOsDAWnOzNa6oq9EsxILsTjPHLR1EgMlyCnIDQAnyD0iR4pjjrHxYLRQQ5WWIwPJSAFJqQugRnQU-VWt87F_1gydp_KPhimqIesjzBE6IMdt7SywjNMm8LkW4bzBC8uN-sPTM8tNHlEjj0zik06R_kIRndjVHglCkFB4j4UbyDresXxp-gx2uz55sfJf1mMlL8gkYeLieTa3sZ-X6hCLoKe2t8RFy_ivgAUhcbf_6FtAn86uXB-VQZi0g5LhCpdzx002dGQh_xsAnu09z45Zrd66RpCrh2uAc4poobdsbrLJewpA",
      "expiresIn": 86399,
      "tokenType": "SkypeToken"
    },
    "region": "emea",
    "partition": "emea01",
    "regionGtms": {
      "ams": "https://eu-api.asm.skype.com",
      "amsV2": "https://eu-prod.asyncgw.teams.microsoft.com",
      "amsS2S": "https://eu-storage.asm.skype.com:444",
      "appsDataLayerService": "https://teams.microsoft.com/datalayer/emea",
      "appsDataLayerServiceS2S": "https://deletion-svc-emea.datalayer.teams.microsoft.com",
      "appMonetizationService": "https://monet.teams.microsoft.com/eu",
      "calling_callControllerServiceUrl": "https://emea.cc.skype.com",
      "calling_callStoreUrl": "https://api-emea.flightproxy.teams.microsoft.com/api/v2/ep/api.userstore.skype.com/",
      "calling_conversationServiceBaseUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/api.conv.skype.com",
      "calling_conversationServiceUrl": "https://api-emea.flightproxy.teams.microsoft.com/api/v2/epconv",
      "calling_conversationServiceCaptchaUrl": "https://api-emea.flightproxy.teams.microsoft.com/api/v2/ep/api.conv.skype.com/captcha",
      "calling_keyDistributionUrl": "https://api-emea.flightproxy.teams.microsoft.com/kd",
      "calling_pluginlessAriaCollectorUri": "https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/",
      "calling_potentialCallRequestUrl": "https://api-emea.flightproxy.teams.microsoft.com/api/v2/ep/emea.cc.skype.com/cc/v1/potentialcall",
      "calling_registrarUrl": "https://teams.microsoft.com/registrar/prod/V2/registrations",
      "calling_sharedLineOptionsUrl": "https://api-emea.flightproxy.teams.microsoft.com/api/v2/ep/emea.cc.skype.com/cc/v1/sharedLineAppearance",
      "calling_slimCoreAriaCollectorUri": "https://eu-mobile.events.data.microsoft.com/Collector/3.0/",
      "calling_trouterUrl": "https://go-eu.trouter.teams.microsoft.com/v3/c",
      "calling_udpTransportUrl": "udp://api-emea.flightproxy.teams.microsoft.com:3478",
      "calling_uploadLogRequestUrl": "https://api-emea.flightproxy.teams.microsoft.com/api/v2/ep/emea.cc.skype.com/cc/v1/uploadlog/",
      "callingS2S_Broker": "https://api.broker.skype.com",
      "callingS2S_CallController": "https://api3.cc.skype.com",
      "callingS2S_CallStore": "https://api.userstore.skype.com/",
      "callingS2S_ContentSharing": "https://api.css.skype.com/contentshare/",
      "callingS2S_ConversationService": "https://api.conv.skype.com/conv/",
      "callingS2S_EnterpriseProxy": "https://api.flightproxy.teams.microsoft.com",
      "callingS2S_LyncGateway2": "https://sip2.lgw.skype.com",
      "callingS2S_MediaController": "https://api.mc.skype.com/media/v2/conversations",
      "callingS2S_PlatformMediaAgent": "https://pma.plat.skype.com/platform/v1/incomingcall",
      "chatService": "https://emea.ng.msg.teams.microsoft.com",
      "chatServiceAfd": "https://teams.microsoft.com/api/chatsvc/emea",
      "chatServiceS2S": "https://emea.msgapi.teams.microsoft.com:444",
      "messagingFrontEndS2S": "https://emea.msgapi.teams.microsoft.com:444",
      "fassEnterprise": "https://emea.commercial.messaging.fraud.microsoft.com",
      "drad": "https://eu.msdrad.skype.com/",
      "mailhookS2S": "https://emea.mailhook.teams.internal.office.com",
      "middleTier": "https://teams.microsoft.com/api/mt/emea",
      "middleTierS2S": "https://emea01.public.mt.teams.internal.office.com",
      "appService": "https://teams.microsoft.com/api/apps/part/emea-01",
      "appServiceS2S": "https://emea01.public.apps.teams.internal.office.com",
      "mtImageService": "https://teams.microsoft.com/api/mt/emea",
      "peopleProfileService": "https://teams.microsoft.com/api/ppsvc/emea-01",
      "peopleProfileServiceS2S": "https://emea.prod.ppsvc.teams.internal.office.com",
      "permissionService": "https://emea.permission.teams.microsoft.com:8443",
      "powerPointStateService": "https://emea.pptservicescast.officeapps.live.com",
      "search": "https://eu-prod.asyncgw.teams.microsoft.com/msgsearch",
      "searchTelemetry": "https://eu-prod.asyncgw.teams.microsoft.com/msgsearch",
      "settingsStoreS2S": "https://emea.settings.teams.internal.office.com/v1.0/settings/teams",
      "teamsAndChannelsService": "https://teams.microsoft.com/api/mt/emea",
      "teamsAndChannelsProvisioningService": "https://teams.microsoft.com/fabric/emea/templates/api",
      "teamsAndChannelsProvisioningServiceS2S": "https://emea.prod.templates.taco.teams.internal.office.com/api",
      "urlp": "https://urlp.asm.skype.com",
      "urlpV2": "https://eu-prod.asyncgw.teams.microsoft.com/urlp",
      "unifiedPresence": "https://presence.teams.microsoft.com",
      "userDiscoveryService": "https://emea.userdiscovery.teams.microsoft.com",
      "userEntitlementService": "https://teams.microsoft.com/api/ues/emea",
      "userIntelligenceService": "https://teams.microsoft.com/api/nss/emea",
      "userProfileService": "https://teams.microsoft.com/api/userprofilesvc/emea",
      "userProfileServiceS2S": "https://userprofilesvc-emea.teams.microsoft.com",
      "amdS2S": "https://eu-distr.asm.skype.com:444",
      "chatServiceAggregator": "https://chatsvcagg.teams.microsoft.com",
      "chatSvcAggS2S": "https://emea.csa.svcs.teams.office.com",
      "chatSvcAggAfd": "https://teams.microsoft.com/api/csa/emea",
      "teamsPushServiceAfd": "https://teams.microsoft.com/api/tps/emea",
      "tmsgMigrationSvcS2S": "https://emea.teamsmessagingmigration.teams.internal.office.com",
      "ehrConnector": "https://emea-vaprocessor.teams.internal.office.com",
      "deviceManagementS2S": "https://devicemgmt.teams.microsoft.com",
      "tacBootstrapService": "https://admin.teams.microsoft.com",
      "tamsS2S": "https://eu.tams.teams.microsoft.com:20443",
      "teamsDevPortal": "https://dev.teams.microsoft.com/emea",
      "virtualVisitsMeetingUpdatesService": "https://healthcare.teams.microsoft.com/virtualvisitsmeetingupdates-svc/emea",
      "ipPolicyService": "https://eu.ippolicyservice.teams.microsoft.com",
      "ipCoreServiceS2S": "https://eu.ipcore.teams.microsoft.com",
      "substrateSyncS2S": "https://emea.substratesync.teams.microsoft.com",
      "auditServiceS2S": "https://eu.auditservice.teams.microsoft.com",
      "notificationFilteringService": "https://mstntfsfilteringservice-emea.teams.microsoft.com",
      "teamsAnalyticsSvc": "https://emea.tas.teams.microsoft.com",
      "teamsAdminGatewaySvc": "https://emea.tags.teams.microsoft.com",
      "teamsEventsIntegration": "https://public-eur.mkt.dynamics.com",
      "appsSuggestionService": "https://prod.appsuggestions.teams.cloud.microsoft/emea/api",
      "virtualEventsService": "https://teams.microsoft.com/api/teamsevents/eu",
      "cmdArtifactsService": "https://teams.microsoft.com/api/artifacts/eu",
      "mcpService": "https://teams.microsoft.com/api/mcps/eu",
      "mwtEntitlement": "https://emea.vamonetization.teams.microsoft.com",
      "frontlineWorkerOrchestratorService": "https://flworchestrator.teams.microsoft.com/emea",
      "frontlineWorkerOrchestratorServiceS2S": "https://emea.flworchestrator.teams.internal.office.com",
      "mwtUserEngagementService": "https://emea.userengagement.verticals.teams.microsoft.com/api",
      "virtualVisitsBookings": "https://healthcare.teams.microsoft.com/scheduler-svc/emea",
      "acmInsightsSvc": "https://collabinsights.teams.cloud.microsoft/emea",
      "acmInsightsSvcS2S": "https://emea.security.itpro.teams.microsoft.com:23444",
      "runtimeAPI": "https://emea.directory.teams.microsoft.com",
      "tdmService": "https://teams.cloud.microsoft/api/byod/emea",
      "biometricService": "https://teams.microsoft.com/api/biometric/eu",
      "iC3LocationService": "https://teams.cloud.microsoft/loc/emea",
      "presenceUPS": "https://teams.microsoft.com/ups/emea",
      "teamsMonetizationService": "https://eu.monet.teams.microsoft.com:8854/api",
      "calling_TeamsCopilotAggregatorUrl": "https://teams.cloud.microsoft/api/tca/emea/api/v1",
      "eduGRGServiceUrl": "https://gateway.eu.schoolapp.microsoft.com",
      "teamsAdminPortal": "https://eu-admin-dev.teams.microsoft.net",
      "acmService": " https://substrate.office.com/AdminAppCatalog",
      "immersiveWorldsService": "https://eur.worlds.mesh.cloud.microsoft",
      "dgjTrustModelSvc": "https://teams.microsoft.com/api/trustmodel/eu",
      "teamsAdminMTASvc": "https://emea01.monitoringplatform.teams.microsoft.com",
      "teamsAdminMTAApiS2S": "https://emea01.monitoringplatform.teams.microsoft.com",
      "tdmDeviceService": "https://teams.cloud.microsoft/api/devices/emea",
      "signatureService": "NA"
    },
    "regionSettings": {
      "isUnifiedPresenceEnabled": true,
      "isOutOfOfficeIntegrationEnabled": true,
      "isContactMigrationEnabled": true,
      "isAppsDiscoveryEnabled": true,
      "isFederationEnabled": true
    },
    "licenseDetails": {
      "isFreemium": false,
      "isBasicLiveEventsEnabled": false,
      "isTrial": false,
      "exploratoryTrialLicenseEndDate": null,
      "isAudioConf": false,
      "isAdvComms": false,
      "isTranscriptEnabled": false,
      "isWebinarEnabled": false,
      "eduLicenseSkuAndCategory": null,
      "isTPProtection": false,
      "isTPCustomization": false,
      "isTPManagement": false,
      "isTPWebinar": false,
      "isTPVirtualAppointments": false,
      "isInfoProtectionPremium": false,
      "isTeamsEnabled": false,
      "isTeamsPhonePremium": false,
      "isTeamsPremiumSelfAssigned": false,
      "isCopilot": false,
      "isM365CopilotBusinessChat": false,
      "isCopilotApps": false,
      "isAvatarsEnabled": false,
      "appSwitcherBusinessLicenseCategory": null,
      "isTeamsSmb": false,
      "isTeamsSharedDevices": false,
      "hasOnlyTeamsSharedDevices": false,
      "isTeamsDeviceManagementEnabled": false,
      "isPrivacyDataControlEnabled": false,
      "isImmersiveSpacesEnabled": false,
      "isMixedRealityShare": false,
      "isMicrosoftMeshEnabled": false,
      "experimentationTeamsLicenseCategories": null,
      "experimentationTeamsAddOnPlans": null,
      "meetingRoomLicenseCategories": null,
      "isFrontline": false,
      "isMicrosoftPlanner": false,
      "isPlacesEnhancedEnabled": false
    }
  }
  ```
- GET `https://config.teams.microsoft.com/config/v1/MicrosoftTeams/1415_1.0.0.0?environment=prod&experience=light-meetings&buildType=production&virtualization=&browser=chrome&browserVersion=141.0.7390.67&osPlatform=windows&isOcdi=false&isPwa=false&experienceBuild=25110306401&sessionId=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&clientId=cbc2527f-51c4-40d2-a967-525b03f63e7f&resourceId=19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2&agents=TeamsNorthstar,TeamsBuilds,Segmentation&ECSCanary=1`
  ```json
  {
    "ECS": {
      "ConfigLogTarget": "default",
      "c72ea287-ed77-4fa6-a480-3712406c367e": "aka.ms/EcsCanary"
    },
    "Segmentation": {
      "DataDonationDisabledGroups": "false",
      "EDPSTenants": "false",
      "EliteUsers": "false",
      "M365CopilotPPVAll": "false",
      "M365ChatAllow": "false",
      "EarlyR2Ring": "false",
      "IsInternalUser": "false",
      "VirtualizationEnabled": "false",
      "TeamsRing": "general",
      "MWWhilteListedUser": "false",
      "Cloud": "Public",
      "AudienceGroup": "general"
    },
    "TeamsBuilds": {
      "BuildSettings": {
        "Communicator": {
          "BuildVersion": "2025102704"
        },
        "CustomerServiceChatbot": {
          "BuildVersion": "2025102302"
        },
        "ReactWebClient": {
          "CriticalVersion": "25040319113",
          "BuildVersion": "25101616511"
        },
        "MetaosStore": {
          "BuildVersion": "25100213809"
        },
        "WebView2PreAuth": {
          "x64": {
            "latestVersion": "25290.205.4069.4894",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x64/25290.205.4069.4894/MSTeams-x64.msix"
          },
          "x86": {
            "latestVersion": "25290.205.4069.4894",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x86/25290.205.4069.4894/MSTeams-x86.msix"
          },
          "arm64": {
            "latestVersion": "25290.205.4069.4894",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-arm64/25290.205.4069.4894/MSTeams-arm64.msix"
          }
        },
        "MeetingRoom": {
          "BuildVersion": "25081500722"
        },
        "WebView2": {
          "macOS": {
            "latestVersion": "25290.302.4044.3989",
            "buildLink": "https://installer.teams.static.microsoft/production-osx/25290.302.4044.3989/MicrosoftTeams.pkg"
          },
          "x64": {
            "latestVersion": "25198.1112.3855.2900",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x64/25198.1112.3855.2900/MicrosoftTeams-x64.msix"
          },
          "x86": {
            "latestVersion": "25198.1112.3855.2900",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x86/25198.1112.3855.2900/MicrosoftTeams-x86.msix"
          },
          "arm64": {
            "latestVersion": "25198.1112.3855.2900",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-arm64/25198.1112.3855.2900/MicrosoftTeams-arm64.msix"
          }
        },
        "WebView2Canary": {
          "macOS": {
            "latestVersion": "25290.302.4044.3989",
            "buildLink": "https://installer.teams.static.microsoft/production-osx/25290.302.4044.3989/MicrosoftTeams.pkg"
          },
          "x64": {
            "latestVersion": "25290.205.4069.4894",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x64/25290.205.4069.4894/MSTeams-x64.msix"
          },
          "x86": {
            "latestVersion": "25290.205.4069.4894",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x86/25290.205.4069.4894/MSTeams-x86.msix"
          },
          "arm64": {
            "latestVersion": "25290.205.4069.4894",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-arm64/25290.205.4069.4894/MSTeams-arm64.msix"
          }
        },
        "Calendar": {
          "BuildVersion": "24090523600"
        },
        "Desktop": {
          "windows64": {
            "criticalVersion": "1.4.00.0",
            "minimumVersion": "1.5.00.616",
            "latestVersion": "1.8.00.27654"
          },
          "windows": {
            "criticalVersion": "1.4.00.0",
            "minimumVersion": "1.5.00.616",
            "latestVersion": "1.8.00.27654"
          },
          "osx": {
            "criticalVersion": "1.0.00.25152",
            "minimumVersion": "1.1.00.29053",
            "latestVersion": "1.8.00.27652"
          },
          "linux": {
            "criticalVersion": "1.2.00.24252",
            "minimumVersion": "1.2.00.26154",
            "latestVersion": "1.5.00.23861"
          },
          "arm64": {
            "latestVersion": "1.8.00.27654"
          }
        },
        "Web": {
          "SettingsOverride": {
            "minimumViableWebClientVersion": "1.0.2021030227"
          },
          "BuildVersion": "1.0.0.2025070703"
        },
        "JoinLauncher": {
          "BuildVersion": 2025100201
        },
        "Meeting": {
          "BuildVersion": "23070307300"
        },
        "ShareToTeams": {
          "BuildVersion": "25082114607"
        },
        "MeetingOptions": {
          "BuildVersion": "25082114604"
        },
        "LmsIntegration": {
          "BuildVersion": "25091116007"
        },
        "EmbedClient": {
          "BuildVersion": "25091807904"
        },
        "ExtensibilityApps": {
          "BuildVersion": "25041008300"
        },
        "CallingEmbed": {
          "BuildVersion": "21080507600"
        },
        "BroadcastPlayer": {
          "BuildVersion": "20201118008"
        },
        "WebinarRegistration": {
          "BuildVersion": "23022116000"
        },
        "Convene": {
          "BuildVersion": "25100213808"
        }
      }
    },
    "TeamsNorthstar": {
      "messaging": {
        "enableMessageBotMetadata": true,
        "enablePunyEncodedUrl": true,
        "atpCdnAssetsPath": "/evergreen-assets/safelinks/2/atp-safelinks.html",
        "enableGroupCopilotInteraction": true,
        "useTeamsCopilotServicePlanForGroupCopilot": true,
        "groupCopilotControlMessageBotActions": [],
        "overrideGroupCopilotControlMessageBotActions": true,
        "enableGroupCopilotForNewChat": false,
        "enableGroupCopilotDynamicSuggestedActionsInControlMessage": true,
        "enableGroupCopilotDynamicSuggestedPromptsInCompose": true,
        "disableGroupCopilotMeetingChatHistoryCheck": true,
        "enableUnfurlFluidAutoEmbedLink": true,
        "enableGroupCopilotPartialAccessHistoryBanner": true,
        "enableChatIdValidationOnPin": true,
        "enableEndpointsManagerForImageProxyService": true,
        "enableFetchSmartNavigatorFromCSA": true,
        "enableSelfChatAutoPin": true,
        "enableGiphyInClipboard": true,
        "enableMessageActivityReading": true,
        "enableGroupChatInviteFlow": true,
        "expandedReactionsConfigs": {
          "chat": {
            "enableSend": true,
            "enableReceive": true,
            "overflowAfter": 5
          },
          "channel": {
            "enableSend": true,
            "enableReceive": true,
            "overflowAfter": 5
          },
          "summaryStyle": "bubble"
        },
        "enableFlatHtmlInsertInEditor": true,
        "enableMentionsRework": true,
        "enableEndpointsManagerOnUrlPreviewService": true,
        "enableEndpointsManagerOnGiphyService": true,
        "enableDeleteChat": true
      },
      "calling": {
        "enableBotDetection": true,
        "botDetectionTenantIdAllowedList": [
          "e35b9fa6-7766-43c5-a101-43d693d9733d",
          "194fe696-96c8-4488-88d5-6d5e6002bd85"
        ],
        "callingConstants": {
          "ui": {
            "blacklistedBots": [
              "28:bdd75849-e0a6-4cce-8fc1-d7c0d4da43e5",
              "28:4b25d9f8-18f5-4d09-a582-cd0a28f63181",
              "28:07331c9d-bd9a-4d00-bb00-9dcacd105691",
              "28:123425f9-0c72-4bd8-8814-7cb6b02dfc3f",
              "28:4be36d18-a394-4f94-ad18-fb20df412d7a",
              "28:4c072661-d231-483f-b32c-2d305791d32d",
              "28:e8f1f4bd-f39c-479f-8885-a69ded583534",
              "28:ae05be75-6c5a-47c0-97b8-8c84fd83880d",
              "28:0a18c351-466c-4293-87eb-7b08a096b0a1",
              "28:4c1a6ff1-c702-4652-9991-e0b36d310d19",
              "28:b1902c3e-b9f7-4650-9b23-5772bd429747",
              "4:*13",
              "28:f4693563-c70b-4e4d-bda6-01792aa21440",
              "28:e32c9418-a835-4eb1-bfb9-733fa74dd6e8",
              "28:cebb622a-9099-475d-9f85-0413cf0b19c7",
              "28:38b34208-9db4-425d-91e5-6f201eeaef40",
              "28:9cd07db6-fab5-438c-8e34-44117fac7650",
              "28:ab5d1521-415b-4380-82e4-af803fb8bf2d",
              "28:a8011016-05a6-4f6e-b2b3-26543cf329a0",
              "28:556b15e7-452c-4773-b728-6313eaa47b77",
              "28:b102ccd8-1925-448b-90a7-b083aba25074",
              "28:3d59cb08-f597-4e49-9add-a05f9735152b",
              "28:8cf0f6d9-65dc-464b-a2cb-8f66a9767358",
              "28:b5738585-9037-4ebd-8c03-d9a8bdbb537d",
              "28:gcch-global:b5738585-9037-4ebd-8c03-d9a8bdbb537d",
              "28:9fe5a0d5-c286-41f1-a014-67c755902881",
              "28:gcch-global:9fe5a0d5-c286-41f1-a014-67c755902881",
              "28:494c14c2-d8bb-41e7-b463-4dd17c3fda60",
              "28:dod-global:494c14c2-d8bb-41e7-b463-4dd17c3fda60",
              "28:e9989ac1-1203-4f1e-a716-07abc621a240",
              "28:dod-global:e9989ac1-1203-4f1e-a716-07abc621a240",
              "28:e164356d-e1d1-4ba5-8001-4cc9abc717ba",
              "28:d123a3e6-7f0a-4bbd-91f2-6d0ad1707297",
              "28:d29ade6f-9257-45cb-883c-01ad3a6f6d20",
              "28:c733a6ab-69c4-4b1d-b660-60048c4dce2f",
              "28:56aa0a8f-4cd3-446b-8146-0023476a5ff2",
              "28:bf9a6ad5-ccd4-4c41-ba31-87e67b045a9a",
              "28:0235a40d-f7c9-4028-a32b-13a50dd6e2fa",
              "28:30f2ee85-68d2-40a0-9fcd-3e4a759c8c34",
              "28:b8cd536a-fe8e-4088-a5b8-e298cc3f2577",
              "28:bfa8d8c3-fa5e-4ee9-88f5-ffce728a797c",
              "28:4062df8b-5499-49a2-abe0-29ad866b2c04",
              "28:6b45c5b6-1c34-47c0-8980-11e98d47d23f",
              "28:c78e4215-e66c-4a70-8964-74992656de25",
              "28:8133db4c-c049-4346-9edd-273f164a9227",
              "28:gal-global:5f950626-8b3f-41ef-bb7e-3af032f46ee7",
              "28:7cbe7d58-04af-48aa-b9f8-b64f99ee1f9e",
              "28:5f2511f1-6da9-41d9-80d9-af7da23a2c27",
              "28:f16efa36-abce-40e9-9e69-8540952a0133",
              "28:accb0009-8d12-4cfe-969c-39b204e3ed0c",
              "28:0ad9717e-76fd-4658-a764-beaf21698977"
            ]
          }
        },
        "enableUpdateMeetingSettingsOnGCP": true,
        "enableWatermarkForAnonymousAttendees": true,
        "enableFluentV9TreeInRoster": true,
        "skipLIMEForTenants": [
          "9eab1974-31cc-4aa8-8ba7-c8943c73f995",
          "5bbab28c-def3-4604-8822-5e707da8dba8",
          "f345bebf-0d71-4337-9281-24b941616c36",
          "e0793d39-0939-496d-b129-198edd916feb",
          "4f8dfe4e-5d74-4f20-aa14-4f99af3d868d",
          "d73a39db-6eda-495d-8000-7579f56d68b7",
          "d4f3d950-3f42-4ac0-a9c6-1411fae9fbc7",
          "4d12e360-156d-42f9-aaf3-b889ca648aba",
          "2596038f-3ea4-4f0c-aed1-066eb6544c3b",
          "ff4abfe9-83b5-4026-8b8f-fa69a1cad0b8",
          "5fe7edeb-0b8e-4383-a697-ff6218746793",
          "2640efc8-1603-49c5-b70c-71dc09f3c4b4",
          "dabca8ef-5a5f-4128-8834-ddd4693375ef",
          "40a9e940-a5cd-47d6-b980-4f2f6acfdcd0",
          "99ef90fc-6e45-47a4-ae28-3916483dc9f2",
          "39b03722-b836-496a-85ec-850f0957ca6b"
        ],
        "spokenLanguages": [
          "ar-ae",
          "ar-sa",
          "da-dk",
          "de-de",
          "en-au",
          "en-ca",
          "en-gb",
          "en-in",
          "en-nz",
          "en-us",
          "es-es",
          "es-mx",
          "fi-fi",
          "fr-ca",
          "fr-fr",
          "hi-in",
          "is-is",
          "it-it",
          "ja-jp",
          "ko-kr",
          "ms-my",
          "mt-mt",
          "nb-no",
          "nl-be",
          "nl-nl",
          "pl-pl",
          "pt-br",
          "ru-ru",
          "sv-se",
          "zh-cn",
          "zh-hk",
          "cs-cz",
          "pt-pt",
          "tr-tr",
          "vi-vn",
          "th-th",
          "he-il",
          "uk-ua",
          "el-gr",
          "hu-hu",
          "ro-ro",
          "sk-sk",
          "sq-al",
          "zh-tw",
          "cy-gb",
          "de-ch",
          "ca-es",
          "lt-lt",
          "bg-bg",
          "lv-lv",
          "et-ee",
          "hr-hr",
          "sl-si",
          "id-id",
          "sr-rs"
        ],
        "meetingJoinKnownBotNames": "{\"FF\":\"^Fireflies Notetaker\", \"RE\":\"^read[.]ai meeting notes$\", \"OT\":\"Notetaker [(]Otter[.]ai[)]$\", \"NO\":\"^Notta Bot$\", \"MG\":\"MeetGeek Notetaker|Bot|VA|Assistant$\"}",
        "disableSignInForShortUrlMeeting": false,
        "enableWaitForCallingIntentEventFulfilled": true,
        "shouldNotRerenderIfCallActive": true,
        "enableLabelForDeviceSelection": true,
        "enableWindowingFailOnNonSuccess": true,
        "enableImmediateErrorThrowOnBoundary": true,
        "enableDeduplicateWindowingActions": true,
        "enableParallelFocusAndContentUpdate": true,
        "enableReportWindowingContainerRenderError": true,
        "enableCallingWindowingContainerContentMatch": true,
        "enableWindowingActionMonitor": true,
        "showCustomChatPaneErrorForNonChannelMember": true,
        "enableUpdatedGetVoicemailsPath": true,
        "enableCallableChannels": true,
        "enableNativeCallsApp": true,
        "enablePagination": true,
        "enableDialpadCallingForOBOVoipCalls": true,
        "pptFeatureGates": "{\"ModernWebGLBlockListForBrowserVersion\": \"Chrome:66;Edge:19\",\"ModernWebGLBlockListForGPURenderer\": \"PowerVR Rogue GX6250;SwiftShader\", \"ModernSlideShowAllowListForFileType\": \"pptx;ppsx;potx;pptm;ppsm;pot;ppt;odp;pps\", \"DetectAbandonsWithinIframeTimeouts\":true, \"HostBootTimeoutConfigInMs\":90000, \"EnableNewSnapService\":true, \"SnapToPodsRegionSpecificUrlEnabled\":true, \"PresUrlBootTimeoutMS\":4000,\"EnableCleanupForMemoryLeakFix\":true, \"EnablePostMessageDownwardFix\":true}",
        "pptBootstrapperUrl": "https://res.cdn.office.net/pptlive-m/5mttl/bootstrap/ring5_3/powerpoint.live.boot.js"
      },
      "core": {
        "enableSplashScreen2025": true,
        "enableRefreshedTeamsIconOct2025": true,
        "enableReflow": true,
        "enableReflowMotion": true,
        "enableEndSlotCloseOnEscape": true,
        "enableFreezeInResizableSlots": true,
        "enableReflowPinAppBar": true,
        "offlineActionsSyncStrategyRefreshIntervalInMs": 300000,
        "offlineGuaranteedOrderingEnabledResolvers": [
          "sendMessage",
          "undeleteMessage",
          "deleteMessage"
        ],
        "enableConsolidateLayoutTemplates": false,
        "enableExperienceLifeCycleManagerV2": true,
        "enableDecoupleCommandingFromApollo": true,
        "enableMenuAutoSize": true,
        "enablePopoverAutoSize": true,
        "enableEndpointsManagerOnTeamsPushService": true,
        "enableLineLoader": true,
        "enableForcedTransitionOnLPSMDispose": true,
        "enablePoliciesFetchViaEffectivePoliciesApi": true,
        "enableClientFiltersProvider": true,
        "ecsProviderFetchMode": "WhenExpired",
        "endpointsManagerBaseUrlResolutionTimeoutInMs": 45000,
        "enableUncontrolledTabster": true,
        "ecsRefreshIntervalInMs": 3600000,
        "enableEndpointsManagerOnChatService": true,
        "enableFocusManagementRoot": true,
        "enableEndpointsManagerOnCsaService": true,
        "enableFocusManagement": true
      },
      "meetingCollaboration": {
        "groupCopilotBotDisplayName": "Facilitator",
        "enableFacilitatorAgentUXBranding": true,
        "enableCopilotSplitButton": false,
        "enableGroupCopilotBotJoinCall": true,
        "enableGroupCopilotAppAdminPolicyCheck": true,
        "enableGroupCopilotToggleInSchedulingForm": true,
        "enableGroupCopilotFacilitatorAgentBranding": true,
        "enableFacilitatorAgentUXEntryPoint": true,
        "enableGCPInstallInChatOnCallStart": true,
        "allowGroupCopilotAtMentionIfInstalledInMeetings": true,
        "enableStartTranscriptIfFacilitatorAdded": true,
        "enableFacilitatorInCopilotOnlyMode": true,
        "enableTranscriptSpeedbumpOnGroupCopilotEnabled": true
      },
      "slices": {
        "enableThreadSliceCopyLinkContextMenuOption": true
      },
      "cdlWorker": {
        "shouldUseChatServiceBatchEventInChatServiceSubscription": true
      },
      "presence": {
        "enablePollSubscribedPresenceOnActive": false,
        "enablePresenceManagerOfflineAndExpectedErrorTelemetry": true,
        "enableSyncStatusBanner": true,
        "enableSerializingPublishPresence": true,
        "shouldUnsetTrouterDisconnectedTimestamp": true,
        "removePresenceTrackingInfoOnCDLUnsubscribe": true
      },
      "people": {
        "peopleCoreSyncStrategyOnStartupMaxDeferTimeInMinutes": 360,
        "enablePartitionWithCallRoster": true,
        "profilesMaxInMemoryRecordSize": 1200,
        "peopleCoreSyncStrategyOnIntervalJitter": 0.15,
        "peopleCoreSyncStrategyRefreshIntervalInMs": 86400000,
        "enableLastAccessedTimestampPruningForProfileManager": true,
        "enableGetProfilesWithLowPerfFederationFallbacks": true,
        "enableMentionManagerCacheRefresh": true,
        "enableTflUsersOnlyForExternalUsersSearch": true,
        "enableCacheSearchChannelAtMentionOnFailure": true,
        "useUserLevelTimestampForAvatarETag": true,
        "enableSetEmptyAvatarETagToSignedInTime": true,
        "enableEmailSearchForLocalProfileSearch": true,
        "unknownUserBackroundRefreshThrottleInMinutes": 20160,
        "enableSfCProfileFetch": true,
        "enableOfflineErrorCheckForPeopleScenarios": true,
        "respectChannelMentionUserSettings": true,
        "useChatDataFromSubstrate": false,
        "enableClientInstrumentation": true,
        "includeIBBarredUsers": true,
        "enablePopOverScrollMoreView": true,
        "enableNewRelevanceForPeoplePickerFromProps": true,
        "disablePeoplePickerSearchQueryFeedback": true,
        "debounceForRemoteSearchInMilliSeconds": 750,
        "updateSelectedUserFrequencyEnabled": true
      },
      "meetingConversation": {
        "enableChatSubTypeAndActiveCallCheck": true
      },
      "telemetry": {
        "logSanitizerConfig": {
          "warn": [],
          "sanitize": [
            "Teams_Email",
            "Teams_FileName",
            "Teams_PhoneNumber",
            "Teams_MriLive",
            "JWTInDepth",
            "QueryParam",
            "KnownString",
            "Teams_OdspUri",
            "Teams_MeetingAndChannelsMetadata",
            "Teams_Url"
          ],
          "skipObjectKeys": true,
          "scannerOptions": {
            "Email": {
              "trustedDomains": [
                "thread",
                "skype",
                "unq.gbl",
                "tacv2",
                "onetoone",
                "copilot",
                "gcc",
                "DDD"
              ]
            },
            "Teams_FileName": {
              "messagePatternsToIgnore": [
                "WebLogs",
                "evergreen-assets",
                "msteams-asset",
                "Stored app definitions for app ids",
                "AppsUsage Fetched"
              ],
              "fileNamePatternsToIgnore": [
                "com\\.microsoft",
                "[_-]?teams[_-]",
                "giphy\\.gif",
                "summary\\.txt",
                "\\.mp3",
                "\\.wav"
              ]
            },
            "Teams_PhoneNumber": {
              "messagePatternsToIgnore": [
                "AuthenticationService: authorize:",
                "submitOperation::Submitting operation"
              ]
            },
            "Teams_MriLive": {
              "mriLiveIdsToIgnore": [
                "file-euii",
                "email-euii",
                "ssn-euii",
                "creditCard-euii"
              ]
            },
            "Teams_MeetingAndChannelsMetadata": {
              "meetingAndChannelParamToScan": [
                "meetingTitle",
                "displayName",
                "teamAndChannelName"
              ]
            },
            "Teams_OdspUri": {
              "spoUrlParamsToIgnore": [
                "\\.default",
                "\\.Read",
                "\\.Write"
              ]
            },
            "Teams_Url": {
              "urlPatternsToIgnore": [
                "sharepoint",
                "mcas\\.ms",
                "goo\\.gl",
                "powerbi",
                "agatcloud",
                "contoso",
                "opendns",
                "copilotapp"
              ]
            }
          }
        },
        "enableLogSanitizer": true,
        "enableScenarioEventing": true,
        "applicationInsightsOfflineSettings": {
          "minPersistenceLevel": 2,
          "inMemoMaxTime": 15000,
          "inStorageMaxTime": 86400000,
          "autoClean": true,
          "maxRetry": 5,
          "maxBatchsize": 2500000,
          "maxSentBatchInterval": 1000
        },
        "eventPersistence": {
          "scenarions": {
            "acquire_token": 2,
            "activity_switch": 2,
            "app_notification_banner_render": 2,
            "application_launch_time": 2,
            "cal_create_update_user_event": 2,
            "cal_join_online_meeting": 2,
            "cal_scheduling_form_create_mode": 2,
            "cal_scheduling_form_view_or_edit_mode": 2,
            "cal_surface_load": 2,
            "call_accept_meeting": 2,
            "call_accept": 2,
            "call_hangup_latency": 2,
            "calling_call_disconnected": 2,
            "calling_lobby_admit": 2,
            "calling_stack_init": 2,
            "calling_service_init": 2,
            "calling_app_init": 2,
            "calls_app_switch": 2,
            "cdl_worker_manager_startup": 2,
            "channel_switch_l1": 2,
            "channel_switch_l2": 2,
            "chat_pop_out": 2,
            "chat_send_message": 2,
            "chat_switch": 2,
            "client_start": 2,
            "content_sharing_presenter_join": 2,
            "content_sharing_start": 2,
            "content_sharing_viewer_join": 2,
            "create_chat": 2,
            "create_group_call": 2,
            "create_meetup": 2,
            "create_one_to_one_call": 2,
            "create_one_to_one_pstn_call": 2,
            "cross_client_toast_view": 2,
            "documents_action_download_file": 2,
            "documents_p2p_files_list_switch": 2,
            "documents_upload_file_chat": 2,
            "dropped_message_notifications": 2,
            "edit_message": 2,
            "emergency_call": 2,
            "feeds_focused_load": 2,
            "get_skype_token": 2,
            "incoming_call": 2,
            "incoming_pstn_call": 2,
            "join_group_call": 2,
            "join_or_create_meetup_from_link": 2,
            "join_scheduled_meetup": 2,
            "media_connected": 2,
            "meeting_started_notification": 2,
            "mejco": 2,
            "multiple_profile_fetch_conversation": 2,
            "multiple_profile_fetch": 2,
            "navigation_command": 2,
            "network_offline": 2,
            "people_picker_search_suggestions": 2,
            "platform_tab_loading": 2,
            "powerbar_query": 2,
            "ppt_sharing_added": 2,
            "ppt_sharing_wrs_init": 2,
            "scheduled_job_complete": 0.1,
            "screen_sharing_presenter_start": 2,
            "screen_sharing_viewer_start": 2,
            "search_all": 2,
            "search_people": 2,
            "shell_desktop_previous_process_crashed": 2,
            "shell_process_failed": 2,
            "toggle_mute_latency": 2,
            "transfer_call": 2,
            "unified_presence_t2_create_endpoint": 2,
            "unified_presence_t2_get_user_batch_presence": 2,
            "unified_presence_t2_post_active_w_trouter": 2,
            "unified_presence_t2_publish_presence": 2,
            "unified_presence_t2_set_user_initiated_presence": 2,
            "video_stage_reliability": 2,
            "window_launch_time": 2,
            "chat_edit_message": 2,
            "message_send_workflow": 2,
            "message_edit_workflow": 2,
            "real_time_messaging_notifications": 2,
            "message_sync_job": 2
          },
          "userbins": {
            "panelaction": 2
          },
          "loggingns": {
            "*": 2
          },
          "endpointns": {
            "postmessagetoconversation_chatservice": 2,
            "chatservice_updatemessageinconversation_put": 2
          },
          "httpns": {
            "chatservice_message_post": 2,
            "chatservice_message_put": 2,
            "chatservice_messages_get": 2
          }
        },
        "enableOfflineTelemetry": true,
        "enableSDKContextOverrides": true,
        "enableExpandedFractionalBuckets": true,
        "toolingSamplingRules": {
          "scenarions": {
            "*": 1
          },
          "userbins": {
            "*": 100
          },
          "loggingns": {
            "*": 1
          },
          "endpointns": {
            "*": 1
          },
          "httpns": {
            "*": 1
          }
        },
        "enableWorkerBroadcast": true,
        "isolateUserContext": true,
        "enableCompression": true,
        "enableBlockZeroSampleRate": true,
        "enableSecondPartyTelemetry": true,
        "enableOneDsSdkNs": true,
        "scenarioModes": {
          "navigation_command": 3,
          "cdl_worker_startup": 1,
          "experience_ready": 1,
          "acquire_token": 3,
          "get_skype_token": 1,
          "auth_web_login": 1,
          "auth_web_initialization": 1,
          "delta_sync_workflow": 1,
          "ext_installed_apps_V2": 1,
          "files_personal_picker_auth_token_fetch": 1,
          "search_start": 1,
          "search_message": 1,
          "on_behalf_of_user_attribution": 1,
          "ext_ac_render": 1,
          "ext_app_definitions_for_bot_card": 1,
          "serialize_cached_image": 1,
          "reply_chain_manager_get_reply_chains_by_keys": 1,
          "on_long_poll_received_strategy": 1,
          "search_all": 1,
          "broadcast_attendee_performance": 1,
          "ext_meeting_apps_flyout_fetch_grid_apps": 1,
          "reply_chain_manager_get_reply_chains": 1,
          "real_time_messaging_notifications": 1,
          "startup_sync_job": 1,
          "startup_sync_group_chats_job": 1,
          "documents_create_file_chiclet_on_link_paste": 1,
          "unified_3s_search": 1,
          "search_files": 1,
          "platform_tab_loading": 1,
          "related_message_sync_job": 1,
          "search_people": 1,
          "fetch-channel-site-info": 1,
          "documents_share_link_permission_dialog": 1,
          "documents_share_link_copy_dialog": 1,
          "documents_async_link_to_chiclet": 1,
          "files_personal_picker": 1,
          "message_sync_job": 1,
          "conversation_sync_workflow": 1,
          "message_sync_workflow": 1,
          "batched_thread_details_sync_job": 1,
          "replychain_sync_job": 1,
          "ext_card_mentions_invoke": 1,
          "documents_remove_file_chat": 1,
          "documents_remove_file_channel": 1,
          "ext_bots_sign_in": 1,
          "put_conversations_resolver": 1,
          "cdl_data_store_create": 1,
          "platform_tab_sdk_get_auth_token": 1,
          "ext_scene_picker_fetch_apps": 1,
          "persistence_pruning_job": 1,
          "put_legacy_messages_resolver": 1,
          "platform_tab_remove": 1,
          "linkedin_render": 1,
          "submit_survey": 2,
          "related_message_sync_workflow": 1,
          "retention_pruning_job": 1,
          "inmemory_cleanup_job": 1,
          "single_profile_fetch": 1,
          "platform_tab_creation": 1,
          "cdl_worker_manager_startup": 1,
          "ext_bots_card_copy": 1,
          "ext_meeting_apps_flyout_fetch_all_apps": 1,
          "chat_roster_rendered_v2": 1,
          "ext_card_mentions_task_module_card_insert": 1,
          "platform_tab_rename": 1,
          "get_instant_answers": 2,
          "reply_chain_manager_get_previous_next_messages_for_chat": 1,
          "resolve_edit_client_lie_resolver": 1,
          "documents_upload_file_chat_conflict_dialog": 1,
          "documents_fetch_personal_site_info": 1,
          "start_trouter_connection": 1,
          "notification_settings_changed": 1,
          "platform_tab_update": 1,
          "reset_team_join_code": 1,
          "brb_create_item": 1,
          "calling_app_events_subscribe": 1,
          "calling_app_init": 1,
          "*": 3
        },
        "samplingRules": {
          "scenarions": {
            "calling_call_disconnected": 100,
            "calling_call_observe": 100,
            "calling_prejoin_render": 100,
            "calling_stack_init": 100,
            "devices_init": 100,
            "join_or_create_meetup_from_link": 100,
            "meeting_chat_activation": 100,
            "mute_self": 100,
            "start_video": 100,
            "stop_video": 100,
            "unmute_self": 100,
            "video_stream_rendering": 100,
            "*": 1
          },
          "loggingns": {
            "content_security_policy_violation": 100,
            "*": 1
          },
          "httpns": {
            "*": 1
          },
          "endpointns": {
            "*": 1
          },
          "userbins": {
            "*": 100
          }
        }
      },
      "sync": {
        "shouldTempJoinChannelIfModeratorIsNotAMember": false,
        "enableLoggingMessagesSyncedFromNetwork": false,
        "enableGuardSingleReplyChainRetryOnNonRetryableError": false,
        "enableDraftsConversationSync": true,
        "enableUsingVerifiedSenderNameFromMessage": true,
        "enableUsingChatTitleCacheInResolvers": true,
        "delayTrouterEventsUntilRegistered": true,
        "isTrouterConnectionDependsOnRegistration": true,
        "conversationGapsThresholdForSync": 10,
        "enableStopNotificationProviderOnTerminalError": true,
        "enableUseTrouterStateDirectly": true,
        "enableStoppingTrouterNotificationProviderOnRefreshTokenFailure": true,
        "enableStartNotificationProviderOnAuthUp": true,
        "enableTokenRefreshOnTrouterClaimsChallenge": true,
        "enableTokenRefreshOnTokenRevocation": true,
        "disableLegacyLastMessageUpdateComparison": true,
        "suppressBotAddMemberLastMessageUpdate": true,
        "enableTPSGetPushUpdatesWithRetry": true,
        "disableMergeThreadProperties": true,
        "enableVivaInsightsLicenseCache": true,
        "enableExecutingJobPriorityUpdate": true,
        "enableProcessingAndMutatingEmotionProperty": true,
        "enableSkypeMessageClassSanitization": true,
        "enableL2chSync": true,
        "disableReplyChainResponseMissingMessageDetection": false,
        "eventLoopBusynessTimeoutValueInSeconds": 172800,
        "enableDataSpillageHardDeletion": true,
        "enableMessageForReplyChainTrim": true,
        "disableConversationSupportedCheckForLongpollUpdate": true,
        "missingMessagesReportingConfig": {
          "enableDelayedReporting": true,
          "maxAllowedWaitInSeconds": 80
        },
        "enableRetentionHorizonBasedPruning": false,
        "disableConversationVersionFiltering": true,
        "enableClientLieInsertionValidation": false
      },
      "lobbyChat": {
        "enableLobbyChatForAttendee": true
      },
      "extensibility": {
        "enableGroupCopilotAlwaysInAtMention": true,
        "enableSuggestedActionsForGroupAndChannel": false,
        "enableShareForTemplatedApps": true,
        "enableShareForPersonalApps": true,
        "defaultAppEntitlements": "{\"userEntitlements\":{\"default\":[{\"id\":\"14d6962d-6eeb-4f48-8890-de55454bb136\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":1},{\"id\":\"3b64df9d-7e97-4d9c-ac5c-2e0a5d8e6f40\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":2},{\"id\":\"86fcd49b-61a2-4701-b771-54728cd291fb\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":2},{\"id\":\"2a84919f-59d8-4441-a975-2a8c2643b741\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":3},{\"id\":\"ef56c0de-36fc-4ef8-b417-3d82ba9d073c\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":4},{\"id\":\"20c3440d-c67e-4420-9f80-0e50c39693df\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":5},{\"id\":\"5af6a76b-40fc-4ba1-af29-8f49b08e44fd\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":6},{\"id\":\"5a0e35f9-d3c8-45b6-9dd9-983ab47f1b83\",\"state\":\"InstalledAndPermanent\"}]},\"definitions\":[{\"manifestVersion\":\"1.16\",\"version\":\"1.0.0\",\"developerName\":\"Microsoft Corportation\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:appkey:app_bar_simple_collab_app_name\",\"longDescription\":\"appkey:app_bar_simple_collab_app_name\",\"largeImageUrl\":\"https://res.cdn.office.net/teamsappdata/evergreen-assets/apps/3b64df9d-7e97-4d9c-ac5c-2e0a5d8e6f40_largeImage.png?v=1.0.0\",\"accentColor\":\"#ffffff\",\"id\":\"3b64df9d-7e97-4d9c-ac5c-2e0a5d8e6f40\",\"name\":\"appkey:app_bar_simple_collab_app_name\",\"smallImageUrl\":\"svg/icons-teams-medium.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:app_bar_activity_app_name\",\"longDescription\":\"appkey:app_bar_activity_app_name\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/activity_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"14d6962d-6eeb-4f48-8890-de55454bb136\",\"name\":\"appkey:app_bar_activity_app_name\",\"smallImageUrl\":\"svg/icons-bell.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:app_bar_chat_app_name\",\"longDescription\":\"appkey:app_bar_chat_app_name\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/chat_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"86fcd49b-61a2-4701-b771-54728cd291fb\",\"name\":\"appkey:app_bar_chat_app_name\",\"smallImageUrl\":\"svg/icons-chat-medium.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:app_bar_teams_app_name\",\"longDescription\":\"appkey:app_bar_teams_app_name\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/teams_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"2a84919f-59d8-4441-a975-2a8c2643b741\",\"name\":\"appkey:app_bar_teams_app_name\",\"smallImageUrl\":\"svg/icons-teams-medium.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:app_bar_calls_app_name\",\"longDescription\":\"appkey:app_bar_calls_app_name\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/calls_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"20c3440d-c67e-4420-9f80-0e50c39693df\",\"name\":\"appkey:app_bar_calls_app_name\",\"smallImageUrl\":\"svg/icons-call.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com\",\"privacyUrl\":\"https://privacy.microsoft.com/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/servicesagreement\",\"webApplicationInfo\":{\"id\":\"c9224372-5534-42cb-a48b-8db4f4a3892e\",\"resource\":\"https://teams.microsoft.com\"},\"activities\":{\"activityItems\":[{\"type\":\"meetingCreated\",\"description\":\"Meeting Created\",\"templateText\":\"{actor} invited you\"},{\"type\":\"meetingCancelled\",\"description\":\"Meeting Cancelled\",\"templateText\":\"{actor} cancelled event\"},{\"type\":\"meetingForwarded\",\"description\":\"Meeting Forwarded\",\"templateText\":\"{actor} forwarded event\"},{\"type\":\"meetingUpdated\",\"description\":\"Meeting Updated\",\"templateText\":\"{actor} updated event\"}]},\"hostedCapabilities\":[\"StaticTab\"],\"shortDescription\":\"Meeting invites, updates and reminders.\",\"longDescription\":\"Meeting invites, updates and reminders.\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/meetings_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"ef56c0de-36fc-4ef8-b417-3d82ba9d073c\",\"name\":\"Calendar\",\"smallImageUrl\":\"svg/icons-calendar-medium.html\",\"isCoreApp\":true,\"isAppBarPinned\":true,\"appBarOrder\":3,\"state\":\"InstalledAndPermanent\"},{\"manifestVersion\":\"1.3\",\"version\":\"1.0\",\"categories\":[\"CustomerSupport\",\"Productivity\",\"Microsoft\"],\"developerName\":\"Microsoft Corporation\",\"developerUrl\":\"https://products.office.com/microsoft-teams/group-chat-software\",\"privacyUrl\":\"https://privacy.microsoft.com/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/servicesagreement\",\"validDomains\":[\"support.office.com\"],\"permissions\":[\"Identity\",\"MessageTeamMembers\"],\"staticTabs\":[{\"entityId\":\"help\",\"name\":\"Help\",\"contentUrl\":\"https://support.office.com/f1/home/?shownav=True&NS=MSFTTEAMS&version=16&omkt={locale}&context=%7B%22TeamsTheme%22%3A%22{theme}%22%2C%22TeamsTenantSKU%22%3A%22TFL%22%2C%22TeamsUserLicenseType%22%3A%22{userLicenseType}%22%2C%22SessionId%22%3A%22{sessionId}%22%2C%22AppVersionMajor%22%3A%2216%22%2C%22AppVersionMinor%22%3A%220%22%2C%22AppVersionBuild%22%3A%220%22%2C%22AppVersionUpdate%22%3A%220%22%2C%22RingId%22%3A%22{ringId}%22%2C%22HostClientType%22%3A%22{hostClientType}%22%7D\",\"scopes\":[\"Personal\"]},{\"entityId\":\"training\",\"name\":\"Training\",\"contentUrl\":\"https://support.office.com/f1/home/?ShowNav=True&HelpID=teamstraining1&NS=MSFTTEAMS&version=16&omkt={locale}&context=%7B%22TeamsTheme%22%3A%22{theme}%22%2C%22TeamsTenantSKU%22%3A%22TFL%22%2C%22TeamsUserLicenseType%22%3A%22{userLicenseType}%22%2C%22SessionId%22%3A%22{sessionId}%22%2C%22AppVersionMajor%22%3A%2216%22%2C%22AppVersionMinor%22%3A%220%22%2C%22AppVersionBuild%22%3A%220%22%2C%22AppVersionUpdate%22%3A%220%22%2C%22RingId%22%3A%22{ringId}%22%2C%22HostClientType%22%3A%22{hostClientType}%22%7D\",\"scopes\":[\"Personal\"]},{\"entityId\":\"release-notes\",\"name\":\"What's New\",\"contentUrl\":\"https://support.office.com/f1/home/?ShowNav=True&HelpId=teamswhatsnew1&NS=MSFTTEAMS&version=16&omkt={locale}&context=%7B%22TeamsTheme%22%3A%22{theme}%22%2C%22TeamsTenantSKU%22%3A%22TFL%22%2C%22TeamsUserLicenseType%22%3A%22{userLicenseType}%22%2C%22SessionId%22%3A%22{sessionId}%22%2C%22AppVersionMajor%22%3A%2216%22%2C%22AppVersionMinor%22%3A%220%22%2C%22AppVersionBuild%22%3A%220%22%2C%22AppVersionUpdate%22%3A%220%22%2C%22RingId%22%3A%22{ringId}%22%2C%22HostClientType%22%3A%22{hostClientType}%22%7D\",\"scopes\":[\"Personal\"]}],\"shortDescription\":\"In-App Teams Help\",\"longDescription\":\"Help, Training and Support content for Teams\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/help_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"5a0e35f9-d3c8-45b6-9dd9-983ab47f1b83\",\"name\":\"Help\",\"smallImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/help_largeimage.png\",\"state\":\"InstalledAndPermanent\"},{\"manifestVersion\":\"1.0\",\"version\": \"1.0\",\"developerName\": \"Microsoft\",\"developerUrl\": \"https://www.microsoft.com/en-us/\",\"privacyUrl\": \"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\": \"Files app bar entry.\",\"longDescription\": \"Files app bar entry.\",\"largeImageUrl\": \"https://statics.teams.cdn.office.net/evergreen-assets/apps/files_largeimage.png\",\"accentColor\": \"#ffffff\",\"id\": \"5af6a76b-40fc-4ba1-af29-8f49b08e44fd\",\"name\": \"Files\",\"smallImageUrl\": \"svg/icons-document.html\",\"isCoreApp\": true,\"isAppBarPinned\": true,\"appBarOrder\": 5 }]}",
        "disableFetchBotInfoOptimization": true,
        "defaultAppDefinitionsForAnonymous": "[{\"manifestVersion\":\"devPreview\",\"version\":\"1.0.7\",\"developerName\":\"Microsoft Corporation\",\"developerUrl\":\"https://go.microsoft.com/fwlink/?linkid=2151467\",\"privacyUrl\":\"https://go.microsoft.com/fwlink/p/?linkid=857875\",\"termsOfUseUrl\":\"https://go.microsoft.com/fwlink/?linkid=2151466\",\"validDomains\":[\"teams.yammer.com\",\"web.yammer.com\",\"www.yammer.com\",\"web.gov.yammer.com\"],\"galleryTabs\":[{\"context\":[\"MeetingChatTab\",\"MeetingDetailsTab\",\"MeetingSidePanel\"],\"configurationUrl\":\"https://web.yammer.com/teamsmeeting/configure?client=teams\",\"scopes\":[]}],\"staticTabs\":[{\"entityId\":\"1\",\"name\":\"Q&A (Static)\",\"contentUrl\":\"https://web.yammer.com/teamsmeeting/teams-meeting/\",\"scopes\":[]}],\"isFullScreen\":false,\"isFullTrust\":true,\"webApplicationInfo\":{\"id\":\"00000005-0000-0ff1-ce00-000000000000\",\"resource\":\"https://web.yammer.com/teamsmeeting\"},\"showLoadingIndicator\":true,\"supportedLanguages\":[\"en-us\",\"el-cy\",\"pt-mo\",\"pt-br\",\"tr-cy\",\"zh-cn\",\"zh-mo\",\"zh-sg\",\"zh-tw\",\"ar\",\"ca\",\"cs\",\"da\",\"de\",\"el\",\"en-us\",\"es\",\"fi\",\"fr\",\"he\",\"hu\",\"id\",\"it\",\"ja\",\"ko\",\"nb\",\"nl\",\"pl\",\"pt\",\"ro\",\"ru\",\"sv\",\"th\",\"tr\",\"uk\"],\"activities\":{\"activityItems\":[{\"type\":\"userReply\",\"description\":\"Replies to your posts\",\"templateText\":\"{actor} {reply_count}replied\"},{\"type\":\"reaction\",\"description\":\"Reactions to your posts\",\"templateText\":\"{actor} {reactors_count}reacted to your message\"}]},\"meetingExtensionDefinition\":{\"isAnonymousAccessAllowed\":true},\"authorization\":{\"permissions\":{\"orgWide\":[],\"resourceSpecific\":[{\"name\":\"OnlineMeeting.ReadBasic.Chat\",\"type\":\"Delegated\"},{\"name\":\"ChannelMeeting.ReadBasic.Group\",\"type\":\"Delegated\"}]}},\"isAppIOSAcquirable\":true,\"shortDescription\":\"Questions and answers for structured meetings​\",\"longDescription\":\"The Q&A app is a robust solution for structured scenarios that organizers can customize with just a few clicks. You can add open or moderated Q&A, mark the best answer for a question, filter responses, enable replies, and more. This Q&A experience is powered by Microsoft Yammer and customized for Microsoft Teams.​\",\"accentColor\":\"#6264A7\",\"id\":\"5db56dd0-534d-467b-aeda-d622bee2574a\",\"name\":\"Q&A (Native)\",\"smallImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/5db56dd0-534d-467b-aeda-d622bee2574a_smallImage.png?v=1.0.7\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/5db56dd0-534d-467b-aeda-d622bee2574a_largeImage.png?v=1.0.7\",\"isCoreApp\":false,\"state\":\"InstalledAndPermanent\",\"isMobileOnly\":false}]",
        "enableInstalledAppQueryFromTab": true,
        "enableAdminPrePinnedTabsInMeetings": true,
        "enablePreCheckLogicForMeetings": true,
        "enableAppPolicyPush": true,
        "appsRatingTrackerConfig": {
          "appVisitsThreshold": 15,
          "coolOffPeriod": 172800000,
          "appSnoozePeriod": 2419200000,
          "doNotReviewList": [
            "3ed5b337-c2c9-4d5d-b7b4-84ff09a8fc1c",
            "com.microsoft.teamspace.tab.wiki",
            "com.microsoft.teamspace.tab.web",
            "1c256a65-83a6-4b5c-9ccf-78f8afb6f1e8",
            "d7958adf-f419-46fa-941b-1b946497ef84",
            "3e0a4fec-499b-4138-8e7c-71a9d88a62ed",
            "5af6a76b-40fc-4ba1-af29-8f49b08e44fd",
            "db5e5970-212f-477f-a3fc-2227dc7782bf",
            "66aeee93-507d-479a-a3ef-8f494af43945",
            "5966c135-e05f-4ce0-81e0-e138fe8e9583",
            "b5abf2ae-c16b-4310-8f8a-d3bcdb52f162",
            "5a0e35f9-d3c8-45b6-9dd9-983ab47f1b83",
            "683f3525-d193-4a67-8d91-22093beab1ca"
          ]
        },
        "enableDefaultAppDefinitionsForAnonymous": true,
        "enableCombineTabQueries": true,
        "enableBlockUnblockBotChatForPersonalApps": true,
        "enableStaticTabsPhase1InChannels": true,
        "enableContextlessUpgrade": true,
        "enableMRUSortingPersonalApps": true,
        "enableAboutForPersonalApps": true,
        "enablePaginationForApps": true,
        "enablePersonalAppsPopOut": false,
        "enableTabsInChatV2": true,
        "enableContextlessChatAppsPreCheckLogic": true,
        "enablePersonalLobApps": true,
        "disableFilesAppSupportForGuestUsers": true,
        "enableACv2JITInstallFromCDLv2": true,
        "enableAppAmsImagesFetch": true,
        "enableContextlessInstall": true,
        "enableAggregatedAppEntitlementsSyncDebounce": true,
        "enableAppLevelUpdateButton": true,
        "enableStaticTabsPhase1": true,
        "enableFlyoutAddAppButton": true,
        "enableUserSpecificContentInChannels": true,
        "enableDynamicAppBar": true,
        "enableInstalledAppsUpdateSubscription": true,
        "enableAppBarFlyout": true,
        "appIdList": "[\"com.microsoft.teamspace.tab.wiki\",\"90a27c51-5c74-453b-944a-134ba86da790\",\"ff2e639a-73e0-4dac-b55a-8cec27c9c826\",\"8ad5fc1b-251b-4d14-aceb-2624bcab0e85\",\"5a2715fe-ed49-4658-9212-64b70baa6ed6\",\"4491fd19-044b-45b2-9159-baa2ced6d4c5\",\"51126dcf-e4fc-48f9-8605-2d219f1f1cea\",\"c3c1cd11-5b38-4de4-9081-44573d9383bf\",\"d03f7a77-36dc-469a-a821-f86a20926944\",\"5e7a1100-1937-0c58-bac5-a0c48e77f001\",\"d5305801-d9c4-4dd1-aadf-d3cdb0d9d893\",\"7a78fde8-7c5c-445d-945e-9354649f9562\",\"9a1f0cd2-ff89-443f-9618-01993b1c5ff0\",\"42da7003-809a-4ef5-9a65-39c5a4c5cb08\",\"cd22c4a1-3135-48c5-b1c3-26de0785b5ae\",\"35af9cb3-8392-4473-9dd0-9295bab6a199\",\"100e3882-b881-4b6e-8dba-2cc8884af5d3\",\"592fa50f-40f2-46f4-a969-a6c75a9a32bb\",\"8c460194-2edf-4717-a5cc-be51ae478720\",\"0cca78c7-fa3e-4277-8e25-ca38a9f9d6cd\",\"a9f14e49-d497-429a-9d3d-0ac0ddba6ea3\"]",
        "isAllowedAppList": false,
        "enableClientSideLocalizationOfAppBarApps": true,
        "enablePreconsentedBotAtMention": true,
        "enableUserSpecificContentInAdaptiveCards": true,
        "enableAppMTAPIs": true
      },
      "meetingNotes": {
        "enableSendMeetingEventsForLiveNotes": true
      },
      "teamsCopilotAggregator": {
        "allowedUserCountToSendDataToTCA": 3,
        "enableTeamsCopilotAggregator": true
      },
      "lightMeetings": {
        "showBrbButtonEveryNthUser": 1000000,
        "showReportBrbButton": false,
        "enableModernStage": true,
        "enableVerboseTsCallingLogging": true
      },
      "activity": {
        "markAsReadAPIThrottleRate": {
          "maxConcurrentCallsCount": 3,
          "throttleLimitTimeQuantum": 8000
        },
        "enableSplitAtMentionInActivity": true,
        "enableBatchingForNewActivities": true,
        "enableMarkAsReadNetworkCallThrottling": true,
        "enableAppActivitiesContextualSettings": true,
        "enableContextualSettingsPhase1": true,
        "enableBotFeedItems": true,
        "enableMissedCallFeedChatAction": true,
        "enableActivityProvider": true,
        "honourAppsAllowlistForGraphActivities": false,
        "enableMissedCallFeedCallBackAction": true,
        "appsDisallowedForActivities": [
          "5af6a76b-40fc-4ba1-af29-8f49b08e44fd",
          "8e14e873-35ba-4720-b787-0bed94370b17",
          "1d192ad2-6590-4179-a088-daff383a52b5",
          "5ae80e49-7ada-461a-a6bd-c5df2e0cdb06"
        ],
        "enableDLPActivity": true,
        "enableMarkAllAsReadLogic": true,
        "disabledActivities": [
          "msGraph_pageNewsLink",
          "msGraph_teamsRecommendation",
          "msGraph_smbWelcome",
          "msGraph_appsRecommendation",
          "msGraph_upgradeRecommendation",
          "msGraph_helpRecommendation",
          "teamMembershipChange_hostOwnerUnshareChannelOwnerNotify",
          "teamMembershipChange_hostOwnerUnshareTeamOwnerNotify"
        ],
        "enableFeedProcessorAPICallBatching": {
          "getAppDefinition": true,
          "getConversation": true,
          "getProfile": true
        }
      },
      "experienceLoader": {
        "enableChunkedWorker": true,
        "disableRebootOnExperienceLoaderSettingsChanged": true
      },
      "notifications": {
        "enableNewDeduplicationCache": true
      },
      "trouterService": {
        "registrationMaxTTLInSeconds": 86400,
        "retryLimitOnTokenFetch": 300
      },
      "augloop": {
        "resource": "https://augloop.office.com/v2",
        "composeCopilotExpFlights": [],
        "enableUseSyndeyAvalonABTesting": true,
        "enableTimeIntentDetectionABTesting": true,
        "runtimeFlights": [
          {
            "name": "Microsoft.Teams.Augloop.EnableSendSubstrateEvents",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.AllowPartialResults",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.DefaultModelOverride",
            "value": "GPT41_ShortCo_0414"
          },
          {
            "name": "Microsoft.Teams.Augloop.FLIGHT_OMNI_MIGRATION",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableCopilotOrTeamsPremiumLicenseAggregation",
            "value": "true"
          },
          {
            "name": "Microsoft.Office.WordOnline.Augloop.EnableEditorAiPreview",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableMeetingSydneyNativeQnASkill",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableMeetingCopilotHistory",
            "value": "true"
          },
          {
            "name": "Microsoft.Office.SharedOnline.Augloop.Copilot.EnableSydneyErrorDetails",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.RingInfo",
            "value": "general"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableMeetingCopilotOptimizedStreaming",
            "value": "true"
          },
          {
            "name": "Microsoft.Office.AugLoop.AnnotationsOrderingEnabled",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.IgnoreByDesignSydneyErrors",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableSydneyAvalonMigrationForHistory",
            "value": "true"
          }
        ],
        "enableAugLoopService": true
      },
      "auth": {
        "otpMeetingEnabledRings": [
          "ring0",
          "ring1",
          "ring1_5",
          "ring2",
          "ring3"
        ],
        "enableOTPMeetings": true,
        "interactionRequiredErrorCodes": [
          "login_required",
          "consent_required",
          "interaction_required",
          "InteractionRequired",
          "UserCanceled",
          "UserCancelled",
          "NoAccountFound",
          "AccountUnusable",
          "invalid_grant",
          "no_tokens_found",
          "native_account_unavailable",
          "refresh_token_expired",
          "bad_token"
        ],
        "retriableWebErrorMessage": [
          "Token acquisition in iframe failed due to timeout",
          "ClientConfigurationError: untrusted_authority"
        ],
        "expectedErrors": [
          ":5000225,",
          ":90002,",
          ":500171,",
          "AADSTS90002",
          ":5000224,",
          "safari timeout",
          "AADSTS500014",
          "AADSTS500014: The service principal for resource 'https://api.spaces.skype.com' is disabled.  This indicate that a subscription within the tenant has lapsed, or that the administrator for this tenant has disabled the application, preventing tokens from being issued for it.",
          "server_error_code\":500014",
          "server_error_code\":5000224",
          "server_error_code\":90002",
          "server_error_code\":500011",
          "server_error_code\":50142",
          "Sending silent Cross-Cloud request on unsupported version of Windows",
          "Network request failed: If the browser threw a CORS error, check that the redirectUri is registered in the Azure App Portal as type",
          "Access denied for the resource.\",\"SystemErrorCode\":\"28",
          "server_error_code\":7000112",
          "server_error_code\":\"7000112",
          "server_error_code\":\"5000224",
          "server_error_code\":\"90002",
          "no_network_connectivity",
          "No network connectivity",
          "Seamless single sign on failed for the user",
          "AADSTS160021",
          "AADSTS70044",
          "AADSTS500011",
          "AADSTS700003",
          "AADSTS50158",
          "AADSTS50133",
          "AADSTS53000",
          "AADSTS53003",
          "AADSTS50076",
          "AADSTS50078",
          "AADSTS220501",
          "3399811147",
          "AADSTS50057",
          "2147942402",
          "80070164",
          "2147942408",
          "2147942756",
          "3221815344",
          "1067",
          "2147942403",
          "2147942658",
          "2147943712",
          "2148008704",
          "2148073494",
          "2148073520",
          "2150105227",
          "2150121473",
          "3399614475",
          "3223863297",
          "2150105345",
          "2147942403",
          "2147943811",
          "3489660941",
          "2150105344",
          "3399614465",
          "2150107397",
          "2150105250",
          "2150121474",
          "-2147023838",
          "api_error_code\": \"1003\",\"api_error_context\":\"Description: (pii), Domain: com.apple.AuthenticationServices.AuthorizationError.Error was thrown in location: Broker",
          "server_error_code\":500171",
          "Response content type: 'text/html'. Expected 'json'. HTTP response code 403.",
          "Tag\":\"4s8qh\"",
          "monitor_window_timeout",
          "all_error_tags\":\"9zj1q",
          "all_error_tags\":\"9zj1s",
          "3400073316",
          "ValidTrialLicenseNotFound",
          "TrialLicenseTenantNotReady",
          "A malformed URL prevented a URL request from being initiated",
          "AADSTS70000: The provided value for the 'code' parameter is not valid",
          "3489661028",
          "Tag\":\"7anyj\"",
          "2147942405",
          "3489660929",
          "3489661023",
          "-2147023174",
          "AADSTS500171: Certificate has been revoked"
        ],
        "maxAcquireTokenRetryForRetriableError": 3,
        "enableLoadingScreenInMeetings": true,
        "enableAuthenticateOrGetUser": true,
        "requireSkypetokenForMT": true
      },
      "shortcuts": {
        "revertMacOptShortcuts": {
          "activity": false,
          "calendar": false,
          "general": false,
          "navigation": false,
          "messaging": false,
          "meetings": false
        }
      },
      "cmdMeetingArtifactsService": {
        "cmdMeetingArtifactsServiceEndpoint": "https://teams.microsoft.com/api/mcps/prod/collab",
        "regionalArtifactsServiceEndpointPath": "collab",
        "enableMCPSTelemetryHeadersOverride": true,
        "enableRegionalEndpointStrReplace": true,
        "useRegionalArtifactsServiceEndpointResolver": true,
        "enableCMDMeetingArtifactsService": true,
        "enableEndpointsManagerForCollabObjectService": true
      },
      "meet": {
        "enableFetchUserProfilesInBatch": false,
        "disablePrefetchOnStartup": false
      },
      "autosuggest": {
        "appSuggestionsExperienceType": "SUBSTRATE",
        "enableMTOLabelInPowerbar": true,
        "enableQuerySuggestions": {
          "enableHistoryTreatment": "TREATMENT2",
          "syntheticOrderingQF": "DYNAMIC"
        },
        "domainScopingConfig": [
          {
            "name": "APPSCOPEDDOMAIN",
            "qfCount": 0,
            "zqCount": 0,
            "timeoutInMs": 2000
          },
          {
            "name": "MESSAGEDOMAIN",
            "qfCount": 8,
            "zqCount": 10,
            "timeoutInMs": 2000
          },
          {
            "name": "FILEDOMAIN",
            "qfCount": 10,
            "zqCount": 10,
            "timeoutInMs": 2000
          },
          {
            "name": "GROUPCHATDOMAIN",
            "qfCount": 10,
            "zqCount": 10,
            "timeoutInMs": 2000
          },
          {
            "name": "TCDOMAIN",
            "qfCount": 8,
            "zqCount": 8,
            "timeoutInMs": 2000
          }
        ],
        "enableMessageSerpEntry": true,
        "enableExternalPhoneSearchSuggestions": true,
        "zeroQueryExperienceType": "TOPN",
        "enableAppSuggestions": false,
        "enableSharedChannel": true,
        "enablePrivateChannel": true,
        "disableSubstrateTCC": false,
        "enableMTOSuggestions": true,
        "enableReloadingOfNamespace": true,
        "enableAdditionalPropertiesInSubstrateChat": true,
        "localSearchDelayInMs": 1000,
        "enableTopNSuggestions": true,
        "enableAutosuggestTopHits": true,
        "enableSubstrateSuggestions": true
      },
      "sensitivityLabel": {
        "sensitivityLabelCacheIntervalInHours": 12,
        "enableEndpointsManagerOnSensitivityLabel": true
      },
      "compose": {
        "disableTimestampOnCopy": true,
        "pastePreProcessorConfig": {
          "wordWebMultiLevelLists": true,
          "wordWebTableCleanup": true,
          "wordWebFixHeadings": true,
          "listItemCleanup": true,
          "shareContactCleanup": true,
          "symbolFonts": true
        }
      },
      "files": {
        "enableEndpointsManagerOnTeamSiteStatusService": true,
        "enableEndpointsManagerOnRefreshSiteUrlService": true,
        "enableEndpointsManagerOnCloudStorageFoldersService": true,
        "allowMultipleResourcesEnabled": true,
        "enableChatFilesTab": true
      },
      "smb": {
        "enableExternalSuggestedTflUsersOnly": true,
        "enableFetchingSmbTenantSettings": true
      },
      "peopleTargeting": {
        "enableAutomaticTags": true
      },
      "discoverSurface": {
        "discoverHydrationOptimization": {
          "enableHydrationOnTeamsClick": true,
          "durationToAllowBackgroundHydration": 86400000,
          "defaultLastVisitedSurface": "channel"
        },
        "enableItemComparison": true,
        "discoverChannelsRequiredConfig": {
          "enableStartUp": true,
          "enablePolling": true,
          "minimumChannelsRequired": 2
        },
        "enableDiscoverDataValidation": true,
        "enableDataSync": true,
        "discoverCDLLoadMoreCount": 20,
        "enableDataFetchOptimizer": true
      },
      "growth": {
        "irisAllCampaignCache": 72000000
      },
      "activityNotification": {
        "disableEmailSettingsForUserGraphSettings": true,
        "enableRefactorForGraphSettings": true,
        "enableGraphSettings": true,
        "enableTeamsAndChannelsSettings": true
      },
      "guardians": {
        "suppressAddMemberMessagesForGuardianChats": true,
        "enableAnnouncementsChatSuppression": true,
        "enableGuardiansPreferredMethodAndSmsInvite": true
      },
      "teamsAndChannels": {
        "recommendedTeamsCacheIntervalInHours": 168,
        "enableRecommendedTeamsSync": true,
        "enableChannelNewBadge": true
      },
      "chatService": {
        "useChatServiceAfd": true
      },
      "artifactsPlatform": {
        "enableLastUpdateTimeBasedDBCleanup": true,
        "enableArtifactsPlatformAttachmentsBatchSync": true,
        "enableArtifactsPlatformAttachmentsSync": true,
        "enableMeetingRecommendationsBatchSync": true,
        "enableMeetingRecommendationsSync": true,
        "enableArtifactsPlatformBatchStore": true,
        "enableMeetingArtifactsBatchSync": true,
        "enableVersionBasedDBCleanup": true,
        "enableMeetingArtifactsSync": true
      },
      "channels": {
        "enableInstalledAppsSubscriptionInChannelPane": true
      },
      "meetingRecap": {
        "enableMeetingRecapInChat": true
      },
      "csaService": {
        "useAcsTranslationEndpoint": true,
        "startupRetryMaximumRetries": 2,
        "enableSkypeTokenForCSAStartupAPI": true,
        "enableSkypeTokenForCSAReplyChainAPI": true
      },
      "searchCommon": {
        "enableFullTextSearchOnTopN": true
      },
      "security": {
        "pptLiveAllowedOrigin": [
          "https://c1-powerpoint-15.cdn.office.net",
          "https://c4-powerpoint-15.cdn.office.net",
          "https://c5-powerpoint-15.cdn.office.net",
          "https://res.cdn.office.net",
          "https://res-sdf.cdn.office.net",
          "https://powerpoint.cdn.office365.us",
          "https://res-gcch.cdn.office.net"
        ]
      },
      "teamsPushService": {
        "useHostFromGtmTable": true
      },
      "feedback": {
        "surveyConfigs": [
          {
            "campaignId": "63852425-0986-4c0d-8520-1279c6a622d9",
            "type": "anonMeetingEndNpsSurvey",
            "platform": "web",
            "maxRating": 5,
            "activation": {
              "nominationNumerator": 5,
              "nominationDenominator": 100,
              "nominationTimeSeconds": 86400,
              "cooldownTimeSeconds": 7776000,
              "channel": 0,
              "requiredAppFocusSeconds": 1
            }
          }
        ]
      },
      "serp": {
        "osearchBaseUrl": "https://us-prod.asyncgw.teams.microsoft.com"
      },
      "metadata": {
        "ring": {
          "id": "general",
          "friendlyName": "Public",
          "shortName": "R4"
        }
      }
    },
    "Headers": {
      "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
      "Expires": "Fri, 14 Nov 2025 21:15:23 GMT",
      "CountryCode": "GB",
      "StatusCode": "200"
    },
    "ConfigIDs": {
      "ECS": "P-R-1097555-1-5,P-R-1071975-1-2",
      "Segmentation": "P-R-1714598-1-12,P-R-1570555-1-5,P-R-1442207-1-6,P-R-1098206-1-7,P-R-1086415-1-5,P-R-1038759-1-4,P-R-84051-1-4,P-R-61704-1-3,P-R-54852-1-118,P-R-54455-1-3,P-R-25079-1-9,P-R-21477-3747251-1",
      "TeamsBuilds": "P-R-1700712-1-2,P-R-1692645-1-15,P-R-1155646-1-5,P-R-1650963-2-17,P-R-1605121-2-25,P-R-1460562-1-91,P-R-1261162-1-570,P-R-1118770-1-147,P-R-1030369-1-873,P-R-74267-1-3430,P-R-1075350-1-33,P-R-1061211-6-9,P-R-1061184-6-9,P-R-1046100-6-9,P-R-1005675-1-10,P-R-79199-2-346,P-R-89532-1-10,P-R-40084-1-35,P-R-40071-1-262,P-R-52407-1-131,P-R-50869-1-126,P-R-78991-1-57,P-R-78988-1-5,P-R-78984-1-2,P-R-78979-1-58,P-R-78445-5-5,P-R-77971-1-4498,P-R-74679-1-95,P-R-46828-1-42,P-R-38938-1-704,P-R-38876-1-1188,P-R-38795-1-2101",
      "TeamsNorthstar": "P-R-1712687-6-7,P-R-1696015-17-19,P-R-1692155-17-22,P-R-1691712-17-22,P-R-1691563-17-58,P-R-1679521-8-4,P-R-1665185-17-28,P-R-1659018-17-38,P-R-1646678-11-51,P-R-1643491-145-14,P-R-1639633-11-50,P-R-1636403-11-49,P-R-1628075-5-3,P-R-1620935-37-16,P-R-1619018-11-50,P-R-1610850-11-50,P-R-1606454-5-3,P-R-1605279-11-50,P-R-1605069-11-51,P-R-1600405-301-18,P-R-1597941-89-50,P-R-1597940-56-30,P-R-1592848-5-3,P-R-1587299-11-50,P-R-1581432-11-55,P-R-1577309-12-4,P-R-1569104-18-53,P-R-1563324-60-15,P-R-1552267-152-16,P-R-1550764-124-14,P-R-1549039-6-10,P-R-1544007-23-15,P-R-1529879-131-15,P-R-1472853-11-8,P-R-1470717-159-15,P-R-1470307-19-14,P-R-1468418-73-24,P-R-1467275-53-16,P-R-1465131-37-22,P-R-1460435-413-14,P-R-1457658-19-5,P-R-1456360-160-24,P-R-1454053-12-4,P-R-1454052-12-4,P-R-1452119-138-15,P-R-1451076-27-15,P-R-1448393-163-16,P-R-1448392-163-16,P-R-1441805-28-16,P-R-1439977-124-17,P-R-1439230-29-17,P-R-1435579-369-25,P-R-1433276-6-8,P-R-1422637-49-23,P-R-1422462-796-33,P-R-1422413-224-6,P-R-1422356-47-6,P-R-1422209-3-5,P-R-1416769-138-16,P-R-1415758-376-29,P-R-1379224-40-28,P-R-1293776-604-24,P-R-1293775-937-32,P-R-1293350-53-28,P-R-1288632-28-16,P-R-1282193-37-15,P-R-1277693-29-20,P-R-1273046-51-32,P-R-1271067-152-16,P-R-1267638-90-45,P-R-1267637-52-36,P-R-1267550-135-14,P-R-1264690-53-28,P-R-1264617-15-11,P-R-1259237-19-5,P-R-1258471-33-20,P-R-1258418-338-34,P-R-1258417-338-34,P-R-1254857-320-26,P-R-1251763-196-19,P-R-1244865-37-17,P-R-1243537-20-16,P-R-1243205-173-24,P-R-1242216-24-16,P-R-1240798-20-16,P-R-1240621-259-30,P-R-1239198-67-19,P-R-1238300-28-18,P-R-1238289-28-18,P-R-1237231-183-27,P-R-1237008-22-17,P-R-1235953-196-18,P-R-1233389-94-16,P-R-1232525-41-17,P-R-1231682-196-18,P-R-1230566-110-26,P-R-1229470-128-17,P-R-1228676-223-24,P-R-1228433-93-17,P-R-1226442-51-24,P-R-1224903-24-16,P-R-1221555-43-18,P-R-1176820-25-16,P-R-1174916-30-20,P-R-1174890-52-20,P-R-1174694-262-23,P-R-1174607-8-5,P-R-1173994-28-22,P-R-1173376-25-16,P-R-1169336-11-7,P-R-1168312-113-21,P-R-1166701-196-21,P-R-1165855-37-21,P-R-1163401-40-19,P-R-1161719-28-16,P-R-1161652-95-31,P-R-1161626-25-17,P-R-1160202-47-28,P-R-1159661-485-35,P-R-1159408-107-29,P-R-1159407-107-29,P-R-1158268-89-3,P-R-1158192-103-28,P-R-1158190-59-24,P-R-1157702-39-18,P-R-1156139-79-28,P-R-1156138-79-28,P-R-1156041-42-20,P-R-1156033-52-19,P-R-1151815-14-13,P-R-1150083-40-19,P-R-1149387-51-11,P-R-1147901-22-7,P-R-1147194-91-18,P-R-1146660-11-26,P-R-1145906-141-22,P-R-1141324-89-28,P-R-1141198-158-24,P-R-1139285-22-7,P-R-1137981-18-14,P-R-1136792-31-18,P-R-1136791-31-18,P-R-1130283-86-25,P-R-1126666-53-13,P-R-1127064-74-29,P-R-1125499-39-18,P-R-1125283-2455-188,P-R-1120445-127-25,P-R-1117892-31-17,P-R-1117029-408-127,P-R-1117005-24-9,P-R-1115902-30-13,P-R-1115815-764-52,P-R-1115288-44-16,P-R-1114796-176-25,P-R-1114795-19-15,P-R-1114538-554-47,P-R-1112544-76-26,P-R-1112460-26-18,P-R-1111932-27-17,P-R-1109553-84-16,P-R-1108803-57-26,P-R-1108770-498-44,P-R-1108339-29-13,P-R-1106790-36-21,P-R-1106686-46-20,P-R-1105882-58-17,P-R-1105330-27-12,P-R-1105292-21-14,P-R-1103663-29-14,P-R-1103008-34-19,P-R-1102750-66-25,P-R-1102704-77-30,P-R-1102509-272-35,P-R-1098492-16-14,P-R-1097544-81-28,P-R-1097132-251-32,P-R-1095261-26-15,P-R-1093928-152-33,P-R-1093140-41-18,P-R-1091224-187-25,P-R-1091146-7-14,P-R-1090751-33-15,P-R-1090378-42-19,P-R-1089432-35-27,P-R-1089097-39-21,P-R-1087480-39-21,P-R-1087479-39-21,P-R-1087478-39-21,P-R-1087477-39-21,P-R-1087404-294-32,P-R-1087376-23-14,P-R-1087233-239-29,P-R-1087206-23-15,P-R-1087205-40-19,P-R-1087187-39-21,P-R-1087186-39-21,P-R-1087145-93-11,P-R-1086614-56-17,P-R-1084356-40-22,P-R-1084355-40-22,P-R-1084261-15-11,P-R-1083821-41-18,P-R-1082781-14-11,P-R-1082214-17-13,P-R-1082213-57-25,P-R-1082202-34-16,P-R-1081885-41-18,P-R-1081824-61-26,P-R-1081599-40-19,P-R-1081314-4051-109,P-R-1080171-154-22,P-R-1079190-37-17,P-R-1077683-5-24,P-R-1077697-498-44,P-R-1077513-39-19,P-R-1076299-464-48,P-R-1076298-594-52,P-R-1075918-65-18,P-R-1075490-127-38,P-R-1074339-49-24,P-R-1074000-58-34,P-R-1073491-41-18,P-R-1073485-21-14,P-R-1067189-2-24,P-R-1070284-500-46,P-R-1070115-974-49,P-R-1068852-10-31,P-R-1064479-2-15,P-R-1066532-118-28,P-R-1064502-17-13,P-R-1062125-249-29,P-R-1061266-114-25,P-R-1059978-154-22,P-R-1059826-504-50,P-R-1059497-80-26,P-R-1059496-34-17,P-R-1051768-3-32,P-R-1057033-23-8,P-R-1053362-1-38,P-R-1054075-83-26,P-R-1052933-368-74,P-R-1052932-51-22,P-R-1049874-32-16,P-R-1049115-11-62,P-R-1049259-81-13,P-R-1048115-84-29,P-R-1043981-21-14,P-R-1043138-128-27,P-R-1042201-12-8,P-R-1041582-23-16,P-R-1036660-155-37,P-R-1036451-53-15,P-R-1036449-70-28,P-R-1033462-24-12,P-R-1030200-32-16,P-R-1028428-2-4,P-R-1024323-31-18,P-R-1022023-75-24,P-R-1021713-6-8,P-R-1021441-20-16,P-R-1020644-18-16,P-R-1020451-84-30,P-R-1020349-13-10,P-R-1019858-153-33,P-R-1015546-12-27,P-R-1014702-15-11,P-R-1014701-32-16,P-R-1014116-23-13,P-R-1012627-39-15,P-R-1010105-10-7,P-R-1008785-5-26,P-R-1001782-5-19,P-R-1001991-40-18,P-R-1001989-20-14,P-R-1001961-426-66,P-R-1001943-20-20,P-R-1001941-20-20,P-R-1001937-29-15,P-R-1001933-29-15,P-R-1001863-36-19,P-R-1001849-45-24,P-R-1001838-17-15,P-R-1001837-81-40,P-R-117954-7-15,P-R-104469-14-13,P-R-103048-738-70,P-R-99039-7-7,P-R-98806-202-48,P-R-98186-53-34,P-R-98079-76-25,P-R-93805-784-70,P-R-93804-883-53,P-R-92405-125-49,P-R-92399-11-8,P-R-90232-182-36,P-R-89825-36-18,P-R-87909-136-34,P-R-87052-51-19,P-R-86963-30-15,P-R-86219-2036-67,P-R-84674-10-7,P-R-84407-10-7,P-R-84152-284-67,P-R-83951-38-28,P-R-80149-36-19,P-R-74169-103-44,P-R-71975-29-22,P-R-70668-3-13,P-R-70357-43-24,P-R-68741-362-62,P-R-68283-105-70,P-R-67159-10709-487,P-R-67009-28-23,P-R-66548-28-24,P-R-66363-2257-154,P-R-65553-16-16,P-R-64817-55-26,P-R-64816-55-26,P-R-62094-207-24,P-R-56037-38356-1040,P-R-54792-110-13,P-R-46942-1032-65,P-R-46842-1-4,P-D-41777-10-1"
    }
  }
  ```
- POST `https://teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "loggingns",
    "time": "2025-11-14T20:15:22.533Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 1,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "i18n",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "i18n",
        "Identifier": "webclient_globalization_i18n_formatting_initialization_error",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "message": "Formatting locale info is not available or not supported. DateTimeFormatter have been initialized with: en-GB",
      "logLevel": "Info",
      "sampleCohortValue": 0,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "loggingns",
    "time": "2025-11-14T20:15:22.689Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 2,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "coresettings/ecsparameters",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "coresettings/ecsparameters",
        "Identifier": "ecs_utils_id_verification_failed_event",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "message": "Verification of userId failed.",
      "logLevel": "Warn",
      "sampleCohortValue": 0,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "loggingns",
    "time": "2025-11-14T20:15:22.690Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 3,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "coresettings/ecsparameters",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "coresettings/ecsparameters",
        "Identifier": "ecs_utils_id_verification_failed_event",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "message": "Verification of tenantId failed.",
      "logLevel": "Warn",
      "sampleCohortValue": 0,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  ```
  ```json
  {
    "acc": 3
  }
  ```
- POST `https://go-eu.trouter.teams.microsoft.com/v4/a?cor_id=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&con_num=1763151323246_1&epid=71ef682f-d36c-4935-807c-da1c360c3d56`
  ```json
  {
    "ccid": "haTfnkJKf1g",
    "id": "fzM_P6_9OkKhaTfnkJKf1g",
    "socketio": "https://pub-ent-sece-11-t.trouter.teams.microsoft.com:443/",
    "surl": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/",
    "url": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:8443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/",
    "ttl": "568299",
    "healthUrl": "https://go-eu.trouter.teams.microsoft.com:443/v4/h",
    "curlb": "https://pub-ent-sece-11-t.trouter.teams.microsoft.com:443",
    "registrarUrl": "https://teams.microsoft.com/registrar/prod/V3/registrations",
    "connectparams": {
      "sr": "fzM_P6_9OkKhaTfnkJKf1g",
      "issuer": "",
      "sp": "pub-ent-sece-11",
      "se": "1763719623073",
      "st": "1763151024073",
      "sig": "D5B7847DB8D9090F38E0AF07541977ADAAC777FE35B6C7A636F8D31F7BB672E5"
    }
  }
  ```
- GET `https://config.teams.microsoft.com/config/v1/Skype/1415_1.0.0.0?tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47&aadUserId=8:defaultOid:anon.prod.72f988bf-86f1-41af-91ab-2d7cd011db47.undefined.1763151323462&userId=8:defaultOid:anon.prod.72f988bf-86f1-41af-91ab-2d7cd011db47.undefined.1763151323462&region=emea&agents=MDN_TRAP&ECSCanary=1`
  ```json
  {
    "ECS": {
      "ConfigLogTarget": "default",
      "c72ea287-ed77-4fa6-a480-3712406c367e": "aka.ms/EcsCanary"
    },
    "MDN_TRAP": {
      "Relay": {
        "Turn": {
          "addresses": [
            "euaz-msit.relay.teams.microsoft.com"
          ],
          "fqdns": [
            "euaz-msit.relay.teams.microsoft.com"
          ],
          "realm": "rtcmedia",
          "tcpPort": 443,
          "tlsPort": 443,
          "udpPort": 3478,
          "url": ""
        },
        "addresses": [
          "52.123.195.2"
        ],
        "fqdns": [],
        "tcpPort": 443,
        "udpPort": 3478,
        "Lync": {
          "addresses": [
            "52.123.195.2"
          ],
          "fqdns": [],
          "tcpPort": 443,
          "udpPort": 3478
        },
        "Skype": {
          "addresses": [
            "52.123.195.2"
          ],
          "fqdns": [],
          "tcpPort": 443,
          "udpPort": 3478
        }
      },
      "Service": {
        "url": "https://teams.microsoft.com/trap-exp/",
        "tokenUrl": "https://teams.microsoft.com/trap-exp/tokens",
        "disabled": false,
        "supportedTokenTypes": "skype AAD CAE"
      },
      "Http": {
        "connectionTimeout": 30,
        "requestTimeout": 60
      },
      "Token": {
        "earlyRefreshMinutes": 9720,
        "earlyRefreshPercentage": 4
      }
    },
    "Headers": {
      "ETag": "\"ehsD2JIkUDVrj5D5hDi5FB8Q+gSi0c+7Qz0lC5iCoEY=\"",
      "Expires": "Fri, 14 Nov 2025 21:15:24 GMT",
      "CountryCode": "GB",
      "StatusCode": "200"
    },
    "ConfigIDs": {
      "ECS": "P-R-1097532-1-5,P-R-1071973-1-2,P-R-76663-1-2,P-D-81604-1-2",
      "MDN_TRAP": "P-R-1170049-7-18,P-R-73275-2-25,P-R-46426-1-14,P-D-5047-25629-179"
    }
  }
  ```
- POST `https://teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "scenarions",
    "time": "2025-11-14T20:15:22.744Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 4,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "telemetry_worker_initialization",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "telemetry_worker_initialization",
        "SpanId": "6bef1b3d247415c5",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "telemetry_worker_initialization",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"worker_initialized\",\"delta\":374,\"elapsed\":527,\"sequence\":1,\"stepDelta\":374},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":409,\"elapsed\":562,\"sequence\":2,\"stepDelta\":35,\"previousStep\":\"worker_initialized\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"Instrumentation.WorkerType\":\"dedicated\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"Instrumentation.WorkerType\":\"dedicated\"}]"
      },
      "InstanceId": "aab035fb-18f9-4a54-9b28-6c3384104be2",
      "delta": "409",
      "elapsed": "562",
      "sequence": "2",
      "stepDelta": "35",
      "previousStep": "worker_initialized",
      "commandSource": "ExternalCommand",
      "Instrumentation": {
        "WorkerType": "dedicated"
      },
      "isInEst": "false",
      "sampleCohortValue": 0,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:15:23.050Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 5,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "settings_changed_notification_sync",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "settings_changed_notification_sync",
        "SpanId": "d5238b4cd787e60d",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "settings_changed_notification_sync",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":1,\"elapsed\":862,\"sequence\":1,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":1,\"elapsed\":862,\"sequence\":2,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":3,\"elapsed\":864,\"sequence\":3,\"stepDelta\":2},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":3,\"elapsed\":864,\"sequence\":4,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":4,\"elapsed\":865,\"sequence\":5,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":4,\"elapsed\":865,\"sequence\":6,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":5,\"elapsed\":866,\"sequence\":7,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":5,\"elapsed\":866,\"sequence\":8,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":5,\"elapsed\":866,\"sequence\":9,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"settings_changed_notification_sync_category_notified\",\"delta\":5,\"elapsed\":866,\"sequence\":10,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":6,\"elapsed\":867,\"sequence\":11,\"stepDelta\":1,\"previousStep\":\"settings_changed_notification_sync_category_notified\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"core\",\"selectedSettings\":false},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"core\",\"selectedSettings\":true},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"metadata\",\"selectedSettings\":false},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"metadata\",\"selectedSettings\":true},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"telemetry\",\"selectedSettings\":false},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"telemetry\",\"selectedSettings\":true},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"smb\",\"selectedSettings\":false},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"smb\",\"selectedSettings\":true},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"auth\",\"selectedSettings\":false},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"category\":\"auth\",\"selectedSettings\":true},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"reason\":\"EcsClientProvider\"}]"
      },
      "InstanceId": "0c2a55c5-ac83-4922-a90c-b59161108ad8",
      "delta": "6",
      "elapsed": "867",
      "sequence": "11",
      "stepDelta": "1",
      "previousStep": "settings_changed_notification_sync_category_notified",
      "commandSource": "ExternalCommand",
      "reason": "EcsClientProvider",
      "isInEst": "false",
      "sampleCohortValue": 0,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\""
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:15:23.050Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 6,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "ecs_provider_fetch",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "ecs_provider_fetch",
        "SpanId": "1152246b05eadab8",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "ecs_provider_fetch",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":353,\"elapsed\":868,\"sequence\":1,\"stepDelta\":353,\"previousStep\":\"start\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"endpointUrl\":\"https://config.teams.microsoft.com/config/v1/MicrosoftTeams/1415_1.0.0.0?environment=prod&experience=light-meetings&buildType=production&virtualization=&browser=chrome&browserVersion=141.0.7390.67&osPlatform=windows&isOcdi=false&isPwa=false&experienceBuild=25110306401&sessionId=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&clientId=cbc2527f-51c4-40d2-a967-525b03f63e7f&resourceId=19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2&agents=TeamsNorthstar,TeamsBuilds,Segmentation&ECSCanary=1\",\"operation\":\"initial\",\"correlationId\":\"b49aae62-0d79-44cc-a506-3cfe1f84a7d2\",\"size\":51512,\"message\":\"{\\\"settingsUpdated\\\":true}\"}]"
      },
      "InstanceId": "b49aae62-0d79-44cc-a506-3cfe1f84a7d2",
      "delta": "353",
      "elapsed": "868",
      "sequence": "1",
      "stepDelta": "353",
      "previousStep": "start",
      "commandSource": "ExternalCommand",
      "endpointUrl": "https://config.teams.microsoft.com/config/v1/MicrosoftTeams/1415_1.0.0.0?environment=prod&experience=light-meetings&buildType=production&virtualization=&browser=chrome&browserVersion=141.0.7390.67&osPlatform=windows&isOcdi=false&isPwa=false&experienceBuild=25110306401&sessionId=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&clientId=cbc2527f-51c4-40d2-a967-525b03f63e7f&resourceId=19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2&agents=TeamsNorthstar,TeamsBuilds,Segmentation&ECSCanary=1",
      "operation": "initial",
      "correlationId": "b49aae62-0d79-44cc-a506-3cfe1f84a7d2",
      "size": "51512",
      "message": "{\"settingsUpdated\":true}",
      "isInEst": "false",
      "sampleCohortValue": 0,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\""
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:23.231Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 7,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_callingScreen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "Region": "main",
        "Type": "callingScreen",
        "WindowID": "main",
        "Context": "main"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:15:23.516Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 8,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "calling_stack_init",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "calling_stack_init",
        "SpanId": "e915f8062d09d837",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "calling_stack_init",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"gs_loading_calling_stack\",\"delta\":5,\"elapsed\":1073,\"sequence\":1,\"stepDelta\":5},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"gs_calling_stack_loaded\",\"delta\":6,\"elapsed\":1074,\"sequence\":2,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"gs_pluginless_stack_built\",\"delta\":210,\"elapsed\":1278,\"sequence\":3,\"stepDelta\":204},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":266,\"elapsed\":1334,\"sequence\":4,\"stepDelta\":56,\"previousStep\":\"gs_pluginless_stack_built\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"initCallingStack\":true},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"initCallingStack\":true},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"initCallingStack\":true},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"initCallingStack\":true}]"
      },
      "InstanceId": "471ea9c1-2fe9-41e6-8dd4-8c54db61d7b6",
      "delta": "266",
      "elapsed": "1334",
      "sequence": "4",
      "stepDelta": "56",
      "previousStep": "gs_pluginless_stack_built",
      "commandSource": "ExternalCommand",
      "initCallingStack": "true",
      "isInEst": "false",
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "skypecosi_concore_web_ts_calling_registry",
    "time": "2025-11-14T20:15:23.533Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 9,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "SkypeId": "u1",
      "Ring": "general",
      "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
      "Region": "emea",
      "TsCallingVersion": "2025.43.01.3",
      "HostName": "<redacted>",
      "EventTimestampBag": "{\"eventStart\":1763151323523,\"events\":[{\"Initialize\":{\"start\":7,\"duration\":2,\"status\":\"Success\",\"causeId\":\"65c21fa5\"}}]}",
      "ClientType": "enterprise",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  ```
  ```json
  {
    "acc": 6
  }
  ```
- GET `https://teams.microsoft.com/trap-exp/tokens`
  ```json
  {
    "tokens": [
      {
        "realm": "\"rtcmedia\"",
        "username": "AgAAJJGolgAB3Fsj7tvbARmDe6c3GmOd3FZZU5WbfEIAAAAA4Vj9YYLJAFM03StyudgkKXneRc4=",
        "password": "XClSTwVpEjYSvK85iI/2Ceg3d3k="
      }
    ],
    "expires": 604800
  }
  ```
- GET `https://pub-ent-sece-11-t.trouter.teams.microsoft.com/socket.io/1/?sr=fzM_P6_9OkKhaTfnkJKf1g&issuer=&sp=pub-ent-sece-11&se=1763719623073&st=1763151024073&sig=D5B7847DB8D9090F38E0AF07541977ADAAC777FE35B6C7A636F8D31F7BB672E5&v=v4&tc=%7B%22cv%22:%222025.43.01.1%22,%22ua%22:%22SkypeSpaces%22,%22hr%22:%22%22,%22v%22:%221415/1.0.0.0%22%7D&timeout=40&auth=true&epid=71ef682f-d36c-4935-807c-da1c360c3d56&ccid=haTfnkJKf1g&dom=teams.microsoft.com&cor_id=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&con_num=1763151323246_1&t=1763151323578`
  ```
  "668b433c2da0dbdf-4c57f7f5500ac0ab:70:70:websocket,xhr-polling"
  ```
- GET `wss://pub-ent-sece-11-t.trouter.teams.microsoft.com/socket.io/1/websocket/668b433c2da0dbdf-4c57f7f5500ac0ab?sr=fzM_P6_9OkKhaTfnkJKf1g&issuer=&sp=pub-ent-sece-11&se=1763719623073&st=1763151024073&sig=D5B7847DB8D9090F38E0AF07541977ADAAC777FE35B6C7A636F8D31F7BB672E5&v=v4&tc=%7B%22cv%22:%222025.43.01.1%22,%22ua%22:%22SkypeSpaces%22,%22hr%22:%22%22,%22v%22:%221415/1.0.0.0%22%7D&timeout=40&auth=true&epid=71ef682f-d36c-4935-807c-da1c360c3d56&ccid=haTfnkJKf1g&dom=teams.microsoft.com&cor_id=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&con_num=1763151323246_1`
- POST `https://teams.microsoft.com/registrar/prod/V2/registrations`
  ```json
  {
    "clientDescription": {
      "appId": "SkypeSpacesWeb",
      "aesKey": "",
      "languageId": "en-US",
      "platform": "chrome",
      "templateKey": "SkypeSpacesWeb_2.4",
      "platformUIVersion": "1415/1.0.0.0"
    },
    "registrationId": "71ef682f-d36c-4935-807c-da1c360c3d56",
    "nodeId": "",
    "transports": {
      "TROUTER": [
        {
          "context": "",
          "path": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/",
          "ttl": 568298
        }
      ]
    }
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103",
    "expirationTimeInSec": 30
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103",
    "expirationTimeInSec": 30
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103",
    "expirationTimeInSec": 30
  }
  ```
- POST `https://teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "scenarions",
    "time": "2025-11-14T20:15:25.342Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 10,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "devices_init",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "devices_init",
        "SpanId": "0a62525d4dcb4ea5",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "devices_init",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":1418,\"elapsed\":3160,\"sequence\":1,\"stepDelta\":1418,\"previousStep\":\"start\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"message\":\"[{\\\"id\\\":\\\"microphone:\\\",\\\"browserId\\\":\\\"\\\",\\\"label\\\":\\\"\\\",\\\"kind\\\":2,\\\"isSystemDefault\\\":true},{\\\"id\\\":\\\"camera:\\\",\\\"browserId\\\":\\\"\\\",\\\"label\\\":\\\"\\\",\\\"kind\\\":1,\\\"position\\\":0},{\\\"id\\\":\\\"speaker:\\\",\\\"browserId\\\":\\\"\\\",\\\"label\\\":\\\"\\\",\\\"kind\\\":3,\\\"isSystemDefault\\\":true}]\",\"selectedDevices\":\"{\\\"microphone\\\":\\\"microphone:\\\",\\\"camera\\\":\\\"camera:\\\",\\\"speaker\\\":\\\"speaker:\\\"}\",\"devicesKindCount\":\"{\\\"1\\\":1,\\\"2\\\":1,\\\"3\\\":1}\",\"totalDevicesCount\":3,\"unlabeledDevicesCount\":3}]"
      },
      "InstanceId": "c1cc54f2-6a21-400d-bcfd-654436000b7b",
      "delta": "1418",
      "elapsed": "3160",
      "sequence": "1",
      "stepDelta": "1418",
      "previousStep": "start",
      "commandSource": "ExternalCommand",
      "message": "[{\"id\":\"microphone:\",\"browserId\":\"\",\"label\":\"\",\"kind\":2,\"isSystemDefault\":true},{\"id\":\"camera:\",\"browserId\":\"\",\"label\":\"\",\"kind\":1,\"position\":0},{\"id\":\"speaker:\",\"browserId\":\"\",\"label\":\"\",\"kind\":3,\"isSystemDefault\":true}]",
      "selectedDevices": "{\"microphone\":\"microphone:\",\"camera\":\"camera:\",\"speaker\":\"speaker:\"}",
      "devicesKindCount": "{\"1\":1,\"2\":1,\"3\":1}",
      "totalDevicesCount": "3",
      "unlabeledDevicesCount": "3",
      "isInEst": "false",
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:15:26.077Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 12,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "calling_call_observe",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "calling_call_observe",
        "SpanId": "a86d018ba2fc6270",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "calling_call_observe",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"get_entry_by_coordinates\",\"delta\":0,\"elapsed\":3172,\"sequence\":1,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"create_entry\",\"delta\":1,\"elapsed\":3173,\"sequence\":2,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"get_observable_call\",\"delta\":2,\"elapsed\":3174,\"sequence\":3,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":714,\"elapsed\":3886,\"sequence\":4,\"stepDelta\":712,\"previousStep\":\"get_observable_call\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"LightMeetings\",\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"messageId\":\"0\",\"organizerId\":\"50a17a93-7e33-44f1-baef-8f234457f3e7\",\"meetingTenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"LightMeetings\",\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"messageId\":\"0\",\"organizerId\":\"50a17a93-7e33-44f1-baef-8f234457f3e7\",\"meetingTenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"LightMeetings\",\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"messageId\":\"0\",\"organizerId\":\"50a17a93-7e33-44f1-baef-8f234457f3e7\",\"meetingTenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"LightMeetings\",\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"messageId\":\"0\",\"organizerId\":\"50a17a93-7e33-44f1-baef-8f234457f3e7\",\"meetingTenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"teamsCallId\":1,\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\"}]"
      },
      "InstanceId": "71fc811b-ac9a-4e94-a3d1-5791ae2217a1",
      "delta": "714",
      "elapsed": "3886",
      "sequence": "4",
      "stepDelta": "712",
      "previousStep": "get_observable_call",
      "commandSource": "ExternalCommand",
      "context": "LightMeetings",
      "threadId": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
      "messageId": "0",
      "organizerId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
      "meetingTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "callId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "teamsCallId": "1",
      "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "isInEst": "false",
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:37.265Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 14,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingAnonPreJoinV2Screen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingAnonPreJoinV2Screen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:37.322Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 15,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "auto",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Action": {
        "Gesture": "auto"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "modal",
        "Type": "AuthLoginDialogV2",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Auth": {
        "meetingLoginDialogSource": "signInButton",
        "otpMeetingPolicy": "true"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:15:37.532Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 16,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "calling_prejoin_render",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "calling_prejoin_render",
        "SpanId": "ce704abf28ad928f",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "calling_prejoin_render",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"pre_join_v2_container\",\"delta\":1,\"elapsed\":14931,\"sequence\":1,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"prejoin_renderer\",\"delta\":208,\"elapsed\":15138,\"sequence\":2,\"stepDelta\":207},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":421,\"elapsed\":15351,\"sequence\":3,\"stepDelta\":213,\"previousStep\":\"prejoin_renderer\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"reason\":\"prejoin_v2_render_complete\"}]"
      },
      "InstanceId": "35b87eab-cd5f-44cd-9fcd-41f7ede4bc33",
      "delta": "421",
      "elapsed": "15351",
      "sequence": "3",
      "stepDelta": "213",
      "previousStep": "prejoin_renderer",
      "commandSource": "ExternalCommand",
      "reason": "prejoin_v2_render_complete",
      "isInEst": "false",
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:43.860Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 17,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "preJoinV2_keypress_joinOnPreJoinScreen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Action": {
        "Gesture": "keypress",
        "Outcome": "changeAttendeeName",
        "Scenario": "joinOnPreJoinScreen",
        "ScenarioType": "preJoin",
        "WorkLoad": "callType"
      },
      "Module": {
        "Name": "preJoinV2"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingAnonPreJoinV2Screen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "DataBag": {
        "callType": "scheduledPrivateMeeting",
        "correlationId": "whatever id",
        "isRegisteredAttendee": "false"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:50.753Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 18,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "flyout_VideoFlyoutPrejoin",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "Region": "flyout",
        "Type": "VideoFlyoutPrejoin",
        "WindowID": "main",
        "Context": "main"
      },
      "DataBag": {
        "tabType": "effectsAndSettingsTab"
      },
      "CMD": {
        "isVideoOn": "false"
      },
      "Flyout": {
        "pageName": "videoEffectsAndSettingsOnly"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-14T20:15:26.049Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 11,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Ring": "general",
      "Region": "emea",
      "ClientType": "enterprise",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "SignalingSessionId": "6a321b68-62a3-4286-b9f1-6cd2601d1a78",
      "ClientInformation": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "NetworkRequestBag": "{\"eventStart\":1763151325358,\"events\":{\"name\":\"POST-JoinConversationWithoutCallModality\",\"url\":\"https://api-emea.flightproxy.teams.microsoft.com/api/v2/epconv\",\"eventStart\":35,\"trouterReady\":0,\"requestReady\":2,\"status\":201,\"attempts\":[{\"status\":201,\"start\":3,\"end\":655,\"online\":1}],\"rtt\":656,\"uid\":\"89b6c8ec-00b2-4648-ae3d-1963265ca1e8\",\"causeId\":\"3d7d97ab\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[200,1000,5000],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":15000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"enabledForMeetings\"]},\"enableRequestHedging\":true,\"tokenTelemetries\":[{\"requestCauseId\":\"3d7d97ab\",\"supportTokenApi\":false,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"POST\\\",\\\"path\\\":\\\"https://api-emea.flightproxy.teams.microsoft.com/api/v2/epconv\\\"}\",\"tokenRequestTime\":1763151325394,\"tokenResponseTime\":1763151325394,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":0}]}}",
      "EcsEtag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-14T20:15:27.258Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 13,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Ring": "general",
      "Region": "emea",
      "ClientType": "enterprise",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "SignalingSessionId": "6a321b68-62a3-4286-b9f1-6cd2601d1a78",
      "ClientInformation": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "NetworkRequestBag": "{\"eventStart\":1763151325358,\"events\":{\"name\":\"GET-BrokerSubscribe\",\"url\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103\",\"eventStart\":701,\"trouterReady\":5,\"requestReady\":9,\"status\":202,\"attempts\":[{\"status\":202,\"start\":18,\"end\":1199,\"online\":1}],\"rtt\":1200,\"uid\":\"c9f3eb26-b60e-4d74-b82c-409b693cd376\",\"causeId\":\"88f14c3a\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[100,200,500],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":30000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"disabled\"]},\"enableRequestHedging\":false,\"tokenTelemetries\":[{\"requestCauseId\":\"88f14c3a\",\"supportTokenApi\":false,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"GET\\\",\\\"path\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103\\\"}\",\"tokenRequestTime\":1763151326066,\"tokenResponseTime\":1763151326066,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":0}]}}",
      "EcsEtag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  ```
  ```json
  {
    "acc": 9
  }
  ```
- GET `https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/wasmvqe-web-worker-inner-ada1e9acbcb2254c.js`
- POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/k27/525/applyChannelParameters?i=10-128-210-112&e=638985327425314572`
  ```json
  {
    "applyChannelParameters": {
      "multiChannelParameter": {
        "mids": [
          "1"
        ],
        "mediaParameter": "{\"maxVideoSendCapabilities\":{\"caps\":{\"max-width\":1280,\"max-height\":1280,\"max-fps\":30,\"max-streams\":3,\"max-layers\":3,\"sequence-number\":1}}}"
      }
    }
  }
  ```
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&w=0&content-encoding=gzip`
  ```json
  {
    "name": "skypecosi_concore_web_ts_calling_call_setup_session",
    "time": "2025-11-14T20:16:00.585Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 1,
        "installId": "7af01589-461d-4932-8f47-2b8619ce60e4",
        "epoch": "641428208"
      },
      "app": {
        "locale": "en",
        "sesId": "/oblfU2k0wsYLU3GMC3w6j"
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
      "intweb": {},
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
          },
          "DisplayName": {
            "t": 33
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
      "user_id": "u1",
      "Skype_InitiatingUser_Username": "u1",
      "SkypeId": "u1",
      "ui_version": "1415/25110306401",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "PreviousCorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "DisplayName": "Neil Rashbrook",
      "CallType": "2",
      "ConversationType": "scheduledMeeting",
      "Direction": "Outgoing",
      "Origin": "0",
      "SelfParticipantRole": "join",
      "MessageId": "0",
      "Ring": "general",
      "Region": "emea",
      "IsHuddleGroupCall": "True",
      "IsEmergency": "False",
      "TsCallingVersion": "2025.43.01.3",
      "EventTimestampBag": "{\"eventStart\":1763151325358,\"events\":[{\"_SetCallOrigin\":{\"start\":1,\"causeId\":\"33ced532\",\"data\":[{\"origin\":0}]}},{\"Initialize\":{\"start\":27,\"duration\":1,\"status\":\"Success\",\"causeId\":\"b72f243a\"}},{\"Subscribe\":{\"start\":29,\"duration\":674,\"status\":\"Success\",\"causeId\":\"3d7d97ab\",\"variant\":\"CCWM\"}},{\"_SetCallState\":{\"start\":31,\"causeId\":\"3d7d97ab\",\"data\":[{\"state\":8,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":32,\"causeId\":\"3d7d97ab\",\"data\":[{\"state\":8,\"reason\":0}]}},{\"_SignalingStateChanged\":{\"start\":702,\"causeId\":\"3d7d97ab\",\"data\":[{\"status\":\"ConnectedForRosterOnly\"}]}},{\"StartCall\":{\"start\":33065,\"duration\":2159,\"status\":\"Success\",\"causeId\":\"ed6ce501\"}},{\"_CallUsesMixer\":{\"start\":33067,\"causeId\":\"ed6ce501\",\"data\":[{\"newValue\":true}]}},{\"_setMaxVbssChannels\":{\"start\":33067,\"causeId\":\"ed6ce501\",\"data\":[{}]}},{\"_SetCallState\":{\"start\":33075,\"causeId\":\"ed6ce501\",\"data\":[{\"state\":2,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":33112,\"causeId\":\"ed6ce501\",\"data\":[{\"state\":2,\"reason\":0}]}},{\"_SetLocalAudio\":{\"start\":33114,\"causeId\":\"ed6ce501\",\"data\":[{\"value\":true}]}},{\"CreatingConference\":{\"start\":33114,\"causeId\":\"ed6ce501\"}},{\"_ReinvitelessConfig\":{\"start\":33114,\"causeId\":\"ed6ce501\",\"data\":[{\"reinvitelessConfig\":{\"maxReinvitelessMediaForVBSSMultiparty\":0,\"maxReinvitelessMediaForVideoMultiparty\":0}}]}},{\"CreatedConference\":{\"start\":33145,\"causeId\":\"ed6ce501\"}},{\"StartVideo\":{\"start\":33148,\"duration\":157,\"status\":\"Success\",\"causeId\":\"c4fc9a01\"}},{\"_StartPreviewVideo\":{\"start\":33149,\"duration\":146,\"status\":\"Success\",\"causeId\":\"c4fc9a01\"}},{\"_SetLocalVideo\":{\"start\":33305,\"causeId\":\"c4fc9a01\",\"data\":[{\"value\":true}]}},{\"_UpdateLocalParticipantStream\":{\"start\":34277,\"causeId\":\"ed6ce501\"}},{\"_SignalingStateChanged\":{\"start\":34281,\"causeId\":\"ed6ce501\",\"data\":[{\"status\":\"Connecting\"}]}},{\"_WebOnAnswer\":{\"start\":35076,\"causeId\":\"3177cac9\",\"data\":[{\"isRenegotiation\":false,\"isEscalation\":false,\"mediaTypes\":[\"Audio\",\"Video\",\"ScreenViewer\"],\"newOffer\":false}]}},{\"_CallModeChanged\":{\"start\":35076,\"causeId\":\"3177cac9\",\"data\":[{\"newCallMode\":1,\"oldCallMode\":0}]}},{\"_SignalingStateChanged\":{\"start\":35077,\"causeId\":\"3177cac9\",\"data\":[{\"status\":\"Connected\"}]}},{\"_SetCallState\":{\"start\":35077,\"causeId\":\"3177cac9\",\"data\":[{\"state\":10,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":35145,\"causeId\":\"3177cac9\",\"data\":[{\"state\":10,\"reason\":0}]}},{\"_UpdateLocalParticipantStream\":{\"start\":35146,\"causeId\":\"3177cac9\"}},{\"_ConnectCall\":{\"start\":35223,\"causeId\":\"ed6ce501\",\"data\":[{\"phases\":{\"InitializeMediaSession\":{\"t\":32},\"StartVideoSafe\":{\"t\":157},\"UpdateMediaModalities\":{\"t\":1},\"CreateOffer\":{\"t\":742},\"GetSignalingMediaTypes\":{\"t\":0},\"MuteUnmute\":{\"t\":2},\"MuteUnmuteSpeakers\":{\"t\":2},\"CallStart\":{\"t\":3},\"WaitForConnect\":{\"t\":1091},\"WaitForAnswer\":{\"t\":0},\"ProcessAnswer\":{\"t\":73},\"CompleteNegotiation\":{\"t\":2}}}]}}]}",
      "HostName": "teams.microsoft.com",
      "JoinedFrom": "MeetingCode",
      "MeetingCode": "39563371502184",
      "ComplianceRecordingContentLength": "0",
      "ConversationStartTime": "2025-11-14T20:15:26.3213066Z",
      "ClientType": "enterprise",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "light-meetings",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "emea",
      "Call.Type": "scheduledPrivateMeeting",
      "AppInfo.UserRole": "Anonymous",
      "AppInfo.UserType": "Anonymous",
      "DeviceInfo.Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  {
    "name": "mdsc_webrtc_session_initial",
    "time": "2025-11-14T20:16:00.830Z",
    "ver": "4.0",
    "iKey": "o:1cae5691997646c98b01d15beddae7a3",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 2,
        "installId": "7af01589-461d-4932-8f47-2b8619ce60e4",
        "epoch": "641428208"
      },
      "app": {
        "locale": "en",
        "sesId": "/oblfU2k0wsYLU3GMC3w6j"
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
      "intweb": {},
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "display_name": {
            "t": 33
          },
          "Extensions_IPAddress": {
            "t": 417
          },
          "Extensions_ReflexiveLocalIP": {
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
      "uiVersion": "1415/25110306401",
      "agent_environment_id": "760e92e2-9ab2-42aa-9a09-b08e9c22570e",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "participant_id": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "display_name": "Neil Rashbrook",
      "endpoint_id": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "media_leg_id": "1227147444F448C4B7C754AF8D086AF8",
      "ts_calling_version": "2025.43.01.3",
      "metrics_MediaLegId": "1227147444F448C4B7C754AF8D086AF8",
      "metrics_CreationTime": "17631513584830000",
      "metrics_CallNumber": "1",
      "metrics_SessionId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "metrics_MultiParty": "true",
      "metrics_ErrorType": "none",
      "metrics_IncompatibleOffer": "false",
      "metrics_TerminationTime": "NaN",
      "metrics_CallDuration": "23310000",
      "metrics_IceInitTime": "17631513605380000",
      "metrics_IceConnectedStateTime": "0",
      "metrics_NegotiationCount": "1",
      "metrics_RejectedNegotiationCount": "0",
      "metrics_InitialNegotiationCompleted": "true",
      "metrics_InitialNegotiationType": "Offering",
      "metrics_FinalAnswerTime": "17631513605800000",
      "metrics_TransportReconnectedCount": "0",
      "metrics_Relay": "{\"address\":\"euaz-msit.relay.teams.microsoft.com\",\"expires\":604800,\"realm\":\"\\\"rtcmedia\\\"\",\"credentials\":true,\"ports\":\"udp:3478,tcp:443,tls:443\",\"fqdns\":\"euaz-msit.relay.teams.microsoft.com\"}",
      "metrics_ActiveModalities": "{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"}",
      "metrics_AllowedAudioSend": "true",
      "metrics_AllowedVideoSend": "true",
      "metrics_AllowedScreensharingSend": "true",
      "metrics_RelayManager": "{\"config\":{\"Service\":{\"url\":\"https://teams.microsoft.com/trap-exp/\",\"tokenUrl\":\"https://teams.microsoft.com/trap-exp/tokens\",\"disabled\":false,\"supportedTokenTypes\":\"skype AAD CAE\"},\"Relay\":{\"Turn\":{\"addresses\":[\"euaz-msit.relay.teams.microsoft.com\"],\"fqdns\":[\"euaz-msit.relay.teams.microsoft.com\"],\"realm\":\"rtcmedia\",\"tcpPort\":443,\"tlsPort\":443,\"udpPort\":3478,\"url\":\"\"},\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478,\"Lync\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478},\"Skype\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478}},\"Token\":{\"earlyRefreshMinutes\":9720,\"earlyRefreshPercentage\":4}},\"stats\":{\"configFetch\":{\"time\":1763151323462,\"duration\":111,\"version\":2},\"skypeTokenFetch\":{\"time\":1763151323573,\"duration\":946,\"version\":2}}}",
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
      "metrics_Connection_Downlink": "10",
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
      "metrics_ETag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "metrics_ConfigIds": "P-E-1722294-2-6,P-E-1721421-2-6,P-E-1721405-2-6,P-E-1721382-C1-6,P-E-1720477-C1-6,P-E-1720297-2-6,P-E-1718756-2-6,P-E-1718359-2-6,P-E-1717750-2-6,P-E-1717237-2-8,P-E-1716081-2-8,P-E-1713802-C1-6,P-E-1713684-2-8,P-E-1705890-C1-5,P-E-1704515-C1-6,P-E-1700450-C1-7,P-E-1694641-C1-6,P-E-1691036-2-6,P-E-1680105-C1-6,P-E-1676936-C1-6,P-E-1675286-C1-6,P-E-1673335-2-3,P-E-1670133-C1-6,P-E-1660458-C1-5,P-E-1658080-3-11,P-E-1656524-2-6,P-E-1655667-C1-6,P-E-1651332-C1-6,P-E-1643648-2-6,P-E-1641797-2-6,P-E-1633843-C1-6,P-E-1621471-C1-6,P-E-1618933-C1-6,P-E-1617149-C1-6,P-E-1616887-C1-6,P-E-1616819-2-6,P-E-1613942-C1-6,P-E-1608951-C1-3,P-E-1608371-2-6,P-E-1603625-2-4,P-E-1598909-2-6,P-E-1580313-C1-5,P-E-1575172-C1-5,P-E-1574158-C1-10,P-E-1570390-2-6,P-E-1566952-C1-6,P-E-1568381-2-6,P-E-1566716-C1-10,P-E-1565836-C1-6,P-E-1565831-2-6,P-E-1544576-2-3,P-E-1224745-5-8,P-R-1665746-12-10,P-R-1645583-12-13,P-R-1634465-12-13,P-R-1633491-12-13,P-R-1632047-12-13,P-R-1630681-12-11,P-R-1613099-C11-10,P-R-1611700-12-14,P-R-1606855-12-14,P-R-1598296-12-12,P-R-1587774-12-12,P-R-1584387-12-13,P-R-1580901-12-15,P-R-1577920-12-13,P-R-1577892-18-3,P-R-1575005-12-10,P-R-1563326-12-14,P-R-1558616-12-17,P-R-1553816-12-12,P-R-1551350-12-15,P-R-1543947-12-13,P-R-1523352-12-14,P-R-1534344-12-13,P-R-1521918-12-9,P-R-1475504-12-14,P-R-1477139-12-19,P-R-1472589-12-28,P-R-1470220-12-11,P-R-1282626-12-35,P-R-1458723-12-13,P-R-1457926-12-2,P-R-1446888-12-17,P-R-1442911-12-17,P-R-1442161-12-17,P-R-1438633-12-12,P-R-1417298-12-18,P-R-1416330-12-20,P-R-1102981-9-69,P-R-1270215-12-8,P-R-1264668-12-16,P-R-1262976-12-11,P-R-1223031-9-9,P-R-1175069-9-8,P-R-1226424-9-4,P-R-1224690-9-9,P-R-1168166-9-10,P-R-1160589-9-7,P-R-1156430-9-6,P-R-1154814-3-6,P-R-1150013-9-11,P-R-1148658-9-8,P-R-1141462-9-23,P-R-1136249-9-9,P-R-1133113-9-8,P-R-1130598-9-10,P-R-1128207-9-28,P-R-1117564-9-10,P-R-1111900-9-79,P-R-1111902-9-11,P-R-1101306-9-6,P-R-1096762-9-24,P-R-1082715-9-35,P-R-1082433-9-23,P-R-1082359-9-14,P-R-1082351-9-12,P-R-1080906-6-6,P-R-1070816-6-19,P-R-1070395-1-8,P-R-1036090-19-62,P-R-1016745-11-11,P-R-1006078-1-32,P-R-115866-10-27,P-R-107136-10-42,P-R-96498-10-27,P-R-95572-41-185,P-R-94120-1-6,P-R-88231-9-17,P-R-79878-11-70,P-R-71785-7-16,P-R-63313-1-4,P-D-38372-1-4,P-D-27831-1-40,pe17222942:1038649,pe17214212:1038116,pe17214052:1038249,pe1721382c1:1038139,pe1720477c1:1037295,pe17202972:1037001,pe17187562:1036041,pe17183592:1035531,pe17177502:1034987,pe17172372:1039030,pe17160812:1038527,pe1713802c1:1031141,pe17136842:1035801,pe1705890c1:1024310,pe1704515c1:1023157,pe1700450c1:1027958,pe1694641c1:1018057,pe16910362:1013539,pe1680105c1:1010382,pe1676936c1:1006853,pe1675286c1:1005632,pe16733352:1004215,pe1670133c1:1002052,pe1660458c1:304475,pe16580803:1010370,pe16565242:301668,pe1655667c1:300925,pe1651332c1:296133,pe16436482:288428,pe16417972:286187,pe1633843c1:277835,pe1621471c1:266863,pe1618933c1:264580,pe1617149c1:262971,pe1616887c1:262653,pe16168192:262662,pe1613942c1:260004,pe16083712:254400,pe16036252:249604,pe15989092:245918,pe1580313c1:226954,pe1575172c1:222343,pe1574158c1:224393,pe15703902:219213,pe15683812:218198,pe1566716c1:228730,pe1565836c1:216042,pe15658312:216047",
      "metrics_GPUName": "ANGLE (Intel, Intel(R) HD Graphics Direct3D9Ex vs_3_0 ps_3_0, igdumd64.dll)",
      "metrics_PermissionStates": "{\"microphone\":\"granted\",\"camera\":\"granted\"}",
      "metrics_DeviceList": "[{\"label\":\"046d:0825 Cam\",\"kind\":\"microphone\"},{\"label\":\"046d:0825 Cam\",\"kind\":\"camera\"},{\"label\":\"High Definition\",\"kind\":\"speaker\"}]",
      "metrics_DeviceListDebug": "{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u9)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u10)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u11)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u9)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}",
      "metrics_DevicesChangeCount": "0",
      "metrics_DevicesPollChangeCount": "0",
      "metrics_DeviceSelectionChangeCount": "0",
      "metrics_DeviceSelectionChangeFromInterfaceCount": "0",
      "metrics_DevicesCount": "{\"microphone\":1,\"camera\":1,\"speaker\":1,\"compositeAudio\":0,\"audioIngestDevice\":0,\"virtualDevice\":0}",
      "metrics_DeviceEnumerationTimings": "{\"max\":2012,\"min\":7,\"avg\":167}",
      "metrics_UsedMicrophone": "046d:0825 Cam",
      "metrics_UsedSpeaker": "High Definition",
      "metrics_UsedCamera": "046d:0825 Cam",
      "metrics_DeviceEvents": "[{\"eventType\":\"permissions_state_changed\",\"timestamp\":-35147,\"payload\":{\"microphone\":\"prompt\",\"camera\":\"unknown\"}},{\"eventType\":\"permissions_state_changed\",\"timestamp\":-35145,\"payload\":{\"microphone\":\"prompt\",\"camera\":\"prompt\"}},{\"eventType\":\"selected_devices_changed\",\"timestamp\":-33145,\"payload\":{\"microphone\":\"\",\"camera\":\"\",\"speaker\":\"\",\"fromInterface\":false}},{\"eventType\":\"devices_changed\",\"timestamp\":-33144,\"payload\":{\"devices\":[{\"label\":\"\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{},\"groupId\":\"1\"},{\"label\":\"\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{},\"groupId\":\"1\"},{\"label\":\"\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"1\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u9)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u10)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u11)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u9)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"stream_created\",\"timestamp\":-33070,\"payload\":{\"id\":0,\"mediaType\":\"Video\"}},{\"eventType\":\"permissions_state_changed\",\"timestamp\":-23088,\"payload\":{\"microphone\":\"prompt\",\"camera\":\"granted\"}},{\"eventType\":\"permissions_state_changed\",\"timestamp\":-23087,\"payload\":{\"microphone\":\"granted\",\"camera\":\"granted\"}},{\"eventType\":\"selected_devices_changed\",\"timestamp\":-23067,\"payload\":{\"microphone\":\"046d:0825 Cam\",\"camera\":\"046d:0825 Cam\",\"speaker\":\"High Definition\",\"fromInterface\":false}},{\"eventType\":\"devices_changed\",\"timestamp\":-23066,\"payload\":{\"devices\":[{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{\"autoGainControl\":[true,false],\"channelCount\":{\"max\":1,\"min\":1},\"echoCancellation\":[true,false,\"remote-only\"],\"latency\":{\"max\":0.01,\"min\":0},\"noiseSuppression\":[true,false],\"sampleRate\":{\"max\":48000,\"min\":48000},\"sampleSize\":{\"max\":16,\"min\":16},\"voiceIsolation\":[true,false]},\"groupId\":\"1\"},{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{\"aspectRatio\":{\"max\":1280,\"min\":0.0010416666666666667},\"facingMode\":[],\"frameRate\":{\"max\":30,\"min\":1},\"height\":{\"max\":960,\"min\":1},\"resizeMode\":[\"none\",\"crop-and-scale\"],\"width\":{\"max\":1280,\"min\":1}},\"groupId\":\"1\"},{\"label\":\"High Definition\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"2\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u9)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u10)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u11)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u9)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"stream_acquired\",\"timestamp\":-21414,\"payload\":{\"id\":0,\"mediaType\":\"Video\",\"timestamp\":11650,\"resolution\":{\"width\":1280,\"height\":720},\"withAudio\":true,\"sampleRate\":48000}},{\"eventType\":\"ask_device_permission\",\"timestamp\":-21410,\"payload\":{\"resultConstraints\":{\"audio\":true,\"video\":true},\"reason\":\"stream_acquisition\"}},{\"eventType\":\"stream_disposed\",\"timestamp\":-21051,\"payload\":{\"id\":0,\"mediaType\":\"Video\"}},{\"eventType\":\"stream_created\",\"timestamp\":-21050,\"payload\":{\"id\":1,\"mediaType\":\"Video\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":-18758,\"payload\":{\"id\":1,\"mediaType\":\"Video\",\"timestamp\":2290,\"resolution\":{\"width\":1280,\"height\":720},\"withAudio\":false}},{\"eventType\":\"stream_created\",\"timestamp\":25,\"payload\":{\"id\":2,\"mediaType\":\"Video\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":159,\"payload\":{\"id\":2,\"mediaType\":\"Video\",\"timestamp\":132,\"resolution\":{\"width\":1280,\"height\":720},\"withAudio\":false}},{\"eventType\":\"stream_created\",\"timestamp\":227,\"payload\":{\"id\":3,\"mediaType\":\"Audio\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":620,\"payload\":{\"id\":3,\"mediaType\":\"Audio\",\"timestamp\":73,\"sampleRate\":16000}}]",
      "metrics_WorkerEvents": "[{\"timestamp\":522,\"workerType\":\"wasmvqe\",\"workerLoadTimeMs\":183,\"msg\":\"\\\"wasm-worker-loaded\\\"\"}]",
      "metrics_MediaByPassEnabled": "false",
      "metrics_DominantSpeaker": "{\"activeStrategy\":\"client\",\"changedCountContributingSources\":2,\"changedCountDSH\":0}",
      "metrics_AudioSourceNumOfReopenRequests": "1",
      "metrics_AudioSourceNumOfSuccessfulReopens": "1",
      "metrics_AudioCaptureErrorCodeFlagsInit": "0",
      "metrics_AudioRenderErrorCodeFlagsInit": "0",
      "metrics_AudioSinkNumOfReopenRequests": "0",
      "metrics_AudioSinkNumOfSuccessfulReopens": "0",
      "metrics_MicUnmutedButSilent": "false",
      "metrics_MicUnmutedButSilentUnreliable": "false",
      "metrics_CallSetupTimeTracker": "{\"createOfferAsync\":[[{\"name\":\"queryRelaysAsync\",\"duration\":0.4,\"ts\":1763151358667.5,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"checkVideoCodecsSupport\",\"duration\":5.6,\"ts\":1763151358667.9,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"encStreamsManagerInitialize\",\"duration\":0.2,\"ts\":1763151358676.8,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"initAudioCodec\",\"duration\":0.9,\"ts\":1763151358676.8,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"assurePeerConnectionAsync\",\"duration\":11,\"ts\":1763151358666.8,\"parentName\":\"createOfferAsync\"},{\"name\":\"updateStreamsWithModalities\",\"duration\":395.7,\"ts\":1763151358708.9,\"parentName\":\"createOfferAsync|updateStreams\"},{\"name\":\"updateSenders\",\"duration\":44.8,\"ts\":1763151359104.6,\"parentName\":\"createOfferAsync|updateStreams\"},{\"name\":\"assureStreamsAndDataChannel\",\"duration\":472.4,\"ts\":1763151358677.8,\"parentName\":\"createOfferAsync\"},{\"name\":\"createOffer\",\"duration\":50.8,\"ts\":1763151359150.2,\"parentName\":\"createOfferAsync\"},{\"name\":\"sLD\",\"duration\":140.6,\"ts\":1763151359201,\"parentName\":\"createOfferAsync\"},{\"name\":\"candidates\",\"duration\":34,\"ts\":1763151359341.6,\"parentName\":\"createOfferAsync\"},{\"name\":\"createOfferAsync\",\"duration\":739,\"ts\":1763151358666.8,\"parentName\":\"\"},{\"name\":\"transportConnected\",\"duration\":238,\"ts\":1763151360574.7,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"}]],\"processAnswerAsync\":[[{\"name\":\"streamSendersManagerUpdate\",\"duration\":30,\"ts\":1763151360507.1,\"parentName\":\"processAnswerAsync\"},{\"name\":\"setRemoteDescription\",\"duration\":33.5,\"ts\":1763151360538.2,\"parentName\":\"processAnswerAsync\"},{\"name\":\"streamSendersManagerActivate\",\"duration\":3.3,\"ts\":1763151360571.7,\"parentName\":\"processAnswerAsync\"},{\"name\":\"processAnswerAsync\",\"duration\":71.9,\"ts\":1763151360507.1,\"parentName\":\"\"}]]}",
      "metrics_BrowserFingerprint": "{\"webdriver\":false,\"pluginsLength\":5,\"languageLength\":1,\"mimeTypesLength\":2,\"outerWidth\":1024,\"outerHeight\":728,\"innerWidth\":1024,\"innerHeight\":641,\"clientWidth\":1024,\"clientHeight\":641,\"loadEventEnd\":2077.9000000953674,\"loadEventStart\":2077.7999999523163,\"hasChrome\":true,\"hasPlaywright\":false,\"hasSelenium\":false,\"hasNightmare\":false,\"hasPhantom\":false,\"hasCypress\":false}",
      "metrics_ReportGenerationTimeMs": "6.7",
      "metrics_piiFields": "{\"IPAddress\":\"IPv4\",\"ReflexiveLocalIP\":\"IPv4\",\"pair_googLocalAddress\":\"IPv4\",\"pair_googRemoteAddress\":\"IPv4\"}",
      "Extensions_WebRTCStats_data_bytesReceived": "0",
      "Extensions_WebRTCStats_data_bytesSent": "0",
      "Extensions_WebRTCStats_data_dataChannelIdentifier": "0",
      "Extensions_WebRTCStats_data_label": "main-channel",
      "Extensions_WebRTCStats_data_messagesReceived": "0",
      "Extensions_WebRTCStats_data_messagesSent": "0",
      "Extensions_WebRTCStats_data_state": "connecting",
      "Extensions_WebRTCStats_data_timestamp": "1763151360671.27",
      "Extensions_Data_SessionState": "Active",
      "Extensions_BundlePolicy": "max-bundle",
      "Extensions_FakeIceCandidate": "false",
      "Extensions_h264AvailableProfiles": "[\"42001f\",\"42e01f\",\"4d001f\",\"f4001f\"]",
      "Extensions_h264CodecCapabilities": "{\"sendProfiles\":[\"42001f\",\"42e01f\",\"4d001f\"],\"receiveProfiles\":[\"42001f\",\"42e01f\",\"4d001f\",\"f4001f\"]}",
      "Extensions_IceConnectionState": "connected",
      "Extensions_IceConnectionStatePrevious": "checking",
      "Extensions_IceServers": "[{\"urls\":[\"turn:euaz-msit.relay.teams.microsoft.com:3478?transport=udp\",\"turn:euaz-msit.relay.teams.microsoft.com:443?transport=tcp\",\"turns:euaz-msit.relay.teams.microsoft.com:443\"],\"credential\":\"true\",\"username\":\"true\"}]",
      "Extensions_IceTransportPolicy": "all",
      "Extensions_NegotiatedSrtp": "\"dtls\"",
      "Extensions_OfferedSrtp": "\"unknown\"",
      "Extensions_RelayCandidate": "{\"priority\":\"41886207\",\"time\":328}",
      "Extensions_SdpSemantics": "unified-plan",
      "Extensions_SignalingState": "stable",
      "Extensions_SignalingStatePrevious": "have-local-offer",
      "Extensions_MaxSessionBandwidth": "4000",
      "Extensions_Bandwidth_uplinkStabilizationTime": "{\"time\":1,\"finished\":false,\"modality\":\"audio, video\"}",
      "Extensions_totalVideoControlMessages": "0",
      "Extensions_outOfOrderVideoControlMessages": "0",
      "Extensions_webcamFreezeIntervals": "0",
      "Extensions_processedStreamFreezeIntervals": "0",
      "Extensions_ReinvitelessContext": "{\"enabled\":false,\"maxStreamsForModality\":{\"video\":0,\"sharing\":0}}",
      "Extensions_IPAddress": "192.168.255.11",
      "Extensions_ReflexiveLocalIP": "82.19.9.88",
      "Extensions_NumberOfInterfaces": "1",
      "Extensions_StartTime": "1763151358483",
      "Extensions_AudioPayloadSendBitrate": "0",
      "Extensions_AvgBwSendSide": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_id": "OT01A1972349281",
      "Extensions_WebRTCStats_ssrc_audio_send_ssrc": "1972349281",
      "Extensions_WebRTCStats_ssrc_audio_send_mediaType": "audio",
      "Extensions_WebRTCStats_ssrc_audio_send_bytesSent": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_packetsSent": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_googCodecName": "OPUS",
      "Extensions_WebRTCStats_ssrc_audio_send_googTrackId": "271b5e3c-2f6b-4a86-8622-7cf8dd640ee8",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_id": "T01",
      "Extensions_WebRTCStats_ssrc_audio_send_transportId": "T01",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_selectedCandidatePairId": "CP1BQ5NPl4_xDp/0LIo",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_localCertificateId": "CF9A:77:9A:9E:BB:1C:ED:11:2E:84:23:61:7C:6D:19:0D:77:4B:0F:C1:32:A5:18:60:59:A7:08:CC:A6:E1:0C:2D",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_id": "CP1BQ5NPl4_xDp/0LIo",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesSent": "1",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsReceived": "1",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteCandidateType": "relay",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_consentRequestsSent": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googTransportType": "udp",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalCandidateType": "srflx",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googWritable": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsSent": "1",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRtt": "98",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googActiveConnection": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsDiscardedOnSend": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesReceived": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesReceived": "1",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_remoteCandidateId": "IxDp/0LIo",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_localCandidateId": "I1BQ5NPl4",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsSent": "1",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalAddress": "82.19.9.88",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteAddress": "52.112.143.212",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesSent": "216",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googReadable": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_audioInputLevel": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_totalAudioEnergy": "0.0000011129332111012067",
      "Extensions_WebRTCStats_ssrc_audio_send_totalSamplesDuration": "1.340000000000001",
      "Extensions_Audio_send_rttAvg": "0",
      "Extensions_Audio_send_rttMax": "0",
      "Extensions_Audio_send_RawInputVolume": "0",
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
      "Extensions_AudioCodecEvents": "\"none\"",
      "Extensions_HevcCodecSupport": "[{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false}]",
      "Extensions_IsPstnCall": "false",
      "Extensions_UsesMixer": "true",
      "Extensions_InitialBWSeed": "600000",
      "Extensions_SentBWSeed": "600000",
      "Extensions_EarlyMedia_NumStatsPolls": "0",
      "Extensions_TimeToFirstAudioPacket": "0",
      "Extensions_FetchTimeMax": "2.4",
      "Extensions_FetchTimeMedian": "2.4",
      "Extensions_LoopIntervalMax": "-1",
      "Extensions_LoopIntervalMedian": "-1",
      "trouterUrl": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "light-meetings",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "emea",
      "Call.Type": "scheduledPrivateMeeting",
      "AppInfo.UserRole": "Anonymous",
      "AppInfo.UserType": "Anonymous",
      "DeviceInfo.Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  ```
  ```json
  {
    "acc": 2,
    "webResult": {
      "msfpc": "GUID=14c39fdda73d46fe86c87ebef336b5c5&HASH=14c3&LV=202511&V=4&LU=1763151320843",
      "mc1": "14c39fdda73d46fe86c87ebef336b5c5"
    }
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103",
    "expirationTimeInSec": 30
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103`
  ```json
  {
    "message": "",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103",
    "expirationTimeInSec": 30
  }
  ```
- POST `https://teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:58.325Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 19,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingPreJoinV2ConnectingScreen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingPreJoinV2ConnectingScreen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:58.369Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 20,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingAnonPreJoinV2Screen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingAnonPreJoinV2Screen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:58.393Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 21,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingAnonPreJoinV2Screen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingAnonPreJoinV2Screen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:58.419Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 22,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingAnonPreJoinV2Screen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingAnonPreJoinV2Screen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:58.443Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 23,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingPreJoinV2ConnectingScreen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingPreJoinV2ConnectingScreen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:15:58.463Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 24,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingPreJoinV2ConnectingScreen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingPreJoinV2ConnectingScreen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:00.467Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 26,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingPreJoinV2LobbyScreen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingPreJoinV2LobbyScreen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:00.493Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 27,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingPreJoinV2LobbyScreen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingPreJoinV2LobbyScreen",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-14T20:15:59.625Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 25,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Ring": "general",
      "Region": "emea",
      "ClientType": "enterprise",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "SignalingSessionId": "6a321b68-62a3-4286-b9f1-6cd2601d1a78",
      "ClientInformation": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "NetworkRequestBag": "{\"eventStart\":1763151325358,\"events\":{\"name\":\"POST-StartCall\",\"url\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687\",\"eventStart\":34056,\"trouterReady\":0,\"requestReady\":1,\"status\":200,\"attempts\":[{\"status\":200,\"start\":2,\"end\":211,\"online\":1}],\"rtt\":211,\"uid\":\"db2844fe-f2c6-4e63-9160-f0f3cdcf62a0\",\"causeId\":\"ed6ce501\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[200,1000,5000],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":15000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"enabledForMeetings\"]},\"enableRequestHedging\":true,\"tokenTelemetries\":[{\"requestCauseId\":\"ed6ce501\",\"supportTokenApi\":false,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"POST\\\",\\\"path\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687\\\"}\",\"tokenRequestTime\":1763151359415,\"tokenResponseTime\":1763151359415,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":0}]}}",
      "EcsEtag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-14T20:16:00.947Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 28,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Ring": "general",
      "Region": "emea",
      "ClientType": "enterprise",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "SignalingSessionId": "6a321b68-62a3-4286-b9f1-6cd2601d1a78",
      "ClientInformation": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "NetworkRequestBag": "{\"eventStart\":1763151325358,\"events\":{\"name\":\"POST-SendApplyChannelParameters\",\"url\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/k27/525/applyChannelParameters?i=10-128-210-112&e=638985327425314572\",\"eventStart\":35467,\"trouterReady\":6,\"requestReady\":6,\"status\":202,\"attempts\":[{\"status\":202,\"start\":14,\"end\":121,\"online\":1}],\"rtt\":122,\"uid\":\"1c18e3cd-a56d-43b1-b702-9236837440a9\",\"causeId\":\"c7b398a4\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[200,1000,5000],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":15000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"enabled\"]},\"enableRequestHedging\":true,\"tokenTelemetries\":[{\"requestCauseId\":\"c7b398a4\",\"supportTokenApi\":false,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"POST\\\",\\\"path\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/k27/525/applyChannelParameters?i=10-128-210-112&e=638985327425314572\\\"}\",\"tokenRequestTime\":1763151360831,\"tokenResponseTime\":1763151360831,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":0}]}}",
      "EcsEtag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  ```
  ```json
  {
    "acc": 10
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/0?i=10-128-19-103`
  ```json
  {
    "message": "H4sIAAAAAAAACtWS32rbMBTG7wN5B6PbRbYky7KtEFjpGO3atIGEMRilSLLkerEtz5JD/9B3n5qu3U1fYALBQdL3O9930OZ6u4uSA01MYh7Xtxt2W17vL+7EzvT7bxcG14kSbXtS694nTKQES1ZARkQKKSkYlKXBkKmKMIQrLPIiSXUuGVXkqEuU7f1o2+9Npe3Wj1p0TV8n0dlut0lwjOezM+s8j4ZJwtABOq00xBiaOKgmr8fYB4mLu0aN1lnjY2U7nlKazmc/4PrtFG73D4OGp3ei6eH5Fx6hjKUlVhk0WjJIS4ZgSVAJU1YVChmFpc4+Iqy1c6LWR0aJKspCKChKFNLmhEJpTAFLjKoU01zJTMxnpyHgi/NdkPNIDEPbKOEb2yeHvordCzXuVHwgMfr0y9n+n+JS97W/41GGg5X57Al8OCvAn4DTvyfdK301dVKPgLMFqFsrRbtrOr31ohsABxgnmCYEkSwqOM45yqLNGizeqOe9sYD/fO8COFoAZ6dR6fMKcIqzBTCd34gxzDvgLvTD11DqFV524h7KcRUi58faDG6VIoTisMN6PXMrguhr3cnwgGESrsamCgDnRrXCKEe4TGlRLg+tgJWWU73CpED3OUGfcXaPUUmWw2hN02rY6oNuYVBTcorIyXIQaq9983gcLexsFYyFcO+OLxvnQ7z/wvbN883zAhxJf/8C4P3Uts9/ANgIvA+MAwAA",
    "nextSubscribeUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/1?i=10-128-19-103",
    "expirationTimeInSec": 30
  }
  ```
- POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/t/981/answer?i=10-128-210-112`
  ```json
  {
    "mediaAnswer": {
      "callModalities": [
        "Audio",
        "Video",
        "ScreenViewer"
      ],
      "sender": {
        "id": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
        "displayName": "Neil Rashbrook",
        "endpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
        "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
        "languageId": "en-us"
      },
      "links": {
        "mediaAcknowledgement": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/fae22cbb/call/mediaAcknowledgement/"
      },
      "clientContentForMediaController": {
        "controlVideoStreaming": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/3e7b64c2/call/controlVideoStreaming/",
        "csrcInfo": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/d7649a30/call/csrcInfo/"
      },
      "mediaContent": {
        "blob": "v=0\r\no=- 1925585870716461205 2 IN IP4 127.0.0.1\r\ns=-\r\nb=CT:4000\r\nt=0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS *\r\na=group:BUNDLE 1 2 5 6 7 8 9 10 11 12 13 3 4\r\nm=audio 55539 RTP/SAVP 96 102 9 0 8 97 101 13\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app recv:dsh\r\na=x-ssrc-range:4261247557-4261247557\r\na=rtpmap:96 CN/48000\r\na=rtpmap:102 OPUS/48000/2\r\na=rtpmap:9 G722/8000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:97 RED/8000\r\na=rtpmap:101 telephone-event/8000\r\na=rtpmap:13 CN/8000\r\na=fmtp:102 minptime=10;useinbandfec=1\r\na=fmtp:97 102/102\r\na=rtcp-fb:102 transport-cc\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=setup:active\r\na=mid:1\r\na=sendrecv\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=candidate:1156052646 1 udp 2122260223 192.168.255.11 55539 typ host\r\na=ice-options:trickle\r\na=ssrc:4261247557 cname:hZZ8nHPBdEOcI64I\r\na=ssrc:4261247557 msid:e2c3eb65-fce6-406f-8451-a7f865275a76 fa121481-fd4f-428c-bd19-6011e8118b12\r\na=rtcp-mux\r\na=label:main-audio\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1070193489-1070193588\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:2\r\na=sendrecv\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1070193489 fake_attribute:fake_value\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:5\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:6\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:7\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:8\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:9\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:10\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:11\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:12\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:13\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 116 99 112\r\nc=IN IP4 192.168.255.11\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:116 AV1/90000\r\na=rtpmap:99 rtx/90000\r\na=rtpmap:112 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=135000;max-fps=1500\r\na=fmtp:116 level-idx=5;profile=0;tier=0\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fmtp:112 apt=116;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:3\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:applicationsharing-video\r\nm=x-data 55539 RTP/SAVP 127 126\r\nc=IN IP4 192.168.255.11\r\na=x-data-protocol:sctp\r\na=x-ssrc-range:1412344351-1412344351\r\na=rtpmap:127 x-data/90000\r\na=rtpmap:126 rtx/90000\r\na=fmtp:126 apt=127\r\na=setup:active\r\na=mid:4\r\na=sendrecv\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=rtcp-mux\r\na=label:data\r\na=sctp-port:5000\r\n",
        "contentType": "application/sdp-ngc-1.0",
        "clientLocation": "GB",
        "applyChannelParameters": {
          "multiChannelParameter": {
            "mids": [
              "*"
            ],
            "mediaParameter": "{\"sendSideBWSeed\":{\"seedValueBitsPerSec\":600000}}"
          }
        },
        "mediaLegId": "9495a715-0c01-4878-857b-8d7605c7cb42"
      }
    },
    "debugContent": {
      "callId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "endpointId": "acf94055-9e12-48aa-ba91-70f41e300e40"
    }
  }
  ```
- POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/00c6d532-771d-4c57-9973-89d0bb713212/874/k27/2065/applyChannelParameters?i=10-128-210-112&e=638985327425314572`
  ```json
  {
    "applyChannelParameters": {
      "multiChannelParameter": {
        "mids": [
          "2"
        ],
        "mediaParameter": "{\"maxVideoSendCapabilities\":{\"caps\":{\"max-width\":1280,\"max-height\":1280,\"max-fps\":30,\"max-streams\":3,\"max-layers\":3,\"sequence-number\":3}}}"
      }
    }
  }
  ```
- GET `wss://emea.pptservicescast.officeapps.live.com/StateServiceHandler.ashx?docId=call_056391c5-feb6-4960-9209-36d8c0fc1be5&clientType=Teams&cid=1c48806a-aea1-4261-83b8-6160766362eb&routing=true&clientId=ae704c8a-1663-4f08-8798-af1543ca2a24`
- POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/00c6d532-771d-4c57-9973-89d0bb713212/874/t/2470/answer?i=10-128-210-112`
  ```json
  {
    "mediaAnswer": {
      "callModalities": [
        "Audio",
        "Video",
        "ScreenViewer"
      ],
      "sender": {
        "id": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
        "displayName": "Neil Rashbrook",
        "endpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
        "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
        "languageId": "en-us"
      },
      "links": {
        "mediaAcknowledgement": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/b98cfe07/call/mediaAcknowledgement/"
      },
      "clientContentForMediaController": {
        "controlVideoStreaming": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/21506607/call/controlVideoStreaming/",
        "csrcInfo": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/callAgent/6a321b68-62a3-4286-b9f1-6cd2601d1a78/d19b4cf2/call/csrcInfo/"
      },
      "mediaContent": {
        "blob": "v=0\r\no=- 1925585870716461205 3 IN IP4 127.0.0.1\r\ns=-\r\nb=CT:4000\r\nt=0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS *\r\na=group:BUNDLE 1 2 5 6 7 8 9 10 11 12 13 3 4\r\nm=audio 55539 RTP/SAVP 102 9 0 8 97 101 13 120\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app recv:dsh\r\na=x-ssrc-range:4261247557-4261247557\r\na=rtpmap:102 OPUS/48000/2\r\na=rtpmap:9 G722/8000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:97 RED/8000\r\na=rtpmap:101 telephone-event/8000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:120 CN/48000\r\na=fmtp:102 minptime=10;useinbandfec=1\r\na=fmtp:97 102/102\r\na=rtcp-fb:102 transport-cc\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=setup:active\r\na=mid:1\r\na=msid:e2c3eb65-fce6-406f-8451-a7f865275a76 fa121481-fd4f-428c-bd19-6011e8118b12\r\na=sendrecv\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=candidate:1156052646 1 udp 2122260223 192.168.255.11 55539 typ host\r\na=candidate:3125617202 1 tcp-act 1518280447 192.168.255.11 9 typ host\r\na=candidate:3526332543 1 udp 1686052607 82.19.9.88 55539 typ srflx raddr 192.168.255.11 rport 55539\r\na=ice-options:trickle\r\na=ssrc:4261247557 cname:hZZ8nHPBdEOcI64I\r\na=ssrc:4261247557 msid:e2c3eb65-fce6-406f-8451-a7f865275a76 fa121481-fd4f-428c-bd19-6011e8118b12\r\na=rtcp-mux\r\na=label:main-audio\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1070193489-1070193588\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:2\r\na=msid:- 2aa41bbf-75dd-4713-8772-acf01348e0c3\r\na=sendrecv\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1070193489 fake_attribute:fake_value\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:5\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:6\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:7\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:8\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:9\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:10\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:11\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:12\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 99\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:99 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:13\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 55539 RTP/SAVP 107 116 99 112\r\nc=IN IP4 82.19.9.88\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:1-1\r\na=rtpmap:107 H264/90000\r\na=rtpmap:116 AV1/90000\r\na=rtpmap:99 rtx/90000\r\na=rtpmap:112 rtx/90000\r\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f;max-fs=8160;max-mbps=135000;max-fps=1500\r\na=fmtp:116 level-idx=5;profile=0;tier=0\r\na=fmtp:99 apt=107;rtx-time=3000\r\na=fmtp:112 apt=116;rtx-time=3000\r\na=rtcp-fb:* goog-remb\r\na=rtcp-fb:* transport-cc\r\na=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack\r\na=rtcp-fb:* nack pli\r\na=extmap:1 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:7 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:8 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00-non-advertised\r\na=setup:active\r\na=mid:3\r\na=recvonly\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=ssrc:1 cname:d3ec83f7b1024f09b0ea79d04e0f60de\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:applicationsharing-video\r\nm=x-data 55539 RTP/SAVP 127 126\r\nc=IN IP4 82.19.9.88\r\na=x-data-protocol:sctp\r\na=x-ssrc-range:1170854121-1170854121\r\na=rtpmap:127 x-data/90000\r\na=rtpmap:126 rtx/90000\r\na=fmtp:126 apt=127\r\na=setup:active\r\na=mid:4\r\na=sendrecv\r\na=ice-ufrag:NdQa\r\na=ice-pwd:aSy7xbl9Z/xhtrL3CR/b73d3\r\na=fingerprint:sha-256 5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A\r\na=ice-options:trickle\r\na=rtcp-mux\r\na=label:data\r\na=sctp-port:5000\r\n",
        "contentType": "application/sdp-ngc-1.0",
        "clientLocation": "GB",
        "applyChannelParameters": {
          "multiChannelParameter": {
            "mids": [
              "*"
            ],
            "mediaParameter": "{\"sendSideBWSeed\":{\"seedValueBitsPerSec\":600000}}"
          }
        },
        "mediaLegId": "9495a715-0c01-4878-857b-8d7605c7cb42"
      }
    },
    "debugContent": {
      "callId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "endpointId": "acf94055-9e12-48aa-ba91-70f41e300e40"
    }
  }
  ```
- POST `https://teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:49.297Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 29,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_MeetingPreJoinV2LobbyScreenPresenterConnected",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "LaunchMethod": "direct",
        "Region": "main",
        "Type": "MeetingPreJoinV2LobbyScreenPresenterConnected",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:51.520Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 31,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_callingScreen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Panel": {
        "Region": "main",
        "Type": "callingScreen",
        "WindowID": "main",
        "Context": "main"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:16:52.354Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 32,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "join_or_create_meetup_from_link",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "join_or_create_meetup_from_link",
        "SpanId": "caa5f19420b180d9",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "join_or_create_meetup_from_link",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"getUserMedia\",\"delta\":49,\"elapsed\":3218,\"sequence\":1,\"stepDelta\":49},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"pause\",\"delta\":49,\"elapsed\":15085,\"sequence\":2,\"stepDelta\":11867},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"prejoin_screen_rendered\",\"delta\":108,\"elapsed\":15144,\"sequence\":3,\"stepDelta\":59},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"pause\",\"delta\":108,\"elapsed\":36126,\"sequence\":4,\"stepDelta\":20982},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"trigger_meeting_join\",\"delta\":108,\"elapsed\":36126,\"sequence\":5,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"start_meeting\",\"delta\":137,\"elapsed\":36155,\"sequence\":6,\"stepDelta\":29},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"updateDisplayNameIfNeeded\",\"delta\":148,\"elapsed\":36166,\"sequence\":7,\"stepDelta\":11},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"creating_call\",\"delta\":152,\"elapsed\":36170,\"sequence\":8,\"stepDelta\":4},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"create_call\",\"delta\":153,\"elapsed\":36171,\"sequence\":9,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_created\",\"delta\":153,\"elapsed\":36171,\"sequence\":10,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"pre_internal_join\",\"delta\":199,\"elapsed\":36217,\"sequence\":11,\"stepDelta\":46},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"slimcore_api_join_invoked\",\"delta\":224,\"elapsed\":36242,\"sequence\":12,\"stepDelta\":25},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"connecting\",\"delta\":311,\"elapsed\":36329,\"sequence\":13,\"stepDelta\":87},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"call_in_lobby\",\"delta\":2306,\"elapsed\":38324,\"sequence\":14,\"stepDelta\":1995},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"pause\",\"delta\":2308,\"elapsed\":90168,\"sequence\":15,\"stepDelta\":51844},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"connected\",\"delta\":2310,\"elapsed\":90170,\"sequence\":16,\"stepDelta\":2},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":2311,\"elapsed\":90171,\"sequence\":17,\"stepDelta\":1,\"previousStep\":\"connected\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"pauseReason\":\"get-user-media\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\",\"pauseReason\":\"pre-join-screen\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\",\"createCallWithGroupId_CallObjectExists\":true,\"createCallWithGroupId_threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"createCallWithGroupId_NewCallId\":\"f57a3fb1-8460-4b42-b8e8-7b81a28c1555\",\"createCallWithGroupId_NewParticipantId\":\"06110c9a-ad77-4f8f-bc4b-50cec8b0e87d\",\"createCallWithGroupId_messageId\":\"0\",\"createCallWithGroupId_conversationId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\",\"deeplinkId\":\"34ab99ed-fccc-4f1b-8174-cce0809b6e3a\",\"correlationId\":\"35a4136a-e5bb-4d92-afe2-3fd4e265d0cc\",\"joinWithCode\":false,\"meetingCode\":\"\",\"tsCallingVersion\":\"2025.43.01.3\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\",\"deeplinkId\":\"34ab99ed-fccc-4f1b-8174-cce0809b6e3a\",\"correlationId\":\"35a4136a-e5bb-4d92-afe2-3fd4e265d0cc\",\"joinWithCode\":false,\"meetingCode\":\"\",\"tsCallingVersion\":\"2025.43.01.3\",\"callParticipantUserRole\":\"anonymous\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\",\"deeplinkId\":\"34ab99ed-fccc-4f1b-8174-cce0809b6e3a\",\"correlationId\":\"35a4136a-e5bb-4d92-afe2-3fd4e265d0cc\",\"joinWithCode\":false,\"meetingCode\":\"\",\"tsCallingVersion\":\"2025.43.01.3\",\"callParticipantUserRole\":\"anonymous\",\"wasPreheatAttempted\":false,\"wasPreheatCompleted\":false},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\",\"deeplinkId\":\"34ab99ed-fccc-4f1b-8174-cce0809b6e3a\",\"correlationId\":\"35a4136a-e5bb-4d92-afe2-3fd4e265d0cc\",\"joinWithCode\":false,\"meetingCode\":\"\",\"tsCallingVersion\":\"2025.43.01.3\",\"callParticipantUserRole\":\"anonymous\",\"wasPreheatAttempted\":false,\"wasPreheatCompleted\":false,\"wasInLobby\":true},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\",\"deeplinkId\":\"34ab99ed-fccc-4f1b-8174-cce0809b6e3a\",\"correlationId\":\"35a4136a-e5bb-4d92-afe2-3fd4e265d0cc\",\"joinWithCode\":false,\"meetingCode\":\"\",\"tsCallingVersion\":\"2025.43.01.3\",\"callParticipantUserRole\":\"anonymous\",\"wasPreheatAttempted\":false,\"wasPreheatCompleted\":false,\"wasInLobby\":true,\"pauseReason\":\"in_lobby\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":true,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\",\"deeplinkId\":\"34ab99ed-fccc-4f1b-8174-cce0809b6e3a\",\"correlationId\":\"35a4136a-e5bb-4d92-afe2-3fd4e265d0cc\",\"joinWithCode\":false,\"meetingCode\":\"\",\"tsCallingVersion\":\"2025.43.01.3\",\"callParticipantUserRole\":\"anonymous\",\"wasPreheatAttempted\":false,\"wasPreheatCompleted\":false,\"wasInLobby\":true,\"isScreenshareFromChat\":false},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"context\":\"DeepLink\",\"observableSuccess\":true,\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callMode\":0,\"callType\":2,\"teamsCallId\":1,\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"wasPoppedOut\":false,\"isVideoOn\":false,\"isMuted\":false,\"threadId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"stagingRoomEnabled\":false,\"stagingRoomEventActive\":false,\"stagingRoomEventEnded\":false,\"trouterState\":\"Connected\",\"trouterClientState\":\"Connected\",\"trouterUrls\":\"https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/\",\"isManagedModeEnabled\":false,\"selectedCameraId\":\"camera:\",\"selectedMicrophoneId\":\"microphone:\",\"selectedSpeakerId\":\"speaker:\",\"isMultilingualMeeting\":false,\"isMultilingualMeetingOptionEnabled\":false,\"isAiInterpreterEnabled\":null,\"isOneToOnePstnCall\":false,\"messageId\":\"0\",\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"streamingData\":{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false},\"hasCommentStream\":false,\"conversationType\":\"scheduledMeeting\",\"allowRegisteredUsersToBypassLobby\":false,\"disableLobby\":false,\"callSchedulingDetails\":{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"},\"attendeeViewModes\":\"Default\",\"productionStudioMode\":\"Off\",\"productionMeetingType\":\"\",\"watermarkVideoEnabled\":false,\"watermarkScreenShareEnabled\":false,\"meetingEndToEndEncryptionEnabled\":false,\"callingDataBag\":\"{\\\"botDetectionResult\\\":{\\\"type\\\":\\\"botDetectionResult\\\",\\\"score\\\":74,\\\"verdict\\\":\\\"human\\\",\\\"reasons\\\":[],\\\"metrics\\\":{\\\"mean\\\":0.06458333134651184,\\\"variance\\\":0.013953995497695418,\\\"powMs\\\":559.2000000476837,\\\"powHash\\\":\\\"5fa\\\",\\\"nav\\\":{\\\"webdriver\\\":false,\\\"plugins\\\":5,\\\"hc\\\":4,\\\"devMem\\\":8,\\\"tz\\\":\\\"Europe/London\\\"}}}}\",\"deeplinkId\":\"34ab99ed-fccc-4f1b-8174-cce0809b6e3a\",\"correlationId\":\"35a4136a-e5bb-4d92-afe2-3fd4e265d0cc\",\"joinWithCode\":false,\"meetingCode\":\"\",\"tsCallingVersion\":\"2025.43.01.3\",\"callParticipantUserRole\":\"anonymous\",\"wasPreheatAttempted\":false,\"wasPreheatCompleted\":false,\"wasInLobby\":true}]"
      },
      "InstanceId": "86033eb2-a5b2-4c06-b5a4-b3ca05500a8c",
      "delta": "2311",
      "elapsed": "90171",
      "sequence": "17",
      "stepDelta": "1",
      "previousStep": "connected",
      "commandSource": "ExternalCommand",
      "context": "DeepLink",
      "observableSuccess": "true",
      "id": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "callId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "callMode": "0",
      "callType": "2",
      "teamsCallId": "1",
      "endpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "wasPoppedOut": "false",
      "isVideoOn": "false",
      "isMuted": "false",
      "threadId": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
      "stagingRoomEnabled": "false",
      "stagingRoomEventActive": "false",
      "stagingRoomEventEnded": "false",
      "trouterState": "Connected",
      "trouterClientState": "Connected",
      "trouterUrls": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/fzM_P6_9OkKhaTfnkJKf1g/",
      "isManagedModeEnabled": "false",
      "selectedCameraId": "camera:",
      "selectedMicrophoneId": "microphone:",
      "selectedSpeakerId": "speaker:",
      "isMultilingualMeeting": "false",
      "isMultilingualMeetingOptionEnabled": "false",
      "isOneToOnePstnCall": "false",
      "messageId": "0",
      "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "streamingData": "{\"forceAttendeeStreaming\":false,\"streamingModeActive\":false}",
      "hasCommentStream": "false",
      "conversationType": "scheduledMeeting",
      "allowRegisteredUsersToBypassLobby": "false",
      "disableLobby": "false",
      "callSchedulingDetails": "{\"meetingType\":\"scheduled\",\"startTime\":\"0001-01-01T00:00:00\",\"endTime\":\"0001-01-01T00:00:00\"}",
      "attendeeViewModes": "Default",
      "productionStudioMode": "Off",
      "watermarkVideoEnabled": "false",
      "watermarkScreenShareEnabled": "false",
      "meetingEndToEndEncryptionEnabled": "false",
      "callingDataBag": "{\"botDetectionResult\":{\"type\":\"botDetectionResult\",\"score\":74,\"verdict\":\"human\",\"reasons\":[],\"metrics\":{\"mean\":0.06458333134651184,\"variance\":0.013953995497695418,\"powMs\":559.2000000476837,\"powHash\":\"5fa\",\"nav\":{\"webdriver\":false,\"plugins\":5,\"hc\":4,\"devMem\":8,\"tz\":\"Europe/London\"}}}}",
      "deeplinkId": "34ab99ed-fccc-4f1b-8174-cce0809b6e3a",
      "correlationId": "35a4136a-e5bb-4d92-afe2-3fd4e265d0cc",
      "joinWithCode": "false",
      "tsCallingVersion": "2025.43.01.3",
      "callParticipantUserRole": "anonymous",
      "wasPreheatAttempted": "false",
      "wasPreheatCompleted": "false",
      "wasInLobby": "true",
      "isInEst": "false",
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:16:52.451Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 34,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "video_stream_rendering",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "video_stream_rendering",
        "SpanId": "40d81cb55935d221",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "video_stream_rendering",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":23,\"elapsed\":90270,\"sequence\":1,\"stepDelta\":23,\"previousStep\":\"start\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"participantId\":\"8:teamsvisitor:7652096e9b61413696f1fe2c756c8759\",\"streamType\":\"Video\"}]"
      },
      "InstanceId": "22125b78-2ca9-48a5-8312-e0c58aff0bfd",
      "delta": "23",
      "elapsed": "90270",
      "sequence": "1",
      "stepDelta": "23",
      "previousStep": "start",
      "commandSource": "ExternalCommand",
      "participantId": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
      "streamType": "Video",
      "isInEst": "false",
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:16:52.517Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 35,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "video_stream_rendering",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "video_stream_rendering",
        "SpanId": "d9fc3ee545f7c3bf",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "video_stream_rendering",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":94,\"elapsed\":90336,\"sequence\":1,\"stepDelta\":94,\"previousStep\":\"start\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"participantId\":\"8:teamsvisitor:7652096e9b61413696f1fe2c756c8759\",\"streamType\":\"Video\"}]"
      },
      "InstanceId": "9f0ab213-8ac1-4bcb-a499-2f0437a22ba8",
      "delta": "94",
      "elapsed": "90336",
      "sequence": "1",
      "stepDelta": "94",
      "previousStep": "start",
      "commandSource": "ExternalCommand",
      "participantId": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
      "streamType": "Video",
      "isInEst": "false",
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:53.668Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 36,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "auto_authWarmLaunch",
        "CorrelationId": "95bbfa28-7587-45f5-8940-a62d15acf5aa",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Action": {
        "Gesture": "auto",
        "Scenario": "authWarmLaunch",
        "ScenarioType": "appAuth",
        "WorkLoad": "auth",
        "SubWorkLoad": "sisu"
      },
      "Panel": {
        "Region": "main",
        "Type": "AuthStart",
        "WindowID": "main",
        "Context": "main"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-14T20:16:50.254Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 30,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Ring": "general",
      "Region": "emea",
      "ClientType": "enterprise",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "SignalingSessionId": "6a321b68-62a3-4286-b9f1-6cd2601d1a78",
      "ClientInformation": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "NetworkRequestBag": "{\"eventStart\":1763151325358,\"events\":{\"name\":\"POST-SendMediaAnswer\",\"url\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/t/981/answer?i=10-128-210-112\",\"eventStart\":84702,\"trouterReady\":1,\"requestReady\":8,\"status\":202,\"attempts\":[{\"status\":202,\"start\":9,\"end\":193,\"online\":1}],\"rtt\":193,\"uid\":\"9ade4602-28ab-4402-b032-53818fb2e256\",\"causeId\":\"bec11d11\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[200,1000,5000],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":15000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"enabled\"]},\"enableRequestHedging\":true,\"tokenTelemetries\":[{\"requestCauseId\":\"bec11d11\",\"supportTokenApi\":false,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"POST\\\",\\\"path\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/6836dfe5-ff48-44f5-9ba8-3eebd15a65bf/13/t/981/answer?i=10-128-210-112\\\"}\",\"tokenRequestTime\":1763151410062,\"tokenResponseTime\":1763151410062,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":0}]}}",
      "EcsEtag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-14T20:16:52.379Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 33,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "TraceId": "55849eb8e47b0b64d2e6dc087de4b977"
      },
      "Ring": "general",
      "Region": "emea",
      "ClientType": "enterprise",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "SignalingSessionId": "6a321b68-62a3-4286-b9f1-6cd2601d1a78",
      "ClientInformation": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "NetworkRequestBag": "{\"eventStart\":1763151325358,\"events\":{\"name\":\"POST-SendApplyChannelParameters\",\"url\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/00c6d532-771d-4c57-9973-89d0bb713212/874/k27/2065/applyChannelParameters?i=10-128-210-112&e=638985327425314572\",\"eventStart\":85295,\"trouterReady\":26,\"requestReady\":30,\"status\":202,\"attempts\":[{\"status\":202,\"start\":55,\"end\":1725,\"online\":1}],\"rtt\":1725,\"uid\":\"57bbc379-124a-4004-b086-133d81f209ca\",\"causeId\":\"883fa2cb\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[200,1000,5000],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":15000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"enabled\"]},\"enableRequestHedging\":true,\"tokenTelemetries\":[{\"requestCauseId\":\"883fa2cb\",\"supportTokenApi\":false,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"POST\\\",\\\"path\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/mcProxy/00c6d532-771d-4c57-9973-89d0bb713212/874/k27/2065/applyChannelParameters?i=10-128-210-112&e=638985327425314572\\\"}\",\"tokenRequestTime\":1763151410680,\"tokenResponseTime\":1763151410681,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":1}]}}",
      "EcsEtag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "a7c1825e-39f5-45c8-824d-a7c84edda747"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:72f988bf-86f1-41af-91ab-2d7cd011db47",
        "TenantId": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-14T20:16:56.017Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 37,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Ring": "general",
      "Region": "emea",
      "ClientType": "enterprise",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "SignalingSessionId": "6a321b68-62a3-4286-b9f1-6cd2601d1a78",
      "ClientInformation": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "NetworkRequestBag": "{\"eventStart\":1763151325358,\"events\":{\"name\":\"POST-SendMediaAnswer\",\"url\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/00c6d532-771d-4c57-9973-89d0bb713212/874/t/2470/answer?i=10-128-210-112\",\"eventStart\":90537,\"trouterReady\":0,\"requestReady\":0,\"status\":202,\"attempts\":[{\"status\":202,\"start\":1,\"end\":121,\"online\":1}],\"rtt\":121,\"uid\":\"950ea6d3-4458-49eb-841b-cfe7ecc12bf1\",\"causeId\":\"e8c8baf8\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[200,1000,5000],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":15000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"enabled\"]},\"enableRequestHedging\":true,\"tokenTelemetries\":[{\"requestCauseId\":\"e8c8baf8\",\"supportTokenApi\":false,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"POST\\\",\\\"path\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euwe-01-prod-aks.cc.skype.com/cc/v1/negotiations/00c6d532-771d-4c57-9973-89d0bb713212/874/t/2470/answer?i=10-128-210-112\\\"}\",\"tokenRequestTime\":1763151415895,\"tokenResponseTime\":1763151415895,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":0}]}}",
      "EcsEtag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Initializing"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined"
    }
  }
  {
    "name": "loggingns",
    "time": "2025-11-14T20:16:58.721Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 38,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "i18n",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "CDL",
      "EventInfo": {
        "BaseType": "i18n",
        "Identifier": "webclient_globalization_i18n_formatting_initialization_error",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "message": "Formatting locale info is not available or not supported. DateTimeFormatter have been initialized with: en-gb",
      "logLevel": "Info",
      "sampleCohortValue": 0,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "broadcast",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "AppInfo": {
        "ClientType": "cdlworker",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "Panel": {
        "Context": "Worker"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "CDLWebWorker"
      },
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined"
    }
  }
  {
    "name": "loggingns",
    "time": "2025-11-14T20:16:58.752Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 39,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "cdlwebworker",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "CDL",
      "EventInfo": {
        "BaseType": "cdlwebworker",
        "Identifier": "cdl_worker_startup_health_check",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "message": "Received health_check. InitiatorExperience: light-meetings, HasBootstrapData: true, AlreadyRetrievedBootstrapData: false.",
      "logLevel": "Info",
      "sampleCohortValue": 0,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "broadcast",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "AppInfo": {
        "ClientType": "cdlworker",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "Panel": {
        "Context": "Worker"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {
        "Type": "CDLWebWorker"
      },
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined"
    }
  }
  ```
  ```json
  {
    "acc": 11
  }
  ```
- GET `https://config.teams.microsoft.com/config/v1/MicrosoftTeams/1415_1.0.0.0?environment=prod&experience=light-meetings&buildType=production&virtualization=&browser=chrome&browserVersion=141.0.7390.67&osPlatform=windows&isOcdi=false&isPwa=false&tenantId=338de7e8-b10a-4a7c-aeb4-4cdf726fc818&experienceBuild=25110306401&sessionId=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&clientId=d5db3b0f-e101-4806-8e8b-ac22597657d4&agents=TeamsNorthstar,TeamsBuilds,Segmentation,TeamsNorthstarUserOverrides&ECSCanary=1`
  ```json
  {
    "ECS": {
      "ConfigLogTarget": "default",
      "c72ea287-ed77-4fa6-a480-3712406c367e": "aka.ms/EcsCanary"
    },
    "Segmentation": {
      "DataDonationDisabledGroups": "false",
      "EDPSTenants": "false",
      "SmeTenantsSize1thru9": "InGroup",
      "EliteUsers": "false",
      "M365CopilotPPVAll": "false",
      "M365ChatAllow": "false",
      "EarlyR2Ring": "false",
      "IsInternalUser": "false",
      "VirtualizationEnabled": "false",
      "TeamsRing": "general",
      "MWWhilteListedUser": "false",
      "Cloud": "Public",
      "AudienceGroup": "general"
    },
    "TeamsBuilds": {
      "BuildSettings": {
        "Communicator": {
          "BuildVersion": "2025102704"
        },
        "CustomerServiceChatbot": {
          "BuildVersion": "2025102302"
        },
        "ReactWebClient": {
          "CriticalVersion": "25040319113",
          "BuildVersion": "25101616511"
        },
        "MetaosStore": {
          "BuildVersion": "25100213809"
        },
        "WebView2PreAuth": {
          "x64": {
            "latestVersion": "25306.804.4102.7193",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x64/25306.804.4102.7193/MSTeams-x64.msix"
          },
          "x86": {
            "latestVersion": "25306.804.4102.7193",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x86/25306.804.4102.7193/MSTeams-x86.msix"
          },
          "arm64": {
            "latestVersion": "25306.804.4102.7193",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-arm64/25306.804.4102.7193/MSTeams-arm64.msix"
          }
        },
        "Desktop": {
          "windows64": {
            "minimumVersion": "1.6.00.27573",
            "criticalVersion": "1.4.00.0",
            "latestVersion": "1.8.00.27654"
          },
          "windows": {
            "minimumVersion": "1.6.00.27573",
            "criticalVersion": "1.4.00.0",
            "latestVersion": "1.8.00.27654"
          },
          "osx": {
            "criticalVersion": "1.0.00.25152",
            "minimumVersion": "1.1.00.29053",
            "latestVersion": "1.8.00.27652"
          },
          "linux": {
            "criticalVersion": "1.2.00.24252",
            "minimumVersion": "1.2.00.26154",
            "latestVersion": "1.5.00.23861"
          },
          "arm64": {
            "latestVersion": "1.8.00.27654"
          }
        },
        "MeetingRoom": {
          "BuildVersion": "25081500722"
        },
        "WebView2": {
          "macOS": {
            "latestVersion": "25290.302.4044.3989",
            "buildLink": "https://installer.teams.static.microsoft/production-osx/25290.302.4044.3989/MicrosoftTeams.pkg"
          },
          "x64": {
            "latestVersion": "25198.1112.3855.2900",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x64/25198.1112.3855.2900/MicrosoftTeams-x64.msix"
          },
          "x86": {
            "latestVersion": "25198.1112.3855.2900",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x86/25198.1112.3855.2900/MicrosoftTeams-x86.msix"
          },
          "arm64": {
            "latestVersion": "25198.1112.3855.2900",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-arm64/25198.1112.3855.2900/MicrosoftTeams-arm64.msix"
          }
        },
        "WebView2Canary": {
          "macOS": {
            "latestVersion": "25290.302.4044.3989",
            "buildLink": "https://installer.teams.static.microsoft/production-osx/25290.302.4044.3989/MicrosoftTeams.pkg"
          },
          "x64": {
            "latestVersion": "25290.205.4069.4894",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x64/25290.205.4069.4894/MSTeams-x64.msix"
          },
          "x86": {
            "latestVersion": "25290.205.4069.4894",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-x86/25290.205.4069.4894/MSTeams-x86.msix"
          },
          "arm64": {
            "latestVersion": "25290.205.4069.4894",
            "buildLink": "https://installer.teams.static.microsoft/production-windows-arm64/25290.205.4069.4894/MSTeams-arm64.msix"
          }
        },
        "Calendar": {
          "BuildVersion": "24090523600"
        },
        "Web": {
          "SettingsOverride": {
            "minimumViableWebClientVersion": "1.0.2021030227"
          },
          "BuildVersion": "1.0.0.2025070703"
        },
        "JoinLauncher": {
          "BuildVersion": 2025100201
        },
        "Meeting": {
          "BuildVersion": "23070307300"
        },
        "ShareToTeams": {
          "BuildVersion": "25082114607"
        },
        "MeetingOptions": {
          "BuildVersion": "25082114604"
        },
        "LmsIntegration": {
          "BuildVersion": "25091116007"
        },
        "EmbedClient": {
          "BuildVersion": "25091807904"
        },
        "ExtensibilityApps": {
          "BuildVersion": "25041008300"
        },
        "CallingEmbed": {
          "BuildVersion": "21080507600"
        },
        "BroadcastPlayer": {
          "BuildVersion": "20201118008"
        },
        "WebinarRegistration": {
          "BuildVersion": "23022116000"
        },
        "Convene": {
          "BuildVersion": "25100213808"
        }
      }
    },
    "TeamsNorthstar": {
      "messaging": {
        "enableMessageBotMetadata": true,
        "enablePunyEncodedUrl": true,
        "atpCdnAssetsPath": "/evergreen-assets/safelinks/2/atp-safelinks.html",
        "enableGroupCopilotInteraction": true,
        "useTeamsCopilotServicePlanForGroupCopilot": true,
        "groupCopilotControlMessageBotActions": [],
        "overrideGroupCopilotControlMessageBotActions": true,
        "enableGroupCopilotForNewChat": false,
        "enableGroupCopilotDynamicSuggestedActionsInControlMessage": true,
        "enableGroupCopilotDynamicSuggestedPromptsInCompose": true,
        "disableGroupCopilotMeetingChatHistoryCheck": true,
        "enableUnfurlFluidAutoEmbedLink": true,
        "enableGroupCopilotPartialAccessHistoryBanner": true,
        "enableChatIdValidationOnPin": true,
        "enableEndpointsManagerForImageProxyService": true,
        "enableFetchSmartNavigatorFromCSA": true,
        "enableSelfChatAutoPin": true,
        "enableGiphyInClipboard": true,
        "enableMessageActivityReading": true,
        "enableGroupChatInviteFlow": true,
        "expandedReactionsConfigs": {
          "chat": {
            "enableSend": true,
            "enableReceive": true,
            "overflowAfter": 5
          },
          "channel": {
            "enableSend": true,
            "enableReceive": true,
            "overflowAfter": 5
          },
          "summaryStyle": "bubble"
        },
        "enableFlatHtmlInsertInEditor": true,
        "enableMentionsRework": true,
        "enableEndpointsManagerOnUrlPreviewService": true,
        "enableEndpointsManagerOnGiphyService": true,
        "enableDeleteChat": true
      },
      "calling": {
        "enableBotDetection": true,
        "botDetectionTenantIdAllowedList": [
          "e35b9fa6-7766-43c5-a101-43d693d9733d",
          "194fe696-96c8-4488-88d5-6d5e6002bd85"
        ],
        "callingConstants": {
          "ui": {
            "blacklistedBots": [
              "28:bdd75849-e0a6-4cce-8fc1-d7c0d4da43e5",
              "28:4b25d9f8-18f5-4d09-a582-cd0a28f63181",
              "28:07331c9d-bd9a-4d00-bb00-9dcacd105691",
              "28:123425f9-0c72-4bd8-8814-7cb6b02dfc3f",
              "28:4be36d18-a394-4f94-ad18-fb20df412d7a",
              "28:4c072661-d231-483f-b32c-2d305791d32d",
              "28:e8f1f4bd-f39c-479f-8885-a69ded583534",
              "28:ae05be75-6c5a-47c0-97b8-8c84fd83880d",
              "28:0a18c351-466c-4293-87eb-7b08a096b0a1",
              "28:4c1a6ff1-c702-4652-9991-e0b36d310d19",
              "28:b1902c3e-b9f7-4650-9b23-5772bd429747",
              "4:*13",
              "28:f4693563-c70b-4e4d-bda6-01792aa21440",
              "28:e32c9418-a835-4eb1-bfb9-733fa74dd6e8",
              "28:cebb622a-9099-475d-9f85-0413cf0b19c7",
              "28:38b34208-9db4-425d-91e5-6f201eeaef40",
              "28:9cd07db6-fab5-438c-8e34-44117fac7650",
              "28:ab5d1521-415b-4380-82e4-af803fb8bf2d",
              "28:a8011016-05a6-4f6e-b2b3-26543cf329a0",
              "28:556b15e7-452c-4773-b728-6313eaa47b77",
              "28:b102ccd8-1925-448b-90a7-b083aba25074",
              "28:3d59cb08-f597-4e49-9add-a05f9735152b",
              "28:8cf0f6d9-65dc-464b-a2cb-8f66a9767358",
              "28:b5738585-9037-4ebd-8c03-d9a8bdbb537d",
              "28:gcch-global:b5738585-9037-4ebd-8c03-d9a8bdbb537d",
              "28:9fe5a0d5-c286-41f1-a014-67c755902881",
              "28:gcch-global:9fe5a0d5-c286-41f1-a014-67c755902881",
              "28:494c14c2-d8bb-41e7-b463-4dd17c3fda60",
              "28:dod-global:494c14c2-d8bb-41e7-b463-4dd17c3fda60",
              "28:e9989ac1-1203-4f1e-a716-07abc621a240",
              "28:dod-global:e9989ac1-1203-4f1e-a716-07abc621a240",
              "28:e164356d-e1d1-4ba5-8001-4cc9abc717ba",
              "28:d123a3e6-7f0a-4bbd-91f2-6d0ad1707297",
              "28:d29ade6f-9257-45cb-883c-01ad3a6f6d20",
              "28:c733a6ab-69c4-4b1d-b660-60048c4dce2f",
              "28:56aa0a8f-4cd3-446b-8146-0023476a5ff2",
              "28:bf9a6ad5-ccd4-4c41-ba31-87e67b045a9a",
              "28:0235a40d-f7c9-4028-a32b-13a50dd6e2fa",
              "28:30f2ee85-68d2-40a0-9fcd-3e4a759c8c34",
              "28:b8cd536a-fe8e-4088-a5b8-e298cc3f2577",
              "28:bfa8d8c3-fa5e-4ee9-88f5-ffce728a797c",
              "28:4062df8b-5499-49a2-abe0-29ad866b2c04",
              "28:6b45c5b6-1c34-47c0-8980-11e98d47d23f",
              "28:c78e4215-e66c-4a70-8964-74992656de25",
              "28:8133db4c-c049-4346-9edd-273f164a9227",
              "28:gal-global:5f950626-8b3f-41ef-bb7e-3af032f46ee7",
              "28:7cbe7d58-04af-48aa-b9f8-b64f99ee1f9e",
              "28:5f2511f1-6da9-41d9-80d9-af7da23a2c27",
              "28:f16efa36-abce-40e9-9e69-8540952a0133",
              "28:accb0009-8d12-4cfe-969c-39b204e3ed0c",
              "28:0ad9717e-76fd-4658-a764-beaf21698977"
            ]
          }
        },
        "enableUpdateMeetingSettingsOnGCP": true,
        "enableWatermarkForAnonymousAttendees": true,
        "enableFluentV9TreeInRoster": true,
        "skipLIMEForTenants": [
          "9eab1974-31cc-4aa8-8ba7-c8943c73f995",
          "5bbab28c-def3-4604-8822-5e707da8dba8",
          "f345bebf-0d71-4337-9281-24b941616c36",
          "e0793d39-0939-496d-b129-198edd916feb",
          "4f8dfe4e-5d74-4f20-aa14-4f99af3d868d",
          "d73a39db-6eda-495d-8000-7579f56d68b7",
          "d4f3d950-3f42-4ac0-a9c6-1411fae9fbc7",
          "4d12e360-156d-42f9-aaf3-b889ca648aba",
          "2596038f-3ea4-4f0c-aed1-066eb6544c3b",
          "ff4abfe9-83b5-4026-8b8f-fa69a1cad0b8",
          "5fe7edeb-0b8e-4383-a697-ff6218746793",
          "2640efc8-1603-49c5-b70c-71dc09f3c4b4",
          "dabca8ef-5a5f-4128-8834-ddd4693375ef",
          "40a9e940-a5cd-47d6-b980-4f2f6acfdcd0",
          "99ef90fc-6e45-47a4-ae28-3916483dc9f2",
          "39b03722-b836-496a-85ec-850f0957ca6b"
        ],
        "spokenLanguages": [
          "ar-ae",
          "ar-sa",
          "da-dk",
          "de-de",
          "en-au",
          "en-ca",
          "en-gb",
          "en-in",
          "en-nz",
          "en-us",
          "es-es",
          "es-mx",
          "fi-fi",
          "fr-ca",
          "fr-fr",
          "hi-in",
          "is-is",
          "it-it",
          "ja-jp",
          "ko-kr",
          "ms-my",
          "mt-mt",
          "nb-no",
          "nl-be",
          "nl-nl",
          "pl-pl",
          "pt-br",
          "ru-ru",
          "sv-se",
          "zh-cn",
          "zh-hk",
          "cs-cz",
          "pt-pt",
          "tr-tr",
          "vi-vn",
          "th-th",
          "he-il",
          "uk-ua",
          "el-gr",
          "hu-hu",
          "ro-ro",
          "sk-sk",
          "sq-al",
          "zh-tw",
          "cy-gb",
          "de-ch",
          "ca-es",
          "lt-lt",
          "bg-bg",
          "lv-lv",
          "et-ee",
          "hr-hr",
          "sl-si",
          "id-id",
          "sr-rs"
        ],
        "meetingJoinKnownBotNames": "{\"FF\":\"^Fireflies Notetaker\", \"RE\":\"^read[.]ai meeting notes$\", \"OT\":\"Notetaker [(]Otter[.]ai[)]$\", \"NO\":\"^Notta Bot$\", \"MG\":\"MeetGeek Notetaker|Bot|VA|Assistant$\"}",
        "disableSignInForShortUrlMeeting": false,
        "enableWaitForCallingIntentEventFulfilled": true,
        "shouldNotRerenderIfCallActive": true,
        "enableLabelForDeviceSelection": true,
        "enableWindowingFailOnNonSuccess": true,
        "enableImmediateErrorThrowOnBoundary": true,
        "enableDeduplicateWindowingActions": true,
        "enableParallelFocusAndContentUpdate": true,
        "enableReportWindowingContainerRenderError": true,
        "enableCallingWindowingContainerContentMatch": true,
        "enableWindowingActionMonitor": true,
        "showCustomChatPaneErrorForNonChannelMember": true,
        "enableUpdatedGetVoicemailsPath": true,
        "enableCallableChannels": true,
        "enableNativeCallsApp": true,
        "enablePagination": true,
        "enableDialpadCallingForOBOVoipCalls": true,
        "pptFeatureGates": "{\"ModernWebGLBlockListForBrowserVersion\": \"Chrome:66;Edge:19\",\"ModernWebGLBlockListForGPURenderer\": \"PowerVR Rogue GX6250;SwiftShader\", \"ModernSlideShowAllowListForFileType\": \"pptx;ppsx;potx;pptm;ppsm;pot;ppt;odp;pps\", \"DetectAbandonsWithinIframeTimeouts\":true, \"HostBootTimeoutConfigInMs\":90000, \"EnableNewSnapService\":true, \"SnapToPodsRegionSpecificUrlEnabled\":true, \"PresUrlBootTimeoutMS\":4000,\"EnableCleanupForMemoryLeakFix\":true, \"EnablePostMessageDownwardFix\":true}",
        "pptBootstrapperUrl": "https://res.cdn.office.net/pptlive-m/5mttl/bootstrap/ring5_3/powerpoint.live.boot.js"
      },
      "core": {
        "enableSplashScreen2025": true,
        "enableRefreshedTeamsIconOct2025": true,
        "enableReflow": true,
        "enableReflowMotion": true,
        "enableEndSlotCloseOnEscape": true,
        "enableFreezeInResizableSlots": true,
        "enableReflowPinAppBar": true,
        "offlineActionsSyncStrategyRefreshIntervalInMs": 300000,
        "offlineGuaranteedOrderingEnabledResolvers": [
          "sendMessage",
          "undeleteMessage",
          "deleteMessage"
        ],
        "enableConsolidateLayoutTemplates": false,
        "enableExperienceLifeCycleManagerV2": true,
        "enableDecoupleCommandingFromApollo": true,
        "enableMenuAutoSize": true,
        "enablePopoverAutoSize": true,
        "enableEndpointsManagerOnTeamsPushService": true,
        "enableLineLoader": true,
        "enableForcedTransitionOnLPSMDispose": true,
        "enablePoliciesFetchViaEffectivePoliciesApi": true,
        "enableClientFiltersProvider": true,
        "ecsProviderFetchMode": "WhenExpired",
        "endpointsManagerBaseUrlResolutionTimeoutInMs": 45000,
        "enableUncontrolledTabster": true,
        "ecsRefreshIntervalInMs": 3600000,
        "enableEndpointsManagerOnChatService": true,
        "enableFocusManagementRoot": true,
        "enableEndpointsManagerOnCsaService": true,
        "enableFocusManagement": true
      },
      "meetingCollaboration": {
        "groupCopilotBotDisplayName": "Facilitator",
        "enableFacilitatorAgentUXBranding": true,
        "enableCopilotSplitButton": false,
        "enableGroupCopilotBotJoinCall": true,
        "enableGroupCopilotAppAdminPolicyCheck": true,
        "enableGroupCopilotToggleInSchedulingForm": true,
        "enableGroupCopilotFacilitatorAgentBranding": true,
        "enableFacilitatorAgentUXEntryPoint": true,
        "enableGCPInstallInChatOnCallStart": true,
        "allowGroupCopilotAtMentionIfInstalledInMeetings": true,
        "enableStartTranscriptIfFacilitatorAdded": true,
        "enableFacilitatorInCopilotOnlyMode": true,
        "enableTranscriptSpeedbumpOnGroupCopilotEnabled": true
      },
      "slices": {
        "enableThreadSliceCopyLinkContextMenuOption": true
      },
      "cdlWorker": {
        "shouldUseChatServiceBatchEventInChatServiceSubscription": true
      },
      "presence": {
        "enablePollSubscribedPresenceOnActive": false,
        "enablePresenceManagerOfflineAndExpectedErrorTelemetry": true,
        "enableSyncStatusBanner": true,
        "enableSerializingPublishPresence": true,
        "shouldUnsetTrouterDisconnectedTimestamp": true,
        "removePresenceTrackingInfoOnCDLUnsubscribe": true
      },
      "people": {
        "peopleCoreSyncStrategyOnStartupMaxDeferTimeInMinutes": 360,
        "enablePartitionWithCallRoster": true,
        "profilesMaxInMemoryRecordSize": 1200,
        "peopleCoreSyncStrategyOnIntervalJitter": 0.15,
        "peopleCoreSyncStrategyRefreshIntervalInMs": 86400000,
        "enableLastAccessedTimestampPruningForProfileManager": true,
        "enableGetProfilesWithLowPerfFederationFallbacks": true,
        "enableMentionManagerCacheRefresh": true,
        "enableTflUsersOnlyForExternalUsersSearch": true,
        "enableCacheSearchChannelAtMentionOnFailure": true,
        "useUserLevelTimestampForAvatarETag": true,
        "enableSetEmptyAvatarETagToSignedInTime": true,
        "enableEmailSearchForLocalProfileSearch": true,
        "unknownUserBackroundRefreshThrottleInMinutes": 20160,
        "enableSfCProfileFetch": true,
        "enableOfflineErrorCheckForPeopleScenarios": true,
        "respectChannelMentionUserSettings": true,
        "useChatDataFromSubstrate": false,
        "enableClientInstrumentation": true,
        "includeIBBarredUsers": true,
        "enablePopOverScrollMoreView": true,
        "enableNewRelevanceForPeoplePickerFromProps": true,
        "disablePeoplePickerSearchQueryFeedback": true,
        "debounceForRemoteSearchInMilliSeconds": 750,
        "updateSelectedUserFrequencyEnabled": true
      },
      "meetingConversation": {
        "enableChatSubTypeAndActiveCallCheck": true
      },
      "telemetry": {
        "logSanitizerConfig": {
          "warn": [],
          "sanitize": [
            "Teams_Email",
            "Teams_FileName",
            "Teams_PhoneNumber",
            "Teams_MriLive",
            "JWTInDepth",
            "QueryParam",
            "KnownString",
            "Teams_OdspUri",
            "Teams_MeetingAndChannelsMetadata",
            "Teams_Url"
          ],
          "skipObjectKeys": true,
          "scannerOptions": {
            "Email": {
              "trustedDomains": [
                "thread",
                "skype",
                "unq.gbl",
                "tacv2",
                "onetoone",
                "copilot",
                "gcc",
                "DDD"
              ]
            },
            "Teams_FileName": {
              "messagePatternsToIgnore": [
                "WebLogs",
                "evergreen-assets",
                "msteams-asset",
                "Stored app definitions for app ids",
                "AppsUsage Fetched"
              ],
              "fileNamePatternsToIgnore": [
                "com\\.microsoft",
                "[_-]?teams[_-]",
                "giphy\\.gif",
                "summary\\.txt",
                "\\.mp3",
                "\\.wav"
              ]
            },
            "Teams_PhoneNumber": {
              "messagePatternsToIgnore": [
                "AuthenticationService: authorize:",
                "submitOperation::Submitting operation"
              ]
            },
            "Teams_MriLive": {
              "mriLiveIdsToIgnore": [
                "file-euii",
                "email-euii",
                "ssn-euii",
                "creditCard-euii"
              ]
            },
            "Teams_MeetingAndChannelsMetadata": {
              "meetingAndChannelParamToScan": [
                "meetingTitle",
                "displayName",
                "teamAndChannelName"
              ]
            },
            "Teams_OdspUri": {
              "spoUrlParamsToIgnore": [
                "\\.default",
                "\\.Read",
                "\\.Write"
              ]
            },
            "Teams_Url": {
              "urlPatternsToIgnore": [
                "sharepoint",
                "mcas\\.ms",
                "goo\\.gl",
                "powerbi",
                "agatcloud",
                "contoso",
                "opendns",
                "copilotapp"
              ]
            }
          }
        },
        "enableLogSanitizer": true,
        "enableScenarioEventing": true,
        "applicationInsightsOfflineSettings": {
          "minPersistenceLevel": 2,
          "inMemoMaxTime": 15000,
          "inStorageMaxTime": 86400000,
          "autoClean": true,
          "maxRetry": 5,
          "maxBatchsize": 2500000,
          "maxSentBatchInterval": 1000
        },
        "eventPersistence": {
          "scenarions": {
            "acquire_token": 2,
            "activity_switch": 2,
            "app_notification_banner_render": 2,
            "application_launch_time": 2,
            "cal_create_update_user_event": 2,
            "cal_join_online_meeting": 2,
            "cal_scheduling_form_create_mode": 2,
            "cal_scheduling_form_view_or_edit_mode": 2,
            "cal_surface_load": 2,
            "call_accept_meeting": 2,
            "call_accept": 2,
            "call_hangup_latency": 2,
            "calling_call_disconnected": 2,
            "calling_lobby_admit": 2,
            "calling_stack_init": 2,
            "calling_service_init": 2,
            "calling_app_init": 2,
            "calls_app_switch": 2,
            "cdl_worker_manager_startup": 2,
            "channel_switch_l1": 2,
            "channel_switch_l2": 2,
            "chat_pop_out": 2,
            "chat_send_message": 2,
            "chat_switch": 2,
            "client_start": 2,
            "content_sharing_presenter_join": 2,
            "content_sharing_start": 2,
            "content_sharing_viewer_join": 2,
            "create_chat": 2,
            "create_group_call": 2,
            "create_meetup": 2,
            "create_one_to_one_call": 2,
            "create_one_to_one_pstn_call": 2,
            "cross_client_toast_view": 2,
            "documents_action_download_file": 2,
            "documents_p2p_files_list_switch": 2,
            "documents_upload_file_chat": 2,
            "dropped_message_notifications": 2,
            "edit_message": 2,
            "emergency_call": 2,
            "feeds_focused_load": 2,
            "get_skype_token": 2,
            "incoming_call": 2,
            "incoming_pstn_call": 2,
            "join_group_call": 2,
            "join_or_create_meetup_from_link": 2,
            "join_scheduled_meetup": 2,
            "media_connected": 2,
            "meeting_started_notification": 2,
            "mejco": 2,
            "multiple_profile_fetch_conversation": 2,
            "multiple_profile_fetch": 2,
            "navigation_command": 2,
            "network_offline": 2,
            "people_picker_search_suggestions": 2,
            "platform_tab_loading": 2,
            "powerbar_query": 2,
            "ppt_sharing_added": 2,
            "ppt_sharing_wrs_init": 2,
            "scheduled_job_complete": 0.1,
            "screen_sharing_presenter_start": 2,
            "screen_sharing_viewer_start": 2,
            "search_all": 2,
            "search_people": 2,
            "shell_desktop_previous_process_crashed": 2,
            "shell_process_failed": 2,
            "toggle_mute_latency": 2,
            "transfer_call": 2,
            "unified_presence_t2_create_endpoint": 2,
            "unified_presence_t2_get_user_batch_presence": 2,
            "unified_presence_t2_post_active_w_trouter": 2,
            "unified_presence_t2_publish_presence": 2,
            "unified_presence_t2_set_user_initiated_presence": 2,
            "video_stage_reliability": 2,
            "window_launch_time": 2,
            "chat_edit_message": 2,
            "message_send_workflow": 2,
            "message_edit_workflow": 2,
            "real_time_messaging_notifications": 2,
            "message_sync_job": 2
          },
          "userbins": {
            "panelaction": 2
          },
          "loggingns": {
            "*": 2
          },
          "endpointns": {
            "postmessagetoconversation_chatservice": 2,
            "chatservice_updatemessageinconversation_put": 2
          },
          "httpns": {
            "chatservice_message_post": 2,
            "chatservice_message_put": 2,
            "chatservice_messages_get": 2
          }
        },
        "enableOfflineTelemetry": true,
        "enableSDKContextOverrides": true,
        "enableExpandedFractionalBuckets": true,
        "toolingSamplingRules": {
          "scenarions": {
            "*": 1
          },
          "userbins": {
            "*": 100
          },
          "loggingns": {
            "*": 1
          },
          "endpointns": {
            "*": 1
          },
          "httpns": {
            "*": 1
          }
        },
        "enableWorkerBroadcast": true,
        "isolateUserContext": true,
        "telemetryRegionFetchComplete": true,
        "telemetryRegion": "EMEA",
        "enableTelemetryRegionReinit": true,
        "enableCompression": true,
        "enableBlockZeroSampleRate": true,
        "oneDsCollectorUrl": "https://eu-teams.events.data.microsoft.com/OneCollector/1.0/",
        "enableSecondPartyTelemetry": true,
        "enableOneDsSdkNs": true,
        "scenarioModes": {
          "navigation_command": 3,
          "cdl_worker_startup": 1,
          "experience_ready": 1,
          "acquire_token": 3,
          "get_skype_token": 1,
          "auth_web_login": 1,
          "auth_web_initialization": 1,
          "delta_sync_workflow": 1,
          "ext_installed_apps_V2": 1,
          "files_personal_picker_auth_token_fetch": 1,
          "search_start": 1,
          "search_message": 1,
          "on_behalf_of_user_attribution": 1,
          "ext_ac_render": 1,
          "ext_app_definitions_for_bot_card": 1,
          "serialize_cached_image": 1,
          "reply_chain_manager_get_reply_chains_by_keys": 1,
          "on_long_poll_received_strategy": 1,
          "search_all": 1,
          "broadcast_attendee_performance": 1,
          "ext_meeting_apps_flyout_fetch_grid_apps": 1,
          "reply_chain_manager_get_reply_chains": 1,
          "real_time_messaging_notifications": 1,
          "startup_sync_job": 1,
          "startup_sync_group_chats_job": 1,
          "documents_create_file_chiclet_on_link_paste": 1,
          "unified_3s_search": 1,
          "search_files": 1,
          "platform_tab_loading": 1,
          "related_message_sync_job": 1,
          "search_people": 1,
          "fetch-channel-site-info": 1,
          "documents_share_link_permission_dialog": 1,
          "documents_share_link_copy_dialog": 1,
          "documents_async_link_to_chiclet": 1,
          "files_personal_picker": 1,
          "message_sync_job": 1,
          "conversation_sync_workflow": 1,
          "message_sync_workflow": 1,
          "batched_thread_details_sync_job": 1,
          "replychain_sync_job": 1,
          "ext_card_mentions_invoke": 1,
          "documents_remove_file_chat": 1,
          "documents_remove_file_channel": 1,
          "ext_bots_sign_in": 1,
          "put_conversations_resolver": 1,
          "cdl_data_store_create": 1,
          "platform_tab_sdk_get_auth_token": 1,
          "ext_scene_picker_fetch_apps": 1,
          "persistence_pruning_job": 1,
          "put_legacy_messages_resolver": 1,
          "platform_tab_remove": 1,
          "linkedin_render": 1,
          "submit_survey": 2,
          "related_message_sync_workflow": 1,
          "retention_pruning_job": 1,
          "inmemory_cleanup_job": 1,
          "single_profile_fetch": 1,
          "platform_tab_creation": 1,
          "cdl_worker_manager_startup": 1,
          "ext_bots_card_copy": 1,
          "ext_meeting_apps_flyout_fetch_all_apps": 1,
          "chat_roster_rendered_v2": 1,
          "ext_card_mentions_task_module_card_insert": 1,
          "platform_tab_rename": 1,
          "get_instant_answers": 2,
          "reply_chain_manager_get_previous_next_messages_for_chat": 1,
          "resolve_edit_client_lie_resolver": 1,
          "documents_upload_file_chat_conflict_dialog": 1,
          "documents_fetch_personal_site_info": 1,
          "start_trouter_connection": 1,
          "notification_settings_changed": 1,
          "platform_tab_update": 1,
          "reset_team_join_code": 1,
          "brb_create_item": 1,
          "calling_app_events_subscribe": 1,
          "calling_app_init": 1,
          "*": 3
        },
        "samplingRules": {
          "scenarions": {
            "calling_call_disconnected": 100,
            "calling_call_observe": 100,
            "calling_prejoin_render": 100,
            "calling_stack_init": 100,
            "devices_init": 100,
            "join_or_create_meetup_from_link": 100,
            "meeting_chat_activation": 100,
            "mute_self": 100,
            "start_video": 100,
            "stop_video": 100,
            "unmute_self": 100,
            "video_stream_rendering": 100,
            "*": 1
          },
          "loggingns": {
            "content_security_policy_violation": 100,
            "*": 1
          },
          "httpns": {
            "*": 1
          },
          "endpointns": {
            "*": 1
          },
          "userbins": {
            "*": 100
          }
        }
      },
      "sync": {
        "shouldTempJoinChannelIfModeratorIsNotAMember": false,
        "enableLoggingMessagesSyncedFromNetwork": false,
        "enableGuardSingleReplyChainRetryOnNonRetryableError": false,
        "enableDraftsConversationSync": true,
        "enableUsingVerifiedSenderNameFromMessage": true,
        "enableUsingChatTitleCacheInResolvers": true,
        "delayTrouterEventsUntilRegistered": true,
        "isTrouterConnectionDependsOnRegistration": true,
        "conversationGapsThresholdForSync": 10,
        "enableStopNotificationProviderOnTerminalError": true,
        "enableUseTrouterStateDirectly": true,
        "enableStoppingTrouterNotificationProviderOnRefreshTokenFailure": true,
        "enableStartNotificationProviderOnAuthUp": true,
        "enableTokenRefreshOnTrouterClaimsChallenge": true,
        "enableTokenRefreshOnTokenRevocation": true,
        "disableLegacyLastMessageUpdateComparison": true,
        "suppressBotAddMemberLastMessageUpdate": true,
        "enableTPSGetPushUpdatesWithRetry": true,
        "disableMergeThreadProperties": true,
        "enableVivaInsightsLicenseCache": true,
        "enableExecutingJobPriorityUpdate": true,
        "enableProcessingAndMutatingEmotionProperty": true,
        "enableSkypeMessageClassSanitization": true,
        "enableL2chSync": true,
        "disableReplyChainResponseMissingMessageDetection": false,
        "eventLoopBusynessTimeoutValueInSeconds": 172800,
        "enableDataSpillageHardDeletion": true,
        "enableMessageForReplyChainTrim": true,
        "disableConversationSupportedCheckForLongpollUpdate": true,
        "missingMessagesReportingConfig": {
          "enableDelayedReporting": true,
          "maxAllowedWaitInSeconds": 80
        },
        "enableRetentionHorizonBasedPruning": false,
        "disableConversationVersionFiltering": true,
        "enableClientLieInsertionValidation": false
      },
      "lobbyChat": {
        "enableLobbyChatForAttendee": true
      },
      "extensibility": {
        "enableGroupCopilotAlwaysInAtMention": true,
        "enableSuggestedActionsForGroupAndChannel": false,
        "enableShareForTemplatedApps": true,
        "enableShareForPersonalApps": true,
        "defaultAppEntitlements": "{\"userEntitlements\":{\"default\":[{\"id\":\"14d6962d-6eeb-4f48-8890-de55454bb136\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":1},{\"id\":\"3b64df9d-7e97-4d9c-ac5c-2e0a5d8e6f40\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":2},{\"id\":\"86fcd49b-61a2-4701-b771-54728cd291fb\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":2},{\"id\":\"2a84919f-59d8-4441-a975-2a8c2643b741\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":3},{\"id\":\"ef56c0de-36fc-4ef8-b417-3d82ba9d073c\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":4},{\"id\":\"20c3440d-c67e-4420-9f80-0e50c39693df\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":5},{\"id\":\"5af6a76b-40fc-4ba1-af29-8f49b08e44fd\",\"state\":\"InstalledAndPermanent\",\"isAppBarPinned\":true,\"appBarOrder\":6},{\"id\":\"5a0e35f9-d3c8-45b6-9dd9-983ab47f1b83\",\"state\":\"InstalledAndPermanent\"}]},\"definitions\":[{\"manifestVersion\":\"1.16\",\"version\":\"1.0.0\",\"developerName\":\"Microsoft Corportation\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:appkey:app_bar_simple_collab_app_name\",\"longDescription\":\"appkey:app_bar_simple_collab_app_name\",\"largeImageUrl\":\"https://res.cdn.office.net/teamsappdata/evergreen-assets/apps/3b64df9d-7e97-4d9c-ac5c-2e0a5d8e6f40_largeImage.png?v=1.0.0\",\"accentColor\":\"#ffffff\",\"id\":\"3b64df9d-7e97-4d9c-ac5c-2e0a5d8e6f40\",\"name\":\"appkey:app_bar_simple_collab_app_name\",\"smallImageUrl\":\"svg/icons-teams-medium.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:app_bar_activity_app_name\",\"longDescription\":\"appkey:app_bar_activity_app_name\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/activity_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"14d6962d-6eeb-4f48-8890-de55454bb136\",\"name\":\"appkey:app_bar_activity_app_name\",\"smallImageUrl\":\"svg/icons-bell.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:app_bar_chat_app_name\",\"longDescription\":\"appkey:app_bar_chat_app_name\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/chat_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"86fcd49b-61a2-4701-b771-54728cd291fb\",\"name\":\"appkey:app_bar_chat_app_name\",\"smallImageUrl\":\"svg/icons-chat-medium.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:app_bar_teams_app_name\",\"longDescription\":\"appkey:app_bar_teams_app_name\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/teams_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"2a84919f-59d8-4441-a975-2a8c2643b741\",\"name\":\"appkey:app_bar_teams_app_name\",\"smallImageUrl\":\"svg/icons-teams-medium.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com/en-us/\",\"privacyUrl\":\"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\":\"appkey:app_bar_calls_app_name\",\"longDescription\":\"appkey:app_bar_calls_app_name\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/calls_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"20c3440d-c67e-4420-9f80-0e50c39693df\",\"name\":\"appkey:app_bar_calls_app_name\",\"smallImageUrl\":\"svg/icons-call.html\",\"isCoreApp\":true},{\"manifestVersion\":\"1.0\",\"version\":\"1.0\",\"developerName\":\"Microsoft\",\"developerUrl\":\"https://www.microsoft.com\",\"privacyUrl\":\"https://privacy.microsoft.com/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/servicesagreement\",\"webApplicationInfo\":{\"id\":\"c9224372-5534-42cb-a48b-8db4f4a3892e\",\"resource\":\"https://teams.microsoft.com\"},\"activities\":{\"activityItems\":[{\"type\":\"meetingCreated\",\"description\":\"Meeting Created\",\"templateText\":\"{actor} invited you\"},{\"type\":\"meetingCancelled\",\"description\":\"Meeting Cancelled\",\"templateText\":\"{actor} cancelled event\"},{\"type\":\"meetingForwarded\",\"description\":\"Meeting Forwarded\",\"templateText\":\"{actor} forwarded event\"},{\"type\":\"meetingUpdated\",\"description\":\"Meeting Updated\",\"templateText\":\"{actor} updated event\"}]},\"hostedCapabilities\":[\"StaticTab\"],\"shortDescription\":\"Meeting invites, updates and reminders.\",\"longDescription\":\"Meeting invites, updates and reminders.\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/meetings_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"ef56c0de-36fc-4ef8-b417-3d82ba9d073c\",\"name\":\"Calendar\",\"smallImageUrl\":\"svg/icons-calendar-medium.html\",\"isCoreApp\":true,\"isAppBarPinned\":true,\"appBarOrder\":3,\"state\":\"InstalledAndPermanent\"},{\"manifestVersion\":\"1.3\",\"version\":\"1.0\",\"categories\":[\"CustomerSupport\",\"Productivity\",\"Microsoft\"],\"developerName\":\"Microsoft Corporation\",\"developerUrl\":\"https://products.office.com/microsoft-teams/group-chat-software\",\"privacyUrl\":\"https://privacy.microsoft.com/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/servicesagreement\",\"validDomains\":[\"support.office.com\"],\"permissions\":[\"Identity\",\"MessageTeamMembers\"],\"staticTabs\":[{\"entityId\":\"help\",\"name\":\"Help\",\"contentUrl\":\"https://support.office.com/f1/home/?shownav=True&NS=MSFTTEAMS&version=16&omkt={locale}&context=%7B%22TeamsTheme%22%3A%22{theme}%22%2C%22TeamsTenantSKU%22%3A%22TFL%22%2C%22TeamsUserLicenseType%22%3A%22{userLicenseType}%22%2C%22SessionId%22%3A%22{sessionId}%22%2C%22AppVersionMajor%22%3A%2216%22%2C%22AppVersionMinor%22%3A%220%22%2C%22AppVersionBuild%22%3A%220%22%2C%22AppVersionUpdate%22%3A%220%22%2C%22RingId%22%3A%22{ringId}%22%2C%22HostClientType%22%3A%22{hostClientType}%22%7D\",\"scopes\":[\"Personal\"]},{\"entityId\":\"training\",\"name\":\"Training\",\"contentUrl\":\"https://support.office.com/f1/home/?ShowNav=True&HelpID=teamstraining1&NS=MSFTTEAMS&version=16&omkt={locale}&context=%7B%22TeamsTheme%22%3A%22{theme}%22%2C%22TeamsTenantSKU%22%3A%22TFL%22%2C%22TeamsUserLicenseType%22%3A%22{userLicenseType}%22%2C%22SessionId%22%3A%22{sessionId}%22%2C%22AppVersionMajor%22%3A%2216%22%2C%22AppVersionMinor%22%3A%220%22%2C%22AppVersionBuild%22%3A%220%22%2C%22AppVersionUpdate%22%3A%220%22%2C%22RingId%22%3A%22{ringId}%22%2C%22HostClientType%22%3A%22{hostClientType}%22%7D\",\"scopes\":[\"Personal\"]},{\"entityId\":\"release-notes\",\"name\":\"What's New\",\"contentUrl\":\"https://support.office.com/f1/home/?ShowNav=True&HelpId=teamswhatsnew1&NS=MSFTTEAMS&version=16&omkt={locale}&context=%7B%22TeamsTheme%22%3A%22{theme}%22%2C%22TeamsTenantSKU%22%3A%22TFL%22%2C%22TeamsUserLicenseType%22%3A%22{userLicenseType}%22%2C%22SessionId%22%3A%22{sessionId}%22%2C%22AppVersionMajor%22%3A%2216%22%2C%22AppVersionMinor%22%3A%220%22%2C%22AppVersionBuild%22%3A%220%22%2C%22AppVersionUpdate%22%3A%220%22%2C%22RingId%22%3A%22{ringId}%22%2C%22HostClientType%22%3A%22{hostClientType}%22%7D\",\"scopes\":[\"Personal\"]}],\"shortDescription\":\"In-App Teams Help\",\"longDescription\":\"Help, Training and Support content for Teams\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/help_largeimage.png\",\"accentColor\":\"#ffffff\",\"id\":\"5a0e35f9-d3c8-45b6-9dd9-983ab47f1b83\",\"name\":\"Help\",\"smallImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/help_largeimage.png\",\"state\":\"InstalledAndPermanent\"},{\"manifestVersion\":\"1.0\",\"version\": \"1.0\",\"developerName\": \"Microsoft\",\"developerUrl\": \"https://www.microsoft.com/en-us/\",\"privacyUrl\": \"https://privacy.microsoft.com/en-us/privacystatement\",\"termsOfUseUrl\":\"https://www.microsoft.com/en-us/servicesagreement\",\"shortDescription\": \"Files app bar entry.\",\"longDescription\": \"Files app bar entry.\",\"largeImageUrl\": \"https://statics.teams.cdn.office.net/evergreen-assets/apps/files_largeimage.png\",\"accentColor\": \"#ffffff\",\"id\": \"5af6a76b-40fc-4ba1-af29-8f49b08e44fd\",\"name\": \"Files\",\"smallImageUrl\": \"svg/icons-document.html\",\"isCoreApp\": true,\"isAppBarPinned\": true,\"appBarOrder\": 5 }]}",
        "disableFetchBotInfoOptimization": true,
        "defaultAppDefinitionsForAnonymous": "[{\"manifestVersion\":\"devPreview\",\"version\":\"1.0.7\",\"developerName\":\"Microsoft Corporation\",\"developerUrl\":\"https://go.microsoft.com/fwlink/?linkid=2151467\",\"privacyUrl\":\"https://go.microsoft.com/fwlink/p/?linkid=857875\",\"termsOfUseUrl\":\"https://go.microsoft.com/fwlink/?linkid=2151466\",\"validDomains\":[\"teams.yammer.com\",\"web.yammer.com\",\"www.yammer.com\",\"web.gov.yammer.com\"],\"galleryTabs\":[{\"context\":[\"MeetingChatTab\",\"MeetingDetailsTab\",\"MeetingSidePanel\"],\"configurationUrl\":\"https://web.yammer.com/teamsmeeting/configure?client=teams\",\"scopes\":[]}],\"staticTabs\":[{\"entityId\":\"1\",\"name\":\"Q&A (Static)\",\"contentUrl\":\"https://web.yammer.com/teamsmeeting/teams-meeting/\",\"scopes\":[]}],\"isFullScreen\":false,\"isFullTrust\":true,\"webApplicationInfo\":{\"id\":\"00000005-0000-0ff1-ce00-000000000000\",\"resource\":\"https://web.yammer.com/teamsmeeting\"},\"showLoadingIndicator\":true,\"supportedLanguages\":[\"en-us\",\"el-cy\",\"pt-mo\",\"pt-br\",\"tr-cy\",\"zh-cn\",\"zh-mo\",\"zh-sg\",\"zh-tw\",\"ar\",\"ca\",\"cs\",\"da\",\"de\",\"el\",\"en-us\",\"es\",\"fi\",\"fr\",\"he\",\"hu\",\"id\",\"it\",\"ja\",\"ko\",\"nb\",\"nl\",\"pl\",\"pt\",\"ro\",\"ru\",\"sv\",\"th\",\"tr\",\"uk\"],\"activities\":{\"activityItems\":[{\"type\":\"userReply\",\"description\":\"Replies to your posts\",\"templateText\":\"{actor} {reply_count}replied\"},{\"type\":\"reaction\",\"description\":\"Reactions to your posts\",\"templateText\":\"{actor} {reactors_count}reacted to your message\"}]},\"meetingExtensionDefinition\":{\"isAnonymousAccessAllowed\":true},\"authorization\":{\"permissions\":{\"orgWide\":[],\"resourceSpecific\":[{\"name\":\"OnlineMeeting.ReadBasic.Chat\",\"type\":\"Delegated\"},{\"name\":\"ChannelMeeting.ReadBasic.Group\",\"type\":\"Delegated\"}]}},\"isAppIOSAcquirable\":true,\"shortDescription\":\"Questions and answers for structured meetings​\",\"longDescription\":\"The Q&A app is a robust solution for structured scenarios that organizers can customize with just a few clicks. You can add open or moderated Q&A, mark the best answer for a question, filter responses, enable replies, and more. This Q&A experience is powered by Microsoft Yammer and customized for Microsoft Teams.​\",\"accentColor\":\"#6264A7\",\"id\":\"5db56dd0-534d-467b-aeda-d622bee2574a\",\"name\":\"Q&A (Native)\",\"smallImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/5db56dd0-534d-467b-aeda-d622bee2574a_smallImage.png?v=1.0.7\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/5db56dd0-534d-467b-aeda-d622bee2574a_largeImage.png?v=1.0.7\",\"isCoreApp\":false,\"state\":\"InstalledAndPermanent\",\"isMobileOnly\":false}]",
        "enableInstalledAppQueryFromTab": true,
        "enableAdminPrePinnedTabsInMeetings": true,
        "enablePreCheckLogicForMeetings": true,
        "enableAppPolicyPush": true,
        "appsRatingTrackerConfig": {
          "appVisitsThreshold": 15,
          "coolOffPeriod": 172800000,
          "appSnoozePeriod": 2419200000,
          "doNotReviewList": [
            "3ed5b337-c2c9-4d5d-b7b4-84ff09a8fc1c",
            "com.microsoft.teamspace.tab.wiki",
            "com.microsoft.teamspace.tab.web",
            "1c256a65-83a6-4b5c-9ccf-78f8afb6f1e8",
            "d7958adf-f419-46fa-941b-1b946497ef84",
            "3e0a4fec-499b-4138-8e7c-71a9d88a62ed",
            "5af6a76b-40fc-4ba1-af29-8f49b08e44fd",
            "db5e5970-212f-477f-a3fc-2227dc7782bf",
            "66aeee93-507d-479a-a3ef-8f494af43945",
            "5966c135-e05f-4ce0-81e0-e138fe8e9583",
            "b5abf2ae-c16b-4310-8f8a-d3bcdb52f162",
            "5a0e35f9-d3c8-45b6-9dd9-983ab47f1b83",
            "683f3525-d193-4a67-8d91-22093beab1ca"
          ]
        },
        "enableDefaultAppDefinitionsForAnonymous": true,
        "enableCombineTabQueries": true,
        "enableBlockUnblockBotChatForPersonalApps": true,
        "enableStaticTabsPhase1InChannels": true,
        "enableContextlessUpgrade": true,
        "enableMRUSortingPersonalApps": true,
        "enableAboutForPersonalApps": true,
        "enablePaginationForApps": true,
        "enablePersonalAppsPopOut": false,
        "enableTabsInChatV2": true,
        "enableContextlessChatAppsPreCheckLogic": true,
        "enablePersonalLobApps": true,
        "disableFilesAppSupportForGuestUsers": true,
        "enableACv2JITInstallFromCDLv2": true,
        "enableAppAmsImagesFetch": true,
        "enableContextlessInstall": true,
        "enableAggregatedAppEntitlementsSyncDebounce": true,
        "enableAppLevelUpdateButton": true,
        "enableStaticTabsPhase1": true,
        "enableFlyoutAddAppButton": true,
        "enableUserSpecificContentInChannels": true,
        "enableDynamicAppBar": true,
        "enableInstalledAppsUpdateSubscription": true,
        "enableAppBarFlyout": true,
        "appIdList": "[\"com.microsoft.teamspace.tab.wiki\",\"90a27c51-5c74-453b-944a-134ba86da790\",\"ff2e639a-73e0-4dac-b55a-8cec27c9c826\",\"8ad5fc1b-251b-4d14-aceb-2624bcab0e85\",\"5a2715fe-ed49-4658-9212-64b70baa6ed6\",\"4491fd19-044b-45b2-9159-baa2ced6d4c5\",\"51126dcf-e4fc-48f9-8605-2d219f1f1cea\",\"c3c1cd11-5b38-4de4-9081-44573d9383bf\",\"d03f7a77-36dc-469a-a821-f86a20926944\",\"5e7a1100-1937-0c58-bac5-a0c48e77f001\",\"d5305801-d9c4-4dd1-aadf-d3cdb0d9d893\",\"7a78fde8-7c5c-445d-945e-9354649f9562\",\"9a1f0cd2-ff89-443f-9618-01993b1c5ff0\",\"42da7003-809a-4ef5-9a65-39c5a4c5cb08\",\"cd22c4a1-3135-48c5-b1c3-26de0785b5ae\",\"35af9cb3-8392-4473-9dd0-9295bab6a199\",\"100e3882-b881-4b6e-8dba-2cc8884af5d3\",\"592fa50f-40f2-46f4-a969-a6c75a9a32bb\",\"8c460194-2edf-4717-a5cc-be51ae478720\",\"0cca78c7-fa3e-4277-8e25-ca38a9f9d6cd\",\"a9f14e49-d497-429a-9d3d-0ac0ddba6ea3\"]",
        "isAllowedAppList": false,
        "enableClientSideLocalizationOfAppBarApps": true,
        "enablePreconsentedBotAtMention": true,
        "enableUserSpecificContentInAdaptiveCards": true,
        "enableAppMTAPIs": true
      },
      "meetingNotes": {
        "enableSendMeetingEventsForLiveNotes": true
      },
      "teamsCopilotAggregator": {
        "allowedUserCountToSendDataToTCA": 3,
        "enableTeamsCopilotAggregator": true
      },
      "lightMeetings": {
        "showBrbButtonEveryNthUser": 1000000,
        "showReportBrbButton": false,
        "enableModernStage": true,
        "enableVerboseTsCallingLogging": true
      },
      "activity": {
        "markAsReadAPIThrottleRate": {
          "maxConcurrentCallsCount": 3,
          "throttleLimitTimeQuantum": 8000
        },
        "enableSplitAtMentionInActivity": true,
        "enableBatchingForNewActivities": true,
        "enableMarkAsReadNetworkCallThrottling": true,
        "enableAppActivitiesContextualSettings": true,
        "enableContextualSettingsPhase1": true,
        "enableBotFeedItems": true,
        "enableMissedCallFeedChatAction": true,
        "enableActivityProvider": true,
        "honourAppsAllowlistForGraphActivities": false,
        "enableMissedCallFeedCallBackAction": true,
        "appsDisallowedForActivities": [
          "5af6a76b-40fc-4ba1-af29-8f49b08e44fd",
          "8e14e873-35ba-4720-b787-0bed94370b17",
          "1d192ad2-6590-4179-a088-daff383a52b5",
          "5ae80e49-7ada-461a-a6bd-c5df2e0cdb06"
        ],
        "enableDLPActivity": true,
        "enableMarkAllAsReadLogic": true,
        "disabledActivities": [
          "msGraph_pageNewsLink",
          "msGraph_teamsRecommendation",
          "msGraph_smbWelcome",
          "msGraph_appsRecommendation",
          "msGraph_upgradeRecommendation",
          "msGraph_helpRecommendation",
          "teamMembershipChange_hostOwnerUnshareChannelOwnerNotify",
          "teamMembershipChange_hostOwnerUnshareTeamOwnerNotify"
        ],
        "enableFeedProcessorAPICallBatching": {
          "getAppDefinition": true,
          "getConversation": true,
          "getProfile": true
        }
      },
      "experienceLoader": {
        "enableChunkedWorker": true,
        "disableRebootOnExperienceLoaderSettingsChanged": true
      },
      "notifications": {
        "enableNewDeduplicationCache": true
      },
      "trouterService": {
        "registrationMaxTTLInSeconds": 86400,
        "retryLimitOnTokenFetch": 300
      },
      "augloop": {
        "resource": "https://augloop.office.com/v2",
        "composeCopilotExpFlights": [],
        "enableUseSyndeyAvalonABTesting": true,
        "enableTimeIntentDetectionABTesting": true,
        "runtimeFlights": [
          {
            "name": "Microsoft.Teams.Augloop.EnableSendSubstrateEvents",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.AllowPartialResults",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.DefaultModelOverride",
            "value": "GPT41_ShortCo_0414"
          },
          {
            "name": "Microsoft.Teams.Augloop.FLIGHT_OMNI_MIGRATION",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableCopilotOrTeamsPremiumLicenseAggregation",
            "value": "true"
          },
          {
            "name": "Microsoft.Office.WordOnline.Augloop.EnableEditorAiPreview",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableMeetingSydneyNativeQnASkill",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableMeetingCopilotHistory",
            "value": "true"
          },
          {
            "name": "Microsoft.Office.SharedOnline.Augloop.Copilot.EnableSydneyErrorDetails",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.RingInfo",
            "value": "general"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableMeetingCopilotOptimizedStreaming",
            "value": "true"
          },
          {
            "name": "Microsoft.Office.AugLoop.AnnotationsOrderingEnabled",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.IgnoreByDesignSydneyErrors",
            "value": "true"
          },
          {
            "name": "Microsoft.Teams.Augloop.EnableSydneyAvalonMigrationForHistory",
            "value": "true"
          }
        ],
        "enableAugLoopService": true
      },
      "auth": {
        "otpMeetingEnabledRings": [
          "ring0",
          "ring1",
          "ring1_5",
          "ring2",
          "ring3"
        ],
        "enableOTPMeetings": true,
        "interactionRequiredErrorCodes": [
          "login_required",
          "consent_required",
          "interaction_required",
          "InteractionRequired",
          "UserCanceled",
          "UserCancelled",
          "NoAccountFound",
          "AccountUnusable",
          "invalid_grant",
          "no_tokens_found",
          "native_account_unavailable",
          "refresh_token_expired",
          "bad_token"
        ],
        "retriableWebErrorMessage": [
          "Token acquisition in iframe failed due to timeout",
          "ClientConfigurationError: untrusted_authority"
        ],
        "expectedErrors": [
          ":5000225,",
          ":90002,",
          ":500171,",
          "AADSTS90002",
          ":5000224,",
          "safari timeout",
          "AADSTS500014",
          "AADSTS500014: The service principal for resource 'https://api.spaces.skype.com' is disabled.  This indicate that a subscription within the tenant has lapsed, or that the administrator for this tenant has disabled the application, preventing tokens from being issued for it.",
          "server_error_code\":500014",
          "server_error_code\":5000224",
          "server_error_code\":90002",
          "server_error_code\":500011",
          "server_error_code\":50142",
          "Sending silent Cross-Cloud request on unsupported version of Windows",
          "Network request failed: If the browser threw a CORS error, check that the redirectUri is registered in the Azure App Portal as type",
          "Access denied for the resource.\",\"SystemErrorCode\":\"28",
          "server_error_code\":7000112",
          "server_error_code\":\"7000112",
          "server_error_code\":\"5000224",
          "server_error_code\":\"90002",
          "no_network_connectivity",
          "No network connectivity",
          "Seamless single sign on failed for the user",
          "AADSTS160021",
          "AADSTS70044",
          "AADSTS500011",
          "AADSTS700003",
          "AADSTS50158",
          "AADSTS50133",
          "AADSTS53000",
          "AADSTS53003",
          "AADSTS50076",
          "AADSTS50078",
          "AADSTS220501",
          "3399811147",
          "AADSTS50057",
          "2147942402",
          "80070164",
          "2147942408",
          "2147942756",
          "3221815344",
          "1067",
          "2147942403",
          "2147942658",
          "2147943712",
          "2148008704",
          "2148073494",
          "2148073520",
          "2150105227",
          "2150121473",
          "3399614475",
          "3223863297",
          "2150105345",
          "2147942403",
          "2147943811",
          "3489660941",
          "2150105344",
          "3399614465",
          "2150107397",
          "2150105250",
          "2150121474",
          "-2147023838",
          "api_error_code\": \"1003\",\"api_error_context\":\"Description: (pii), Domain: com.apple.AuthenticationServices.AuthorizationError.Error was thrown in location: Broker",
          "server_error_code\":500171",
          "Response content type: 'text/html'. Expected 'json'. HTTP response code 403.",
          "Tag\":\"4s8qh\"",
          "monitor_window_timeout",
          "all_error_tags\":\"9zj1q",
          "all_error_tags\":\"9zj1s",
          "3400073316",
          "ValidTrialLicenseNotFound",
          "TrialLicenseTenantNotReady",
          "A malformed URL prevented a URL request from being initiated",
          "AADSTS70000: The provided value for the 'code' parameter is not valid",
          "3489661028",
          "Tag\":\"7anyj\"",
          "2147942405",
          "3489660929",
          "3489661023",
          "-2147023174",
          "AADSTS500171: Certificate has been revoked"
        ],
        "maxAcquireTokenRetryForRetriableError": 3,
        "enableLoadingScreenInMeetings": true,
        "enableAuthenticateOrGetUser": true,
        "requireSkypetokenForMT": true
      },
      "shortcuts": {
        "revertMacOptShortcuts": {
          "activity": false,
          "calendar": false,
          "general": false,
          "navigation": false,
          "messaging": false,
          "meetings": false
        }
      },
      "cmdMeetingArtifactsService": {
        "cmdMeetingArtifactsServiceEndpoint": "https://teams.microsoft.com/api/mcps/prod/collab",
        "regionalArtifactsServiceEndpointPath": "collab",
        "enableMCPSTelemetryHeadersOverride": true,
        "enableRegionalEndpointStrReplace": true,
        "useRegionalArtifactsServiceEndpointResolver": true,
        "enableCMDMeetingArtifactsService": true,
        "enableEndpointsManagerForCollabObjectService": true
      },
      "meet": {
        "enableFetchUserProfilesInBatch": false,
        "disablePrefetchOnStartup": false
      },
      "autosuggest": {
        "appSuggestionsExperienceType": "SUBSTRATE",
        "enableMTOLabelInPowerbar": true,
        "enableQuerySuggestions": {
          "enableHistoryTreatment": "TREATMENT2",
          "syntheticOrderingQF": "DYNAMIC"
        },
        "domainScopingConfig": [
          {
            "name": "APPSCOPEDDOMAIN",
            "qfCount": 0,
            "zqCount": 0,
            "timeoutInMs": 2000
          },
          {
            "name": "MESSAGEDOMAIN",
            "qfCount": 8,
            "zqCount": 10,
            "timeoutInMs": 2000
          },
          {
            "name": "FILEDOMAIN",
            "qfCount": 10,
            "zqCount": 10,
            "timeoutInMs": 2000
          },
          {
            "name": "GROUPCHATDOMAIN",
            "qfCount": 10,
            "zqCount": 10,
            "timeoutInMs": 2000
          },
          {
            "name": "TCDOMAIN",
            "qfCount": 8,
            "zqCount": 8,
            "timeoutInMs": 2000
          }
        ],
        "enableMessageSerpEntry": true,
        "enableExternalPhoneSearchSuggestions": true,
        "zeroQueryExperienceType": "TOPN",
        "enableAppSuggestions": false,
        "enableSharedChannel": true,
        "enablePrivateChannel": true,
        "disableSubstrateTCC": false,
        "enableMTOSuggestions": true,
        "enableReloadingOfNamespace": true,
        "enableAdditionalPropertiesInSubstrateChat": true,
        "localSearchDelayInMs": 1000,
        "enableTopNSuggestions": true,
        "enableAutosuggestTopHits": true,
        "enableSubstrateSuggestions": true
      },
      "sensitivityLabel": {
        "sensitivityLabelCacheIntervalInHours": 12,
        "enableEndpointsManagerOnSensitivityLabel": true
      },
      "compose": {
        "disableTimestampOnCopy": true,
        "pastePreProcessorConfig": {
          "wordWebMultiLevelLists": true,
          "wordWebTableCleanup": true,
          "wordWebFixHeadings": true,
          "listItemCleanup": true,
          "shareContactCleanup": true,
          "symbolFonts": true
        }
      },
      "files": {
        "enableEndpointsManagerOnTeamSiteStatusService": true,
        "enableEndpointsManagerOnRefreshSiteUrlService": true,
        "enableEndpointsManagerOnCloudStorageFoldersService": true,
        "allowMultipleResourcesEnabled": true,
        "enableChatFilesTab": true
      },
      "smb": {
        "enableExternalSuggestedTflUsersOnly": true,
        "enableFetchingSmbTenantSettings": true
      },
      "peopleTargeting": {
        "enableAutomaticTags": true
      },
      "discoverSurface": {
        "discoverHydrationOptimization": {
          "enableHydrationOnTeamsClick": true,
          "durationToAllowBackgroundHydration": 86400000,
          "defaultLastVisitedSurface": "channel"
        },
        "enableItemComparison": true,
        "discoverChannelsRequiredConfig": {
          "enableStartUp": true,
          "enablePolling": true,
          "minimumChannelsRequired": 2
        },
        "enableDiscoverDataValidation": true,
        "enableDataSync": true,
        "discoverCDLLoadMoreCount": 20,
        "enableDataFetchOptimizer": true
      },
      "growth": {
        "irisAllCampaignCache": 72000000
      },
      "activityNotification": {
        "disableEmailSettingsForUserGraphSettings": true,
        "enableRefactorForGraphSettings": true,
        "enableGraphSettings": true,
        "enableTeamsAndChannelsSettings": true
      },
      "guardians": {
        "suppressAddMemberMessagesForGuardianChats": true,
        "enableAnnouncementsChatSuppression": true,
        "enableGuardiansPreferredMethodAndSmsInvite": true
      },
      "teamsAndChannels": {
        "recommendedTeamsCacheIntervalInHours": 168,
        "enableRecommendedTeamsSync": true,
        "enableChannelNewBadge": true
      },
      "chatService": {
        "useChatServiceAfd": true
      },
      "artifactsPlatform": {
        "enableLastUpdateTimeBasedDBCleanup": true,
        "enableArtifactsPlatformAttachmentsBatchSync": true,
        "enableArtifactsPlatformAttachmentsSync": true,
        "enableMeetingRecommendationsBatchSync": true,
        "enableMeetingRecommendationsSync": true,
        "enableArtifactsPlatformBatchStore": true,
        "enableMeetingArtifactsBatchSync": true,
        "enableVersionBasedDBCleanup": true,
        "enableMeetingArtifactsSync": true
      },
      "channels": {
        "enableInstalledAppsSubscriptionInChannelPane": true
      },
      "meetingRecap": {
        "enableMeetingRecapInChat": true
      },
      "csaService": {
        "useAcsTranslationEndpoint": true,
        "startupRetryMaximumRetries": 2,
        "enableSkypeTokenForCSAStartupAPI": true,
        "enableSkypeTokenForCSAReplyChainAPI": true
      },
      "searchCommon": {
        "enableFullTextSearchOnTopN": true
      },
      "security": {
        "pptLiveAllowedOrigin": [
          "https://c1-powerpoint-15.cdn.office.net",
          "https://c4-powerpoint-15.cdn.office.net",
          "https://c5-powerpoint-15.cdn.office.net",
          "https://res.cdn.office.net",
          "https://res-sdf.cdn.office.net",
          "https://powerpoint.cdn.office365.us",
          "https://res-gcch.cdn.office.net"
        ]
      },
      "teamsPushService": {
        "useHostFromGtmTable": true
      },
      "feedback": {
        "surveyConfigs": [
          {
            "campaignId": "63852425-0986-4c0d-8520-1279c6a622d9",
            "type": "anonMeetingEndNpsSurvey",
            "platform": "web",
            "maxRating": 5,
            "activation": {
              "nominationNumerator": 5,
              "nominationDenominator": 100,
              "nominationTimeSeconds": 86400,
              "cooldownTimeSeconds": 7776000,
              "channel": 0,
              "requiredAppFocusSeconds": 1
            }
          }
        ]
      },
      "serp": {
        "osearchBaseUrl": "https://us-prod.asyncgw.teams.microsoft.com"
      },
      "metadata": {
        "ring": {
          "id": "general",
          "friendlyName": "Public",
          "shortName": "R4"
        }
      }
    },
    "Headers": {
      "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
      "Expires": "Fri, 14 Nov 2025 21:17:00 GMT",
      "CountryCode": "GB",
      "StatusCode": "200"
    },
    "ConfigIDs": {
      "ECS": "P-R-1097555-1-5,P-R-1071975-1-2",
      "Segmentation": "P-R-1714598-1-12,P-R-1570555-1-5,P-R-1466528-2-12,P-R-1442207-1-6,P-R-1098206-1-7,P-R-1086415-1-5,P-R-1038759-1-4,P-R-84051-1-4,P-R-61704-1-3,P-R-54852-1-118,P-R-54455-1-3,P-R-25079-1-9,P-R-21477-3747251-1",
      "TeamsBuilds": "P-R-1700712-1-2,P-R-1692645-1-15,P-R-1155646-1-5,P-R-1650963-2-17,P-R-1605121-2-25,P-R-1460562-1-91,P-R-1261162-2-570,P-R-1224066-6-12,P-R-1118770-1-147,P-R-1030369-1-873,P-R-74267-1-3430,P-R-1075350-1-33,P-R-1061211-6-9,P-R-1061184-6-9,P-R-1046100-6-9,P-R-1005675-1-10,P-R-79199-2-346,P-R-89532-1-10,P-R-40084-1-35,P-R-40071-1-262,P-R-52407-1-131,P-R-50869-1-126,P-R-78991-1-57,P-R-78988-1-5,P-R-78984-1-2,P-R-78979-1-58,P-R-78445-5-5,P-R-77971-1-4498,P-R-74679-1-95,P-R-46828-1-42,P-R-38938-1-704,P-R-38876-1-1188,P-R-38795-1-2101",
      "TeamsNorthstar": "P-R-1712687-6-7,P-R-1696015-17-19,P-R-1692155-17-22,P-R-1691712-17-22,P-R-1691563-17-58,P-R-1679521-8-4,P-R-1665185-17-28,P-R-1659018-17-38,P-R-1646678-11-51,P-R-1643491-145-14,P-R-1639633-11-50,P-R-1636403-11-49,P-R-1628075-5-3,P-R-1620935-37-16,P-R-1619018-11-50,P-R-1610850-11-50,P-R-1606454-5-3,P-R-1605279-11-50,P-R-1605069-11-51,P-R-1600405-301-18,P-R-1597941-89-50,P-R-1597940-56-30,P-R-1592848-5-3,P-R-1587299-11-50,P-R-1581432-11-55,P-R-1577309-12-4,P-R-1569104-18-53,P-R-1563324-60-15,P-R-1552267-152-16,P-R-1550764-124-14,P-R-1549039-6-10,P-R-1544007-23-15,P-R-1529879-131-15,P-R-1472853-11-8,P-R-1470717-159-15,P-R-1470307-19-14,P-R-1468418-73-24,P-R-1467275-53-16,P-R-1465131-37-22,P-R-1460435-413-14,P-R-1457658-19-5,P-R-1456360-160-24,P-R-1454053-12-4,P-R-1454052-12-4,P-R-1452119-138-15,P-R-1451076-27-15,P-R-1448393-163-16,P-R-1448392-163-16,P-R-1441805-28-16,P-R-1439977-124-17,P-R-1439230-29-17,P-R-1435579-369-25,P-R-1433276-6-8,P-R-1422637-49-23,P-R-1422462-796-33,P-R-1422413-224-6,P-R-1422356-47-6,P-R-1422209-3-5,P-R-1416769-138-16,P-R-1415758-376-29,P-R-1379224-40-28,P-R-1293776-604-24,P-R-1293775-937-32,P-R-1293350-53-28,P-R-1288632-28-16,P-R-1282193-37-15,P-R-1277693-29-20,P-R-1273046-51-32,P-R-1271067-152-16,P-R-1267638-90-45,P-R-1267637-52-36,P-R-1267550-135-14,P-R-1264690-53-28,P-R-1264617-15-11,P-R-1259237-19-5,P-R-1258471-33-20,P-R-1258418-338-34,P-R-1258417-338-34,P-R-1254857-320-26,P-R-1251763-196-19,P-R-1244865-37-17,P-R-1243537-20-16,P-R-1243205-173-24,P-R-1242216-24-16,P-R-1240798-20-16,P-R-1240621-259-30,P-R-1239198-67-19,P-R-1238300-28-18,P-R-1238289-28-18,P-R-1237231-183-27,P-R-1237008-22-17,P-R-1235953-196-18,P-R-1233389-94-16,P-R-1232525-41-17,P-R-1231682-196-18,P-R-1230566-110-26,P-R-1229470-128-17,P-R-1228676-223-24,P-R-1228433-93-17,P-R-1226442-51-24,P-R-1224903-24-16,P-R-1221555-43-18,P-R-1176820-25-16,P-R-1174916-30-20,P-R-1174890-52-20,P-R-1174694-262-23,P-R-1174607-8-5,P-R-1173994-28-22,P-R-1173376-25-16,P-R-1169336-11-7,P-R-1168312-113-21,P-R-1166701-196-21,P-R-1165855-37-21,P-R-1163401-40-19,P-R-1161719-28-16,P-R-1161652-95-31,P-R-1161626-25-17,P-R-1160202-47-28,P-R-1159661-485-35,P-R-1159408-107-29,P-R-1159407-107-29,P-R-1158268-89-3,P-R-1158192-103-28,P-R-1158190-59-24,P-R-1157702-39-18,P-R-1156139-79-28,P-R-1156138-79-28,P-R-1156041-42-20,P-R-1156033-52-19,P-R-1151815-14-13,P-R-1150083-40-19,P-R-1149387-51-11,P-R-1147901-22-7,P-R-1147194-91-18,P-R-1146660-11-26,P-R-1145906-141-22,P-R-1141324-89-28,P-R-1141198-158-24,P-R-1139285-22-7,P-R-1137981-18-14,P-R-1136792-31-18,P-R-1136791-31-18,P-R-1130283-86-25,P-R-1126666-53-13,P-R-1127064-74-29,P-R-1125499-39-18,P-R-1125283-2455-188,P-R-1120445-127-25,P-R-1117892-31-17,P-R-1117029-408-127,P-R-1117005-24-9,P-R-1115902-30-13,P-R-1115815-764-52,P-R-1115288-44-16,P-R-1114796-176-25,P-R-1114795-19-15,P-R-1114538-554-47,P-R-1112544-76-26,P-R-1112460-26-18,P-R-1111932-27-17,P-R-1109553-84-16,P-R-1108803-57-26,P-R-1108770-498-44,P-R-1108339-29-13,P-R-1106790-36-21,P-R-1106686-46-20,P-R-1105882-58-17,P-R-1105330-27-12,P-R-1105292-21-14,P-R-1103663-29-14,P-R-1103008-34-19,P-R-1102750-66-25,P-R-1102704-77-30,P-R-1102509-272-35,P-R-1098492-16-14,P-R-1097544-81-28,P-R-1097132-251-32,P-R-1095261-26-15,P-R-1093928-152-33,P-R-1093140-41-18,P-R-1091224-187-25,P-R-1091146-7-14,P-R-1090751-33-15,P-R-1090378-42-19,P-R-1089432-35-27,P-R-1089097-39-21,P-R-1087480-39-21,P-R-1087479-39-21,P-R-1087478-39-21,P-R-1087477-39-21,P-R-1087404-294-32,P-R-1087376-23-14,P-R-1087233-239-29,P-R-1087206-23-15,P-R-1087205-40-19,P-R-1087187-39-21,P-R-1087186-39-21,P-R-1087145-93-11,P-R-1086614-56-17,P-R-1084356-40-22,P-R-1084355-40-22,P-R-1084261-15-11,P-R-1083821-41-18,P-R-1082781-14-11,P-R-1082214-17-13,P-R-1082213-57-25,P-R-1082202-34-16,P-R-1081885-41-18,P-R-1081824-61-26,P-R-1081599-40-19,P-R-1081314-4051-109,P-R-1080171-154-22,P-R-1079190-37-17,P-R-1077683-5-24,P-R-1077697-498-44,P-R-1077513-39-19,P-R-1076299-464-48,P-R-1076298-594-52,P-R-1075918-65-18,P-R-1075490-127-38,P-R-1074339-49-24,P-R-1074000-58-34,P-R-1073491-41-18,P-R-1073485-21-14,P-R-1067189-2-24,P-R-1070284-500-46,P-R-1070115-974-49,P-R-1068852-10-31,P-R-1064479-2-15,P-R-1066532-118-28,P-R-1064502-17-13,P-R-1062125-249-29,P-R-1061266-114-25,P-R-1059978-154-22,P-R-1059826-504-50,P-R-1059497-80-26,P-R-1059496-34-17,P-R-1051768-3-32,P-R-1057033-23-8,P-R-1053362-1-38,P-R-1054075-83-26,P-R-1052933-368-74,P-R-1052932-51-22,P-R-1049874-32-16,P-R-1049115-11-62,P-R-1049259-81-13,P-R-1048115-84-29,P-R-1043981-21-14,P-R-1043138-128-27,P-R-1042201-12-8,P-R-1041582-23-16,P-R-1036660-155-37,P-R-1036451-53-15,P-R-1036449-70-28,P-R-1036226-314-42,P-R-1036224-319-43,P-R-1036222-349-44,P-R-1033462-24-12,P-R-1030200-32-16,P-R-1028428-2-4,P-R-1024323-31-18,P-R-1022023-75-24,P-R-1021713-6-8,P-R-1021441-20-16,P-R-1020644-18-16,P-R-1020451-84-30,P-R-1020349-13-10,P-R-1019858-153-33,P-R-1015546-12-27,P-R-1014702-15-11,P-R-1014701-32-16,P-R-1014116-23-13,P-R-1012627-39-15,P-R-1010105-10-7,P-R-1008785-5-26,P-R-1001782-5-19,P-R-1001991-40-18,P-R-1001989-20-14,P-R-1001961-426-66,P-R-1001943-20-20,P-R-1001941-20-20,P-R-1001937-29-15,P-R-1001933-29-15,P-R-1001863-36-19,P-R-1001849-45-24,P-R-1001838-17-15,P-R-1001837-81-40,P-R-117954-7-15,P-R-104469-14-13,P-R-103048-738-70,P-R-99039-7-7,P-R-98806-202-48,P-R-98186-53-34,P-R-98079-76-25,P-R-95367-814-49,P-R-93805-784-70,P-R-93804-883-53,P-R-92405-125-49,P-R-92399-11-8,P-R-90232-182-36,P-R-89825-36-18,P-R-87909-136-34,P-R-87052-51-19,P-R-86963-30-15,P-R-86219-2036-67,P-R-84674-10-7,P-R-84407-10-7,P-R-84152-284-67,P-R-83951-38-28,P-R-80149-36-19,P-R-74169-103-44,P-R-71975-29-22,P-R-70668-3-13,P-R-70357-43-24,P-R-68741-362-62,P-R-68283-105-70,P-R-67159-10709-487,P-R-67009-28-23,P-R-66548-28-24,P-R-66363-2257-154,P-R-65553-16-16,P-R-64817-55-26,P-R-64816-55-26,P-R-62094-207-24,P-R-56037-38356-1040,P-R-54792-110-13,P-R-46942-1032-65,P-R-46842-1-4,P-D-41777-10-1"
    }
  }
  ```
- GET `https://teams.microsoft.com/api/mt/emea/beta/atpsafelinks/getpolicy/`
- GET `https://teams.microsoft.com/api/mt/emea/beta/atpsafelinks/getpolicy/`
- POST `https://csp.microsoft.com/report/teams-web-r4?v=25110306401&env=prod&exp=light-meetings&endpoint=precompiled-web-worker`
  ```json
  {
    "csp-report": {
      "document-uri": "https://teams.microsoft.com/light-meetings/worker/precompiled-web-worker-d52ff05679ad1eeb.js",
      "referrer": "",
      "violated-directive": "connect-src",
      "effective-directive": "connect-src",
      "original-policy": "block-all-mixed-content;connect-src 'self' https://statics.teams.cdn.office.net *.events.data.microsoft.com blob: data: https: *.teams.microsoft.com teams.microsoft.com outlook.office.com substrate.office.com whiteboard.microsoft.com  wss://*.teams.microsoft.com wss://*.enterprisevoice.svc.cloud.microsoft wss://substrate.office.com;default-src 'none';require-trusted-types-for 'script';script-src https://statics.teams.cdn.office.net;trusted-types @msteams/light-meetings;report-uri https://csp.microsoft.com/report/teams-web-r4?v=25110306401&env=prod&exp=light-meetings&endpoint=precompiled-web-worker;",
      "disposition": "report",
      "blocked-uri": "wss://augloop.office.com/",
      "line-number": 1,
      "column-number": 17701,
      "source-file": "https://statics.teams.cdn.office.net/teams-modular-packages/hashed-assets/21255-e0b9ac6ff8c9d200.js",
      "status-code": 0,
      "script-sample": ""
    }
  }
  ```
- GET `wss://augloop.office.com/`
- GET `https://teams.microsoft.com/api/chatsvc/emea/v1/users/ME/conversations/48%3Anotifications?view=msnp24Equivalent`
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
- GET `https://teams.microsoft.com/api/csa/emea/api/v1/teams/users/anonymous?isPrefetch=false&enableMembershipSummary=true`
  ```json
  {
    "teams": [],
    "chats": [
      {
        "id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "consumptionHorizon": null,
        "productContext": "TEAMS",
        "lastRcMetadataVersion": 0,
        "lastL2MessageIdNFS": 0,
        "retentionHorizon": null,
        "retentionHorizonV2": null,
        "members": [
          {
            "isMuted": false,
            "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
            "objectId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
            "role": "Admin",
            "isIdentityMasked": false
          },
          {
            "isMuted": false,
            "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
            "objectId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f",
            "role": "Admin",
            "shareHistoryTime": "2025-11-14T20:13:43.5780000Z",
            "isIdentityMasked": false
          },
          {
            "isMuted": false,
            "mri": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
            "objectId": "7652096e9b61413696f1fe2c756c8759",
            "role": "Anonymous",
            "friendlyName": "Neil Rashbrook",
            "shareHistoryTime": "2025-11-14T20:16:49.7660000Z",
            "isIdentityMasked": false
          }
        ],
        "title": "Join URL",
        "version": 1763151416053,
        "threadVersion": 1763151409766,
        "threadType": "meeting",
        "isEmptyConversation": true,
        "isRead": true,
        "isHighImportance": true,
        "isOneOnOne": false,
        "lastMessage": {
          "messageType": null,
          "content": null,
          "clientMessageId": null,
          "fromFamilyNameInToken": null,
          "fromGivenNameInToken": null,
          "fromDisplayNameInToken": null,
          "imDisplayName": null,
          "id": null,
          "type": null,
          "composeTime": null,
          "originalArrivalTime": null,
          "containerId": null,
          "parentMessageId": null,
          "from": null,
          "sequenceId": 0,
          "version": -1,
          "threadType": null,
          "isEscalationToNewPerson": false
        },
        "isLastMessageFromMe": false,
        "chatSubType": 1,
        "meetingInformation": {
          "subject": "Join URL",
          "location": "Microsoft Teams Meeting",
          "startTime": "2025-11-14T20:15:00Z",
          "endTime": "2025-11-14T20:30:00Z",
          "exchangeId": null,
          "iCalUid": "040000008200E00074C5B7101A82E0080000000072A50B2CA355DC01000000000000000010000000E1BEE7FF021EDF42B3A330E714CBA3F1",
          "isCancelled": false,
          "meetingJoinUrl": "https://teams.microsoft.com/l/meetup-join/19%3ameeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl%40thread.v2/0?context=%7b%22Tid%22%3a%22338de7e8-b10a-4a7c-aeb4-4cdf726fc818%22%2c%22Oid%22%3a%2250a17a93-7e33-44f1-baef-8f234457f3e7%22%7d",
          "organizerId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
          "coOrganizerIds": [],
          "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
          "appointmentType": 0,
          "meetingType": 2,
          "scenario": "",
          "isCopyRestrictionEnforced": false,
          "groupCopilotDetails": {
            "enabled": false
          }
        },
        "lastJoinAt": "2025-11-14T20:16:49.7660000Z",
        "createdAt": "2025-11-14T20:13:35.6570000Z",
        "creator": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
        "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "hidden": false,
        "isGapDetectionEnabled": true,
        "interopType": 0,
        "activeMeetup": {
          "messageId": "0",
          "conversationUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687",
          "conversationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
          "groupCallInitiator": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
          "wasInitiatorInLobby": true,
          "expiration": "2025-11-14T22:16:01.0000000Z",
          "status": "Active",
          "isHostless": true,
          "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
          "organizerId": "50a17a93-7e33-44f1-baef-8f234457f3e7",
          "callMeetingType": -1,
          "meetingData": {
            "meetingCode": "39563371502184"
          },
          "conversationType": "scheduledMeeting"
        },
        "isConversationDeleted": false,
        "isExternal": false,
        "addedBy": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
        "addedByTenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "isMessagingDisabled": false,
        "isDisabled": false,
        "importState": "unknown",
        "chatType": "meeting",
        "interopConversationStatus": "None",
        "conversationBlockedAt": 0,
        "hasTranscript": false,
        "isMigrated": true,
        "isSticky": false,
        "isSmsThread": false,
        "meetingPolicy": "Unknown",
        "rosterVersion": 1763151409766,
        "identityMaskEnabled": false,
        "ongoingCallChatEnforcement": "true",
        "isLiveChatEnabled": false,
        "fileReferences": {}
      }
    ],
    "users": [],
    "privateFeeds": [],
    "metadata": {
      "syncToken": "eyJkZWxpdmVyZWRTZWdtZW50cyI6W3sic3RhcnQiOiIxOTcwLTAxLTAxVDAwOjAwOjAwKzAwOjAwIiwiZW5kIjoiMjAyNS0xMS0xNFQyMDoxNjo1Ni4wNTMrMDA6MDAifV0sInplcm9MTVNURGVsaXZlcmVkU2VnbWVudHMiOltdLCJzb3J0T3JkZXIiOjAsImluY2x1ZGVaZXJvTE1TVCI6ZmFsc2V9",
      "forwardSyncToken": null,
      "isPartialData": false,
      "hasMoreChats": false
    }
  }
  ```
- POST `https://go-eu.trouter.teams.microsoft.com/v4/a/?cor_id=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&con_num=1763151425745_1&epid=3a12f989-a34f-4f37-ad87-da0933cab0ca`
  ```json
  {
    "ccid": "IrCMF3fSVCw",
    "id": "pGhn0N5INkuIrCMF3fSVCw",
    "socketio": "https://pub-ent-sece-11-t.trouter.teams.microsoft.com:443/",
    "surl": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/pGhn0N5INkuIrCMF3fSVCw/",
    "url": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:8443/v4/f/pGhn0N5INkuIrCMF3fSVCw/",
    "ttl": "551041",
    "healthUrl": "https://go-eu.trouter.teams.microsoft.com:443/v4/h",
    "curlb": "https://pub-ent-sece-11-t.trouter.teams.microsoft.com:443",
    "registrarUrl": "https://teams.microsoft.com/registrar/prod/V3/registrations",
    "connectparams": {
      "sr": "pGhn0N5INkuIrCMF3fSVCw",
      "issuer": "",
      "sp": "pub-ent-sece-11",
      "se": "1763702467584",
      "st": "1763151126584",
      "sig": "E0ADF8B7F5622E45164823F7B92226C670871CFAAC2B298D0613768DE3C97FF2"
    }
  }
  ```
- GET `https://teams.microsoft.com/api/chatsvc/emea/v1/users/ME/conversations/19%3Ameeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl%40thread.v2/messages?view=msnp24Equivalent|supportsMessageProperties&pageSize=20&startTime=1763151409766`
  ```json
  {
    "messages": [
      {
        "sequenceId": 5,
        "origincontextid": "9e4c735c-19cd-4909-a3a9-a5b03f425e58",
        "conversationid": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "conversationLink": "https://teams.microsoft.com/api/chatsvc/emea/v1/users/ME/conversations/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "type": "Message",
        "id": "1763151415452",
        "version": "1763151415452",
        "messagetype": "ThreadActivity/MemberJoined",
        "content": "{\"eventtime\":1763151415452,\"initiator\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"members\":[{\"id\":\"8:teamsvisitor:7652096e9b61413696f1fe2c756c8759\",\"friendlyname\":\"Neil Rashbrook\"}]}",
        "from": "https://teams.microsoft.com/api/chatsvc/emea/v1/users/ME/contacts/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "composetime": "2025-11-14T20:16:55.4520000Z",
        "originalarrivaltime": "2025-11-14T20:16:55.4520000Z"
      }
    ],
    "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
    "_metadata": {
      "lastCompleteSegmentStartTime": 1763151409766,
      "lastCompleteSegmentEndTime": 1763151415452,
      "syncState": "https://teams.microsoft.com/api/chatsvc/emea/v1/users/ME/conversations/19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2/messages?startTime=1763151409766&syncState=3e4500000031393a6d656574696e675f4e325533597a597a4d325574595455784f5330304e574e684c574935596d4574596d55354d446377596d4d324d6a426c407468726561642e763201667203849a0100009c8803849a010000&pageSize=20&view=msnp24Equivalent"
    }
  }
  ```
- GET `https://pub-ent-sece-11-t.trouter.teams.microsoft.com/socket.io/1/?sr=pGhn0N5INkuIrCMF3fSVCw&issuer=&sp=pub-ent-sece-11&se=1763702467584&st=1763151126584&sig=E0ADF8B7F5622E45164823F7B92226C670871CFAAC2B298D0613768DE3C97FF2&v=v4&tc=%7B%22cv%22:%222025.43.01.1%22,%22ua%22:%22TeamsCDL%22,%22hr%22:%22%22,%22v%22:%221415/25110306401%22%7D&timeout=40&auth=true&epid=3a12f989-a34f-4f37-ad87-da0933cab0ca&userActivity=%7B%22state%22%3A%22active%22%2C%22cv%22%3A%22SuoXPAa56QgJGmJPwB4Rlg.1%22%7D&ccid=IrCMF3fSVCw&cor_id=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&con_num=1763151425745_1&t=1763151426205`
  ```
  "c4e543b47aa508c-4593deec1eda106a:70:70:websocket,xhr-polling"
  ```
- GET `wss://pub-ent-sece-11-t.trouter.teams.microsoft.com/socket.io/1/websocket/c4e543b47aa508c-4593deec1eda106a?sr=pGhn0N5INkuIrCMF3fSVCw&issuer=&sp=pub-ent-sece-11&se=1763702467584&st=1763151126584&sig=E0ADF8B7F5622E45164823F7B92226C670871CFAAC2B298D0613768DE3C97FF2&v=v4&tc=%7B%22cv%22:%222025.43.01.1%22,%22ua%22:%22TeamsCDL%22,%22hr%22:%22%22,%22v%22:%221415/25110306401%22%7D&timeout=40&auth=true&epid=3a12f989-a34f-4f37-ad87-da0933cab0ca&userActivity=%7B%22state%22%3A%22active%22%2C%22cv%22%3A%22SuoXPAa56QgJGmJPwB4Rlg.1%22%7D&ccid=IrCMF3fSVCw&cor_id=2faf8b42-e740-4eb8-87fd-90cfa3fef0ae&con_num=1763151425745_1`
- POST `https://teams.microsoft.com/registrar/prod/V2/registrations`
  ```json
  {
    "clientDescription": {
      "appId": "TeamsCDLWebWorker",
      "aesKey": "",
      "languageId": "en-US",
      "platform": "chrome",
      "templateKey": "TeamsCDLWebWorker_2.5",
      "platformUIVersion": "1415/25110306401"
    },
    "registrationId": "3a12f989-a34f-4f37-ad87-da0933cab0ca",
    "nodeId": "",
    "transports": {
      "TROUTER": [
        {
          "context": "",
          "path": "https://pub-ent-sece-11-f.trouter.teams.microsoft.com:3443/v4/f/pGhn0N5INkuIrCMF3fSVCw/",
          "ttl": 3600
        }
      ]
    }
  }
  ```
- GET `https://api.flightproxy.teams.microsoft.com/api/v2/ep/broker-euno-02-prod-aks.broker.skype.com/api/v1/subscribe/5414a7bb-ef7e-40ae-9a4b-8f96acd6a36d/1?i=10-128-19-103`
- - POST `https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/leave?i=10-128-165-183&e=638984925660033687`
  ```json
  {
    "participants": {
      "from": {
        "id": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
        "displayName": "Neil Rashbrook",
        "endpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
        "participantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
        "languageId": "en-us"
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
- POST `https://eu-ic3.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&ext.intweb.msfpc=GUID%3D14c39fdda73d46fe86c87ebef336b5c5%26HASH%3D14c3%26LV%3D202511%26V%3D4%26LU%3D1763151320843&w=0&content-encoding=gzip`
  ```json
  {
    "name": "skypecosi_concore_web_pluginless_call_session",
    "time": "2025-11-14T20:17:16.273Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 3,
        "installId": "7af01589-461d-4932-8f47-2b8619ce60e4",
        "epoch": "641428208"
      },
      "app": {
        "locale": "en",
        "sesId": "/oblfU2k0wsYLU3GMC3w6j"
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
        "msfpc": "GUID=14c39fdda73d46fe86c87ebef336b5c5&HASH=14c3&LV=202511&V=4&LU=1763151320843"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "display_name": {
            "t": 33
          },
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
      "ui_version": "1415/25110306401",
      "agent_environment_id": "760e92e2-9ab2-42aa-9a09-b08e9c22570e",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "participant_id": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "display_name": "Neil Rashbrook",
      "endpoint_id": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "media_leg_id": "9495a715-0c01-4878-857b-8d7605c7cb42",
      "ts_calling_version": "2025.43.01.3",
      "LocalUser": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
      "ResultCode": "1",
      "EventTimestampBag": "{\"eventStart\":1763151325387,\"events\":[{\"MultiPartyModeSet\":0},{\"CallStateChanged\":2,\"data\":\"Observing\"},{\"CallStateChanged\":33046,\"data\":\"Connecting\"},{\"CallStateChanged\":35048,\"data\":\"Lobby\"},{\"CallStateChanged\":85398,\"data\":\"Connected\"},{\"CallStateChanged\":110592,\"data\":\"Disconnecting\"},{\"CallStateChanged\":110799,\"data\":\"Disconnected\"}]}",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "light-meetings",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "emea",
      "AppInfo.UserRole": "Anonymous",
      "AppInfo.UserType": "Anonymous",
      "DeviceInfo.Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  {
    "name": "skypecosi_concore_web_pluginless_modality_session",
    "time": "2025-11-14T20:17:16.280Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 4,
        "installId": "7af01589-461d-4932-8f47-2b8619ce60e4",
        "epoch": "641428208"
      },
      "app": {
        "locale": "en",
        "sesId": "/oblfU2k0wsYLU3GMC3w6j"
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
        "msfpc": "GUID=14c39fdda73d46fe86c87ebef336b5c5&HASH=14c3&LV=202511&V=4&LU=1763151320843"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "display_name": {
            "t": 33
          },
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
      "ui_version": "1415/25110306401",
      "agent_environment_id": "760e92e2-9ab2-42aa-9a09-b08e9c22570e",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "participant_id": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "display_name": "Neil Rashbrook",
      "endpoint_id": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "media_leg_id": "9495a715-0c01-4878-857b-8d7605c7cb42",
      "ts_calling_version": "2025.43.01.3",
      "LocalUser": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
      "ResultCode": "0",
      "EventTimestampBag": "{\"eventStart\":1763151358471,\"events\":[{\"StartModality\":0},{\"StreamStateChanged\":2342,\"data\":{\"state\":\"StreamActive\",\"direction\":\"Receive\"}},{\"StreamStateChanged\":52174,\"data\":{\"state\":\"StreamActive\",\"direction\":\"Receive\"}}]}",
      "MediaType": "Audio",
      "Role": "Bidirectional",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "light-meetings",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "emea",
      "AppInfo.UserRole": "Anonymous",
      "AppInfo.UserType": "Anonymous",
      "DeviceInfo.Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  {
    "name": "skypecosi_concore_web_pluginless_modality_session",
    "time": "2025-11-14T20:17:16.282Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 5,
        "installId": "7af01589-461d-4932-8f47-2b8619ce60e4",
        "epoch": "641428208"
      },
      "app": {
        "locale": "en",
        "sesId": "/oblfU2k0wsYLU3GMC3w6j"
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
        "msfpc": "GUID=14c39fdda73d46fe86c87ebef336b5c5&HASH=14c3&LV=202511&V=4&LU=1763151320843"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "display_name": {
            "t": 33
          },
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
      "ui_version": "1415/25110306401",
      "agent_environment_id": "760e92e2-9ab2-42aa-9a09-b08e9c22570e",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "participant_id": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "display_name": "Neil Rashbrook",
      "endpoint_id": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "media_leg_id": "9495a715-0c01-4878-857b-8d7605c7cb42",
      "ts_calling_version": "2025.43.01.3",
      "LocalUser": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
      "ResultCode": "0",
      "EventTimestampBag": "{\"eventStart\":1763151358507,\"events\":[{\"StartModality\":0},{\"StreamStateChanged\":145,\"data\":{\"state\":\"StreamActive\",\"direction\":\"Send\"}}]}",
      "MediaType": "Video",
      "Role": "Sender",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "light-meetings",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "emea",
      "AppInfo.UserRole": "Anonymous",
      "AppInfo.UserType": "Anonymous",
      "DeviceInfo.Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  {
    "name": "skypecosi_concore_web_pluginless_modality_session",
    "time": "2025-11-14T20:17:16.283Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 6,
        "installId": "7af01589-461d-4932-8f47-2b8619ce60e4",
        "epoch": "641428208"
      },
      "app": {
        "locale": "en",
        "sesId": "/oblfU2k0wsYLU3GMC3w6j"
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
        "msfpc": "GUID=14c39fdda73d46fe86c87ebef336b5c5&HASH=14c3&LV=202511&V=4&LU=1763151320843"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "display_name": {
            "t": 33
          },
          "LocalUser": {
            "t": 321
          },
          "TargetUser": {
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
      "ui_version": "1415/25110306401",
      "agent_environment_id": "760e92e2-9ab2-42aa-9a09-b08e9c22570e",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "participant_id": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "display_name": "Neil Rashbrook",
      "endpoint_id": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "media_leg_id": "9495a715-0c01-4878-857b-8d7605c7cb42",
      "ts_calling_version": "2025.43.01.3",
      "LocalUser": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
      "ResultCode": "0",
      "EventTimestampBag": "{\"eventStart\":1763151361016,\"events\":[{\"Available\":0,\"data\":{}}]}",
      "MediaType": "Video",
      "Role": "Receiver",
      "TargetUser": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "light-meetings",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "emea",
      "AppInfo.UserRole": "Anonymous",
      "AppInfo.UserType": "Anonymous",
      "DeviceInfo.Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  {
    "name": "skypecosi_concore_web_pluginless_modality_session",
    "time": "2025-11-14T20:17:16.284Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 7,
        "installId": "7af01589-461d-4932-8f47-2b8619ce60e4",
        "epoch": "641428208"
      },
      "app": {
        "locale": "en",
        "sesId": "/oblfU2k0wsYLU3GMC3w6j"
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
        "msfpc": "GUID=14c39fdda73d46fe86c87ebef336b5c5&HASH=14c3&LV=202511&V=4&LU=1763151320843"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "display_name": {
            "t": 33
          },
          "LocalUser": {
            "t": 321
          },
          "TargetUser": {
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
      "ui_version": "1415/25110306401",
      "agent_environment_id": "760e92e2-9ab2-42aa-9a09-b08e9c22570e",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "participant_id": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "display_name": "Neil Rashbrook",
      "endpoint_id": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "media_leg_id": "9495a715-0c01-4878-857b-8d7605c7cb42",
      "ts_calling_version": "2025.43.01.3",
      "LocalUser": "8:teamsvisitor:7652096e9b61413696f1fe2c756c8759",
      "ResultCode": "0",
      "EventTimestampBag": "{\"eventStart\":1763151412186,\"events\":[{\"Available\":0,\"data\":{}}]}",
      "MediaType": "Video",
      "Role": "Receiver",
      "TargetUser": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "light-meetings",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "emea",
      "AppInfo.UserRole": "Anonymous",
      "AppInfo.UserType": "Anonymous",
      "DeviceInfo.Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  {
    "name": "skypecosi_concore_web_ts_calling_in_call_session",
    "time": "2025-11-14T20:17:16.292Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 9,
        "installId": "7af01589-461d-4932-8f47-2b8619ce60e4",
        "epoch": "641428208"
      },
      "app": {
        "locale": "en",
        "sesId": "/oblfU2k0wsYLU3GMC3w6j"
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
        "msfpc": "GUID=14c39fdda73d46fe86c87ebef336b5c5&HASH=14c3&LV=202511&V=4&LU=1763151320843"
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
          },
          "DisplayName": {
            "t": 33
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
      "user_id": "u1",
      "Skype_InitiatingUser_Username": "u1",
      "SkypeId": "u1",
      "ui_version": "1415/25110306401",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "PreviousCorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "DisplayName": "Neil Rashbrook",
      "CallType": "2",
      "ConversationType": "scheduledMeeting",
      "Direction": "Outgoing",
      "Origin": "0",
      "SelfParticipantRole": "join",
      "MessageId": "0",
      "Ring": "general",
      "Region": "emea",
      "IsHuddleGroupCall": "True",
      "IsEmergency": "False",
      "TsCallingVersion": "2025.43.01.3",
      "TerminationState": "7",
      "TerminationReason": "1",
      "EventTimestampBag": "{\"eventStart\":1763151325358,\"events\":[{\"AudioStateChanged\":{\"start\":35455,\"causeId\":\"ccedc44f\",\"data\":[{\"state\":{\"content\":\"audio\",\"direction\":\"receive\",\"stream\":\"active\"}}]}},{\"_SelfParticipantUpdated\":{\"start\":35655,\"causeId\":\"cf947e69\",\"data\":[{\"isServerMuted\":true}]}},{\"_UpdateLocalParticipantStream\":{\"start\":35657,\"causeId\":\"6931dea4\",\"data\":[[{\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"serverMuted\":true,\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"applicationsharing-video\":\"recvonly\",\"data\":\"sendrecv\"}]]}},{\"_SetMuted\":{\"start\":35660,\"causeId\":\"6931dea4\",\"data\":[{\"isMuted\":1}]}},{\"_ParticipantJoined\":{\"start\":83899,\"duration\":0,\"status\":\"Success\",\"result\":[{\"participantId\":\"c3c66e90-81b9-4aae-9869-5e82ebaa5b0c\"}],\"causeId\":\"f107fa57\"}},{\"_WebOnOffer\":{\"start\":84175,\"causeId\":\"bec11d11\",\"data\":[{\"isRenegotiation\":true,\"isEscalation\":false,\"mediaTypes\":[],\"newOffer\":true}]}},{\"_RenegotiateIncoming\":{\"start\":84176,\"duration\":898,\"status\":\"Success\",\"causeId\":\"bec11d11\"}},{\"_SetLocalVideo\":{\"start\":84257,\"causeId\":\"bec11d11\",\"data\":[{\"value\":true}]}},{\"_SetLocalAudio\":{\"start\":84257,\"causeId\":\"bec11d11\",\"data\":[{\"value\":true}]}},{\"NegotiationCompletion\":{\"start\":85074,\"causeId\":\"bec11d11\",\"data\":[{\"phaseTelemetryBag\":{\"MediaProcessOffer\":{\"t\":68},\"MediaCreateAnswer\":{\"t\":443},\"SignalingAcceptRenegotiation\":{\"t\":196},\"SignalingMediaAcknowledgement\":{\"t\":176},\"CompleteNegotiation\":{\"t\":0}},\"isComplete\":true,\"activeModalities\":{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"},\"configuredModalities\":{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"},\"initiator\":null,\"attemptedModalities\":{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"},\"offeredModalities\":{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"}}]}},{\"AudioStateChanged\":{\"start\":85287,\"causeId\":\"545813a6\",\"data\":[{\"state\":{\"content\":\"audio\",\"direction\":\"receive\",\"stream\":\"active\"}}]}},{\"_SelfParticipantUpdated\":{\"start\":85426,\"causeId\":\"2c3019ad\",\"data\":[{\"isServerMuted\":false}]}},{\"_SetCallState\":{\"start\":85427,\"causeId\":\"fbc6d8b5\",\"data\":[{\"state\":3,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":86828,\"causeId\":\"fbc6d8b5\",\"data\":[{\"state\":3,\"reason\":0}]}},{\"_UpdateLocalParticipantStream\":{\"start\":86828,\"causeId\":\"fbc6d8b5\",\"data\":[[{\"participantId\":\"0d8c1984-b4da-4276-9ec1-208328e346f6\",\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"serverMuted\":false,\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"applicationsharing-video\":\"recvonly\",\"data\":\"sendrecv\"}]]}},{\"_SetMuted\":{\"start\":86995,\"causeId\":\"fbc6d8b5\",\"data\":[{\"isMuted\":0}]}},{\"_WebOnOffer\":{\"start\":90374,\"causeId\":\"e8c8baf8\",\"data\":[{\"isRenegotiation\":true,\"isEscalation\":false,\"mediaTypes\":[],\"newOffer\":false}]}},{\"_RenegotiateIncoming\":{\"start\":90375,\"duration\":372,\"status\":\"Success\",\"causeId\":\"e8c8baf8\"}},{\"_SetLocalVideo\":{\"start\":90387,\"causeId\":\"e8c8baf8\",\"data\":[{\"value\":true}]}},{\"_SetLocalAudio\":{\"start\":90387,\"causeId\":\"e8c8baf8\",\"data\":[{\"value\":true}]}},{\"NegotiationCompletion\":{\"start\":90746,\"causeId\":\"e8c8baf8\",\"data\":[{\"phaseTelemetryBag\":{\"MediaProcessOffer\":{\"t\":11},\"MediaCreateAnswer\":{\"t\":149},\"SignalingAcceptRenegotiation\":{\"t\":123},\"SignalingMediaAcknowledgement\":{\"t\":86},\"CompleteNegotiation\":{\"t\":0}},\"isComplete\":true,\"activeModalities\":{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"},\"configuredModalities\":{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"},\"initiator\":null,\"attemptedModalities\":{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"},\"offeredModalities\":{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"}}]}},{\"StopCall\":{\"start\":110620,\"status\":\"Pending\",\"causeId\":\"228a0b27\"}},{\"_SetCallState\":{\"start\":110621,\"causeId\":\"228a0b27\",\"data\":[{\"state\":6,\"reason\":0}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":110627,\"causeId\":\"228a0b27\",\"data\":[{\"state\":6,\"reason\":0}]}},{\"_MediaCleanUp\":{\"start\":110627,\"duration\":104,\"status\":\"Success\",\"causeId\":\"228a0b27\"}},{\"_SignalingStateChanged\":{\"start\":110827,\"causeId\":\"228a0b27\",\"data\":[{\"status\":\"LocalTerminated\",\"reason\":{\"code\":0,\"subCode\":0,\"phrase\":\"CallEndReasonLocalUserInitiated\",\"resultCategories\":[\"Success\"]}}]}},{\"_SetCallState\":{\"start\":110828,\"causeId\":\"228a0b27\",\"data\":[{\"state\":7,\"reason\":1}]}},{\"_RaiseCallStateChangeEvent\":{\"start\":110898,\"causeId\":\"228a0b27\",\"data\":[{\"state\":7,\"reason\":1}]}},{\"_MediaCleanUp\":{\"start\":110912,\"duration\":0,\"status\":\"Success\"}}]}",
      "HostName": "teams.microsoft.com",
      "JoinedFrom": "MeetingCode",
      "MeetingCode": "39563371502184",
      "ComplianceRecordingContentLength": "0",
      "ConversationStartTime": "2025-11-14T20:15:26.3213066Z",
      "ClientType": "enterprise",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "light-meetings",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "emea",
      "AppInfo.UserRole": "Anonymous",
      "AppInfo.UserType": "Anonymous",
      "DeviceInfo.Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  {
    "name": "mdsc_webrtc_session",
    "time": "2025-11-14T20:17:16.289Z",
    "ver": "4.0",
    "iKey": "o:1cae5691997646c98b01d15beddae7a3",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 8,
        "installId": "7af01589-461d-4932-8f47-2b8619ce60e4",
        "epoch": "641428208"
      },
      "app": {
        "locale": "en",
        "sesId": "/oblfU2k0wsYLU3GMC3w6j"
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
        "msfpc": "GUID=14c39fdda73d46fe86c87ebef336b5c5&HASH=14c3&LV=202511&V=4&LU=1763151320843"
      },
      "utc": {
        "popSample": 100
      },
      "loc": {
        "tz": "+00:00"
      },
      "metadata": {
        "f": {
          "display_name": {
            "t": 33
          },
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
          },
          "Extensions_WebRTCStats_ssrc_video_send_pair_googLocalAddress": {
            "t": 417
          },
          "Extensions_WebRTCStats_ssrc_video_send_pair_googRemoteAddress": {
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
      "uiVersion": "1415/25110306401",
      "agent_environment_id": "760e92e2-9ab2-42aa-9a09-b08e9c22570e",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "participant_id": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "display_name": "Neil Rashbrook",
      "endpoint_id": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "media_leg_id": "9495a715-0c01-4878-857b-8d7605c7cb42",
      "ts_calling_version": "2025.43.01.3",
      "metrics_MediaLegId": "9495a715-0c01-4878-857b-8d7605c7cb42",
      "metrics_CreationTime": "17631513584830000",
      "metrics_CallNumber": "1",
      "metrics_SessionId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "metrics_MultiParty": "true",
      "metrics_ErrorType": "none",
      "metrics_IncompatibleOffer": "false",
      "metrics_TerminationTime": "17631514360280000",
      "metrics_TerminationReason_code": "0",
      "metrics_TerminationReason_subCode": "0",
      "metrics_TerminationReason_phrase": "CallEndReasonLocalUserInitiated",
      "metrics_CallDuration": "775450000",
      "metrics_IceInitTime": "17631513605380000",
      "metrics_IceConnectedStateTime": "17631513608230000",
      "metrics_NegotiationCount": "3",
      "metrics_RejectedNegotiationCount": "0",
      "metrics_InitialNegotiationCompleted": "true",
      "metrics_InitialNegotiationType": "Offering",
      "metrics_FinalAnswerTime": "17631513605800000",
      "metrics_TransportReconnectedCount": "0",
      "metrics_Relay": "{\"address\":\"euaz-msit.relay.teams.microsoft.com\",\"expires\":604800,\"realm\":\"\\\"rtcmedia\\\"\",\"credentials\":true,\"ports\":\"udp:3478,tcp:443,tls:443\",\"fqdns\":\"euaz-msit.relay.teams.microsoft.com\"}",
      "metrics_ActiveModalities": "{\"audio\":\"sendrecv\",\"video\":\"sendrecv\",\"sharing\":\"recvonly\",\"data\":\"sendrecv\"}",
      "metrics_AllowedAudioSend": "true",
      "metrics_AllowedVideoSend": "true",
      "metrics_AllowedScreensharingSend": "true",
      "metrics_RelayManager": "{\"config\":{\"Service\":{\"url\":\"https://teams.microsoft.com/trap-exp/\",\"tokenUrl\":\"https://teams.microsoft.com/trap-exp/tokens\",\"disabled\":false,\"supportedTokenTypes\":\"skype AAD CAE\"},\"Relay\":{\"Turn\":{\"addresses\":[\"euaz-msit.relay.teams.microsoft.com\"],\"fqdns\":[\"euaz-msit.relay.teams.microsoft.com\"],\"realm\":\"rtcmedia\",\"tcpPort\":443,\"tlsPort\":443,\"udpPort\":3478,\"url\":\"\"},\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478,\"Lync\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478},\"Skype\":{\"addresses\":[\"52.123.195.2\"],\"fqdns\":[],\"tcpPort\":443,\"udpPort\":3478}},\"Token\":{\"earlyRefreshMinutes\":9720,\"earlyRefreshPercentage\":4}},\"stats\":{\"configFetch\":{\"time\":1763151323462,\"duration\":111,\"version\":2},\"skypeTokenFetch\":{\"time\":1763151323573,\"duration\":946,\"version\":2}}}",
      "metrics_AuthTokenStats": "{\"tokenType\":1,\"errors\":[]}",
      "metrics_CallMutedRatio": "0.6418337739377136",
      "metrics_CallOsMuted": "0",
      "metrics_CallHwSilent": "0",
      "metrics_CallSwMuted": "497710000",
      "metrics_CallSpeakerMuted": "0",
      "metrics_CallIsSpeaking": "0",
      "metrics_DtmfSuccess": "0",
      "metrics_DtmfFailure": "0",
      "metrics_ReconnectInProgress": "false",
      "metrics_RetargetIncomingCount": "1",
      "metrics_RetargetOutgoingCount": "0",
      "metrics_RetargetCompletedCount": "1",
      "metrics_RetargetRejectedCount": "0",
      "metrics_EscalationAttemptedCount": "0",
      "metrics_EscalationCompletedCount": "0",
      "metrics_EscalationRejectedCount": "0",
      "metrics_ReconnectAttemptedCount": "0",
      "metrics_ReconnectConnectedCount": "0",
      "metrics_NetworkEvents": "[{\"startTime\":51055,\"events\":[{\"type\":\"reconnect\",\"time\":0}],\"endTime\":0}]",
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
      "metrics_Connection_Downlink": "10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10",
      "metrics_Connection_EffectiveType": "4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g,4g",
      "metrics_Connection_Rtt": "50,50,50,50,50,50,50,50,50,0,0,0,0,0,0,0,0,0,0",
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
      "metrics_ETag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "metrics_ConfigIds": "P-E-1722294-2-6,P-E-1721421-2-6,P-E-1721405-2-6,P-E-1721382-C1-6,P-E-1720477-C1-6,P-E-1720297-2-6,P-E-1718756-2-6,P-E-1718359-2-6,P-E-1717750-2-6,P-E-1717237-2-8,P-E-1716081-2-8,P-E-1713802-C1-6,P-E-1713684-2-8,P-E-1705890-C1-5,P-E-1704515-C1-6,P-E-1700450-C1-7,P-E-1694641-C1-6,P-E-1691036-2-6,P-E-1680105-C1-6,P-E-1676936-C1-6,P-E-1675286-C1-6,P-E-1673335-2-3,P-E-1670133-C1-6,P-E-1660458-C1-5,P-E-1658080-3-11,P-E-1656524-2-6,P-E-1655667-C1-6,P-E-1651332-C1-6,P-E-1643648-2-6,P-E-1641797-2-6,P-E-1633843-C1-6,P-E-1621471-C1-6,P-E-1618933-C1-6,P-E-1617149-C1-6,P-E-1616887-C1-6,P-E-1616819-2-6,P-E-1613942-C1-6,P-E-1608951-C1-3,P-E-1608371-2-6,P-E-1603625-2-4,P-E-1598909-2-6,P-E-1580313-C1-5,P-E-1575172-C1-5,P-E-1574158-C1-10,P-E-1570390-2-6,P-E-1566952-C1-6,P-E-1568381-2-6,P-E-1566716-C1-10,P-E-1565836-C1-6,P-E-1565831-2-6,P-E-1544576-2-3,P-E-1224745-5-8,P-R-1665746-12-10,P-R-1645583-12-13,P-R-1634465-12-13,P-R-1633491-12-13,P-R-1632047-12-13,P-R-1630681-12-11,P-R-1613099-C11-10,P-R-1611700-12-14,P-R-1606855-12-14,P-R-1598296-12-12,P-R-1587774-12-12,P-R-1584387-12-13,P-R-1580901-12-15,P-R-1577920-12-13,P-R-1577892-18-3,P-R-1575005-12-10,P-R-1563326-12-14,P-R-1558616-12-17,P-R-1553816-12-12,P-R-1551350-12-15,P-R-1543947-12-13,P-R-1523352-12-14,P-R-1534344-12-13,P-R-1521918-12-9,P-R-1475504-12-14,P-R-1477139-12-19,P-R-1472589-12-28,P-R-1470220-12-11,P-R-1282626-12-35,P-R-1458723-12-13,P-R-1457926-12-2,P-R-1446888-12-17,P-R-1442911-12-17,P-R-1442161-12-17,P-R-1438633-12-12,P-R-1417298-12-18,P-R-1416330-12-20,P-R-1102981-9-69,P-R-1270215-12-8,P-R-1264668-12-16,P-R-1262976-12-11,P-R-1223031-9-9,P-R-1175069-9-8,P-R-1226424-9-4,P-R-1224690-9-9,P-R-1168166-9-10,P-R-1160589-9-7,P-R-1156430-9-6,P-R-1154814-3-6,P-R-1150013-9-11,P-R-1148658-9-8,P-R-1141462-9-23,P-R-1136249-9-9,P-R-1133113-9-8,P-R-1130598-9-10,P-R-1128207-9-28,P-R-1117564-9-10,P-R-1111900-9-79,P-R-1111902-9-11,P-R-1101306-9-6,P-R-1096762-9-24,P-R-1082715-9-35,P-R-1082433-9-23,P-R-1082359-9-14,P-R-1082351-9-12,P-R-1080906-6-6,P-R-1070816-6-19,P-R-1070395-1-8,P-R-1036090-19-62,P-R-1016745-11-11,P-R-1006078-1-32,P-R-115866-10-27,P-R-107136-10-42,P-R-96498-10-27,P-R-95572-41-185,P-R-94120-1-6,P-R-88231-9-17,P-R-79878-11-70,P-R-71785-7-16,P-R-63313-1-4,P-D-38372-1-4,P-D-27831-1-40,pe17222942:1038649,pe17214212:1038116,pe17214052:1038249,pe1721382c1:1038139,pe1720477c1:1037295,pe17202972:1037001,pe17187562:1036041,pe17183592:1035531,pe17177502:1034987,pe17172372:1039030,pe17160812:1038527,pe1713802c1:1031141,pe17136842:1035801,pe1705890c1:1024310,pe1704515c1:1023157,pe1700450c1:1027958,pe1694641c1:1018057,pe16910362:1013539,pe1680105c1:1010382,pe1676936c1:1006853,pe1675286c1:1005632,pe16733352:1004215,pe1670133c1:1002052,pe1660458c1:304475,pe16580803:1010370,pe16565242:301668,pe1655667c1:300925,pe1651332c1:296133,pe16436482:288428,pe16417972:286187,pe1633843c1:277835,pe1621471c1:266863,pe1618933c1:264580,pe1617149c1:262971,pe1616887c1:262653,pe16168192:262662,pe1613942c1:260004,pe16083712:254400,pe16036252:249604,pe15989092:245918,pe1580313c1:226954,pe1575172c1:222343,pe1574158c1:224393,pe15703902:219213,pe15683812:218198,pe1566716c1:228730,pe1565836c1:216042,pe15658312:216047",
      "metrics_GPUName": "ANGLE (Intel, Intel(R) HD Graphics Direct3D9Ex vs_3_0 ps_3_0, igdumd64.dll)",
      "metrics_PermissionStates": "{\"microphone\":\"granted\",\"camera\":\"granted\"}",
      "metrics_DeviceList": "[{\"label\":\"046d:0825 Cam\",\"kind\":\"microphone\"},{\"label\":\"046d:0825 Cam\",\"kind\":\"camera\"},{\"label\":\"High Definition\",\"kind\":\"speaker\"}]",
      "metrics_DeviceListDebug": "{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u9)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u10)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u11)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u9)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}",
      "metrics_DevicesChangeCount": "0",
      "metrics_DevicesPollChangeCount": "0",
      "metrics_DeviceSelectionChangeCount": "0",
      "metrics_DeviceSelectionChangeFromInterfaceCount": "0",
      "metrics_DevicesCount": "{\"microphone\":1,\"camera\":1,\"speaker\":1,\"compositeAudio\":0,\"audioIngestDevice\":0,\"virtualDevice\":0}",
      "metrics_DeviceEnumerationTimings": "{\"max\":2012,\"min\":6,\"avg\":114}",
      "metrics_UsedMicrophone": "046d:0825 Cam",
      "metrics_UsedSpeaker": "High Definition",
      "metrics_UsedCamera": "046d:0825 Cam",
      "metrics_DeviceEvents": "[{\"eventType\":\"permissions_state_changed\",\"timestamp\":-35147,\"payload\":{\"microphone\":\"prompt\",\"camera\":\"unknown\"}},{\"eventType\":\"permissions_state_changed\",\"timestamp\":-35145,\"payload\":{\"microphone\":\"prompt\",\"camera\":\"prompt\"}},{\"eventType\":\"selected_devices_changed\",\"timestamp\":-33145,\"payload\":{\"microphone\":\"\",\"camera\":\"\",\"speaker\":\"\",\"fromInterface\":false}},{\"eventType\":\"devices_changed\",\"timestamp\":-33144,\"payload\":{\"devices\":[{\"label\":\"\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{},\"groupId\":\"1\"},{\"label\":\"\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{},\"groupId\":\"1\"},{\"label\":\"\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"1\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u9)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u10)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u11)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u9)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"stream_created\",\"timestamp\":-33070,\"payload\":{\"id\":0,\"mediaType\":\"Video\"}},{\"eventType\":\"permissions_state_changed\",\"timestamp\":-23088,\"payload\":{\"microphone\":\"prompt\",\"camera\":\"granted\"}},{\"eventType\":\"permissions_state_changed\",\"timestamp\":-23087,\"payload\":{\"microphone\":\"granted\",\"camera\":\"granted\"}},{\"eventType\":\"selected_devices_changed\",\"timestamp\":-23067,\"payload\":{\"microphone\":\"046d:0825 Cam\",\"camera\":\"046d:0825 Cam\",\"speaker\":\"High Definition\",\"fromInterface\":false}},{\"eventType\":\"devices_changed\",\"timestamp\":-23066,\"payload\":{\"devices\":[{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"audioinput\",\"type\":\"microphone\",\"capabilities\":{\"autoGainControl\":[true,false],\"channelCount\":{\"max\":1,\"min\":1},\"echoCancellation\":[true,false,\"remote-only\"],\"latency\":{\"max\":0.01,\"min\":0},\"noiseSuppression\":[true,false],\"sampleRate\":{\"max\":48000,\"min\":48000},\"sampleSize\":{\"max\":16,\"min\":16},\"voiceIsolation\":[true,false]},\"groupId\":\"1\"},{\"label\":\"046d:0825 Cam\",\"isSystemDefault\":true,\"kind\":\"videoinput\",\"type\":\"camera\",\"capabilities\":{\"aspectRatio\":{\"max\":1280,\"min\":0.0010416666666666667},\"facingMode\":[],\"frameRate\":{\"max\":30,\"min\":1},\"height\":{\"max\":960,\"min\":1},\"resizeMode\":[\"none\",\"crop-and-scale\"],\"width\":{\"max\":1280,\"min\":1}},\"groupId\":\"1\"},{\"label\":\"High Definition\",\"isSystemDefault\":true,\"kind\":\"audiooutput\",\"type\":\"speaker\",\"groupId\":\"2\"}],\"debug\":{\"microphone\":\"microphone|input(3)|-communications|default:firstNonDefault|default(u9)|-defaultId\",\"camera\":\"camera|input(1)|default:only|default(u10)\",\"speaker\":\"speaker|input(3)|-communications|default:firstNonDefault|default(u11)|-defaultId\",\"compositeAudio\":\"compositeAudio|lbl_nocand(u9)|otherMatched(0)\",\"audioIngestDevice\":\"\",\"virtualDevice\":\"\"}}},{\"eventType\":\"stream_acquired\",\"timestamp\":-21414,\"payload\":{\"id\":0,\"mediaType\":\"Video\",\"timestamp\":11650,\"resolution\":{\"width\":1280,\"height\":720},\"withAudio\":true,\"sampleRate\":48000}},{\"eventType\":\"ask_device_permission\",\"timestamp\":-21410,\"payload\":{\"resultConstraints\":{\"audio\":true,\"video\":true},\"reason\":\"stream_acquisition\"}},{\"eventType\":\"stream_disposed\",\"timestamp\":-21051,\"payload\":{\"id\":0,\"mediaType\":\"Video\"}},{\"eventType\":\"stream_created\",\"timestamp\":-21050,\"payload\":{\"id\":1,\"mediaType\":\"Video\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":-18758,\"payload\":{\"id\":1,\"mediaType\":\"Video\",\"timestamp\":2290,\"resolution\":{\"width\":1280,\"height\":720},\"withAudio\":false}},{\"eventType\":\"stream_created\",\"timestamp\":25,\"payload\":{\"id\":2,\"mediaType\":\"Video\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":159,\"payload\":{\"id\":2,\"mediaType\":\"Video\",\"timestamp\":132,\"resolution\":{\"width\":1280,\"height\":720},\"withAudio\":false}},{\"eventType\":\"stream_created\",\"timestamp\":227,\"payload\":{\"id\":3,\"mediaType\":\"Audio\"}},{\"eventType\":\"stream_acquired\",\"timestamp\":620,\"payload\":{\"id\":3,\"mediaType\":\"Audio\",\"timestamp\":73,\"sampleRate\":16000}},{\"eventType\":\"stream_disposed\",\"timestamp\":77503,\"payload\":{\"id\":2,\"mediaType\":\"Video\"}},{\"eventType\":\"stream_disposed\",\"timestamp\":77570,\"payload\":{\"id\":3,\"mediaType\":\"Audio\"}},{\"eventType\":\"stream_disposed\",\"timestamp\":77578,\"payload\":{\"id\":1,\"mediaType\":\"Video\"}}]",
      "metrics_AudioEffects": "[{\"timestamp\":8840,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.9990000128746033},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"799;Avg,2.688298;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,4.050000;0.900000,4.050000;0.950000,5.050000;0.990000,7.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-41.15625,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":12,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":7.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":16839,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.9994999766349792},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"1599;Avg,2.535303;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,4.050000;0.950000,4.050000;0.990000,6.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-41.414062,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":12,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":15.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":24837,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.999666690826416},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"2399;Avg,2.465173;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,4.050000;0.950000,4.050000;0.990000,6.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-41.789062,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":12,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":23.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":32838,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.999750018119812},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"3199;Avg,2.440747;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,4.050000;0.990000,6.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-41.578125,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":12,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":31.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":40837,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.9998000264167786},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"3999;Avg,2.441348;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,4.050000;0.990000,6.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-42.023438,\"nearEndOutputRMS_dBFS\":-124.148438},\"wasmCompilationTimeMs\":12,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":39.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":48837,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.999833345413208},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"4799;Avg,2.456751;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,4.050000;0.990000,6.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-41.765625,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":12,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":47.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":56838,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.9998571276664734},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"5599;Avg,2.466146;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,4.050000;0.990000,5.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-63.117188,\"farEndOutputRMS_dBFS\":-57.375,\"loopbackInputRMS_dBFS\":-57.375,\"nearEndInputRMS_dBFS\":-41.789062,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":12,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":55.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":65942,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.999875009059906},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"6399;Avg,2.471784;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,4.050000;0.990000,5.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-125,\"loopbackInputRMS_dBFS\":-125,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-62.789062,\"farEndOutputRMS_dBFS\":-57,\"loopbackInputRMS_dBFS\":-57,\"nearEndInputRMS_dBFS\":-41.789062,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":12,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":65.104,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":72838,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"audioEffect\":\"Deep VQE\",\"vqeUsageRatio\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0.9998888969421387},\"isVqeUsedInBackground\":false,\"pipelineTimeForProcessVQEPercentiles\":\"7199;Avg,2.517704;0.500000,2.050000;0.700000,3.050000;0.750000,3.050000;0.800000,3.050000;0.850000,3.050000;0.900000,3.050000;0.950000,4.050000;0.990000,5.050000;Max,29.049999\",\"fallback\":0,\"speechLevels\":{\"farEndInputRMS_dBFS\":-125,\"farEndOutputRMS_dBFS\":-77.15625,\"loopbackInputRMS_dBFS\":-77.15625,\"nearEndInputRMS_dBFS\":-125,\"nearEndOutputRMS_dBFS\":-125},\"noiseLevels\":{\"farEndInputRMS_dBFS\":-62.859375,\"farEndOutputRMS_dBFS\":-57.046875,\"loopbackInputRMS_dBFS\":-57.046875,\"nearEndInputRMS_dBFS\":-41.859375,\"nearEndOutputRMS_dBFS\":-125},\"wasmCompilationTimeMs\":12,\"audioContext\":{\"baseLatency\":0.01,\"outputLatency\":0.039,\"sampleRate\":16000,\"currentTime\":71.992,\"state\":\"running\"},\"userNoiseSuppressionMethod\":null}},{\"timestamp\":77571,\"payload\":{\"audioEffectsCapability\":31,\"version\":\"WasmDns Unknown / WasmAec Unknown / WasmVqe 2024.41.00.30\",\"lastContentSharingEvent\":null,\"loadDuration\":82,\"wasmInitDuration\":-1,\"error\":[],\"userNoiseSuppressionMethod\":null}}]",
      "metrics_WorkerEvents": "[{\"timestamp\":522,\"workerType\":\"wasmvqe\",\"workerLoadTimeMs\":183,\"msg\":\"\\\"wasm-worker-loaded\\\"\"}]",
      "metrics_MediaByPassEnabled": "false",
      "metrics_DominantSpeaker": "{\"serverDSH\":{\"count\":1,\"duplicateCount\":0,\"firstMsgTime\":1763151412524},\"activeStrategy\":\"server\",\"lastMsgOrigin\":\"server\",\"changedCountContributingSources\":60,\"changedCountDSH\":1}",
      "metrics_AudioSourceNumOfReopenRequests": "1",
      "metrics_AudioSourceNumOfSuccessfulReopens": "1",
      "metrics_AudioCaptureErrorCodeFlagsInit": "0",
      "metrics_AudioRenderErrorCodeFlagsInit": "0",
      "metrics_AudioSinkNumOfReopenRequests": "0",
      "metrics_AudioSinkNumOfSuccessfulReopens": "0",
      "metrics_MicUnmutedButSilent": "false",
      "metrics_MicUnmutedButSilentUnreliable": "false",
      "metrics_CallSetupTimeTracker": "{\"createOfferAsync\":[[{\"name\":\"queryRelaysAsync\",\"duration\":0.4,\"ts\":1763151358667.5,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"checkVideoCodecsSupport\",\"duration\":5.6,\"ts\":1763151358667.9,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"encStreamsManagerInitialize\",\"duration\":0.2,\"ts\":1763151358676.8,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"initAudioCodec\",\"duration\":0.9,\"ts\":1763151358676.8,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"},{\"name\":\"assurePeerConnectionAsync\",\"duration\":11,\"ts\":1763151358666.8,\"parentName\":\"createOfferAsync\"},{\"name\":\"updateStreamsWithModalities\",\"duration\":395.7,\"ts\":1763151358708.9,\"parentName\":\"createOfferAsync|updateStreams\"},{\"name\":\"updateSenders\",\"duration\":44.8,\"ts\":1763151359104.6,\"parentName\":\"createOfferAsync|updateStreams\"},{\"name\":\"assureStreamsAndDataChannel\",\"duration\":472.4,\"ts\":1763151358677.8,\"parentName\":\"createOfferAsync\"},{\"name\":\"createOffer\",\"duration\":50.8,\"ts\":1763151359150.2,\"parentName\":\"createOfferAsync\"},{\"name\":\"sLD\",\"duration\":140.6,\"ts\":1763151359201,\"parentName\":\"createOfferAsync\"},{\"name\":\"candidates\",\"duration\":34,\"ts\":1763151359341.6,\"parentName\":\"createOfferAsync\"},{\"name\":\"createOfferAsync\",\"duration\":739,\"ts\":1763151358666.8,\"parentName\":\"\"},{\"name\":\"transportConnected\",\"duration\":238,\"ts\":1763151360574.7,\"parentName\":\"createOfferAsync|assurePeerConnectionAsync\"}]],\"processAnswerAsync\":[[{\"name\":\"streamSendersManagerUpdate\",\"duration\":30,\"ts\":1763151360507.1,\"parentName\":\"processAnswerAsync\"},{\"name\":\"setRemoteDescription\",\"duration\":33.5,\"ts\":1763151360538.2,\"parentName\":\"processAnswerAsync\"},{\"name\":\"streamSendersManagerActivate\",\"duration\":3.3,\"ts\":1763151360571.7,\"parentName\":\"processAnswerAsync\"},{\"name\":\"processAnswerAsync\",\"duration\":71.9,\"ts\":1763151360507.1,\"parentName\":\"\"}]]}",
      "metrics_LastSessionSetupTimeTracker": "{\"processOfferAsync\":[[{\"name\":\"getCapabilities\",\"duration\":0.1,\"ts\":1763151409602.7,\"parentName\":\"processOfferAsync\"},{\"name\":\"processOfferAsync\",\"duration\":18.6,\"ts\":1763151409584.5,\"parentName\":\"\"}]],\"createAnswerAsync\":[[{\"name\":\"queryRelaysAsync\",\"duration\":0.4,\"ts\":1763151409617.2,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"checkVideoCodecsSupport\",\"duration\":13.7,\"ts\":1763151409617.6,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"encStreamsManagerInitialize\",\"duration\":0,\"ts\":1763151409638.6,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"initAudioCodec\",\"duration\":0.1,\"ts\":1763151409638.6,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"},{\"name\":\"assurePeerConnectionAsync\",\"duration\":22,\"ts\":1763151409616.8,\"parentName\":\"createAnswerAsync\"},{\"name\":\"handleCodecSwitchUnsupported\",\"duration\":0.3,\"ts\":1763151409638.8,\"parentName\":\"createAnswerAsync\"},{\"name\":\"detectSendProfileSupport\",\"duration\":10.8,\"ts\":1763151409639.1,\"parentName\":\"createAnswerAsync\"},{\"name\":\"setRemoteDescription\",\"duration\":73.6,\"ts\":1763151409649.9,\"parentName\":\"createAnswerAsync\"},{\"name\":\"updateStreamsWithModalities\",\"duration\":19.2,\"ts\":1763151409726,\"parentName\":\"createAnswerAsync|updateStreams\"},{\"name\":\"updateSenders\",\"duration\":111.9,\"ts\":1763151409745.2,\"parentName\":\"createAnswerAsync|updateStreams\"},{\"name\":\"assureStreamsAndDataChannel\",\"duration\":134.1,\"ts\":1763151409723.5,\"parentName\":\"createAnswerAsync\"},{\"name\":\"createAnswer\",\"duration\":116,\"ts\":1763151409857.6,\"parentName\":\"createAnswerAsync\"},{\"name\":\"sLD\",\"duration\":59.9,\"ts\":1763151409973.6,\"parentName\":\"createAnswerAsync\"},{\"name\":\"candidates\",\"duration\":3.2,\"ts\":1763151410033.5,\"parentName\":\"createAnswerAsync\"},{\"name\":\"streamSendersManagerActivate\",\"duration\":19.1,\"ts\":1763151410036.7,\"parentName\":\"createAnswerAsync\"},{\"name\":\"createAnswerAsync\",\"duration\":440,\"ts\":1763151409616.8,\"parentName\":\"\"},{\"name\":\"transportConnected\",\"duration\":609.8,\"ts\":1763151410035.2,\"parentName\":\"createAnswerAsync|assurePeerConnectionAsync\"}]]}",
      "metrics_BrowserFingerprint": "{\"webdriver\":false,\"pluginsLength\":5,\"languageLength\":1,\"mimeTypesLength\":2,\"outerWidth\":1024,\"outerHeight\":728,\"innerWidth\":1024,\"innerHeight\":641,\"clientWidth\":1024,\"clientHeight\":641,\"loadEventEnd\":2077.9000000953674,\"loadEventStart\":2077.7999999523163,\"hasChrome\":true,\"hasPlaywright\":false,\"hasSelenium\":false,\"hasNightmare\":false,\"hasPhantom\":false,\"hasCypress\":false}",
      "metrics_ReportGenerationTimeMs": "23.6",
      "metrics_piiFields": "{\"IPAddress\":\"IPv4\",\"ReflexiveLocalIP\":\"IPv4\",\"pair_googLocalAddress\":\"IPv4\",\"pair_googRemoteAddress\":\"IPv4\"}",
      "Extensions_WebRTCStats_data_bytesReceived": "1129",
      "Extensions_WebRTCStats_data_bytesSent": "400",
      "Extensions_WebRTCStats_data_dataChannelIdentifier": "0",
      "Extensions_WebRTCStats_data_label": "main-channel",
      "Extensions_WebRTCStats_data_messagesReceived": "24",
      "Extensions_WebRTCStats_data_messagesSent": "5",
      "Extensions_WebRTCStats_data_state": "open",
      "Extensions_WebRTCStats_data_timestamp": "1763151435540.477",
      "Extensions_Data_ProtocolCounters": "{\"18\":{\"send\":{\"successful\":5,\"failed\":0,\"fragmented\":0,\"dismissed\":0},\"recv\":{\"successful\":25,\"failed\":0,\"fragmented\":0,\"dismissed\":0}}}",
      "Extensions_Data_SessionState": "Active",
      "Extensions_BundlePolicy": "max-bundle",
      "Extensions_FakeIceCandidate": "false",
      "Extensions_h264AvailableProfiles": "[\"42001f\",\"42e01f\",\"4d001f\",\"f4001f\"]",
      "Extensions_h264CodecCapabilities": "{\"sendProfiles\":[\"42001f\",\"42e01f\",\"4d001f\"],\"receiveProfiles\":[\"42001f\",\"42e01f\",\"4d001f\",\"f4001f\"]}",
      "Extensions_IceConnectionState": "connected",
      "Extensions_IceConnectionStatePrevious": "checking",
      "Extensions_IceServers": "[{\"urls\":[\"turn:euaz-msit.relay.teams.microsoft.com:3478?transport=udp\",\"turn:euaz-msit.relay.teams.microsoft.com:443?transport=tcp\",\"turns:euaz-msit.relay.teams.microsoft.com:443\"],\"credential\":\"true\",\"username\":\"true\"}]",
      "Extensions_IceTransportPolicy": "all",
      "Extensions_NegotiatedSrtp": "\"dtls\"",
      "Extensions_OfferedSrtp": "\"dtlssdes\"",
      "Extensions_RelayCandidate": "none",
      "Extensions_SdpSemantics": "unified-plan",
      "Extensions_SignalingState": "stable",
      "Extensions_SignalingStatePrevious": "have-remote-offer",
      "Extensions_MaxSessionBandwidth": "4000",
      "Extensions_Bandwidth_uplinkStabilizationTime": "{\"time\":19,\"bandwidth\":2413474,\"finished\":false,\"modality\":\"audio, video\"}",
      "Extensions_Bandwidth_downlinkStabilizationTime": "{\"time\":1,\"bandwidth\":572461.6,\"finished\":true,\"modality\":\"audio, video, sharing\"}",
      "Extensions_totalVideoControlMessages": "8",
      "Extensions_outOfOrderVideoControlMessages": "0",
      "Extensions_webcamFreezeIntervals": "0",
      "Extensions_processedStreamFreezeIntervals": "0",
      "Extensions_ReinvitelessContext": "{\"enabled\":false,\"maxStreamsForModality\":{\"video\":0,\"sharing\":0}}",
      "Extensions_IPAddress": "192.168.255.11",
      "Extensions_ReflexiveLocalIP": "82.19.9.88",
      "Extensions_NumberOfInterfaces": "1",
      "Extensions_StartTime": "1763151409566",
      "Extensions_EndTime": "1763151436029",
      "Extensions_AudioTransportRecvBitrate": "48089",
      "Extensions_AudioTransportSendBitrate": "1023281",
      "Extensions_AudioPayloadRecvBitrate": "25100",
      "Extensions_AudioPayloadSendBitrate": "640",
      "Extensions_VideoPayloadSendBitrate": "1161282",
      "Extensions_WebRTCStats_bweStat_googAvailableSendBandwidth": "1772700,1921180,1921180,1921180,1921180,1921180,1921180,2354911,2499397,2701594,2734420,2961253,3198445",
      "Extensions_Bandwidth_jumpsHistogram": "{\"seconds1to3\":0,\"seconds3to5\":0,\"seconds5to8\":0,\"seconds8to15\":0,\"seconds15to60\":0,\"seconds60toMax\":0}",
      "Extensions_StartCallBWESendSide": "301000",
      "Extensions_EndCallBWESendSide": "3198445",
      "Extensions_BWEStdSendSide": "926898.47",
      "Extensions_BwPercentilesSendSide": "{\"5\":301000,\"50\":1921180,\"95\":2984972.1999999997}",
      "Extensions_AvgBwSendSide": "1752695.21",
      "Extensions_WebRTCStats_ssrc_audio_recv_id": "IT11A2201",
      "Extensions_WebRTCStats_ssrc_audio_recv_ssrc": "2201",
      "Extensions_WebRTCStats_ssrc_audio_recv_mediaType": "audio",
      "Extensions_WebRTCStats_ssrc_audio_recv_bytesReceived": "6445,10322,13867,17521,21071,24810,28422,32450,36922,42228,44014,50336,61481,65456,68584,71552,73652,76276,79904",
      "Extensions_WebRTCStats_ssrc_audio_recv_packetsReceived": "89,142,191,241,290,341,390,445,507,581,605,692,844,904,948,990,1020,1056,1106",
      "Extensions_WebRTCStats_ssrc_audio_recv_packetsLost": "0,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2",
      "Extensions_WebRTCStats_ssrc_audio_recv_googCodecName": "OPUS",
      "Extensions_WebRTCStats_ssrc_audio_recv_googTrackId": "mainAudio-2201",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_id": "T11",
      "Extensions_WebRTCStats_ssrc_audio_recv_transportId": "T11",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_selectedCandidatePairId": "CPDjM5N0TD_qGmR4Ewt",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_dtlsCipher": "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      "Extensions_WebRTCStats_ssrc_audio_recv_transport_srtpCipher": "AEAD_AES_256_GCM",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_id": "CPDjM5N0TD_qGmR4Ewt",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_responsesSent": "1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_requestsReceived": "1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRemoteCandidateType": "relay",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_consentRequestsSent": "2,2,3,3,3,4,4,4,5,5,6,6,7,8,9,9,10,10,10",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googTransportType": "udp",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googLocalCandidateType": "srflx",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googWritable": "true",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_requestsSent": "5,5,6,6,6,7,7,7,8,8,9,9,10,11,12,12,13,13,13",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRtt": "92,92,92,82,82,89,89,89,43,43,52,52,152,46,94,94,76,76,76",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googActiveConnection": "true",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_packetsDiscardedOnSend": "0",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_bytesReceived": "13690,20096,26218,32421,39356,45684,52313,60327,68164,77828,80770,92204,111806,120516,126233,131880,135975,140836,147877",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_responsesReceived": "5,5,5,6,6,7,7,7,8,8,9,9,10,11,12,12,13,13,13",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_remoteCandidateId": "IqGmR4Ewt",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_localCandidateId": "IDjM5N0TD",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_localNetworkType": "ethernet",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_packetsSent": "54,78,99,122,216,392,589,664,746,897,969,1202,1611,2153,2351,2559,2787,3043,3279",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googLocalAddress": "82.19.9.88",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googRemoteAddress": "52.112.227.109",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_bytesSent": "4040,5289,6342,7523,37980,159345,336065,392245,453901,583004,652475,866341,1256095,1831068,2031337,2248791,2491085,2767627,3010919",
      "Extensions_WebRTCStats_ssrc_audio_recv_pair_googReadable": "true",
      "Extensions_WebRTCStats_ssrc_audio_recv_totalSamplesReceived": "84000,136320,183360,231360,279360,327360,375360,427680,487680,558720,581280,665760,810720,953760,999360,1047360,1095360,1143360,1191360",
      "Extensions_WebRTCStats_ssrc_audio_recv_totalAudioEnergy": "0.0033488180719244746",
      "Extensions_WebRTCStats_ssrc_audio_recv_audioOutputLevel": "0.0026245918149357585,0.001892147587511826,0.003204443494979705,0.002349925229651784,0.0026551103244117557,0.002838221381267739,0.002838221381267739,0.0024719992675557726,0.0025940733054597613,0.0029297769096957305,0.0026245918149357585,0.00347911008026368,0.009552293465987122,0.002410962248603778,0.0025025177770317698,0.0022583697012237922,0.004028443250831629,0.002838221381267739,0.0025025177770317698",
      "Extensions_WebRTCStats_ssrc_audio_recv_concealedSamples": "0,787,1004,1004,3759,3759,3759,3759,3759,3759,3759,3759,12838,12838,12838,12838,12838,12838,12838",
      "Extensions_WebRTCStats_ssrc_audio_recv_silentConcealedSamples": "0,0,0,0,0,0,0,0,0,0,0,0,1150,1150,1150,1150,1150,1150,1150",
      "Extensions_WebRTCStats_ssrc_audio_recv_fecPacketsReceived": "1,1,1,1,1,1,1,1,1,1,1,1,10,10,11,12,12,12,13",
      "Extensions_WebRTCStats_ssrc_audio_recv_fecPacketsDiscarded": "1,1,1,1,1,1,1,1,1,1,1,1,10,10,11,12,12,12,13",
      "Extensions_WebRTCStats_ssrc_audio_recv_jitter": "0.003,0.004,0.005,0.002,0.005,0.008,0.005,0.004,0.006,0.008,0.007,0.009,0.006,0.003,0.003,0.003,0.002,0.002,0.002",
      "Extensions_WebRTCStats_ssrc_audio_recv_packetsDiscarded": "0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
      "Extensions_WebRTCStats_ssrc_audio_send_id": "OT11A4261247557",
      "Extensions_WebRTCStats_ssrc_audio_send_ssrc": "4261247557",
      "Extensions_WebRTCStats_ssrc_audio_send_mediaType": "audio",
      "Extensions_WebRTCStats_ssrc_audio_send_bytesSent": "455,563,635,743,815,887,995,1067,1175,1319,1355,1499,1751,2038,2111,2183,2291,2363,2435",
      "Extensions_WebRTCStats_ssrc_audio_send_packetsSent": "17,23,27,33,37,41,47,51,57,65,67,75,89,104,109,113,119,123,127",
      "Extensions_WebRTCStats_ssrc_audio_send_packetsLost": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_send_googCodecName": "OPUS",
      "Extensions_WebRTCStats_ssrc_audio_send_googTrackId": "ea7d789d-b596-4345-b8d2-fd0e941fe62d",
      "Extensions_WebRTCStats_ssrc_audio_send_googRtt": "55,55,55,55,55,49,61,61,61,57,57,42",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_id": "T11",
      "Extensions_WebRTCStats_ssrc_audio_send_transportId": "T11",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_selectedCandidatePairId": "CPDjM5N0TD_qGmR4Ewt",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_dtlsCipher": "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_srtpCipher": "AEAD_AES_256_GCM",
      "Extensions_WebRTCStats_ssrc_audio_send_transport_localCertificateId": "CF5C:61:AB:42:10:67:EA:AF:7A:87:AA:2D:3B:F2:32:7E:20:B1:D5:83:4C:0B:46:23:EE:81:C6:91:0E:77:7C:5A",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_id": "CPDjM5N0TD_qGmR4Ewt",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesSent": "1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsReceived": "1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteCandidateType": "relay",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_consentRequestsSent": "2,2,3,3,3,4,4,4,5,5,6,6,7,8,9,9,10,10,10",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googTransportType": "udp",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalCandidateType": "srflx",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googWritable": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_requestsSent": "5,5,6,6,6,7,7,7,8,8,9,9,10,11,12,12,13,13,13",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRtt": "92,92,92,82,82,89,89,89,43,43,52,52,152,46,94,94,76,76,76",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googActiveConnection": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsDiscardedOnSend": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesReceived": "13690,20096,26218,32421,39356,45684,52313,60327,68164,77828,80770,92204,111806,120516,126233,131880,135975,140836,147877",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_responsesReceived": "5,5,5,6,6,7,7,7,8,8,9,9,10,11,12,12,13,13,13",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_remoteCandidateId": "IqGmR4Ewt",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_localCandidateId": "IDjM5N0TD",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_localNetworkType": "ethernet",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_packetsSent": "54,78,99,122,216,392,589,664,746,897,969,1202,1611,2153,2351,2559,2787,3043,3279",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googLocalAddress": "82.19.9.88",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googRemoteAddress": "52.112.227.109",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_bytesSent": "4040,5289,6342,7523,37980,159345,336065,392245,453901,583004,652475,866341,1256095,1831068,2031337,2248791,2491085,2767627,3010919",
      "Extensions_WebRTCStats_ssrc_audio_send_pair_googReadable": "true",
      "Extensions_WebRTCStats_ssrc_audio_send_audioInputLevel": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_audio_send_totalAudioEnergy": "0",
      "Extensions_WebRTCStats_ssrc_audio_send_totalSamplesDuration": "25.100000000001124",
      "Extensions_WebRTCStats_ssrc_audio_send_jitter": "0.001166,0.001166,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_video_send_id": "OT11V3318938528",
      "Extensions_WebRTCStats_ssrc_video_send_rid": "1",
      "Extensions_WebRTCStats_ssrc_video_send_ssrc": "3318938528",
      "Extensions_WebRTCStats_ssrc_video_send_mediaType": "video",
      "Extensions_WebRTCStats_ssrc_video_send_bytesSent": "75194,128016,186091,308696,375183,579227,951762,1504274,1696228,1905077,2137906,2403911,2637333",
      "Extensions_WebRTCStats_ssrc_video_send_packetsSent": "163,215,270,384,446,636,977,1468,1640,1825,2030,2264,2473",
      "Extensions_WebRTCStats_ssrc_video_send_packetsLost": "0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_video_send_googCodecName": "H264",
      "Extensions_WebRTCStats_ssrc_video_send_codecImplementationName": "OpenH264",
      "Extensions_WebRTCStats_ssrc_video_send_googTrackId": "2aa41bbf-75dd-4713-8772-acf01348e0c3",
      "Extensions_WebRTCStats_ssrc_video_send_transport_id": "T11",
      "Extensions_WebRTCStats_ssrc_video_send_transportId": "T11",
      "Extensions_WebRTCStats_ssrc_video_send_transport_selectedCandidatePairId": "CPDjM5N0TD_qGmR4Ewt",
      "Extensions_WebRTCStats_ssrc_video_send_transport_dtlsCipher": "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      "Extensions_WebRTCStats_ssrc_video_send_transport_srtpCipher": "AEAD_AES_256_GCM",
      "Extensions_WebRTCStats_ssrc_video_send_pair_id": "CPDjM5N0TD_qGmR4Ewt",
      "Extensions_WebRTCStats_ssrc_video_send_pair_responsesSent": "3,3,3,3,3,3,3,3,3,3,3,3,3",
      "Extensions_WebRTCStats_ssrc_video_send_pair_requestsReceived": "3,3,3,3,3,3,3,3,3,3,3,3,3",
      "Extensions_WebRTCStats_ssrc_video_send_pair_googRemoteCandidateType": "relay",
      "Extensions_WebRTCStats_ssrc_video_send_pair_consentRequestsSent": "4,4,5,5,6,6,7,8,9,9,10,10,10",
      "Extensions_WebRTCStats_ssrc_video_send_pair_googTransportType": "udp",
      "Extensions_WebRTCStats_ssrc_video_send_pair_googLocalCandidateType": "srflx",
      "Extensions_WebRTCStats_ssrc_video_send_pair_googWritable": "true",
      "Extensions_WebRTCStats_ssrc_video_send_pair_requestsSent": "7,7,8,8,9,9,10,11,12,12,13,13,13",
      "Extensions_WebRTCStats_ssrc_video_send_pair_googRtt": "89,89,43,43,52,52,152,46,94,94,76,76,76",
      "Extensions_WebRTCStats_ssrc_video_send_pair_googActiveConnection": "true",
      "Extensions_WebRTCStats_ssrc_video_send_pair_packetsDiscardedOnSend": "0",
      "Extensions_WebRTCStats_ssrc_video_send_pair_bytesReceived": "52313,60327,68164,77828,80770,92204,111806,120516,126233,131880,135975,140836,147877",
      "Extensions_WebRTCStats_ssrc_video_send_pair_responsesReceived": "7,7,8,8,9,9,10,11,12,12,13,13,13",
      "Extensions_WebRTCStats_ssrc_video_send_pair_remoteCandidateId": "IqGmR4Ewt",
      "Extensions_WebRTCStats_ssrc_video_send_pair_localCandidateId": "IDjM5N0TD",
      "Extensions_WebRTCStats_ssrc_video_send_pair_packetsSent": "589,664,746,897,969,1202,1611,2153,2351,2559,2787,3043,3279",
      "Extensions_WebRTCStats_ssrc_video_send_pair_googLocalAddress": "82.19.9.88",
      "Extensions_WebRTCStats_ssrc_video_send_pair_googRemoteAddress": "52.112.227.109",
      "Extensions_WebRTCStats_ssrc_video_send_pair_bytesSent": "336065,392245,453901,583004,652475,866341,1256095,1831068,2031337,2248791,2491085,2767627,3010919",
      "Extensions_WebRTCStats_ssrc_video_send_pair_googReadable": "true",
      "Extensions_WebRTCStats_ssrc_video_send_encodeTime": "0,3.33,2.86,18.18,33.53,32.86,42.14,14,12.67,11.33,10.67,10.63,10",
      "Extensions_WebRTCStats_ssrc_video_send_framesEncoded": "36,52,69,86,94,119,160,205,219,234,249,265,279",
      "Extensions_WebRTCStats_ssrc_video_send_googNacksReceived": "0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_video_send_googPlisReceived": "0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_WebRTCStats_ssrc_video_send_googFirsReceived": "1,5,5,5,5,5,5,5,5,5,5,5,5",
      "Extensions_WebRTCStats_ssrc_video_send_keyFramesEncoded": "5,6,6,7,7,7,7,9,9,9,9,9,9",
      "Extensions_WebRTCStats_ssrc_video_send_googFrameHeightInput": "540",
      "Extensions_WebRTCStats_ssrc_video_send_googFrameWidthInput": "960",
      "Extensions_WebRTCStats_ssrc_video_send_googFrameRateInput": "15,15,15,14,14,15,15,15,14,15,15,15,15",
      "Extensions_WebRTCStats_ssrc_video_send_googFrameHeightSent": "234,360,360,720,720,720,720,540,540,540,540,540,540",
      "Extensions_WebRTCStats_ssrc_video_send_googFrameWidthSent": "416,640,640,1280,1280,1280,1280,960,960,960,960,960,960",
      "Extensions_WebRTCStats_ssrc_video_send_googFrameRateSent": "0,15,14,11,17,14,14,15,15,15,15,16,14",
      "Extensions_WebRTCStats_ssrc_video_send_googFrameRateEncoded": "15,14,11,17,14,14,15,15,15,15,16,14",
      "Extensions_WebRTCStats_ssrc_video_send_googRtt": "47,43,43,54,54,54,47,47,44,44,44,44,46",
      "Extensions_WebRTCStats_ssrc_video_send_hugeFramesSent": "0",
      "Extensions_WebRTCStats_ssrc_video_send_qpSum": "722,1033,1330,1798,2018,2711,3826,4770,5045,5346,5634,5931,6197",
      "Extensions_WebRTCStats_ssrc_video_send_qualityLimitationDurations": "{\"bandwidth\":1.523,\"cpu\":0,\"none\":18.146,\"other\":0}",
      "Extensions_WebRTCStats_ssrc_video_send_qualityLimitationReason": "none",
      "Extensions_WebRTCStats_ssrc_video_send_qualityLimitationResolutionChanges": "2",
      "Extensions_WebRTCStats_ssrc_video_send_jitter": "0.004722",
      "Extensions_WebRTCStats_ssrc_video_send_retransmittedPacketsSent": "0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_Audio_recv_jitterBufferAvgSize": "76",
      "Extensions_Audio_recv_jitterBufferAvgDelayMs": "0",
      "Extensions_Audio_recv_packetsLostRateMax": "0.006993",
      "Extensions_Audio_recv_jitterAvg": "4.579",
      "Extensions_Audio_recv_jitterMax": "9",
      "Extensions_Audio_recv_networkAvgLossRate": "0.001805",
      "Extensions_Audio_recv_packetsLostAvg": "0.111111",
      "Extensions_Audio_recv_healedRatioAvg": "0.003235",
      "Extensions_Audio_recv_healedRatioMax": "0.055",
      "Extensions_Audio_recv_audioLevelAvg": "0.000131",
      "Extensions_Audio_send_rttAvg": "55",
      "Extensions_Audio_send_rttMax": "61",
      "Extensions_Audio_send_RawInputVolume": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
      "Extensions_Audio_send_packetsLostRateMax": "0",
      "Extensions_Audio_send_presentationAPIUserDuration": "0",
      "Extensions_Audio_send_presentationDuration": "0",
      "Extensions_Audio_send_audioLevelAvg": "0",
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
      "Extensions_Video_send_SourceId": "415",
      "Extensions_Video_send_CaptureFramerateAvg": "14.769",
      "Extensions_Video_send_DurationSeconds": "12",
      "Extensions_Video_send_FreezeIntervals": "0",
      "Extensions_Video_send_MaxCapabilities": "[[{\"eventType\":\"req\",\"timestamp\":15000,\"capabilities\":[{\"maxFs\":3600,\"maxMbps\":108000,\"maxFps\":30,\"maxBr\":1146000,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":false,\"vlaDebug\":\"1280x720@15x1203\"}],\"isSimulcast\":true},{\"eventType\":\"app\",\"timestamp\":17892,\"capabilities\":[{\"maxFs\":3600,\"maxMbps\":108000,\"maxFps\":30,\"maxBr\":1146000,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":false,\"vlaDebug\":\"1280x720@15x1203\"}],\"error\":\"undefined\"},{\"eventType\":\"app\",\"timestamp\":17892,\"capabilities\":[{\"maxFs\":3600,\"maxMbps\":108000,\"maxFps\":30,\"maxBr\":1146000,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":false,\"vlaDebug\":\"1280x720@15x1203\"}],\"error\":\"undefined\"}],[{\"eventType\":\"req\",\"timestamp\":17010,\"capabilities\":[{\"maxFs\":3600,\"maxMbps\":108000,\"maxFps\":30,\"maxBr\":1462800,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":false,\"vlaDebug\":\"1280x720@15x1092\"}],\"isSimulcast\":true},{\"eventType\":\"app\",\"timestamp\":18074,\"capabilities\":[{\"maxFs\":3600,\"maxMbps\":108000,\"maxFps\":30,\"maxBr\":1462800,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":false,\"vlaDebug\":\"1280x720@15x1092\"}],\"error\":\"undefined\"},{\"eventType\":\"app\",\"timestamp\":18074,\"capabilities\":[{\"maxFs\":3600,\"maxMbps\":108000,\"maxFps\":30,\"maxBr\":1462800,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":false,\"vlaDebug\":\"1280x720@15x1092\"}],\"error\":\"undefined\"}],[{\"eventType\":\"req\",\"timestamp\":18049,\"capabilities\":[{\"maxFs\":2040,\"maxMbps\":61200,\"maxFps\":30,\"maxBr\":1772400,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":true,\"vlaDebug\":\"1280x720@15x1092\"}],\"isSimulcast\":true},{\"eventType\":\"app\",\"timestamp\":21028,\"capabilities\":[{\"maxFs\":2040,\"maxMbps\":61200,\"maxFps\":30,\"maxBr\":1772400,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":true,\"vlaDebug\":\"1280x720@15x1092\"}],\"error\":\"undefined\"},{\"eventType\":\"app\",\"timestamp\":21028,\"capabilities\":[{\"maxFs\":2040,\"maxMbps\":61200,\"maxFps\":30,\"maxBr\":1772400,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":true,\"vlaDebug\":\"1280x720@15x1092\"}],\"error\":\"undefined\"}],[{\"eventType\":\"req\",\"timestamp\":18981,\"capabilities\":[{\"maxFs\":2040,\"maxMbps\":61200,\"maxFps\":30,\"maxBr\":1772400,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":true,\"vlaDebug\":\"1280x720@15x1092\"}],\"isSimulcast\":true}],[{\"eventType\":\"req\",\"timestamp\":21359,\"capabilities\":[{\"maxFs\":2040,\"maxMbps\":61200,\"maxFps\":30,\"maxBr\":1999200,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":false,\"vlaDebug\":\"960x540@15x1772\"}],\"isSimulcast\":true},{\"eventType\":\"app\",\"timestamp\":21369,\"capabilities\":[{\"maxFs\":2040,\"maxMbps\":61200,\"maxFps\":30,\"maxBr\":1999200,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":false,\"vlaDebug\":\"960x540@15x1772\"}],\"error\":\"undefined\"},{\"eventType\":\"app\",\"timestamp\":21369,\"capabilities\":[{\"maxFs\":2040,\"maxMbps\":61200,\"maxFps\":30,\"maxBr\":1999200,\"ssrc\":1070193489,\"rid\":\"1\",\"keyframe\":false,\"vlaDebug\":\"960x540@15x1772\"}],\"error\":\"undefined\"}]]",
      "Extensions_Video_send_OvershootDurations": "{\"fs\":0,\"fps\":0,\"br\":0}",
      "Extensions_Video_send_QpAvg": "22.211",
      "Extensions_Video_send_bitrateAvg": "1161282",
      "Extensions_Video_send_bitrateMax": "2131064",
      "Extensions_Video_send_frameRateAvg": "13.462",
      "Extensions_Video_send_AllocateBWAvg": "2288446",
      "Extensions_Video_send_CameraOpenWidth": "1280",
      "Extensions_Video_send_CameraOpenHeight": "720",
      "Extensions_Video_send_packetsLostRateMax": "0",
      "Extensions_Video_send_Simulcast": "{\"streams\":{\"1\":{\"ssrc\":3318938528,\"time\":{\"requested\":98340.5,\"applied\":98340.40000009537,\"sent\":98340.40000009537},\"duration\":{\"requested\":16998,\"applied\":16998,\"sent\":16998},\"restarts\":{\"requested\":0,\"applied\":0,\"sent\":0},\"resolution\":{\"requested\":{\"640x360\":3,\"1280x720\":3,\"960x540\":7},\"applied\":{\"426x240\":1,\"640x360\":2,\"1280x720\":4,\"960x540\":6},\"sent\":{\"416x234\":1,\"640x360\":2,\"1280x720\":4,\"960x540\":6},\"debug\":{\"426x240:416x234\":1,\"640x360:640x360\":2,\"1280x720:1280x720\":4,\"960x540:960x540\":6}},\"switching\":{\"requested\":{\"640x360:1280x720\":1,\"960x540:1280x720\":1},\"applied\":{\"426x240:640x360\":1,\"640x360:1280x720\":1,\"960x540:1280x720\":1},\"sent\":{\"416x234:640x360\":1,\"640x360:1280x720\":1,\"960x540:1280x720\":1}},\"framerate\":{\"requested\":{\"16-30\":13},\"applied\":{\"16-30\":13},\"sent\":{\"0\":1,\"8-15\":10,\"16-30\":2}},\"bitrate\":{\"requested\":{\"250k-500k\":3,\"1M-1.5M\":3,\"1.5M-2.5M\":7},\"applied\":{\"250k-500k\":3,\"1M-1.5M\":4,\"1.5M-2.5M\":6},\"sent\":{\"0\":1,\"250k-500k\":2,\"500k-800k\":1,\"1M-1.5M\":2,\"800k-1M\":2,\"1.5M-2.5M\":5}},\"encoder\":{\"H264:SW\":{\"resolution\":{\"416x234\":1,\"640x360\":2,\"1280x720\":4,\"960x540\":6},\"encodeTime\":{\"416x234\":{\"0\":1},\"640x360\":{\"2-5 ms\":2},\"1280x720\":{\"10-30 ms\":1,\"30-100 ms\":3},\"960x540\":{\"10-30 ms\":5,\"5-10 ms\":1}},\"restarts\":0}},\"stats\":{\"fir\":\"1,5,5,5,5,5,5,5,5,5,5,5,5\",\"nack\":\"0,0,0,0,0,0,0,0,0,0,0,0,0\",\"pli\":\"0,0,0,0,0,0,0,0,0,0,0,0,0\",\"packetsSent\":\"163,215,270,384,446,636,977,1468,1640,1825,2030,2264,2473\"},\"overshootEvents\":[],\"totalBrOvershootDuration\":0,\"totalFpsOvershootDuration\":0,\"totalFsOvershootDuration\":0,\"totalFreezeDuration\":1,\"ongoingFreezeDuration\":0,\"freezeHistogram\":{\"seconds1to3\":1,\"seconds3to5\":0,\"seconds5to8\":0,\"seconds8to15\":0,\"seconds15to60\":0,\"seconds60toMax\":0}}},\"layouts\":{\"requested\":{\"640x360\":3,\"1280x720\":3,\"960x540\":7},\"sent\":{\"416x234\":1,\"640x360\":2,\"1280x720\":4,\"960x540\":6},\"applied\":{\"426x240\":1,\"640x360\":2,\"1280x720\":4,\"960x540\":6},\"debug\":{\"426x240->416x234\":1,\"640x360->640x360\":2,\"1280x720->1280x720\":4,\"960x540->960x540\":6}}}",
      "Extensions_Video_send_powerEfficientEncoderEventOnCount": "0",
      "Extensions_Video_send_powerEfficientEncoderEventOffCount": "0",
      "Extensions_Video_send_qualityLimitationReasonEvents": "[{\"reason\":\"none\",\"timestamp\":8978}]",
      "Extensions_Video_send_powerEfficientEncoderEventMismatchCount": "0",
      "Extensions_Sharing_recv_StreamsMax": "0",
      "Extensions_Sharing_recv_StreamsMin": "0",
      "Extensions_Sharing_recv_StreamsMode": "0",
      "Extensions_Sharing_recv_TimeToFirstFrame": "-1",
      "Extensions_Sharing_recv_TimeToFirstFrameSinceSubscriptionStart": "-1",
      "Extensions_Sharing_SubscriptionCounters": "{\"attempted\":0,\"subscribed\":0,\"unsubscribed\":0,\"failed\":0}",
      "Extensions_Sharing_send_Simulcast": "{\"streams\":{},\"layouts\":{\"requested\":{},\"sent\":{},\"applied\":{},\"debug\":{}}}",
      "Extensions_ReportedReceiveBandwidth": "[600000,600000,600000,600000,554296,553920,553984,554048,554120,554184,554232,553080,552496,552264,552416,552528,552536,552584,552640,552704,552744,552792,552880]",
      "Extensions_ReportedSendBandwidth": "[{\"Video\":750000},{\"Video\":1772700},{\"Video\":2354911},{\"Video\":2961253}]",
      "Extensions_EncodedStreamWorker": "false",
      "Extensions_AudioCodecEvents": "{\"negotiationAttempts\":[],\"toggleCount\":0,\"negotiatedCount\":0,\"failedNegotiationCount\":0,\"decoderInitError\":0,\"encoderInitError\":0}",
      "Extensions_HevcCodecSupport": "[{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L120.90\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.4.L93.B0\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"no-preference\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"prefer-software\",\"encode\":false,\"decode\":false},{\"name\":\"hev1.1.6.L93.B0\",\"mode\":\"prefer-hardware\",\"encode\":false,\"decode\":false}]",
      "Extensions_IsPstnCall": "false",
      "Extensions_UsesMixer": "true",
      "Extensions_InitialBWSeed": "600000",
      "Extensions_SentBWSeed": "600000",
      "Extensions_EarlyMedia_NumStatsPolls": "0",
      "Extensions_TimeToFirstAudioPacket": "2972",
      "Extensions_FetchTimeMax": "2865.7",
      "Extensions_FetchTimeMedian": "159.9",
      "Extensions_LoopIntervalMax": "3026.2",
      "Extensions_LoopIntervalMedian": "1183.3",
      "MediaControlPlane": "{\"createTime\":1763151409638,\"startedCount\":1,\"stoppedCount\":1,\"clientCapabilities\":[\"dsh\",\"bwe\",\"sr\",\"ssbwe\"],\"events\":[{\"startedTs\":2735,\"mpCapabilities\":{\"send\":[\"bwe\",\"dsh\",\"sr_res\"],\"recv\":[\"sr\",\"ssbwe\"]},\"sentMessages\":{\"syn\":1,\"ssbwe\":4},\"recvMessages\":{\"dsh\":1,\"ack\":1,\"bwe\":23},\"sentFailed\":0,\"recvFailed\":0,\"cachedDshReceived\":true,\"handshakeStartedTs\":1763151412373,\"handshakeDuration\":151,\"stoppedTs\":26349}],\"sourceRequestsReport\":{\"sourceRequestsSignaling\":{\"ApplyChannelParametersVideoCapabilities\":{\"counter\":1}},\"sourceRequestsMCP\":{},\"fallbackMCPMessagesCounter\":0,\"sourceRequestsResponses\":{},\"errors\":[],\"delayedSRsCounter\":0,\"timedOutSRsCounter\":0,\"sendSRsErrorCounter\":0,\"ignoredSRsCounter\":0,\"delayDurations\":[]}}",
      "TerminatedReason": "1",
      "TerminatedState": "7",
      "DataHandlers": "{\"1\":[{\"added\":33135,\"started\":87006,\"removed\":110619}],\"2\":[{\"added\":33135,\"started\":87005,\"removed\":110619}],\"25\":[{\"added\":85417,\"started\":87006,\"removed\":110611}]}",
      "SharingControlEnabled": "true",
      "AppInfo.ClientType": "web",
      "AppInfo.Environment": "prod",
      "AppInfo.ExperienceName": "light-meetings",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "UserInfo.Ring": "general",
      "AppInfo.UserRegion": "emea",
      "AppInfo.UserRole": "Anonymous",
      "AppInfo.UserType": "Anonymous",
      "DeviceInfo.Id": "cbc2527f-51c4-40d2-a967-525b03f63e7f",
      "platformId": "1415",
      "isTeams2": "true"
    }
  }
  ```
  ```json
  {
    "acc": 7,
    "webResult": {}
  }
  ```
- POST `https://teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:59.497Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 40,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "deeplinkService_deeplink_open_deeplink",
        "CorrelationId": "95bbfa28-7587-45f5-8940-a62d15acf5aa",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Action": {
        "Gesture": "open",
        "Outcome": "open",
        "Scenario": "deeplink",
        "ScenarioType": "deeplink"
      },
      "Module": {
        "Name": "deeplinkService",
        "Type": "deeplink"
      },
      "Panel": {
        "Type": "External",
        "WindowID": "main",
        "Context": "main"
      },
      "Deeplink": {
        "Id": "34ab99ed-fccc-4f1b-8174-cce0809b6e3a"
      },
      "DataBag": {
        "joinLinkType": "/light-meetings",
        "correlationId": "35a4136a-e5bb-4d92-afe2-3fd4e265d0cc",
        "deeplinkId": "34ab99ed-fccc-4f1b-8174-cce0809b6e3a"
      },
      "SlotConfig": {
        "MainEntityType": "chats",
        "MainEntityAction": "view"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:59.537Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 41,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "deeplinkService_deeplink_open_deeplink",
        "CorrelationId": "95bbfa28-7587-45f5-8940-a62d15acf5aa",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Action": {
        "Gesture": "open",
        "Outcome": "open",
        "Scenario": "deeplink",
        "ScenarioType": "deeplink"
      },
      "Module": {
        "Name": "deeplinkService",
        "Type": "deeplink"
      },
      "Panel": {
        "Type": "External",
        "WindowID": "main",
        "Context": "main"
      },
      "Deeplink": {
        "Id": "34ab99ed-fccc-4f1b-8174-cce0809b6e3a"
      },
      "DataBag": {
        "joinLinkType": "/light-meetings",
        "correlationId": "35a4136a-e5bb-4d92-afe2-3fd4e265d0cc",
        "deeplinkId": "34ab99ed-fccc-4f1b-8174-cce0809b6e3a"
      },
      "SlotConfig": {
        "MainEntityType": "chats",
        "MainEntityAction": "view"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "pre auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:59.617Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 42,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "auto_authAnonLaunch",
        "CorrelationId": "95bbfa28-7587-45f5-8940-a62d15acf5aa",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Action": {
        "Gesture": "auto",
        "Scenario": "authAnonLaunch",
        "ScenarioType": "appAuth",
        "WorkLoad": "auth",
        "SubWorkLoad": "sisu"
      },
      "Panel": {
        "Region": "main",
        "Type": "AuthStart",
        "WindowID": "main",
        "Context": "main"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:59.617Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 43,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "auto_authInitComplete",
        "CorrelationId": "95bbfa28-7587-45f5-8940-a62d15acf5aa",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Action": {
        "Gesture": "auto",
        "Scenario": "authInitComplete",
        "ScenarioType": "appAuth",
        "WorkLoad": "auth",
        "SubWorkLoad": "sisu"
      },
      "Panel": {
        "Region": "main",
        "Type": "AuthStart",
        "WindowID": "main",
        "Context": "main"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:59.623Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 44,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "auto_authAnonLaunch",
        "CorrelationId": "95bbfa28-7587-45f5-8940-a62d15acf5aa",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Action": {
        "Gesture": "auto",
        "Scenario": "authAnonLaunch",
        "ScenarioType": "appAuth",
        "WorkLoad": "auth",
        "SubWorkLoad": "sisu"
      },
      "Panel": {
        "Region": "main",
        "Type": "AuthStart",
        "WindowID": "main",
        "Context": "main"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:16:59.623Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 45,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "auto_authInitComplete",
        "CorrelationId": "95bbfa28-7587-45f5-8940-a62d15acf5aa",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Action": {
        "Gesture": "auto",
        "Scenario": "authInitComplete",
        "ScenarioType": "appAuth",
        "WorkLoad": "auth",
        "SubWorkLoad": "sisu"
      },
      "Panel": {
        "Region": "main",
        "Type": "AuthStart",
        "WindowID": "main",
        "Context": "main"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"nVD6MB/U/GkyQRmXi5Bj8g7vZsQUGd3EFPUOGYv8JiQ=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:17:02.168Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 46,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "CoreLayout_auto",
        "CorrelationId": "Core-16d37ddf-b1e9-4fc8-a3fa-e4d0941822e4",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "headerEntityType": "chats",
      "mainEntityAction": "view",
      "mainEntityType": "chats",
      "subNavEntityType": "Chat",
      "mainSlotApp": "Chat",
      "Action": {
        "Gesture": "auto"
      },
      "Module": {
        "Name": "CoreLayout"
      },
      "Panel": {
        "Region": "coreLayout",
        "Type": "appLayoutArea",
        "WindowID": "main",
        "Context": "main"
      },
      "Foundation": {
        "reflowEnabled": "true",
        "reflowWidthBreakpoint": "1024",
        "reflowHeightBreakpoint": "568",
        "reflowScreenColorDepth": "0",
        "reflowScreenPixelRatio": "1",
        "reflowScreenHeight": "0",
        "reflowScreenPixelDepth": "0",
        "reflowScreenWidth": "0",
        "reflowZoomFactor": "1",
        "reflowScreenMaxScaleFactor": "0",
        "reflowScreenMaxTextScaleFactor": "0",
        "reflowAction": "windowResize",
        "reflowPreviousBreakpointDuration": "0",
        "reflowFoldedAfter": "end,navControls",
        "reflowFoldedBefore": "end",
        "reflowUnfoldedAfter": "none",
        "reflowUnfoldedBefore": "none"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:17:06.336Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 47,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_Chat",
        "CorrelationId": "Core-16d37ddf-b1e9-4fc8-a3fa-e4d0941822e4",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "headerEntityType": "chats",
      "mainEntityAction": "view",
      "mainEntityType": "chats",
      "subNavEntityType": "Chat",
      "mainSlotApp": "Chat",
      "DataBag": {
        "lifeCycleFlavor": "async",
        "type": "ChatPane"
      },
      "Panel": {
        "Region": "main",
        "Type": "Chat",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Members": "0"
      },
      "Entity": {
        "Type": "chats"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:17:06.857Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 48,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_Chat",
        "CorrelationId": "Core-16d37ddf-b1e9-4fc8-a3fa-e4d0941822e4",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "headerEntityType": "chats",
      "mainEntityAction": "view",
      "mainEntityType": "chats",
      "subNavEntityType": "Chat",
      "mainSlotApp": "Chat",
      "Panel": {
        "Region": "main",
        "Type": "Chat",
        "WindowID": "main",
        "Context": "main"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:17:08.605Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 49,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
      "baseType": "meeting_chat_activation",
      "baseData": {
        "properties": {
          "version": "OfflineChannel=0.2.1;PostChannel=4.2.1;OverridePropertiesPlugin=4.2.1;SystemPropertiesCollector=4.2.0;DataScrubber=1.0;PrivacyGuardPlugin=4.2.0"
        }
      },
      "logger": "default",
      "EventInfo": {
        "BaseType": "meeting_chat_activation",
        "SpanId": "1e831dd1149a597e",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "meeting_chat_activation",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"chat_init_start\",\"delta\":0,\"elapsed\":90407,\"sequence\":1,\"stepDelta\":0},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"start_app_core_init\",\"delta\":1,\"elapsed\":90408,\"sequence\":2,\"stepDelta\":1},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"app_core_initialized\",\"delta\":6908,\"elapsed\":97315,\"sequence\":3,\"stepDelta\":6907},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"start_chat_window_rendering\",\"delta\":6938,\"elapsed\":97345,\"sequence\":4,\"stepDelta\":30},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"wait_for_user_in_chat\",\"delta\":6943,\"elapsed\":97350,\"sequence\":5,\"stepDelta\":5},{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":15993,\"elapsed\":106400,\"sequence\":6,\"stepDelta\":9050,\"previousStep\":\"wait_for_user_in_chat\"}]",
        "DriftMs": "0",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"conversationId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"context\":\"in-meeting\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"conversationId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"context\":\"in-meeting\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"conversationId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"context\":\"in-meeting\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"conversationId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"context\":\"in-meeting\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"conversationId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"context\":\"in-meeting\"},{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"conversationId\":\"19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2\",\"context\":\"in-meeting\"}]"
      },
      "InstanceId": "bb1fb00a-f0d8-42a1-854b-6c0dd948ea0c",
      "delta": "15993",
      "elapsed": "106400",
      "sequence": "6",
      "stepDelta": "9050",
      "previousStep": "wait_for_user_in_chat",
      "commandSource": "ExternalCommand",
      "conversationId": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
      "context": "in-meeting",
      "isInEst": "false",
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "cold"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:17:08.747Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 50,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_Chat",
        "CorrelationId": "Core-16d37ddf-b1e9-4fc8-a3fa-e4d0941822e4",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "headerEntityType": "chats",
      "mainEntityAction": "view",
      "mainEntityType": "chats",
      "subNavEntityType": "Chat",
      "mainSlotApp": "Chat",
      "Panel": {
        "Region": "main",
        "Type": "Chat",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "cold"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:17:16.245Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 52,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "main_CallingAnonMeetingEndScreen",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Panel": {
        "Region": "main",
        "Type": "CallingAnonMeetingEndScreen",
        "WindowID": "main",
        "Context": "main"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "cold"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "userbins",
    "time": "2025-11-14T20:17:16.247Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 53,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "auto",
        "CorrelationId": "dd100935-2a8a-4d89-b3ed-0451137ab5dd",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Action": {
        "Gesture": "auto"
      },
      "Panel": {
        "Region": "modal",
        "Type": "AuthLoginDialogV2",
        "WindowID": "main",
        "Context": "main"
      },
      "Auth": {
        "meetingLoginDialogSource": "signInButton",
        "otpMeetingPolicy": "true"
      },
      "Window": {
        "Focus": "foreground",
        "Status": "maximized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Ring": "general",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "cold"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "scenarions",
    "time": "2025-11-14T20:17:16.263Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 54,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "SpanId": "26f25f5d06d94a4b",
        "CorrelationId": "Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Scenario": {
        "Status": "success",
        "Mode": "3",
        "Name": "calling_call_disconnected",
        "Step": "stop",
        "Steps": "[{\"Scenario.Status\":\"success\",\"Scenario.Step\":\"stop\",\"delta\":67,\"elapsed\":114080,\"sequence\":1,\"stepDelta\":67,\"previousStep\":\"start\"}]",
        "DriftMs": "-1",
        "StepsEx": "[{\"EventInfo.CorrelationId\":\"Core-6bbe5b00-1f95-40dd-9175-8e9556f6abaa\",\"commandSource\":\"ExternalCommand\",\"id\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"callId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\",\"endpointId\":\"acf94055-9e12-48aa-ba91-70f41e300e40\",\"participantId\":\"\",\"correlationId\":\"35a4136a-e5bb-4d92-afe2-3fd4e265d0cc\",\"deeplinkId\":\"34ab99ed-fccc-4f1b-8174-cce0809b6e3a\",\"meetingCode\":\"39563371502184\",\"wasPoppedOut\":false,\"call_dataBag\":{\"entryId\":\"2273b19a-1c63-440e-9461-daa6ad7d9978\",\"sessionId\":\"2faf8b42-e740-4eb8-87fd-90cfa3fef0ae\",\"stateChanges\":\"Connecting:1763151358434;InLobby:1763151360436;Connected:1763151410797;Disconnecting:1763151435982;Disconnected:1763151436192\",\"events\":\"\",\"hadOffline\":false,\"hadSuspendEvent\":false,\"hadCriticalBattery\":false,\"hadScreenSharing\":false,\"hadDialInShown\":false,\"hadDialOutShown\":false,\"hadNetworkReconnect\":false,\"heartbeatTimestamp\":1763151358353,\"deviceCacheUsed\":false,\"wasChildWindowShown\":false,\"stageSize\":0,\"nsMode\":\"Auto\",\"terminationInfo\":{},\"callEndActionReason\":\"Success\"},\"isBroadcast\":false,\"signalingScenarioName\":\"join_or_create_meetup_from_link\",\"terminatedReason\":\"Success\",\"callControllerCode\":0,\"callControllerSubCode\":0}]"
      },
      "InstanceId": "caf4799e-52f8-49cc-a065-c0a49bae526a",
      "delta": "67",
      "elapsed": "114080",
      "sequence": "1",
      "stepDelta": "67",
      "previousStep": "start",
      "commandSource": "ExternalCommand",
      "id": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "callId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "endpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "correlationId": "35a4136a-e5bb-4d92-afe2-3fd4e265d0cc",
      "deeplinkId": "34ab99ed-fccc-4f1b-8174-cce0809b6e3a",
      "meetingCode": "39563371502184",
      "wasPoppedOut": "false",
      "call_dataBag": "{\"entryId\":\"2273b19a-1c63-440e-9461-daa6ad7d9978\",\"sessionId\":\"2faf8b42-e740-4eb8-87fd-90cfa3fef0ae\",\"stateChanges\":\"Connecting:1763151358434;InLobby:1763151360436;Connected:1763151410797;Disconnecting:1763151435982;Disconnected:1763151436192\",\"events\":\"\",\"hadOffline\":false,\"hadSuspendEvent\":false,\"hadCriticalBattery\":false,\"hadScreenSharing\":false,\"hadDialInShown\":false,\"hadDialOutShown\":false,\"hadNetworkReconnect\":false,\"heartbeatTimestamp\":1763151358353,\"deviceCacheUsed\":false,\"wasChildWindowShown\":false,\"stageSize\":0,\"nsMode\":\"Auto\",\"terminationInfo\":{},\"callEndActionReason\":\"Success\"}",
      "isBroadcast": "false",
      "signalingScenarioName": "join_or_create_meetup_from_link",
      "terminatedReason": "Success",
      "callControllerCode": "0",
      "callControllerSubCode": "0",
      "isInEst": "false",
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "cold"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_httprequest",
    "time": "2025-11-14T20:17:16.184Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 51,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Ring": "general",
      "Region": "emea",
      "ClientType": "enterprise",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "SignalingSessionId": "6a321b68-62a3-4286-b9f1-6cd2601d1a78",
      "ClientInformation": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "NetworkRequestBag": "{\"eventStart\":1763151325358,\"events\":{\"name\":\"POST-LeaveConversation\",\"url\":\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/leave?i=10-128-165-183&e=638984925660033687\",\"eventStart\":110635,\"trouterReady\":58,\"requestReady\":94,\"status\":204,\"attempts\":[{\"status\":204,\"start\":105,\"end\":190,\"online\":1}],\"rtt\":190,\"uid\":\"c65cf455-cbf5-464a-b8c7-0df32bf61b0f\",\"causeId\":\"228a0b27\",\"requestDispatcherConfig\":{\"retryIntervalsMs\":[200,1000,5000],\"maxRequestAttempts\":4,\"perRequestTimeoutMs\":45000,\"perAttemptTimeoutMs\":15000,\"perRequestTimeoutWithHedgingMs\":45000,\"perAttemptTimeoutWithHedgingMs\":30000,\"hedgeDelayMs\":4000,\"requestHedgingCapability\":[\"enabled\"]},\"enableRequestHedging\":true,\"tokenTelemetries\":[{\"requestCauseId\":\"228a0b27\",\"supportTokenApi\":false,\"requestTokenFactors\":\"{\\\"verb\\\":\\\"POST\\\",\\\"path\\\":\\\"https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ/leave?i=10-128-165-183&e=638984925660033687\\\"}\",\"tokenRequestTime\":1763151436053,\"tokenResponseTime\":1763151436059,\"tokenRequestStatus\":1,\"requestTokenType\":1,\"foundInCache\":false,\"responseTokenType\":1,\"timeToResponse\":6}]}}",
      "EcsEtag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "hostName": "<redacted>",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "cold"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  {
    "name": "skypecosi_concore_web_csa_conversation_callmodality",
    "time": "2025-11-14T20:17:16.296Z",
    "ver": "4.0",
    "iKey": "o:53fdaa090eb946b5a1d6cbdeb4f2ef66",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 55,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
          "DisplayName": {
            "t": 33
          }
        }
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
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "Type": "SkypeConcore",
      "ResultDetail": "CallEndReasonLocalUserInitiated",
      "ResultValue": "Success",
      "ResultCode": "0",
      "ResultCauseId": "228a0b27",
      "JsCsaConfig": "SupportsCompressedPayload,BrokerOutgoingEnabled,BrokerIncomingEnabled,BrokerRequestBatchingEnabled,SyncTrouterResponse,handleMediaOfferFromPushNotification,handleNewOfferRequest,internalHttpDispatcher,supportMediaRetargetWhileIncomingRenegotiation,enableCallEstablishmentTimeoutsForStartJoinCall,enableLongOutgoing1To1SetupTimeoutForWeb,serverMuteUnmute",
      "CorrelationId": "056391c5-feb6-4960-9209-36d8c0fc1be5",
      "SignalingSessionId": "6a321b68-62a3-4286-b9f1-6cd2601d1a78",
      "EndpointId": "acf94055-9e12-48aa-ba91-70f41e300e40",
      "ParticipantId": "0d8c1984-b4da-4276-9ec1-208328e346f6",
      "EcsEtag": "\"IgBg4C4yq/5pDXJyqGHbQR8iT0IEHC0dRs6oo0nvRD4=\"",
      "ConversationServiceUrl": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euwe-02-prod-aks.conv.skype.com/conv/bTjQopxCtUGSZ7tDTy_gXQ?i=10-128-165-183&e=638984925660033687",
      "CallStartTime": "1763151325358",
      "CallEndTime": "1763151436295",
      "MessagingChannel": "[\"Trouter:10\"]",
      "IsGroupCall": "true",
      "IsHostLessCall": "true",
      "IsCastCall": "false",
      "IsHuddleGroupCall": "false",
      "IsOnBehalfOfCall": "false",
      "ClientInformation": "SkypeSpaces/1415/25110306401/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0; experienceName=lime/TsCallingVersion=2025.43.01.3/Ovb=71f0cc3321f79afc076c92e65f2e069fbed202f2",
      "SdpInCallNotification": "false",
      "CallTerminatingEnd": "Local",
      "Code": "0",
      "SubCode": "0",
      "Direction": "Outgoing",
      "SelfParticipantRole": "join",
      "ConnectedDurationInMsecs": "75866",
      "TimeToRingInMsecs": "2080",
      "NetworkRequestsCompleted": "[\"JoinConversationWithoutCallModality:Success:656:691\",\"BrokerSubscribe:Success:1200:1900\",\"StartCall:Success:211:34267\",\"SendAcceptanceAcknowledgement:Success:35069\",\"SendApplyChannelParameters:Success:122:35589\",\"SendMediaAnswer:Success:193:84895\",\"SendApplyChannelParameters:Success:1725:87020\",\"SendMediaAnswer:Success:121:90658\",\"LeaveConversation:Success:190:110825\",\"LeaveConversation:Success:192:110826\"]",
      "NetworkRequestsPending": "[\"BrokerSubscribe:1901\"]",
      "LocalOperationsPerformed": "[\"SetThreadId:27\",\"SetCallOptions:27\",\"JoinConversationWithoutCallModality:30\",\"SubscribeUrlFound:699\",\"UpdateCallStatus:701\",\"HandleConversationUpdate:898\",\"SubscribeUrlMissing:899\",\"HandleConversationUpdate:1222\",\"SubscribeUrlMissing:1223\",\"StartCall:33066\",\"SetJoinedFrom:33112\",\"UpdateEndpointState:34051\",\"StartOrJoinCall:34054\",\"GetEmergencyContent:34055\",\"SubscribeUrlFound:34269\",\"BrokerDisabledSubscribeUrlPresent:34269\",\"InLobby:34272\",\"HandleRosterUpdate:34280\",\"UpdateEndpointState:34281\",\"UpdateCallStatus:34281\",\"HandleCallAcceptanceSync:35069\",\"ProcessCallAcceptance:35071\",\"MediaFsmStateChanged:35072\",\"AcceptanceUserInLobby:35072\",\"UpdateCallStatus:35077\",\"SendWebRtcMediaNotification:35466\",\"HandleRosterUpdate:35660\",\"HandleConversationUpdate:77026\",\"SubscribeUrlMissing:77028\",\"HandleConversationUpdate:79911\",\"SubscribeUrlMissing:79913\",\"HandleConversationUpdate:83889\",\"SubscribeUrlMissing:83891\",\"HandleRosterUpdate:83945\",\"HandleMediaOffer:84174\",\"MediaFsmStateChanged:84174\",\"AcceptRenegotiation:84701\",\"MediaFsmStateChanged:84701\",\"HandleMediaAck:85071\",\"HandleMediaAcknowledgement:85071\",\"SendWebRtcMediaNotification:85295\",\"Connected:85425\",\"HandleRosterUpdate:86830\",\"HandleMediaOffer:90373\",\"MediaFsmStateChanged:90374\",\"AcceptRenegotiation:90536\",\"MediaFsmStateChanged:90536\",\"HandleMediaAck:90745\",\"HandleMediaAcknowledgement:90745\",\"HandleControlVideoStreaming:93022\",\"HandleControlVideoStreaming:95616\",\"HandleControlVideoStreaming:97463\",\"HandleControlVideoStreaming:99207\",\"HandleControlVideoStreaming:101218\",\"HandleControlVideoStreaming:102257\",\"HandleControlVideoStreaming:103188\",\"HandleControlVideoStreaming:105566\",\"EndCall:110634\",\"UpdateCallStatus:110826\"]",
      "EventTimestampBag": "{\"eventStart\":1763151325358,\"events\":[{\"SetThreadId\":27},{\"SetCallOptions\":27},{\"JoinConversationWithoutCallModality\":30,\"data\":{\"causeId\":\"3d7d97ab\",\"correlationId\":\"056391c5-feb6-4960-9209-36d8c0fc1be5\"}},{\"SubscribeUrlFound\":699,\"data\":\"3d7d97ab\"},{\"UpdateCallStatus\":701,\"data\":{\"callStatus\":\"ConnectedForRosterOnly\",\"causeId\":\"3d7d97ab\"}},{\"HandleConversationUpdate\":898,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"ee6523ad\"}},{\"SubscribeUrlMissing\":899,\"data\":\"ee6523ad\"},{\"HandleConversationUpdate\":1222,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"5d5a2d7a\"}},{\"SubscribeUrlMissing\":1223,\"data\":\"5d5a2d7a\"},{\"StartCall\":33066,\"data\":{\"causeId\":\"ed6ce501\"}},{\"SetJoinedFrom\":33112},{\"UpdateEndpointState\":34051,\"data\":{\"newEndpointState\":{\"state\":{\"isMuted\":false},\"endpointStateSequenceNumber\":1},\"causeId\":\"ed6ce501\"}},{\"StartOrJoinCall\":34054,\"data\":{\"causeId\":\"ed6ce501\",\"requestName\":\"StartCall\"}},{\"GetEmergencyContent\":34055},{\"SubscribeUrlFound\":34269,\"data\":\"ed6ce501\"},{\"BrokerDisabledSubscribeUrlPresent\":34269,\"data\":\"ed6ce501\"},{\"InLobby\":34272,\"data\":{\"causeId\":\"ed6ce501\"}},{\"UpdateEndpointState\":34281,\"data\":{\"newEndpointState\":{\"state\":{\"isMuted\":false},\"endpointStateSequenceNumber\":2},\"causeId\":\"ed6ce501\"}},{\"UpdateCallStatus\":34281,\"data\":{\"callStatus\":\"Connecting\",\"causeId\":\"ed6ce501\"}},{\"HandleCallAcceptanceSync\":35069,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"3177cac9\",\"data\":{\"enableQuickSendAcceptanceAck\":true,\"causeId\":\"3177cac9\"}}},{\"ProcessCallAcceptance\":35071,\"data\":{\"causeId\":\"3177cac9\"}},{\"MediaFsmStateChanged\":35072,\"data\":{\"state\":\"Connected\",\"causeId\":\"3177cac9\"}},{\"AcceptanceUserInLobby\":35072,\"data\":{\"causeId\":\"3177cac9\"}},{\"UpdateCallStatus\":35077,\"data\":{\"callStatus\":\"Connected\",\"causeId\":\"3177cac9\"}},{\"SendWebRtcMediaNotification\":35466,\"data\":{\"causeId\":\"c7b398a4\"}},{\"HandleConversationUpdate\":77026,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"5b05c696\"}},{\"SubscribeUrlMissing\":77028,\"data\":\"5b05c696\"},{\"HandleConversationUpdate\":79911,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"2e7b06fa\"}},{\"SubscribeUrlMissing\":79913,\"data\":\"2e7b06fa\"},{\"HandleConversationUpdate\":83889,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"a58b245e\"}},{\"SubscribeUrlMissing\":83891,\"data\":\"a58b245e\"},{\"HandleMediaOffer\":84174,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"bec11d11\"}},{\"MediaFsmStateChanged\":84174,\"data\":{\"state\":\"IncomingRenegotiation\",\"causeId\":\"bec11d11\"}},{\"AcceptRenegotiation\":84701,\"data\":{\"mediaTypes\":[\"Audio\",\"Video\",\"ScreenViewer\"],\"causeId\":\"bec11d11\"}},{\"MediaFsmStateChanged\":84701,\"data\":{\"state\":\"Connected\",\"causeId\":\"bec11d11\"}},{\"HandleMediaAck\":85071,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"f68916e5\"}},{\"HandleMediaAcknowledgement\":85071,\"data\":{\"causeId\":\"f68916e5\"}},{\"SendWebRtcMediaNotification\":85295,\"data\":{\"causeId\":\"883fa2cb\"}},{\"Connected\":85425,\"data\":{\"causeId\":\"fbc6d8b5\"}},{\"HandleMediaOffer\":90373,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"e8c8baf8\"}},{\"MediaFsmStateChanged\":90374,\"data\":{\"state\":\"IncomingRenegotiation\",\"causeId\":\"e8c8baf8\"}},{\"AcceptRenegotiation\":90536,\"data\":{\"mediaTypes\":[\"Audio\",\"Video\",\"ScreenViewer\"],\"causeId\":\"e8c8baf8\"}},{\"MediaFsmStateChanged\":90536,\"data\":{\"state\":\"Connected\",\"causeId\":\"e8c8baf8\"}},{\"HandleMediaAck\":90745,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"c8723803\"}},{\"HandleMediaAcknowledgement\":90745,\"data\":{\"causeId\":\"c8723803\"}},{\"HandleControlVideoStreaming\":93022,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"73c3f6db\"}},{\"HandleControlVideoStreaming\":95616,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"a5534208\"}},{\"HandleControlVideoStreaming\":97463,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"1fb50e87\"}},{\"HandleControlVideoStreaming\":99207,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"3c847ac4\"}},{\"HandleControlVideoStreaming\":101218,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"3a3a21ea\"}},{\"HandleControlVideoStreaming\":102257,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"90d461d1\"}},{\"HandleControlVideoStreaming\":103188,\"data\":{\"origin\":\"Broker\",\"causeId\":\"4ba4d4d0\"}},{\"HandleControlVideoStreaming\":105566,\"data\":{\"origin\":\"Trouter\",\"causeId\":\"96d03b6a\"}},{\"EndCall\":110634,\"data\":{\"code\":0,\"subCode\":0,\"causeId\":\"228a0b27\"}},{\"UpdateCallStatus\":110826,\"data\":{\"callStatus\":\"LocalTerminated\",\"statusCode\":{\"code\":0,\"subCode\":0,\"phrase\":\"CallEndReasonLocalUserInitiated\",\"resultCategories\":[\"Success\"]},\"causeId\":\"228a0b27\"}}]}",
      "RosterUpdatesBag": "{\"eventStart\":1763151325358,\"events\":[{\"eventName\":34280,\"data\":{\"data\":{\"participantCountInLastRoster\":1,\"participantCountInFirstRoster\":1,\"sequenceNumberOfLastRoster\":0,\"sequenceNumberOfLastFullRoster\":0,\"sequenceNumberOfFirstRoster\":0,\"rosterType\":\"Delta\",\"isFullRoster\":true,\"maxConcurrentParticipantsDuringLeg\":1,\"totalParticipantsDuringLifetimeOfLeg\":1,\"countOfMissingNotifications\":0},\"causeId\":\"ed6ce501\"}},{\"eventName\":35660,\"data\":{\"data\":{\"participantCountInLastRoster\":1,\"participantCountInFirstRoster\":1,\"sequenceNumberOfLastRoster\":1,\"sequenceNumberOfLastFullRoster\":0,\"sequenceNumberOfFirstRoster\":0,\"rosterType\":\"Delta\",\"isFullRoster\":false,\"maxConcurrentParticipantsDuringLeg\":1,\"totalParticipantsDuringLifetimeOfLeg\":1,\"countOfMissingNotifications\":0},\"causeId\":\"6931dea4\"}},{\"eventName\":83945,\"data\":{\"data\":{\"participantCountInLastRoster\":2,\"participantCountInFirstRoster\":1,\"sequenceNumberOfLastRoster\":3,\"sequenceNumberOfLastFullRoster\":0,\"sequenceNumberOfFirstRoster\":0,\"rosterType\":\"Delta\",\"isFullRoster\":false,\"maxConcurrentParticipantsDuringLeg\":2,\"totalParticipantsDuringLifetimeOfLeg\":2,\"countOfMissingNotifications\":1},\"causeId\":\"f107fa57\"}},{\"eventName\":86830,\"data\":{\"data\":{\"participantCountInLastRoster\":1,\"participantCountInFirstRoster\":1,\"sequenceNumberOfLastRoster\":4,\"sequenceNumberOfLastFullRoster\":0,\"sequenceNumberOfFirstRoster\":0,\"rosterType\":\"Delta\",\"isFullRoster\":false,\"maxConcurrentParticipantsDuringLeg\":2,\"totalParticipantsDuringLifetimeOfLeg\":2,\"countOfMissingNotifications\":1},\"causeId\":\"fbc6d8b5\"}}]}",
      "TrouterWaitOperations": "[\"Started:JoinConversationWithoutCallModality:35\",\"Ended:JoinConversationWithoutCallModality:35\",\"Started:BrokerSubscribe:703\",\"Ended:BrokerSubscribe:703\",\"Started:BrokerSubscribe:1901\",\"Ended:BrokerSubscribe:1901\",\"Started:BrokerSubscribe:21995\",\"Ended:BrokerSubscribe:21995\",\"Started:StartCall:34056\",\"Ended:StartCall:34056\",\"Started:BrokerSubscribe:42080\",\"Ended:BrokerSubscribe:42080\",\"Started:BrokerSubscribe:62164\",\"Ended:BrokerSubscribe:62164\",\"Started:BrokerSubscribe:82258\",\"Ended:BrokerSubscribe:82258\",\"Started:SendMediaAnswer:84703\",\"Ended:SendMediaAnswer:84703\",\"Started:SendMediaAnswer:90537\",\"Ended:SendMediaAnswer:90537\",\"Started:BrokerSubscribe:103189\",\"Ended:BrokerSubscribe:103189\"]",
      "LocalOfferAnswerGenerationTimestamps": "[\"InitialOfferGenerationStarted:33307\",\"InitialOfferGenerationEnded:34049\",\"InitialAnswerProcessingStarted:35148\",\"InitialAnswerProcessingEnded:35221\",\"NegotiationCompleted:35223\",\"RenegotiationOfferProcessingStarted:84179\",\"RenegotiationOfferProcessingEnded:84247\",\"RenegotiationAnswerGenerationStarted:84257\",\"RenegotiationAnswerGenerationEnded:84699\",\"NegotiationCompleted:85073\",\"RenegotiationOfferProcessingStarted:90375\",\"RenegotiationOfferProcessingEnded:90386\",\"RenegotiationAnswerGenerationStarted:90387\",\"RenegotiationAnswerGenerationEnded:90535\",\"NegotiationCompleted:90746\"]",
      "Outgoing_Modalities": "[[\"Audio\",\"Video\",\"ScreenViewer\"],[\"Audio\",\"Video\",\"ScreenViewer\"],[\"Audio\",\"Video\",\"ScreenViewer\"]]",
      "Incoming_Modalities": "[[\"Audio\",\"Video\",\"ScreenViewer\"]]",
      "CallAnsweredModalities": "Audio[0] = Bidirectional, Video[0] = Bidirectional, Video[1] = ReceiveFromPeer, Video[2] = ReceiveFromPeer, Video[3] = ReceiveFromPeer, Video[4] = ReceiveFromPeer, Video[5] = ReceiveFromPeer, Video[6] = ReceiveFromPeer, Video[7] = ReceiveFromPeer, Video[8] = ReceiveFromPeer, Video[9] = ReceiveFromPeer, AppSharing[0] = ReceiveFromPeer",
      "Caller_Type": "8",
      "IsPreheated": "0",
      "ResultCategories": "Success",
      "Ring": "general",
      "Region": "emea",
      "JoinedFrom": "MeetingCode",
      "MeetingCode": "39563371502184",
      "MeetingRole": "presenter",
      "AdvancedMeetingRole": "presenter",
      "MeetingRoles": "[\"presenter\",\"producer\"]",
      "ParticipantType": "anonymous",
      "DisplayName": "Neil Rashbrook",
      "ClientSupportsAudioOnlyWatermark": "true",
      "IsReinviteless": "0",
      "ClientType": "enterprise",
      "Call_Type": "default",
      "ThreadId": "19:meeti",
      "TeamsMessageId": "0",
      "TeamsMeetingInfo": "{\"organizerId\":\"u8\",\"tenantId\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\"}",
      "hostName": "<redacted>",
      "ui_version": "1415/25110306401",
      "uiVersion": "1415/25110306401",
      "isTeams2": "true",
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "AppInfo": {
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "Environment": "prod",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "cold"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "Panel": {
        "Context": "main"
      },
      "startReason": "userInitiated",
      "UserInfo": {
        "Language": "en-GB",
        "Ring": "general",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Window": {},
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  ```
  ```json
  {
    "acc": 16
  }
  ```
- GET `https://teams.microsoft.com/api/chatsvc/emea/v1/users/ME/conversations/48%3Anotifications?view=msnp24Equivalent`
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
- GET `https://teams.microsoft.com/api/csa/emea/api/v1/teams/users/anonymous/updates?isPrefetch=false&enableMembershipSummary=true`
  ```json
  {
    "teams": [],
    "chats": [],
    "users": [],
    "channels": [],
    "privateFeeds": [],
    "metadata": {
      "syncToken": "eyJkZWxpdmVyZWRTZWdtZW50cyI6W3sic3RhcnQiOiIxOTcwLTAxLTAxVDAwOjAwOjAwKzAwOjAwIiwiZW5kIjoiMjAyNS0xMS0xNFQyMDoxNjo1Ni4wNTMrMDA6MDAifV0sInplcm9MTVNURGVsaXZlcmVkU2VnbWVudHMiOltdLCJzb3J0T3JkZXIiOjAsImluY2x1ZGVaZXJvTE1TVCI6ZmFsc2V9",
      "forwardSyncToken": null,
      "isPartialData": false,
      "hasMoreChats": false
    }
  }
  ```
- GET `https://teams.microsoft.com/api/chatsvc/emea/v1/users/ME/conversations/48%3Anotifications?view=msnp24Equivalent`
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
- POST `https://teams.events.data.microsoft.com/OneCollector/1.0/?cors=true&content-type=application/x-json-stream&content-encoding=gzip`
  ```json
  {
    "name": "userbins",
    "time": "2025-11-14T20:18:25.146Z",
    "ver": "4.0",
    "iKey": "o:bc3902d8132f43e3ae086a009979fa88",
    "ext": {
      "sdk": {
        "ver": "1DS-Web-JS-4.2.1",
        "seq": 56,
        "epoch": "2021171348"
      },
      "app": {
        "sesId": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae"
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
        "Identifier": "attachFile_menuItem_auto_attachFileReference",
        "CorrelationId": "Core-16d37ddf-b1e9-4fc8-a3fa-e4d0941822e4",
        "isNS": "true",
        "TraceId": "a9eb986024e18bdcb7289f9f6e1f5089"
      },
      "headerEntityType": "chats",
      "mainEntityAction": "view",
      "mainEntityType": "chats",
      "subNavEntityType": "Chat",
      "mainSlotApp": "Chat",
      "DataBag": {
        "lifeCycleFlavor": "async"
      },
      "Action": {
        "Gesture": "auto",
        "Outcome": "hide",
        "Scenario": "attachFileReference",
        "ScenarioType": "files"
      },
      "Module": {
        "Name": "attachFile",
        "Type": "menuItem"
      },
      "Panel": {
        "Region": "compose",
        "Type": "Chat",
        "WindowID": "main",
        "Context": "main"
      },
      "Thread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting",
        "Members": "2"
      },
      "TargetThread": {
        "Id": "19:meeting_N2U3YzYzM2UtYTUxOS00NWNhLWI5YmEtYmU5MDcwYmM2MjBl@thread.v2",
        "Type": "Meeting"
      },
      "Entity": {
        "Type": "chats"
      },
      "Window": {
        "Focus": "background",
        "Status": "minimized",
        "Height": "641",
        "Width": "1024",
        "ViewportContext": "primary"
      },
      "UserInfo": {
        "Id": "8:defaultOid:anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "TenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
        "Ring": "general",
        "ETag": "\"KMAaIAVFN2DQJWzOnBQXrUOb+6cQ+b6vEOqxoBlJ/Lc=\"",
        "Language": "en-GB",
        "TimeZone": "+00:00",
        "UserLocale": "en-GB",
        "OSorBrowserLocale": "en-GB",
        "TelemetryRegion": "ROW",
        "Type": "Anonymous",
        "Role": "Anonymous",
        "TenantRole": "1",
        "HomeAccountId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
        "SubType": "Default",
        "IsCrossCloudUser": "false",
        "IsExternal": "false",
        "CountryCode": "GB",
        "IsMRU": "true"
      },
      "AppInfo": {
        "Environment": "prod",
        "ClientType": "web",
        "ProcessArchitecture": "x64",
        "Language": "en-gb",
        "Locale": "en-gb",
        "PlatformId": "1415",
        "Version": "1415/25110306401",
        "IsConvergedApp": "false",
        "VersionNew": "1415/25110306401",
        "ReactAppVersion": "1415/25110306401",
        "ExperienceName": "light-meetings",
        "BootType": "Unknown",
        "ServiceWorkerState": "noActiveFound",
        "CdlWorkerScriptLoadType": "Full",
        "ArchVersion": "V2",
        "AuthState": "{\"state\":\"Up\"}",
        "ClientState": "Active",
        "Suspended": "Initialized",
        "MachineLock": "Active",
        "NetworkState": "Online",
        "DetailedNetworkState": "Online",
        "CDLState": "Running",
        "LaunchMode": "cold"
      },
      "sampleCohortValue": 14.23,
      "sampleRate": 100,
      "Telemetry": {
        "WorkerId": "569c9f23-d8a6-4781-889e-8720a1808a70"
      },
      "authStatus": "anon auth",
      "Session": {
        "TelemetryWorkerType": "dedicated",
        "Id": "2faf8b42-e740-4eb8-87fd-90cfa3fef0ae",
        "TelemetryContext": "web",
        "WebId": "415fc035-5f98-472a-9f9e-423cc5a5efb7"
      },
      "DeviceInfo": {
        "OsName": "Windows",
        "OsVersion": "NT 10.0",
        "OsFamily": "Windows",
        "CpuArchitecture": "x64",
        "BrowserName": "chrome",
        "BrowserVersion": "141.0.7390.67",
        "Id": "d5db3b0f-e101-4806-8e8b-ac22597657d4"
      },
      "startReason": "userInitiated",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Tenant": {},
      "telemetryRegionFetchComplete": "false",
      "userId": "anon.prod.338de7e8-b10a-4a7c-aeb4-4cdf726fc818.undefined",
      "uniqueCredentialCount": "0",
      "mtmaAccounts": "1"
    }
  }
  ```
  ```json
  {
    "acc": 1
  }
  ```

Note: Large requests e.g. image or audio media or scripts have been excluded.
