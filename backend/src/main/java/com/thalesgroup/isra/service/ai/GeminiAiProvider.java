package com.thalesgroup.isra.service.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalesgroup.isra.dto.ai.ThreatSuggestion;
import com.thalesgroup.isra.dto.ai.VulnerabilitySuggestion;
import com.thalesgroup.isra.exception.GeminiApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAiProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${isra.ai.api-key:}")
    private String apiKey;

    @Value("${isra.ai.model:gemini-2.5-flash}")
    private String model;

    @Value("${isra.ai.base-url:https://generativelanguage.googleapis.com}")
    private String baseUrl;

    public GeminiAiProvider(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    @SuppressWarnings("unchecked")
    public List<ThreatSuggestion> suggestThreats(
            String businessName, String businessType, String businessDesc,
            String supportingName, String supportingType) {

        if (!isConfigured()) {
            throw new GeminiApiException("Gemini API key is not configured.");
        }

        String url = String.format("%s/v1beta/models/%s:generateContent", baseUrl, model);

        String prompt = String.format(
                "Suggest a list of exactly 3 relevant and realistic threat scenarios for the following asset pair:\n" +
                "- Target Business Asset: %s (Type: %s, Description: %s)\n" +
                "- Exploited Supporting Asset: %s (Type: %s)\n\n" +
                "For each threat scenario, identify the threatAgent, threatVerb, motivation, and rationale.",
                businessName != null ? businessName : "N/A",
                businessType != null ? businessType : "N/A",
                businessDesc != null ? businessDesc : "N/A",
                supportingName != null ? supportingName : "N/A",
                supportingType != null ? supportingType : "N/A"
        );

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(part);
        Map<String, Object> contentObj = new HashMap<>();
        contentObj.put("parts", parts);
        List<Map<String, Object>> contents = new ArrayList<>();
        contents.add(contentObj);
        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");

        Map<String, Object> responseSchema = new HashMap<>();
        responseSchema.put("type", "ARRAY");

        Map<String, Object> itemsSchema = new HashMap<>();
        itemsSchema.put("type", "OBJECT");

        Map<String, Object> properties = new HashMap<>();

        Map<String, Object> threatAgentProp = new HashMap<>();
        threatAgentProp.put("type", "STRING");
        threatAgentProp.put("description", "Threat agent class");
        properties.put("threatAgent", threatAgentProp);

        Map<String, Object> threatVerbProp = new HashMap<>();
        threatVerbProp.put("type", "STRING");
        threatVerbProp.put("description", "Threat verb / action");
        properties.put("threatVerb", threatVerbProp);

        Map<String, Object> motivationProp = new HashMap<>();
        motivationProp.put("type", "STRING");
        motivationProp.put("description", "Threat motivation");
        properties.put("motivation", motivationProp);

        Map<String, Object> rationaleProp = new HashMap<>();
        rationaleProp.put("type", "STRING");
        rationaleProp.put("description", "One-line logical rationale");
        properties.put("rationale", rationaleProp);

        itemsSchema.put("properties", properties);
        itemsSchema.put("required", List.of("threatAgent", "threatVerb", "motivation", "rationale"));

        responseSchema.put("items", itemsSchema);
        generationConfig.put("responseSchema", responseSchema);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new GeminiApiException("Failed request to Gemini API. Status code: " + response.getStatusCode());
            }

            Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                throw new GeminiApiException("No content candidates returned from Gemini API.");
            }

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> responseContent = (Map<String, Object>) firstCandidate.get("content");
            if (responseContent == null) {
                throw new GeminiApiException("Candidate content is null.");
            }

            List<Map<String, Object>> responseParts = (List<Map<String, Object>>) responseContent.get("parts");
            if (responseParts == null || responseParts.isEmpty()) {
                throw new GeminiApiException("Candidate content has no parts.");
            }

            String jsonText = (String) responseParts.get(0).get("text");
            if (jsonText == null || jsonText.trim().isEmpty()) {
                throw new GeminiApiException("Candidate content text is empty.");
            }

            return objectMapper.readValue(jsonText, new TypeReference<List<ThreatSuggestion>>() {});

        } catch (Exception e) {
            if (e instanceof GeminiApiException) {
                throw (GeminiApiException) e;
            }
            throw new GeminiApiException("Error communicating with or parsing Gemini API response", e);
        }
    }

    @SuppressWarnings("unchecked")
    public List<VulnerabilitySuggestion> suggestVulnerabilities(String assetName, String assetType) {
        if (!isConfigured()) {
            throw new GeminiApiException("Gemini API key is not configured.");
        }

        String url = String.format("%s/v1beta/models/%s:generateContent", baseUrl, model);

        String prompt = String.format(
                "You are a cybersecurity expert. Suggest exactly 3 realistic and distinct security vulnerabilities " +
                "for the following supporting asset in a security risk assessment:\n" +
                "- Asset Name: %s\n" +
                "- Asset Type: %s\n\n" +
                "For each vulnerability, provide: vulnerabilityName (concise title), vulnerabilityFamily " +
                "(one of: Access Control, Authentication, Authorization, Cryptography, Data Validation, " +
                "Error Handling, Configuration, Network, Physical, Software, Supply Chain, Other), " +
                "vulnerabilityDescription (2-3 sentence technical description), " +
                "estimatedCveScore (a realistic CVSS v3 base score between 0.0 and 10.0 as a number), " +
                "and rationale (one sentence explaining why this asset is susceptible).",
                assetName != null ? assetName : "N/A",
                assetType != null ? assetType : "N/A"
        );

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(part);
        Map<String, Object> contentObj = new HashMap<>();
        contentObj.put("parts", parts);
        List<Map<String, Object>> contents = new ArrayList<>();
        contents.add(contentObj);
        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");

        Map<String, Object> responseSchema = new HashMap<>();
        responseSchema.put("type", "ARRAY");

        Map<String, Object> itemsSchema = new HashMap<>();
        itemsSchema.put("type", "OBJECT");

        Map<String, Object> properties = new HashMap<>();

        Map<String, Object> nameProp = new HashMap<>();
        nameProp.put("type", "STRING");
        nameProp.put("description", "Concise vulnerability title");
        properties.put("vulnerabilityName", nameProp);

        Map<String, Object> familyProp = new HashMap<>();
        familyProp.put("type", "STRING");
        familyProp.put("description", "Vulnerability family category");
        properties.put("vulnerabilityFamily", familyProp);

        Map<String, Object> descProp = new HashMap<>();
        descProp.put("type", "STRING");
        descProp.put("description", "Technical description of the vulnerability");
        properties.put("vulnerabilityDescription", descProp);

        Map<String, Object> scoreProp = new HashMap<>();
        scoreProp.put("type", "NUMBER");
        scoreProp.put("description", "Estimated CVSS v3 base score (0.0 to 10.0)");
        properties.put("estimatedCveScore", scoreProp);

        Map<String, Object> rationaleProp2 = new HashMap<>();
        rationaleProp2.put("type", "STRING");
        rationaleProp2.put("description", "One-line rationale for this asset's susceptibility");
        properties.put("rationale", rationaleProp2);

        itemsSchema.put("properties", properties);
        itemsSchema.put("required", List.of("vulnerabilityName", "vulnerabilityFamily",
                "vulnerabilityDescription", "estimatedCveScore", "rationale"));

        responseSchema.put("items", itemsSchema);
        generationConfig.put("responseSchema", responseSchema);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers2 = new HttpHeaders();
        headers2.setContentType(MediaType.APPLICATION_JSON);
        headers2.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity2 = new HttpEntity<>(requestBody, headers2);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity2, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new GeminiApiException("Failed request to Gemini API. Status code: " + response.getStatusCode());
            }

            Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                throw new GeminiApiException("No content candidates returned from Gemini API.");
            }

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> responseContent = (Map<String, Object>) firstCandidate.get("content");
            if (responseContent == null) {
                throw new GeminiApiException("Candidate content is null.");
            }

            List<Map<String, Object>> responseParts = (List<Map<String, Object>>) responseContent.get("parts");
            if (responseParts == null || responseParts.isEmpty()) {
                throw new GeminiApiException("Candidate content has no parts.");
            }

            String jsonText = (String) responseParts.get(0).get("text");
            if (jsonText == null || jsonText.trim().isEmpty()) {
                throw new GeminiApiException("Candidate content text is empty.");
            }

            return objectMapper.readValue(jsonText, new TypeReference<List<VulnerabilitySuggestion>>() {});

        } catch (Exception e) {
            if (e instanceof GeminiApiException) {
                throw (GeminiApiException) e;
            }
            throw new GeminiApiException("Error communicating with or parsing Gemini API vulnerability response", e);
        }
    }
}
