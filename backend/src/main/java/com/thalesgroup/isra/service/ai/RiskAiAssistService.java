package com.thalesgroup.isra.service.ai;

import com.thalesgroup.isra.dto.ai.ThreatSuggestion;
import com.thalesgroup.isra.dto.ai.VulnerabilitySuggestion;
import com.thalesgroup.isra.exception.AiUnavailableException;
import com.thalesgroup.isra.model.BusinessAsset;
import com.thalesgroup.isra.model.SupportingAsset;
import com.thalesgroup.isra.repository.BusinessAssetRepository;
import com.thalesgroup.isra.repository.SupportingAssetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RiskAiAssistService {

    private final GeminiAiProvider geminiAiProvider;
    private final AiConnectivityChecker connectivityChecker;
    private final BusinessAssetRepository businessAssetRepository;
    private final SupportingAssetRepository supportingAssetRepository;

    public RiskAiAssistService(GeminiAiProvider geminiAiProvider,
                               AiConnectivityChecker connectivityChecker,
                               BusinessAssetRepository businessAssetRepository,
                               SupportingAssetRepository supportingAssetRepository) {
        this.geminiAiProvider = geminiAiProvider;
        this.connectivityChecker = connectivityChecker;
        this.businessAssetRepository = businessAssetRepository;
        this.supportingAssetRepository = supportingAssetRepository;
    }

    public boolean isConfigured() {
        return geminiAiProvider.isConfigured();
    }

    public boolean isOnline() {
        return connectivityChecker.isOnline();
    }

    public List<ThreatSuggestion> suggestThreats(Long businessAssetId, Long supportingAssetId) {
        if (!isConfigured()) {
            throw new AiUnavailableException("AI Suggestion Feature is not configured on the server. Please set the ISRA_AI_API_KEY environment variable.");
        }
        if (!connectivityChecker.isOnline(true)) {
            throw new AiUnavailableException("AI Suggestion Feature is offline. Cannot reach Google Gemini API endpoint.");
        }

        BusinessAsset businessAsset = null;
        if (businessAssetId != null) {
            businessAsset = businessAssetRepository.findById(businessAssetId)
                    .orElseThrow(() -> new IllegalArgumentException("Business asset not found: " + businessAssetId));
        }

        SupportingAsset supportingAsset = null;
        if (supportingAssetId != null) {
            supportingAsset = supportingAssetRepository.findById(supportingAssetId)
                    .orElseThrow(() -> new IllegalArgumentException("Supporting asset not found: " + supportingAssetId));
        }

        String businessName = businessAsset != null ? businessAsset.getAssetName() : null;
        String businessType = businessAsset != null ? businessAsset.getAssetType() : null;
        String businessDesc = businessAsset != null ? businessAsset.getAssetDescription() : null;

        String supportingName = supportingAsset != null ? supportingAsset.getAssetName() : null;
        String supportingType = supportingAsset != null ? supportingAsset.getAssetType() : null;

        return geminiAiProvider.suggestThreats(businessName, businessType, businessDesc, supportingName, supportingType);
    }

    public List<VulnerabilitySuggestion> suggestVulnerabilities(Long supportingAssetId) {
        if (!isConfigured()) {
            throw new AiUnavailableException("AI Suggestion Feature is not configured on the server. Please set the ISRA_AI_API_KEY environment variable.");
        }
        if (!connectivityChecker.isOnline(true)) {
            throw new AiUnavailableException("AI Suggestion Feature is offline. Cannot reach Google Gemini API endpoint.");
        }

        SupportingAsset supportingAsset = null;
        if (supportingAssetId != null) {
            supportingAsset = supportingAssetRepository.findById(supportingAssetId)
                    .orElseThrow(() -> new IllegalArgumentException("Supporting asset not found: " + supportingAssetId));
        }

        String assetName = supportingAsset != null ? supportingAsset.getAssetName() : null;
        String assetType = supportingAsset != null ? supportingAsset.getAssetType() : null;

        return geminiAiProvider.suggestVulnerabilities(assetName, assetType);
    }
}
