# Teams WebSocket Protocol - Call 1 to 1

When loading the Microsoft Teams website and calling 1 to 1, four Websockets were created.

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
      "sessionId": "e94dd14f-43b4-40b4-81bc-4d44a095cdb0",
      "runtimeVersion": "2.35.2213",
      "docSessionId": "04bdcaff-8cc1-48d9-a6c5-f68f3cbf60e5",
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
    "cv": "r3kGknJVZiIS3K1DtPNAmn.1",
    "messageId": "c1"
  }
  ```
- receive: `~`
- receive:
  ```json
  {
    "sessionUrlBase": "https://northeurope-pa03.augloop.office.com/v2/session",
    "sliceUrl": "wss://northeurope-pa03.augloop.office.com/v2/?x-origin=3C51762CE179F8793304722983B9828286ADC4DFB06C850C54C1E7E9E563567B",
    "sessionKey": "88790f7d-8a7d-46ac-8e03-f580ce11e27e",
    "origin": "3C51762CE179F8793304722983B9828286ADC4DFB06C850C54C1E7E9E563567B",
    "messageId": "c1",
    "routingSessionKey": "cHJvZF9ub3J0aGV1cm9wZS1wYTAzLjNDNTE3NjJDRTE3OUY4NzkzMzA0NzIyOTgzQjk4MjgyODZBREM0REZCMDZDODUwQzU0QzFFN0U5RTU2MzU2N0IuODg3OTBmN2QtOGE3ZC00NmFjLThlMDMtZjU4MGNlMTFlMjdl",
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
      "AugLoop_VideoGeneration_VideoGenerationSignal",
      "AugLoop_VideoGeneration_VideoGenerationPollSignal",
      "AugLoop_VideoGeneration_VideoGenerationDeleteSignal",
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
      "AugLoop_SharepointSiteCopilot_GetRecentSitesSignal",
      "AugLoop_SharepointSiteCopilot_SearchSiteSignal",
      "AugLoop_SharepointSiteCopilot_ValidateSiteUrlSignal",
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
      "AugLoop_SharepointCopilot_SharepointHandoffInboundMessage",
      "AugLoop_SharepointCopilot_SharepointHandoffMessageId",
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
    "anonymousToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNjYmI0MzdkYjE1NzQzNWM5MjZhZGI4NTg0MWI5MjI4In0.eyJhcHBpZCI6IjQzNTRlMjI1LTUwYzktNDQyMy05ZWNlLTJkNWFmZDkwNDg3MCIsImlzcyI6Imh0dHBzOi8vYXVnbG9vcC5vZmZpY2UuY29tL2Fub255bW91c1Rva2VuIiwiYXVkIjoiaHR0cHM6Ly9hdWdsb29wLm9mZmljZS5jb20vYW5vbnltb3VzVG9rZW4iLCJpYXQiOjE3NjI1NTEzMzgsIm5iZiI6MTc2MjU1MTAzOCwiZXhwIjoxNzYyNjM3NzM4LCJvaWQiOiI5YWpTc0dOYXNFRkgxcW50bVNuVzhlb1ZQbHFibXlzMG5yc3k4VVVZeGxjPSIsInNpZCI6Ijg4NzkwZjdkLThhN2QtNDZhYy04ZTAzLWY1ODBjZTExZTI3ZSJ9.W3R72p0qdU95r4KBjHu_-4gRRYey2V9be7PVgjG2SGTA73wbDTAvaCtbkEQxC47EQIZAIuh9DTzppUtFmu5HnKx0eUxl1EVmp3NZ4PuDz_M2eanjqjAtqNsozW7RohfGzNBUfDRjEW1nKcGjQQqxY_yf4xj8J3nQHkVrYyXNIJx9NkXe2kUrq52J6NL5MbqAZvGLfK7ck9GmNRutqIxlGs4fnqdBb96LUnIX3HpVfCZPx1YgkbKFdLq8YmYJT6gyNoSLTzE65f-FDaq4rtJWPUn_VDjhQ-C7wMN0sEjChzsq-TS0QM8qSKVGWEdohwyOXerjXQiQVdU6dOyJhh66iA",
    "tokenExpirationTime": 1762637738,
    "tokenExpirationSeconds": 86399,
    "maxRPS": 250,
    "maxBPS": 1000000000
  }
  ```
- send:
  ```json
  {
    "cv": "+F/fO2SGDM+vuqpHWrzPLj",
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
    "authToken": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiV3pjXzBSSHBXN2dfUnJsemtjSWY4MGg4NGhCXy1wY0FwUGh2aWVlYzVzUSIsInhtc19oZF91dGkiOiI1cUk4NzFXV3hFLUFiRDJrbUxrSkFBIiwieG1zX2hkX2lhdCI6IjE3NjI1NTA5NDQifQ..obFf2DZUcSJHnZn2h-bQXA.TGYhQGJSuondwmXVEUrhDLLIj2SPSc1fSkdvosPgkCYSGwJ-7L8ZeTnebn8KLonnbR-dnZ_Dp78Z4s0AVOuKMHx-WiJfRp3aTKVb3YHqIgQEZMTMztaDevoF3AeqRHHZAf-EVSM_aLA86oYzTwJ6IEAD69W_LjsnFxrpDKtDM26fQeyVqYZWVdY-yhrQ503zE0COxBGIClx0JmlR4L8Jw1AzSuX-R-b4tPAEJmJ3woezgHJdjNhYsKooRtWD5INgQfN-LNpF30Raafz5SbWgWdHTNsL6Re3Hpj3lGfBCs1Pzh-MfWl41bsbzSyfGhAJNXRYeZ06IVqeK55o-mWvP-9JhpQS4F5WW2lr8wY4Ww9YnOdqPwF8fqip_gXh7dYLH8ZbspqmUdS7WbLGljv-20yS9mX4D7wpftJsr7G5ole_Ba0nJuS-_ww1ukov2T_z09p-CPg7uo6acCZ5cRzbO9pLj7Ik4WaRa3eb8W5VdYsOmQZ1Nt2ZRnCKJw7GS3c3avtVuNHIsOhXrxBCeoQuCHCNTP3QPwnnBIZN_UzpXawZK7Qi3vc9CH2jKmyHq8LvZWc-_q2bbJ-nnBtratdmUfnyLq7rIllGneNGs-zRr0NdNZ3akjrSsW7b7SwH-nQDfIBHhIzDeCGrUV-Wpj41HmSEa_U_puSkq0Uhp5aJZGVfPBrLAcdgPkffUWgveQ_-YWhMiXEz8Cb0iheQ3t2-bDXnir0wO8ajHakleWEgaxCcMgMd4459AD1RW4dlCpSJmHTTYrN_rBdmXeH12Y2qxshLedbava1Dv0brb4b3JLeYzD8Oe5X7s67UXoiNSnopXBOWi5ntBjcyyfCR78My6WiOhIh8er9iOHQcPYytXqRP7ofnp8Gxq-eBII7fQykYLKsmLWP6QyAnPiNlWz0Ur2ZCDV4NI6B0zA_lTHn77T3kcBT5EgD2bVBa01e02O-82oQZWdb9ehbkuFExmu2RXx7pNhJUdh9qT4kK8G-xKUUfjCo38Ox5SP9XwMycBTfghHJnRkS5wjGwTuqvqG_MPn7ZhbtPIY6RYIuuPZSxTDrUs2JuZNv-YnXJHorgCQ0w2wdgPjLReAXAAsa8y5MjExn9rTmu0lXTWJtGfY8DB9fsJMof6Dsb4mpXInZkAApAWKSylXFSlMu3ueMRkOihDGfMYbUvOu7UFwsfEF1dU49OapzzM-FCvLTaJv_e5o4v9pjIPTQPL9w1FiV0DCXoc5_PjrSma8DYh_bso-JNDKgHPoOQ3AyI_Ft9Iq-N8d_ZO0oB2wFGjdJHtJVkY1dUT8wjHFu3CgXkJCmWDRbolmcM3HWBrzXzu7dzVQLCxUOYakTBaP916g7IHM12428KmgUFzrYOB5v7HbzmYcRZ2OixKA9VWoFDZQeyNvsMEeOw60x2rzdgHBRFU7iOM2mOG-_XWhCgkVhyRqPIfuQSlSx6ff_HMvhJkwmwYTwTO5QHm9DfiHa6mmRNWejXKm9JiNLQQ1GPgQmpdFw81WhWuD64ZetPtnIfhUmUVXr246m3yY94XiAitnzZzxxPtbk_ODi1gO5Z5eANb9a7LdA-LTZdtoeOlJIZEuSitFzuBhFytqkYSkcG0c2IgLkdCvIljrca4KSoHtebiBuAOWu6IviL0UMAXD7dmiTpcoJTALEN-c-3Wnk_GGoMkV0l-BvWlePSGoA06HvhK4FltQeV3Mm3qUeIJBYWdrN1DK2_Pfqiijuf9ydvcTMTfzLhvQtR6vlG1aU2Mp3GInVYeo415k6Xi0_jy3pJwUAcZr9DgNtH4hTx3NEtqAv4SdPT7xS7O5hLwqQ-T_whu8o3ORf3mrzf4lilUukHVQe15I0en8b-qIoRi6E67_-zC5nSI1uxvm_9ehpdw9U92X_mVQQAKWjFgEXQKaL4cZNXLZivKLmFZeDC7YjCiNSf5c_LrGvHsmLWVXPHgM0Tftux68tQF5ffHQiR1Z309ph406O5nx8mEpPoRuNsIpTwQ9dHFP4f6WaLGwMiaXVAqEi0ohuIF2bmqCOlmb_CHV1i1aVC2lMBZ0rzjltGfcHM4BgUizbAf7cBPY7TH3vFGuJzXj2m62XSz6nhbjeknmVkvgrVtMFFBjulxky7jz_Eg-0GRSTTNGmmqUuW0EMDFnOBoIy7shitnzcBtMPaHSc9QmvXSsm071QGQgEiaMeGp8Pi7ObFlhf_8yWog3cqFHopMFVKeVszJlsr4giqjhc-ZMqv6s42zT1vhVWHOZDutduQtBiSQj2S2G3WHoLlpYDnGhcN1pc00OI9O4zw4_DSPCl8nl1gEyJ1dFGwHAsFYzmzjX-CPUxoFF5FdWsQY--TqkmJrA6-9VXFLiUfWaX2bBXKFKE5pbKxhLPG4mrJYaEq5_XcuK27gTtV7it4I_AKGhGy85z1Ntl-D7U9LnzxWvWqKzYTLffNg-ucqYneyuYVbPUqTjDg9gnE8XVH6ZbBGcvt0FwcQBQVWzYjOiuNAGeTKM_rVNpGhUeY0J6BI_Tne_taRZl1ejuTjVcKLpMRk6IWXKuUC9NW1a565KZK4R-KVXnv61kaNT1Es983szRn0aq5P3fw1Fy7xuhfF5kjsXOypR28.xqJc4UoFZBc6u7pdpTuQOiJwlv6IPkwAJi2T4mFfLt4",
    "version": 1,
    "H_": {
      "T_": "AugLoop_Session_Protocol_TokenProvisionMessage",
      "B_": [
        "AugLoop_Session_Protocol_Message"
      ]
    },
    "cv": "r3kGknJVZiIS3K1DtPNAmn.2",
    "messageId": "c3"
  }
  ```
- receive:
  ```json
  {
    "tokenExpirationTime": 1762556111,
    "tokenExpirationSeconds": 4769,
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
      "sessionId": "e94dd14f-43b4-40b4-81bc-4d44a095cdb0",
      "runtimeVersion": "2.35.2213",
      "docSessionId": "c34ea66d-89a0-4077-862d-1f943149ab4f",
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
    "cv": "39cKqwq7wCkCzF/Dnh/S33.1",
    "messageId": "c1"
  }
  ```
- receive: `~`
- receive:
  ```json
  {
    "sessionUrlBase": "https://northeurope-pa03.augloop.office.com/v2/session",
    "sliceUrl": "wss://northeurope-pa03.augloop.office.com/v2/?x-origin=59452DCCF1E395CF3CF9CA622B0237AB1E0744129E4C5F6D34A9CC6F9DF3BA2B",
    "sessionKey": "42e5f353-741c-4593-9115-183c0ec67e1c",
    "origin": "59452DCCF1E395CF3CF9CA622B0237AB1E0744129E4C5F6D34A9CC6F9DF3BA2B",
    "messageId": "c1",
    "routingSessionKey": "cHJvZF9ub3J0aGV1cm9wZS1wYTAzLjU5NDUyRENDRjFFMzk1Q0YzQ0Y5Q0E2MjJCMDIzN0FCMUUwNzQ0MTI5RTRDNUY2RDM0QTlDQzZGOURGM0JBMkIuNDJlNWYzNTMtNzQxYy00NTkzLTkxMTUtMTgzYzBlYzY3ZTFj",
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
      "AugLoop_VideoGeneration_VideoGenerationSignal",
      "AugLoop_VideoGeneration_VideoGenerationPollSignal",
      "AugLoop_VideoGeneration_VideoGenerationDeleteSignal",
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
      "AugLoop_SharepointSiteCopilot_GetRecentSitesSignal",
      "AugLoop_SharepointSiteCopilot_SearchSiteSignal",
      "AugLoop_SharepointSiteCopilot_ValidateSiteUrlSignal",
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
      "AugLoop_SharepointCopilot_SharepointHandoffInboundMessage",
      "AugLoop_SharepointCopilot_SharepointHandoffMessageId",
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
    "anonymousToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNjYmI0MzdkYjE1NzQzNWM5MjZhZGI4NTg0MWI5MjI4In0.eyJhcHBpZCI6IjQzNTRlMjI1LTUwYzktNDQyMy05ZWNlLTJkNWFmZDkwNDg3MCIsImlzcyI6Imh0dHBzOi8vYXVnbG9vcC5vZmZpY2UuY29tL2Fub255bW91c1Rva2VuIiwiYXVkIjoiaHR0cHM6Ly9hdWdsb29wLm9mZmljZS5jb20vYW5vbnltb3VzVG9rZW4iLCJpYXQiOjE3NjI1NTEzMzgsIm5iZiI6MTc2MjU1MTAzOCwiZXhwIjoxNzYyNjM3NzM4LCJvaWQiOiI5VFBxaTJ4UEs5RDh3Y1JjK1o4NlRjV2VtbXBBb0dZUitLdUtodUorUEc0PSIsInNpZCI6IjQyZTVmMzUzLTc0MWMtNDU5My05MTE1LTE4M2MwZWM2N2UxYyJ9.fqCHOyYIVZGzO8RNFAg5K4qw5w_z_WWhNFokhubPEwWs6sJemDEMrdVE0VI1ClMu0UxCGcJ-Z6HZ81nRM48CcOx9WsrJupvXih02kU4Frs_IQk6fWHe8fWUb6X3_afQ-US--NiYB0G6y69MEiaHrZv2tRZFNtPNMjU7qfVIdz82S2BR-_QEuKctoZxsAKMBPLBETfGbYgBGNuSpF75o-_OHNOtSwRl2Gyl3JFJESfQwLnFT_iFo8hGKOJvCyqnnM6LeelkORyMySZpJTrKcgn_S8RdvBvl7zeApN4rULCBHiDI0KH3CCeAODPa24HUrmGV9XxVlv8LzM0wVBRME-RA",
    "tokenExpirationTime": 1762637738,
    "tokenExpirationSeconds": 86399,
    "maxRPS": 250,
    "maxBPS": 1000000000
  }
  ```
- send:
  ```json
  {
    "cv": "E9pPT9MTzsjJ0kd0CqRJ+L",
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
    "authToken": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiV3pjXzBSSHBXN2dfUnJsemtjSWY4MGg4NGhCXy1wY0FwUGh2aWVlYzVzUSIsInhtc19oZF91dGkiOiI1cUk4NzFXV3hFLUFiRDJrbUxrSkFBIiwieG1zX2hkX2lhdCI6IjE3NjI1NTA5NDQifQ..obFf2DZUcSJHnZn2h-bQXA.TGYhQGJSuondwmXVEUrhDLLIj2SPSc1fSkdvosPgkCYSGwJ-7L8ZeTnebn8KLonnbR-dnZ_Dp78Z4s0AVOuKMHx-WiJfRp3aTKVb3YHqIgQEZMTMztaDevoF3AeqRHHZAf-EVSM_aLA86oYzTwJ6IEAD69W_LjsnFxrpDKtDM26fQeyVqYZWVdY-yhrQ503zE0COxBGIClx0JmlR4L8Jw1AzSuX-R-b4tPAEJmJ3woezgHJdjNhYsKooRtWD5INgQfN-LNpF30Raafz5SbWgWdHTNsL6Re3Hpj3lGfBCs1Pzh-MfWl41bsbzSyfGhAJNXRYeZ06IVqeK55o-mWvP-9JhpQS4F5WW2lr8wY4Ww9YnOdqPwF8fqip_gXh7dYLH8ZbspqmUdS7WbLGljv-20yS9mX4D7wpftJsr7G5ole_Ba0nJuS-_ww1ukov2T_z09p-CPg7uo6acCZ5cRzbO9pLj7Ik4WaRa3eb8W5VdYsOmQZ1Nt2ZRnCKJw7GS3c3avtVuNHIsOhXrxBCeoQuCHCNTP3QPwnnBIZN_UzpXawZK7Qi3vc9CH2jKmyHq8LvZWc-_q2bbJ-nnBtratdmUfnyLq7rIllGneNGs-zRr0NdNZ3akjrSsW7b7SwH-nQDfIBHhIzDeCGrUV-Wpj41HmSEa_U_puSkq0Uhp5aJZGVfPBrLAcdgPkffUWgveQ_-YWhMiXEz8Cb0iheQ3t2-bDXnir0wO8ajHakleWEgaxCcMgMd4459AD1RW4dlCpSJmHTTYrN_rBdmXeH12Y2qxshLedbava1Dv0brb4b3JLeYzD8Oe5X7s67UXoiNSnopXBOWi5ntBjcyyfCR78My6WiOhIh8er9iOHQcPYytXqRP7ofnp8Gxq-eBII7fQykYLKsmLWP6QyAnPiNlWz0Ur2ZCDV4NI6B0zA_lTHn77T3kcBT5EgD2bVBa01e02O-82oQZWdb9ehbkuFExmu2RXx7pNhJUdh9qT4kK8G-xKUUfjCo38Ox5SP9XwMycBTfghHJnRkS5wjGwTuqvqG_MPn7ZhbtPIY6RYIuuPZSxTDrUs2JuZNv-YnXJHorgCQ0w2wdgPjLReAXAAsa8y5MjExn9rTmu0lXTWJtGfY8DB9fsJMof6Dsb4mpXInZkAApAWKSylXFSlMu3ueMRkOihDGfMYbUvOu7UFwsfEF1dU49OapzzM-FCvLTaJv_e5o4v9pjIPTQPL9w1FiV0DCXoc5_PjrSma8DYh_bso-JNDKgHPoOQ3AyI_Ft9Iq-N8d_ZO0oB2wFGjdJHtJVkY1dUT8wjHFu3CgXkJCmWDRbolmcM3HWBrzXzu7dzVQLCxUOYakTBaP916g7IHM12428KmgUFzrYOB5v7HbzmYcRZ2OixKA9VWoFDZQeyNvsMEeOw60x2rzdgHBRFU7iOM2mOG-_XWhCgkVhyRqPIfuQSlSx6ff_HMvhJkwmwYTwTO5QHm9DfiHa6mmRNWejXKm9JiNLQQ1GPgQmpdFw81WhWuD64ZetPtnIfhUmUVXr246m3yY94XiAitnzZzxxPtbk_ODi1gO5Z5eANb9a7LdA-LTZdtoeOlJIZEuSitFzuBhFytqkYSkcG0c2IgLkdCvIljrca4KSoHtebiBuAOWu6IviL0UMAXD7dmiTpcoJTALEN-c-3Wnk_GGoMkV0l-BvWlePSGoA06HvhK4FltQeV3Mm3qUeIJBYWdrN1DK2_Pfqiijuf9ydvcTMTfzLhvQtR6vlG1aU2Mp3GInVYeo415k6Xi0_jy3pJwUAcZr9DgNtH4hTx3NEtqAv4SdPT7xS7O5hLwqQ-T_whu8o3ORf3mrzf4lilUukHVQe15I0en8b-qIoRi6E67_-zC5nSI1uxvm_9ehpdw9U92X_mVQQAKWjFgEXQKaL4cZNXLZivKLmFZeDC7YjCiNSf5c_LrGvHsmLWVXPHgM0Tftux68tQF5ffHQiR1Z309ph406O5nx8mEpPoRuNsIpTwQ9dHFP4f6WaLGwMiaXVAqEi0ohuIF2bmqCOlmb_CHV1i1aVC2lMBZ0rzjltGfcHM4BgUizbAf7cBPY7TH3vFGuJzXj2m62XSz6nhbjeknmVkvgrVtMFFBjulxky7jz_Eg-0GRSTTNGmmqUuW0EMDFnOBoIy7shitnzcBtMPaHSc9QmvXSsm071QGQgEiaMeGp8Pi7ObFlhf_8yWog3cqFHopMFVKeVszJlsr4giqjhc-ZMqv6s42zT1vhVWHOZDutduQtBiSQj2S2G3WHoLlpYDnGhcN1pc00OI9O4zw4_DSPCl8nl1gEyJ1dFGwHAsFYzmzjX-CPUxoFF5FdWsQY--TqkmJrA6-9VXFLiUfWaX2bBXKFKE5pbKxhLPG4mrJYaEq5_XcuK27gTtV7it4I_AKGhGy85z1Ntl-D7U9LnzxWvWqKzYTLffNg-ucqYneyuYVbPUqTjDg9gnE8XVH6ZbBGcvt0FwcQBQVWzYjOiuNAGeTKM_rVNpGhUeY0J6BI_Tne_taRZl1ejuTjVcKLpMRk6IWXKuUC9NW1a565KZK4R-KVXnv61kaNT1Es983szRn0aq5P3fw1Fy7xuhfF5kjsXOypR28.xqJc4UoFZBc6u7pdpTuQOiJwlv6IPkwAJi2T4mFfLt4",
    "version": 1,
    "H_": {
      "T_": "AugLoop_Session_Protocol_TokenProvisionMessage",
      "B_": [
        "AugLoop_Session_Protocol_Message"
      ]
    },
    "cv": "39cKqwq7wCkCzF/Dnh/S33.2",
    "messageId": "c3"
  }
  ```
- receive:
  ```json
  {
    "tokenExpirationTime": 1762556111,
    "tokenExpirationSeconds": 4769,
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
    "v": "1415/25101616511"
  }
  ```
- `timeout`=`40`
- `epid`=`32282c12-87e9-49da-b86f-14c2448a0107`
- `ccid`=
- `cor_id`=`e94dd14f-43b4-40b4-81bc-4d44a095cdb0`
- `con_num`=`1762551339823_0`

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
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJub25jZSI6Ijh5U1pZcFRFM28ycEQ4Y2s3QVdyUEJQUWxPR3A2cTV2X0J5WVh2SzdEWHMiLCJhbGciOiJSUzI1NiIsIng1dCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSIsImtpZCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSJ9.eyJhdWQiOiJodHRwczovL2ljMy50ZWFtcy5vZmZpY2UuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4LyIsImlhdCI6MTc2MjUzNTA1NCwibmJmIjoxNzYyNTM1MDU0LCJleHAiOjE3NjI2MjE3NTQsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBVVFBdS84YUFBQUFUc25Gc1FCZ2xuZFhkbDhZWTIxeGhpam5QVXAzNEpwemZMSUN4aTZNbHRSSlpZWVhEWm43ampXcGNpbVdDYWtIMy8xcmpaaW85ZklYYzNyYldyQ1B1QT09IiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjVlM2NlNmMwLTJiMWYtNDI4NS04ZDRiLTc1ZWU3ODc4NzM0NiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiUmFzaGJyb29rIiwiZ2l2ZW5fbmFtZSI6Ik5laWwiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI4Mi4xOS45Ljg4IiwibmFtZSI6Ik5laWwgUmFzaGJyb29rIiwib2lkIjoiMWM1OTU4ZDUtZTQwYS00YTM1LWEwZTMtN2ViNjUxNzkwOTZmIiwicHVpZCI6IjEwMDMyMDAwODdEN0ZDMDAiLCJyaCI6IjEuQVRvQTZPZU5Nd3F4ZkVxdXRFemZjbV9JR0ZUd3FqbWxnY2RJcFBnQ2t3RWdsYm5oQUo0NkFBLiIsInNjcCI6IlRlYW1zLkFjY2Vzc0FzVXNlci5BbGwiLCJzaWQiOiIwMDlkMGIzOS1jNThlLTMyYjYtYWYxOC1jMTc4NTYwZDFlNGMiLCJzdWIiOiJHdFdEbl9tY05lVm16akdwT3E4VTFsNFV2czFlZTZSNmR2ZURtaVJnX3dBIiwidGlkIjoiMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4IiwidW5pcXVlX25hbWUiOiJuZWlsQGJlb25leC5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJuZWlsQGJlb25leC5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJyNVc2bnhnS00wS1A3OEY5WXlBR0FBIiwidmVyIjoiMS4wIiwieG1zX2FjdF9mY3QiOiIzIDUiLCJ4bXNfY2MiOlsiQ1AxIl0sInhtc19mdGQiOiJEYklMSHVSWnR2WWplczhkbERVUmJQVDZXNHA2dHpZMnZac3l3QU1OTjFVQlpuSmhibU5sWXkxa2MyMXoiLCJ4bXNfaWRyZWwiOiIyNiAxIiwieG1zX3NzbSI6IjEiLCJ4bXNfc3ViX2ZjdCI6IjIgMyJ9.e94YeXu10HZ4eACvpni75FU9cMWvd2GYeRB2-GFG2QlFW2wUU9KYHPT0T-rD-hBLjzuM_8jacFCFgdiEGA1gUYAe6DPATMA-qPraNDGpx233t1D8bCNxD3bRSypickFtNDdKgtUtAfxrUAZgS2dCpaViz0tql1B2-dit50SUw8ZfOlYNIQkpioYgU_r_BLZcuxn1-68Jk7U1AzWJm_Ra4ko01iD91TYiRUS4LTjANDUI8D5cvE_sImx-E83fdH0tR2QFRhxHM7Dto3gSDRyhS2kCcd72rn-4kg24EM_VnoDDwR0SZGw-JEoqnoD5PODOE2l8iQ71U_Dh3VR05IHWQQ",
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
        "ttl": "195957",
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
- receive: `3:::`
  ```json
  {
    "id": 1494143651,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/messaging",
    "headers": {
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Content-Length": "2963",
      "Content-Type": "text/xml",
      "Host": "pub-ent-euno-10-f.trouter.teams.microsoft.com:3443",
      "User-Agent": "Skype-NotificationHub/1.0.0-25.10.31.9+2181e8856490b235480ee1b9b29d7c6ccc0b7a93 (France Central)",
      "X-Trouter-Delivery-Control": "async; ttl=900; flow=messaging; prio=normal",
      "X-Microsoft-Skype-Message-ID": "7dc590bb-3256-4425-a9a9-641cfef6cebc",
      "MS-CV": "U3snlMpjg0eEMLEafIFh0A.1.1.1.1166807042.1.1.0.1.1",
      "traceparent": "00-aeea25bc421f9ca7dfba6ebbcd30aea9-876affe87083801b-00",
      "trouter-request": "{\"id\":\"8ea6fbca-8c76-4b58-b847-d10a0642bce1\",\"src\":\"10.128.32.40\",\"port\":3443,\"mstore\":true,\"flow\":\"messaging\",\"seq\":13406951234837}",
      "Trouter-Timeout": "7500"
    },
    "body": "{\"time\":\"2025-11-07T21:35:18.292Z\",\"type\":\"EventMessage\",\"resourceLink\":\"https://notifications.skype.net/v1/users/ME/conversations/48:calllogs\",\"resourceType\":\"ConversationUpdate\",\"resource\":{\"id\":\"48:calllogs\",\"lastMessage\":{\"clientmessageid\":\"1762551309393\",\"content\":\"Call Logs for Call 52f00d02-2a8b-4ed5-81e9-e5f2973833f1\",\"from\":\"https://notifications.skype.net/v1/users/ME/contacts/8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"imdisplayname\":\"\",\"prioritizeimdisplayname\":null,\"id\":\"1762551309386\",\"messagetype\":\"Text\",\"originalarrivaltime\":\"2025-11-07T21:35:09.3860000Z\",\"properties\":{\"call-log\":\"{\\\"startTime\\\":\\\"2025-11-07T21:34:46.144241Z\\\",\\\"connectTime\\\":\\\"2025-11-07T21:34:48.2722538Z\\\",\\\"endTime\\\":\\\"2025-11-07T21:35:09.3716544Z\\\",\\\"callDirection\\\":\\\"outgoing\\\",\\\"callType\\\":\\\"twoParty\\\",\\\"callState\\\":\\\"accepted\\\",\\\"userParticipantId\\\":\\\"7dd1b6c3-08dc-4b69-ba97-02929a37b776\\\",\\\"originator\\\":\\\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\\\",\\\"target\\\":\\\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"originatorParticipant\\\":{\\\"id\\\":\\\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\\\",\\\"type\\\":\\\"default\\\",\\\"displayName\\\":\\\"Neil Rashbrook\\\",\\\"applicationType\\\":null,\\\"alternateId\\\":null},\\\"targetParticipant\\\":{\\\"id\\\":\\\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"type\\\":\\\"default\\\",\\\"displayName\\\":null,\\\"applicationType\\\":null,\\\"alternateId\\\":null},\\\"callId\\\":\\\"52f00d02-2a8b-4ed5-81e9-e5f2973833f1\\\",\\\"callAttributes\\\":null,\\\"forwardingInfo\\\":{\\\"forwardingType\\\":\\\"unanswered\\\",\\\"forwardingDestinationType\\\":\\\"voicemail\\\",\\\"acceptedBy\\\":{\\\"id\\\":\\\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"type\\\":\\\"voicemail\\\",\\\"displayName\\\":null,\\\"applicationType\\\":null,\\\"alternateId\\\":null}},\\\"transferInfo\\\":null,\\\"participants\\\":null,\\\"participantList\\\":null,\\\"threadId\\\":null,\\\"sessionType\\\":\\\"default\\\",\\\"sharedCorrelationId\\\":\\\"f1b06232-3878-4cf0-a3ef-48eb6564934e\\\",\\\"messageId\\\":null}\",\"s2spartnername\":\"concore_gvc\",\"languageStamp\":\"languages=en:100;nl:83;de:80;length:55;&detector=Bling\"},\"sequenceId\":116,\"version\":\"1762551309386\",\"composetime\":\"2025-11-07T21:35:09.3860000Z\",\"type\":\"Message\",\"conversationLink\":\"https://notifications.skype.net/v1/users/ME/conversations/48:calllogs\",\"to\":\"48:calllogs\",\"contenttype\":\"text\"},\"lastUpdatedMessageId\":1762551309386,\"lastUpdatedMessageVersion\":1762551309386,\"messages\":\"https://notifications.skype.net/v1/users/ME/conversations/48:calllogs/messages\",\"properties\":{\"consumptionhorizon\":\"1762551309386;1762551317475;1762551309386\"},\"targetLink\":\"https://notifications.skype.net/v1/threads/48:calllogs\",\"threadProperties\":{\"isCreator\":true,\"gapDetectionEnabled\":\"False\",\"lastjoinat\":\"1693864352453\",\"lastSequenceId\":\"116\",\"rosterVersion\":1671225009219,\"threadType\":\"streamofcalllogs\",\"tenantid\":\"338de7e8-b10a-4a7c-aeb4-4cdf726fc818\"},\"version\":1762551318292,\"propertiesUpdated\":[\"consumptionhorizon\"],\"memberProperties\":{\"role\":\"Admin\"},\"isactive\":true,\"inQuarantine\":false},\"isactive\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "time": "2025-11-07T21:35:18.292Z",
      "type": "EventMessage",
      "resourceLink": "https://notifications.skype.net/v1/users/ME/conversations/48:calllogs",
      "resourceType": "ConversationUpdate",
      "resource": {
        "id": "48:calllogs",
        "lastMessage": {
          "clientmessageid": "1762551309393",
          "content": "Call Logs for Call 52f00d02-2a8b-4ed5-81e9-e5f2973833f1",
          "from": "https://notifications.skype.net/v1/users/ME/contacts/8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "imdisplayname": "",
          "prioritizeimdisplayname": null,
          "id": "1762551309386",
          "messagetype": "Text",
          "originalarrivaltime": "2025-11-07T21:35:09.3860000Z",
          "properties": {
            "call-log": "{\"startTime\":\"2025-11-07T21:34:46.144241Z\",\"connectTime\":\"2025-11-07T21:34:48.2722538Z\",\"endTime\":\"2025-11-07T21:35:09.3716544Z\",\"callDirection\":\"outgoing\",\"callType\":\"twoParty\",\"callState\":\"accepted\",\"userParticipantId\":\"7dd1b6c3-08dc-4b69-ba97-02929a37b776\",\"originator\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"target\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"originatorParticipant\":{\"id\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"type\":\"default\",\"displayName\":\"Neil Rashbrook\",\"applicationType\":null,\"alternateId\":null},\"targetParticipant\":{\"id\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"type\":\"default\",\"displayName\":null,\"applicationType\":null,\"alternateId\":null},\"callId\":\"52f00d02-2a8b-4ed5-81e9-e5f2973833f1\",\"callAttributes\":null,\"forwardingInfo\":{\"forwardingType\":\"unanswered\",\"forwardingDestinationType\":\"voicemail\",\"acceptedBy\":{\"id\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"type\":\"voicemail\",\"displayName\":null,\"applicationType\":null,\"alternateId\":null}},\"transferInfo\":null,\"participants\":null,\"participantList\":null,\"threadId\":null,\"sessionType\":\"default\",\"sharedCorrelationId\":\"f1b06232-3878-4cf0-a3ef-48eb6564934e\",\"messageId\":null}",
            "s2spartnername": "concore_gvc",
            "languageStamp": "languages=en:100;nl:83;de:80;length:55;&detector=Bling"
          },
          "sequenceId": 116,
          "version": "1762551309386",
          "composetime": "2025-11-07T21:35:09.3860000Z",
          "type": "Message",
          "conversationLink": "https://notifications.skype.net/v1/users/ME/conversations/48:calllogs",
          "to": "48:calllogs",
          "contenttype": "text"
        },
        "lastUpdatedMessageId": 1762551309386,
        "lastUpdatedMessageVersion": 1762551309386,
        "messages": "https://notifications.skype.net/v1/users/ME/conversations/48:calllogs/messages",
        "properties": {
          "consumptionhorizon": "1762551309386;1762551317475;1762551309386"
        },
        "targetLink": "https://notifications.skype.net/v1/threads/48:calllogs",
        "threadProperties": {
          "isCreator": true,
          "gapDetectionEnabled": "False",
          "lastjoinat": "1693864352453",
          "lastSequenceId": "116",
          "rosterVersion": 1671225009219,
          "threadType": "streamofcalllogs",
          "tenantid": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
        },
        "version": 1762551318292,
        "propertiesUpdated": [
          "consumptionhorizon"
        ],
        "memberProperties": {
          "role": "Admin"
        },
        "isactive": true,
        "inQuarantine": false
      },
      "isactive": true
    }
    ```
- send: `5:1+::`
  ```json
  {
    "name": "user.activity",
    "args": [
      {
        "state": "active",
        "cv": "I4RA6Dxe5PNrupWg5B28QA.0.1"
      }
    ]
  }
  ```
- send: `3:::`
  ```json
  {
    "id": 1494143651,
    "status": 200,
    "headers": {
      "MS-CV": "U3snlMpjg0eEMLEafIFh0A.1.1.1.1166807042.1.1.0.1.1.0",
      "trouter-request": "{\"id\":\"8ea6fbca-8c76-4b58-b847-d10a0642bce1\",\"src\":\"10.128.32.40\",\"port\":3443,\"mstore\":true,\"flow\":\"messaging\",\"seq\":13406951234837}",
      "trouter-client": "{\"cd\":153}"
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
- receive: `6:::1+`
  ```json
  []
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
    "id": 476119161,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "285",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "f4152cd1-34ef-43df-8776-10dd4bfdf5e9",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-3b3d7aebc9957456a82ac9ff9cfd92f2-f0303f0c52ab28e4-00",
      "MS-CV": "t+a3oG5sAEiz3jfAUJvY+g.1",
      "trouter-request": "{\"id\":\"bc18fef7-75f7-4401-bafa-252da3e52b71\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184714542\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"deviceType\":\"Web\"}}],\"isSnapshot\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184714542",
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
    "id": 476119161,
    "status": 200,
    "headers": {
      "MS-CV": "t+a3oG5sAEiz3jfAUJvY+g.1.0",
      "trouter-request": "{\"id\":\"bc18fef7-75f7-4401-bafa-252da3e52b71\",\"src\":\"10.128.59.12\",\"port\":3443}",
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
    "id": 476121040,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "569",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "28490103-8f91-4ce9-b547-0ecbc07a81c1",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-035c1b25cf8902bbdb59eb76ec7045da-e3247cd86339d598-00",
      "MS-CV": "N91uzDDc8EKEzhXitqs0BQ.1",
      "trouter-request": "{\"id\":\"b10f186b-3ca1-4c35-8f9e-38c2ef45ad41\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184714543\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"deviceType\":\"Web\"}},{\"mri\":\"8:orgid:dee1afdb-9ece-4498-a506-15c6b484ac6b\",\"etag\":\"A0184714258\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Offline\",\"activity\":\"Offline\",\"lastActiveTime\":\"2024-05-07T15:23:52.017Z\"}}],\"isSnapshot\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184714543",
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
          "etag": "A0184714258",
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
    "id": 476121040,
    "status": 200,
    "headers": {
      "MS-CV": "N91uzDDc8EKEzhXitqs0BQ.1.0",
      "trouter-request": "{\"id\":\"b10f186b-3ca1-4c35-8f9e-38c2ef45ad41\",\"src\":\"10.128.59.12\",\"port\":3443}",
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
    "id": 476121232,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "569",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "d479699d-3c66-4399-bc2a-8762572b67ea",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-6c1ceb25d4f8482bca335666d68650cf-4f871386ac52dfd8-00",
      "MS-CV": "xuU7ZWgsOEa5ACO/0Wg8uQ.1",
      "trouter-request": "{\"id\":\"0536dbef-9d9e-4f3c-95e9-ac6f85cb0420\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "Trouter-TimeoutMs": "117549",
      "Trouter-Timeout": "117049"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184714543\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"deviceType\":\"Web\"}},{\"mri\":\"8:orgid:dee1afdb-9ece-4498-a506-15c6b484ac6b\",\"etag\":\"A0184714259\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Offline\",\"activity\":\"Offline\",\"lastActiveTime\":\"2024-05-07T15:23:52.017Z\"}}],\"isSnapshot\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184714543",
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
          "etag": "A0184714259",
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
    "id": 476121232,
    "status": 200,
    "headers": {
      "MS-CV": "xuU7ZWgsOEa5ACO/0Wg8uQ.1.0",
      "trouter-request": "{\"id\":\"0536dbef-9d9e-4f3c-95e9-ac6f85cb0420\",\"src\":\"10.128.59.12\",\"port\":3443}",
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
    "id": 932159525,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "308",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "f3bdae53-7d00-4a6d-806b-f6bcdc7086a6",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-e6f4559494e7bf5999b3f521575cf21c-d74db75da15854fe-00",
      "MS-CV": "D7G/LFHOgUK803T0UYzO4Q.1",
      "trouter-request": "{\"id\":\"306f8d58-0dc8-438c-8de8-f95f0d3ce440\",\"src\":\"10.128.16.114\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184714566\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"lastActiveTime\":\"2025-11-07T21:36:04.80486Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184714566",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "lastActiveTime": "2025-11-07T21:36:04.80486Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 932159525,
    "status": 200,
    "headers": {
      "MS-CV": "D7G/LFHOgUK803T0UYzO4Q.1.0",
      "trouter-request": "{\"id\":\"306f8d58-0dc8-438c-8de8-f95f0d3ce440\",\"src\":\"10.128.16.114\",\"port\":3443}",
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
- receive: `3:::`
  ```json
  {
    "id": 853494001,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "295",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "84ec1728-86ef-4b86-a4f6-3d8820ee68cd",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-b6cbe4ab79fc4779287c7a976f2af5a1-c96e8a254478bc15-00",
      "MS-CV": "4FNfJkJswUyYN7NR9VWh/A.1",
      "trouter-request": "{\"id\":\"f4ac91e5-6768-4fc3-bdff-2773bb9517ae\",\"src\":\"10.128.61.156\",\"port\":3443}",
      "Trouter-TimeoutMs": "117547",
      "Trouter-Timeout": "117047"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184714566\",\"source\":\"ups\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"deviceType\":\"Web\"}}],\"isSnapshot\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184714566",
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
    "id": 853494001,
    "status": 200,
    "headers": {
      "MS-CV": "4FNfJkJswUyYN7NR9VWh/A.1.0",
      "trouter-request": "{\"id\":\"f4ac91e5-6768-4fc3-bdff-2773bb9517ae\",\"src\":\"10.128.61.156\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
  }
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
    "id": 914388351,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "293",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "5e303440-8a6a-4e7d-b6b1-05e08583a2c2",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-e2b225d33f7eb25bffa6e4fce64d7553-6266c1a98b102bc6-00",
      "MS-CV": "44nH2S5aykq5Nf6fiE90iQ.1",
      "trouter-request": "{\"id\":\"ae35b6af-db29-4342-bb0c-2760442949a9\",\"src\":\"10.128.51.236\",\"port\":3443}",
      "Trouter-TimeoutMs": "117549",
      "Trouter-Timeout": "117049"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184714599\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Busy\",\"activity\":\"InACall\",\"lastActiveTime\":\"2025-11-07T21:35:42.7794547Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184714599",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Busy",
            "activity": "InACall",
            "lastActiveTime": "2025-11-07T21:35:42.7794547Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 914388351,
    "status": 200,
    "headers": {
      "MS-CV": "44nH2S5aykq5Nf6fiE90iQ.1.0",
      "trouter-request": "{\"id\":\"ae35b6af-db29-4342-bb0c-2760442949a9\",\"src\":\"10.128.51.236\",\"port\":3443}",
      "trouter-client": "{\"cd\":2}"
    },
    "body": ""
  }
  ```
- send: `5:9+::`
  ```json
  {
    "name": "ping"
  }
  ```
- receive: `3:::`
  ```json
  {
    "id": 476125771,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "293",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "5e303440-8a6a-4e7d-b6b1-05e08583a2c2",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-e2b225d33f7eb25bffa6e4fce64d7553-48b24876d2b2e00e-00",
      "MS-CV": "QvAhFNr4DEGrNt1g2S4wIQ.1",
      "trouter-request": "{\"id\":\"c6f0cdf2-b9da-4a3e-8c64-b9ab99cdb744\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184714599\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Busy\",\"activity\":\"InACall\",\"lastActiveTime\":\"2025-11-07T21:35:42.7794547Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184714599",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Busy",
            "activity": "InACall",
            "lastActiveTime": "2025-11-07T21:35:42.7794547Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 476125771,
    "status": 200,
    "headers": {
      "MS-CV": "QvAhFNr4DEGrNt1g2S4wIQ.1.0",
      "trouter-request": "{\"id\":\"c6f0cdf2-b9da-4a3e-8c64-b9ab99cdb744\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "trouter-client": "{\"cd\":0}"
    },
    "body": ""
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
    "id": 1023028077,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "299",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "af8346f5-d76f-4862-af65-8fb691f36d65",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-5db6b2f993f12d903a9d763009051c63-a9c868ee88a78e90-00",
      "MS-CV": "IkjMBb509k6k5p+Vu0AYYw.1",
      "trouter-request": "{\"id\":\"76e03ac8-8584-4592-bcc6-422c59fce60f\",\"src\":\"10.128.16.149\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184714599\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Busy\",\"activity\":\"InACall\",\"lastActiveTime\":\"2025-11-07T21:36:15.246Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184714599",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Busy",
            "activity": "InACall",
            "lastActiveTime": "2025-11-07T21:36:15.246Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 1023028077,
    "status": 200,
    "headers": {
      "MS-CV": "IkjMBb509k6k5p+Vu0AYYw.1.0",
      "trouter-request": "{\"id\":\"76e03ac8-8584-4592-bcc6-422c59fce60f\",\"src\":\"10.128.16.149\",\"port\":3443}",
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
- receive: `3:::`
  ```json
  {
    "id": -2143307530,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "299",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "af8346f5-d76f-4862-af65-8fb691f36d65",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-5db6b2f993f12d903a9d763009051c63-0f1dafcefcc78005-00",
      "MS-CV": "vGhjp7OOO0OeeJQRzrDJNQ.1",
      "trouter-request": "{\"id\":\"9f828aa6-45d3-4a67-8866-45c498da9f7a\",\"src\":\"10.128.50.22\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184714599\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Busy\",\"activity\":\"InACall\",\"lastActiveTime\":\"2025-11-07T21:36:15.246Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184714599",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Busy",
            "activity": "InACall",
            "lastActiveTime": "2025-11-07T21:36:15.246Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": -2143307530,
    "status": 200,
    "headers": {
      "MS-CV": "vGhjp7OOO0OeeJQRzrDJNQ.1.0",
      "trouter-request": "{\"id\":\"9f828aa6-45d3-4a67-8866-45c498da9f7a\",\"src\":\"10.128.50.22\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
  }
  ```
- receive: `6:::10+`
  ```json
  [
    "pong"
  ]
  ```
- send: `5:11+::`
  ```json
  {
    "name": "ping"
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
    "id": 853500910,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "300",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "59ff362c-7e55-4ade-a4a5-d5c047f5ae3e",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-eb72beb7e5a09d42f98f7d2555754547-a15a53f535c37fbc-00",
      "MS-CV": "P9BWUAliP06SBvL6ME2IPA.1",
      "trouter-request": "{\"id\":\"c3ec59c2-f2b6-40bf-9c3f-3f76d875d3a8\",\"src\":\"10.128.61.156\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184714631\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"lastActiveTime\":\"2025-11-07T21:35:42.7794547Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184714631",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "lastActiveTime": "2025-11-07T21:35:42.7794547Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 853500910,
    "status": 200,
    "headers": {
      "MS-CV": "P9BWUAliP06SBvL6ME2IPA.1.0",
      "trouter-request": "{\"id\":\"c3ec59c2-f2b6-40bf-9c3f-3f76d875d3a8\",\"src\":\"10.128.61.156\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
- receive: `3:::`
  ```json
  {
    "id": 247387294,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "300",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "59ff362c-7e55-4ade-a4a5-d5c047f5ae3e",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-eb72beb7e5a09d42f98f7d2555754547-445164d4661c6a26-00",
      "MS-CV": "NNj8ZsvOM0mzLEvUnGOB/w.1",
      "trouter-request": "{\"id\":\"f5d9f108-d183-4b75-838a-5f5ed121881d\",\"src\":\"10.128.16.205\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"etag\":\"A0184714631\",\"presence\":{\"sourceNetwork\":\"Self\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"lastActiveTime\":\"2025-11-07T21:35:42.7794547Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "etag": "A0184714631",
          "presence": {
            "sourceNetwork": "Self",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "lastActiveTime": "2025-11-07T21:35:42.7794547Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 247387294,
    "status": 200,
    "headers": {
      "MS-CV": "NNj8ZsvOM0mzLEvUnGOB/w.1.0",
      "trouter-request": "{\"id\":\"f5d9f108-d183-4b75-838a-5f5ed121881d\",\"src\":\"10.128.16.205\",\"port\":3443}",
      "trouter-client": "{\"cd\":0}"
    },
    "body": ""
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
    "id": 476129871,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/messaging",
    "headers": {
      "Accept-Encoding": "gzip, deflate, br",
      "Trouter-Timeout": "117048",
      "Content-Length": "2114",
      "Content-Type": "text/xml",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Skype-NotificationHub/1.0.0-25.10.31.9+2181e8856490b235480ee1b9b29d7c6ccc0b7a93 (France Central)",
      "X-Trouter-Delivery-Control": "async; ttl=900; flow=messaging; prio=normal",
      "X-Microsoft-Skype-Message-ID": "3ce1fc90-39b2-4135-a4bc-0fc653041915",
      "MS-CV": "WYkl5fzFyEu/h+JjsF9bHg.1.1.1.1171230330.1.1.0.1.1",
      "traceparent": "00-462e4736c192346360ee6bd433ebbc02-f3cfd092c29bf33d-00",
      "trouter-request": "{\"id\":\"a089a991-682a-4c43-aea9-208a0b2918ad\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548"
    },
    "body": "{\"time\":\"2025-11-07T21:37:11.5531163Z\",\"type\":\"EventMessage\",\"resourceLink\":\"https://notifications.skype.net/v1/users/ME/conversations/48:calllogs/messages/1762551431514\",\"resourceType\":\"NewMessage\",\"resource\":{\"clientmessageid\":\"1762551431474\",\"content\":\"Call Logs for Call 9cab2ae0-4b7b-4732-8ff5-19c70188844d\",\"from\":\"https://notifications.skype.net/v1/users/ME/contacts/8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"imdisplayname\":\"\",\"prioritizeimdisplayname\":null,\"id\":\"1762551431514\",\"messagetype\":\"Text\",\"originalarrivaltime\":\"2025-11-07T21:37:11.5140000Z\",\"properties\":{\"call-log\":\"{\\\"startTime\\\":\\\"2025-11-07T21:36:25.499332Z\\\",\\\"connectTime\\\":\\\"2025-11-07T21:36:38.464206Z\\\",\\\"endTime\\\":\\\"2025-11-07T21:37:11.4522914Z\\\",\\\"callDirection\\\":\\\"outgoing\\\",\\\"callType\\\":\\\"twoParty\\\",\\\"callState\\\":\\\"accepted\\\",\\\"userParticipantId\\\":\\\"e58189be-7879-4d33-8e9d-0b64c6127926\\\",\\\"originator\\\":\\\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\\\",\\\"target\\\":\\\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"originatorParticipant\\\":{\\\"id\\\":\\\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\\\",\\\"type\\\":\\\"default\\\",\\\"displayName\\\":\\\"Neil Rashbrook\\\",\\\"applicationType\\\":null,\\\"alternateId\\\":null},\\\"targetParticipant\\\":{\\\"id\\\":\\\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\\\",\\\"type\\\":\\\"default\\\",\\\"displayName\\\":null,\\\"applicationType\\\":null,\\\"alternateId\\\":null},\\\"callId\\\":\\\"9cab2ae0-4b7b-4732-8ff5-19c70188844d\\\",\\\"callAttributes\\\":null,\\\"forwardingInfo\\\":null,\\\"transferInfo\\\":null,\\\"participants\\\":null,\\\"participantList\\\":null,\\\"threadId\\\":null,\\\"sessionType\\\":\\\"default\\\",\\\"sharedCorrelationId\\\":\\\"6cb9320c-5691-4f0c-b14b-cb4805ffaf17\\\",\\\"messageId\\\":null}\",\"s2spartnername\":\"concore_gvc\",\"languageStamp\":\"languages=en:100;nl:83;de:79;length:55;&detector=Bling\",\"importance\":\"\",\"subject\":\"\"},\"sequenceId\":117,\"version\":\"1762551431514\",\"composetime\":\"2025-11-07T21:37:11.5140000Z\",\"type\":\"Message\",\"conversationLink\":\"https://notifications.skype.net/v1/users/ME/conversations/48:calllogs\",\"to\":\"48:calllogs\",\"contenttype\":\"text\",\"threadtype\":\"streamofcalllogs\",\"isactive\":false,\"inQuarantine\":false},\"isactive\":true}"
  }
  ```
  - `body`:
    ```json
    {
      "time": "2025-11-07T21:37:11.5531163Z",
      "type": "EventMessage",
      "resourceLink": "https://notifications.skype.net/v1/users/ME/conversations/48:calllogs/messages/1762551431514",
      "resourceType": "NewMessage",
      "resource": {
        "clientmessageid": "1762551431474",
        "content": "Call Logs for Call 9cab2ae0-4b7b-4732-8ff5-19c70188844d",
        "from": "https://notifications.skype.net/v1/users/ME/contacts/8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
        "imdisplayname": "",
        "prioritizeimdisplayname": null,
        "id": "1762551431514",
        "messagetype": "Text",
        "originalarrivaltime": "2025-11-07T21:37:11.5140000Z",
        "properties": {
          "call-log": "{\"startTime\":\"2025-11-07T21:36:25.499332Z\",\"connectTime\":\"2025-11-07T21:36:38.464206Z\",\"endTime\":\"2025-11-07T21:37:11.4522914Z\",\"callDirection\":\"outgoing\",\"callType\":\"twoParty\",\"callState\":\"accepted\",\"userParticipantId\":\"e58189be-7879-4d33-8e9d-0b64c6127926\",\"originator\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"target\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"originatorParticipant\":{\"id\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"type\":\"default\",\"displayName\":\"Neil Rashbrook\",\"applicationType\":null,\"alternateId\":null},\"targetParticipant\":{\"id\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"type\":\"default\",\"displayName\":null,\"applicationType\":null,\"alternateId\":null},\"callId\":\"9cab2ae0-4b7b-4732-8ff5-19c70188844d\",\"callAttributes\":null,\"forwardingInfo\":null,\"transferInfo\":null,\"participants\":null,\"participantList\":null,\"threadId\":null,\"sessionType\":\"default\",\"sharedCorrelationId\":\"6cb9320c-5691-4f0c-b14b-cb4805ffaf17\",\"messageId\":null}",
          "s2spartnername": "concore_gvc",
          "languageStamp": "languages=en:100;nl:83;de:79;length:55;&detector=Bling",
          "importance": "",
          "subject": ""
        },
        "sequenceId": 117,
        "version": "1762551431514",
        "composetime": "2025-11-07T21:37:11.5140000Z",
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
    "id": 476129871,
    "status": 200,
    "headers": {
      "MS-CV": "WYkl5fzFyEu/h+JjsF9bHg.1.1.1.1171230330.1.1.0.1.1.0",
      "trouter-request": "{\"id\":\"a089a991-682a-4c43-aea9-208a0b2918ad\",\"src\":\"10.128.59.12\",\"port\":3443}",
      "trouter-client": "{\"cd\":5}"
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
    "id": 932168046,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "306",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "1bc90aa7-5c82-4883-8df8-c871afd63581",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-d4eb70200a511a92593071fdef3e588f-c76eca3f3829efa7-00",
      "MS-CV": "3o6WCKrt4EWq+IVkMdEsKg.1",
      "trouter-request": "{\"id\":\"d1dfcd98-da67-4835-bfb0-158db50cf0e1\",\"src\":\"10.128.16.114\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184714632\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"lastActiveTime\":\"2025-11-07T21:36:15.246Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184714632",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "lastActiveTime": "2025-11-07T21:36:15.246Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 932168046,
    "status": 200,
    "headers": {
      "MS-CV": "3o6WCKrt4EWq+IVkMdEsKg.1.0",
      "trouter-request": "{\"id\":\"d1dfcd98-da67-4835-bfb0-158db50cf0e1\",\"src\":\"10.128.16.114\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
- receive: `3:::`
  ```json
  {
    "id": 932168052,
    "method": "POST",
    "url": "/v4/f/KGvsr_12N0m_nkkDXbF8Hw/unifiedPresenceService",
    "headers": {
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Length": "306",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-euno-10-t.trouter.teams.microsoft.com",
      "User-Agent": "Microsoft.Skype.Presence.App/1.0",
      "X-Microsoft-Skype-Chain-ID": "1bc90aa7-5c82-4883-8df8-c871afd63581",
      "X-Microsoft-Skype-Message-ID": "0",
      "X-Trouter-Delivery-Control": "async; ttl=600",
      "x-ms-client-user-agent": "Microsoft.Skype.Presence.App/1.0",
      "traceparent": "00-d4eb70200a511a92593071fdef3e588f-6c8a931d9269ab9e-00",
      "MS-CV": "O9uNvvnXwkmXpMPxchGkFg.1",
      "trouter-request": "{\"id\":\"56703e0d-93f5-4cbe-b55b-04510686007c\",\"src\":\"10.128.16.114\",\"port\":3443}",
      "Trouter-TimeoutMs": "117548",
      "Trouter-Timeout": "117048"
    },
    "body": "{\"presence\":[{\"mri\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"etag\":\"A0184714632\",\"presence\":{\"sourceNetwork\":\"SameEnterprise\",\"calendarData\":{\"isOutOfOffice\":false},\"capabilities\":[],\"availability\":\"Available\",\"activity\":\"Available\",\"lastActiveTime\":\"2025-11-07T21:36:15.246Z\",\"deviceType\":\"Web\"}}]}"
  }
  ```
  - `body`:
    ```json
    {
      "presence": [
        {
          "mri": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "etag": "A0184714632",
          "presence": {
            "sourceNetwork": "SameEnterprise",
            "calendarData": {
              "isOutOfOffice": false
            },
            "capabilities": [],
            "availability": "Available",
            "activity": "Available",
            "lastActiveTime": "2025-11-07T21:36:15.246Z",
            "deviceType": "Web"
          }
        }
      ]
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 932168052,
    "status": 200,
    "headers": {
      "MS-CV": "O9uNvvnXwkmXpMPxchGkFg.1.0",
      "trouter-request": "{\"id\":\"56703e0d-93f5-4cbe-b55b-04510686007c\",\"src\":\"10.128.16.114\",\"port\":3443}",
      "trouter-client": "{\"cd\":0}"
    },
    "body": ""
  }
  ```
- receive: `6:::14+`
  ```json
  [
    "pong"
  ]
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
- `epid`=`c4e76935-9c61-4a23-9ede-0456a703a1a0`
- `ccid`=
- `dom`=`teams.microsoft.com`
- `cor_id`=`e94dd14f-43b4-40b4-81bc-4d44a095cdb0`
- `con_num`=`1762551365700_0`

The following messages occurred in that session:
- receive: `1::`
- send: `5:::`
  ```json
  {
    "name": "user.authenticate",
    "args": [
      {
        "headers": {
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJub25jZSI6Ijh5U1pZcFRFM28ycEQ4Y2s3QVdyUEJQUWxPR3A2cTV2X0J5WVh2SzdEWHMiLCJhbGciOiJSUzI1NiIsIng1dCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSIsImtpZCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSJ9.eyJhdWQiOiJodHRwczovL2ljMy50ZWFtcy5vZmZpY2UuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4LyIsImlhdCI6MTc2MjUzNTA1NCwibmJmIjoxNzYyNTM1MDU0LCJleHAiOjE3NjI2MjE3NTQsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBVVFBdS84YUFBQUFUc25Gc1FCZ2xuZFhkbDhZWTIxeGhpam5QVXAzNEpwemZMSUN4aTZNbHRSSlpZWVhEWm43ampXcGNpbVdDYWtIMy8xcmpaaW85ZklYYzNyYldyQ1B1QT09IiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjVlM2NlNmMwLTJiMWYtNDI4NS04ZDRiLTc1ZWU3ODc4NzM0NiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiUmFzaGJyb29rIiwiZ2l2ZW5fbmFtZSI6Ik5laWwiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI4Mi4xOS45Ljg4IiwibmFtZSI6Ik5laWwgUmFzaGJyb29rIiwib2lkIjoiMWM1OTU4ZDUtZTQwYS00YTM1LWEwZTMtN2ViNjUxNzkwOTZmIiwicHVpZCI6IjEwMDMyMDAwODdEN0ZDMDAiLCJyaCI6IjEuQVRvQTZPZU5Nd3F4ZkVxdXRFemZjbV9JR0ZUd3FqbWxnY2RJcFBnQ2t3RWdsYm5oQUo0NkFBLiIsInNjcCI6IlRlYW1zLkFjY2Vzc0FzVXNlci5BbGwiLCJzaWQiOiIwMDlkMGIzOS1jNThlLTMyYjYtYWYxOC1jMTc4NTYwZDFlNGMiLCJzdWIiOiJHdFdEbl9tY05lVm16akdwT3E4VTFsNFV2czFlZTZSNmR2ZURtaVJnX3dBIiwidGlkIjoiMzM4ZGU3ZTgtYjEwYS00YTdjLWFlYjQtNGNkZjcyNmZjODE4IiwidW5pcXVlX25hbWUiOiJuZWlsQGJlb25leC5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJuZWlsQGJlb25leC5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJyNVc2bnhnS00wS1A3OEY5WXlBR0FBIiwidmVyIjoiMS4wIiwieG1zX2FjdF9mY3QiOiIzIDUiLCJ4bXNfY2MiOlsiQ1AxIl0sInhtc19mdGQiOiJEYklMSHVSWnR2WWplczhkbERVUmJQVDZXNHA2dHpZMnZac3l3QU1OTjFVQlpuSmhibU5sWXkxa2MyMXoiLCJ4bXNfaWRyZWwiOiIyNiAxIiwieG1zX3NzbSI6IjEiLCJ4bXNfc3ViX2ZjdCI6IjIgMyJ9.e94YeXu10HZ4eACvpni75FU9cMWvd2GYeRB2-GFG2QlFW2wUU9KYHPT0T-rD-hBLjzuM_8jacFCFgdiEGA1gUYAe6DPATMA-qPraNDGpx233t1D8bCNxD3bRSypickFtNDdKgtUtAfxrUAZgS2dCpaViz0tql1B2-dit50SUw8ZfOlYNIQkpioYgU_r_BLZcuxn1-68Jk7U1AzWJm_Ra4ko01iD91TYiRUS4LTjANDUI8D5cvE_sImx-E83fdH0tR2QFRhxHM7Dto3gSDRyhS2kCcd72rn-4kg24EM_VnoDDwR0SZGw-JEoqnoD5PODOE2l8iQ71U_Dh3VR05IHWQQ",
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
        "id": "0w8JzYr_a0-rbpOroSYJ9Q",
        "ccid": "rbpOroSYJ9Q",
        "url": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:8443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/",
        "surl": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/",
        "curlb": "https://pub-ent-sece-14-t.trouter.teams.microsoft.com:443",
        "healthUrl": "https://go-eu.trouter.teams.microsoft.com:443/v4/h",
        "reconnectUrl": "wss://pub-ent-sece-14-t.trouter.teams.microsoft.com:443/v4/c",
        "registrarUrl": "https://teams.microsoft.com/registrar/prod/V3/registrations",
        "socketio": "https://pub-ent-sece-14-t.trouter.teams.microsoft.com:443/",
        "ttl": "566152",
        "dur": "1",
        "connectparams": {
          "issuer": "",
          "scae": "1",
          "sig": "",
          "sr": "0w8JzYr_a0-rbpOroSYJ9Q",
          "sp": "pub-ent-sece-14",
          "se": "1763117524629",
          "st": "1762551072629"
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
            "etag": "2025-11-07T21:36:12.6301405Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-07T21:36:12.6301745Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-07T21:36:12.6301826Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-07T21:36:12.6301879Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-07T21:36:12.6301936Z"
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
            "etag": "2025-11-07T21:36:12.6301405Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-07T21:36:12.6301745Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-07T21:36:12.6301826Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-07T21:36:12.6301879Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-07T21:36:12.6301936Z"
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
            "etag": "2025-11-07T21:36:12.6301405Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-07T21:36:12.6301745Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-07T21:36:12.6301826Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-07T21:36:12.6301879Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-07T21:36:12.6301936Z"
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
            "etag": "2025-11-07T21:36:12.6301405Z"
          },
          {
            "tag": "messaging",
            "etag": "2025-11-07T21:36:12.6301745Z"
          },
          {
            "tag": "messagingsync",
            "etag": "2025-11-07T21:36:12.6301826Z"
          },
          {
            "tag": "pinnedchannel",
            "etag": "2025-11-07T21:36:12.6301879Z"
          },
          {
            "tag": "tps",
            "etag": "2025-11-07T21:36:12.6301936Z"
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
    "id": 333992953,
    "method": "POST",
    "url": "/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/aec262e0/call/progress/",
    "headers": {
      "Content-Length": "386",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-14-t.trouter.teams.microsoft.com",
      "User-Agent": "CallController/2.47.4546.0",
      "X-Microsoft-Skype-Chain-ID": "9cab2ae0-4b7b-4732-8ff5-19c70188844d",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-Microsoft-Skype-Client": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "06b36030-46ba-4e44-9f44-bba2ea6ee051",
      "X-Microsoft-Skype-Message-ID": "a8b9817f-dda0-491e-9a54-0b5775768b96",
      "traceparent": "00-117b1600afd164f1da4e9170a2909441-59b3b9664faa4d45-00",
      "MS-CV": "DCjVgVBFtkubOky8Hv8k7A.1",
      "trouter-request": "{\"id\":\"1e199038-acaf-4b52-bbc6-93aaf81f08b1\",\"src\":\"10.128.150.150\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"callProgress\":{\"sender\":{\"id\":\"8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7\",\"displayName\":\"Ben Bucksch\",\"endpointId\":\"0ee99dd3-73c5-4580-b1f2-eb63da9d1c10\",\"languageId\":\"en-US\",\"participantId\":\"f394a762-e0c2-42e4-beb4-01a271908892\",\"hidden\":false},\"status\":\"ringing\",\"phrase\":\"ringing\"},\"debugContent\":{\"ProcessingCallControllerInstance\":\"https://cc-euno-04-prod-aks.cc.skype.com/\"}}"
  }
  ```
  - `body`:
    ```json
    {
      "callProgress": {
        "sender": {
          "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "displayName": "Ben Bucksch",
          "endpointId": "0ee99dd3-73c5-4580-b1f2-eb63da9d1c10",
          "languageId": "en-US",
          "participantId": "f394a762-e0c2-42e4-beb4-01a271908892",
          "hidden": false
        },
        "status": "ringing",
        "phrase": "ringing"
      },
      "debugContent": {
        "ProcessingCallControllerInstance": "https://cc-euno-04-prod-aks.cc.skype.com/"
      }
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 333992953,
    "status": 200,
    "headers": {
      "MS-CV": "DCjVgVBFtkubOky8Hv8k7A.1.0",
      "trouter-request": "{\"id\":\"1e199038-acaf-4b52-bbc6-93aaf81f08b1\",\"src\":\"10.128.150.150\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
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
    "id": 333995019,
    "method": "POST",
    "url": "/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/b1898b8a/call/acceptance/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-14-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "CallController/2.47.4546.0",
      "X-Microsoft-Skype-Chain-ID": "9cab2ae0-4b7b-4732-8ff5-19c70188844d",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-Microsoft-Skype-Client": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "5ce9f1bf-ea78-4408-bd6e-024150dbd065",
      "X-Microsoft-Skype-Message-ID": "ab6602f3-86ec-43ea-bd43-c086c4ba7ea6",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-6bf80aebcfe9bc83ff2aa0807788bc6f-75414022c62d054f-00",
      "MS-CV": "GtUs0zDRq0KLxGsmTl3Prg.1",
      "trouter-request": "{\"id\":\"a67313c0-9540-4c49-b012-b0404d750c3c\",\"src\":\"10.128.150.150\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "H4sIAAAAAAAAA9wZa2/cuPGvCAv0PgThiqRIiWKwOHgfTnyNHSd2nJ7roqAoaq2zXpC09tqG/3uH0tpe27s5Xw8t0iZZRJrhPDkznKFuB1pl2Y7WpmpVoc1A3g5U92bi8bV9S+OBHAhZ1vM0lhwrEqjQQ4HxPMRYQlCkTIJEQj3GeJB4Jhi8HcRpU2Xq+kDlwHAwNoUzXuiLRp8/xR2Vi9qKHNSLok1zs3O4BwtMEVdlWrR7VjA2JgzjGAR6miPGBUYRSSgyke/FKoyJJhhoMlXMF2puOhpToK9HAKxU3aY6rdSKV+KFTAU+EGNNEaOGochEDGGiaEBCLERIgew8jWNTDGSissa8HbSmuGfgeSI2gRGgAlYIeGmkLAOm4ySgfqIFEYO7tw8OnIBr98tYZWmbmmYg/z5QizgtB/8AhdPioumdfVGUV5mJ5yY3RQtSztu2aqTrqiodJlk6P2+rulxeD1uj8maYp7oumzJph7rM7Rr3krqmcrVGZlGUCDMEy2OkLpqh1sPm4roy3VKt3UviPt1tlweR8E2okMcx7GcQcxQyTFEgBDE60sTg0CWeqzyXBB5z17T9OR0RjAgViIgAkdAD11nuH838P22E0m16+YeVf6HwT2bkeyIUWNCQM8xCgrFYWTEpi7Yus8zUH8CS41oVTVXW99sDhnE6JAR+FA997ppCA2Fu4lR9MYWZl22q2rQsfkxPuPWDji+3cZtXWuuDxNQ/qEn36r3antpAGdLPk+73lJSMeWupdPhYYl6nMQ3cC+pyErhr8n+u29F9cbK1yZYmW5nWC9NPtR6Z61+u4/fZxd5vZfppWl3qPK5OpyXZfz9bHtAZ37/G3unx/s3H48/49LdZ+2u+m52mmJ3+tndzMP1MDuivN6fHOv04sXyWleVz+o21Jyf7PezDLzcW9uUbx6d/++VK59nN6cn4OvLO+V6B/0K5N/3ptf5tWvDNp0U7h1o+P/jhU2Kbuq+Op/Myi39Q26xqr7YjL4u0LX/UNF9p9/pa3tfxkzQ25VFbg+awvWu2VYsIQQaixmiDCEPJEJYvWlNvslJ6NvsvmZu4odmpZh9ODgs8iZcHJ193Px/k7z/3x+scGLqa01gRJpDnQZPEQhqDYYmPEsoFS4SJwoS5OEw09WnY0bkbdXXBiEUVQ6Xet6fL1DS6Tisbmc0PY4YICDM+7FJnxjZt71YHpD1au6J72+0OPB5DaIAxqqqyVHdZ5zZxhYq5RmRo27soKyNYcDnCZ/VZUY7y8ibNMjUcDo8/7B39E/4dTQ93vhzvoDAcYod4nHlwMhMSBJQTP/Spg529A2fvkDl42P21jJoRsv9Fo8mxZBh3sHaEne5BjcyyzVWFwKbyCuXp0sQ9vIEOtTb6sn9LweNlb6Js61RfZKZH5E0aw4bkcDakWjrf9o+cNz1mDntTyfHXg+nHGShGHM/C81HXHTrcI6Fwvhwfukc7J4cOBLJDCHFCWCkcQn27Vo9W1nRtCBtSzodEkJ79EjXpvICus5ijJJJvnCXKTdNAe+yAix2ruoyb84fFTa0RnJ5zI7kQXoj9gKKHp35V3VbgCml1mRy4TKyc9YgABctq0fQo9ylV6LwPKHU7DHmCwc7hZP+r+4KdsPCdl3Cw3mlNZqrzsjDIXNoIfVyU5G2vSa6WdsSIoFutIRRHnVLvGkgHU47Iu0Vj0iJSRZwYPSLrtMAeqgpf337JnEVdyNS0iYSBApJJgjLoHCJg2comNo3M0/j3AqaF/e4r3io2YJbCj2Eib6OIeZC7HHlhN1jRCCmfRXbiMVSHifBifufc4jA0Ucw5grEIliWGIEF8A8MM9mkUwPyVqLttUbpIajWXHo805ZQ8wqurWCY+i6n2fEaSKIi8hGPfj5VnmA5MjP2V2gmElKmrGqYz2ZwrRLnvUCJ3pnIHSy+UnMvpWO5SOSPSoxLvSm8ig7GkvpxM5GwihZBUSOxJHkriSxzI3RmUIzkL5HhXTqYyHEsRSMYlCaSPJZv1gjXsVmrLirTp8nV6CGIpBTMg0R0SQhL4ok8C4gAI1GqvK+e8bNrn9LDcaTVskm6BB+acMhaEz3mEW+nZSr7woML43rMEXCWvJa4NhKBTqziuny+q7SjRL13tFaTgY/I5uoDhWN6GLOYehXNUswhmXxitkdCh3XHiez5OIu6xu/v8AJPyxbJ/y1RkMpmrtEBdSemry6U9V55Xl9B3wsABSAg+wOAcDAbiAH5QawiHn+8w7rA/XXVsOEowsy8/8PD2Um+oQILykHNMQvTw9LSW+M7JoXBD/Lw0gBV1u9yEEEARbkKEWyisHz5Qn21Esa1EwXYisY0IPLyNCBy/mQi2Y+eEbEK8oOirGpgDnViSZgZlUDMzlMYjGDEwSd7176q5znPT1td96TIxFMkKiqdp05vuOEZ5GRsAQmFFSTOCkoO75zyqmhEkENTXHgev3nPpwSbp+LvSn9Rz/se1X6OHgFlpDQVDiF7NeuSv6wixo6p2FPrrMPEKurCnE0/sZR0QvP4EKlbQ4Iltfg+9P3I6KOuBjK+lNiQUGFLAnmwEOtA4vUBonTtJWr+Az8tyjmqTRy8w7f01B9L6GVJsEi62CRdbhIutwsV3hNsAfin9HvpSvMVslG8RWxSwqO9pEGzUINiqQbBNg2C7BsH3NIA02KDBCrpBA8Bs1gAQ2zQA1HYN2CYF2Db5bIt4tlU62yR81YNRp7t1O4M/V1dXwysTAdWwrOdnZ2ZZmTq1tyjN2dljZ3Z2pqIG2UMH2ZvlJ9y8p9xsa9fzgj7uLK5V0iKYmHNTozqHcQQ9qnUFRyiyA+4SxpbGtvwIk/9Ot3jfrxXriP/xrq5rex7O+T/d9nRvdZPemBdtUNf7rLdB+LEF8liPWCJo8NSL8YsGrxy6LLW98mhLXWay0W21ob+xI6kIGccBenx8NuMETs9sU1dAt5zxdHWS0ODfCS7v/3Bk2NQSW6+uTIXtQTanJX/wZNfR9C0rslFkS7IXMCJo55/7C/6PZt59Ddod786m/pgyjDmj0+l4Mptwn/EZJt4Mmnn7KavRKus6qE9aL+q6u3tafVcqzNWnpLtPXwF0lkIV+1jq+2vS92NgYS9FrifnqiiMvW2GDIExtvtylC+yNn2O6RBp3H1semM/NHUqr6EHt2cDu89HkAbjb0cGAgNoLMzEJypbmHHaNoemPjIaEL6NM3x3N7i7u+s/jPzVmGong+jZK4DfpcoGkgYY36s/W328m6hKRen9hy8hoInyfcthHVwssuzxe99TkoCGnIDM2ESL+dqV0WFdatgj8OTkyWeavaJZfcB89V2+C1b9CwAA//8DAB13L8kAHQAA"
  }
  ```
  - `body`: (gzipped)
    ```json
    {
      "callAcceptance": {
        "acceptedBy": {
          "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
          "displayName": "Ben Bucksch",
          "displayNameSource": "runtimeAPI",
          "endpointId": "0ee99dd3-73c5-4580-b1f2-eb63da9d1c10",
          "languageId": "en-US",
          "participantId": "f394a762-e0c2-42e4-beb4-01a271908892",
          "hidden": false,
          "tenantId": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818"
        },
        "acceptedCallModalities": [
          "audio"
        ],
        "links": {
          "acknowledgement": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euno-04-prod-aks.cc.skype.com/cc/v1/callAcceptance/57b86e9a-3503-47d5-9402-7881ecbc1e09/13/a3/1734/acknowledge?i=10-128-187-193",
          "callLeg": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euno-04-prod-aks.cc.skype.com/cc/v1/active/57b86e9a-3503-47d5-9402-7881ecbc1e09/13/a3/1734?i=10-128-187-193&e=638980829540491008",
          "callControllerHttpTransport": "http://52.112.120.65/enc",
          "mediaRenegotiation": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euno-04-prod-aks.cc.skype.com/cc/v1/active/57b86e9a-3503-47d5-9402-7881ecbc1e09/13/a3/1734/renegotiate?i=10-128-187-193&e=638980829540491008",
          "transfer": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euno-04-prod-aks.cc.skype.com/cc/v1/active/57b86e9a-3503-47d5-9402-7881ecbc1e09/13/a3/1734/transfer?i=10-128-187-193&e=638980829540491008",
          "replacement": "https://cc-euno-04-prod-aks.cc.skype.com:443/cc/v1/callParticipant/57b86e9a-3503-47d5-9402-7881ecbc1e09/27/k2/517/replacement?rt=f394a762e0c242e4beb401a271908892&rc=eyJydGlkIjoiODpvcmdpZDo1MGExN2E5My03ZTMzLTQ0ZjEtYmFlZi04ZjIzNDQ1N2YzZTciLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5In0%253D&i=10-128-187-193&e=638980829540491008",
          "startOutgoingNegotiation": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euno-04-prod-aks.cc.skype.com/cc/v1/active/57b86e9a-3503-47d5-9402-7881ecbc1e09/13/a3/1734/startOutgoingNegotiation?i=10-128-187-193&e=638980829540491008",
          "hold": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euno-04-prod-aks.cc.skype.com/cc/v1/active/57b86e9a-3503-47d5-9402-7881ecbc1e09/13/a3/1734/hold?i=10-128-187-193&e=638980829540491008",
          "monitor": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/cc-euno-04-prod-aks.cc.skype.com/cc/v1/active/57b86e9a-3503-47d5-9402-7881ecbc1e09/13/a3/1734/monitor?i=10-128-187-193&e=638980829540491008",
          "controlVideoStreaming": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/9eApEHVPn0CdxNVUFQNmGQ/callAgent/c52da148-33f1-492d-94f6-f2584f8eb9f4/09fc2629/call/controlVideoStreaming/",
          "updateMediaDescriptions": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/9eApEHVPn0CdxNVUFQNmGQ/callAgent/c52da148-33f1-492d-94f6-f2584f8eb9f4/8714e613/call/updateMediaDescriptions"
        },
        "mediaContent": {
          "contentType": "application/sdp-ngc-1.0",
          "blob": "v=0\r\no=mozilla...THIS_IS_SDPARTA-99.0 1354312011772516962 0 IN IP4 0.0.0.0\r\ns=-\r\nb=CT:4000\r\nt=0 0\r\na=extmap-allow-mixed\r\na=sendrecv\r\na=ice-options:trickle\r\na=msid-semantic: WMS *\r\na=group:BUNDLE 0 1 3\r\nm=audio 53198 RTP/SAVP 100 111 9 0 8 126\r\nc=IN IP4 52.114.255.181\r\na=x-signaling-fb:* x-message app recv:dsh\r\na=x-ssrc-range:588390672-588390672\r\na=rtpmap:100 CN/48000\r\na=rtpmap:111 opus/48000/2\r\na=rtpmap:9 G722/8000/1\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:126 telephone-event/8000\r\na=fmtp:111 maxplaybackrate=48000;stereo=1;useinbandfec=1\r\na=fmtp:126 0-15\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap-allow-mixed\r\na=setup:active\r\na=mid:0\r\na=msid:{bb43ece5-3933-442b-a64b-458e2c9f83d5} {099ebd55-ee93-4fe1-816e-42062b77f3fa}\r\na=sendrecv\r\na=ice-ufrag:35bc2521\r\na=ice-pwd:f64d2c3641fb7b3f5066da3e4c7ed06e\r\na=fingerprint:sha-256 21:AD:A0:39:55:DB:F2:E1:32:0F:3C:7B:26:CC:EC:88:28:03:59:16:07:FE:34:E7:BF:CD:9B:87:45:17:60:4E\r\na=candidate:0 1 UDP 2122252543 192.168.255.11 54356 typ host\r\na=candidate:3 1 tcp-act 2105524479 192.168.255.11 9 typ host\r\na=candidate:4 1 UDP 8331263 52.114.255.181 53198 typ relay raddr 52.114.255.181 rport 53198\r\na=ssrc:588390672 cname:{94d53204-c4b5-43e7-8c91-8116360fb534}\r\na=rtcp-mux\r\na=label:main-audio\r\nm=video 53198 RTP/SAVP 96 97 98 99 103 104 107 108 115 116 45 46\r\nc=IN IP4 52.114.255.181\r\na=x-signaling-fb:* x-message app send:src recv:src,vc\r\na=x-ssrc-range:825955019-825955019\r\na=rtpmap:96 VP8/90000\r\na=rtpmap:97 rtx/90000\r\na=rtpmap:98 VP9/90000\r\na=rtpmap:99 rtx/90000\r\na=rtpmap:103 H264/90000\r\na=rtpmap:104 rtx/90000\r\na=rtpmap:107 H264/90000\r\na=rtpmap:108 rtx/90000\r\na=rtpmap:115 H264/90000\r\na=rtpmap:116 rtx/90000\r\na=rtpmap:45 AV1/90000\r\na=rtpmap:46 rtx/90000\r\na=fmtp:103 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1;max-fs=8160;max-mbps=244800;max-fps=3000\r\na=fmtp:107 profile-level-id=42001f;level-asymmetry-allowed=1\r\na=fmtp:115 profile-level-id=42e01f;level-asymmetry-allowed=1\r\na=fmtp:96 max-fs=12288;max-fr=60\r\na=fmtp:97 apt=96\r\na=fmtp:98 max-fs=12288;max-fr=60\r\na=fmtp:99 apt=98\r\na=fmtp:104 apt=103\r\na=fmtp:108 apt=107\r\na=fmtp:116 apt=115\r\na=fmtp:46 apt=45\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtcp-fb:98 nack\r\na=rtcp-fb:98 nack pli\r\na=rtcp-fb:98 ccm fir\r\na=rtcp-fb:98 goog-remb\r\na=rtcp-fb:98 transport-cc\r\na=rtcp-fb:103 nack\r\na=rtcp-fb:103 nack pli\r\na=rtcp-fb:103 ccm fir\r\na=rtcp-fb:103 goog-remb\r\na=rtcp-fb:103 transport-cc\r\na=rtcp-fb:107 nack\r\na=rtcp-fb:107 nack pli\r\na=rtcp-fb:107 ccm fir\r\na=rtcp-fb:107 goog-remb\r\na=rtcp-fb:107 transport-cc\r\na=rtcp-fb:115 nack\r\na=rtcp-fb:115 nack pli\r\na=rtcp-fb:115 ccm fir\r\na=rtcp-fb:115 goog-remb\r\na=rtcp-fb:115 transport-cc\r\na=rtcp-fb:45 nack\r\na=rtcp-fb:45 nack pli\r\na=rtcp-fb:45 ccm fir\r\na=rtcp-fb:45 goog-remb\r\na=rtcp-fb:45 transport-cc\r\na=extmap:2 http:\\\\www.webrtc.org\\experiments\\rtp-hdrext\\abs-send-time\r\na=extmap:3 http:\\\\www.ietf.org\\id\\draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap-allow-mixed\r\na=setup:active\r\na=mid:1\r\na=inactive\r\na=ice-ufrag:35bc2521\r\na=ice-pwd:f64d2c3641fb7b3f5066da3e4c7ed06e\r\na=fingerprint:sha-256 21:AD:A0:39:55:DB:F2:E1:32:0F:3C:7B:26:CC:EC:88:28:03:59:16:07:FE:34:E7:BF:CD:9B:87:45:17:60:4E\r\na=ssrc:825955019 cname:{94d53204-c4b5-43e7-8c91-8116360fb534}\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=label:main-video\r\nm=video 0 RTP/SAVP 34\r\nm=x-data 53198 RTP/SAVP 127 126\r\nc=IN IP4 52.114.255.181\r\na=x-data-protocol:sctp\r\na=x-ssrc-range:1177894507-1177894507\r\na=rtpmap:127 x-data/90000\r\na=rtpmap:126 rtx/90000\r\na=fmtp:126 apt=127\r\na=extmap-allow-mixed\r\na=setup:active\r\na=mid:3\r\na=sendrecv\r\na=ice-ufrag:35bc2521\r\na=ice-pwd:f64d2c3641fb7b3f5066da3e4c7ed06e\r\na=fingerprint:sha-256 21:AD:A0:39:55:DB:F2:E1:32:0F:3C:7B:26:CC:EC:88:28:03:59:16:07:FE:34:E7:BF:CD:9B:87:45:17:60:4E\r\na=rtcp-mux\r\na=label:data\r\na=sctp-port:5000\r\na=max-message-size:1073741823\r\n",
          "mediaLegId": "FBFED6B2400542DDBCEC5645E013E588",
          "escalationOccurring": false,
          "newOffer": false,
          "clientLocation": "GB",
          "applyChannelParameters": {
            "multiChannelParameter": {
              "mids": [
                "*"
              ],
              "mediaParameter": "{\"sendSideBWSeed\":{\"seedValueBitsPerSec\":600000}}"
            }
          }
        },
        "callKeepAliveInterval": 2700,
        "clientEndpointCapabilities": 8812266,
        "capabilities": null,
        "endpointCapabilities": 72951
      },
      "debugContent": {
        "ProcessingCallControllerInstance": "https://cc-euno-04-prod-aks.cc.skype.com/"
      }
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 333995019,
    "status": 200,
    "headers": {
      "X-Microsoft-Skype-Chain-ID": "9cab2ae0-4b7b-4732-8ff5-19c70188844d",
      "X-Microsoft-Skype-Message-ID": "ab6602f3-86ec-43ea-bd43-c086c4ba7ea6",
      "MS-CV": "GtUs0zDRq0KLxGsmTl3Prg.1.0",
      "trouter-request": "{\"id\":\"a67313c0-9540-4c49-b012-b0404d750c3c\",\"src\":\"10.128.150.150\",\"port\":3443}",
      "trouter-client": "{\"cd\":7}"
    },
    "body": "{\n  \"callAcceptanceAcknowledgement\": {\n    \"links\": {\n      \"mediaRenegotiation\": \"https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/1947cea2/call/mediaRenegotiation/\",\n      \"transfer\": \"https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/cbe234e2/call/transfer/\",\n      \"replacement\": \"https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/1b9773c1/call/replacement/\",\n      \"balanceUpdate\": \"https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/7f34dad2/call/balanceUpdate/\",\n      \"retargetCompletion\": \"https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/b684d2d9/call/retargetCompletion/\",\n      \"controlVideoStreaming\": \"https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/dfc90c2c/call/controlVideoStreaming/\",\n      \"updateMediaDescriptions\": \"https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/b827da79/call/updateMediaDescriptions\"\n    }\n  }\n}"
  }
  ```
  - `body`:
    ```json
    {
      "callAcceptanceAcknowledgement": {
        "links": {
          "mediaRenegotiation": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/1947cea2/call/mediaRenegotiation/",
          "transfer": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/cbe234e2/call/transfer/",
          "replacement": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/1b9773c1/call/replacement/",
          "balanceUpdate": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/7f34dad2/call/balanceUpdate/",
          "retargetCompletion": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/b684d2d9/call/retargetCompletion/",
          "controlVideoStreaming": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/dfc90c2c/call/controlVideoStreaming/",
          "updateMediaDescriptions": "https://pub-ent-sece-14-f.trouter.teams.microsoft.com:3443/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/b827da79/call/updateMediaDescriptions"
        }
      }
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
    "id": 2144132171,
    "method": "POST",
    "url": "/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/20726cd4/conversation/conversationUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-14-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "9cab2ae0-4b7b-4732-8ff5-19c70188844d",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12299",
      "X-Microsoft-Skype-Original-Message-ID": "915ae184-123f-441b-a847-a53d82494287",
      "X-Microsoft-Skype-Message-ID": "6c1850e4-ed37-4f2d-8e66-36bb30b005ab",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-6bf80aebcfe9bc83ff2aa0807788bc6f-8e73e5ab5afbc994-00",
      "MS-CV": "Z9NAMwevYUGHres269alJg.1",
      "trouter-request": "{\"id\":\"6e35554f-ab33-4ff5-9b59-b82a76e74548\",\"src\":\"10.128.101.209\",\"port\":3443}",
      "Trouter-TimeoutMs": "12799"
    },
    "body": "H4sIAAAAAAAAA8yYW2/TMBTH3/kUUx54ImlubdNJCI2Ny6QVDW1CiBfkJieZmWsHXwoV2nfnOGlLtk4Ijwf3pVUc2+f39zm2T86vZ0dHQSn4CqQimgp+KriWgjGQwfFRcKN1q45HI9LSqGa0udGtFD/XkQayVNGSllIoUeuoFEvbZ7RKR9CO7HwhGC7COAtxQBWSWxXZ1kjdrlvoutvHkXlXf74t5Lc4Jl/O6NcrVjezy4+v6MskDpO0CLM8LJLn8HKSFbPpbDqZTLN8Oh4Xs3HwwpIr+G6Al/DBLBcdcdI3m8U3KLVV0PcjpaYrmIuKMKopKHzzC9utdsIYPnHD2Iu+RQJh13QJJ3YM1eu3ANWuP75nlN92E9x1Lfb3rreqiYY/M1M1N0zTSyL1GltrwhRsTDRSmPYULZ9zxCFayPsIVL2WglQlUfrBSJwUQFPedHRor9p22GHs+PoRDMgK/Ply1Nn/Z49aX1WVXTNa0pZw7ZH8PoiLBAlLsYLDULHH4uiLzaZZ+3XEluLpgXTCD0SKeyAdAPd9EBcJS6N9Hj/WvAuu4Z6BewAXZC40rWnZXd8Xm8PfF/0ei1OogGy8xoq17xQsbYVX8BtetYJyPQdN8Jn4DJ5HgZ4u6WqT0hyGno7G7QZYUr8ZBNp3AR5m4u+R+VoSrlohdyJQwziNkjSLkjyP0jQfYfq7Ha1Ab7LDC7IWxqfyhyjuITi4ui+laEFu8na/ofgolYu41iwYVTe+N9YQwz0h8U0/oHAPrE1cXoG2f/5D6gGPiyAFRJY3g5j0qWYfxkVKA/qEsQORsg/jfOucdGUFrxcPIvzXsTsnbYsR6X2D7CO57RH88AOliNfUckDx9BPLnneHc151NP8kZlea0sDRiee2ZhVkWVHBFIpwkcQkzMm0DAks8jAvq3qaTuqySIq+eCehwXTIjqmgb7FFuwuKIT6oc+GdQChHsDMju/zpnM8pN/2KTeLtJwb5idtC/IDqwVGTxNsumG9x1VXkgq0bgNdClhiI6x9Dy/frbkpLXP7+JDftW0KZkXAGC9Oc4/BBgS9gXUp0htk5ZWr4Ah3QCkUt/RXIFS3hkU5C0oZywt79rYgYlAiDTaeMAtefMKfsl3Bg6k+mia6U2pY8reY0TsdhkoTx9DpNjrPJcTqO8iydFbMvwbO73wAAAP//AwB7lfv9MBYAAA=="
  }
  ```
  - `body`: (gzipped)
    ```json
    {
      "conversationController": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ?i=10-128-34-81&e=638979766734755895",
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
        "leave": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/leave?i=10-128-34-81&e=638979766734755895",
        "addParticipant": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/addParticipant?i=10-128-34-81&e=638979766734755895",
        "removeParticipant": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/removeParticipant?i=10-128-34-81&e=638979766734755895",
        "addModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/addModality?i=10-128-34-81&e=638979766734755895",
        "addParticipantAndModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/add?i=10-128-34-81&e=638979766734755895",
        "removeModality": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/removeModality?i=10-128-34-81&e=638979766734755895",
        "mute": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/mute?i=10-128-34-81&e=638979766734755895",
        "unmute": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/unmute?i=10-128-34-81&e=638979766734755895",
        "notificationLinks": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/notificationLinks?i=10-128-34-81&e=638979766734755895",
        "merge": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/merge?i=10-128-34-81&e=638979766734755895",
        "updateEndpointMetadata": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/updateEndpointMetadata?i=10-128-34-81&e=638979766734755895",
        "updateEndpointState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/updateEndpointState?i=10-128-34-81&e=638979766734755895",
        "admit": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/admit?i=10-128-34-81&e=638979766734755895",
        "conversationHttpTransport": "http://52.123.144.224/enc",
        "setMeetingLayout": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/setMeetingLayout?i=10-128-34-81&e=638979766734755895",
        "updateParticipantProperties": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/updateParticipantProperties?i=10-128-34-81&e=638979766734755895",
        "publishState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/publishState?i=10-128-34-81&e=638979766734755895",
        "removeState": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/removeState?i=10-128-34-81&e=638979766734755895",
        "updateMeetingSettings": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/updateMeetingSettings?i=10-128-34-81&e=638979766734755895",
        "searchParticipants": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/searchParticipants?i=10-128-34-81&e=638979766734755895",
        "getAllParticipants": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/getAllParticipants?i=10-128-34-81&e=638979766734755895",
        "admitAll": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/admitAll?i=10-128-34-81&e=638979766734755895",
        "updateParticipantMapping": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/updateParticipantMapping?i=10-128-34-81&e=638979766734755895",
        "sendMessage": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/sendMessage?i=10-128-34-81&e=638979766734755895",
        "updateMeetingStates": "https://api.flightproxy.teams.microsoft.com/api/v2/ep/conv-euno-03-prod-aks.conv.skype.com/conv/uGfXk8rj00aZDi_Slfg9PQ/updateMeetingStates?i=10-128-34-81&e=638979766734755895"
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
      "conversationStartTime": "2025-11-07T21:36:25.432989Z"
    }
    ```
- send: `3:::`
  ```json
  {
    "id": 2144132171,
    "status": 200,
    "headers": {
      "MS-CV": "Z9NAMwevYUGHres269alJg.1.0",
      "trouter-request": "{\"id\":\"6e35554f-ab33-4ff5-9b59-b82a76e74548\",\"src\":\"10.128.101.209\",\"port\":3443}",
      "trouter-client": "{\"cd\":3}"
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
    "id": 172403890,
    "method": "POST",
    "url": "/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/8524fba4/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-14-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "9cab2ae0-4b7b-4732-8ff5-19c70188844d",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12299",
      "X-Microsoft-Skype-Original-Message-ID": "f2910ed2-bcd0-42b3-954c-de23a04a26d0",
      "X-Microsoft-Skype-Message-ID": "0ecde7aa-ce6b-43ee-9fb5-5613f4beff9c",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-6bf80aebcfe9bc83ff2aa0807788bc6f-d6263b23df7c7b0f-00",
      "MS-CV": "N09m8WmDXU2PqZg+Ef5MYw.1",
      "trouter-request": "{\"id\":\"07c0cc52-59de-4f71-9dde-e1293c9b1ba8\",\"src\":\"10.128.52.29\",\"port\":3443}",
      "Trouter-TimeoutMs": "12799"
    },
    "body": "H4sIAAAAAAAAA+1YbW/iRhD+nl+BkHqfsnjXXr/lhKrLS9tEgdwlXK6h6of17hg2GNu1TRI45b931oHEEHKXVu1VrQoSgnnb8c4zM4/4vNNqtXNRVFrqXKRV2d5rfUYZSoO9rBhptedSwXwROsQHxyGcx4xEAmISxLbDuevHDviPXuh3A0WpsxRFbHclKytRAUraQlb6BtqPCgWV0EnZ8EehVsb0D52/++StdJknYt4X0/rEfUhb+zM5KeX4BauLbFbI2raYpZWewrv3x03TvMhyKKr5vhihUTpLkoaygLJ2P1bPdY17Hczz+gSdDiDF3834kKo802lVh2jT5Yts+Vi92tsP2ZZDItLRTIy25jfWSoEpVCySEhqKqs7xIR/HCRT4EJCIUUG48CUREHHCpYp924tlwIJmPll0DXLp+6rSLV3vHzGxuo8NVFCAMFQKgznSJdwNKKYU2wQiz1EiVEwyuuaBPlIkyYbMoBEKBGlvVsHlI1Zpw+R+txljlc6ByEWkE11pMJl5/prVZhnasRPiZXmYH5U24TZwEpl7o0zYPgtpEIR2ey2ETDSk1VNK7YsJouYiFxJKi3HmWrbLKPOY5zJmZWX3Vqcquy3ftrISvbr9QYvRDn3bUnCjJRjIdWU2zfE5i7etqEBTtIp1AXF29ygwnoy7HWoNygO8Lp2Olil0bWq7HY4hWYdbZzdR1w25J0WA1eS+LyMniJhiQezYIhQxqmKX+dzzeHvrBfaw15WohCnI9iu+WI6JjXqtqS/gtxmkEvqzaQRFc8qsqrs1iBkrpSm5WuF9TX3/YvnXGghTIR8vNsqGl3aq00n5PPECcMZImGJZjfO4qvJyz7KkJDBLM0I5wdmiiJiUHSk7pSl3Byu2x7mDRtYNs0zw90/Qslw/CjwIBXFcih3lK5eEnNrEDwIGMpIMaGjZvjWxLayF1Ujg+6LqrjBpIGkQaQDZxOObQnZhfjJXPyaT4+tMnx3mN3Kq8uFhxno/Ht317SO3N6fOcNBbnA4+0OH1UXU1/SEZasqH18eL/uEH1revFsOB1KcHJs5dbuIMP/Hq8rL3IPvpZGFk559cOvz55FZOk8Xwcn8eOWP3OKXf2a5z+EZ3GSXMDggLfMJC5w10PScIAxrYocspDxmlQfurLXuCHwP9sAcMmAljhPoDm+053p4TdLCPQuYFw/WCTjMlsM3nxruGS9v0xUuYhgo75jxL6qHwy3r90yyFZpa/Pn6/fzb1CgxRb0g11enTgpxuHPAQYun2uCOZdEM3QDAAr4e04xJBwczdCIeFH9LQi//OHf2q81/e0X3QSetclGOcSdnkL1nTa2tA6MsMJ+JBlpYPrbjRpzcimW0dGeuOl0uzNm2vD4/NCfRsRDWRurPF7X8a8SUa8Sp0vZZG+L7ruRAb8qACPB5zCDADIp3Y82w/CgXIb0gjXD/cQgKOthvjkLdt2/sy8QAXrzKMAHeCHxKukHkFECpCI49Lj9l+aHv/BPGQ4yKbwgbvYB1q3t+Ue6xXcZwl2agQ+VjLjdt2/kucgDnWxLF4SDc5wQouBi0GLAYrTah8gRPcXS0+uv3BeNK/YEn/cH98Ojgf9xYfq6vBflLzhE/Hdn9w5JwN3rn96dWf4wT6Vsv0/HaY9vRZWoXxh5oifGue4FPH/RfyhJ2la7tabo5DSLALatHzNbW78W/AQTZb+0ugyirRhJ5R2UsqkhcwBmQQakNPl/oki6L5C7qHuLgDEZPY/w1NYXIszZO9q3CdVDgattrVEWoTBfCVANvMMpzkcZLdrnT1k2/GPzan4nN+PccXLMuqAIFlGx3UE/fZA5wVI5HqxdLJ1G7n/ne0mTTsohEAAA=="
  }
  ```
  - `body`: (gzipped)
    ```json
    {
      "participants": {
        "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7": {
          "version": 1,
          "state": "active",
          "details": {
            "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
            "displayName": "Ben Bucksch",
            "displayNameSource": "runtimeAPI",
            "propertyBag": null,
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
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 67,
              "participantId": "f394a762-e0c2-42e4-beb4-01a271908892",
              "clientVersion": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {},
              "endpointState": {
                "endpointStateSequenceNumber": 1,
                "state": {
                  "isMuted": false
                }
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-euno-04-prod-aks.cc.skype.com:443/cc/v1/callParticipant/57b86e9a-3503-47d5-9402-7881ecbc1e09/27/k2/517/replacement?rt=f394a762e0c242e4beb401a271908892&rc=eyJydGlkIjoiODpvcmdpZDo1MGExN2E5My03ZTMzLTQ0ZjEtYmFlZi04ZjIzNDQ1N2YzZTciLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5In0%253D&i=10-128-187-193&e=638980829540491008"
              },
              "endpointJoinTime": "2025-11-07T21:36:38.5119168Z",
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
            "objectId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f"
          },
          "endpoints": {
            "77565ef0-b1d8-4cb4-8f72-c3f6627b9aec": {
              "call": {
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 579,
              "clientEndpointCapabilities": 8812226,
              "participantId": "e58189be-7879-4d33-8e9d-0b64c6127926",
              "clientVersion": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {
                "holographicCapabilities": 3
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-euno-04-prod-aks.cc.skype.com:443/cc/v1/callParticipant/57b86e9a-3503-47d5-9402-7881ecbc1e09/13/k3/490/replacement?rt=e58189be78794d338e9d0b64c6127926&rc=eyJydGlkIjoiODpvcmdpZDoxYzU5NThkNS1lNDBhLTRhMzUtYTBlMy03ZWI2NTE3OTA5NmYiLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5IiwicnRwZnMiOnt9fQ%253D%253D&i=10-128-187-193&e=638980829540491008"
              },
              "endpointJoinTime": "2025-11-07T21:36:38.5117035Z",
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
    "id": 172403890,
    "status": 200,
    "headers": {
      "MS-CV": "N09m8WmDXU2PqZg+Ef5MYw.1.0",
      "trouter-request": "{\"id\":\"07c0cc52-59de-4f71-9dde-e1293c9b1ba8\",\"src\":\"10.128.52.29\",\"port\":3443}",
      "trouter-client": "{\"cd\":4}"
    },
    "body": ""
  }
  ```
- receive: `3:::`
  ```json
  {
    "id": 1817985212,
    "method": "POST",
    "url": "/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/8524fba4/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-14-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "9cab2ae0-4b7b-4732-8ff5-19c70188844d",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12299",
      "X-Microsoft-Skype-Original-Message-ID": "163b8d5a-8494-4480-8d03-243df974ef0d",
      "X-Microsoft-Skype-Message-ID": "814148f6-7cd9-453c-a431-51dbfd81d0a3",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-792045dd53f48eb3d67f92805b26ea0d-9189c04c911a39fc-00",
      "MS-CV": "FPMHlaQ0HUqUN9snRDGWMA.1",
      "trouter-request": "{\"id\":\"48905655-e384-43b6-b88b-a1bdbbdee4af\",\"src\":\"10.128.18.26\",\"port\":3443}",
      "Trouter-TimeoutMs": "12799"
    },
    "body": "H4sIAAAAAAAAA5VVW1PjNhR+31+R8Ux5QrFky7cwmc4C2y0Ml91NynbT6YMsHQeBY7u2AiQ7/PcemQScEIY2D5nk3PRJ33fO+fmh13MqURstdSUK0ziD3k+0oTUelPVUq0FABYtE4pMIfJ9wnjGSCshInHk+50GU+RA9Z2HeHdSNLgs0eftrW2OEAbQ4Qhp9B86zQ4EROm86+WjUyob+r/P3X7KVbqpcLC7ErD3xEIre4VzeNvL6jahROa9lG1vPC6Nn8PHLSTe0qssKarM4FFMMKuZ53nHW0LTpJ+q1r/Ou40XVnqCLMRT4v1sfClWVujBtCYeuPmTH1/rj7D5kF4ZcFNO5mO7Ed62VAktUJvIGOg7TYnzC4/uxgghikjIqCBeRJAJSTrhUWeSFmYxZ3MVTpjcgV7n/ibpV6uOzJtbvsaUKCpAkSmExXwaEBzFFSJlHIA19JRLFJKMbGZgjRZ5v2awaoUaRns8NXD1rlXZCHve7NdZwjkQlUp1ro8EiC6ONqG0anMxP8LFCxEelR7gHnKT23SgTXsQSGseJ52yUkLmGwrxAcka3qJpRJSQ0LuMscL2AURayMGDMLZvhvS5Ued8c9MoGs4YX4x6jfXrQU3CnJVjJDWU5q/Ce9UEvrTEUozJdQ1Y+PBtsJuNBn7rj5gifSxfTFYShR72gz7Ek63P38i4dBgkPpYiRTR5FMvXjlCkWZ74nEpGhKwtYxMOQOzsf8Bx7XQkjLCG7n3i0GhNbfG24R/DPHAoJF/NZCjUGs/0tdncWsWOlsZSrtd433I9v0r/RQAiF/DHaog0f7UwXt81r4DXgjJEwQ1pt8rUxVTNwXSkJzIuSUE5wtigibpu+lP3G0t1Hxgac+xjk3jHXFv/yIi03iNI4hEQQP6DYUZEKSMKpR6I4ZiBTyYAmrhe5t56LXLgdAL/WZrjWpJWkVaQVZFePe7UcwuJ0oT7ntyc3pb48ru7kTFWT45Kdf/70cOF9Cs4X1J+Mz5dn4690cvPJ/Jj9lk805ZObk+XF8Vd24f1YTsZSnx3ZOg+VrTP5zs3V1fmT7ffTpbV9+x7QyZ+n93KWLydXh4vUvw5OCvqLF/jHe3rIKGFeTFgcEZb4ezAM/TiJaewlAac8YZTGzrste4pfY/20B6yYCWOERmOPDfxw4Md97KOEhfFkk9BZqQS2+cJmt3JxbF+8pWkw2DHfyrwdCn9t8l+UBXRR/v38+/HV1KuxRLsh1UwXLwtytnXAUwmb3qY6ZrVYjiHHzmpNzXaHtHu4O6GOyvnGqjelEV2ZNS/LG7cfXAN2lNry05U/L9N08YbvqS6uSNQfzpSOp7YYG3uzjwa3jcFxszOurdCGKIB3CuwKK3HQZ3l5v/a1N9+uf2JPxXu+j/GNyMbUIJC26VE7wl9d4LKeikIvV0mWuw+P/wJ+/x1+egkAAA=="
  }
  ```
  - `body`: (gzipped)
    ```json
    {
      "participants": {
        "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7": {
          "version": 2,
          "state": "active",
          "details": {
            "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
            "displayName": "Ben Bucksch",
            "displayNameSource": "runtimeAPI",
            "propertyBag": null,
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
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 67,
              "participantId": "f394a762-e0c2-42e4-beb4-01a271908892",
              "clientVersion": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {},
              "endpointState": {
                "endpointStateSequenceNumber": 1,
                "state": {
                  "isMuted": false
                }
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-euno-04-prod-aks.cc.skype.com:443/cc/v1/callParticipant/57b86e9a-3503-47d5-9402-7881ecbc1e09/27/k2/517/replacement?rt=f394a762e0c242e4beb401a271908892&rc=eyJydGlkIjoiODpvcmdpZDo1MGExN2E5My03ZTMzLTQ0ZjEtYmFlZi04ZjIzNDQ1N2YzZTciLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5In0%253D&i=10-128-187-193&e=638980829540491008"
              },
              "endpointJoinTime": "2025-11-07T21:36:38.5119168Z",
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
    "id": 1817985212,
    "status": 200,
    "headers": {
      "MS-CV": "FPMHlaQ0HUqUN9snRDGWMA.1.0",
      "trouter-request": "{\"id\":\"48905655-e384-43b6-b88b-a1bdbbdee4af\",\"src\":\"10.128.18.26\",\"port\":3443}",
      "trouter-client": "{\"cd\":5}"
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
    "id": 2144132292,
    "method": "POST",
    "url": "/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/8524fba4/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-14-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "9cab2ae0-4b7b-4732-8ff5-19c70188844d",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "8113d830-371a-4316-b045-466feddb905d",
      "X-Microsoft-Skype-Message-ID": "8b7bec49-0f7d-46a9-86d1-9ffce57b6709",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-98a67ca35186972c6e1b0866d9e17581-7c18faf506e7efad-00",
      "MS-CV": "+C+kJuzM8EWD0O6+vESpMg.1",
      "trouter-request": "{\"id\":\"4b1a30bf-cbe0-49bb-87c4-ff410f109573\",\"src\":\"10.128.101.209\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "H4sIAAAAAAAAA5VWWW/bRhB+968QCNRPWXGXy1OBUPgIWhu2nNqy06jow3I5kjaiuCy5siIH/u+dpWSbOoy0EkCAcx/fzPDHUafjlKIySqpSFKZ2ep0fSENq3NPVRGU9JoMkiLOAgE8F8QUPiKDASQRpGLAooUk4ftVCvUeoaqULJPEPL7TaCANIcYQ06hGcV0YGRqi8bukjUWVW9H/5//Cmnam6zMVqIOaNxwGovHMr6mlaaT17R/BOLyrZiFeLwqg5nHy+aIuWlS6hMqtTMdkKFVlCPWgl4UwXNRRmh2vLIfIF7JH3FB82Yg51tgSfP2ybq+GfBRQSBot5ChUqsBb/+eiAmlNB3aR3YctaLPK8ndhb64ersglAFUMo8L2dPxRZqVVhGhMO3fzIgcfLzzns5FAMuSgmCzE5GN9UZRlYLI1FXkOLYZoY1/FwHmcQQUxS1iAkkkRA6hNfZuPIC8cyZnE7Hp1+A7nR/U/oOtop6ms9doAbRUEYwJhiIFmM7jGGGCMgko/D0IvSRIDcxY8Ueb6PmhoqnKPrhYGH13Gi7U63YfEazpkoRapyZRTYyIIo2RKTuUKkfTosHMfM87xwS2G3cQ4EWMokBRLFUUL8jHMSQ5IRmoa+DJkXJV7oHPD5loRzN0Oc3ZVCQu0ynwWuFzDKQobVZq6u+0tVZHpZf+zoGrX6g2GH0S792MngEafFgrQv9bzEylQfOzjTSyxVX04rPYfXd6uItrvU/t1hfYY1VsVkE0Xfo17Q9ZHFur5785j2g8QPpYgj4H4UyZTH2D8Wj7knEjFG1hiR4Ieh7xys+jXusEwYsd/Fqc71pBLlVMmdavN3e7k1DeiD3N/tVBSTuVLFrN73VwEuNAnz9SJypsaUdc91pSSwKDShPsFFlhExq7tSdmvbiS4Ws+f7HIXcR+Za45/fuu4GURqHkAjCA8qJH+GgJD71sP8xA5lKBjRxGXdn3PUT6rYC+LUy/Re4WLRYsFistKFyXMk+rC5X2W/57OKbVjfn5aOcZ+XoXH//+nQfDIbT2eCO5YPz0+nV8HZ6/XRvvg5P8+sV5aMvF95g+InfDE+Cwfyrujqzdr6X1s7oi28eHq7XtN8vnyzt9ktAR39eLuU8fxo9nK5SPg0u1FLJ4nY5Kq7VTWGS8R+/eAE/bx7Hqs8oYV5MWBwRlvBj6Ic8TmIae0ngUz9hlMbOT2fyEh9Dtb5FFniEMUKjocd6POzxuIuwjygPRttNnutMIFhWVhsaJFgMv4c/MIjuW5030PprGxOFLqAd5d9vN2JvrVVoornS2VwVb0d6vuNgbcKqN6qO2VyOc8hxChrS3plqvgXaC+VML7Y+N4w2og09y/LWIeD5hSngF0S2w6cbfq7TdPUOb20XbyBiEue/xalsjLXN7MTgOTG4Gg7KNRYakQzgJwYOiWnc5ONcL194Tea79i+sV8zz5zG+I1mbCgS2bXLWbNy9BG6qiSjU00bJ9u7o+V+GO0n+/gkAAA=="
  }
  ```
  - `body`: (gzipped)
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
            "objectId": "1c5958d5-e40a-4a35-a0e3-7eb65179096f"
          },
          "endpoints": {
            "77565ef0-b1d8-4cb4-8f72-c3f6627b9aec": {
              "call": {
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 579,
              "clientEndpointCapabilities": 8812226,
              "participantId": "e58189be-7879-4d33-8e9d-0b64c6127926",
              "clientVersion": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
              "endpointMetadata": {
                "holographicCapabilities": 3
              },
              "languageId": "en-US",
              "callLinks": {
                "replacement": "https://cc-euno-04-prod-aks.cc.skype.com:443/cc/v1/callParticipant/57b86e9a-3503-47d5-9402-7881ecbc1e09/13/k3/490/replacement?rt=e58189be78794d338e9d0b64c6127926&rc=eyJydGlkIjoiODpvcmdpZDoxYzU5NThkNS1lNDBhLTRhMzUtYTBlMy03ZWI2NTE3OTA5NmYiLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5IiwicnRwZnMiOnt9fQ%253D%253D&i=10-128-187-193&e=638980829540491008"
              },
              "endpointJoinTime": "2025-11-07T21:36:38.5117035Z",
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
    "id": 2144132292,
    "status": 200,
    "headers": {
      "MS-CV": "+C+kJuzM8EWD0O6+vESpMg.1.0",
      "trouter-request": "{\"id\":\"4b1a30bf-cbe0-49bb-87c4-ff410f109573\",\"src\":\"10.128.101.209\",\"port\":3443}",
      "trouter-client": "{\"cd\":6}"
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
- receive: `3:::`
  ```json
  {
    "id": 1817985270,
    "method": "POST",
    "url": "/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/8524fba4/conversation/rosterUpdate/",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-14-t.trouter.teams.microsoft.com",
      "Transfer-Encoding": "chunked",
      "User-Agent": "ConversationService/1.11.9874.0",
      "X-Microsoft-Skype-Chain-ID": "9cab2ae0-4b7b-4732-8ff5-19c70188844d",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-CallingProxy": "EnterpriseProxy",
      "Trouter-Timeout": "12299",
      "X-Microsoft-Skype-Original-Message-ID": "da34ebde-9796-49ff-8abc-03f86a4bea85",
      "X-Microsoft-Skype-Message-ID": "ca1f4ce0-13d8-459e-96d0-014b673fad88",
      "X-Microsoft-Skype-Content-Encoding": "gzip",
      "traceparent": "00-d22287d89b5069a704f818d301ddd525-2ff403665675b074-00",
      "MS-CV": "+2PxVciD8EuQshLtqcrOpg.1",
      "trouter-request": "{\"id\":\"935636c0-e728-45f7-bd3c-6ca9958c649d\",\"src\":\"10.128.18.26\",\"port\":3443}",
      "Trouter-TimeoutMs": "12799"
    },
    "body": "H4sIAAAAAAAAA5VW21LjOBB9n69IuWp5QrFky7dQqa0BZmdDcZkZssxOtvZBltqJwLG9tgKEKf59WyYBJ4RiNw8p6MvRkfp0d35+6PWcStRGS12JwjTOoPcTbWiNB2U91WoQUMEikfgkAt8nnGeMpAIyEmeez3kQZT5Ez1mYdwt1o8sCTXx/bWuMMIAWR0ijb8F5digwQudNJx+NWtnQ/3X+/ku20k2Vi+W5mLcnHkLRO1zIm0bO3oi6LBe1bGPrRWH0HD5+GXVDq7qsoDbLQzHFoGKR5x1nDU2bPlKvfZ13HS+r9gRdjKHA/7v4UKiq1IVpIRy6+pAdX+uPs/uQXRxyUUwXYrqT30wrBbZQmcgb6DhMy/GJj+/HCiKIScqoIFxEkghIOeFSZZEXZjJmcZdPmV6DXOX+p9KtUh+fNbF+jy1VUIAkUQrBfBkQHsQUKWUegTT0lUgUk4xuZGCOFHm+ZbNqhBpFerYwcPWsVdoJedzvYqzpHIlKpDrXRoNlFkYbUdtlcDI/wccKkR+VHuEecJLad6NMeBFLaBwnnrMBIXMNhXmh5FzeoGouKyGhcRlngesFjLKQhQFjbtkM73ShyrvmoFc2mDU8H/cY7dODnoJbLcFKbijLeYX3rA96aY2hGJXpGrLy/tlgMxkP+tQdN0f4XLqYrigMPeoFfY6QrM/di9t0GCQ8lCLGavIokqkfp0yxOPM9kYgMXVnAIh6G3Nn5gGfY60oY8bogszIvp7WoZlpuvbL/blkuV6NlC3LDfQn/LKCQcL6Yp1BjMNvfUsROEDuKGisTte6RDffjm9w2mg6pkD8ut0qND32qi5vmNfEacC5JmKMUbPLMmKoZuK6UBBZFSSgnOI8UETdNX8p+YyXSxyoPOPcxyL1lrgX/8iJHN4jSOIREED+g2IWRCkjCqUeiOGYgU8mAJq4XuTeei/VzOwR+rc1wrWMrY6tiK+KuhvdqOYTlyVJ9zm9G16W+OK5u5VxVk+OSnX3+dH/ufQrOltSfjM8eTsdf6eT6k/kx/y2faMon16OH8+Ov7Nz78TAZS316ZHHuK4sz+c7N1dXZk+33kwdr+/Y9oJM/T+7kPH+YXB0uU38WjAr6ixf4x3t6yChhXkxYHBGW+HswDP04iWnsJQGnPGGUxs67ejrBr7F+2h22AQhjhEZjjw38cODHfey9hIXxZLOg81IJFO3SZrdycWwvvdUHYLDLvpV5K/G/NutflAV0Wf79/Pfjq0lZI0S7VdVcFy9Ldb51wBOETW9THbNaRseQYze2pma7Q9rd3Z1qR+Vi4+eBKY3oysy6vCcKuDFhBthRastPV/68TNPlG74nXFyrqD+cQx1PbTk29mYfDW4ogyNqZ1yL0IYogHcAdoWVuByyvLxb+9qbb+OP7Kl4z/c5vhHZmBoElm161I79Vxe4qKei0A+rJFu7D4//AsuU+ZiuCQAA"
  }
  ```
  - `body`: (gzipped)
    ```json
    {
      "participants": {
        "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7": {
          "version": 4,
          "state": "active",
          "details": {
            "id": "8:orgid:50a17a93-7e33-44f1-baef-8f234457f3e7",
            "displayName": "Ben Bucksch",
            "displayNameSource": "runtimeAPI",
            "propertyBag": null,
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
                "serverMuteVersion": 0
              },
              "endpointCapabilities": 67,
              "participantId": "f394a762-e0c2-42e4-beb4-01a271908892",
              "clientVersion": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=firefox; browserVer=145.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
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
                "replacement": "https://cc-euno-04-prod-aks.cc.skype.com:443/cc/v1/callParticipant/57b86e9a-3503-47d5-9402-7881ecbc1e09/27/k2/517/replacement?rt=f394a762e0c242e4beb401a271908892&rc=eyJydGlkIjoiODpvcmdpZDo1MGExN2E5My03ZTMzLTQ0ZjEtYmFlZi04ZjIzNDQ1N2YzZTciLCJydGxpIjoiZW4tVVMiLCJydHJzIjoiRW50ZXJwcmlzZVByb3h5In0%253D&i=10-128-187-193&e=638980829540491008"
              },
              "endpointJoinTime": "2025-11-07T21:36:38.5119168Z",
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
    "id": 1817985270,
    "status": 200,
    "headers": {
      "MS-CV": "+2PxVciD8EuQshLtqcrOpg.1.0",
      "trouter-request": "{\"id\":\"935636c0-e728-45f7-bd3c-6ca9958c649d\",\"src\":\"10.128.18.26\",\"port\":3443}",
      "trouter-client": "{\"cd\":3}"
    },
    "body": ""
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
    "id": 334001276,
    "method": "POST",
    "url": "/v4/f/0w8JzYr_a0-rbpOroSYJ9Q/callAgent/dc47f18e-dd2d-4014-a557-828b2ec51adf/4a5bb20f/call/end/",
    "headers": {
      "Content-Length": "400",
      "Content-Type": "application/json; charset=utf-8",
      "Host": "pub-ent-sece-14-t.trouter.teams.microsoft.com",
      "User-Agent": "CallController/2.47.4546.0",
      "X-Microsoft-Skype-Chain-ID": "9cab2ae0-4b7b-4732-8ff5-19c70188844d",
      "X-Microsoft-Skype-Tenant-Id": "338de7e8-b10a-4a7c-aeb4-4cdf726fc818",
      "X-Microsoft-Skype-Client": "SkypeSpaces/1415/25101616511/os=windows; osVer=NT 10.0; deviceType=computer; browser=chrome; browserVer=141.0.0.0/TsCallingVersion=2025.40.01.4/Ovb=5946ca87e3477cb38b1d18f32a9af46cf5174664",
      "Trouter-Timeout": "12298",
      "X-Microsoft-Skype-Original-Message-ID": "9d2cc65d-33be-4294-bf68-81f1d6c8582f",
      "X-Microsoft-Skype-Message-ID": "1ded9f0c-938e-4eb6-bc37-1bee81e5107a",
      "traceparent": "00-f97d61f159505614bd83884dc265e49a-f0e54ebde7f0c540-00",
      "MS-CV": "BlTD5jYPn02oz/pi5JlmYg.1",
      "trouter-request": "{\"id\":\"a08f2f2b-616e-4023-81bb-febb0ded4bf8\",\"src\":\"10.128.150.150\",\"port\":3443}",
      "Trouter-TimeoutMs": "12798"
    },
    "body": "{\"callEnd\":{\"reason\":\"noError\",\"sender\":{\"id\":\"8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f\",\"displayName\":\"Neil Rashbrook\",\"endpointId\":\"77565ef0-b1d8-4cb4-8f72-c3f6627b9aec\",\"languageId\":null,\"participantId\":\"e58189be-7879-4d33-8e9d-0b64c6127926\",\"hidden\":false,\"propertyBag\":null},\"code\":0,\"subCode\":0,\"phrase\":\"CallEndReasonLocalUserInitiated\",\"resultCategories\":[\"Success\"]},\"debugContent\":null}"
  }
  ```
  - `body`:
    ```json
    {
      "callEnd": {
        "reason": "noError",
        "sender": {
          "id": "8:orgid:1c5958d5-e40a-4a35-a0e3-7eb65179096f",
          "displayName": "Neil Rashbrook",
          "endpointId": "77565ef0-b1d8-4cb4-8f72-c3f6627b9aec",
          "languageId": null,
          "participantId": "e58189be-7879-4d33-8e9d-0b64c6127926",
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
    "id": 334001276,
    "status": 404,
    "headers": {
      "MS-CV": "BlTD5jYPn02oz/pi5JlmYg.1.0",
      "trouter-request": "{\"id\":\"a08f2f2b-616e-4023-81bb-febb0ded4bf8\",\"src\":\"10.128.150.150\",\"port\":3443}",
      "trouter-client": "{\"cd\":1}"
    },
    "body": ""
  }
  ```
