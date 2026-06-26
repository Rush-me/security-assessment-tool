package com.thalesgroup.isra.repository;

import com.thalesgroup.isra.model.BusinessAsset;
import com.thalesgroup.isra.model.IsraProject;
import com.thalesgroup.isra.model.SupportingAsset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class SupportingAssetRepositoryTest {

    @Autowired
    private SupportingAssetRepository supportingAssetRepository;

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

        BusinessAsset busAsset = BusinessAsset.builder()
                .project(project)
                .assetId(101)
                .assetName("Database")
                .assetType("Data")
                .build();
        businessAssetRepository.save(busAsset);

        SupportingAsset suppAsset1 = SupportingAsset.builder()
                .project(project)
                .assetId(201)
                .assetName("PostgreSQL Database Server")
                .assetType("Database Server")
                .securityLevel(3)
                .businessAssets(new ArrayList<>(List.of(busAsset)))
                .build();

        SupportingAsset suppAsset2 = SupportingAsset.builder()
                .project(project)
                .assetId(202)
                .assetName("Nginx Web Server")
                .assetType("Web Server")
                .securityLevel(2)
                .businessAssets(new ArrayList<>())
                .build();

        supportingAssetRepository.save(suppAsset1);
        supportingAssetRepository.save(suppAsset2);

        List<SupportingAsset> found = supportingAssetRepository.findByProjectId(project.getId());
        assertEquals(2, found.size());
        assertTrue(found.stream().anyMatch(s -> s.getAssetName().equals("PostgreSQL Database Server")));
        assertTrue(found.stream().anyMatch(s -> s.getAssetName().equals("Nginx Web Server")));

        SupportingAsset first = found.stream().filter(s -> s.getAssetName().equals("PostgreSQL Database Server")).findFirst().get();
        assertEquals(1, first.getBusinessAssets().size());
        assertEquals("Database", first.getBusinessAssets().get(0).getAssetName());

        List<SupportingAsset> notFound = supportingAssetRepository.findByProjectId(999L);
        assertTrue(notFound.isEmpty());
    }
}
