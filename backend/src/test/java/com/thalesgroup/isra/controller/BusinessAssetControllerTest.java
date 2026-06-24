package com.thalesgroup.isra.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalesgroup.isra.model.*;
import com.thalesgroup.isra.repository.BusinessAssetRepository;
import com.thalesgroup.isra.repository.IsraProjectRepository;
import com.thalesgroup.isra.service.RiskCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class BusinessAssetControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BusinessAssetRepository businessAssetRepository;

    @Mock
    private IsraProjectRepository projectRepository;

    @Mock
    private RiskCalculationService riskCalculationService;

    @InjectMocks
    private BusinessAssetController businessAssetController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private IsraProject project;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(businessAssetController).build();

        project = IsraProject.builder()
                .id(1L)
                .projectName("Test Project")
                .businessAssets(new ArrayList<>())
                .risks(new ArrayList<>())
                .build();
    }

    @Test
    void testGetBusinessAssets_success() throws Exception {
        BusinessAsset asset1 = BusinessAsset.builder().id(10L).assetName("Asset 1").build();
        BusinessAsset asset2 = BusinessAsset.builder().id(11L).assetName("Asset 2").build();
        List<BusinessAsset> assets = List.of(asset1, asset2);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(businessAssetRepository.findByProjectId(1L)).thenReturn(assets);

        mockMvc.perform(get("/api/projects/1/business-assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].assetName").value("Asset 1"))
                .andExpect(jsonPath("$[1].id").value(11))
                .andExpect(jsonPath("$[1].assetName").value("Asset 2"));
    }

    @Test
    void testGetBusinessAssets_projectNotFound() {
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> {
            mockMvc.perform(get("/api/projects/1/business-assets"));
        });
    }

    @Test
    void testAddBusinessAsset_success() throws Exception {
        BusinessAsset newAsset = BusinessAsset.builder()
                .assetName("New Asset")
                .assetType("Data")
                .confidentiality(5)
                .build();

        BusinessAsset savedAsset = BusinessAsset.builder()
                .id(15L)
                .assetId(1)
                .assetName("New Asset")
                .assetType("Data")
                .confidentiality(5)
                .project(project)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(businessAssetRepository.save(any(BusinessAsset.class))).thenReturn(savedAsset);

        mockMvc.perform(post("/api/projects/1/business-assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newAsset)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(15))
                .andExpect(jsonPath("$.assetId").value(1))
                .andExpect(jsonPath("$.assetName").value("New Asset"));
    }

    @Test
    void testUpdateBusinessAsset_successWithRiskRecalculation() throws Exception {
        BusinessAsset existingAsset = BusinessAsset.builder()
                .id(10L)
                .assetId(1)
                .assetName("Old Asset")
                .project(project)
                .build();

        BusinessAsset updatedRequest = BusinessAsset.builder()
                .assetName("Updated Asset")
                .confidentiality(7)
                .integrity(7)
                .availability(7)
                .build();

        BusinessAsset savedAsset = BusinessAsset.builder()
                .id(10L)
                .assetId(1)
                .assetName("Updated Asset")
                .confidentiality(7)
                .integrity(7)
                .availability(7)
                .project(project)
                .build();

        // Create a risk referencing this business asset
        Risk referencingRisk = Risk.builder()
                .id(50L)
                .businessAssetRef(existingAsset)
                .build();
        project.getRisks().add(referencingRisk);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(businessAssetRepository.findById(10L)).thenReturn(Optional.of(existingAsset));
        when(businessAssetRepository.save(any(BusinessAsset.class))).thenReturn(savedAsset);

        mockMvc.perform(put("/api/projects/1/business-assets/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.assetName").value("Updated Asset"));

        verify(riskCalculationService, times(1)).calculateRisk(referencingRisk);
        verify(projectRepository, times(1)).save(project);
    }

    @Test
    void testUpdateBusinessAsset_wrongProjectId() throws Exception {
        IsraProject wrongProject = IsraProject.builder().id(2L).build();
        BusinessAsset existingAsset = BusinessAsset.builder()
                .id(10L)
                .project(wrongProject)
                .build();

        BusinessAsset updatedRequest = BusinessAsset.builder().assetName("Updated Asset").build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(businessAssetRepository.findById(10L)).thenReturn(Optional.of(existingAsset));

        mockMvc.perform(put("/api/projects/1/business-assets/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDeleteBusinessAsset_successWithRiskDisassociation() throws Exception {
        BusinessAsset existingAsset = BusinessAsset.builder()
                .id(10L)
                .project(project)
                .build();

        Risk referencingRisk = Risk.builder()
                .id(50L)
                .businessAssetRef(existingAsset)
                .build();
        project.getRisks().add(referencingRisk);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(businessAssetRepository.findById(10L)).thenReturn(Optional.of(existingAsset));

        mockMvc.perform(delete("/api/projects/1/business-assets/10"))
                .andExpect(status().isOk());

        verify(businessAssetRepository, times(1)).delete(existingAsset);
        verify(riskCalculationService, times(1)).calculateRisk(referencingRisk);
        verify(projectRepository, times(1)).save(project);
    }
}
