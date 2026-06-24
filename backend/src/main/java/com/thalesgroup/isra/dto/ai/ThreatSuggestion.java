package com.thalesgroup.isra.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreatSuggestion {
    private String threatAgent;
    private String threatVerb;
    private String motivation;
    private String rationale;
}
