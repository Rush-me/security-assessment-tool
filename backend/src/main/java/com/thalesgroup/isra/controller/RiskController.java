package com.thalesgroup.isra.controller;

import com.thalesgroup.isra.model.*;
import com.thalesgroup.isra.repository.*;
import com.thalesgroup.isra.service.RiskCalculationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/risks")
public class RiskController {

    private final RiskRepository riskRepository;
    private final BusinessAssetRepository businessAssetRepository;
    private final SupportingAssetRepository supportingAssetRepository;
    private final VulnerabilityRepository vulnerabilityRepository;
    private final IsraProjectRepository projectRepository;
    private final RiskCalculationService riskCalculationService;

    public RiskController(RiskRepository riskRepository,
                          BusinessAssetRepository businessAssetRepository,
                          SupportingAssetRepository supportingAssetRepository,
                          VulnerabilityRepository vulnerabilityRepository,
                          IsraProjectRepository projectRepository,
                          RiskCalculationService riskCalculationService) {
        this.riskRepository = riskRepository;
        this.businessAssetRepository = businessAssetRepository;
        this.supportingAssetRepository = supportingAssetRepository;
        this.vulnerabilityRepository = vulnerabilityRepository;
        this.projectRepository = projectRepository;
        this.riskCalculationService = riskCalculationService;
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private IsraProject getOwnedProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    /** Resolves business/supporting asset stubs from the request into managed JPA entities. */
    private void resolveAssetRefs(Risk risk) {
        if (risk.getBusinessAssetRef() != null && risk.getBusinessAssetRef().getId() != null) {
            businessAssetRepository.findById(risk.getBusinessAssetRef().getId())
                    .ifPresent(risk::setBusinessAssetRef);
        } else {
            risk.setBusinessAssetRef(null);
        }
        if (risk.getSupportingAssetRef() != null && risk.getSupportingAssetRef().getId() != null) {
            supportingAssetRepository.findById(risk.getSupportingAssetRef().getId())
                    .ifPresent(risk::setSupportingAssetRef);
        } else {
            risk.setSupportingAssetRef(null);
        }
    }

    // ── Risk CRUD ─────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Risk>> getRisks(@PathVariable Long projectId) {
        getOwnedProject(projectId);
        return ResponseEntity.ok(riskRepository.findByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<Risk> addRisk(@PathVariable Long projectId,
                                        @RequestBody Risk riskRequest) {
        IsraProject project = getOwnedProject(projectId);
        riskRequest.setProject(project);

        int nextId = project.getRisks().stream()
                .mapToInt(Risk::getRiskId).max().orElse(0) + 1;
        riskRequest.setRiskId(nextId);

        resolveAssetRefs(riskRequest);
        riskCalculationService.calculateRisk(riskRequest);
        riskCalculationService.constructRiskName(riskRequest);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(riskRepository.save(riskRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Risk> updateRisk(@PathVariable Long projectId,
                                           @PathVariable Long id,
                                           @RequestBody Risk riskRequest) {
        IsraProject project = getOwnedProject(projectId);
        Risk existing = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));

        if (!existing.getProject().getId().equals(project.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // Core fields
        existing.setThreatAgent(riskRequest.getThreatAgent());
        existing.setThreatAgentDetail(riskRequest.getThreatAgentDetail());
        existing.setThreatVerb(riskRequest.getThreatVerb());
        existing.setThreatVerbDetail(riskRequest.getThreatVerbDetail());
        existing.setMotivation(riskRequest.getMotivation());
        existing.setMotivationDetail(riskRequest.getMotivationDetail());
        existing.setIsAutomaticRiskName(riskRequest.getIsAutomaticRiskName());

        // Likelihood
        existing.setSkillLevel(riskRequest.getSkillLevel());
        existing.setReward(riskRequest.getReward());
        existing.setAccessResources(riskRequest.getAccessResources());
        existing.setSize(riskRequest.getSize());
        existing.setIntrusionDetection(riskRequest.getIntrusionDetection());
        existing.setOccurrence(riskRequest.getOccurrence());
        existing.setIsOwaspLikelihood(riskRequest.getIsOwaspLikelihood());
        if (Boolean.FALSE.equals(riskRequest.getIsOwaspLikelihood())) {
            existing.setRiskLikelihood(riskRequest.getRiskLikelihood());
        }

        // Impact flags
        existing.setConfidentialityFlag(riskRequest.getConfidentialityFlag());
        existing.setIntegrityFlag(riskRequest.getIntegrityFlag());
        existing.setAvailabilityFlag(riskRequest.getAvailabilityFlag());
        existing.setAuthenticityFlag(riskRequest.getAuthenticityFlag());
        existing.setAuthorizationFlag(riskRequest.getAuthorizationFlag());
        existing.setNonRepudiationFlag(riskRequest.getNonRepudiationFlag());

        // Decision
        existing.setRiskManagementDecision(riskRequest.getRiskManagementDecision());
        existing.setRiskManagementDetail(riskRequest.getRiskManagementDetail());

        // Asset refs
        existing.setBusinessAssetRef(riskRequest.getBusinessAssetRef());
        existing.setSupportingAssetRef(riskRequest.getSupportingAssetRef());
        resolveAssetRefs(existing);

        // Name override
        if (Boolean.FALSE.equals(existing.getIsAutomaticRiskName())) {
            existing.setRiskName(riskRequest.getRiskName());
        }

        riskCalculationService.calculateRisk(existing);
        riskCalculationService.constructRiskName(existing);

        return ResponseEntity.ok(riskRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRisk(@PathVariable Long projectId,
                                        @PathVariable Long id) {
        IsraProject project = getOwnedProject(projectId);
        Risk existing = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));

        if (!existing.getProject().getId().equals(project.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        riskRepository.delete(existing);
        return ResponseEntity.ok().build();
    }

    // ── Batch Update ─────────────────────────────────────────────────────────

    /**
     * PUT /api/projects/{projectId}/risks/batch
     * Accepts a list of Risk objects and persists all of them in one transaction.
     * Only updates risks that already exist in the DB (by id). Skips unknown ids.
     * Returns the full list of updated risks for the project.
     */
    @Transactional
    @PutMapping("/batch")
    public ResponseEntity<List<Risk>> batchUpdateRisks(@PathVariable Long projectId,
                                                        @RequestBody List<Risk> riskRequests) {
        IsraProject project = getOwnedProject(projectId);

        for (Risk riskRequest : riskRequests) {
            if (riskRequest.getId() == null) continue;
            riskRepository.findById(riskRequest.getId()).ifPresent(existing -> {
                if (!existing.getProject().getId().equals(project.getId())) return;

                existing.setThreatAgent(riskRequest.getThreatAgent());
                existing.setThreatAgentDetail(riskRequest.getThreatAgentDetail());
                existing.setThreatVerb(riskRequest.getThreatVerb());
                existing.setThreatVerbDetail(riskRequest.getThreatVerbDetail());
                existing.setMotivation(riskRequest.getMotivation());
                existing.setMotivationDetail(riskRequest.getMotivationDetail());
                existing.setIsAutomaticRiskName(riskRequest.getIsAutomaticRiskName());

                existing.setSkillLevel(riskRequest.getSkillLevel());
                existing.setReward(riskRequest.getReward());
                existing.setAccessResources(riskRequest.getAccessResources());
                existing.setSize(riskRequest.getSize());
                existing.setIntrusionDetection(riskRequest.getIntrusionDetection());
                existing.setOccurrence(riskRequest.getOccurrence());
                existing.setIsOwaspLikelihood(riskRequest.getIsOwaspLikelihood());
                if (Boolean.FALSE.equals(riskRequest.getIsOwaspLikelihood())) {
                    existing.setRiskLikelihood(riskRequest.getRiskLikelihood());
                }

                existing.setConfidentialityFlag(riskRequest.getConfidentialityFlag());
                existing.setIntegrityFlag(riskRequest.getIntegrityFlag());
                existing.setAvailabilityFlag(riskRequest.getAvailabilityFlag());
                existing.setAuthenticityFlag(riskRequest.getAuthenticityFlag());
                existing.setAuthorizationFlag(riskRequest.getAuthorizationFlag());
                existing.setNonRepudiationFlag(riskRequest.getNonRepudiationFlag());

                existing.setRiskManagementDecision(riskRequest.getRiskManagementDecision());
                existing.setRiskManagementDetail(riskRequest.getRiskManagementDetail());

                existing.setBusinessAssetRef(riskRequest.getBusinessAssetRef());
                existing.setSupportingAssetRef(riskRequest.getSupportingAssetRef());
                resolveAssetRefs(existing);

                if (Boolean.FALSE.equals(existing.getIsAutomaticRiskName())) {
                    existing.setRiskName(riskRequest.getRiskName());
                }

                riskCalculationService.calculateRisk(existing);
                riskCalculationService.constructRiskName(existing);
                riskRepository.save(existing);
            });
        }

        return ResponseEntity.ok(riskRepository.findByProjectId(projectId));
    }

    // ── Attack Path Endpoints ────────────────────────────────────────────────

    @PostMapping("/{id}/attack-paths")
    public ResponseEntity<Risk> addAttackPath(@PathVariable Long projectId,
                                              @PathVariable Long id) {
        getOwnedProject(projectId);
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));

        int nextId = risk.getRiskAttackPaths().stream()
                .mapToInt(RiskAttackPath::getAttackPathId).max().orElse(0) + 1;

        RiskAttackPath path = RiskAttackPath.builder()
                .attackPathId(nextId)
                .risk(risk)
                .build();
        risk.getRiskAttackPaths().add(path);

        riskCalculationService.calculateRisk(risk);
        riskCalculationService.constructRiskName(risk);

        return ResponseEntity.ok(riskRepository.save(risk));
    }

    @DeleteMapping("/{id}/attack-paths/{pathId}")
    public ResponseEntity<Risk> deleteAttackPath(@PathVariable Long projectId,
                                                  @PathVariable Long id,
                                                  @PathVariable Long pathId) {
        getOwnedProject(projectId);
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));

        risk.getRiskAttackPaths().removeIf(p -> p.getId().equals(pathId));
        riskCalculationService.calculateRisk(risk);
        riskCalculationService.constructRiskName(risk);

        return ResponseEntity.ok(riskRepository.save(risk));
    }

    @PostMapping("/{id}/attack-paths/{pathId}/vulnerabilities")
    public ResponseEntity<Risk> addVulnerabilityRefToAttackPath(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @PathVariable Long pathId,
            @RequestParam("vulnerabilityId") Long vulnerabilityId) {
        getOwnedProject(projectId);
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));

        RiskAttackPath path = risk.getRiskAttackPaths().stream()
                .filter(p -> p.getId().equals(pathId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Attack path not found"));

        Vulnerability vuln = vulnerabilityRepository.findById(vulnerabilityId)
                .orElseThrow(() -> new RuntimeException("Vulnerability not found"));

        boolean exists = path.getVulnerabilityRefs().stream()
                .anyMatch(ref -> ref.getVulnerability().getId().equals(vulnerabilityId));
        if (!exists) {
            path.getVulnerabilityRefs().add(RiskVulnerabilityRef.builder()
                    .attackPath(path)
                    .vulnerability(vuln)
                    .score(vuln.getCveScore())
                    .name(vuln.getVulnerabilityName())
                    .build());
        }

        riskCalculationService.calculateRisk(risk);
        riskCalculationService.constructRiskName(risk);

        return ResponseEntity.ok(riskRepository.save(risk));
    }

    @DeleteMapping("/{id}/attack-paths/{pathId}/vulnerabilities/{refId}")
    public ResponseEntity<Risk> removeVulnerabilityRef(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @PathVariable Long pathId,
            @PathVariable Long refId) {
        getOwnedProject(projectId);
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));

        risk.getRiskAttackPaths().stream()
                .filter(p -> p.getId().equals(pathId)).findFirst()
                .ifPresent(path -> path.getVulnerabilityRefs().removeIf(ref -> ref.getId().equals(refId)));

        riskCalculationService.calculateRisk(risk);
        riskCalculationService.constructRiskName(risk);

        return ResponseEntity.ok(riskRepository.save(risk));
    }

    // ── Mitigation Endpoints ─────────────────────────────────────────────────

    @PostMapping("/{id}/mitigations")
    public ResponseEntity<Risk> addMitigation(@PathVariable Long projectId,
                                              @PathVariable Long id,
                                              @RequestBody RiskMitigation request) {
        getOwnedProject(projectId);
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));

        int nextId = risk.getRiskMitigations().stream()
                .mapToInt(RiskMitigation::getMitigationId).max().orElse(0) + 1;
        request.setMitigationId(nextId);
        request.setRisk(risk);
        risk.getRiskMitigations().add(request);

        riskCalculationService.calculateRisk(risk);

        return ResponseEntity.ok(riskRepository.save(risk));
    }

    @PutMapping("/{id}/mitigations/{mitId}")
    public ResponseEntity<Risk> updateMitigation(@PathVariable Long projectId,
                                                  @PathVariable Long id,
                                                  @PathVariable Long mitId,
                                                  @RequestBody RiskMitigation request) {
        getOwnedProject(projectId);
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));

        risk.getRiskMitigations().stream()
                .filter(m -> m.getId().equals(mitId)).findFirst()
                .ifPresent(m -> {
                    m.setDescription(request.getDescription());
                    m.setBenefits(request.getBenefits());
                    m.setCost(request.getCost());
                    m.setDecision(request.getDecision());
                    m.setDecisionDetail(request.getDecisionDetail());
                });

        riskCalculationService.calculateRisk(risk);
        return ResponseEntity.ok(riskRepository.save(risk));
    }

    @DeleteMapping("/{id}/mitigations/{mitId}")
    public ResponseEntity<Risk> deleteMitigation(@PathVariable Long projectId,
                                                  @PathVariable Long id,
                                                  @PathVariable Long mitId) {
        getOwnedProject(projectId);
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));

        risk.getRiskMitigations().removeIf(m -> m.getId().equals(mitId));
        riskCalculationService.calculateRisk(risk);

        return ResponseEntity.ok(riskRepository.save(risk));
    }
}
