package com.thalesgroup.isra.service.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalesgroup.isra.dto.ai.ThreatSuggestion;
import com.thalesgroup.isra.dto.ai.VulnerabilitySuggestion;
import com.thalesgroup.isra.exception.GeminiApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeminiAiProviderTest {

    @Mock
    private RestTemplate restTemplate;

    private ObjectMapper objectMapper;
    private GeminiAiProvider geminiAiProvider;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        geminiAiProvider = new GeminiAiProvider(restTemplate, objectMapper);
        ReflectionTestUtils.setField(geminiAiProvider, "apiKey", "mock-api-key");
        ReflectionTestUtils.setField(geminiAiProvider, "model", "gemini-2.5-flash");
        ReflectionTestUtils.setField(geminiAiProvider, "baseUrl", "https://generativelanguage.googleapis.com");
    }

    @Test
    void isConfigured_variousKeys_returnsCorrectly() {
        ReflectionTestUtils.setField(geminiAiProvider, "apiKey", null);
        assertFalse(geminiAiProvider.isConfigured());

        ReflectionTestUtils.setField(geminiAiProvider, "apiKey", "  ");
        assertFalse(geminiAiProvider.isConfigured());

        ReflectionTestUtils.setField(geminiAiProvider, "apiKey", "valid-key-123");
        assertTrue(geminiAiProvider.isConfigured());
    }

    @Test
    void suggestThreats_whenNotConfigured_throwsException() {
        ReflectionTestUtils.setField(geminiAiProvider, "apiKey", "");

        GeminiApiException exception = assertThrows(
                GeminiApiException.class,
                () -> geminiAiProvider.suggestThreats("DB", "Data Store", "desc", "VM", "Server")
        );

        assertTrue(exception.getMessage().contains("Gemini API key is not configured"));
    }

    @Test
    void suggestThreats_whenSuccessful_returnsSuggestions() throws IOException {
        // Construct standard Gemini API candidate response map and write to JSON
        Map<String, Object> candidate = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", "[\n" +
                "  {\n" +
                "    \"threatAgent\": \"External Hacker\",\n" +
                "    \"threatVerb\": \"steals\",\n" +
                "    \"motivation\": \"Financial gain\",\n" +
                "    \"rationale\": \"Database is exposed\"\n" +
                "  }\n" +
                "]");
        content.put("parts", List.of(part));
        candidate.put("content", content);
        Map<String, Object> responseMap = Map.of("candidates", List.of(candidate));
        String mockResponseBody = objectMapper.writeValueAsString(responseMap);

        ResponseEntity<String> responseEntity = new ResponseEntity<>(mockResponseBody, HttpStatus.OK);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        List<ThreatSuggestion> suggestions = geminiAiProvider.suggestThreats("DB", "Data Store", "desc", "VM", "Server");

        assertNotNull(suggestions);
        assertEquals(1, suggestions.size());
        assertEquals("External Hacker", suggestions.get(0).getThreatAgent());
        assertEquals("steals", suggestions.get(0).getThreatVerb());
        assertEquals("Financial gain", suggestions.get(0).getMotivation());
        assertEquals("Database is exposed", suggestions.get(0).getRationale());
    }

    @Test
    void suggestThreats_whenApiReturnsErrorStatus_throwsException() {
        ResponseEntity<String> responseEntity = new ResponseEntity<>("Error body", HttpStatus.BAD_REQUEST);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        assertThrows(
                GeminiApiException.class,
                () -> geminiAiProvider.suggestThreats("DB", "Data Store", "desc", "VM", "Server")
        );
    }

    @Test
    void suggestThreats_whenCandidatesEmpty_throwsException() {
        String mockResponseBody = "{\"candidates\": []}";
        ResponseEntity<String> responseEntity = new ResponseEntity<>(mockResponseBody, HttpStatus.OK);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        assertThrows(
                GeminiApiException.class,
                () -> geminiAiProvider.suggestThreats("DB", "Data Store", "desc", "VM", "Server")
        );
    }

    @Test
    void suggestVulnerabilities_whenNotConfigured_throwsException() {
        ReflectionTestUtils.setField(geminiAiProvider, "apiKey", "");

        assertThrows(
                GeminiApiException.class,
                () -> geminiAiProvider.suggestVulnerabilities("VM", "Server")
        );
    }

    @Test
    void suggestVulnerabilities_whenSuccessful_returnsSuggestions() throws IOException {
        // Construct standard Gemini API candidate response map and write to JSON
        Map<String, Object> candidate = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", "[\n" +
                "  {\n" +
                "    \"vulnerabilityName\": \"SQL Injection\",\n" +
                "    \"vulnerabilityFamily\": \"Data Validation\",\n" +
                "    \"vulnerabilityDescription\": \"Improper user input sanitization\",\n" +
                "    \"estimatedCveScore\": 8.8,\n" +
                "    \"rationale\": \"Input is parsed directly into queries\"\n" +
                "  }\n" +
                "]");
        content.put("parts", List.of(part));
        candidate.put("content", content);
        Map<String, Object> responseMap = Map.of("candidates", List.of(candidate));
        String mockResponseBody = objectMapper.writeValueAsString(responseMap);

        ResponseEntity<String> responseEntity = new ResponseEntity<>(mockResponseBody, HttpStatus.OK);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        List<VulnerabilitySuggestion> suggestions = geminiAiProvider.suggestVulnerabilities("VM", "Server");

        assertNotNull(suggestions);
        assertEquals(1, suggestions.size());
        assertEquals("SQL Injection", suggestions.get(0).getVulnerabilityName());
        assertEquals("Data Validation", suggestions.get(0).getVulnerabilityFamily());
        assertEquals(8.8, suggestions.get(0).getEstimatedCveScore());
        assertEquals("Input is parsed directly into queries", suggestions.get(0).getRationale());
    }

    @Test
    void suggestVulnerabilities_whenApiThrowsException_propagatesAsGeminiException() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RuntimeException("Network down"));

        GeminiApiException exception = assertThrows(
                GeminiApiException.class,
                () -> geminiAiProvider.suggestVulnerabilities("VM", "Server")
        );

        assertTrue(exception.getMessage().contains("Error communicating with"));
    }
}
