package com.thalesgroup.isra.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "risks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Risk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private IsraProject project;

    @Column(name = "risk_id", nullable = false)
    private Integer riskId;

    @Column(name = "risk_name", nullable = false, length = 512)
    private String riskName;

    @Column(name = "threat_agent")
    private String threatAgent;

    @Column(name = "threat_agent_detail", columnDefinition = "LONGTEXT")
    private String threatAgentDetail;

    @Column(name = "threat_verb")
    private String threatVerb;

    @Column(name = "threat_verb_detail", columnDefinition = "LONGTEXT")
    private String threatVerbDetail;

    @Column(name = "motivation")
    private String motivation;

    @Column(name = "motivation_detail", columnDefinition = "LONGTEXT")
    private String motivationDetail;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "business_asset_ref")
    private BusinessAsset businessAssetRef;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supporting_asset_ref")
    private SupportingAsset supportingAssetRef;

    @Column(name = "is_automatic_risk_name")
    @Builder.Default
    private Boolean isAutomaticRiskName = true;

    // Likelihood Evaluator
    @Column(name = "risk_likelihood")
    private Integer riskLikelihood;

    @Column(name = "risk_likelihood_detail", columnDefinition = "LONGTEXT")
    private String riskLikelihoodDetail;

    @Column(name = "skill_level")
    private Integer skillLevel;

    @Column(name = "reward")
    private Integer reward;

    @Column(name = "access_resources")
    private Integer accessResources;

    @Column(name = "size")
    private Integer size;

    @Column(name = "intrusion_detection")
    private Integer intrusionDetection;

    @Column(name = "threat_factor_score")
    private Double threatFactorScore;

    @Column(name = "threat_factor_level")
    private String threatFactorLevel;

    @Column(name = "occurrence")
    private Integer occurrence;

    @Column(name = "occurrence_level")
    private String occurrenceLevel;

    @Column(name = "is_owasp_likelihood")
    @Builder.Default
    private Boolean isOwaspLikelihood = true;

    // Impact Evaluator
    @Column(name = "risk_impact")
    private Integer riskImpact;

    @Column(name = "confidentiality_flag")
    private Integer confidentialityFlag;

    @Column(name = "integrity_flag")
    private Integer integrityFlag;

    @Column(name = "availability_flag")
    private Integer availabilityFlag;

    @Column(name = "authenticity_flag")
    private Integer authenticityFlag;

    @Column(name = "authorization_flag")
    private Integer authorizationFlag;

    @Column(name = "non_repudiation_flag")
    private Integer nonRepudiationFlag;

    // Inherent score aggregates
    @Column(name = "all_attack_paths_name", length = 512)
    private String allAttackPathsName;

    @Column(name = "all_attack_paths_score")
    private Double allAttackPathsScore;

    @Column(name = "inherent_risk_score")
    private Double inherentRiskScore;

    // Mitigations
    @Column(name = "mitigations_benefits")
    private Double mitigationsBenefits;

    @Column(name = "mitigations_done_benefits")
    private Double mitigationsDoneBenefits;

    @Column(name = "mitigated_risk_score")
    private Double mitigatedRiskScore;

    // Risk Management Decision
    @Column(name = "risk_management_decision")
    private String riskManagementDecision;

    @Column(name = "risk_management_detail", columnDefinition = "LONGTEXT")
    private String riskManagementDetail;

    @Column(name = "residual_risk_score")
    private Double residualRiskScore;

    @Column(name = "residual_risk_level")
    private String residualRiskLevel;

    @OneToMany(mappedBy = "risk", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RiskAttackPath> riskAttackPaths = new ArrayList<>();

    @OneToMany(mappedBy = "risk", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RiskMitigation> riskMitigations = new ArrayList<>();
}
