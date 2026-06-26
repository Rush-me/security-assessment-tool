package com.thalesgroup.isra.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalesgroup.isra.model.*;
import com.thalesgroup.isra.repository.BusinessAssetRepository;
import com.thalesgroup.isra.repository.IsraProjectRepository;
import com.thalesgroup.isra.repository.SupportingAssetRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SupportingAssetControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SupportingAssetRepository supportingAssetRepository;

    @Mock
    private BusinessAssetRepository businessAssetRepository;

    @Mock
    private IsraProjectRepository projectRepository;

    @InjectMocks
    private SupportingAssetController supportingAssetController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private IsraProject project;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(supportingAssetController).build();

        project = IsraProject.builder()
                .id(1L)
                .projectName("Test Project")
                .supportingAssets(new ArrayList<>())
                .risks(new ArrayList<>())
                .build();
    }

    @Test
    void testGetSupportingAssets_success() throws Exception {
        SupportingAsset asset1 = SupportingAsset.builder().id(20L).assetName("S-Asset 1").build();
        SupportingAsset asset2 = SupportingAsset.builder().id(21L).assetName("S-Asset 2").build();
        List<SupportingAsset> assets = List.of(asset1, asset2);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(supportingAssetRepository.findByProjectId(1L)).thenReturn(assets);

        mockMvc.perform(get("/api/projects/1/supporting-assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(20))
                .andExpect(jsonPath("$[0].assetName").value("S-Asset 1"))
                .andExpect(jsonPath("$[1].id").value(21))
                .andExpect(jsonPath("$[1].assetName").value("S-Asset 2"));
    }

    @Test
    void testAddSupportingAsset_success() throws Exception {
        BusinessAsset mappedAsset = BusinessAsset.builder().id(10L).assetName("B-Asset 1").build();
        SupportingAsset newAsset = SupportingAsset.builder()
                .assetName("New Supporting Asset")
                .assetType("Hardware")
                .securityLevel(3)
                .businessAssets(List.of(mappedAsset))
                .build();

        SupportingAsset savedAsset = SupportingAsset.builder()
                .id(25L)
                .assetId(1)
                .assetName("New Supporting Asset")
                .assetType("Hardware")
                .securityLevel(3)
                .businessAssets(List.of(mappedAsset))
                .project(project)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(businessAssetRepository.findById(10L)).thenReturn(Optional.of(mappedAsset));
        when(supportingAssetRepository.save(any(SupportingAsset.class))).thenReturn(savedAsset);

        mockMvc.perform(post("/api/projects/1/supporting-assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newAsset)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(25))
                .andExpect(jsonPath("$.assetId").value(1))
                .andExpect(jsonPath("$.assetName").value("New Supporting Asset"))
                .andExpect(jsonPath("$.businessAssets[0].id").value(10));
    }

    @Test
    void testUpdateSupportingAsset_success() throws Exception {
        SupportingAsset existingAsset = SupportingAsset.builder()
                .id(20L)
                .assetId(1)
                .assetName("Old S-Asset")
                .project(project)
                .build();

        SupportingAsset updatedRequest = SupportingAsset.builder()
                .assetName("Updated S-Asset")
                .assetType("Software")
                .securityLevel(4)
                .hldId("HLD-99")
                .build();

        SupportingAsset savedAsset = SupportingAsset.builder()
                .id(20L)
                .assetId(1)
                .assetName("Updated S-Asset")
                .assetType("Software")
                .securityLevel(4)
                .hldId("HLD-99")
                .project(project)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(supportingAssetRepository.findById(20L)).thenReturn(Optional.of(existingAsset));
        when(supportingAssetRepository.save(any(SupportingAsset.class))).thenReturn(savedAsset);

        mockMvc.perform(put("/api/projects/1/supporting-assets/20")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.assetName").value("Updated S-Asset"));
    }

    @Test
    void testUpdateSupportingAsset_wrongProjectId() throws Exception {
        IsraProject wrongProject = IsraProject.builder().id(2L).build();
        SupportingAsset existingAsset = SupportingAsset.builder()
                .id(20L)
                .project(wrongProject)
                .build();

        SupportingAsset updatedRequest = SupportingAsset.builder().assetName("Updated").build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(supportingAssetRepository.findById(20L)).thenReturn(Optional.of(existingAsset));

        mockMvc.perform(put("/api/projects/1/supporting-assets/20")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDeleteSupportingAsset_successWithRiskDisassociation() throws Exception {
        SupportingAsset existingAsset = SupportingAsset.builder()
                .id(20L)
                .project(project)
                .build();

        Risk referencingRisk = Risk.builder()
                .id(50L)
                .supportingAssetRef(existingAsset)
                .build();
        project.getRisks().add(referencingRisk);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(supportingAssetRepository.findById(20L)).thenReturn(Optional.of(existingAsset));

        mockMvc.perform(delete("/api/projects/1/supporting-assets/20"))
                .andExpect(status().isOk());

        verify(supportingAssetRepository, times(1)).delete(existingAsset);
        verify(projectRepository, times(1)).save(project);
        assertNull(referencingRisk.getSupportingAssetRef());
    }
}
