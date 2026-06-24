package com.thalesgroup.isra.dto.ai;

import lombok.Data;

@Data
public class ThreatSuggestionRequest {
    private Long businessAssetId;
    private Long supportingAssetId;
}
