package com.thalesgroup.isra.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalesgroup.isra.dto.ai.*;
import com.thalesgroup.isra.service.ai.AiConnectivityChecker;
import com.thalesgroup.isra.service.ai.RiskAiAssistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AiControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RiskAiAssistService aiAssistService;

    @Mock
    private AiConnectivityChecker connectivityChecker;

    @InjectMocks
    private AiController aiController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(aiController).build();
    }

    @Test
    void testStatus_notConfigured() throws Exception {
        when(aiAssistService.isConfigured()).thenReturn(false);

        mockMvc.perform(get("/api/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("not-configured"))
                .andExpect(jsonPath("$.message").value("Gemini API key is not configured (ISRA_AI_API_KEY)."));
    }

    @Test
    void testStatus_offline() throws Exception {
        when(aiAssistService.isConfigured()).thenReturn(true);
        when(connectivityChecker.isOnline(anyBoolean())).thenReturn(false);

        mockMvc.perform(get("/api/ai/status?refresh=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("offline"))
                .andExpect(jsonPath("$.message").value("Cannot establish connection to Gemini API endpoint."));
    }

    @Test
    void testStatus_available() throws Exception {
        when(aiAssistService.isConfigured()).thenReturn(true);
        when(connectivityChecker.isOnline(anyBoolean())).thenReturn(true);

        mockMvc.perform(get("/api/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("available"))
                .andExpect(jsonPath("$.message").value("AI Threat Suggestion feature is active and online."));
    }

    @Test
    void testSuggestThreats() throws Exception {
        ThreatSuggestionRequest request = new ThreatSuggestionRequest();
        request.setBusinessAssetId(1L);
        request.setSupportingAssetId(2L);

        List<ThreatSuggestion> expectedSuggestions = List.of(
                ThreatSuggestion.builder()
                        .threatAgent("Cyber Criminal")
                        .threatVerb("Disrupts")
                        .motivation("Financial gain")
                        .rationale("Target lacks high availability")
                        .build()
        );

        when(aiAssistService.suggestThreats(1L, 2L)).thenReturn(expectedSuggestions);

        mockMvc.perform(post("/api/ai/suggest-threats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestions[0].threatAgent").value("Cyber Criminal"))
                .andExpect(jsonPath("$.suggestions[0].threatVerb").value("Disrupts"))
                .andExpect(jsonPath("$.suggestions[0].motivation").value("Financial gain"))
                .andExpect(jsonPath("$.suggestions[0].rationale").value("Target lacks high availability"));
    }

    @Test
    void testSuggestVulnerabilities() throws Exception {
        VulnerabilitySuggestionRequest request = new VulnerabilitySuggestionRequest();
        request.setSupportingAssetId(3L);

        List<VulnerabilitySuggestion> expectedSuggestions = List.of(
                VulnerabilitySuggestion.builder()
                        .vulnerabilityName("SQL Injection")
                        .vulnerabilityFamily("Input Validation")
                        .vulnerabilityDescription("Unsanitized database queries.")
                        .estimatedCveScore(8.8)
                        .rationale("Supporting asset is a public web server")
                        .build()
        );

        when(aiAssistService.suggestVulnerabilities(3L)).thenReturn(expectedSuggestions);

        mockMvc.perform(post("/api/ai/suggest-vulnerabilities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestions[0].vulnerabilityName").value("SQL Injection"))
                .andExpect(jsonPath("$.suggestions[0].vulnerabilityFamily").value("Input Validation"))
                .andExpect(jsonPath("$.suggestions[0].vulnerabilityDescription").value("Unsanitized database queries."))
                .andExpect(jsonPath("$.suggestions[0].estimatedCveScore").value(8.8))
                .andExpect(jsonPath("$.suggestions[0].rationale").value("Supporting asset is a public web server"));
    }
}
