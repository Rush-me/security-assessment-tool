package com.thalesgroup.isra.service.ai;

import com.thalesgroup.isra.dto.ai.ThreatSuggestion;
import com.thalesgroup.isra.exception.AiUnavailableException;
import com.thalesgroup.isra.model.BusinessAsset;
import com.thalesgroup.isra.model.SupportingAsset;
import com.thalesgroup.isra.repository.BusinessAssetRepository;
import com.thalesgroup.isra.repository.SupportingAssetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RiskAiAssistServiceTest {

    @Mock
    private GeminiAiProvider geminiAiProvider;

    @Mock
    private AiConnectivityChecker connectivityChecker;

    @Mock
    private BusinessAssetRepository businessAssetRepository;

    @Mock
    private SupportingAssetRepository supportingAssetRepository;

    private RiskAiAssistService riskAiAssistService;

    @BeforeEach
    void setUp() {
        riskAiAssistService = new RiskAiAssistService(
                geminiAiProvider,
                connectivityChecker,
                businessAssetRepository,
                supportingAssetRepository
        );
    }

    @Test
    void suggestThreats_whenNotConfigured_throwsAiUnavailableException() {
        when(geminiAiProvider.isConfigured()).thenReturn(false);

        AiUnavailableException exception = assertThrows(
                AiUnavailableException.class,
                () -> riskAiAssistService.suggestThreats(1L, 2L)
        );

        assertTrue(exception.getMessage().contains("not configured"));
        verifyNoInteractions(connectivityChecker, businessAssetRepository, supportingAssetRepository);
    }

    @Test
    void suggestThreats_whenOffline_throwsAiUnavailableException() {
        when(geminiAiProvider.isConfigured()).thenReturn(true);
        when(connectivityChecker.isOnline(true)).thenReturn(false);

        AiUnavailableException exception = assertThrows(
                AiUnavailableException.class,
                () -> riskAiAssistService.suggestThreats(1L, 2L)
        );

        assertTrue(exception.getMessage().contains("offline"));
        verifyNoInteractions(businessAssetRepository, supportingAssetRepository);
    }

    @Test
    void suggestThreats_whenOnlineAndConfigured_returnsSuggestions() {
        when(geminiAiProvider.isConfigured()).thenReturn(true);
        when(connectivityChecker.isOnline(true)).thenReturn(true);

        BusinessAsset businessAsset = BusinessAsset.builder()
                .id(1L)
                .assetName("Database")
                .assetType("Data Store")
                .assetDescription("Main user database")
                .build();

        SupportingAsset supportingAsset = SupportingAsset.builder()
                .id(2L)
                .assetName("Linux VM")
                .assetType("Server VM")
                .build();

        when(businessAssetRepository.findById(1L)).thenReturn(Optional.of(businessAsset));
        when(supportingAssetRepository.findById(2L)).thenReturn(Optional.of(supportingAsset));

        List<ThreatSuggestion> mockSuggestions = List.of(
                new ThreatSuggestion("Cybercriminal", "steals", "Financial gain", "Main database is exposed")
        );
        when(geminiAiProvider.suggestThreats("Database", "Data Store", "Main user database", "Linux VM", "Server VM"))
                .thenReturn(mockSuggestions);

        List<ThreatSuggestion> result = riskAiAssistService.suggestThreats(1L, 2L);

        assertEquals(1, result.size());
        assertEquals("Cybercriminal", result.get(0).getThreatAgent());
        assertEquals("steals", result.get(0).getThreatVerb());
        assertEquals("Financial gain", result.get(0).getMotivation());
    }
}
