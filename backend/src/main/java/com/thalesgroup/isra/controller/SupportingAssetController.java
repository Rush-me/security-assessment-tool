package com.thalesgroup.isra.controller;

import com.thalesgroup.isra.model.*;
import com.thalesgroup.isra.repository.BusinessAssetRepository;
import com.thalesgroup.isra.repository.IsraProjectRepository;
import com.thalesgroup.isra.repository.SupportingAssetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/supporting-assets")
public class SupportingAssetController {

    private final SupportingAssetRepository supportingAssetRepository;
    private final BusinessAssetRepository businessAssetRepository;
    private final IsraProjectRepository projectRepository;

    public SupportingAssetController(SupportingAssetRepository supportingAssetRepository,
                                     BusinessAssetRepository businessAssetRepository,
                                     IsraProjectRepository projectRepository) {
        this.supportingAssetRepository = supportingAssetRepository;
        this.businessAssetRepository = businessAssetRepository;
        this.projectRepository = projectRepository;
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private IsraProject getOwnedProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private List<BusinessAsset> resolveMappedBusinessAssets(List<BusinessAsset> requested) {
        List<BusinessAsset> resolved = new ArrayList<>();
        if (requested != null) {
            for (BusinessAsset req : requested) {
                businessAssetRepository.findById(req.getId()).ifPresent(resolved::add);
            }
        }
        return resolved;
    }

    // ── Endpoints ─────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<SupportingAsset>> getSupportingAssets(@PathVariable Long projectId) {
        getOwnedProject(projectId);
        return ResponseEntity.ok(supportingAssetRepository.findByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<SupportingAsset> addSupportingAsset(@PathVariable Long projectId,
                                                               @RequestBody SupportingAsset assetRequest) {
        IsraProject project = getOwnedProject(projectId);
        assetRequest.setProject(project);

        int nextId = project.getSupportingAssets().stream()
                .mapToInt(SupportingAsset::getAssetId).max().orElse(0) + 1;
        assetRequest.setAssetId(nextId);
        assetRequest.setBusinessAssets(resolveMappedBusinessAssets(assetRequest.getBusinessAssets()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supportingAssetRepository.save(assetRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupportingAsset> updateSupportingAsset(@PathVariable Long projectId,
                                                                   @PathVariable Long id,
                                                                   @RequestBody SupportingAsset assetRequest) {
        IsraProject project = getOwnedProject(projectId);
        SupportingAsset existing = supportingAssetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supporting asset not found"));

        if (!existing.getProject().getId().equals(project.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        existing.setAssetName(assetRequest.getAssetName());
        existing.setAssetType(assetRequest.getAssetType());
        existing.setHldId(assetRequest.getHldId());
        existing.setSecurityLevel(assetRequest.getSecurityLevel());
        existing.setBusinessAssets(resolveMappedBusinessAssets(assetRequest.getBusinessAssets()));

        return ResponseEntity.ok(supportingAssetRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupportingAsset(@PathVariable Long projectId,
                                                    @PathVariable Long id) {
        IsraProject project = getOwnedProject(projectId);
        SupportingAsset existing = supportingAssetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supporting asset not found"));

        if (!existing.getProject().getId().equals(project.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        supportingAssetRepository.delete(existing);

        // Clear dangling supporting-asset refs on risks
        for (Risk risk : project.getRisks()) {
            if (risk.getSupportingAssetRef() != null && risk.getSupportingAssetRef().getId().equals(id)) {
                risk.setSupportingAssetRef(null);
            }
        }
        projectRepository.save(project);

        return ResponseEntity.ok().build();
    }
}
