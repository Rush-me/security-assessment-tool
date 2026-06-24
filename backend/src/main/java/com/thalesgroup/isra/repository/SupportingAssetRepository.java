package com.thalesgroup.isra.repository;

import com.thalesgroup.isra.model.SupportingAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportingAssetRepository extends JpaRepository<SupportingAsset, Long> {
    List<SupportingAsset> findByProjectId(Long projectId);
}
