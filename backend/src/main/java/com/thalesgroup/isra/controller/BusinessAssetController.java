package com.thalesgroup.isra.controller;

import com.thalesgroup.isra.model.*;
import com.thalesgroup.isra.repository.BusinessAssetRepository;
import com.thalesgroup.isra.repository.IsraProjectRepository;
import com.thalesgroup.isra.service.RiskCalculationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/business-assets")
public class BusinessAssetController {

    private final BusinessAssetRepository businessAssetRepository;
    private final IsraProjectRepository projectRepository;
    private final RiskCalculationService riskCalculationService;

    public BusinessAssetController(BusinessAssetRepository businessAssetRepository,
                                   IsraProjectRepository projectRepository,
                                   RiskCalculationService riskCalculationService) {
        this.businessAssetRepository = businessAssetRepository;
        this.projectRepository = projectRepository;
        this.riskCalculationService = riskCalculationService;
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private IsraProject getOwnedProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    // ── Endpoints ─────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<BusinessAsset>> getBusinessAssets(@PathVariable Long projectId) {
        getOwnedProject(projectId);
        return ResponseEntity.ok(businessAssetRepository.findByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<BusinessAsset> addBusinessAsset(@PathVariable Long projectId,
                                                           @RequestBody BusinessAsset assetRequest) {
        IsraProject project = getOwnedProject(projectId);
        assetRequest.setProject(project);

        int nextId = project.getBusinessAssets().stream()
                .mapToInt(BusinessAsset::getAssetId).max().orElse(0) + 1;
        assetRequest.setAssetId(nextId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(businessAssetRepository.save(assetRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessAsset> updateBusinessAsset(@PathVariable Long projectId,
                                                              @PathVariable Long id,
                                                              @RequestBody BusinessAsset assetRequest) {
        IsraProject project = getOwnedProject(projectId);
        BusinessAsset existing = businessAssetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business asset not found"));

        if (!existing.getProject().getId().equals(project.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        existing.setAssetName(assetRequest.getAssetName());
        existing.setAssetType(assetRequest.getAssetType());
        existing.setAssetDescription(assetRequest.getAssetDescription());
        existing.setConfidentiality(assetRequest.getConfidentiality());
        existing.setIntegrity(assetRequest.getIntegrity());
        existing.setAvailability(assetRequest.getAvailability());
        existing.setAuthenticity(assetRequest.getAuthenticity());
        existing.setAuthorization(assetRequest.getAuthorization());
        existing.setNonRepudiation(assetRequest.getNonRepudiation());

        BusinessAsset saved = businessAssetRepository.save(existing);

        // Re-calculate all risks that reference this business asset
        for (Risk risk : project.getRisks()) {
            if (risk.getBusinessAssetRef() != null && risk.getBusinessAssetRef().getId().equals(id)) {
                riskCalculationService.calculateRisk(risk);
            }
        }
        projectRepository.save(project);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBusinessAsset(@PathVariable Long projectId,
                                                  @PathVariable Long id) {
        IsraProject project = getOwnedProject(projectId);
        BusinessAsset existing = businessAssetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business asset not found"));

        if (!existing.getProject().getId().equals(project.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        businessAssetRepository.delete(existing);

        for (Risk risk : project.getRisks()) {
            if (risk.getBusinessAssetRef() != null && risk.getBusinessAssetRef().getId().equals(id)) {
                risk.setBusinessAssetRef(null);
                riskCalculationService.calculateRisk(risk);
            }
        }
        projectRepository.save(project);

        return ResponseEntity.ok().build();
    }
}
