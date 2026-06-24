package com.thalesgroup.isra.repository;

import com.thalesgroup.isra.model.Risk;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RiskRepository extends JpaRepository<Risk, Long> {
    List<Risk> findByProjectId(Long projectId);
}
