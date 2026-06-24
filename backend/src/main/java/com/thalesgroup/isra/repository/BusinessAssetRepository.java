package com.thalesgroup.isra.repository;

import com.thalesgroup.isra.model.BusinessAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BusinessAssetRepository extends JpaRepository<BusinessAsset, Long> {
    List<BusinessAsset> findByProjectId(Long projectId);
}
