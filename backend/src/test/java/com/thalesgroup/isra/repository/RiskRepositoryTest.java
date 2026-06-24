package com.thalesgroup.isra.repository;

import com.thalesgroup.isra.model.BusinessAsset;
import com.thalesgroup.isra.model.IsraProject;
import com.thalesgroup.isra.model.Risk;
import com.thalesgroup.isra.model.SupportingAsset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class RiskRepositoryTest {

    @Autowired
    private RiskRepository riskRepository;

    @Autowired
    private BusinessAssetRepository businessAssetRepository;

    @Autowired
    private SupportingAssetRepository supportingAssetRepository;

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

        SupportingAsset suppAsset = SupportingAsset.builder()
                .project(project)
                .assetId(201)
                .assetName("Database Server")
                .build();
        supportingAssetRepository.save(suppAsset);

        Risk risk1 = Risk.builder()
                .project(project)
                .riskId(401)
                .riskName("Unauthorized Access to Database")
                .threatAgent("Hacker")
                .threatVerb("read")
                .businessAssetRef(busAsset)
                .supportingAssetRef(suppAsset)
                .riskLikelihood(3)
                .riskImpact(4)
                .inherentRiskScore(12.0)
                .build();

        Risk risk2 = Risk.builder()
                .project(project)
                .riskId(402)
                .riskName("DDoS Attack on Server")
                .threatAgent("Botnet")
                .threatVerb("disrupt")
                .businessAssetRef(busAsset)
                .supportingAssetRef(suppAsset)
                .riskLikelihood(2)
                .riskImpact(3)
                .inherentRiskScore(6.0)
                .build();

        riskRepository.save(risk1);
        riskRepository.save(risk2);

        List<Risk> found = riskRepository.findByProjectId(project.getId());
        assertEquals(2, found.size());
        assertTrue(found.stream().anyMatch(r -> r.getRiskName().equals("Unauthorized Access to Database")));
        assertTrue(found.stream().anyMatch(r -> r.getRiskName().equals("DDoS Attack on Server")));

        Risk loadedRisk = found.stream().filter(r -> r.getRiskName().equals("Unauthorized Access to Database")).findFirst().get();
        assertEquals("Database", loadedRisk.getBusinessAssetRef().getAssetName());
        assertEquals("Database Server", loadedRisk.getSupportingAssetRef().getAssetName());

        List<Risk> notFound = riskRepository.findByProjectId(999L);
        assertTrue(notFound.isEmpty());
    }
}
