package com.thalesgroup.isra.repository;

import com.thalesgroup.isra.model.BusinessAsset;
import com.thalesgroup.isra.model.IsraProject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class BusinessAssetRepositoryTest {

    @Autowired
    private BusinessAssetRepository businessAssetRepository;

    @Autowired
    private IsraProjectRepository israProjectRepository;

    @Test
    void testSaveAndFindByProjectId() {
        IsraProject project = IsraProject.builder()
                .projectName("Test Project")
                .ownerOid("owner-1")
                .build();
        israProjectRepository.save(project);

        BusinessAsset asset1 = BusinessAsset.builder()
                .project(project)
                .assetId(101)
                .assetName("Database")
                .assetType("Data")
                .confidentiality(4)
                .integrity(4)
                .availability(4)
                .build();

        BusinessAsset asset2 = BusinessAsset.builder()
                .project(project)
                .assetId(102)
                .assetName("Web Server")
                .assetType("System")
                .confidentiality(2)
                .integrity(3)
                .availability(4)
                .build();

        businessAssetRepository.save(asset1);
        businessAssetRepository.save(asset2);

        List<BusinessAsset> found = businessAssetRepository.findByProjectId(project.getId());
        assertEquals(2, found.size());
        assertTrue(found.stream().anyMatch(a -> a.getAssetName().equals("Database")));
        assertTrue(found.stream().anyMatch(a -> a.getAssetName().equals("Web Server")));

        List<BusinessAsset> notFound = businessAssetRepository.findByProjectId(999L);
        assertTrue(notFound.isEmpty());
    }
}
