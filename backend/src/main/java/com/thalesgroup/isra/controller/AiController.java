package com.thalesgroup.isra.controller;

import com.thalesgroup.isra.dto.ai.AiStatusResponse;
import com.thalesgroup.isra.dto.ai.ThreatSuggestion;
import com.thalesgroup.isra.dto.ai.ThreatSuggestionRequest;
import com.thalesgroup.isra.dto.ai.ThreatSuggestionResponse;
import com.thalesgroup.isra.dto.ai.VulnerabilitySuggestion;
import com.thalesgroup.isra.dto.ai.VulnerabilitySuggestionRequest;
import com.thalesgroup.isra.dto.ai.VulnerabilitySuggestionResponse;
import com.thalesgroup.isra.service.ai.AiConnectivityChecker;
import com.thalesgroup.isra.service.ai.RiskAiAssistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final RiskAiAssistService aiAssistService;
    private final AiConnectivityChecker connectivityChecker;

    public AiController(RiskAiAssistService aiAssistService, AiConnectivityChecker connectivityChecker) {
        this.aiAssistService = aiAssistService;
        this.connectivityChecker = connectivityChecker;
    }

    @GetMapping("/status")
    public ResponseEntity<AiStatusResponse> status(@RequestParam(defaultValue = "false") boolean refresh) {
        String status;
        String message;

        if (!aiAssistService.isConfigured()) {
            status = "not-configured";
            message = "Gemini API key is not configured (ISRA_AI_API_KEY).";
        } else if (!connectivityChecker.isOnline(refresh)) {
            status = "offline";
            message = "Cannot establish connection to Gemini API endpoint.";
        } else {
            status = "available";
            message = "AI Threat Suggestion feature is active and online.";
        }

        return ResponseEntity.ok(AiStatusResponse.builder()
                .status(status)
                .message(message)
                .build());
    }

    @PostMapping("/suggest-threats")
    public ResponseEntity<ThreatSuggestionResponse> suggestThreats(@RequestBody ThreatSuggestionRequest request) {
        List<ThreatSuggestion> suggestions = aiAssistService.suggestThreats(
                request.getBusinessAssetId(),
                request.getSupportingAssetId()
        );
        return ResponseEntity.ok(ThreatSuggestionResponse.builder()
                .suggestions(suggestions)
                .build());
    }

    @PostMapping("/suggest-vulnerabilities")
    public ResponseEntity<VulnerabilitySuggestionResponse> suggestVulnerabilities(
            @RequestBody VulnerabilitySuggestionRequest request) {
        List<VulnerabilitySuggestion> suggestions = aiAssistService.suggestVulnerabilities(
                request.getSupportingAssetId()
        );
        return ResponseEntity.ok(VulnerabilitySuggestionResponse.builder()
                .suggestions(suggestions)
                .build());
    }
}
