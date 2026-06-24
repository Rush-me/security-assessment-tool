package com.thalesgroup.isra.service;

import com.thalesgroup.isra.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RiskCalculationServiceTest {

    private RiskCalculationService riskCalculationService;

    @BeforeEach
    void setUp() {
        riskCalculationService = new RiskCalculationService();
    }

    @Test
    void calculateThreatFactor_allNull_setsNullAndEmpty() {
        Risk risk = new Risk();
        risk.setSkillLevel(null);
        risk.setReward(null);
        risk.setAccessResources(null);
        risk.setSize(null);
        risk.setIntrusionDetection(null);

        riskCalculationService.calculateRisk(risk);

        assertNull(risk.getThreatFactorScore());
        assertEquals("", risk.getThreatFactorLevel());
    }

    @Test
    void calculateThreatFactor_variousScores() {
        // Test Low: average < 3.0 (e.g., 2.0)
        Risk risk1 = new Risk();
        risk1.setSkillLevel(2);
        risk1.setReward(2);
        riskCalculationService.calculateRisk(risk1);
        assertEquals(2.0, risk1.getThreatFactorScore());
        assertEquals("Low", risk1.getThreatFactorLevel());

        // Test Medium: 3.0 <= average <= 5.0 (e.g., 4.0)
        Risk risk2 = new Risk();
        risk2.setSkillLevel(4);
        risk2.setReward(4);
        riskCalculationService.calculateRisk(risk2);
        assertEquals(4.0, risk2.getThreatFactorScore());
        assertEquals("Medium", risk2.getThreatFactorLevel());

        // Test High: 5.0 < average <= 7.0 (e.g., 6.0)
        Risk risk3 = new Risk();
        risk3.setSkillLevel(6);
        risk3.setReward(6);
        riskCalculationService.calculateRisk(risk3);
        assertEquals(6.0, risk3.getThreatFactorScore());
        assertEquals("High", risk3.getThreatFactorLevel());

        // Test Very High: average > 7.0 (e.g., 8.0)
        Risk risk4 = new Risk();
        risk4.setSkillLevel(8);
        risk4.setReward(8);
        riskCalculationService.calculateRisk(risk4);
        assertEquals(8.0, risk4.getThreatFactorScore());
        assertEquals("Very High", risk4.getThreatFactorLevel());
    }

    @Test
    void calculateOccurrenceLevel_variousScores() {
        // Null
        Risk riskNull = new Risk();
        riskNull.setOccurrence(null);
        riskCalculationService.calculateRisk(riskNull);
        assertEquals("", riskNull.getOccurrenceLevel());

        // Low: occ < 3
        Risk riskLow = new Risk();
        riskLow.setOccurrence(2);
        riskCalculationService.calculateRisk(riskLow);
        assertEquals("Low", riskLow.getOccurrenceLevel());

        // Medium: 3 <= occ <= 5
        Risk riskMed = new Risk();
        riskMed.setOccurrence(4);
        riskCalculationService.calculateRisk(riskMed);
        assertEquals("Medium", riskMed.getOccurrenceLevel());

        // High: 5 < occ <= 7
        Risk riskHigh = new Risk();
        riskHigh.setOccurrence(6);
        riskCalculationService.calculateRisk(riskHigh);
        assertEquals("High", riskHigh.getOccurrenceLevel());

        // Very High: occ > 7
        Risk riskVH = new Risk();
        riskVH.setOccurrence(8);
        riskCalculationService.calculateRisk(riskVH);
        assertEquals("Very High", riskVH.getOccurrenceLevel());
    }

    @Test
    void calculateLikelihood_manualLikelihood_doesNotOverwrite() {
        Risk risk = new Risk();
        risk.setIsOwaspLikelihood(false);
        risk.setRiskLikelihood(3); // manually set

        riskCalculationService.calculateRisk(risk);

        assertEquals(3, risk.getRiskLikelihood());
    }

    @Test
    void calculateLikelihood_owaspEmptyLevels_returnsNull() {
        Risk risk = new Risk();
        risk.setIsOwaspLikelihood(true);
        risk.setSkillLevel(null);
        risk.setOccurrence(null);

        riskCalculationService.calculateRisk(risk);

        assertNull(risk.getRiskLikelihood());
    }

    @Test
    void calculateLikelihood_owaspCombinations() {
        // Low/Low -> Likelihood 1
        Risk r1 = new Risk();
        r1.setIsOwaspLikelihood(true);
        r1.setSkillLevel(2);
        r1.setOccurrence(2);
        riskCalculationService.calculateRisk(r1);
        assertEquals(1, r1.getRiskLikelihood());

        // Medium/Very High -> Likelihood 3
        Risk r2 = new Risk();
        r2.setIsOwaspLikelihood(true);
        r2.setSkillLevel(4);
        r2.setOccurrence(8);
        riskCalculationService.calculateRisk(r2);
        assertEquals(3, r2.getRiskLikelihood());

        // High/Very High -> Likelihood 4
        Risk r3 = new Risk();
        r3.setIsOwaspLikelihood(true);
        r3.setSkillLevel(6);
        r3.setOccurrence(8);
        riskCalculationService.calculateRisk(r3);
        assertEquals(4, r3.getRiskLikelihood());

        // Default case (e.g. Medium/Medium) -> Likelihood 2
        Risk r4 = new Risk();
        r4.setIsOwaspLikelihood(true);
        r4.setSkillLevel(4);
        r4.setOccurrence(4);
        riskCalculationService.calculateRisk(r4);
        assertEquals(2, r4.getRiskLikelihood());
    }

    @Test
    void calculateImpact_businessAssetNull_returnsNull() {
        Risk risk = new Risk();
        risk.setBusinessAssetRef(null);
        riskCalculationService.calculateRisk(risk);
        assertNull(risk.getRiskImpact());
    }

    @Test
    void calculateImpact_withThreatVerbsAndMaxVal() {
        BusinessAsset asset = BusinessAsset.builder()
                .confidentiality(8)
                .integrity(6)
                .availability(4)
                .authenticity(3)
                .authorization(2)
                .nonRepudiation(1)
                .build();

        // Threat Verb: "steal" -> sets confidentiality flag to 1. Expected impact: confidentiality value (8)
        Risk risk1 = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("steal")
                .build();
        riskCalculationService.calculateRisk(risk1);
        assertEquals(8, risk1.getRiskImpact());
        assertEquals(1, risk1.getConfidentialityFlag());
        assertEquals(0, risk1.getIntegrityFlag());

        // Threat Verb: "tamper with" -> sets integrity flag. Expected: 6
        Risk risk2 = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("tamper with")
                .build();
        riskCalculationService.calculateRisk(risk2);
        assertEquals(6, risk2.getRiskImpact());

        // Threat Verb: "deny access to" -> sets availability flag. Expected: 4
        Risk risk3 = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("denies access to")
                .build();
        riskCalculationService.calculateRisk(risk3);
        assertEquals(4, risk3.getRiskImpact());

        // Threat Verb: "spoof" -> sets authenticity flag. Expected: 3
        Risk risk4 = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("spoof")
                .build();
        riskCalculationService.calculateRisk(risk4);
        assertEquals(3, risk4.getRiskImpact());

        // Threat Verb: "repudiate" -> sets nonRepudiation flag. Expected: 1
        Risk risk5 = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("repudiate")
                .build();
        riskCalculationService.calculateRisk(risk5);
        assertEquals(1, risk5.getRiskImpact());

        // Threat Verb: "gain an unauthorized access to" -> sets authorization flag. Expected: 2
        Risk risk6 = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("gains an unauthorized access to")
                .build();
        riskCalculationService.calculateRisk(risk6);
        assertEquals(2, risk6.getRiskImpact());
    }

    @Test
    void calculateAttackPaths_noPaths_returnsNullAndEmpty() {
        Risk risk = new Risk();
        risk.setRiskAttackPaths(null);
        riskCalculationService.calculateRisk(risk);
        assertNull(risk.getAllAttackPathsScore());
        assertEquals("", risk.getAllAttackPathsName());
    }

    @Test
    void calculateAttackPaths_emptyRefs_setsEmptyAndNull() {
        Risk risk = new Risk();
        RiskAttackPath path = RiskAttackPath.builder()
                .vulnerabilityRefs(new ArrayList<>())
                .build();
        risk.setRiskAttackPaths(List.of(path));

        riskCalculationService.calculateRisk(risk);

        assertEquals("", path.getAttackPathName());
        assertNull(path.getAttackPathScore());
        assertNull(risk.getAllAttackPathsScore());
        assertEquals("", risk.getAllAttackPathsName());
    }

    @Test
    void calculateAttackPaths_multiplePaths_setsCorrectScoresAndNames() {
        Risk risk = new Risk();
        
        RiskVulnerabilityRef ref1 = RiskVulnerabilityRef.builder().name("Vuln A").score(4.0).build();
        RiskVulnerabilityRef ref2 = RiskVulnerabilityRef.builder().name("Vuln B").score(6.0).build();
        RiskAttackPath path1 = RiskAttackPath.builder()
                .vulnerabilityRefs(new ArrayList<>(Arrays.asList(ref1, ref2)))
                .build();

        RiskVulnerabilityRef ref3 = RiskVulnerabilityRef.builder().name("Vuln C").score(5.0).build();
        RiskAttackPath path2 = RiskAttackPath.builder()
                .vulnerabilityRefs(new ArrayList<>(List.of(ref3)))
                .build();

        risk.setRiskAttackPaths(new ArrayList<>(Arrays.asList(path1, path2)));

        riskCalculationService.calculateRisk(risk);

        // Path 1 Score is Min of (4.0, 6.0) = 4.0
        assertEquals(4.0, path1.getAttackPathScore());
        assertEquals("Vuln A AND Vuln B", path1.getAttackPathName());

        // Path 2 Score is Min of (5.0) = 5.0
        assertEquals(5.0, path2.getAttackPathScore());
        assertEquals("Vuln C", path2.getAttackPathName());

        // All attack paths score is Max of path scores (4.0, 5.0) = 5.0
        assertEquals(5.0, risk.getAllAttackPathsScore());
        assertEquals("(Vuln A AND Vuln B) OR (Vuln C)", risk.getAllAttackPathsName());
    }

    @Test
    void calculateInherentRisk_withoutAttackPaths_computesFormula() {
        // Formula: (impact * 5.0 * likelihood * 5.0) / 20.0
        // (4 * 5.0 * 3 * 5.0) / 20.0 = 15.0
        BusinessAsset asset = BusinessAsset.builder().confidentiality(4).build();
        Risk risk = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("steal")
                .isOwaspLikelihood(false)
                .riskLikelihood(3)
                .allAttackPathsScore(null)
                .build();

        riskCalculationService.calculateRisk(risk);

        assertEquals(15.0, risk.getInherentRiskScore());
    }

    @Test
    void calculateInherentRisk_withAttackPaths_computesFormula() {
        // Formula: (impact * 5.0 * (likelihood * 5.0 + allAttackPathsScore * 2.0)) / 40.0
        // (4 * 5.0 * (3 * 5.0 + 5.0 * 2.0)) / 40.0 = (20.0 * 25.0) / 40.0 = 12.5 -> round -> 13.0
        BusinessAsset asset = BusinessAsset.builder().confidentiality(4).build();
        
        RiskVulnerabilityRef ref = RiskVulnerabilityRef.builder().name("V").score(5.0).build();
        RiskAttackPath path = RiskAttackPath.builder()
                .vulnerabilityRefs(new ArrayList<>(List.of(ref)))
                .build();

        Risk risk = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("steal")
                .isOwaspLikelihood(false)
                .riskLikelihood(3)
                .riskAttackPaths(new ArrayList<>(List.of(path)))
                .build();

        riskCalculationService.calculateRisk(risk);

        assertEquals(13.0, risk.getInherentRiskScore());
    }

    @Test
    void calculateMitigations_variousDecisions() {
        Risk risk = new Risk();
        RiskMitigation m1 = RiskMitigation.builder().benefits(0.3).decision("Accepted").build(); // 1.0 - 0.3 = 0.7
        RiskMitigation m2 = RiskMitigation.builder().benefits(0.5).decision("Done").build();     // 1.0 - 0.5 = 0.5
        RiskMitigation m3 = RiskMitigation.builder().benefits(0.2).decision("Ignored").build();  // Not processed

        risk.setRiskMitigations(Arrays.asList(m1, m2, m3));

        riskCalculationService.calculateRisk(risk);

        // mitigationsBenefits = Min of (0.7, 0.5) = 0.5
        assertEquals(0.5, risk.getMitigationsBenefits());
        // mitigationsDoneBenefits = Min of (0.5) = 0.5
        assertEquals(0.5, risk.getMitigationsDoneBenefits());
    }

    @Test
    void calculateResidualRisk_byDecision() {
        BusinessAsset asset = BusinessAsset.builder().confidentiality(4).build();

        // "Avoid" or "Discarded" -> score = 0.0
        Risk r1 = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("steal")
                .isOwaspLikelihood(false)
                .riskLikelihood(3)
                .riskManagementDecision("Avoid")
                .build();
        riskCalculationService.calculateRisk(r1);
        assertEquals(0.0, r1.getResidualRiskScore());
        assertEquals("Low", r1.getResidualRiskLevel());

        // "Accept" or empty -> score = inherent (15.0)
        Risk r2 = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("steal")
                .isOwaspLikelihood(false)
                .riskLikelihood(3)
                .riskManagementDecision("Accept")
                .build();
        riskCalculationService.calculateRisk(r2);
        assertEquals(15.0, r2.getResidualRiskScore());
        assertEquals("High", r2.getResidualRiskLevel());

        // "Mitigate" or "Transfer" with doneBenefits -> inherent * doneBenefits
        Risk r3 = Risk.builder()
                .businessAssetRef(asset)
                .threatVerb("steal")
                .isOwaspLikelihood(false)
                .riskLikelihood(3)
                .riskManagementDecision("Mitigate")
                .build();
        
        RiskMitigation m = RiskMitigation.builder().benefits(0.5).decision("Done").build();
        r3.setRiskMitigations(new ArrayList<>(List.of(m)));

        riskCalculationService.calculateRisk(r3);
        // 15.0 * 0.5 = 7.5 -> round -> 8.0 -> Medium
        assertEquals(8.0, r3.getResidualRiskScore());
        assertEquals("Medium", r3.getResidualRiskLevel());
    }

    @Test
    void constructRiskName_whenAutomatic_buildsCorrectly() {
        BusinessAsset ba = BusinessAsset.builder().assetName("DB").build();
        SupportingAsset sa = SupportingAsset.builder().assetName("VM").build();

        Risk risk = Risk.builder()
                .isAutomaticRiskName(true)
                .threatAgent("Hacker")
                .threatVerb("steal")
                .businessAssetRef(ba)
                .supportingAssetRef(sa)
                .motivation("financial gain")
                .allAttackPathsName("exploiting the SQLi")
                .build();

        riskCalculationService.constructRiskName(risk);

        String expected = "As a Hacker, I can steal the DB compromising the VM in order to financial gain, exploiting the exploiting the SQLi";
        assertEquals(expected, risk.getRiskName());
    }

    @Test
    void constructRiskName_whenManual_doesNotOverwrite() {
        Risk risk = Risk.builder()
                .isAutomaticRiskName(false)
                .riskName("My custom risk name")
                .build();

        riskCalculationService.constructRiskName(risk);

        assertEquals("My custom risk name", risk.getRiskName());
    }
}
