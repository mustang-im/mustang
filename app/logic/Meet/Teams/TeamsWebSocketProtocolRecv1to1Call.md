# Teams WebSocket Protocol - Receive 1 to 1 Call

When loading the Microsoft Teams website and receiving a 1 to 1 call, four Websockets were created.

### Sockets 1 & 2: `wss://augloop.office.com/`

These sockets have no query string parameters. The following messages occurred in the above session:
- send: `~`
- send:
  ```json
  {
    "protocolVersion": 2,
    "clientMetadata": {
      "appName": "Teams",
      "appPlatform": "Web",
      "uiLanguage": "en-gb",
      "flights": "Microsoft.Teams.Augloop.SmartCardChatPromptVersion:2;Microsoft.Teams.Augloop.SmartCardChannelPromptVersion:2;Microsoft.Teams.Augloop.AllowPartialResults:true;Microsoft.Teams.Augloop.DefaultModelOverride:GPT41_ShortCo_0414;Microsoft.Teams.Augloop.FLIGHT_OMNI_MIGRATION:true;Microsoft.Teams.Augloop.ForceCallFlux:false;Microsoft.Office.WordOnline.Augloop.EnableEditorAiPreview:true;Microsoft.Teams.Augloop.EnableMeetingSydneyNativeQnASkill:true;Microsoft.Teams.Augloop.EnableMeetingCopilotHistory:true;Microsoft.Office.SharedOnline.Augloop.Copilot.EnableSydneyErrorDetails:true;Microsoft.Teams.Augloop.EnableMeetingCopilotOptimizedStreaming:true;Microsoft.Office.AugLoop.AnnotationsOrderingEnabled:true;Microsoft.Teams.Augloop.IgnoreByDesignSydneyErrors:true;_acceptsClaimsChallengeMessages;_acceptsSeedingStatusChangeMessages",
      "releaseAudienceGroup": "Dogfood",
      "releaseChannel": "general",
      "sessionId": "3d4007dd-2b7e-454a-ac1a-870621e9235b",
      "runtimeVersion": "2.35.2213",
      "docSessionId": "8fe22d3e-beb5-4138-8f0d-e380ec7aa943",
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
    "cv": "tFaKWgetCCdtJ/OwiNs9E5.1",
    "messageId": "c1"
  }
  ```
- receive: `~`
- receive:
  ```json
  {
    "sessionUrlBase": "https://northeurope-pa02.augloop.office.com/v2/session",
    "sliceUrl": "wss://northeurope-pa02.augloop.office.com/v2/?x-origin=91A7B244FEBF012BCBE94C0EF2426E2BEDEB19B5F31F6DF4EBAF107FBDF4C9DC",
    "sessionKey": "783d95fe-48b9-407a-9521-89140e0f5ae8",
    "origin": "91A7B244FEBF012BCBE94C0EF2426E2BEDEB19B5F31F6DF4EBAF107FBDF4C9DC",
    "messageId": "c1",
    "routingSessionKey": "cHJvZF9ub3J0aGV1cm9wZS1wYTAyLjkxQTdCMjQ0RkVCRjAxMkJDQkU5NEMwRUYyNDI2RTJCRURFQjE5QjVGMzFGNkRGNEVCQUYxMDdGQkRGNEM5REMuNzgzZDk1ZmUtNDhiOS00MDdhLTk1MjEtODkxNDBlMGY1YWU4",
    "forceReconnect": false,
    "workflowInputTypes": [
      "AugLoop_Core_GridCell",
      "AugLoop_Core_Document",
      "AugLoop_Automatic_Clp_SensitiveItemAnnotation",
      "AugLoop_Image_ImageTestTile",
      "AugLoop_Image_ImageTile",
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
      "AugLoop_TeamsRoomsAi_AgentSignal",
      "AugLoop_TeamsRoomsAi_GenerateContentSignal",
      "AugLoop_TeamsRoomsAi_GenerateTextSignal",
      "AugLoop_TeamsGroupCopilot_SchedulingSignal",
      "AugLoop_ContentSummary_ContentSummarySignal",
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
      "AugLoop_ContentExtensions_UserSearchSignal",
      "AugLoop_ContentExtensions_UserDownloadSignal",
      "AugLoop_ContentExtensions_UserProfileSignal",
      "AugLoop_ContentExtensions_UserAccountDisconnectSignal",
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
      "AugLoop_Core_Session",
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
      "AugLoop_GetDocumentContext_GetDocumentContextSignal",
      "AugLoop_OnenoteCopilot_OneNotePageChangeSignal",
      "AugLoop_RichContent_BotSpeakDocParserAnnotation",
      "AugLoop_RichContent_PowerPointSlideImages",
      "AugLoop_IntelligentOdataGenerator_IntelligentOdataGeneratorSignal",
      "AugLoop_LoopAppCopilot_LoopAppCopilotInputSignal",
      "AugLoop_LoopAppCopilot_LoopAppCopilotProgramResponseSignal",
      "AugLoop_LoopAppCopilot_LoopAppCopilotSessionDumpRequest",
      "AugLoop_LoopCopilot_MarkdownPageContentResponse",
      "AugLoop_LoopCopilot_LoopCopilotRequest",
      "AugLoop_LoopCopilot_MarkdownPageContentRequest",
      "AugLoop_LoopCopilot_JSONTilesPageContentRequest",
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
      "AugLoop_CameraTranscript_CameraTranscriptSignalV2",
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
    "anonymousToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNjYmI0MzdkYjE1NzQzNWM5MjZhZGI4NTg0MWI5MjI4In0.eyJhcHBpZCI6IjQzNTRlMjI1LTUwYzktNDQyMy05ZWNlLTJkNWFmZDkwNDg3MCIsImlzcyI6Imh0dHBzOi8vYXVnbG9vcC5vZmZpY2UuY29tL2Fub255bW91c1Rva2VuIiwiYXVkIjoiaHR0cHM6Ly9hdWdsb29wLm9mZmljZS5jb20vYW5vbnltb3VzVG9rZW4iLCJpYXQiOjE3NjIzNzY1MDUsIm5iZiI6MTc2MjM3NjIwNSwiZXhwIjoxNzYyNDYyOTA1LCJvaWQiOiJlOWdPS3kzYVNTa0t3S3Y0VlU3Skg4Kys3MmJYRVVmTExzaDVnOHl6aVlNPSIsInNpZCI6Ijc4M2Q5NWZlLTQ4YjktNDA3YS05NTIxLTg5MTQwZTBmNWFlOCJ9.jjbmMCELQO7kin0F170kdFUxbaK04XW4MnxtkUCWcEZ4DD3YDsZ1awAc9yT2MTiACKdjRWiYsYn_X1dasDejoOxQH0H-RNvgkCzrmL6dtSpDZ7SdA--78wbD5phgwvZU8NvPTKc6eUoNStCFE02AkUPmm6bKWCjQuxL43d1RvQKYOL9MHjdM1Y14lv5er518vaW_1R0j1HWZMPai026jk09bjEf0kUIjycUbJ-s9-1fMsFgBuBU-jdCd5lJmBm4XQaQmHMo0307XotZa34VvxIg9AcbypyLDNxhS-m6ZpalUHW-Ji-esOpfnxphYvkV3YzMxdD4Hn7TSRSnBUYB9zw",
    "tokenExpirationTime": 1762462905,
    "tokenExpirationSeconds": 86399,
    "maxRPS": 250,
    "maxBPS": 1000000000
  }
  ```
- send:
  ```json
  {
    "cv": "XvrRbUl3/A1WhchASpDUPa",
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
- send:
  ```json
  {
    "authToken": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiV3pjXzBSSHBXN2dfUnJsemtjSWY4MGg4NGhCXy1wY0FwUGh2aWVlYzVzUSIsInhtc19oZF91dGkiOiJnZjYwRVR5amdrLUFLRlZ3eDZvYkFBIiwieG1zX2hkX2lhdCI6IjE3NjIzNzYxODQifQ..9MgX2ZgBnTMTUbiEawarog.f0QDQdD-rRMQPpFyOdj2QhFMByEE--BTE1LuJEJZTtGS9SdmmZR8yLf-R9zrDpz2SCGt_BUaIhBGUbxRXD6is7xS6e-GizHmjl8Xz7O0jS7SS6QJl-meo63z0WKlU0pRX3PIOW8aqdlmqNh6UlE-lbT9zqUfZVeNaAA1UT5WdilUkn200BmjIY9t5pEmjUIeabo1MwKReTwvMm2xaDnS5_R4SkcPcHi6snu6WK8o1S_YTueMModS29_b3KcxjxE25Ac2_xGCgUOKRPTiA0wodu0AJ07D0Y4IOeKwH2x5udn2fBFnaFDbo7Z2I7JQOrR6LwVIjWA6gnxj6MN0fjolyIqP8SMGETTPHYFZwMAwtbj-6xiPdTZnu43PoWwDaP-zkNxl4JNAn0Cu7IgCN_T5zeiw7Ell_FsuOQEavy3uxnhwN1fdXDPEbHS-YQGP5MRHfBPOqyUIqV8OBc6R3C4-KWb2uifAmv1-621vOMwsWrjJgjaT7iRU4fvziH5vcm6yVQ2Kk4RVCIYoIeIDsoqhumQ32HapCDyNJ492JXq6f8xp9_IfDIIJiMnHZiUjyQlHCam09PZJkZCEW07s7FAC3TXGUwItUY_QoGiqRNkcjU6O1zl7CJcIgWGbrLAFr-7yoGtJ2KG-vkXyVM4EmlVvE0IBmFHQK3VY2zsqXownsJRAKhf7VhKOEf99cTWbht3yDnXGXZom-zB22mrxA4Vj2-0LHxMLv9d_BmHn-gl9l_pZ9sf-G8RlJlA6yaDSy9YhnbY9oUiNaBzMyEH6WKixrXw7mUjzy1ZwQ5YHRmfmjO1DoYUtcc8ehVGFZQw-JPPPwgMvwCyXHqVyfNBtA794B5HbJA0LpXaFdtkXg0K0zKGWME8_-322hIx82M3Wf0goD0lmFQWdk7WgfzdAj4I0SfuP15Oa0_VnXrGqi7ltB6gshOPfvABjsZnUw4BG2QQAOI50wXL3WYEyEbw91KCFx0hbL7yhVerukwbd11_tb_y4YPqv_ld0wMvJw2QkEkGRpfWmRTPvPSw_2yoRKy7mSaiu2KFQSl-Bua9wIiFkIFtV-JmoUN5QrF-7JtFKacsiqN0twb4KWz9kc2USlMYimrjYrMk3VPCTsx1D2-4R9OY40DNJhjmX2o0Qt56VZVqUI_Tz7Enpq4KiFOIAL3z9QFHKNCoNCXUmtX17x4rm-9FYjPn5_wQCH-9wU7H2eMRZtwDfkYt3t-argbBLEziLiYlNjSbYpZk0EZuY0b19t7OW1SvTd-2bntaX7m7B5zY_Fwq_hgmTkSmiFvlcOhG5uBXls9LdHObQpk3fMuqLIfiCSUfkd_WwEVCKNG93BU6cIzyyqNipIuqNSA9zvrpmtuLqp3iCpdq0ufc-yoGKSH1Y2hRt7D3nMnOm5cno1Z3LqgchMYr9MIzqOMarB45AdQ2HhdltLiBOJqiG7erOhk_yTSSNQ7VDuca4Ng6mJcavOed1oaBpW_69JLFChf1r0TAzfyK5eljzaH7HQoJik8X5sxVABAOUizdHPzUFm7bCP9UipHYsRdpChYayhSOP9A-nu6GcVjiiq3Q7P3yvX6NFYHQulqLdqh5JZ1zkHf8iFDMh9CjzP7gEpCkNKKASmBME-W9sJi3x2i7-UAL9RBlNFan_8Y1kkAA4pdlRnyBdO4mZr-SbhW6U9vLeFAfmaTyrct18cVAPAIpYI_vCSqcwPsxdnSplaw9vMlOJbhb0s0nVTcjL2dog_u6vfO3fwOsPCv32RpcZW0L6RKpgxJEepyxVcoHgjAAqrvmhGKWQbiIU5TZGQPO_2I1AzOucAx4AVu4NyMogjon7N9S3qLEZP3H52n-agNNoAHlINFreUnGCiGXN0BK2SOJCEOxyr2R3HTF0fvKY19KaIATK6k7nV2gMEmQ5yCWIi_tOKfYbB7VQzSXXMdts8R4JxtTzipq3XNsl1wDGD7zF2nKKDLiUiFmNMn0yyjX4fePZlqBHA5_u4SM8QYm2fxPFWBX9K5AUn1DHytBFdz7gERnqAc6RkUirgj0KloPaq5bDqqKoB8TiomXWKlgjxuEUKwr7bpPSdh9rUJPeyVVpXaPEjjV9KdAfVbmCTOk6s7HCE2IVVbFNAHce4sFrkMfvBbZRPwtrU0Il7ooDNimuE5QxEjK2T0KV4kPbh80SQVlATcmyN2G0spTnSdk3UVaukf8rPAE6jQZJnAZz0GuwEPS8fGHD8dW38Rh2verCYCfOvyoR6kQjtQmeQqCXGmMeDo8G1KLx9EiAtFgGT67_2YyBXqNhgOMMtPJqS8F8UX_2cFIAQyKWhisSqz7efSl0cIzjpkrcplbAb9xxg17M1aXhyfIMtdNkkd6TsdZSB-_IbHyd3RO3QZvnuEY5rymXdRmyyQUStJEPlyR_YkIMuVOseib-kSvljcIruTBHLUyyTMHGjRWNBR44DRxjdMbNF1GVSLAaL7UYCX4xJf2DLU10JXmqH08lJ4tDLK-vhgrtkzqI7IAk2w34NRyOdRHGXvPeOcgQdnEHiWzWY15YrqKSA75DY8Rs9PeSf3MiTXrYZJQGlm5bXJzxLdRxH_9O1fltPkS6P611gRAJaqcs87VlmNo.7TU9LyHPLbfES8ORF4z1Um9XzIeKX5myUYE2qyEPSY0",
    "version": 1,
    "H_": {
      "T_": "AugLoop_Session_Protocol_TokenProvisionMessage",
      "B_": [
        "AugLoop_Session_Protocol_Message"
      ]
    },
    "cv": "tFaKWgetCCdtJ/OwiNs9E5.2",
    "messageId": "c3"
  }
  ```
- receive:
  ```json
  {
    "tokenExpirationTime": 1762381873,
    "tokenExpirationSeconds": 5366,
    "tokenType": 1,
    "H_": {
      "T_": "AugLoop_Session_Protocol_TokenProvisionResponse",
      "B_": [
        "AugLoop_Session_Protocol_Response"
      ]
    },
    "messageId": "c3"
  }
  ```
- send: `~`
- receive: `~`
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
      "sessionId": "3d4007dd-2b7e-454a-ac1a-870621e9235b",
      "runtimeVersion": "2.35.2213",
      "docSessionId": "af7e78d2-329a-44a5-b53a-f12d55aaf17e",
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
    "cv": "sXcDpnVcMb6XKXDvZGsrue.1",
    "messageId": "c1"
  }
  ```
- receive: `~`
- receive:
  ```json
  {
    "sessionUrlBase": "https://northeurope-pa02.augloop.office.com/v2/session",
    "sliceUrl": "wss://northeurope-pa02.augloop.office.com/v2/?x-origin=B4995B68B3C7A2D4CE2C348A8A538FBBDC5AE029A873EEDEB4F73D62C7FC7EFA",
    "sessionKey": "82d6f6fd-b0c4-4853-8def-7d7ef8d2e4d3",
    "origin": "B4995B68B3C7A2D4CE2C348A8A538FBBDC5AE029A873EEDEB4F73D62C7FC7EFA",
    "messageId": "c1",
    "routingSessionKey": "cHJvZF9ub3J0aGV1cm9wZS1wYTAyLkI0OTk1QjY4QjNDN0EyRDRDRTJDMzQ4QThBNTM4RkJCREM1QUUwMjlBODczRUVERUI0RjczRDYyQzdGQzdFRkEuODJkNmY2ZmQtYjBjNC00ODUzLThkZWYtN2Q3ZWY4ZDJlNGQz",
    "forceReconnect": false,
    "workflowInputTypes": [
      "AugLoop_Core_GridCell",
      "AugLoop_Core_Document",
      "AugLoop_Automatic_Clp_SensitiveItemAnnotation",
      "AugLoop_Image_ImageTestTile",
      "AugLoop_Image_ImageTile",
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
      "AugLoop_TeamsRoomsAi_AgentSignal",
      "AugLoop_TeamsRoomsAi_GenerateContentSignal",
      "AugLoop_TeamsRoomsAi_GenerateTextSignal",
      "AugLoop_TeamsGroupCopilot_SchedulingSignal",
      "AugLoop_ContentSummary_ContentSummarySignal",
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
      "AugLoop_ContentExtensions_UserSearchSignal",
      "AugLoop_ContentExtensions_UserDownloadSignal",
      "AugLoop_ContentExtensions_UserProfileSignal",
      "AugLoop_ContentExtensions_UserAccountDisconnectSignal",
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
      "AugLoop_Core_Session",
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
      "AugLoop_GetDocumentContext_GetDocumentContextSignal",
      "AugLoop_OnenoteCopilot_OneNotePageChangeSignal",
      "AugLoop_RichContent_BotSpeakDocParserAnnotation",
      "AugLoop_RichContent_PowerPointSlideImages",
      "AugLoop_IntelligentOdataGenerator_IntelligentOdataGeneratorSignal",
      "AugLoop_LoopAppCopilot_LoopAppCopilotInputSignal",
      "AugLoop_LoopAppCopilot_LoopAppCopilotProgramResponseSignal",
      "AugLoop_LoopAppCopilot_LoopAppCopilotSessionDumpRequest",
      "AugLoop_LoopCopilot_MarkdownPageContentResponse",
      "AugLoop_LoopCopilot_LoopCopilotRequest",
      "AugLoop_LoopCopilot_MarkdownPageContentRequest",
      "AugLoop_LoopCopilot_JSONTilesPageContentRequest",
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
      "AugLoop_CameraTranscript_CameraTranscriptSignalV2",
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
    "anonymousToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNjYmI0MzdkYjE1NzQzNWM5MjZhZGI4NTg0MWI5MjI4In0.eyJhcHBpZCI6IjQzNTRlMjI1LTUwYzktNDQyMy05ZWNlLTJkNWFmZDkwNDg3MCIsImlzcyI6Imh0dHBzOi8vYXVnbG9vcC5vZmZpY2UuY29tL2Fub255bW91c1Rva2VuIiwiYXVkIjoiaHR0cHM6Ly9hdWdsb29wLm9mZmljZS5jb20vYW5vbnltb3VzVG9rZW4iLCJpYXQiOjE3NjIzNzY1MDUsIm5iZiI6MTc2MjM3NjIwNSwiZXhwIjoxNzYyNDYyOTA1LCJvaWQiOiIwdDlPSFMydHMvbTZGK0xHNE5XTFloQkg1K2NWZ29GRCtQOFlRcjU5YTJBPSIsInNpZCI6IjgyZDZmNmZkLWIwYzQtNDg1My04ZGVmLTdkN2VmOGQyZTRkMyJ9.feViJ3pMaKnT2yHWg6aGc9LozGhdz5DjfLqCauwbms3cmF7RroWGYepmGXhR04ZQU615OBk2G1fiqEuL1829VCIC4XtNGq_OfN4F__DDFc8dtwXzrlnsT3JgeYEQumfXRtkBSQyZG16piEkN6ZbVg1I0JnqkvvOC1cd6up9bU2lJudJ0yQecjP8sAln8zBRfRGoF8E9RiT1ccrMKQMWpcwkcPx2Emtt5ExBK8uESr2KQIql_KT6t8VkWd6jeFZWCRsCu2vCtxndfnFgblT3Y3XP2_ZbXd20ZT9_g3O32LuuNkisueHn47N2zd6L23nrII27nNznVpLUerWH0phY-uQ",
    "tokenExpirationTime": 1762462905,
    "tokenExpirationSeconds": 86399,
    "maxRPS": 250,
    "maxBPS": 1000000000
  }
  ```
- send:
  ```json
  {
    "cv": "kCKLfqKBfHeBxhLdp8tI9l",
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
- send:
  ```json
  {
    "authToken": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiV3pjXzBSSHBXN2dfUnJsemtjSWY4MGg4NGhCXy1wY0FwUGh2aWVlYzVzUSIsInhtc19oZF91dGkiOiJnZjYwRVR5amdrLUFLRlZ3eDZvYkFBIiwieG1zX2hkX2lhdCI6IjE3NjIzNzYxODQifQ..9MgX2ZgBnTMTUbiEawarog.f0QDQdD-rRMQPpFyOdj2QhFMByEE--BTE1LuJEJZTtGS9SdmmZR8yLf-R9zrDpz2SCGt_BUaIhBGUbxRXD6is7xS6e-GizHmjl8Xz7O0jS7SS6QJl-meo63z0WKlU0pRX3PIOW8aqdlmqNh6UlE-lbT9zqUfZVeNaAA1UT5WdilUkn200BmjIY9t5pEmjUIeabo1MwKReTwvMm2xaDnS5_R4SkcPcHi6snu6WK8o1S_YTueMModS29_b3KcxjxE25Ac2_xGCgUOKRPTiA0wodu0AJ07D0Y4IOeKwH2x5udn2fBFnaFDbo7Z2I7JQOrR6LwVIjWA6gnxj6MN0fjolyIqP8SMGETTPHYFZwMAwtbj-6xiPdTZnu43PoWwDaP-zkNxl4JNAn0Cu7IgCN_T5zeiw7Ell_FsuOQEavy3uxnhwN1fdXDPEbHS-YQGP5MRHfBPOqyUIqV8OBc6R3C4-KWb2uifAmv1-621vOMwsWrjJgjaT7iRU4fvziH5vcm6yVQ2Kk4RVCIYoIeIDsoqhumQ32HapCDyNJ492JXq6f8xp9_IfDIIJiMnHZiUjyQlHCam09PZJkZCEW07s7FAC3TXGUwItUY_QoGiqRNkcjU6O1zl7CJcIgWGbrLAFr-7yoGtJ2KG-vkXyVM4EmlVvE0IBmFHQK3VY2zsqXownsJRAKhf7VhKOEf99cTWbht3yDnXGXZom-zB22mrxA4Vj2-0LHxMLv9d_BmHn-gl9l_pZ9sf-G8RlJlA6yaDSy9YhnbY9oUiNaBzMyEH6WKixrXw7mUjzy1ZwQ5YHRmfmjO1DoYUtcc8ehVGFZQw-JPPPwgMvwCyXHqVyfNBtA794B5HbJA0LpXaFdtkXg0K0zKGWME8_-322hIx82M3Wf0goD0lmFQWdk7WgfzdAj4I0SfuP15Oa0_VnXrGqi7ltB6gshOPfvABjsZnUw4BG2QQAOI50wXL3WYEyEbw91KCFx0hbL7yhVerukwbd11_tb_y4YPqv_ld0wMvJw2QkEkGRpfWmRTPvPSw_2yoRKy7mSaiu2KFQSl-Bua9wIiFkIFtV-JmoUN5QrF-7JtFKacsiqN0twb4KWz9kc2USlMYimrjYrMk3VPCTsx1D2-4R9OY40DNJhjmX2o0Qt56VZVqUI_Tz7Enpq4KiFOIAL3z9QFHKNCoNCXUmtX17x4rm-9FYjPn5_wQCH-9wU7H2eMRZtwDfkYt3t-argbBLEziLiYlNjSbYpZk0EZuY0b19t7OW1SvTd-2bntaX7m7B5zY_Fwq_hgmTkSmiFvlcOhG5uBXls9LdHObQpk3fMuqLIfiCSUfkd_WwEVCKNG93BU6cIzyyqNipIuqNSA9zvrpmtuLqp3iCpdq0ufc-yoGKSH1Y2hRt7D3nMnOm5cno1Z3LqgchMYr9MIzqOMarB45AdQ2HhdltLiBOJqiG7erOhk_yTSSNQ7VDuca4Ng6mJcavOed1oaBpW_69JLFChf1r0TAzfyK5eljzaH7HQoJik8X5sxVABAOUizdHPzUFm7bCP9UipHYsRdpChYayhSOP9A-nu6GcVjiiq3Q7P3yvX6NFYHQulqLdqh5JZ1zkHf8iFDMh9CjzP7gEpCkNKKASmBME-W9sJi3x2i7-UAL9RBlNFan_8Y1kkAA4pdlRnyBdO4mZr-SbhW6U9vLeFAfmaTyrct18cVAPAIpYI_vCSqcwPsxdnSplaw9vMlOJbhb0s0nVTcjL2dog_u6vfO3fwOsPCv32RpcZW0L6RKpgxJEepyxVcoHgjAAqrvmhGKWQbiIU5TZGQPO_2I1AzOucAx4AVu4NyMogjon7N9S3qLEZP3H52n-agNNoAHlINFreUnGCiGXN0BK2SOJCEOxyr2R3HTF0fvKY19KaIATK6k7nV2gMEmQ5yCWIi_tOKfYbB7VQzSXXMdts8R4JxtTzipq3XNsl1wDGD7zF2nKKDLiUiFmNMn0yyjX4fePZlqBHA5_u4SM8QYm2fxPFWBX9K5AUn1DHytBFdz7gERnqAc6RkUirgj0KloPaq5bDqqKoB8TiomXWKlgjxuEUKwr7bpPSdh9rUJPeyVVpXaPEjjV9KdAfVbmCTOk6s7HCE2IVVbFNAHce4sFrkMfvBbZRPwtrU0Il7ooDNimuE5QxEjK2T0KV4kPbh80SQVlATcmyN2G0spTnSdk3UVaukf8rPAE6jQZJnAZz0GuwEPS8fGHD8dW38Rh2verCYCfOvyoR6kQjtQmeQqCXGmMeDo8G1KLx9EiAtFgGT67_2YyBXqNhgOMMtPJqS8F8UX_2cFIAQyKWhisSqz7efSl0cIzjpkrcplbAb9xxg17M1aXhyfIMtdNkkd6TsdZSB-_IbHyd3RO3QZvnuEY5rymXdRmyyQUStJEPlyR_YkIMuVOseib-kSvljcIruTBHLUyyTMHGjRWNBR44DRxjdMbNF1GVSLAaL7UYCX4xJf2DLU10JXmqH08lJ4tDLK-vhgrtkzqI7IAk2w34NRyOdRHGXvPeOcgQdnEHiWzWY15YrqKSA75DY8Rs9PeSf3MiTXrYZJQGlm5bXJzxLdRxH_9O1fltPkS6P611gRAJaqcs87VlmNo.7TU9LyHPLbfES8ORF4z1Um9XzIeKX5myUYE2qyEPSY0",
    "version": 1,
    "H_": {
      "T_": "AugLoop_Session_Protocol_TokenProvisionMessage",
      "B_": [
        "AugLoop_Session_Protocol_Message"
      ]
    },
    "cv": "sXcDpnVcMb6XKXDvZGsrue.2",
    "messageId": "c3"
  }
  ```
- receive:
  ```json
  {
    "tokenExpirationTime": 1762381873,
    "tokenExpirationSeconds": 5366,
    "tokenType": 1,
    "H_": {
      "T_": "AugLoop_Session_Protocol_TokenProvisionResponse",
      "B_": [
        "AugLoop_Session_Protocol_Response"
      ]
    },
    "messageId": "c3"
  }
  ```
- send: `~`
- receive: `~`

### Socket 3: `wss://pub-ent-euno-10-t.trouter.teams.microsoft.com/v4/c`

Query string parameters:
- `tc`=
  ```json
  {
    "cv": "2025.40.01.1",
    "ua": "TeamsCDL",
    "hr": "",
    "v": "1415/25101616509"
  }
  ```
- `timeout`=`40`
- `epid`=`611e9e3d-02e3-46dd-a329-e9f52b211c54`
- `ccid`=
- `cor_id`=`3d4007dd-2b7e-454a-ac1a-870621e9235b`
- `con_num`=`1762376505370_0`

The following messages occurred in that session:
- receive: `1::`
- send: `5:::`
  ```json
  {
    "name": "user.authenticate",
    "args": [
      {
        "headers": {
          "X-Ms-Test-User": "False",
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJub25jZSI6Ild3YmRpYWREdFFXQjlWRUJrSUpoQlhQSW43MElXOFVUQWtxXzFVSE5DSjAiLCJhbGciOiJSUzI1NiIsIng1dCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSIsImtpZCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSJ9.eyJhdWQiOiJodHRwczovL2ljMy50ZWFtcy5vZmZpY2UuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4LyIsImlhdCI6MTc2MjM2MjQ5MCwibmJmIjoxNzYyMzYyNDkwLCJleHAiOjE3NjI0NDkxOTAsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBVVFBdS84YUFBQUEyVXNOSktlU3EzY1QwVnQxbkFDT3I1SHk5SlJESkNEdG8zMEVVNzgvcyswMm5waTZ3Z2cxbXFsL2xVbEhxWUZSUnF4L1JrQmRuZFFTUnRuaTFOSHIxUT09IiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjVlM2NlNmMwLTJiMWYtNDI4NS04ZDRiLTc1ZWU3ODc4NzM0NiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiUmFzaGJyb29rIiwiZ2l2ZW5fbmFtZSI6Ik5laWwiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI4Mi4xOS45Ljg4IiwibmFtZSI6Ik5laWwgUmFzaGJyb29rIiwib2lkIjoiMWM1OTU4ZDUtZTQwYS00YTM1LWEwZTMtN2ViNjUxNzkwOTZmIiwicHVpZCI6IjEwMDMyMDAwODdEN0ZDMDAiLCJyaCI6IjEuQVRvQTZPZU5Nd3F4ZkVxdXRFemZjbV9JR0ZUd3FqbWxnY2RJcFBnQ2t3RWdsYm5oQUo0NkFBLiIsInNjcCI6IlRlYW1zLkFjY2Vzc0FzVXNlci5BbGwiLCJzaWQiOiIwMDlkMGIzOS1jNThlLTMyYjYtYWYxOC1jMTc4NTYwZDFlNGMiLCJzdWIiOiJHdFdEbl9tY05lVm16akdwT3E4VTFsNFV2czFlZTZSNmR2ZURtaVJnX3dBIiwidGlkIjoiMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4IiwidW5pcXVlX25hbWUiOiJuZWlsQGJlb25leC5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJuZWlsQGJlb25leC5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJTc1lub1JpUURrdUQ0cTZiVktJbUFBIiwidmVyIjoiMS4wIiwieG1zX2FjdF9mY3QiOiIzIDUiLCJ4bXNfY2MiOlsiQ1AxIl0sInhtc19mdGQiOiJVWlBiZHk1SXhMdFNrZENXN2J0Ty1rcC1hOFVyTkE4NkhYX0VuN1JpV0cwQlpYVnliM0JsYm05eWRHZ3RaSE50Y3ciLCJ4bXNfaWRyZWwiOiIxIDEwIiwieG1zX3NzbSI6IjEiLCJ4bXNfc3ViX2ZjdCI6IjE2IDMifQ.piHavf2sfk2SyDJIrlYXuiNoHnomxIB1yWY9uTsFTHKJ3sqQlIniiqL0RO10phisTPp18cM35_9JKxRr-_6zE56TNl_lrYjkPYCz0iZns7AofMTk8jinUIk9cX_zvf3v0ga3mW8NYN4rjQ8zvhel3eQeszSGB07Gwv3ud7EIG6uUEzviUmuMgguCpp2o8V68Z4WjUot9QMAXzT0z0T8B1Y3l3_MA6EXRLrHmM_RynEn-46ZRKPaSgYBUuH32oTK_aFJ78nBg2BXN-dLeiHhVOhFx3x9niU9pdoilZ0VXhRr1jgCOfAkWj-XTpAancRzMXELb2r-gUMODhJkQFgZ71g",
          "X-MS-Migration": "True"
        },
        "connectparams": {
          "issuer": "",
          "scae": "1",
          "sig": "",
          "sr": "KGvsr_12N0m_nkkDXbF8Hw",
          "sp": "pub-ent-euno-10",
          "se": "1762747299302",
          "st": "1762190292302"
        }
      }
    ]
  }
  ```
- receive: `5:1::`
  ```json
  {
    "name": "trouter.connected",
    "args": [
      {
        "id": "KGvsr_12N0m_nkkDXbF8Hw",
        "ccid": "_nkkDXbF8Hw",
        "url": "https://pub-ent-euno-10-f.trouter.teams.microsoft.com:8443/v4/f/KGvsr_12N0m_nkkDXbF8Hw/",
        "surl": "https://pub-ent-euno-10-f.trouter.teams.microsoft.com:3443/v4/f/KGvsr_12N0m_nkkDXbF8Hw/",
        "curlb": "https://pub-ent-euno-10-t.trouter.teams.microsoft.com:443",
        "healthUrl": "https://pub-ent-euno-10-t.trouter.teams.microsoft.com:443/v4/h",
        "reconnectUrl": "wss://pub-ent-euno-10-t.trouter.teams.microsoft.com:443/v4/c",
        "registrarUrl": "https://teams.microsoft.com/registrar/prod/V3/registrations",
        "socketio": "https://pub-ent-euno-10-t.trouter.teams.microsoft.com:443/",
        "ttl": "370791",
        "dur": "1",
        "connectparams": {
          "issuer": "",
          "scae": "1",
          "sig": "",
          "sr": "KGvsr_12N0m_nkkDXbF8Hw",
          "sp": "pub-ent-euno-10",
          "se": "1762747299302",
          "st": "1762190292302"
        }
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
        "cv": "R1gpbU3B919FIPMuCGjOTg.0.1"
      }
    ]
  }
  ```
- receive: `6:::1+`
  ```json
  []
  ```
- receive: `3:::`
  ```json
  {
    "id": 364678446,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "285",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "69cdcc0e-f612-4a64-ae2f-46206ec04b4c",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-ba16f77920fd0a23626974c9e81e3bc6-722dd822efdc9e6b-00",
      "MS-CV": "Bte9krVHv0yyVhbtqPdFfA.1",
      "trouter-request": "{\"id\":\"13ef8651-baf7-4a43-98ad-4a1b4fc9f9c3\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "Trouter-TimeoutMs": "117549",
      "Trouter-Timeout": "117049"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184539708\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"deviceType\":\"Web\"}}],\"isSnapshot\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184539708",
          "source": "ups",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "deviceType": "Web"
          }
        }
      ],
      "isSnapshot": true
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 364678446,
    "status": 200,
    "headers": {
      "MS-CV": "Bte9krVHv0yyVhbtqPdFfA.1.0",
      "trouter-request": "{\"id\":\"13ef8651-baf7-4a43-98ad-4a1b4fc9f9c3\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "trouter-client": "{\"cd\":8}"
    },
    "body": ""
  }
  ```
- send: `5:2+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::2+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 364680451,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "285",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "453b9cb5-16c6-4427-98e4-2d79185fff24",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-b3ccdd13602b6ad541c50930e901b48a-f273f5abd9271a9e-00",
      "MS-CV": "NKVQ3T5Yuka5rh75ef8HmQ.1",
      "trouter-request": "{\"id\":\"4a5424e3-31da-405b-b254-3f767269bf11\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184539714\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"deviceType\":\"Web\"}}],\"isSnapshot\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184539714",
          "source": "ups",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "deviceType": "Web"
          }
        }
      ],
      "isSnapshot": true
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 364680451,
    "status": 200,
    "headers": {
      "MS-CV": "NKVQ3T5Yuka5rh75ef8HmQ.1.0",
      "trouter-request": "{\"id\":\"4a5424e3-31da-405b-b254-3f767269bf11\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "trouter-client": "{\"cd\":3}"
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
    "id": 555477125,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "569",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "ff6c8679-c014-426f-a18c-2b65d5c24951",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-54b34d41b2732ff1068923ee54aa7849-3cc619732a2fa8f2-00",
      "MS-CV": "+vyrDrq7WUiHZSCxjDoX6Q.1",
      "trouter-request": "{\"id\":\"80cbfdb3-9648-4d50-93ca-102277e93e1f\",\"src\":\"10.128.132.210\",\"port\":3443}",
      "Trouter-TimeoutMs": "117546",
      "Trouter-Timeout": "117046"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184539714\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"deviceType\":\"Web\"}},{\"mri\":\"8:orgid:dee1afdb-9ece-4498-a506-15c6b484ac6b\",\"etag\":\"A0184539420\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Offline\",\"activity\":\"Offline\",\"lastActiveTime\":\"2024-05-07T15:23:52.017Z\"}}],\"isSnapshot\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184539714",
          "source": "ups",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "deviceType": "Web"
          }
        },
        {
          "mri": "8:orgid:dee1afdb-9ece-4498-a506-15c6b484ac6b",
          "etag": "A0184539420",
          "source": "ups",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Offline",
            "activity": "Offline",
            "lastActiveTime": "2024-05-07T15:23:52.017Z"
          }
        }
      ],
      "isSnapshot": true
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 555477125,
    "status": 200,
    "headers": {
      "MS-CV": "+vyrDrq7WUiHZSCxjDoX6Q.1.0",
      "trouter-request": "{\"id\":\"80cbfdb3-9648-4d50-93ca-102277e93e1f\",\"src\":\"10.128.132.210\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
    "id": 364681239,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "316",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "963bd1d1-18a2-4c56-8803-d5849d5e45b4",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-2d1efa472f88824d97e80810ef483bab-b0484d9494a832a5-00",
      "MS-CV": "93TaYwbRCkS3b4qGf46gmg.1",
      "trouter-request": "{\"id\":\"9745402b-835f-4b27-b25d-c6fdef8c35df\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:dee1afdb-9ece-4498-a506-15c6b484ac6b\",\"etag\":\"A0184539421\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Offline\",\"activity\":\"Offline\",\"lastActiveTime\":\"2024-05-07T15:23:52.017Z\"}}],\"isSnapshot\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184539714",
          "source": "ups",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "deviceType": "Web"
          }
        },
        {
          "mri": "8:orgid:dee1afdb-9ece-4498-a506-15c6b484ac6b",
          "etag": "A0184539420",
          "source": "ups",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Offline",
            "activity": "Offline",
            "lastActiveTime": "2024-05-07T15:23:52.017Z"
          }
        }
      ],
      "isSnapshot": true
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 364681239,
    "status": 200,
    "headers": {
      "MS-CV": "93TaYwbRCkS3b4qGf46gmg.1.0",
      "trouter-request": "{\"id\":\"9745402b-835f-4b27-b25d-c6fdef8c35df\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
- receive: `6:::5+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 555477645,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "295",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "15d684ab-cc2b-486f-8211-d99cb59dc770",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-ce8a7476c579a945f3b6c06ee7a7a90d-74bfd0b083b265c8-00",
      "MS-CV": "LKPEDXU1TESIj1H9qkpTwg.1",
      "trouter-request": "{\"id\":\"4b41e284-1083-41ae-a4af-983d4b4d3a3c\",\"src\":\"10.128.132.210\",\"port\":3443}",
      "Trouter-TimeoutMs": "117547",
      "Trouter-Timeout": "117047"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184539709\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"deviceType\":\"Web\"}}],\"isSnapshot\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184539709",
          "source": "ups",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "deviceType": "Web"
          }
        }
      ],
      "isSnapshot": true
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 555477645,
    "status": 200,
    "headers": {
      "MS-CV": "LKPEDXU1TESIj1H9qkpTwg.1.0",
      "trouter-request": "{\"id\":\"4b41e284-1083-41ae-a4af-983d4b4d3a3c\",\"src\":\"10.128.132.210\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
    "id": -2136353650,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "293",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "88f762bd-9577-47a4-85d3-b400f6fb32ad",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-79447d2672adc8c0d6206bff819c961f-c3cb900fe9760f7a-00",
      "MS-CV": "drMOf0Dy60mjniXy64TW0Q.1",
      "trouter-request": "{\"id\":\"ec95534d-a1c8-44ee-93f0-d36805fc8887\",\"src\":\"10.128.69.143\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184539783\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Busy\",\"activity\":\"InACall\",\"lastActiveTime\":\"2025-11-05T21:01:53.7358636Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184539783",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Busy",
            "activity": "InACall",
            "lastActiveTime": "2025-11-05T21:01:53.7358636Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2136353650,
    "status": 200,
    "headers": {
      "MS-CV": "drMOf0Dy60mjniXy64TW0Q.1.0",
      "trouter-request": "{\"id\":\"ec95534d-a1c8-44ee-93f0-d36805fc8887\",\"src\":\"10.128.69.143\",\"port\":3443}",
      "trouter-client": "{\"cd\":3}"
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
- receive: `3:::`
  ```json
  {
    "id": 555495295,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "293",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "88f762bd-9577-47a4-85d3-b400f6fb32ad",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-79447d2672adc8c0d6206bff819c961f-59a18ededeca04ae-00",
      "MS-CV": "R/BFqnPAjkWyWWVy/ktYiA.1",
      "trouter-request": "{\"id\":\"a5a75e66-0801-4812-b3cf-3eee8ed23701\",\"src\":\"10.128.132.210\",\"port\":3443}",
      "Trouter-TimeoutMs": "117547",
      "Trouter-Timeout": "117047"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184539783\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Busy\",\"activity\":\"InACall\",\"lastActiveTime\":\"2025-11-05T21:01:53.7358636Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184539783",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Busy",
            "activity": "InACall",
            "lastActiveTime": "2025-11-05T21:01:53.7358636Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 555495295,
    "status": 200,
    "headers": {
      "MS-CV": "R/BFqnPAjkWyWWVy/ktYiA.1.0",
      "trouter-request": "{\"id\":\"a5a75e66-0801-4812-b3cf-3eee8ed23701\",\"src\":\"10.128.132.210\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
  }
  ```
- receive: `3:::`
  ```json
  {
    "id": 128473758,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "297",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "c8360919-2588-4411-8c5c-7f42ac10a09d",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-c99a8e1a3f7bb57f892621ec3d7a9bc9-0c766c6685f9d81e-00",
      "MS-CV": "EvT83Nuj9kO3aE7vK9Y78Q.1",
      "trouter-request": "{\"id\":\"508a24bd-2cd2-4a46-8598-d6f1a23a9c64\",\"src\":\"10.128.16.205\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184539783\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Busy\",\"activity\":\"InACall\",\"lastActiveTime\":\"2025-11-05T21:01:49.3Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184539783",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Busy",
            "activity": "InACall",
            "lastActiveTime": "2025-11-05T21:01:49.3Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 128473758,
    "status": 200,
    "headers": {
      "MS-CV": "EvT83Nuj9kO3aE7vK9Y78Q.1.0",
      "trouter-request": "{\"id\":\"508a24bd-2cd2-4a46-8598-d6f1a23a9c64\",\"src\":\"10.128.16.205\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
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
    "id": 364705010,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "304",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "7938a659-fc34-4696-8982-3bb474b53193",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-12405ba75f74255d91a2d7a29356b6ef-0288fff97b255ad2-00",
      "MS-CV": "0Oj1HaB3R0+WpnVQ5GtQYg.1",
      "trouter-request": "{\"id\":\"74735014-e093-42cc-ba41-83c9c1852616\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184539814\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"lastActiveTime\":\"2025-11-05T21:01:49.3Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184539814",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "lastActiveTime": "2025-11-05T21:01:49.3Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 364705010,
    "status": 200,
    "headers": {
      "MS-CV": "0Oj1HaB3R0+WpnVQ5GtQYg.1.0",
      "trouter-request": "{\"id\":\"74735014-e093-42cc-ba41-83c9c1852616\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
    "id": 1783066344,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "300",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "e977d071-a030-454e-b8d8-dc04c9d97f47",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-0e8407b59442184fa30d20dd3c9a1cbb-f5b222cadf1ade9c-00",
      "MS-CV": "eEEvHV+kW0a9Z6cP2raARA.1",
      "trouter-request": "{\"id\":\"5063ebef-6166-4e3f-b8cc-fc0846e0da03\",\"src\":\"10.128.132.203\",\"port\":3443}",
      "Trouter-TimeoutMs": "117547",
      "Trouter-Timeout": "117047"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184539814\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"lastActiveTime\":\"2025-11-05T21:01:53.7358636Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184539814",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "lastActiveTime": "2025-11-05T21:01:53.7358636Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1783066344,
    "status": 200,
    "headers": {
      "MS-CV": "eEEvHV+kW0a9Z6cP2raARA.1.0",
      "trouter-request": "{\"id\":\"5063ebef-6166-4e3f-b8cc-fc0846e0da03\",\"src\":\"10.128.132.203\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
    "id": 659063905,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "300",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "e977d071-a030-454e-b8d8-dc04c9d97f47",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-0e8407b59442184fa30d20dd3c9a1cbb-a3ed918cbd8f7667-00",
      "MS-CV": "HHVmen2dIE23+BBPT10OKg.1",
      "trouter-request": "{\"id\":\"e8a62877-74ac-4002-9a8b-7dc6ad0af03f\",\"src\":\"10.128.69.238\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184539814\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"lastActiveTime\":\"2025-11-05T21:01:53.7358636Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184539814",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "lastActiveTime": "2025-11-05T21:01:53.7358636Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 659063905,
    "status": 200,
    "headers": {
      "MS-CV": "HHVmen2dIE23+BBPT10OKg.1.0",
      "trouter-request": "{\"id\":\"e8a62877-74ac-4002-9a8b-7dc6ad0af03f\",\"src\":\"10.128.69.238\",\"port\":3443}",
      "trouter-client": "{\"cd\":0}"
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
    "id": 1224195249,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/messaging",
    "headers": {
      "Accept-Encoding": "gzip, deflate, br",
      "Trouter-Timeout": "117047",
      "Content-Length": "2113",
      "Content-Type": "text/xml",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Skype-NotificationHub/1.0.0-25.10.20.5+f73f4508532262cd54b9eb7227f71b69e72ee2b2 (West Europe)",
      "X-Trouter-Delivery-Control": "async; ttl=900; flow=messaging; prio=normal",
      "X-Microsoft-Skype-Message-ID": "43170dac-032f-43b2-a8a7-f6f3bbb28435",
      "MS-CV": "K8fsw/2n+kG5ZqhsL+eilA.1.1.1.784907435.1.1.0.1.1",
      "traceparent": "00-47e13825abb6704b6929a887b1cd5d20-70d574d11459965e-00",
      "trouter-request": "{\"id\":\"32f39652-3a60-40d5-93a8-5d78708faf7f\",\"src\":\"10.128.113.63\",\"port\":3443}",
      "Trouter-TimeoutMs": "117547"
    },
    "body": "{\"time\":\"2025-11-05T21:03:34.2629858Z\",\"type\":\"EventMessage\",\"resourceLink\":\"https://notifications.skype.net/v1/users/ME/conversations/48:calllogs/messages/1762376614222\",\"resourceType\":\"NewMessage\",\"resource\":{\"clientmessageid\":\"1762376614149\",\"content\":\"Call Logs for Call f7ed8804-8499-4585-9694-188139bd6d7f\",\"from\":\"https://notifications.skype.net/v1/users/ME/contacts/8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"imdisplayname\":\"\",\"prioritizeimdisplayname\":null,\"id\":\"1762376614222\",\"messagetype\":\"Text\",\"originalarrivaltime\":\"2025-11-05T21:03:34.2220000Z\",\"properties\":{\"call-log\":\"{\\\"startTime\\\":\\\"2025-11-05T21:02:48.4412415Z\\\",\\\"connectTime\\\":\\\"2025-11-05T21:03:02.3683724Z\\\",\\\"endTime\\\":\\\"2025-11-05T21:03:34.0156867Z\\\",\\\"callDirection\\\":\\\"incoming\\\",\\\"callType\\\":\\\"twoParty\\\",\\\"callState\\\":\\\"accepted\\\",\\\"userParticipantId\\\":\\\"33bae49a-c7bf-4fe6-bffb-d5fca1a50af5\\\",\\\"originator\\\":\\\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"target\\\":\\\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\\\",\\\"originatorParticipant\\\":{\\\"id\\\":\\\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"type\\\":\\\"default\\\",\\\"displayName\\\":\\\"Ben Bucksch\\\",\\\"applicationType\\\":null,\\\"alternateId\\\":null},\\\"targetParticipant\\\":{\\\"id\\\":\\\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\\\",\\\"type\\\":\\\"default\\\",\\\"displayName\\\":null,\\\"applicationType\\\":null,\\\"alternateId\\\":null},\\\"callId\\\":\\\"f7ed8804-8499-4585-9694-188139bd6d7f\\\",\\\"callAttributes\\\":null,\\\"forwardingInfo\\\":null,\\\"transferInfo\\\":null,\\\"participants\\\":null,\\\"participantList\\\":null,\\\"threadId\\\":null,\\\"sessionType\\\":\\\"default\\\",\\\"sharedCorrelationId\\\":\\\"08023d99-9288-46de-80b9-f96610eaaee8\\\",\\\"messageId\\\":null}\",\"s2spartnername\":\"concore_gvc\",\"languageStamp\":\"languages=en:100;nl:82;de:78;length:55;&detector=Bling\",\"importance\":\"\",\"subject\":\"\"},\"sequenceId\":113,\"version\":\"1762376614222\",\"composetime\":\"2025-11-05T21:03:34.2220000Z\",\"type\":\"Message\",\"conversationLink\":\"https://notifications.skype.net/v1/users/ME/conversations/48:calllogs\",\"to\":\"48:calllogs\",\"contenttype\":\"text\",\"threadtype\":\"streamofcalllogs\",\"isactive\":false,\"inQuarantine\":false},\"isactive\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "time": "2025-11-05T21:03:34.2629858Z",
      "type": "EventMessage",
      "resourceLink": "https://notifications.skype.net/v1/users/ME/conversations/48:calllogs/messages/1762376614222",
      "resourceType": "NewMessage",
      "resource": {
        "clientmessageid": "1762376614149",
        "content": "Call Logs for Call f7ed8804-8499-4585-9694-188139bd6d7f",
        "from": "https://notifications.skype.net/v1/users/ME/contacts/8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "imdisplayname": "",
        "prioritizeimdisplayname": null,
        "id": "1762376614222",
        "messagetype": "Text",
        "originalarrivaltime": "2025-11-05T21:03:34.2220000Z",
        "properties": {
          "call-log": "{\"startTime\":\"2025-11-05T21:02:48.4412415Z\",\"connectTime\":\"2025-11-05T21:03:02.3683724Z\",\"endTime\":\"2025-11-05T21:03:34.0156867Z\",\"callDirection\":\"incoming\",\"callType\":\"twoParty\",\"callState\":\"accepted\",\"userParticipantId\":\"33bae49a-c7bf-4fe6-bffb-d5fca1a50af5\",\"originator\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"target\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"originatorParticipant\":{\"id\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"type\":\"default\",\"displayName\":\"Ben Bucksch\",\"applicationType\":null,\"alternateId\":null},\"targetParticipant\":{\"id\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"type\":\"default\",\"displayName\":null,\"applicationType\":null,\"alternateId\":null},\"callId\":\"f7ed8804-8499-4585-9694-188139bd6d7f\",\"callAttributes\":null,\"forwardingInfo\":null,\"transferInfo\":null,\"participants\":null,\"participantList\":null,\"threadId\":null,\"sessionType\":\"default\",\"sharedCorrelationId\":\"08023d99-9288-46de-80b9-f96610eaaee8\",\"messageId\":null}",
          "s2spartnername": "concore_gvc",
          "languageStamp": "languages=en:100;nl:82;de:78;length:55;&detector=Bling",
          "importance": "",
          "subject": ""
        },
        "sequenceId": 113,
        "version": "1762376614222",
        "composetime": "2025-11-05T21:03:34.2220000Z",
        "type": "Message",
        "conversationLink": "https://notifications.skype.net/v1/users/ME/conversations/48:calllogs",
        "to": "48:calllogs",
        "contenttype": "text",
        "threadtype": "streamofcalllogs",
        "isactive": false,
        "inQuarantine": false
      },
      "isactive": true
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1224195249,
    "status": 200,
    "headers": {
      "MS-CV": "K8fsw/2n+kG5ZqhsL+eilA.1.1.1.784907435.1.1.0.1.1.0",
      "trouter-request": "{\"id\":\"32f39652-3a60-40d5-93a8-5d78708faf7f\",\"src\":\"10.128.113.63\",\"port\":3443}",
      "trouter-client": "{\"cd\":5}"
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
- send: `5:20+::`
  ```json
  {
    "name": "ping"
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
    "id": 807011463,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "296",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "7krz42crTjf1C4G8AJNbAw.0.1.2.0",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-b94012ab207ee2ff016828cdb2eb2fa1-c233798835d919ff-00",
      "MS-CV": "Kw8fvo7CzkOX2XxJrBmppw.1",
      "trouter-request": "{\"id\":\"e79c2f1d-a111-4f96-9c82-c6a3c98e4c79\",\"src\":\"10.128.86.3\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184540119\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Away\",\"activity\":\"Away\",\"lastActiveTime\":\"2025-11-05T21:08:38.492Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184540119",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Away",
            "activity": "Away",
            "lastActiveTime": "2025-11-05T21:08:38.492Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 807011463,
    "status": 200,
    "headers": {
      "MS-CV": "Kw8fvo7CzkOX2XxJrBmppw.1.0",
      "trouter-request": "{\"id\":\"e79c2f1d-a111-4f96-9c82-c6a3c98e4c79\",\"src\":\"10.128.86.3\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
- send: `5:22+::`
  ```json
  {
    "name": "user.activity",
    "args": [
      {
        "state": "inactive",
        "cv": "39nvJ6bAAfTC+jyCuGITcg.0.1"
      }
    ]
  }
  ```
- receive: `6:::22+`
  ```json
  []
  ```
- receive: `3:::`
  ```json
  {
    "id": 1444683084,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "286",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "39nvJ6bAAfTC+jyCuGITcg.0.1.2.0",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-05034bb4b952c5342caddff918c87ad2-0fc87150c6ccf9ae-01",
      "MS-CV": "B+WBJ7ZjdkKBKvIK58/aSg.1",
      "trouter-request": "{\"id\":\"92a3cc77-8ef5-4598-bcd2-a01ae1ba0898\",\"src\":\"10.128.93.27\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184540122\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Away\",\"activity\":\"Away\",\"lastActiveTime\":\"2025-11-05T21:08:41.558Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184540122",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Away",
            "activity": "Away",
            "lastActiveTime": "2025-11-05T21:08:41.558Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1444683084,
    "status": 200,
    "headers": {
      "MS-CV": "B+WBJ7ZjdkKBKvIK58/aSg.1.0",
      "trouter-request": "{\"id\":\"92a3cc77-8ef5-4598-bcd2-a01ae1ba0898\",\"src\":\"10.128.93.27\",\"port\":3443}",
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
- receive: `3:::`
  ```json
  {
    "id": 807012163,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "286",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "39nvJ6bAAfTC+jyCuGITcg.0.1.2.0",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-05034bb4b952c5342caddff918c87ad2-fb76862c5e755628-01",
      "MS-CV": "9Azv6NCVWE+2B7Ddw0P76A.1",
      "trouter-request": "{\"id\":\"15c64569-4bb4-42b9-a85b-da6fe135f4c0\",\"src\":\"10.128.86.3\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184540122\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Away\",\"activity\":\"Away\",\"lastActiveTime\":\"2025-11-05T21:08:41.558Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184540122",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Away",
            "activity": "Away",
            "lastActiveTime": "2025-11-05T21:08:41.558Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 807012163,
    "status": 200,
    "headers": {
      "MS-CV": "9Azv6NCVWE+2B7Ddw0P76A.1.0",
      "trouter-request": "{\"id\":\"15c64569-4bb4-42b9-a85b-da6fe135f4c0\",\"src\":\"10.128.86.3\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
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
- send: `5:25+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `6:::25+`
  ```json
  [
    "pong"
  ]
  ```
- receive: `3:::`
  ```json
  {
    "id": 223456446,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "306",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "m5iauC1NWu+ET82revGqhQ.0.1.2.0",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-00aad272ead524bc5cf1903b30f70efe-d3f68aeefb56d5c2-01",
      "MS-CV": "iHv4YIbjWkamOCYw6Dz0lA.1",
      "trouter-request": "{\"id\":\"528973c4-4b45-4dd4-aada-29993658339f\",\"src\":\"10.128.11.178\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184540197\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"lastActiveTime\":\"2025-11-05T21:09:56.883Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184540197",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "lastActiveTime": "2025-11-05T21:09:56.883Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 223456446,
    "status": 200,
    "headers": {
      "MS-CV": "iHv4YIbjWkamOCYw6Dz0lA.1.0",
      "trouter-request": "{\"id\":\"528973c4-4b45-4dd4-aada-29993658339f\",\"src\":\"10.128.11.178\",\"port\":3443}",
      "trouter-client": "{\"cd\":0}"
    },
    "body": ""
  }
  ```

### Socket 4: `wss://go-eu.trouter.teams.microsoft.com/v4/c`

Query string parameters:
- `tc`=
  ```json
  {
    "cv": "2025.40.01.1",
    "ua": "SkypeSpaces",
    "hr": "",
    "v": "0.0.0"
  }
  ```
- `timeout`=`40`
- `epid`=`40d07d64-6763-4353-9f1d-ea5963bbf8af`
- `ccid`=
- `dom`=`teams.microsoft.com`
- `cor_id`=`3d4007dd-2b7e-454a-ac1a-870621e9235b`
- `con_num`=`1762376524741_0`

The following messages occurred in that session:
- receive: `1::`
- send: `5:::`
  ```json
  {
    "name": "user.authenticate",
    "args": [
      {
        "headers": {
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJub25jZSI6Ild3YmRpYWREdFFXQjlWRUJrSUpoQlhQSW43MElXOFVUQWtxXzFVSE5DSjAiLCJhbGciOiJSUzI1NiIsIng1dCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSIsImtpZCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSJ9.eyJhdWQiOiJodHRwczovL2ljMy50ZWFtcy5vZmZpY2UuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4LyIsImlhdCI6MTc2MjM2MjQ5MCwibmJmIjoxNzYyMzYyNDkwLCJleHAiOjE3NjI0NDkxOTAsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBVVFBdS84YUFBQUEyVXNOSktlU3EzY1QwVnQxbkFDT3I1SHk5SlJESkNEdG8zMEVVNzgvcyswMm5waTZ3Z2cxbXFsL2xVbEhxWUZSUnF4L1JrQmRuZFFTUnRuaTFOSHIxUT09IiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjVlM2NlNmMwLTJiMWYtNDI4NS04ZDRiLTc1ZWU3ODc4NzM0NiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiUmFzaGJyb29rIiwiZ2l2ZW5fbmFtZSI6Ik5laWwiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI4Mi4xOS45Ljg4IiwibmFtZSI6Ik5laWwgUmFzaGJyb29rIiwib2lkIjoiMWM1OTU4ZDUtZTQwYS00YTM1LWEwZTMtN2ViNjUxNzkwOTZmIiwicHVpZCI6IjEwMDMyMDAwODdEN0ZDMDAiLCJyaCI6IjEuQVRvQTZPZU5Nd3F4ZkVxdXRFemZjbV9JR0ZUd3FqbWxnY2RJcFBnQ2t3RWdsYm5oQUo0NkFBLiIsInNjcCI6IlRlYW1zLkFjY2Vzc0FzVXNlci5BbGwiLCJzaWQiOiIwMDlkMGIzOS1jNThlLTMyYjYtYWYxOC1jMTc4NTYwZDFlNGMiLCJzdWIiOiJHdFdEbl9tY05lVm16akdwT3E4VTFsNFV2czFlZTZSNmR2ZURtaVJnX3dBIiwidGlkIjoiMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4IiwidW5pcXVlX25hbWUiOiJuZWlsQGJlb25leC5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJuZWlsQGJlb25leC5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJTc1lub1JpUURrdUQ0cTZiVktJbUFBIiwidmVyIjoiMS4wIiwieG1zX2FjdF9mY3QiOiIzIDUiLCJ4bXNfY2MiOlsiQ1AxIl0sInhtc19mdGQiOiJVWlBiZHk1SXhMdFNrZENXN2J0Ty1rcC1hOFVyTkE4NkhYX0VuN1JpV0cwQlpYVnliM0JsYm05eWRHZ3RaSE50Y3ciLCJ4bXNfaWRyZWwiOiIxIDEwIiwieG1zX3NzbSI6IjEiLCJ4bXNfc3ViX2ZjdCI6IjE2IDMifQ.piHavf2sfk2SyDJIrlYXuiNoHnomxIB1yWY9uTsFTHKJ3sqQlIniiqL0RO10phisTPp18cM35_9JKxRr-_6zE56TNl_lrYjkPYCz0iZns7AofMTk8jinUIk9cX_zvf3v0ga3mW8NYN4rjQ8zvhel3eQeszSGB07Gwv3ud7EIG6uUEzviUmuMgguCpp2o8V68Z4WjUot9QMAXzT0z0T8B1Y3l3_MA6EXRLrHmM_RynEn-46ZRKPaSgYBUuH32oTK_aFJ78nBg2BXN-dLeiHhVOhFx3x9niU9pdoilZ0VXhRr1jgCOfAkWj-XTpAancRzMXELb2r-gUMODhJkQFgZ71g",
          "X-MS-Migration": "True"
        }
      }
    ]
  }
  ```
- receive: `5:1::`
  ```json
  {
    "name": "trouter.connected",
    "args": [
      {
        "id": "vb90lMUkSkCIm3pRtuvZYA",
        "ccid": "Im3pRtuvZYA",
        "url": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:8443/v4/f/vb90lMUkSkCIm3pRtuvZYA/",
        "surl": "https://pub-ent-dewc-04-f.trouter.teams.microsoft.com:3443/v4/f/vb90lMUkSkCIm3pRtuvZYA/",
        "curlb": "https://pub-ent-dewc-04-t.trouter.teams.microsoft.com:443",
        "healthUrl": "https://go-eu.trouter.teams.microsoft.com:443/v4/h",
        "reconnectUrl": "wss://pub-ent-dewc-04-t.trouter.teams.microsoft.com:443/v4/c",
        "registrarUrl": "https://teams.microsoft.com/registrar/prod/V3/registrations",
        "socketio": "https://pub-ent-dewc-04-t.trouter.teams.microsoft.com:443/",
        "ttl": "558874",
        "dur": "3",
        "connectparams": {
          "issuer": "",
          "scae": "1",
          "sig": "",
          "sr": "vb90lMUkSkCIm3pRtuvZYA",
          "sp": "pub-ent-dewc-04",
          "se": "1762935399892",
          "st": "1762376225892"
        }
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
            "etag": "2025-11-05T21:02:05.8943886Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-05T21:02:05.8944524Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-05T21:02:05.8944647Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-05T21:02:05.8944727Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-05T21:02:05.8944895Z"
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
            "etag": "2025-11-05T21:02:05.8943886Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-05T21:02:05.8944524Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-05T21:02:05.8944647Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-05T21:02:05.8944727Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-05T21:02:05.8944895Z"
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
            "etag": "2025-11-05T21:02:05.8943886Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-05T21:02:05.8944524Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-05T21:02:05.8944647Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-05T21:02:05.8944727Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-05T21:02:05.8944895Z"
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
            "etag": "2025-11-05T21:02:05.8943886Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-05T21:02:05.8944524Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-05T21:02:05.8944647Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-05T21:02:05.8944727Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-05T21:02:05.8944895Z"
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
    "id": 1867275280,
    "method": "POST",
    "url": "/v4/f/vb90lMUkSkCIm3pRtuvZYA/",
    "headers": {
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "14199",
      "Content-Type": "text/xml",
      "Host": "pub-ent-dewc-04-t.trouter.teams.microsoft.com",
      "User-Agent": "Skype-NotificationHub/1.0.0-25.10.20.5+f73f4508532262cd54b9eb7227f71b69e72ee2b2 (France Central)",
      "X-Microsoft-Skype-Chain-ID": "f7ed8804-8499-4585-9694-188139bd6d7f",
      "Trouter-Timeout": "19298",
      "X-Microsoft-Skype-Message-ID": "ca52f722-a2ea-4379-9b88-a57e76bb7d0e",
      "MS-CV": "rVpukiwaa06IZnjsYAwAAA.3.1",
      "traceparent": "00-65acec5f8eb90f56d83f3bc6fe5abed8-6cbc75df05d322eb-00",
      "trouter-request": "{\"id\":\"6d6ee961-a006-466b-b750-118930d49ad0\",\"src\":\"10.128.147.98\",\"port\":3443}",
      "Trouter-TimeoutMs": "19798"
    },
    "body": "{\"evt\":107,\"gp\":\"eyJjYWxsTm90aWZpY2F0aW9uIjp7ImZyb20iOnsiaWQiOiI4Om9yZ2lkOjUwYTE3YTkzLTdlMzMtNDRmMS1iYWVmLThmMjM0NDU3ZjNlNyIsImRpc3BsYXlOYW1lIjoiQmVuIEJ1Y2tzY2giLCJkaXNwbGF5TmFtZVNvdXJjZSI6ImFhZCIsImVuZHBvaW50SWQiOiI0ZjY4YWI0MS05MTlmLTQ4ZjgtODFhYS0zODY0ZmQxYjcxMGYiLCJsYW5ndWFnZUlkIjoiZW4tVVMiLCJwYXJ0aWNpcGFudElkIjoiZTRiY2VjN2EtMWU0Zi00OWVlLWJmMWItMjY0NGRmN2M3ZjVlIiwiaGlkZGVuIjpmYWxzZSwidGVuYW50SWQiOiIzMzhkZTdlOC1iMTBhLTRhN2MtYWViNC00Y2RmNzI2ZmM4MTgiLCJyZWdpb24iOiJkZSIsInByb3BlcnR5QmFnIjpudWxsfSwidG8iOnsiaWQiOiI4Om9yZ2lkOjFjNTk1OGQ1LWU0MGEtNGEzNS1hMGUzLTdlYjY1MTc5MDk2ZiIsImRpc3BsYXlOYW1lIjoiTmVpbCBSYXNoYnJvb2siLCJkaXNwbGF5TmFtZVNvdXJjZSI6InJ1bnRpbWVBUEkiLCJlbmRwb2ludElkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwibGFuZ3VhZ2VJZCI6bnVsbCwicGFydGljaXBhbnRJZCI6IjMzYmFlNDlhLWM3YmYtNGZlNi1iZmZiLWQ1ZmNhMWE1MGFmNSIsImhpZGRlbiI6ZmFsc2UsInRlbmFudElkIjoiMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4IiwicHJvcGVydHlCYWciOm51bGx9LCJsaW5rcyI6eyJhdHRhY2giOiJodHRwczovL2FwaS5mbGlnaHRwcm94eS50ZWFtcy5taWNyb3NvZnQuY29tL2FwaS92Mi9lcC9jYy1mcmNlLTAzLXByb2QtYWtzLmNjLnNreXBlLmNvbS9jYy92MS9mb3JrZWQvMGIwYmE5OTItNjFiOS00YzYyLWExMGYtNGY4NmY3ZWM1YmJmLzI3L2kxLzEyMjcvYXR0YWNoP2k9MTAtMTI4LTAtOTQiLCJtZWRpYUFuc3dlciI6ImNjOi8vbWEiLCJwcm9ncmVzcyI6Imh0dHBzOi8vYXBpLmZsaWdodHByb3h5LnRlYW1zLm1pY3Jvc29mdC5jb20vYXBpL3YyL2VwL2NjLWZyY2UtMDMtcHJvZC1ha3MuY2Muc2t5cGUuY29tL2NjL3YxL2ZvcmtlZC8wYjBiYTk5Mi02MWI5LTRjNjItYTEwZi00Zjg2ZjdlYzViYmYvMjcvaTEvMTIyNy9wcm9ncmVzcz9pPTEwLTEyOC0wLTk0IiwicmVqZWN0IjoiaHR0cHM6Ly9hcGkuZmxpZ2h0cHJveHkudGVhbXMubWljcm9zb2Z0LmNvbS9hcGkvdjIvZXAvY2MtZnJjZS0wMy1wcm9kLWFrcy5jYy5za3lwZS5jb20vY2MvdjEvZm9ya2VkLzBiMGJhOTkyLTYxYjktNGM2Mi1hMTBmLTRmODZmN2VjNWJiZi8yNy9pMS8xMjI3L3JlamVjdD9pPTEwLTEyOC0wLTk0IiwidWRwVHJhbnNwb3J0IjoidWRwOi8vNTIuMTIzLjE0NS4yMDozNDc4LyJ9LCJtZWRpYUNvbnRlbnQiOnsiY29udGVudFR5cGUiOiJhcHBsaWNhdGlvbi9zZHAtbmdjLTEuMCIsImJsb2IiOiJ2PTBcclxubz1tb3ppbGxhLi4uVEhJU19JU19TRFBBUlRBLTk5LjAgMTcwNzI1NTU5MjQ2NDk5NjQzMCAwIElOIElQNCAwLjAuMC4wXHJcbnM9LVxyXG5iPUNUOjQwMDBcclxudD0wIDBcclxuYT1zZW5kcmVjdlxyXG5hPWljZS1vcHRpb25zOnRyaWNrbGVcclxuYT1tc2lkLXNlbWFudGljOiBXTVMgKlxyXG5hPWdyb3VwOkJVTkRMRSAwIDEgMiAzXHJcbm09YXVkaW8gNTIyMTQgUlRQL1NBVlAgOTYgMTA5IDkgMCA4IDEwMVxyXG5jPUlOIElQNCA1Mi4xMTQuMjM3LjIyMVxyXG5hPXgtc2lnbmFsaW5nLWZiOiogeC1tZXNzYWdlIGFwcCByZWN2OmRzaFxyXG5hPXgtc3NyYy1yYW5nZToyMTE0NzA5OTc0LTIxMTQ3MDk5NzRcclxuYT1ydHBtYXA6OTYgQ04vNDgwMDBcclxuYT1ydHBtYXA6MTA5IG9wdXMvNDgwMDAvMlxyXG5hPXJ0cG1hcDo5IEc3MjIvODAwMC8xXHJcbmE9cnRwbWFwOjAgUENNVS84MDAwXHJcbmE9cnRwbWFwOjggUENNQS84MDAwXHJcbmE9cnRwbWFwOjEwMSB0ZWxlcGhvbmUtZXZlbnQvODAwMFxyXG5hPWZtdHA6MTA5IG1heHBsYXliYWNrcmF0ZT00ODAwMDtzdGVyZW89MTt1c2VpbmJhbmRmZWM9MVxyXG5hPWZtdHA6MTAxIDAtMTVcclxuYT1ydGNwOjUyMjE0XHJcbmE9ZXh0bWFwOjEgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6c3NyYy1hdWRpby1sZXZlbFxyXG5hPWV4dG1hcDozIHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnNkZXM6bWlkXHJcbmE9ZXh0bWFwLWFsbG93LW1peGVkXHJcbmE9c2V0dXA6YWN0cGFzc1xyXG5hPW1pZDowXHJcbmE9bXNpZDp7ZDI4NWI1ZWYtNGZlNy00ZmQyLTliODgtNDRkMGM5ODIwNWY1fSB7OWMwN2RjYjMtYWNhMC00ODBhLThlNWItMjAzYTJlNDY0MmM3fVxyXG5hPXNlbmRyZWN2XHJcbmE9aWNlLXVmcmFnOjRhNDZhZWQ3XHJcbmE9aWNlLXB3ZDozODUxYzRmYzJmNjQwZmY2M2VlZmE2ZTViMDM1Y2UxNlxyXG5hPWZpbmdlcnByaW50OnNoYS0yNTYgREY6OTk6NTA6MzA6NTk6OTQ6RDI6MDg6ODY6NUY6MTQ6RjY6OUE6NzA6N0U6MzE6RDI6MEE6REU6MTI6Nzg6RjU6NDc6Rjk6NTI6ODA6N0I6OTA6OTE6MjA6MzY6NDBcclxuYT1jYW5kaWRhdGU6MCAxIFVEUCAyMTIyMjUyNTQzIDE5Mi4xNjguMjU1LjExIDU2OTkxIHR5cCBob3N0XHJcbmE9Y2FuZGlkYXRlOjAgMiBVRFAgMjEyMjI1MjU0MiAxOTIuMTY4LjI1NS4xMSA1Njk5MiB0eXAgaG9zdFxyXG5hPWNhbmRpZGF0ZTozIDEgdGNwLWFjdCAyMTA1NTI0NDc5IDE5Mi4xNjguMjU1LjExIDkgdHlwIGhvc3RcclxuYT1jYW5kaWRhdGU6MyAyIHRjcC1hY3QgMjEwNTUyNDQ3OCAxOTIuMTY4LjI1NS4xMSA5IHR5cCBob3N0XHJcbmE9Y2FuZGlkYXRlOjQgMSBVRFAgODMzMTI2MyA1Mi4xMTQuMjM3LjIyMSA1MjIxNCB0eXAgcmVsYXkgcmFkZHIgNTIuMTE0LjIzNy4yMjEgcnBvcnQgNTIyMTRcclxuYT1zc3JjOjIxMTQ3MDk5NzQgY25hbWU6ezQ3NTJiNGMwLTU5YTEtNGNlYy1hMzQ3LTJjODc1MzhmNGM0N31cclxuYT1ydGNwLW11eFxyXG5hPWxhYmVsOm1haW4tYXVkaW9cclxubT12aWRlbyA1MjIxNCBSVFAvU0FWUCAxMjAgMTI0IDEyMSAxMjUgMTI2IDEyNyA5NyA5OCAxMDUgMTA2IDEwMyAxMDQgOTkgMTAwIDEyMyAxMjIgMTE5XHJcbmM9SU4gSVA0IDUyLjExNC4yMzcuMjIxXHJcbmE9eC1zaWduYWxpbmctZmI6KiB4LW1lc3NhZ2UgYXBwIHNlbmQ6c3JjIHJlY3Y6c3JjLHZjXHJcbmE9eC1zc3JjLXJhbmdlOjIwMTYwMDk5OTAtMjAxNjAwOTk5MFxyXG5hPXJ0cG1hcDoxMjAgVlA4LzkwMDAwXHJcbmE9cnRwbWFwOjEyNCBydHgvOTAwMDBcclxuYT1ydHBtYXA6MTIxIFZQOS85MDAwMFxyXG5hPXJ0cG1hcDoxMjUgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjEyNiBIMjY0LzkwMDAwXHJcbmE9cnRwbWFwOjEyNyBydHgvOTAwMDBcclxuYT1ydHBtYXA6OTcgSDI2NC85MDAwMFxyXG5hPXJ0cG1hcDo5OCBydHgvOTAwMDBcclxuYT1ydHBtYXA6MTA1IEgyNjQvOTAwMDBcclxuYT1ydHBtYXA6MTA2IHJ0eC85MDAwMFxyXG5hPXJ0cG1hcDoxMDMgSDI2NC85MDAwMFxyXG5hPXJ0cG1hcDoxMDQgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjk5IEFWMS85MDAwMFxyXG5hPXJ0cG1hcDoxMDAgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjEyMyB1bHBmZWMvOTAwMDBcclxuYT1ydHBtYXA6MTIyIHJlZC85MDAwMFxyXG5hPXJ0cG1hcDoxMTkgcnR4LzkwMDAwXHJcbmE9Zm10cDoxMjYgcHJvZmlsZS1sZXZlbC1pZD00MmUwMWY7bGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQ9MTtwYWNrZXRpemF0aW9uLW1vZGU9MTttYXgtZnM9ODE2MDttYXgtbWJwcz0yNDQ4MDA7bWF4LWZwcz0zMDAwXHJcbmE9Zm10cDo5NyBwcm9maWxlLWxldmVsLWlkPTQyZTAxZjtsZXZlbC1hc3ltbWV0cnktYWxsb3dlZD0xXHJcbmE9Zm10cDoxMDUgcHJvZmlsZS1sZXZlbC1pZD00MjAwMWY7bGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQ9MTtwYWNrZXRpemF0aW9uLW1vZGU9MVxyXG5hPWZtdHA6MTAzIHByb2ZpbGUtbGV2ZWwtaWQ9NDIwMDFmO2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkPTFcclxuYT1mbXRwOjEyMCBtYXgtZnM9MTIyODg7bWF4LWZyPTYwXHJcbmE9Zm10cDoxMjQgYXB0PTEyMFxyXG5hPWZtdHA6MTIxIG1heC1mcz0xMjI4ODttYXgtZnI9NjBcclxuYT1mbXRwOjEyNSBhcHQ9MTIxXHJcbmE9Zm10cDoxMjcgYXB0PTEyNlxyXG5hPWZtdHA6OTggYXB0PTk3XHJcbmE9Zm10cDoxMDYgYXB0PTEwNVxyXG5hPWZtdHA6MTA0IGFwdD0xMDNcclxuYT1mbXRwOjEwMCBhcHQ9OTlcclxuYT1mbXRwOjExOSBhcHQ9MTIyXHJcbmE9cnRjcC1mYjoxMjAgbmFja1xyXG5hPXJ0Y3AtZmI6MTIwIG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMjAgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTIwIGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTIwIHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6MTIxIG5hY2tcclxuYT1ydGNwLWZiOjEyMSBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTIxIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEyMSBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEyMSB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjEyNiBuYWNrXHJcbmE9cnRjcC1mYjoxMjYgbmFjayBwbGlcclxuYT1ydGNwLWZiOjEyNiBjY20gZmlyXHJcbmE9cnRjcC1mYjoxMjYgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjoxMjYgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjo5NyBuYWNrXHJcbmE9cnRjcC1mYjo5NyBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6OTcgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6OTcgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjo5NyB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjEwNSBuYWNrXHJcbmE9cnRjcC1mYjoxMDUgbmFjayBwbGlcclxuYT1ydGNwLWZiOjEwNSBjY20gZmlyXHJcbmE9cnRjcC1mYjoxMDUgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjoxMDUgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjoxMDMgbmFja1xyXG5hPXJ0Y3AtZmI6MTAzIG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMDMgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTAzIGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTAzIHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6OTkgbmFja1xyXG5hPXJ0Y3AtZmI6OTkgbmFjayBwbGlcclxuYT1ydGNwLWZiOjk5IGNjbSBmaXJcclxuYT1ydGNwLWZiOjk5IGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6OTkgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjoxMjMgbmFja1xyXG5hPXJ0Y3AtZmI6MTIzIG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMjMgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTIzIGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTIzIHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6MTIyIG5hY2tcclxuYT1ydGNwLWZiOjEyMiBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTIyIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEyMiBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEyMiB0cmFuc3BvcnQtY2NcclxuYT1leHRtYXA6MyB1cm46aWV0ZjpwYXJhbXM6cnRwLWhkcmV4dDpzZGVzOm1pZFxyXG5hPWV4dG1hcDo0IGh0dHA6XFxcXHd3dy53ZWJydGMub3JnXFxleHBlcmltZW50c1xccnRwLWhkcmV4dFxcYWJzLXNlbmQtdGltZVxyXG5hPWV4dG1hcDo1IHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnRvZmZzZXRcclxuYT1leHRtYXA6NyBodHRwOlxcXFx3d3cuaWV0Zi5vcmdcXGlkXFxkcmFmdC1ob2xtZXItcm1jYXQtdHJhbnNwb3J0LXdpZGUtY2MtZXh0ZW5zaW9ucy0wMVxyXG5hPWV4dG1hcC1hbGxvdy1taXhlZFxyXG5hPXNldHVwOmFjdHBhc3NcclxuYT1taWQ6MVxyXG5hPXJlY3Zvbmx5XHJcbmE9aWNlLXVmcmFnOjRhNDZhZWQ3XHJcbmE9aWNlLXB3ZDozODUxYzRmYzJmNjQwZmY2M2VlZmE2ZTViMDM1Y2UxNlxyXG5hPWZpbmdlcnByaW50OnNoYS0yNTYgREY6OTk6NTA6MzA6NTk6OTQ6RDI6MDg6ODY6NUY6MTQ6RjY6OUE6NzA6N0U6MzE6RDI6MEE6REU6MTI6Nzg6RjU6NDc6Rjk6NTI6ODA6N0I6OTA6OTE6MjA6MzY6NDBcclxuYT1zc3JjOjIwMTYwMDk5OTAgY25hbWU6ezQ3NTJiNGMwLTU5YTEtNGNlYy1hMzQ3LTJjODc1MzhmNGM0N31cclxuYT1ydGNwLW11eFxyXG5hPXJ0Y3AtcnNpemVcclxuYT1idW5kbGUtb25seVxyXG5hPWxhYmVsOm1haW4tdmlkZW9cclxubT12aWRlbyA1MjIxNCBSVFAvU0FWUCAxMjAgMTI0IDEyMSAxMjUgMTI2IDEyNyA5NyA5OCAxMDUgMTA2IDEwMyAxMDQgOTkgMTAwIDEyMyAxMjIgMTE5XHJcbmM9SU4gSVA0IDUyLjExNC4yMzcuMjIxXHJcbmE9eC1zaWduYWxpbmctZmI6KiB4LW1lc3NhZ2UgYXBwIHNlbmQ6c3JjIHJlY3Y6c3JjLHZjXHJcbmE9eC1zc3JjLXJhbmdlOjUxMDcxMjcyOC01MTA3MTI3MjhcclxuYT1ydHBtYXA6MTIwIFZQOC85MDAwMFxyXG5hPXJ0cG1hcDoxMjQgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjEyMSBWUDkvOTAwMDBcclxuYT1ydHBtYXA6MTI1IHJ0eC85MDAwMFxyXG5hPXJ0cG1hcDoxMjYgSDI2NC85MDAwMFxyXG5hPXJ0cG1hcDoxMjcgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjk3IEgyNjQvOTAwMDBcclxuYT1ydHBtYXA6OTggcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjEwNSBIMjY0LzkwMDAwXHJcbmE9cnRwbWFwOjEwNiBydHgvOTAwMDBcclxuYT1ydHBtYXA6MTAzIEgyNjQvOTAwMDBcclxuYT1ydHBtYXA6MTA0IHJ0eC85MDAwMFxyXG5hPXJ0cG1hcDo5OSBBVjEvOTAwMDBcclxuYT1ydHBtYXA6MTAwIHJ0eC85MDAwMFxyXG5hPXJ0cG1hcDoxMjMgdWxwZmVjLzkwMDAwXHJcbmE9cnRwbWFwOjEyMiByZWQvOTAwMDBcclxuYT1ydHBtYXA6MTE5IHJ0eC85MDAwMFxyXG5hPWZtdHA6MTI2IHByb2ZpbGUtbGV2ZWwtaWQ9NDJlMDFmO2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkPTE7cGFja2V0aXphdGlvbi1tb2RlPTE7bWF4LWZzPTgxNjA7bWF4LW1icHM9MTM1MDAwO21heC1mcHM9MTUwMFxyXG5hPWZtdHA6OTcgcHJvZmlsZS1sZXZlbC1pZD00MmUwMWY7bGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQ9MVxyXG5hPWZtdHA6MTA1IHByb2ZpbGUtbGV2ZWwtaWQ9NDIwMDFmO2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkPTE7cGFja2V0aXphdGlvbi1tb2RlPTFcclxuYT1mbXRwOjEwMyBwcm9maWxlLWxldmVsLWlkPTQyMDAxZjtsZXZlbC1hc3ltbWV0cnktYWxsb3dlZD0xXHJcbmE9Zm10cDoxMjAgbWF4LWZzPTEyMjg4O21heC1mcj02MFxyXG5hPWZtdHA6MTI0IGFwdD0xMjBcclxuYT1mbXRwOjEyMSBtYXgtZnM9MTIyODg7bWF4LWZyPTYwXHJcbmE9Zm10cDoxMjUgYXB0PTEyMVxyXG5hPWZtdHA6MTI3IGFwdD0xMjZcclxuYT1mbXRwOjk4IGFwdD05N1xyXG5hPWZtdHA6MTA2IGFwdD0xMDVcclxuYT1mbXRwOjEwNCBhcHQ9MTAzXHJcbmE9Zm10cDoxMDAgYXB0PTk5XHJcbmE9Zm10cDoxMTkgYXB0PTEyMlxyXG5hPXJ0Y3AtZmI6MTIwIG5hY2tcclxuYT1ydGNwLWZiOjEyMCBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTIwIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEyMCBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEyMCB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjEyMSBuYWNrXHJcbmE9cnRjcC1mYjoxMjEgbmFjayBwbGlcclxuYT1ydGNwLWZiOjEyMSBjY20gZmlyXHJcbmE9cnRjcC1mYjoxMjEgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjoxMjEgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjoxMjYgbmFja1xyXG5hPXJ0Y3AtZmI6MTI2IG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMjYgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTI2IGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTI2IHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6OTcgbmFja1xyXG5hPXJ0Y3AtZmI6OTcgbmFjayBwbGlcclxuYT1ydGNwLWZiOjk3IGNjbSBmaXJcclxuYT1ydGNwLWZiOjk3IGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6OTcgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjoxMDUgbmFja1xyXG5hPXJ0Y3AtZmI6MTA1IG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMDUgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTA1IGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTA1IHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6MTAzIG5hY2tcclxuYT1ydGNwLWZiOjEwMyBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTAzIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEwMyBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEwMyB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjk5IG5hY2tcclxuYT1ydGNwLWZiOjk5IG5hY2sgcGxpXHJcbmE9cnRjcC1mYjo5OSBjY20gZmlyXHJcbmE9cnRjcC1mYjo5OSBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjk5IHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6MTIzIG5hY2tcclxuYT1ydGNwLWZiOjEyMyBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTIzIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEyMyBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEyMyB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjEyMiBuYWNrXHJcbmE9cnRjcC1mYjoxMjIgbmFjayBwbGlcclxuYT1ydGNwLWZiOjEyMiBjY20gZmlyXHJcbmE9cnRjcC1mYjoxMjIgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjoxMjIgdHJhbnNwb3J0LWNjXHJcbmE9ZXh0bWFwOjMgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6c2RlczptaWRcclxuYT1leHRtYXA6NCBodHRwOlxcXFx3d3cud2VicnRjLm9yZ1xcZXhwZXJpbWVudHNcXHJ0cC1oZHJleHRcXGFicy1zZW5kLXRpbWVcclxuYT1leHRtYXA6NSB1cm46aWV0ZjpwYXJhbXM6cnRwLWhkcmV4dDp0b2Zmc2V0XHJcbmE9ZXh0bWFwOjcgaHR0cDpcXFxcd3d3LmlldGYub3JnXFxpZFxcZHJhZnQtaG9sbWVyLXJtY2F0LXRyYW5zcG9ydC13aWRlLWNjLWV4dGVuc2lvbnMtMDFcclxuYT1leHRtYXAtYWxsb3ctbWl4ZWRcclxuYT1zZXR1cDphY3RwYXNzXHJcbmE9bWlkOjJcclxuYT1pbmFjdGl2ZVxyXG5hPWljZS11ZnJhZzo0YTQ2YWVkN1xyXG5hPWljZS1wd2Q6Mzg1MWM0ZmMyZjY0MGZmNjNlZWZhNmU1YjAzNWNlMTZcclxuYT1maW5nZXJwcmludDpzaGEtMjU2IERGOjk5OjUwOjMwOjU5Ojk0OkQyOjA4Ojg2OjVGOjE0OkY2OjlBOjcwOjdFOjMxOkQyOjBBOkRFOjEyOjc4OkY1OjQ3OkY5OjUyOjgwOjdCOjkwOjkxOjIwOjM2OjQwXHJcbmE9c3NyYzo1MTA3MTI3MjggY25hbWU6ezQ3NTJiNGMwLTU5YTEtNGNlYy1hMzQ3LTJjODc1MzhmNGM0N31cclxuYT1ydGNwLW11eFxyXG5hPXJ0Y3AtcnNpemVcclxuYT1idW5kbGUtb25seVxyXG5hPWxhYmVsOmFwcGxpY2F0aW9uc2hhcmluZy12aWRlb1xyXG5tPXgtZGF0YSA1MjIxNCBSVFAvU0FWUCAxMjcgMTI2XHJcbmM9SU4gSVA0IDUyLjExNC4yMzcuMjIxXHJcbmE9eC1kYXRhLXByb3RvY29sOnNjdHBcclxuYT14LXNzcmMtcmFuZ2U6MTk1ODM2MDM5MC0xOTU4MzYwMzkwXHJcbmE9cnRwbWFwOjEyNyB4LWRhdGEvOTAwMDBcclxuYT1ydHBtYXA6MTI2IHJ0eC85MDAwMFxyXG5hPWZtdHA6MTI2IGFwdD0xMjdcclxuYT1leHRtYXAtYWxsb3ctbWl4ZWRcclxuYT1zZXR1cDphY3RwYXNzXHJcbmE9bWlkOjNcclxuYT1zZW5kcmVjdlxyXG5hPWljZS11ZnJhZzo0YTQ2YWVkN1xyXG5hPWljZS1wd2Q6Mzg1MWM0ZmMyZjY0MGZmNjNlZWZhNmU1YjAzNWNlMTZcclxuYT1maW5nZXJwcmludDpzaGEtMjU2IERGOjk5OjUwOjMwOjU5Ojk0OkQyOjA4Ojg2OjVGOjE0OkY2OjlBOjcwOjdFOjMxOkQyOjBBOkRFOjEyOjc4OkY1OjQ3OkY5OjUyOjgwOjdCOjkwOjkxOjIwOjM2OjQwXHJcbmE9cnRjcC1tdXhcclxuYT1idW5kbGUtb25seVxyXG5hPWxhYmVsOmRhdGFcclxuYT1zY3RwLXBvcnQ6NTAwMFxyXG5hPW1heC1tZXNzYWdlLXNpemU6MTA3Mzc0MTgyM1xyXG4iLCJtZWRpYUxlZ0lkIjoiNjU1MjEyQTY0MjIyNDVGQUJDQzg0MEMzMENCMzZEQjIiLCJlc2NhbGF0aW9uT2NjdXJyaW5nIjpmYWxzZSwibmV3T2ZmZXIiOmZhbHNlLCJjbGllbnRMb2NhdGlvbiI6IkdCIiwicmVxdWlyZWRGZWF0dXJlcyI6Im5vbkJ5UGFzcyIsImFwcGx5Q2hhbm5lbFBhcmFtZXRlcnMiOnsibXVsdGlDaGFubmVsUGFyYW1ldGVyIjp7Im1pZHMiOlsiKiJdLCJtZWRpYVBhcmFtZXRlciI6IntcInNlbmRTaWRlQldTZWVkXCI6e1wic2VlZFZhbHVlQml0c1BlclNlY1wiOjYwMDAwMH19In19fSwidWRwS2V5Ijp7InNlc3Npb25LZXkiOiJzenpRUFFsZzd6d2JjZzIyU3JOSmRBPT0iLCJ0aWNrZXQiOiJBSlRBaktRWnl1S2YwUWNWekhkYzZnPT0ifSwiY2xpZW50RW5kcG9pbnRDYXBhYmlsaXRpZXMiOjg4MTIyMjYsInJlcGxhY2VzIjpudWxsLCJ2b2ljZW1haWxTZXR0aW5ncyI6e319LCJjb252ZXJzYXRpb25JbnZpdGF0aW9uIjp7ImNvbnZlcnNhdGlvbkNvbnRyb2xsZXIiOiJodHRwczovL2FwaS5mbGlnaHRwcm94eS50ZWFtcy5taWNyb3NvZnQuY29tL2FwaS92Mi9lcC9jb252LWZyY2UtMDEtcHJvZC1ha3MuY29udi5za3lwZS5jb20vY29udi92c215R2JvTEFVbXdCampuMzd0Qlh3P2k9MTAtMTI4LTMzLTE4JmU9NjM4OTc4MjAxNDQxNjQ1Njk5IiwiaXNNdWx0aVBhcnR5IjpmYWxzZSwiaXNCcm9hZGNhc3QiOmZhbHNlfSwiZGVidWdDb250ZW50Ijp7ImVjc0V0YWciOiJcIlk4d04zVHJDaUtlUG9HMlJ0MkM3SFdHbXY5K3JmS3Voek1hRmNGbHNYWU09XCIiLCJjYWxsSWQiOiJmN2VkODgwNC04NDk5LTQ1ODUtOTY5NC0xODgxMzliZDZkN2YiLCJQcm9jZXNzaW5nQ2FsbENvbnRyb2xsZXJJbnN0YW5jZSI6Imh0dHBzOi8vY2MtZnJjZS0wMy1wcm9kLWFrcy5jYy5za3lwZS5jb20vIiwicG90ZW50aWFsQ2FsbE5vdGlmaWNhdGlvblNlbnQiOmZhbHNlLCJwYXJ0aWNpcGFudElkIjoiMzNiYWU0OWEtYzdiZi00ZmU2LWJmZmItZDVmY2ExYTUwYWY1In0sImdyb3VwQ29udGV4dCI6bnVsbH0=\"}"
  }
  ```
  - `body`:
    ```json
    {
      "evt": 107,
      "gp": "eyJjYWxsTm90aWZpY2F0aW9uIjp7ImZyb20iOnsiaWQiOiI4Om9yZ2lkOjUwYTE3YTkzLTdlMzMtNDRmMS1iYWVmLThmMjM0NDU3ZjNlNyIsImRpc3BsYXlOYW1lIjoiQmVuIEJ1Y2tzY2giLCJkaXNwbGF5TmFtZVNvdXJjZSI6ImFhZCIsImVuZHBvaW50SWQiOiI0ZjY4YWI0MS05MTlmLTQ4ZjgtODFhYS0zODY0ZmQxYjcxMGYiLCJsYW5ndWFnZUlkIjoiZW4tVVMiLCJwYXJ0aWNpcGFudElkIjoiZTRiY2VjN2EtMWU0Zi00OWVlLWJmMWItMjY0NGRmN2M3ZjVlIiwiaGlkZGVuIjpmYWxzZSwidGVuYW50SWQiOiIzMzhkZTdlOC1iMTBhLTRhN2MtYWViNC00Y2RmNzI2ZmM4MTgiLCJyZWdpb24iOiJkZSIsInByb3BlcnR5QmFnIjpudWxsfSwidG8iOnsiaWQiOiI4Om9yZ2lkOjFjNTk1OGQ1LWU0MGEtNGEzNS1hMGUzLTdlYjY1MTc5MDk2ZiIsImRpc3BsYXlOYW1lIjoiTmVpbCBSYXNoYnJvb2siLCJkaXNwbGF5TmFtZVNvdXJjZSI6InJ1bnRpbWVBUEkiLCJlbmRwb2ludElkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwibGFuZ3VhZ2VJZCI6bnVsbCwicGFydGljaXBhbnRJZCI6IjMzYmFlNDlhLWM3YmYtNGZlNi1iZmZiLWQ1ZmNhMWE1MGFmNSIsImhpZGRlbiI6ZmFsc2UsInRlbmFudElkIjoiMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4IiwicHJvcGVydHlCYWciOm51bGx9LCJsaW5rcyI6eyJhdHRhY2giOiJodHRwczovL2FwaS5mbGlnaHRwcm94eS50ZWFtcy5taWNyb3NvZnQuY29tL2FwaS92Mi9lcC9jYy1mcmNlLTAzLXByb2QtYWtzLmNjLnNreXBlLmNvbS9jYy92MS9mb3JrZWQvMGIwYmE5OTItNjFiOS00YzYyLWExMGYtNGY4NmY3ZWM1YmJmLzI3L2kxLzEyMjcvYXR0YWNoP2k9MTAtMTI4LTAtOTQiLCJtZWRpYUFuc3dlciI6ImNjOi8vbWEiLCJwcm9ncmVzcyI6Imh0dHBzOi8vYXBpLmZsaWdodHByb3h5LnRlYW1zLm1pY3Jvc29mdC5jb20vYXBpL3YyL2VwL2NjLWZyY2UtMDMtcHJvZC1ha3MuY2Muc2t5cGUuY29tL2NjL3YxL2ZvcmtlZC8wYjBiYTk5Mi02MWI5LTRjNjItYTEwZi00Zjg2ZjdlYzViYmYvMjcvaTEvMTIyNy9wcm9ncmVzcz9pPTEwLTEyOC0wLTk0IiwicmVqZWN0IjoiaHR0cHM6Ly9hcGkuZmxpZ2h0cHJveHkudGVhbXMubWljcm9zb2Z0LmNvbS9hcGkvdjIvZXAvY2MtZnJjZS0wMy1wcm9kLWFrcy5jYy5za3lwZS5jb20vY2MvdjEvZm9ya2VkLzBiMGJhOTkyLTYxYjktNGM2Mi1hMTBmLTRmODZmN2VjNWJiZi8yNy9pMS8xMjI3L3JlamVjdD9pPTEwLTEyOC0wLTk0IiwidWRwVHJhbnNwb3J0IjoidWRwOi8vNTIuMTIzLjE0NS4yMDozNDc4LyJ9LCJtZWRpYUNvbnRlbnQiOnsiY29udGVudFR5cGUiOiJhcHBsaWNhdGlvbi9zZHAtbmdjLTEuMCIsImJsb2IiOiJ2PTBcclxubz1tb3ppbGxhLi4uVEhJU19JU19TRFBBUlRBLTk5LjAgMTcwNzI1NTU5MjQ2NDk5NjQzMCAwIElOIElQNCAwLjAuMC4wXHJcbnM9LVxyXG5iPUNUOjQwMDBcclxudD0wIDBcclxuYT1zZW5kcmVjdlxyXG5hPWljZS1vcHRpb25zOnRyaWNrbGVcclxuYT1tc2lkLXNlbWFudGljOiBXTVMgKlxyXG5hPWdyb3VwOkJVTkRMRSAwIDEgMiAzXHJcbm09YXVkaW8gNTIyMTQgUlRQL1NBVlAgOTYgMTA5IDkgMCA4IDEwMVxyXG5jPUlOIElQNCA1Mi4xMTQuMjM3LjIyMVxyXG5hPXgtc2lnbmFsaW5nLWZiOiogeC1tZXNzYWdlIGFwcCByZWN2OmRzaFxyXG5hPXgtc3NyYy1yYW5nZToyMTE0NzA5OTc0LTIxMTQ3MDk5NzRcclxuYT1ydHBtYXA6OTYgQ04vNDgwMDBcclxuYT1ydHBtYXA6MTA5IG9wdXMvNDgwMDAvMlxyXG5hPXJ0cG1hcDo5IEc3MjIvODAwMC8xXHJcbmE9cnRwbWFwOjAgUENNVS84MDAwXHJcbmE9cnRwbWFwOjggUENNQS84MDAwXHJcbmE9cnRwbWFwOjEwMSB0ZWxlcGhvbmUtZXZlbnQvODAwMFxyXG5hPWZtdHA6MTA5IG1heHBsYXliYWNrcmF0ZT00ODAwMDtzdGVyZW89MTt1c2VpbmJhbmRmZWM9MVxyXG5hPWZtdHA6MTAxIDAtMTVcclxuYT1ydGNwOjUyMjE0XHJcbmE9ZXh0bWFwOjEgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6c3NyYy1hdWRpby1sZXZlbFxyXG5hPWV4dG1hcDozIHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnNkZXM6bWlkXHJcbmE9ZXh0bWFwLWFsbG93LW1peGVkXHJcbmE9c2V0dXA6YWN0cGFzc1xyXG5hPW1pZDowXHJcbmE9bXNpZDp7ZDI4NWI1ZWYtNGZlNy00ZmQyLTliODgtNDRkMGM5ODIwNWY1fSB7OWMwN2RjYjMtYWNhMC00ODBhLThlNWItMjAzYTJlNDY0MmM3fVxyXG5hPXNlbmRyZWN2XHJcbmE9aWNlLXVmcmFnOjRhNDZhZWQ3XHJcbmE9aWNlLXB3ZDozODUxYzRmYzJmNjQwZmY2M2VlZmE2ZTViMDM1Y2UxNlxyXG5hPWZpbmdlcnByaW50OnNoYS0yNTYgREY6OTk6NTA6MzA6NTk6OTQ6RDI6MDg6ODY6NUY6MTQ6RjY6OUE6NzA6N0U6MzE6RDI6MEE6REU6MTI6Nzg6RjU6NDc6Rjk6NTI6ODA6N0I6OTA6OTE6MjA6MzY6NDBcclxuYT1jYW5kaWRhdGU6MCAxIFVEUCAyMTIyMjUyNTQzIDE5Mi4xNjguMjU1LjExIDU2OTkxIHR5cCBob3N0XHJcbmE9Y2FuZGlkYXRlOjAgMiBVRFAgMjEyMjI1MjU0MiAxOTIuMTY4LjI1NS4xMSA1Njk5MiB0eXAgaG9zdFxyXG5hPWNhbmRpZGF0ZTozIDEgdGNwLWFjdCAyMTA1NTI0NDc5IDE5Mi4xNjguMjU1LjExIDkgdHlwIGhvc3RcclxuYT1jYW5kaWRhdGU6MyAyIHRjcC1hY3QgMjEwNTUyNDQ3OCAxOTIuMTY4LjI1NS4xMSA5IHR5cCBob3N0XHJcbmE9Y2FuZGlkYXRlOjQgMSBVRFAgODMzMTI2MyA1Mi4xMTQuMjM3LjIyMSA1MjIxNCB0eXAgcmVsYXkgcmFkZHIgNTIuMTE0LjIzNy4yMjEgcnBvcnQgNTIyMTRcclxuYT1zc3JjOjIxMTQ3MDk5NzQgY25hbWU6ezQ3NTJiNGMwLTU5YTEtNGNlYy1hMzQ3LTJjODc1MzhmNGM0N31cclxuYT1ydGNwLW11eFxyXG5hPWxhYmVsOm1haW4tYXVkaW9cclxubT12aWRlbyA1MjIxNCBSVFAvU0FWUCAxMjAgMTI0IDEyMSAxMjUgMTI2IDEyNyA5NyA5OCAxMDUgMTA2IDEwMyAxMDQgOTkgMTAwIDEyMyAxMjIgMTE5XHJcbmM9SU4gSVA0IDUyLjExNC4yMzcuMjIxXHJcbmE9eC1zaWduYWxpbmctZmI6KiB4LW1lc3NhZ2UgYXBwIHNlbmQ6c3JjIHJlY3Y6c3JjLHZjXHJcbmE9eC1zc3JjLXJhbmdlOjIwMTYwMDk5OTAtMjAxNjAwOTk5MFxyXG5hPXJ0cG1hcDoxMjAgVlA4LzkwMDAwXHJcbmE9cnRwbWFwOjEyNCBydHgvOTAwMDBcclxuYT1ydHBtYXA6MTIxIFZQOS85MDAwMFxyXG5hPXJ0cG1hcDoxMjUgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjEyNiBIMjY0LzkwMDAwXHJcbmE9cnRwbWFwOjEyNyBydHgvOTAwMDBcclxuYT1ydHBtYXA6OTcgSDI2NC85MDAwMFxyXG5hPXJ0cG1hcDo5OCBydHgvOTAwMDBcclxuYT1ydHBtYXA6MTA1IEgyNjQvOTAwMDBcclxuYT1ydHBtYXA6MTA2IHJ0eC85MDAwMFxyXG5hPXJ0cG1hcDoxMDMgSDI2NC85MDAwMFxyXG5hPXJ0cG1hcDoxMDQgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjk5IEFWMS85MDAwMFxyXG5hPXJ0cG1hcDoxMDAgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjEyMyB1bHBmZWMvOTAwMDBcclxuYT1ydHBtYXA6MTIyIHJlZC85MDAwMFxyXG5hPXJ0cG1hcDoxMTkgcnR4LzkwMDAwXHJcbmE9Zm10cDoxMjYgcHJvZmlsZS1sZXZlbC1pZD00MmUwMWY7bGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQ9MTtwYWNrZXRpemF0aW9uLW1vZGU9MTttYXgtZnM9ODE2MDttYXgtbWJwcz0yNDQ4MDA7bWF4LWZwcz0zMDAwXHJcbmE9Zm10cDo5NyBwcm9maWxlLWxldmVsLWlkPTQyZTAxZjtsZXZlbC1hc3ltbWV0cnktYWxsb3dlZD0xXHJcbmE9Zm10cDoxMDUgcHJvZmlsZS1sZXZlbC1pZD00MjAwMWY7bGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQ9MTtwYWNrZXRpemF0aW9uLW1vZGU9MVxyXG5hPWZtdHA6MTAzIHByb2ZpbGUtbGV2ZWwtaWQ9NDIwMDFmO2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkPTFcclxuYT1mbXRwOjEyMCBtYXgtZnM9MTIyODg7bWF4LWZyPTYwXHJcbmE9Zm10cDoxMjQgYXB0PTEyMFxyXG5hPWZtdHA6MTIxIG1heC1mcz0xMjI4ODttYXgtZnI9NjBcclxuYT1mbXRwOjEyNSBhcHQ9MTIxXHJcbmE9Zm10cDoxMjcgYXB0PTEyNlxyXG5hPWZtdHA6OTggYXB0PTk3XHJcbmE9Zm10cDoxMDYgYXB0PTEwNVxyXG5hPWZtdHA6MTA0IGFwdD0xMDNcclxuYT1mbXRwOjEwMCBhcHQ9OTlcclxuYT1mbXRwOjExOSBhcHQ9MTIyXHJcbmE9cnRjcC1mYjoxMjAgbmFja1xyXG5hPXJ0Y3AtZmI6MTIwIG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMjAgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTIwIGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTIwIHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6MTIxIG5hY2tcclxuYT1ydGNwLWZiOjEyMSBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTIxIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEyMSBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEyMSB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjEyNiBuYWNrXHJcbmE9cnRjcC1mYjoxMjYgbmFjayBwbGlcclxuYT1ydGNwLWZiOjEyNiBjY20gZmlyXHJcbmE9cnRjcC1mYjoxMjYgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjoxMjYgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjo5NyBuYWNrXHJcbmE9cnRjcC1mYjo5NyBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6OTcgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6OTcgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjo5NyB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjEwNSBuYWNrXHJcbmE9cnRjcC1mYjoxMDUgbmFjayBwbGlcclxuYT1ydGNwLWZiOjEwNSBjY20gZmlyXHJcbmE9cnRjcC1mYjoxMDUgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjoxMDUgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjoxMDMgbmFja1xyXG5hPXJ0Y3AtZmI6MTAzIG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMDMgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTAzIGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTAzIHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6OTkgbmFja1xyXG5hPXJ0Y3AtZmI6OTkgbmFjayBwbGlcclxuYT1ydGNwLWZiOjk5IGNjbSBmaXJcclxuYT1ydGNwLWZiOjk5IGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6OTkgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjoxMjMgbmFja1xyXG5hPXJ0Y3AtZmI6MTIzIG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMjMgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTIzIGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTIzIHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6MTIyIG5hY2tcclxuYT1ydGNwLWZiOjEyMiBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTIyIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEyMiBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEyMiB0cmFuc3BvcnQtY2NcclxuYT1leHRtYXA6MyB1cm46aWV0ZjpwYXJhbXM6cnRwLWhkcmV4dDpzZGVzOm1pZFxyXG5hPWV4dG1hcDo0IGh0dHA6XFxcXHd3dy53ZWJydGMub3JnXFxleHBlcmltZW50c1xccnRwLWhkcmV4dFxcYWJzLXNlbmQtdGltZVxyXG5hPWV4dG1hcDo1IHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnRvZmZzZXRcclxuYT1leHRtYXA6NyBodHRwOlxcXFx3d3cuaWV0Zi5vcmdcXGlkXFxkcmFmdC1ob2xtZXItcm1jYXQtdHJhbnNwb3J0LXdpZGUtY2MtZXh0ZW5zaW9ucy0wMVxyXG5hPWV4dG1hcC1hbGxvdy1taXhlZFxyXG5hPXNldHVwOmFjdHBhc3NcclxuYT1taWQ6MVxyXG5hPXJlY3Zvbmx5XHJcbmE9aWNlLXVmcmFnOjRhNDZhZWQ3XHJcbmE9aWNlLXB3ZDozODUxYzRmYzJmNjQwZmY2M2VlZmE2ZTViMDM1Y2UxNlxyXG5hPWZpbmdlcnByaW50OnNoYS0yNTYgREY6OTk6NTA6MzA6NTk6OTQ6RDI6MDg6ODY6NUY6MTQ6RjY6OUE6NzA6N0U6MzE6RDI6MEE6REU6MTI6Nzg6RjU6NDc6Rjk6NTI6ODA6N0I6OTA6OTE6MjA6MzY6NDBcclxuYT1zc3JjOjIwMTYwMDk5OTAgY25hbWU6ezQ3NTJiNGMwLTU5YTEtNGNlYy1hMzQ3LTJjODc1MzhmNGM0N31cclxuYT1ydGNwLW11eFxyXG5hPXJ0Y3AtcnNpemVcclxuYT1idW5kbGUtb25seVxyXG5hPWxhYmVsOm1haW4tdmlkZW9cclxubT12aWRlbyA1MjIxNCBSVFAvU0FWUCAxMjAgMTI0IDEyMSAxMjUgMTI2IDEyNyA5NyA5OCAxMDUgMTA2IDEwMyAxMDQgOTkgMTAwIDEyMyAxMjIgMTE5XHJcbmM9SU4gSVA0IDUyLjExNC4yMzcuMjIxXHJcbmE9eC1zaWduYWxpbmctZmI6KiB4LW1lc3NhZ2UgYXBwIHNlbmQ6c3JjIHJlY3Y6c3JjLHZjXHJcbmE9eC1zc3JjLXJhbmdlOjUxMDcxMjcyOC01MTA3MTI3MjhcclxuYT1ydHBtYXA6MTIwIFZQOC85MDAwMFxyXG5hPXJ0cG1hcDoxMjQgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjEyMSBWUDkvOTAwMDBcclxuYT1ydHBtYXA6MTI1IHJ0eC85MDAwMFxyXG5hPXJ0cG1hcDoxMjYgSDI2NC85MDAwMFxyXG5hPXJ0cG1hcDoxMjcgcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjk3IEgyNjQvOTAwMDBcclxuYT1ydHBtYXA6OTggcnR4LzkwMDAwXHJcbmE9cnRwbWFwOjEwNSBIMjY0LzkwMDAwXHJcbmE9cnRwbWFwOjEwNiBydHgvOTAwMDBcclxuYT1ydHBtYXA6MTAzIEgyNjQvOTAwMDBcclxuYT1ydHBtYXA6MTA0IHJ0eC85MDAwMFxyXG5hPXJ0cG1hcDo5OSBBVjEvOTAwMDBcclxuYT1ydHBtYXA6MTAwIHJ0eC85MDAwMFxyXG5hPXJ0cG1hcDoxMjMgdWxwZmVjLzkwMDAwXHJcbmE9cnRwbWFwOjEyMiByZWQvOTAwMDBcclxuYT1ydHBtYXA6MTE5IHJ0eC85MDAwMFxyXG5hPWZtdHA6MTI2IHByb2ZpbGUtbGV2ZWwtaWQ9NDJlMDFmO2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkPTE7cGFja2V0aXphdGlvbi1tb2RlPTE7bWF4LWZzPTgxNjA7bWF4LW1icHM9MTM1MDAwO21heC1mcHM9MTUwMFxyXG5hPWZtdHA6OTcgcHJvZmlsZS1sZXZlbC1pZD00MmUwMWY7bGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQ9MVxyXG5hPWZtdHA6MTA1IHByb2ZpbGUtbGV2ZWwtaWQ9NDIwMDFmO2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkPTE7cGFja2V0aXphdGlvbi1tb2RlPTFcclxuYT1mbXRwOjEwMyBwcm9maWxlLWxldmVsLWlkPTQyMDAxZjtsZXZlbC1hc3ltbWV0cnktYWxsb3dlZD0xXHJcbmE9Zm10cDoxMjAgbWF4LWZzPTEyMjg4O21heC1mcj02MFxyXG5hPWZtdHA6MTI0IGFwdD0xMjBcclxuYT1mbXRwOjEyMSBtYXgtZnM9MTIyODg7bWF4LWZyPTYwXHJcbmE9Zm10cDoxMjUgYXB0PTEyMVxyXG5hPWZtdHA6MTI3IGFwdD0xMjZcclxuYT1mbXRwOjk4IGFwdD05N1xyXG5hPWZtdHA6MTA2IGFwdD0xMDVcclxuYT1mbXRwOjEwNCBhcHQ9MTAzXHJcbmE9Zm10cDoxMDAgYXB0PTk5XHJcbmE9Zm10cDoxMTkgYXB0PTEyMlxyXG5hPXJ0Y3AtZmI6MTIwIG5hY2tcclxuYT1ydGNwLWZiOjEyMCBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTIwIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEyMCBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEyMCB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjEyMSBuYWNrXHJcbmE9cnRjcC1mYjoxMjEgbmFjayBwbGlcclxuYT1ydGNwLWZiOjEyMSBjY20gZmlyXHJcbmE9cnRjcC1mYjoxMjEgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjoxMjEgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjoxMjYgbmFja1xyXG5hPXJ0Y3AtZmI6MTI2IG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMjYgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTI2IGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTI2IHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6OTcgbmFja1xyXG5hPXJ0Y3AtZmI6OTcgbmFjayBwbGlcclxuYT1ydGNwLWZiOjk3IGNjbSBmaXJcclxuYT1ydGNwLWZiOjk3IGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6OTcgdHJhbnNwb3J0LWNjXHJcbmE9cnRjcC1mYjoxMDUgbmFja1xyXG5hPXJ0Y3AtZmI6MTA1IG5hY2sgcGxpXHJcbmE9cnRjcC1mYjoxMDUgY2NtIGZpclxyXG5hPXJ0Y3AtZmI6MTA1IGdvb2ctcmVtYlxyXG5hPXJ0Y3AtZmI6MTA1IHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6MTAzIG5hY2tcclxuYT1ydGNwLWZiOjEwMyBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTAzIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEwMyBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEwMyB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjk5IG5hY2tcclxuYT1ydGNwLWZiOjk5IG5hY2sgcGxpXHJcbmE9cnRjcC1mYjo5OSBjY20gZmlyXHJcbmE9cnRjcC1mYjo5OSBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjk5IHRyYW5zcG9ydC1jY1xyXG5hPXJ0Y3AtZmI6MTIzIG5hY2tcclxuYT1ydGNwLWZiOjEyMyBuYWNrIHBsaVxyXG5hPXJ0Y3AtZmI6MTIzIGNjbSBmaXJcclxuYT1ydGNwLWZiOjEyMyBnb29nLXJlbWJcclxuYT1ydGNwLWZiOjEyMyB0cmFuc3BvcnQtY2NcclxuYT1ydGNwLWZiOjEyMiBuYWNrXHJcbmE9cnRjcC1mYjoxMjIgbmFjayBwbGlcclxuYT1ydGNwLWZiOjEyMiBjY20gZmlyXHJcbmE9cnRjcC1mYjoxMjIgZ29vZy1yZW1iXHJcbmE9cnRjcC1mYjoxMjIgdHJhbnNwb3J0LWNjXHJcbmE9ZXh0bWFwOjMgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6c2RlczptaWRcclxuYT1leHRtYXA6NCBodHRwOlxcXFx3d3cud2VicnRjLm9yZ1xcZXhwZXJpbWVudHNcXHJ0cC1oZHJleHRcXGFicy1zZW5kLXRpbWVcclxuYT1leHRtYXA6NSB1cm46aWV0ZjpwYXJhbXM6cnRwLWhkcmV4dDp0b2Zmc2V0XHJcbmE9ZXh0bWFwOjcgaHR0cDpcXFxcd3d3LmlldGYub3JnXFxpZFxcZHJhZnQtaG9sbWVyLXJtY2F0LXRyYW5zcG9ydC13aWRlLWNjLWV4dGVuc2lvbnMtMDFcclxuYT1leHRtYXAtYWxsb3ctbWl4ZWRcclxuYT1zZXR1cDphY3RwYXNzXHJcbmE9bWlkOjJcclxuYT1pbmFjdGl2ZVxyXG5hPWljZS11ZnJhZzo0YTQ2YWVkN1xyXG5hPWljZS1wd2Q6Mzg1MWM0ZmMyZjY0MGZmNjNlZWZhNmU1YjAzNWNlMTZcclxuYT1maW5nZXJwcmludDpzaGEtMjU2IERGOjk5OjUwOjMwOjU5Ojk0OkQyOjA4Ojg2OjVGOjE0OkY2OjlBOjcwOjdFOjMxOkQyOjBBOkRFOjEyOjc4OkY1OjQ3OkY5OjUyOjgwOjdCOjkwOjkxOjIwOjM2OjQwXHJcbmE9c3NyYzo1MTA3MTI3MjggY25hbWU6ezQ3NTJiNGMwLTU5YTEtNGNlYy1hMzQ3LTJjODc1MzhmNGM0N31cclxuYT1ydGNwLW11eFxyXG5hPXJ0Y3AtcnNpemVcclxuYT1idW5kbGUtb25seVxyXG5hPWxhYmVsOmFwcGxpY2F0aW9uc2hhcmluZy12aWRlb1xyXG5tPXgtZGF0YSA1MjIxNCBSVFAvU0FWUCAxMjcgMTI2XHJcbmM9SU4gSVA0IDUyLjExNC4yMzcuMjIxXHJcbmE9eC1kYXRhLXByb3RvY29sOnNjdHBcclxuYT14LXNzcmMtcmFuZ2U6MTk1ODM2MDM5MC0xOTU4MzYwMzkwXHJcbmE9cnRwbWFwOjEyNyB4LWRhdGEvOTAwMDBcclxuYT1ydHBtYXA6MTI2IHJ0eC85MDAwMFxyXG5hPWZtdHA6MTI2IGFwdD0xMjdcclxuYT1leHRtYXAtYWxsb3ctbWl4ZWRcclxuYT1zZXR1cDphY3RwYXNzXHJcbmE9bWlkOjNcclxuYT1zZW5kcmVjdlxyXG5hPWljZS11ZnJhZzo0YTQ2YWVkN1xyXG5hPWljZS1wd2Q6Mzg1MWM0ZmMyZjY0MGZmNjNlZWZhNmU1YjAzNWNlMTZcclxuYT1maW5nZXJwcmludDpzaGEtMjU2IERGOjk5OjUwOjMwOjU5Ojk0OkQyOjA4Ojg2OjVGOjE0OkY2OjlBOjcwOjdFOjMxOkQyOjBBOkRFOjEyOjc4OkY1OjQ3OkY5OjUyOjgwOjdCOjkwOjkxOjIwOjM2OjQwXHJcbmE9cnRjcC1tdXhcclxuYT1idW5kbGUtb25seVxyXG5hPWxhYmVsOmRhdGFcclxuYT1zY3RwLXBvcnQ6NTAwMFxyXG5hPW1heC1tZXNzYWdlLXNpemU6MTA3Mzc0MTgyM1xyXG4iLCJtZWRpYUxlZ0lkIjoiNjU1MjEyQTY0MjIyNDVGQUJDQzg0MEMzMENCMzZEQjIiLCJlc2NhbGF0aW9uT2NjdXJyaW5nIjpmYWxzZSwibmV3T2ZmZXIiOmZhbHNlLCJjbGllbnRMb2NhdGlvbiI6IkdCIiwicmVxdWlyZWRGZWF0dXJlcyI6Im5vbkJ5UGFzcyIsImFwcGx5Q2hhbm5lbFBhcmFtZXRlcnMiOnsibXVsdGlDaGFubmVsUGFyYW1ldGVyIjp7Im1pZHMiOlsiKiJdLCJtZWRpYVBhcmFtZXRlciI6IntcInNlbmRTaWRlQldTZWVkXCI6e1wic2VlZFZhbHVlQml0c1BlclNlY1wiOjYwMDAwMH19In19fSwidWRwS2V5Ijp7InNlc3Npb25LZXkiOiJzenpRUFFsZzd6d2JjZzIyU3JOSmRBPT0iLCJ0aWNrZXQiOiJBSlRBaktRWnl1S2YwUWNWekhkYzZnPT0ifSwiY2xpZW50RW5kcG9pbnRDYXBhYmlsaXRpZXMiOjg4MTIyMjYsInJlcGxhY2VzIjpudWxsLCJ2b2ljZW1haWxTZXR0aW5ncyI6e319LCJjb252ZXJzYXRpb25JbnZpdGF0aW9uIjp7ImNvbnZlcnNhdGlvbkNvbnRyb2xsZXIiOiJodHRwczovL2FwaS5mbGlnaHRwcm94eS50ZWFtcy5taWNyb3NvZnQuY29tL2FwaS92Mi9lcC9jb252LWZyY2UtMDEtcHJvZC1ha3MuY29udi5za3lwZS5jb20vY29udi92c215R2JvTEFVbXdCampuMzd0Qlh3P2k9MTAtMTI4LTMzLTE4JmU9NjM4OTc4MjAxNDQxNjQ1Njk5IiwiaXNNdWx0aVBhcnR5IjpmYWxzZSwiaXNCcm9hZGNhc3QiOmZhbHNlfSwiZGVidWdDb250ZW50Ijp7ImVjc0V0YWciOiJcIlk4d04zVHJDaUtlUG9HMlJ0MkM3SFdHbXY5K3JmS3Voek1hRmNGbHNYWU09XCIiLCJjYWxsSWQiOiJmN2VkODgwNC04NDk5LTQ1ODUtOTY5NC0xODgxMzliZDZkN2YiLCJQcm9jZXNzaW5nQ2FsbENvbnRyb2xsZXJJbnN0YW5jZSI6Imh0dHBzOi8vY2MtZnJjZS0wMy1wcm9kLWFrcy5jYy5za3lwZS5jb20vIiwicG90ZW50aWFsQ2FsbE5vdGlmaWNhdGlvblNlbnQiOmZhbHNlLCJwYXJ0aWNpcGFudElkIjoiMzNiYWU0OWEtYzdiZi00ZmU2LWJmZmItZDVmY2ExYTUwYWY1In0sImdyb3VwQ29udGV4dCI6bnVsbH0="
    }
    ```
  - `gp`: (base64)
    ```json
    {
      "callNotification": {
        "from": {
          "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "displayName": "Ben Bucksch",
          "displayNameSource": "aad",
          "endpointId": "4f68ab41-919f-48f8-81aa-3864fd1b710f",
          "languageId": "en-US",
          "participantId": "e4bcec7a-1e4f-49ee-bf1b-2644df7c7f5e",
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
          "participantId": "33bae49a-c7bf-4fe6-bffb-d5fca1a50af5",
          "hidden": false,
          "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
          "propertyBag": null
        },
        "links": {
          "attach": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-03-prod-aks.cc.skype.com/cc/v1/forked/0b0ba992-61b9-4c62-a10f-4f86f7ec5bbf/27/i1/1227/attach?i=10-128-0-94",
          "mediaAnswer": "cc://ma",
          "progress": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-03-prod-aks.cc.skype.com/cc/v1/forked/0b0ba992-61b9-4c62-a10f-4f86f7ec5bbf/27/i1/1227/progress?i=10-128-0-94",
          "reject": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-frce-03-prod-aks.cc.skype.com/cc/v1/forked/0b0ba992-61b9-4c62-a10f-4f86f7ec5bbf/27/i1/1227/reject?i=10-128-0-94",
          "udpTransport": "udp://52.123.145.20:3478/"
        },
        "mediaContent": {
          "contentType": "application/sdp-ngc-1.0",
          "blob": "v=0\r\no=mozilla...THIS_IS_SDPARTA-99.0 1707255592464996430 0 IN IP4 0.0.0.0\r\ns=-\r\nb=CT:4000\r\nt=0 0\r\na=sendrecv\r\na=ice-options:trickle\r\na=msid-semantic: WMS *\r\na=group:BUNDLE 0 1 2 3\r\nm=audio 52214 RTP/SAVP 96 109 9 0 8 101\r\nc=IN IP4 52.114.237.221\r\na=x-signaling-fb:* x-message app recv:dsh\r\na=x-ssrc-range:2114709974-2114709974\r\na=rtpmap:96 CN/48000\r\na=rtpmap:109 opus/48000/2\r\na=rtpmap:9 G722/8000/1\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:101 telephone-event/8000\r\na=fmtp:109 maxplaybackrate=48000;stereo=1;useinbandfec=1\r\na=fmtp:101 0-15\r\na=rtcp:52214\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap-allow-mixed\r\na=setup:actpass\r\na=mid:0\r\na=msid:{d285b5ef-4fe7-4fd2-9b88-44d0c98205f5} {9c07dcb3-aca0-480a-8e5b-203a2e4642c7}\r\na=sendrecv\r\na=ice-ufrag:4a46aed7\r\na=ice-pwd:3851c4fc2f640ff63eefa6e5b035ce16\r\na=fingerprint:sha-256 DF:99:50:30:59:94:D2:08:86:5F:14:F6:9A:70:7E:31:D2:0A:DE:12:78:F5:47:F9:52:80:7B:90:91:20:36:40\r\na=candidate:0 1 UDP 2122252543 192.168.255.11 56991 typ host\r\na=candidate:0 2 UDP 2122252542 192.168.255.11 56992 typ host\r\na=candidate:3 1 tcp-act 2105524479 192.168.255.11 9 typ host\r\na=candidate:3 2 tcp-act 2105524478 192.168.255.11 9 typ host\r\na=candidate:4 1 UDP 8331263 52.114.237.221 52214 typ relay raddr 52.114.237.221 rport 52214\r\na=ssrc:2114709974 cname:{4752b4c0-59a1-4cec-a347-2c87538f4c47}\r\na=rtcp-mux\r\na=label:main-audio\r\nm=video 52214 RTP/SAVP 120 124 121 125 126 127 97 98 105 106 103 104 99 100 123 122 119\r\nc=IN IP4 52.114.237.221\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:2016009990-2016009990\r\na=rtpmap:120 VP8/90000\r\na=rtpmap:124 rtx/90000\r\na=rtpmap:121 VP9/90000\r\na=rtpmap:125 rtx/90000\r\na=rtpmap:126 H264/90000\r\na=rtpmap:127 rtx/90000\r\na=rtpmap:97 H264/90000\r\na=rtpmap:98 rtx/90000\r\na=rtpmap:105 H264/90000\r\na=rtpmap:106 rtx/90000\r\na=rtpmap:103 H264/90000\r\na=rtpmap:104 rtx/90000\r\na=rtpmap:99 AV1/90000\r\na=rtpmap:100 rtx/90000\r\na=rtpmap:123 ulpfec/90000\r\na=rtpmap:122 red/90000\r\na=rtpmap:119 rtx/90000\r\na=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1\r\na=fmtp:105 profile-level-id=42001f;level-asymmetry-allowed=1;packetization-mode=1\r\na=fmtp:103 profile-level-id=42001f;level-asymmetry-allowed=1\r\na=fmtp:120 max-fs=12288;max-fr=60\r\na=fmtp:124 apt=120\r\na=fmtp:121 max-fs=12288;max-fr=60\r\na=fmtp:125 apt=121\r\na=fmtp:127 apt=126\r\na=fmtp:98 apt=97\r\na=fmtp:106 apt=105\r\na=fmtp:104 apt=103\r\na=fmtp:100 apt=99\r\na=fmtp:119 apt=122\r\na=rtcp-fb:120 nack\r\na=rtcp-fb:120 nack pli\r\na=rtcp-fb:120 ccm fir\r\na=rtcp-fb:120 goog-remb\r\na=rtcp-fb:120 transport-cc\r\na=rtcp-fb:121 nack\r\na=rtcp-fb:121 nack pli\r\na=rtcp-fb:121 ccm fir\r\na=rtcp-fb:121 goog-remb\r\na=rtcp-fb:121 transport-cc\r\na=rtcp-fb:126 nack\r\na=rtcp-fb:126 nack pli\r\na=rtcp-fb:126 ccm fir\r\na=rtcp-fb:126 goog-remb\r\na=rtcp-fb:126 transport-cc\r\na=rtcp-fb:97 nack\r\na=rtcp-fb:97 nack pli\r\na=rtcp-fb:97 ccm fir\r\na=rtcp-fb:97 goog-remb\r\na=rtcp-fb:97 transport-cc\r\na=rtcp-fb:105 nack\r\na=rtcp-fb:105 nack pli\r\na=rtcp-fb:105 ccm fir\r\na=rtcp-fb:105 goog-remb\r\na=rtcp-fb:105 transport-cc\r\na=rtcp-fb:103 nack\r\na=rtcp-fb:103 nack pli\r\na=rtcp-fb:103 ccm fir\r\na=rtcp-fb:103 goog-remb\r\na=rtcp-fb:103 transport-cc\r\na=rtcp-fb:99 nack\r\na=rtcp-fb:99 nack pli\r\na=rtcp-fb:99 ccm fir\r\na=rtcp-fb:99 goog-remb\r\na=rtcp-fb:99 transport-cc\r\na=rtcp-fb:123 nack\r\na=rtcp-fb:123 nack pli\r\na=rtcp-fb:123 ccm fir\r\na=rtcp-fb:123 goog-remb\r\na=rtcp-fb:123 transport-cc\r\na=rtcp-fb:122 nack\r\na=rtcp-fb:122 nack pli\r\na=rtcp-fb:122 ccm fir\r\na=rtcp-fb:122 goog-remb\r\na=rtcp-fb:122 transport-cc\r\na=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:4 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:7 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap-allow-mixed\r\na=setup:actpass\r\na=mid:1\r\na=recvonly\r\na=ice-ufrag:4a46aed7\r\na=ice-pwd:3851c4fc2f640ff63eefa6e5b035ce16\r\na=fingerprint:sha-256 DF:99:50:30:59:94:D2:08:86:5F:14:F6:9A:70:7E:31:D2:0A:DE:12:78:F5:47:F9:52:80:7B:90:91:20:36:40\r\na=ssrc:2016009990 cname:{4752b4c0-59a1-4cec-a347-2c87538f4c47}\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=bundle-only\r\na=label:main-video\r\nm=video 52214 RTP/SAVP 120 124 121 125 126 127 97 98 105 106 103 104 99 100 123 122 119\r\nc=IN IP4 52.114.237.221\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:510712728-510712728\r\na=rtpmap:120 VP8/90000\r\na=rtpmap:124 rtx/90000\r\na=rtpmap:121 VP9/90000\r\na=rtpmap:125 rtx/90000\r\na=rtpmap:126 H264/90000\r\na=rtpmap:127 rtx/90000\r\na=rtpmap:97 H264/90000\r\na=rtpmap:98 rtx/90000\r\na=rtpmap:105 H264/90000\r\na=rtpmap:106 rtx/90000\r\na=rtpmap:103 H264/90000\r\na=rtpmap:104 rtx/90000\r\na=rtpmap:99 AV1/90000\r\na=rtpmap:100 rtx/90000\r\na=rtpmap:123 ulpfec/90000\r\na=rtpmap:122 red/90000\r\na=rtpmap:119 rtx/90000\r\na=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1;max-fs=8160;max-mbps=135000;max-fps=1500\r\na=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1\r\na=fmtp:105 profile-level-id=42001f;level-asymmetry-allowed=1;packetization-mode=1\r\na=fmtp:103 profile-level-id=42001f;level-asymmetry-allowed=1\r\na=fmtp:120 max-fs=12288;max-fr=60\r\na=fmtp:124 apt=120\r\na=fmtp:121 max-fs=12288;max-fr=60\r\na=fmtp:125 apt=121\r\na=fmtp:127 apt=126\r\na=fmtp:98 apt=97\r\na=fmtp:106 apt=105\r\na=fmtp:104 apt=103\r\na=fmtp:100 apt=99\r\na=fmtp:119 apt=122\r\na=rtcp-fb:120 nack\r\na=rtcp-fb:120 nack pli\r\na=rtcp-fb:120 ccm fir\r\na=rtcp-fb:120 goog-remb\r\na=rtcp-fb:120 transport-cc\r\na=rtcp-fb:121 nack\r\na=rtcp-fb:121 nack pli\r\na=rtcp-fb:121 ccm fir\r\na=rtcp-fb:121 goog-remb\r\na=rtcp-fb:121 transport-cc\r\na=rtcp-fb:126 nack\r\na=rtcp-fb:126 nack pli\r\na=rtcp-fb:126 ccm fir\r\na=rtcp-fb:126 goog-remb\r\na=rtcp-fb:126 transport-cc\r\na=rtcp-fb:97 nack\r\na=rtcp-fb:97 nack pli\r\na=rtcp-fb:97 ccm fir\r\na=rtcp-fb:97 goog-remb\r\na=rtcp-fb:97 transport-cc\r\na=rtcp-fb:105 nack\r\na=rtcp-fb:105 nack pli\r\na=rtcp-fb:105 ccm fir\r\na=rtcp-fb:105 goog-remb\r\na=rtcp-fb:105 transport-cc\r\na=rtcp-fb:103 nack\r\na=rtcp-fb:103 nack pli\r\na=rtcp-fb:103 ccm fir\r\na=rtcp-fb:103 goog-remb\r\na=rtcp-fb:103 transport-cc\r\na=rtcp-fb:99 nack\r\na=rtcp-fb:99 nack pli\r\na=rtcp-fb:99 ccm fir\r\na=rtcp-fb:99 goog-remb\r\na=rtcp-fb:99 transport-cc\r\na=rtcp-fb:123 nack\r\na=rtcp-fb:123 nack pli\r\na=rtcp-fb:123 ccm fir\r\na=rtcp-fb:123 goog-remb\r\na=rtcp-fb:123 transport-cc\r\na=rtcp-fb:122 nack\r\na=rtcp-fb:122 nack pli\r\na=rtcp-fb:122 ccm fir\r\na=rtcp-fb:122 goog-remb\r\na=rtcp-fb:122 transport-cc\r\na=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:4 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:5 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:7 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap-allow-mixed\r\na=setup:actpass\r\na=mid:2\r\na=inactive\r\na=ice-ufrag:4a46aed7\r\na=ice-pwd:3851c4fc2f640ff63eefa6e5b035ce16\r\na=fingerprint:sha-256 DF:99:50:30:59:94:D2:08:86:5F:14:F6:9A:70:7E:31:D2:0A:DE:12:78:F5:47:F9:52:80:7B:90:91:20:36:40\r\na=ssrc:510712728 cname:{4752b4c0-59a1-4cec-a347-2c87538f4c47}\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=bundle-only\r\na=label:applicationsharing-video\r\nm=x-data 52214 RTP/SAVP 127 126\r\nc=IN IP4 52.114.237.221\r\na=x-data-protocol:sctp\r\na=x-ssrc-range:1958360390-1958360390\r\na=rtpmap:127 x-data/90000\r\na=rtpmap:126 rtx/90000\r\na=fmtp:126 apt=127\r\na=extmap-allow-mixed\r\na=setup:actpass\r\na=mid:3\r\na=sendrecv\r\na=ice-ufrag:4a46aed7\r\na=ice-pwd:3851c4fc2f640ff63eefa6e5b035ce16\r\na=fingerprint:sha-256 DF:99:50:30:59:94:D2:08:86:5F:14:F6:9A:70:7E:31:D2:0A:DE:12:78:F5:47:F9:52:80:7B:90:91:20:36:40\r\na=rtcp-mux\r\na=bundle-only\r\na=label:data\r\na=sctp-port:5000\r\na=max-message-size:1073741823\r\n",
          "mediaLegId": "655212A6422245FABCC840C30CB36DB2",
          "escalationOccurring": false,
          "newOffer": false,
          "clientLocation": "GB",
          "requiredFeatures": "nonByPass",
          "applyChannelParameters": {
            "multiChannelParameter": {
              "mids": [
                "*"
              ],
              "mediaParameter": "{\"sendSideBWSeed\":{\"seedValueBitsPerSec\":600000}}"
            }
          }
        },
        "udpKey": {
          "sessionKey": "szzQPQlg7zwbcg22SrNJdA==",
          "ticket": "AJTAjKQZyuKf0QcVzHdc6g=="
        },
        "clientEndpointCapabilities": 8812226,
        "replaces": null,
        "voicemailSettings": {}
      },
      "conversationInvitation": {
        "conversationController": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw?i=10-128-33-18&e=638978201441645699",
        "isMultiParty": false,
        "isBroadcast": false
      },
      "debugContent": {
        "ecsEtag": "\"Y8wN3TrCiKePoG2Rt2C7HWGmv9+rfKuhzMaFcFlsXYM=\"",
        "callId": "f7ed8804-8499-4585-9694-188139bd6d7f",
        "ProcessingCallControllerInstance": "https://cc-frce-03-prod-aks.cc.skype.com/",
        "potentialCallNotificationSent": false,
        "participantId": "33bae49a-c7bf-4fe6-bffb-d5fca1a50af5"
      },
      "groupContext": null
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1867275280,
    "status": 200,
    "headers": {
      "MS-CV": "rVpukiwaa06IZnjsYAwAAA.3.1.0",
      "trouter-request": "{\"id\":\"6d6ee961-a006-466b-b750-118930d49ad0\",\"src\":\"10.128.147.98\",\"port\":3443}",
      "trouter-client": "{\"cd\":74}"
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
    "id": 435071557,
    "method": "POST",
    "url": "/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/0dc5d7ef-22bb-42af-8e64-ccc3f35e1d95/d2512c70/conversation/conversationUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-dewc-04-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "f7ed8804-8499-4585-9694-188139bd6d7f",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "69bbe852-6f96-4c24-917d-ec0cb7d1b032",
      "X-Microsoft-Skype-Message-ID": "97a2ffdd-185f-4dcb-8d88-7cbc08074f49",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-c64ceaa075bea83f36428a323165ef0f-e1f6b289cbfa7b70-00",
      "MS-CV": "jIdGCUFUJ0qBKQUyLVyTPw.1",
      "trouter-request": "{\"id\":\"42da1afb-e51c-4a6a-a5a2-bd44ceff2cf0\",\"src\":\"10.128.145.68\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "H4sIAAAAAAAAA8yY30/bMBDH3/dXoDzsiaT50R9pJTQVGAyJTkiwadqbm1xbg2NntlOoEP/7zklbAkUTZg/uS6s4tu/z9Z3tyz1+OjjwMsGXIBXRVPATwbUUjIH0RgfeQutSjTodUtJgxuh8oUspHlaBBlKooKCZFErMdJCJwvTpLOMOlB0znz+TGfhh5OOA3Cd3KjCtgbpblVB3N4+dpSpW51NxOf5R3B/f3vJkoI9/3X+hR1HoR3HqJ4kfpZ/hqJ+kw0Eah1G3G/W7vf5w6B0acgV/KuAZfK+KaU0cNc3V9BYybRQ0/Uim6RImIieMagoK3zxiu9FOGMMnXjF22LRIIOyGFjA2Y6henQHk2/74nlF+V0/wVLeY36fGqiYanmemalIxTa+I1CtsnRGmYG1iLkVVnqDlC444RAv5EoGqYylInhGlX43ESQE05fOaDu3lmw5bjC1fM4IBWYI7X3Zq++/2qPFVnps1oxktCdcOyV+C2EiQUIgl7IeKHRZLX6w3zcqtIzYUHw+kMd8TKfaBtAfcL0FsJBSVdnn8GPM2uBV3DNwA2CBzoemMZvX1fbk+/F3R77BYhQrIudNYMfatgqXM8Qr+yvNSUK4noAk+E5fB8ybQxyVdr1Oa/dBT09jdAAV1m0GgfRvgdib+DZlvJOGqFHIrAjX04iCKkyBKkqAXdjD73QxWoNfJ4SVZicql8Nco9hHYurmvpChBrtN2t5H4JpWNuLKaMqoWrvdVG8M+H3FN36KwD6x1XF6DNn/uQ+oVj40gBURmi1ZMulSzC2MjZQ56zNieSNmFsb50xnVVwem9gwj/dexOSFliRDrfILtIdnsEv/tAKeI0s2xRfPzEMufd/pxXNc27xGwrUxo4OvHClKy8JElzGEDqT6OQ+F0yyHwC067fzfLZIO7PsjRKm9qdhDlmQ2ZMDk2LqdldUgzxVpkL7wRCOYKdVrJOny74hPKqWbF+uPnCIA+4LcQ95K+OmijcdMF0i6u6IOdt3AB8JnDdrsjqvm35ZdlNaYnL35zkVXlGKKsknMK0ml/g8FZ9z2N1SnSKyTllqv0CHVAKRQ39NcglzeCNTkLSOeWEnf+rhuhlCINNJ4wC1z8xpWyWsGXqOdFEV0ptKp5GcxzGPT+K/LB3E0ejMB510yAaDsNeMvztfXr6CwAA//8DAK7/JE8wFgAA"
  }
  ```
  - `body`: (gzipped base64)
    ```json
    {
      "conversationController": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw?i=10-128-33-18&e=638978201441645699",
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
        "leave": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/leave?i=10-128-33-18&e=638978201441645699",
        "addParticipant": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/addParticipant?i=10-128-33-18&e=638978201441645699",
        "removeParticipant": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/removeParticipant?i=10-128-33-18&e=638978201441645699",
        "addModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/addModality?i=10-128-33-18&e=638978201441645699",
        "addParticipantAndModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/add?i=10-128-33-18&e=638978201441645699",
        "removeModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/removeModality?i=10-128-33-18&e=638978201441645699",
        "mute": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/mute?i=10-128-33-18&e=638978201441645699",
        "unmute": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/unmute?i=10-128-33-18&e=638978201441645699",
        "notificationLinks": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/notificationLinks?i=10-128-33-18&e=638978201441645699",
        "merge": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/merge?i=10-128-33-18&e=638978201441645699",
        "updateEndpointMetadata": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/updateEndpointMetadata?i=10-128-33-18&e=638978201441645699",
        "updateEndpointState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/updateEndpointState?i=10-128-33-18&e=638978201441645699",
        "admit": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/admit?i=10-128-33-18&e=638978201441645699",
        "conversationHttpTransport": "http://52.123.133.50/enc",
        "setMeetingLayout": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/setMeetingLayout?i=10-128-33-18&e=638978201441645699",
        "updateParticipantProperties": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/updateParticipantProperties?i=10-128-33-18&e=638978201441645699",
        "publishState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/publishState?i=10-128-33-18&e=638978201441645699",
        "removeState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/removeState?i=10-128-33-18&e=638978201441645699",
        "updateMeetingSettings": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/updateMeetingSettings?i=10-128-33-18&e=638978201441645699",
        "searchParticipants": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/searchParticipants?i=10-128-33-18&e=638978201441645699",
        "getAllParticipants": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/getAllParticipants?i=10-128-33-18&e=638978201441645699",
        "admitAll": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/admitAll?i=10-128-33-18&e=638978201441645699",
        "updateParticipantMapping": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/updateParticipantMapping?i=10-128-33-18&e=638978201441645699",
        "sendMessage": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/sendMessage?i=10-128-33-18&e=638978201441645699",
        "updateMeetingStates": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-frce-01-prod-aks.conv.skype.com/conv/vsmyGboLAUmwBjjn37tBXw/updateMeetingStates?i=10-128-33-18&e=638978201441645699"
      },
      "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "region": "de",
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
      "conversationStartTime": "2025-11-05T21:02:48.1990539Z"
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 435071557,
    "status": 200,
    "headers": {
      "MS-CV": "jIdGCUFUJ0qBKQUyLVyTPw.1.0",
      "trouter-request": "{\"id\":\"42da1afb-e51c-4a6a-a5a2-bd44ceff2cf0\",\"src\":\"10.128.145.68\",\"port\":3443}",
      "trouter-client": "{\"cd\":11}"
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
    "id": 1042912624,
    "method": "POST",
    "url": "/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/0dc5d7ef-22bb-42af-8e64-ccc3f35e1d95/1637ea79/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-dewc-04-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "f7ed8804-8499-4585-9694-188139bd6d7f",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "3bf011bf-b216-47fa-8aec-cf6e50051b0f",
      "X-Microsoft-Skype-Message-ID": "047b8fb2-f916-408f-9427-c027649f6eff",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-c64ceaa075bea83f36428a323165ef0f-a5d1bb89021d6b7c-00",
      "MS-CV": "bwEWovphFEuvZjnTiuNRPQ.1",
      "trouter-request": "{\"id\":\"73b0c8e0-d162-4a33-a082-bafaecbfc9bc\",\"src\":\"10.128.132.63\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "H4sIAAAAAAAAA+1YW2/iRhR+z69AlrpPGTxjj2+sUJWEtCUKZDd4sw1VH8bjY5hgbNc2SWC1/70zDiHGwG5aVbtq1URCyrnNuXxzviGfjlotLWN5KbjIWFIWWqf1Scqk1O2k+USEHQsz4jDPRA6YJqI0IihgECE3MkxKLScywdl4Sb97yAuRJlJEjp9lRclKkBKN8VLcg7ZRhFAyERc1fykUoTL9S+cfv3iHoshithyyeXXiKSSt0wWfFXx6wGqULnJe2Z6c9Oo2WZ5mkJfLUzbZSlCqmLhJBYezNCkgKRta1QQWL2BHvON4szbTsLZl+Pl4O1wBfywg4TBczAPIVWtr+s9He9y0HIqqrr5qZrKI43phLwP3l1mVgEh8SOTf9fohCbNUJGUVQsPrH7Tn4/lH23/IvhxilkwWbLI3v6kIQ1AIilhcQE1RVjk+5WOabggOuCggmCHKHI4YBBRRHkaOYUfcJW49nzS4A772fRWmjhpN3fSjAVca2S4LKEEe8SJE3chFLmEMma5No5AEDsFREz+cxfEuagrI5e0ZLEq42VwiXJ90HRabdM5YxgIRi1KAysx2tqx4LCTQzvfbui4xDMPecmjOTQMacOAOQwSorM8DQEFEAmTYlMpWcyeyQNtz5ksN2mgmYTbKGIdCJ5RYumERTGxiW9jT06L7IJIwfSjettJCenWHfovgNn7bCuFeXhaF0S5P55lsTP62FeTSVFpFIocofdwIlCehVhvrfnEm+yuSyTqFroENq01lSNKm+tV90LU8anPmyvFTx+GB6QYkJG5kGsxjkVRFFnGobVNtb8cHcmuFrGS7E5ymcTrJWTYVvNFq8+Act26CPAN9GDXaKYu5FMms2D0vB7nFOMyflpA2Lcus6Og65yiSdx9hE8klFiI2K9qctws1hrbsZIdSUxrp90RXwd+9jFzHAQ6Y5xnIJoEnL5NtICYBjGjk2pED3AqCSCemPjN16mG9lsCPedl9xoqCikKKAkodJ29y3oXlxTL8OZ7171Jx1cvu+TzMxr2UDH4+fxwa59Zgic2xP1hd+u/x+O68vJ3/FI8FpuO7/mrYe0+Gxu1q7HNxeabiPGYqzvgjLW9uBk+yXy5WSnb90cLjXy8e+DxejW9Ol4E5tfriQfDk+mGcDMRVUnrR+x8My+xVH29El2BEDBdh5NE30LVN13OoRQ3TdalsCd7a0vsv44X88MUT9SjUIUIQtnyDdLDZwUabUowptsbbE56nIZNIWSpvqGCgAHwIfFBKaF+ncYWr37YBkaQJ1LP8/YUcdvZZLkNUpBzORfLCyfPGAU8h1m4bWibc8iw3tBDQav2aFmIY1EYNbHl5POzZ9a33jz8LXnX+4WfBEETcumbFVC6PdPbVl0G+SEo51ZN3/cMPhAaJ/U/AXyDgV03vtQTM7YCHhFkyEcdFlLghco2QIGLL5e46LgHX+H4EvMOnpinfGtRjiDuB2qtgSz6NAhRaEWeyDMwi63vwKZ/m6RwadEraWP1+U0rd3+XRelk0RralHu28k5sP6b1B1HIp1NTDZ8hvv8b/S9RtOPrM0OUsmtT9DEuFSgVKhck6JL9A3Y+3qw/W0J/OhiMSD3un00v/ejpYfShv/dO4ovOPfWPon5tX/ok1nN/+PepO8DelaYMS819I00drV61cE0sPYnmtKtHu18jjxvf/s3Sx9U+AMi1ZHWNKZaxfAlkOU5DXKWzo8Vofp0GwPKB7iispUoJPLpSaJlc5Fqqyk1KyTSl3zV67KkJlEgJ8JcA+s1Qu+ihOH551VeXN+H11qqzz6zkesCzKHJgc2+SsWuE7BVzlE5aI1dpJze7o85+kkQKDlBEAAA=="
  }
  ```
  - `body`: (gzipped base64)
    ```json
    {
      "participants": {
        "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7": {
          "version": 1,
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
            "4f68ab41-919f-48f8-81aa-3864fd1b710f": {
              "call": {
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 67,
              "clientEndpointCapabilities": 8812226,
              "participantId": "e4bcec7a-1e4f-49ee-bf1b-2644df7c7f5e",
              "clientVersion": "SkypeSpaces/1415/25101616509/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {
                "holographicCapabilities": 3
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-frce-03-prod-aks.cc.skype.com:443/cc/v1/callParticipant/0b0ba992-61b9-4c62-a10f-4f86f7ec5bbf/13/k3/490/replacement?rt=e4bcec7a1e4f49eebf1b2644df7c7f5e&rc=eyJydGlkIjoiODpvcmdpZDo1MGExN2E5My03ZTMzLTQ0ZjEtYmFlZi04ZjIzNDQ1N2YzZTciLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5IiwicnRwZnMiOnt9fQ%253D%253D&i=10-128-0-94&e=638974542388499200"
              },
              "endpointJoinTime": "2025-11-05T21:03:02.4400405Z",
              "modalityJoined": "Call",
              "endpointMeetingRoles": [
                "none"
              ]
            }
          },
          "role": "admin",
          "meetingRoles": []
        },
        "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f": {
          "version": 1,
          "state": "active",
          "details": {
            "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
            "displayName": "Neil Rashbrook",
            "displayNameSource": "runtimeAPI",
            "propertyBag": null,
            "resourceId": null,
            "participantType": "inTenant",
            "endpointId": "00000000-0000-0000-0000-000000000000",
            "participantId": null,
            "languageId": null,
            "hidden": false,
            "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
            "objectId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f"
          },
          "endpoints": {
            "c6bcd1a5-b178-418d-82d1-164778781e82": {
              "call": {
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 67,
              "participantId": "33bae49a-c7bf-4fe6-bffb-d5fca1a50af5",
              "clientVersion": "SkypeSpaces/1415/25101616509/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {},
              "endpointState": {
                "endpointStateSequenceNumber": 1,
                "state": {
                  "isMuted": false
                }
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-frce-03-prod-aks.cc.skype.com:443/cc/v1/callParticipant/0b0ba992-61b9-4c62-a10f-4f86f7ec5bbf/27/k2/517/replacement?rt=33bae49ac7bf4fe6bffbd5fca1a50af5&rc=eyJydGlkIjoiODpvcmdpZDoxYzU5NThkNS1lNDBhLTRhMzUtYTBlMy03ZWI2NTE3OTA5NmYiLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5In0%253D&i=10-128-0-94&e=638974542388499200"
              },
              "endpointJoinTime": "2025-11-05T21:03:02.4402413Z",
              "modalityJoined": "Call",
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
      "sequenceNumber": 1,
      "participantCounts": {
        "totalParticipants": 2,
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
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1042912624,
    "status": 200,
    "headers": {
      "MS-CV": "bwEWovphFEuvZjnTiuNRPQ.1.0",
      "trouter-request": "{\"id\":\"73b0c8e0-d162-4a33-a082-bafaecbfc9bc\",\"src\":\"10.128.132.63\",\"port\":3443}",
      "trouter-client": "{\"cd\":3}"
    },
    "body": ""
  }
  ```
- receive: `3:::`
  ```json
  {
    "id": 1769518283,
    "method": "POST",
    "url": "/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/0dc5d7ef-22bb-42af-8e64-ccc3f35e1d95/1637ea79/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-dewc-04-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "f7ed8804-8499-4585-9694-188139bd6d7f",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12295",
      "X-Microsoft-Skype-Original-Message-ID": "646c302f-366f-4ecd-b7e0-e4336b70b852",
      "X-Microsoft-Skype-Message-ID": "90def596-3426-4ee5-9053-112da461179a",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-708dea0e6d4097d09ae074ef08bf555d-2cd4c2984bfd54c0-00",
      "MS-CV": "be1DvHevOkyZjsyzH1OYYQ.1",
      "trouter-request": "{\"id\":\"c0062055-4b5a-4658-90c6-e3d84da9b0da\",\"src\":\"10.128.71.85\",\"port\":3443}",
      "Trouter-TimeoutMs": "12795"
    },
    "body": "H4sIAAAAAAAAA5VVW0/rRhB+P78iilSe2HjXdwdF1QGqFgThiAQoqfqw3h0ne+Jb7U044Yj/3lmTBCcE0TqSFc9tZ/b7Zubnl06nW/JKK6FKnuu62+/8RBlKw35RTZXsM+FFXig9Ai7lxOWORzgFhwQQ+x4LIhr5ydYL/ZZQ1arIUWQfb2S15hpQ0uVCqyV0twoJmqu0bvmjUElj+r/OP37zlqouU74a8qw5cQgq7dzyehZXRTH/wHBULCrRmFeLXKsMvn67aJuWVVFCpVenfIpG+SJNW8oK6sb9Qr7Xta52vCqbE1Q+hhy/2/Ehl2Whct2E6NL1Qw68Nk/38CGHckh5Pl3w6cH8ZkpKMFglPK2hpdBNjq/5OE4oIYCQxKxBIBCEQ+wSV8gksP1EhCxs51PE30Gsff8TemvXly0tNvexRwzhx0Iy7mEiQUhcFkoS2pIR5rtBEAYhg9De8TA+PE33ZIaQUCFPrxca7rd0pS2Tl+N2jE06Z7zksUqVVmAy84Mdq30Y8N5iDm7EiQjihLgJ+CROkphILxEcy6A88bo7IUSqINdvKXVHc2TNqOQCaou5zLNsj1HmM9+jkVXUgyeVy+KpPukUNXoNhuMOoz160pGwVAIM5QaiyEqsszrpYAc8YeEDMauKDLbfxhFj96j5WeP6DG9M5dN1FgOb2l7PRRXrudbNMh54kesLHgbg4K2L2AljJlmYODaPeIKqBHF1fd/tHrzDa+x4yTU3mBy+5dF6WOxBtqMewT8LyAUMF1kMFRqz4z2ADwYxw6U2qMsN5XfULx8yYKeHMBVyN9pDDi/tSuXz+n3iFeCYEZAhssZ5pnVZ9y1LCJLg1CDUITheJOHzuidErzaI9xC0vus6aGQtmWWCf3tjl0VjGvMosonP4gjb0LcJZ9RQLPSTAIQXx4llB9bcthALq5XAr5UebGhpWGlIaTjZpuRRJQawulzJ39P5xfdC3ZyXS5HJcnJe/Hh8vvOG49l8OGLp8Px0djW+nV0/3+nH8Wl6vaLO5OHCHo5/c27GX71h9qiuzkycH6WJM3lw9f399avsj8tnI7t98Ojkz8snkaXPk/vTVezMvIuc/mJ7zvmRGjBKmB0SSiL3CAa+E0aB67m2E4Yulo9T8NOWvcTXWL2uAsNkwhih3thmfer0qd1zXWq7zJnsopkVkmObr4x3w5WuaYqPCA0a2+W2SJuh8Ncu+HmRQzvLv7f/X95NvQpDNEtSZip/25HZ3gGvIYx749rV68VyDim2VSOq99ujWcXtCXVWLHa2vS40b3OsftvfuP1gBthOck9P1/q0iOPVB7rXuLgikXw4UFqayuRYm8q+atw2GmfNQbsmQmMiAT4JcMiswEGfpMXTRtdUvh//wpyKdX6e4weWta6AI2zTs2aEvyvgppryXD2vnQx2X17+BTizpnB9CQAA"
  }
  ```
  - `body`: (gzipped base64)
    ```json
    {
      "participants": {
        "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f": {
          "version": 2,
          "state": "active",
          "details": {
            "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
            "displayName": "Neil Rashbrook",
            "displayNameSource": "runtimeAPI",
            "propertyBag": null,
            "resourceId": null,
            "participantType": "inTenant",
            "endpointId": "00000000-0000-0000-0000-000000000000",
            "participantId": null,
            "languageId": null,
            "hidden": false,
            "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
            "objectId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f"
          },
          "endpoints": {
            "c6bcd1a5-b178-418d-82d1-164778781e82": {
              "call": {
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 67,
              "participantId": "33bae49a-c7bf-4fe6-bffb-d5fca1a50af5",
              "clientVersion": "SkypeSpaces/1415/25101616509/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {},
              "endpointState": {
                "endpointStateSequenceNumber": 1,
                "state": {
                  "isMuted": false
                }
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-frce-03-prod-aks.cc.skype.com:443/cc/v1/callParticipant/0b0ba992-61b9-4c62-a10f-4f86f7ec5bbf/27/k2/517/replacement?rt=33bae49ac7bf4fe6bffbd5fca1a50af5&rc=eyJydGlkIjoiODpvcmdpZDoxYzU5NThkNS1lNDBhLTRhMzUtYTBlMy03ZWI2NTE3OTA5NmYiLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5In0%253D&i=10-128-0-94&e=638974542388499200"
              },
              "endpointJoinTime": "2025-11-05T21:03:02.4402413Z",
              "modalityJoined": "Call",
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
      "sequenceNumber": 2,
      "participantCounts": {
        "totalParticipants": 2,
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
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1769518283,
    "status": 200,
    "headers": {
      "MS-CV": "be1DvHevOkyZjsyzH1OYYQ.1.0",
      "trouter-request": "{\"id\":\"c0062055-4b5a-4658-90c6-e3d84da9b0da\",\"src\":\"10.128.71.85\",\"port\":3443}",
      "trouter-client": "{\"cd\":6}"
    },
    "body": ""
  }
  ```
- receive: `3:::`
  ```json
  {
    "id": 1071636923,
    "method": "POST",
    "url": "/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/0dc5d7ef-22bb-42af-8e64-ccc3f35e1d95/1637ea79/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-dewc-04-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "f7ed8804-8499-4585-9694-188139bd6d7f",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12297",
      "X-Microsoft-Skype-Original-Message-ID": "07d4182c-8e98-4c81-b6a6-7c46a7910540",
      "X-Microsoft-Skype-Message-ID": "c7bec66c-30b8-4c8c-93c1-a78ad618dc6e",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-d84bb5728d8c69a9ca17f9ea5fc0cad9-e8a7c8079c91683a-00",
      "MS-CV": "LsfHQudvaUSYU2VOCxyexg.1",
      "trouter-request": "{\"id\":\"eda24afb-fafc-4945-a691-8e18b3c810f9\",\"src\":\"10.128.65.254\",\"port\":3443}",
      "Trouter-TimeoutMs": "12797"
    },
    "body": "H4sIAAAAAAAAA5VWW2/qOBB+P78CIW2famInzo0KrU7b1S5VS48Kbbes9sGxHfAhxNnE0EOP+t93HC4NlKq7QUJkbv7G880MP7+0Wu2ClUZxVbDcVO1u6yfIQBp1dTlRoku4H/uR8JGkmCHKPB8xLD0UyiTwSRjjOEh3XuC3lGWldA4i73QrqwwzEiRtxo1ayvZOIaRhKqsa/iBUwpr+r/NP37yFqoqMrQZsXp84kCpr3bFqmpRazz4wHOpFyWvzcpEbNZdfv/WbpkWpC1ma1TmbgFG+yLKGspRV7d4X73WNqx2tivoElY9kDu/N+DIXhVa5qUO08eZBR762T/v4IccwZCyfLNjkKL6pEkLaWqUsq2RDYWqMazyeFwkZygglpK5AyBGTCUWUizR0g5RHJGri0cl3yTe+/6l6G9fXHS2293FADB4kXBDmA5AwQpREAkWuIIgENAyjMCIycvc8rA/LsgOZJaQsgac3CyMfdnTFDZPX02aMLZwLVrBEZcooaZEF4Z7VYRng3hImacwQD5MU0VQGKEnTBAk/5QzSwCz123sheKZkbt4gtYczYM2wYFxWDqHEd1yfYBKQwMexo6ves8qFfq7OWroCr95g1CK4g89aQi4Vl5ZyPa7nBeRZnrWgA54h8R6flnoud+/WEWJ3sP04o+oCbkzlkw2Knotdv0NBRTrUuV0mPT+mAWdRKD24dZ54UUIEiVLPZTFLQZVCXWkQ0PbRO7yBjhfMsPc1mepMT0pWTBU/uGjv08oMNwPmIOSeeij/Wcicy8FinsgSjMnpASmOBrEDqbJMEds22VO/fohtr+8ACrofHlQbLvpa5bPqPfBSwmjicg5ssM5TY4qq6zicoxQmDcIegpEkEJtVHc47lWVJBwrdpdQDI2dJHBv82xsjHZzghMWxiwKSxNC6gYsYwZaWUZCGkvtJkjpu6MxcB+rnNAD8WprelsqWyZbIlsdNGp+UvCdXVyvxezbrf9fq9rJY8rkoxpf6x9PLvT8YTWeDIckGl+fT69Hd9Obl3jyNzrObFfbGj313MPrNux199QfzJ3V9YeP8KGyc8SM1Dw83a9kfVy9Wdvfo4/GfV898nr2MH85XiTf1+zn+xfW9yxPVIxgRN0IYxfRE9gIvikPqU9eLIgrpw+T8lExX8DVS6/Vh2Y8IQdgfuaSLvS52O5RilxJvvF/NuRYMGLuy3jVX2raRPmoCaaDF7nRW8/uv/eLnOpdNlH/vfr++m5QlhKgXq5ir/G2vzg8OWIew7rVr22yW0aXMoBVrUXXYHvX6bk61C73Y+4dgtGFNjlmVu4YAG1NOJbSTONDjjT7TSbL6QLeOC2sVyAdDqKEpLcbKZvbVwIYyMJ+O2tURahMh5ScBjplpWA5ppp+3ujrzw/h9eyrk+TnGDywrU0oGZZtc1GP/XQK35YTl6mXjZGv35fVfqmyjk7EJAAA="
  }
  ```
  - `body`: (gzipped base64)
    ```json
    {
      "participants": {
        "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f": {
          "version": 3,
          "state": "active",
          "details": {
            "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
            "displayName": "Neil Rashbrook",
            "displayNameSource": "runtimeAPI",
            "propertyBag": null,
            "resourceId": null,
            "participantType": "inTenant",
            "endpointId": "00000000-0000-0000-0000-000000000000",
            "participantId": null,
            "languageId": null,
            "hidden": false,
            "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
            "objectId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f"
          },
          "endpoints": {
            "c6bcd1a5-b178-418d-82d1-164778781e82": {
              "call": {
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 67,
              "participantId": "33bae49a-c7bf-4fe6-bffb-d5fca1a50af5",
              "clientVersion": "SkypeSpaces/1415/25101616509/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {
                "holographicCapabilities": 3
              },
              "endpointState": {
                "endpointStateSequenceNumber": 1,
                "state": {
                  "isMuted": false
                }
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-frce-03-prod-aks.cc.skype.com:443/cc/v1/callParticipant/0b0ba992-61b9-4c62-a10f-4f86f7ec5bbf/27/k2/517/replacement?rt=33bae49ac7bf4fe6bffbd5fca1a50af5&rc=eyJydGlkIjoiODpvcmdpZDoxYzU5NThkNS1lNDBhLTRhMzUtYTBlMy03ZWI2NTE3OTA5NmYiLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5In0%253D&i=10-128-0-94&e=638974542388499200"
              },
              "endpointJoinTime": "2025-11-05T21:03:02.4402413Z",
              "modalityJoined": "Call",
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
      "sequenceNumber": 3,
      "participantCounts": {
        "totalParticipants": 2,
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
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1071636923,
    "status": 200,
    "headers": {
      "MS-CV": "LsfHQudvaUSYU2VOCxyexg.1.0",
      "trouter-request": "{\"id\":\"eda24afb-fafc-4945-a691-8e18b3c810f9\",\"src\":\"10.128.65.254\",\"port\":3443}",
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
- receive: `3:::`
  ```json
  {
    "id": 1769518471,
    "method": "POST",
    "url": "/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/0dc5d7ef-22bb-42af-8e64-ccc3f35e1d95/1637ea79/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-dewc-04-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "f7ed8804-8499-4585-9694-188139bd6d7f",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12297",
      "X-Microsoft-Skype-Original-Message-ID": "0e9641ff-45a3-49bd-af14-448f8872ccc2",
      "X-Microsoft-Skype-Message-ID": "3094207e-a1e3-4764-a512-ebc795c73aaa",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-a7338cc542aef9396f2303e98b7702e9-eaeedb59e47dcb73-00",
      "MS-CV": "wDufY0uB8EKXPhV0/N8e3g.1",
      "trouter-request": "{\"id\":\"bc0aac0b-fc3e-4265-a702-e915806c4d28\",\"src\":\"10.128.71.85\",\"port\":3443}",
      "Trouter-TimeoutMs": "12797"
    },
    "body": "H4sIAAAAAAAAA5VWWW/bRhB+968QCDRPWXGXXF4KhCI+mtqw7NpWnUZFH5bLWWltisuQKztykP/eISXb1GGk5QMBzn18M8PvB72eU4rKaqlLUdjaGfS+Iw2p8cBUU50NAipYJBKfROD7hHPFSCpAkVh5PudBpHyIXrRQ7wGqWpsCSfz9M622wgJSHCGtfgDnhZGBFTqvO/pI1Fkj+r/8v3/VznRd5mJ5Ieatx0MoeocLeV/L2RtSN2ZRyVb248fjrkxZmRIquzwU040AkSX0rdESjkxRQ2G3uE0RRL6AHfKO4u1azKHOhuCP95vmavi6gELCxWKeQoUKrMP/cbBHzamgbvM6bYpZLPK8m9hrw8fLsg1AF2Mo8LubPxRZaXRhWxMOXT9kz+v5cfY72RdDLorpQkz3xjfTWQYNgpTIa+gwbBvjKh7fjzOIICYpo4JwEUkiIOWEy0xFXqhkzOJuPCa9A7nW/U+YOtgq6ks9tuDKVRiLlDOSsEQRHquYxEwI4schVxlLI0bVNn6kyPNd1NRQ4fSMFhZuX4aIdjvdhcVLOEeiFKnOtdXQRBZGG1Iy1wi0k/2yccw8zws3FLb75gBPJchIEAYc80sASKpYSryQcyy1jFQAzh6frzk4N/cIs5tSSKhdxlngegGjLGRhQBPX1MNHXWTmsf7QMzVqDS/GPUb79EMvgwcclgajQ2nmJRam+tBLKxRFKaUrUObbC6HRZDzoU3dcH2F9dTFdhzD0qBf0OZpkfe5ePqTDIOGhFDG2n0eRTP04ZRmLle+JRChkqYBFPAy5s7fiI9xambBit4Mzk5tpJcqZllul9t/s48YkoA/y581WOTGZc13c17v+KsAtJmG+WkLOzNqyHriulETh7BPqE1xiGRH3dV/Kft20oY+VHHDuo5D7wNzG+B+vLXdpSlORJB4JWZrgMIUeEQhgwlUcqghkkKbKZb5777s8oW4ngF8rO3zGSgOVBikNULo4eVfJISzPltmn/P70zujL4/JBzrNycmzY6NPJtwvvJBgtqT8Zj57Ox1d0cndiv8x/yyea8snd6dPF8RW78L48TcZSnx81dr6VjZ3JZ25vb0cr2u9nTw3t+nNAJ3+dPcp5/jS5PVym/iw41Y9aFtePk2KkLwubqKtfvMA/bl/v9JBRwryYUJLwdzAM/TiJeMA9P445loRubOn9w3iGr7FenZ4GdYQxQoOxxwbUH1CvzzmlnAaTzQ7PTSYQKctGG1oYNAB+C3xgEdrXJm9x9fcmIApTQDfKf16Pw84+q9BEe5SzuS5eb/J8y8HKRKPeqjp2fTKOIccRaEk796k9/d1VcmQWG38X1ljRxV3D8lYh4N2FGeAPQ7bFp2t+btJ0+QZvZRePHwISh7/DqZoY6yazjxbviMW9sFeutdCKZAA/MbBPzOAKV7l5fOa1mW/bP228Yp4/j/ENydpWILBt06N21+4kcFlNRaGf1kpN7w5+/Auk9xsR7QkAAA=="
  }
  ```
  - `body`: (gzipped base64)
    ```json
        {
      "participants": {
        "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7": {
          "version": 4,
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
            "4f68ab41-919f-48f8-81aa-3864fd1b710f": {
              "call": {
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 67,
              "clientEndpointCapabilities": 8812226,
              "participantId": "e4bcec7a-1e4f-49ee-bf1b-2644df7c7f5e",
              "clientVersion": "SkypeSpaces/1415/25101616509/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {
                "holographicCapabilities": 3
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-frce-03-prod-aks.cc.skype.com:443/cc/v1/callParticipant/0b0ba992-61b9-4c62-a10f-4f86f7ec5bbf/13/k3/490/replacement?rt=e4bcec7a1e4f49eebf1b2644df7c7f5e&rc=eyJydGlkIjoiODpvcmdpZDo1MGExN2E5My03ZTMzLTQ0ZjEtYmFlZi04ZjIzNDQ1N2YzZTciLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5IiwicnRwZnMiOnt9fQ%253D%253D&i=10-128-0-94&e=638974542388499200"
              },
              "endpointJoinTime": "2025-11-05T21:03:02.4400405Z",
              "modalityJoined": "Call",
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
      "sequenceNumber": 4,
      "participantCounts": {
        "totalParticipants": 2,
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
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1769518471,
    "status": 200,
    "headers": {
      "MS-CV": "wDufY0uB8EKXPhV0/N8e3g.1.0",
      "trouter-request": "{\"id\":\"bc0aac0b-fc3e-4265-a702-e915806c4d28\",\"src\":\"10.128.71.85\",\"port\":3443}",
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
    "id": 1769528024,
    "method": "POST",
    "url": "/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/0dc5d7ef-22bb-42af-8e64-ccc3f35e1d95/4d1dfe00/conversation/conversationEnd/",
    "headers": {
      "Content-Length": "794",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-dewc-04-t.trouter.teams.microsoft.com",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "f7ed8804-8499-4585-9694-188139bd6d7f",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "31b54ff1-ca71-49ea-9905-e300b0b5dc0a",
      "X-Microsoft-Skype-Message-ID": "c150fc1d-a8b4-4006-a898-7489d8d51173",
      "traceparent": "00-ac4380c5f16974ed55968b3bfc88d8cf-74bc6a1aebe5be81-00",
      "MS-CV": "N8HF7y2tlEq8jhJJASjIuw.1",
      "trouter-request": "{\"id\":\"752898af-aae6-4b74-a117-664ebf59d3cf\",\"src\":\"10.128.71.85\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\n  \"code\": 0,\n  \"subCode\": 5002,\n  \"phrase\": \"This conversation has ended as all participants left the audio-video modality.\",\n  \"sender\": null,\n  \"resultCategories\": [\n    \"Success\"\n  ],\n  \"callControllerTransactionEnd\": {\n    \"sender\": {\n      \"endpointId\": \"4f68ab41-919f-48f8-81aa-3864fd1b710f\",\n      \"id\": \"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\n      \"displayName\": \"Ben Bucksch\",\n      \"propertyBag\": null,\n      \"resourceId\": null,\n      \"participantId\": \"e4bcec7a-1e4f-49ee-bf1b-2644df7c7f5e\",\n      \"languageId\": null,\n      \"hidden\": false\n    },\n    \"reason\": \"noError\",\n    \"code\": 0,\n    \"subCode\": 0,\n    \"phrase\": \"CallEndReasonLocalUserInitiated\",\n    \"resultCategories\": [\n      \"Success\"\n    ],\n    \"acceptedElsewhereBy\": null\n  },\n  \"conversationType\": \"default\"\n}"
  }
  ```
  - `body`:
    ```json
    {
      "code": 0,
      "subCode": 5002,
      "phrase": "This conversation has ended as all participants left the audio-video modality.",
      "sender": null,
      "resultCategories": [
        "Success"
      ],
      "callControllerTransactionEnd": {
        "sender": {
          "endpointId": "4f68ab41-919f-48f8-81aa-3864fd1b710f",
          "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "displayName": "Ben Bucksch",
          "propertyBag": null,
          "resourceId": null,
          "participantId": "e4bcec7a-1e4f-49ee-bf1b-2644df7c7f5e",
          "languageId": null,
          "hidden": false
        },
        "reason": "noError",
        "code": 0,
        "subCode": 0,
        "phrase": "CallEndReasonLocalUserInitiated",
        "resultCategories": [
          "Success"
        ],
        "acceptedElsewhereBy": null
      },
      "conversationType": "default"
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1769528024,
    "status": 200,
    "headers": {
      "MS-CV": "N8HF7y2tlEq8jhJJASjIuw.1.0",
      "trouter-request": "{\"id\":\"752898af-aae6-4b74-a117-664ebf59d3cf\",\"src\":\"10.128.71.85\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
- receive: `3:::`
  ```json
  {
    "id": 1071645892,
    "method": "POST",
    "url": "/v4/f/vb90lMUkSkCIm3pRtuvZYA/callAgent/0dc5d7ef-22bb-42af-8e64-ccc3f35e1d95/c0550ba3/call/end/",
    "headers": {
      "Content-Length": "397",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-dewc-04-t.trouter.teams.microsoft.com",
      "User-Agent": "CallController/2.47.4495.0",
      "X-Microsoft-Skype-Chain-ID": "f7ed8804-8499-4585-9694-188139bd6d7f",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-Microsoft-Skype-Client": "SkypeSpaces/1415/25101616509/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "13973b00-2961-4c92-b7a9-600bce5a06bd",
      "X-Microsoft-Skype-Message-ID": "2c290199-95f6-406d-bb7b-282b849ee408",
      "traceparent": "00-ac4380c5f16974ed55968b3bfc88d8cf-6333542e05729d09-00",
      "MS-CV": "lKBxJSrF4U+/zDuwsVww8w.1",
      "trouter-request": "{\"id\":\"fa019f4e-eac4-4fba-8010-137b50b115cf\",\"src\":\"10.128.65.254\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"callEnd\":{\"reason\":\"noError\",\"sender\":{\"id\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"displayName\":\"Ben Bucksch\",\"endpointId\":\"4f68ab41-919f-48f8-81aa-3864fd1b710f\",\"languageId\":null,\"participantId\":\"e4bcec7a-1e4f-49ee-bf1b-2644df7c7f5e\",\"hidden\":false,\"propertyBag\":null},\"code\":0,\"subCode\":0,\"phrase\":\"CallEndReasonLocalUserInitiated\",\"resultCategories\":[\"Success\"]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "callEnd": {
        "reason": "noError",
        "sender": {
          "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "displayName": "Ben Bucksch",
          "endpointId": "4f68ab41-919f-48f8-81aa-3864fd1b710f",
          "languageId": null,
          "participantId": "e4bcec7a-1e4f-49ee-bf1b-2644df7c7f5e",
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
    "id": 1071645892,
    "status": 404,
    "headers": {
      "MS-CV": "lKBxJSrF4U+/zDuwsVww8w.1.0",
      "trouter-request": "{\"id\":\"fa019f4e-eac4-4fba-8010-137b50b115cf\",\"src\":\"10.128.65.254\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
  }
  ```
