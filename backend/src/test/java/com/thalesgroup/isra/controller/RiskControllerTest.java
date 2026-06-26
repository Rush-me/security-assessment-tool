package com.thalesgroup.isra.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalesgroup.isra.model.*;
import com.thalesgroup.isra.repository.*;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class RiskControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RiskRepository riskRepository;

    @Mock
    private BusinessAssetRepository businessAssetRepository;

    @Mock
    private SupportingAssetRepository supportingAssetRepository;

    @Mock
    private VulnerabilityRepository vulnerabilityRepository;

    @Mock
    private IsraProjectRepository projectRepository;

    @Mock
    private RiskCalculationService riskCalculationService;

    @InjectMocks
    private RiskController riskController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private IsraProject project;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(riskController).build();

        project = IsraProject.builder()
                .id(1L)
                .projectName("Test Project")
                .risks(new ArrayList<>())
                .build();
    }

    @Test
    void testGetRisks_success() throws Exception {
        Risk risk1 = Risk.builder().id(100L).riskName("Risk 1").build();
        List<Risk> risks = List.of(risk1);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(riskRepository.findByProjectId(1L)).thenReturn(risks);

        mockMvc.perform(get("/api/projects/1/risks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].riskName").value("Risk 1"));
    }

    @Test
    void testAddRisk_success() throws Exception {
        Risk request = Risk.builder()
                .threatAgent("Hacker")
                .threatVerb("Disrupts")
                .motivation("Protest")
                .build();

        Risk saved = Risk.builder()
                .id(100L)
                .riskId(1)
                .threatAgent("Hacker")
                .threatVerb("Disrupts")
                .motivation("Protest")
                .project(project)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(riskRepository.save(any(Risk.class))).thenReturn(saved);

        mockMvc.perform(post("/api/projects/1/risks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.riskId").value(1));

        verify(riskCalculationService, times(1)).calculateRisk(any(Risk.class));
        verify(riskCalculationService, times(1)).constructRiskName(any(Risk.class));
    }

    @Test
    void testUpdateRisk_success() throws Exception {
        Risk existing = Risk.builder()
                .id(100L)
                .riskId(1)
                .threatAgent("Old Hacker")
                .project(project)
                .build();

        Risk request = Risk.builder()
                .threatAgent("New Hacker")
                .isOwaspLikelihood(false)
                .riskLikelihood(3)
                .isAutomaticRiskName(false)
                .riskName("Manual Name")
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(riskRepository.findById(100L)).thenReturn(Optional.of(existing));
        when(riskRepository.save(any(Risk.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/projects/1/risks/100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.threatAgent").value("New Hacker"))
                .andExpect(jsonPath("$.riskLikelihood").value(3))
                .andExpect(jsonPath("$.riskName").value("Manual Name"));
    }

    @Test
    void testDeleteRisk_success() throws Exception {
        Risk existing = Risk.builder().id(100L).project(project).build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(riskRepository.findById(100L)).thenReturn(Optional.of(existing));

        mockMvc.perform(delete("/api/projects/1/risks/100"))
                .andExpect(status().isOk());

        verify(riskRepository, times(1)).delete(existing);
    }

    @Test
    void testBatchUpdateRisks() throws Exception {
        Risk existing = Risk.builder().id(100L).project(project).build();
        Risk request = Risk.builder().id(100L).threatAgent("Updater").build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(riskRepository.findById(100L)).thenReturn(Optional.of(existing));
        when(riskRepository.findByProjectId(1L)).thenReturn(List.of(existing));

        mockMvc.perform(put("/api/projects/1/risks/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(request))))
                .andExpect(status().isOk());

        verify(riskRepository, times(1)).save(existing);
    }

    @Test
    void testAttackPaths_addAndDelete() throws Exception {
        Risk risk = Risk.builder()
                .id(100L)
                .riskAttackPaths(new ArrayList<>())
                .project(project)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(riskRepository.findById(100L)).thenReturn(Optional.of(risk));
        when(riskRepository.save(any(Risk.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Create attack path
        mockMvc.perform(post("/api/projects/1/risks/100/attack-paths"))
                .andExpect(status().isOk());

        assertEquals(1, risk.getRiskAttackPaths().size());
        RiskAttackPath path = risk.getRiskAttackPaths().get(0);
        path.setId(10L); // set mock ID

        // Delete attack path
        mockMvc.perform(delete("/api/projects/1/risks/100/attack-paths/10"))
                .andExpect(status().isOk());

        assertTrue(risk.getRiskAttackPaths().isEmpty());
    }

    @Test
    void testVulnerabilityRefs_addAndDelete() throws Exception {
        RiskAttackPath path = RiskAttackPath.builder()
                .id(10L)
                .attackPathId(1)
                .vulnerabilityRefs(new ArrayList<>())
                .build();

        Risk risk = Risk.builder()
                .id(100L)
                .riskAttackPaths(new ArrayList<>(List.of(path)))
                .project(project)
                .build();

        Vulnerability vuln = Vulnerability.builder()
                .id(300L)
                .vulnerabilityName("SQL injection")
                .cveScore(8.8)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(riskRepository.findById(100L)).thenReturn(Optional.of(risk));
        when(vulnerabilityRepository.findById(300L)).thenReturn(Optional.of(vuln));
        when(riskRepository.save(any(Risk.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Add vulnerability to attack path
        mockMvc.perform(post("/api/projects/1/risks/100/attack-paths/10/vulnerabilities?vulnerabilityId=300"))
                .andExpect(status().isOk());

        assertEquals(1, path.getVulnerabilityRefs().size());
        RiskVulnerabilityRef ref = path.getVulnerabilityRefs().get(0);
        assertEquals(9.0, ref.getScore()); // Math.round(8.8) = 9.0
        assertEquals("SQL injection", ref.getName());
        ref.setId(50L); // mock ID

        // Delete vulnerability ref
        mockMvc.perform(delete("/api/projects/1/risks/100/attack-paths/10/vulnerabilities/50"))
                .andExpect(status().isOk());

        assertTrue(path.getVulnerabilityRefs().isEmpty());
    }

    @Test
    void testMitigations_crud() throws Exception {
        Risk risk = Risk.builder()
                .id(100L)
                .riskMitigations(new ArrayList<>())
                .project(project)
                .build();

        RiskMitigation requestMit = RiskMitigation.builder()
                .description("Mitigation desc")
                .benefits(10.0)
                .cost(5.0)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(riskRepository.findById(100L)).thenReturn(Optional.of(risk));
        when(riskRepository.save(any(Risk.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // 1. Create
        mockMvc.perform(post("/api/projects/1/risks/100/mitigations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestMit)))
                .andExpect(status().isOk());

        assertEquals(1, risk.getRiskMitigations().size());
        RiskMitigation createdMit = risk.getRiskMitigations().get(0);
        assertEquals("Mitigation desc", createdMit.getDescription());
        createdMit.setId(20L); // mock ID

        // 2. Update
        RiskMitigation updateMit = RiskMitigation.builder()
                .description("Updated Mitigation desc")
                .benefits(20.0)
                .cost(10.0)
                .build();

        mockMvc.perform(put("/api/projects/1/risks/100/mitigations/20")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateMit)))
                .andExpect(status().isOk());

        assertEquals("Updated Mitigation desc", createdMit.getDescription());
        assertEquals(20, createdMit.getBenefits());

        // 3. Delete
        mockMvc.perform(delete("/api/projects/1/risks/100/mitigations/20"))
                .andExpect(status().isOk());

        assertTrue(risk.getRiskMitigations().isEmpty());
    }
}
