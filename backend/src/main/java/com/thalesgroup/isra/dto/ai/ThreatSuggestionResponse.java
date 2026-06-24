package com.thalesgroup.isra.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreatSuggestionResponse {
    private List<ThreatSuggestion> suggestions;
}
