package com.thalesgroup.isra.repository;

import com.thalesgroup.isra.model.IsraProject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IsraProjectRepository extends JpaRepository<IsraProject, Long> {
    /** Find all projects owned by the given Azure AD Object ID. */
    List<IsraProject> findByOwnerOid(String ownerOid);
}
