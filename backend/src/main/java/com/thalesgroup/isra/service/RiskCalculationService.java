package com.thalesgroup.isra.service;

import com.thalesgroup.isra.model.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class RiskCalculationService {

    public void calculateRisk(Risk risk) {
        // 1. Threat factor level and score
        calculateThreatFactor(risk);

        // 2. Occurrence Level
        calculateOccurrenceLevel(risk);

        // 3. Risk Likelihood
        calculateLikelihood(risk);

        // 4. Risk Impact
        calculateImpact(risk);

        // 5. Attack Paths
        calculateAttackPaths(risk);

        // 6. Inherent Risk
        calculateInherentRisk(risk);

        // 7. Mitigations
        calculateMitigations(risk);

        // 8. Mitigated Risk
        calculateMitigatedRisk(risk);

        // 9. Residual Risk
        calculateResidualRisk(risk);
    }

    private void calculateThreatFactor(Risk risk) {
        double sum = 0.0;
        int count = 0;

        if (risk.getSkillLevel() != null) { sum += risk.getSkillLevel(); count++; }
        if (risk.getReward() != null) { sum += risk.getReward(); count++; }
        if (risk.getAccessResources() != null) { sum += risk.getAccessResources(); count++; }
        if (risk.getSize() != null) { sum += risk.getSize(); count++; }
        if (risk.getIntrusionDetection() != null) { sum += risk.getIntrusionDetection(); count++; }

        if (count == 0) {
            risk.setThreatFactorScore(null);
            risk.setThreatFactorLevel("");
        } else {
            double score = sum / count;
            risk.setThreatFactorScore(score);
            if (score < 3.0) {
                risk.setThreatFactorLevel("Low");
            } else if (score <= 5.0) {
                risk.setThreatFactorLevel("Medium");
            } else if (score <= 7.0) {
                risk.setThreatFactorLevel("High");
            } else {
                risk.setThreatFactorLevel("Very High");
            }
        }
    }

    private void calculateOccurrenceLevel(Risk risk) {
        Integer occ = risk.getOccurrence();
        if (occ == null) {
            risk.setOccurrenceLevel("");
        } else {
            if (occ < 3) {
                risk.setOccurrenceLevel("Low");
            } else if (occ <= 5) {
                risk.setOccurrenceLevel("Medium");
            } else if (occ <= 7) {
                risk.setOccurrenceLevel("High");
            } else {
                risk.setOccurrenceLevel("Very High");
            }
        }
    }

    private void calculateLikelihood(Risk risk) {
        if (Boolean.FALSE.equals(risk.getIsOwaspLikelihood())) {
            // Manual likelihood
            return;
        }

        String tfLevel = risk.getThreatFactorLevel();
        String occLevel = risk.getOccurrenceLevel();

        if (tfLevel == null || tfLevel.isEmpty() || occLevel == null || occLevel.isEmpty()) {
            risk.setRiskLikelihood(null);
            return;
        }

        if (("Low".equals(tfLevel) && "Low".equals(occLevel)) ||
            ("Medium".equals(tfLevel) && "Low".equals(occLevel)) ||
            ("Low".equals(tfLevel) && "Medium".equals(occLevel))) {
            risk.setRiskLikelihood(1);
        } else if (("Medium".equals(tfLevel) && "Very High".equals(occLevel)) ||
                   ("High".equals(tfLevel) && "High".equals(occLevel)) ||
                   ("Very High".equals(tfLevel) && "Medium".equals(occLevel))) {
            risk.setRiskLikelihood(3);
        } else if (("High".equals(tfLevel) && "Very High".equals(occLevel)) ||
                   ("Very High".equals(tfLevel) && "Very High".equals(occLevel)) ||
                   ("Very High".equals(tfLevel) && "High".equals(occLevel))) {
            risk.setRiskLikelihood(4);
        } else {
            risk.setRiskLikelihood(2);
        }
    }

    private void calculateImpact(Risk risk) {
        BusinessAsset businessAsset = risk.getBusinessAssetRef();
        if (businessAsset == null) {
            risk.setRiskImpact(null);
            return;
        }

        // Map Threat Verb to CIA Flags if threatVerb is updated
        updateRiskImpactThreatVerb(risk);

        int maxVal = 0;
        if (Integer.valueOf(1).equals(risk.getConfidentialityFlag()) && businessAsset.getConfidentiality() != null) {
            maxVal = Math.max(maxVal, businessAsset.getConfidentiality());
        }
        if (Integer.valueOf(1).equals(risk.getIntegrityFlag()) && businessAsset.getIntegrity() != null) {
            maxVal = Math.max(maxVal, businessAsset.getIntegrity());
        }
        if (Integer.valueOf(1).equals(risk.getAvailabilityFlag()) && businessAsset.getAvailability() != null) {
            maxVal = Math.max(maxVal, businessAsset.getAvailability());
        }
        if (Integer.valueOf(1).equals(risk.getAuthenticityFlag()) && businessAsset.getAuthenticity() != null) {
            maxVal = Math.max(maxVal, businessAsset.getAuthenticity());
        }
        if (Integer.valueOf(1).equals(risk.getAuthorizationFlag()) && businessAsset.getAuthorization() != null) {
            maxVal = Math.max(maxVal, businessAsset.getAuthorization());
        }
        if (Integer.valueOf(1).equals(risk.getNonRepudiationFlag()) && businessAsset.getNonRepudiation() != null) {
            maxVal = Math.max(maxVal, businessAsset.getNonRepudiation());
        }

        risk.setRiskImpact(maxVal);
    }

    private void updateRiskImpactThreatVerb(Risk risk) {
        String verb = risk.getThreatVerb();
        if (verb == null) return;

        // Reset flags first
        risk.setConfidentialityFlag(0);
        risk.setIntegrityFlag(0);
        risk.setAvailabilityFlag(0);
        risk.setAuthenticityFlag(0);
        risk.setAuthorizationFlag(0);
        risk.setNonRepudiationFlag(0);

        if ("steal".equals(verb) || "disclose".equals(verb) || "lose".equals(verb)) {
            risk.setConfidentialityFlag(1);
        } else if ("tamper with".equals(verb)) {
            risk.setIntegrityFlag(1);
        } else if ("deny access to".equals(verb) || "flood".equals(verb)) {
            risk.setAvailabilityFlag(1);
        } else if ("spoof".equals(verb)) {
            risk.setAuthenticityFlag(1);
        } else if ("repudiate".equals(verb)) {
            risk.setNonRepudiationFlag(1);
        } else if ("gain an unauthorized access to".equals(verb)) {
            risk.setAuthorizationFlag(1);
        }
    }

    private void calculateAttackPaths(Risk risk) {
        List<RiskAttackPath> paths = risk.getRiskAttackPaths();
        if (paths == null || paths.isEmpty()) {
            risk.setAllAttackPathsScore(null);
            risk.setAllAttackPathsName("");
            return;
        }

        List<Double> pathScores = new ArrayList<>();
        StringBuilder allPathsName = new StringBuilder();

        for (int i = 0; i < paths.size(); i++) {
            RiskAttackPath path = paths.get(i);
            
            // Build path name from vulnerabilities
            List<RiskVulnerabilityRef> refs = path.getVulnerabilityRefs();
            if (refs == null || refs.isEmpty()) {
                path.setAttackPathName("");
                path.setAttackPathScore(null);
            } else {
                List<Double> vulScores = new ArrayList<>();
                StringBuilder pathName = new StringBuilder();
                for (int j = 0; j < refs.size(); j++) {
                    RiskVulnerabilityRef ref = refs.get(j);
                    if (j > 0) pathName.append(" AND ");
                    pathName.append(ref.getName() != null ? ref.getName() : "");
                    if (ref.getScore() != null) {
                        vulScores.add(ref.getScore());
                    }
                }
                path.setAttackPathName(pathName.toString());
                if (vulScores.isEmpty()) {
                    path.setAttackPathScore(null);
                } else {
                    path.setAttackPathScore(Collections.min(vulScores)); // Math.min
                }
            }

            if (path.getAttackPathScore() != null) {
                pathScores.add(path.getAttackPathScore());
            }

            if (path.getAttackPathName() != null && !path.getAttackPathName().isEmpty()) {
                if (allPathsName.length() > 0) allPathsName.append(" OR ");
                // Wrap in parentheses placeholder — resolved after loop
                allPathsName.append("(").append(path.getAttackPathName()).append(")");
            }
        }

        // Legacy JS: single path → strip outer parens; multiple paths → keep (p1) OR (p2)
        String finalName = allPathsName.toString();
        long nonEmptyPaths = paths.stream()
                .filter(p -> p.getAttackPathName() != null && !p.getAttackPathName().isEmpty())
                .count();
        if (nonEmptyPaths == 1 && finalName.startsWith("(") && finalName.endsWith(")")) {
            finalName = finalName.substring(1, finalName.length() - 1);
        }
        risk.setAllAttackPathsName(finalName);

        if (pathScores.isEmpty()) {
            risk.setAllAttackPathsScore(null);
        } else {
            risk.setAllAttackPathsScore(Collections.max(pathScores)); // Math.max
        }
    }

    private void calculateInherentRisk(Risk risk) {
        Integer impact = risk.getRiskImpact();
        Integer likelihood = risk.getRiskLikelihood();
        Double allAttackPathsScore = risk.getAllAttackPathsScore();

        if (impact == null || likelihood == null) {
            risk.setInherentRiskScore(null);
            return;
        }

        double score;
        if (allAttackPathsScore == null) {
            score = (impact * 5.0 * likelihood * 5.0) / 20.0;
        } else {
            score = (impact * 5.0 * (likelihood * 5.0 + allAttackPathsScore * 2.0)) / 40.0;
        }
        risk.setInherentRiskScore((double) Math.round(score));
    }

    private void calculateMitigations(Risk risk) {
        List<RiskMitigation> mitigations = risk.getRiskMitigations();
        if (mitigations == null || mitigations.isEmpty()) {
            risk.setMitigationsBenefits(1.0);
            risk.setMitigationsDoneBenefits(1.0);
            return;
        }

        List<Double> selectedBenefits = new ArrayList<>();
        List<Double> selectedDoneBenefits = new ArrayList<>();

        for (RiskMitigation mit : mitigations) {
            Double benefits = mit.getBenefits();
            String decision = mit.getDecision();

            if (benefits == null) continue;

            if ("Accepted".equals(decision) || "Done".equals(decision)) {
                selectedBenefits.add(1.0 - benefits);
                if ("Done".equals(decision)) {
                    selectedDoneBenefits.add(1.0 - benefits);
                }
            }
        }

        if (!selectedBenefits.isEmpty()) {
            risk.setMitigationsBenefits(Collections.min(selectedBenefits));
        } else {
            risk.setMitigationsBenefits(1.0);
        }

        if (!selectedDoneBenefits.isEmpty()) {
            risk.setMitigationsDoneBenefits(Collections.min(selectedDoneBenefits));
        } else {
            risk.setMitigationsDoneBenefits(1.0);
        }
    }

    private void calculateMitigatedRisk(Risk risk) {
        Double inherent = risk.getInherentRiskScore();
        Double benefits = risk.getMitigationsBenefits();

        if (inherent == null || benefits == null) {
            risk.setMitigatedRiskScore(null);
        } else {
            risk.setMitigatedRiskScore((double) Math.round(inherent * benefits));
        }
    }

    private void calculateResidualRisk(Risk risk) {
        Double inherent = risk.getInherentRiskScore();
        Double doneBenefits = risk.getMitigationsDoneBenefits();
        String decision = risk.getRiskManagementDecision();

        if (inherent == null) {
            risk.setResidualRiskScore(null);
            risk.setResidualRiskLevel("");
            return;
        }

        double score;
        if ("Avoid".equals(decision) || "Discarded".equals(decision)) {
            score = 0.0;
        } else if ("Accept".equals(decision) || decision == null || decision.isEmpty()) {
            score = inherent;
        } else if ("Mitigate".equals(decision) || "Transfer".equals(decision)) {
            if (doneBenefits == null) doneBenefits = 1.0;
            score = (double) Math.round(inherent * doneBenefits);
        } else {
            score = inherent;
        }

        risk.setResidualRiskScore(score);

        // Calculate residual risk level
        if (score <= 5.0) {
            risk.setResidualRiskLevel("Low");
        } else if (score <= 10.0) {
            risk.setResidualRiskLevel("Medium");
        } else if (score <= 15.0) {
            risk.setResidualRiskLevel("High");
        } else {
            risk.setResidualRiskLevel("Critical");
        }
    }

    public void constructRiskName(Risk risk) {
        if (Boolean.FALSE.equals(risk.getIsAutomaticRiskName())) {
            return;
        }

        String threatAgent = risk.getThreatAgent() != null ? risk.getThreatAgent() : "";
        String threatVerb = risk.getThreatVerb() != null ? risk.getThreatVerb() : "";
        String businessAssetName = risk.getBusinessAssetRef() != null ? risk.getBusinessAssetRef().getAssetName() : "";
        String supportingAssetName = risk.getSupportingAssetRef() != null ? risk.getSupportingAssetRef().getAssetName() : "";
        String motivation = risk.getMotivation() != null ? risk.getMotivation() : "";
        String attackPathsName = risk.getAllAttackPathsName();

        String name = "As a " + threatAgent + ", I can " + threatVerb + " the " + businessAssetName +
                " compromising the " + supportingAssetName + " in order to " + motivation;

        if (attackPathsName != null && !attackPathsName.isEmpty()) {
            name += ", exploiting the " + attackPathsName;
        }

        risk.setRiskName(name);
    }
}
