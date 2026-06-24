package com.thalesgroup.isra.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalesgroup.isra.model.IsraProject;
import com.thalesgroup.isra.model.IsraProjectContext;
import com.thalesgroup.isra.repository.IsraProjectRepository;
import com.thalesgroup.isra.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class IsraProjectControllerTest {

    private MockMvc mockMvc;

    @Mock
    private IsraProjectRepository projectRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private IsraProjectController israProjectController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private IsraProject project;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(israProjectController).build();

        project = IsraProject.builder()
                .id(1L)
                .projectName("Project A")
                .projectVersion("1.0")
                .projectOrganization("Thales")
                .classification("Restricted")
                .schemaVersion(1)
                .iteration(1)
                .ownerOid("default-owner-oid")
                .ownerName("default-owner")
                .build();
    }

    @Test
    void testGetAllProjects_noHeader() throws Exception {
        when(projectRepository.findAll()).thenReturn(List.of(project));

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectName").value("Project A"))
                .andExpect(jsonPath("$[0].ownerOid").value("default-owner-oid"));
    }

    @Test
    void testGetAllProjects_withHeader() throws Exception {
        IsraProject customProject = IsraProject.builder()
                .id(2L)
                .projectName("Project B")
                .ownerOid("custom-user")
                .build();

        when(projectRepository.findByOwnerOid("custom-user")).thenReturn(List.of(customProject));

        mockMvc.perform(get("/api/projects")
                        .header("X-Username", "custom-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectName").value("Project B"))
                .andExpect(jsonPath("$[0].ownerOid").value("custom-user"));
    }

    @Test
    void testGetProjectById_success() throws Exception {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        mockMvc.perform(get("/api/projects/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectName").value("Project A"));
    }

    @Test
    void testCreateProject_withoutHeaderAndNoContext() throws Exception {
        IsraProject request = IsraProject.builder().projectName("New Project").build();
        IsraProject saved = IsraProject.builder()
                .id(5L)
                .projectName("New Project")
                .ownerOid("default-owner-oid")
                .ownerName("default-owner")
                .projectContext(new IsraProjectContext())
                .build();

        when(projectRepository.save(any(IsraProject.class))).thenReturn(saved);

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.ownerOid").value("default-owner-oid"));
    }

    @Test
    void testUpdateProject_success() throws Exception {
        IsraProject updateRequest = IsraProject.builder()
                .projectName("Updated Project")
                .projectVersion("1.1")
                .projectOrganization("New Thales")
                .classification("Confidential")
                .schemaVersion(2)
                .iteration(2)
                .build();

        IsraProject updated = IsraProject.builder()
                .id(1L)
                .projectName("Updated Project")
                .projectVersion("1.1")
                .projectOrganization("New Thales")
                .classification("Confidential")
                .schemaVersion(2)
                .iteration(2)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(IsraProject.class))).thenReturn(updated);

        mockMvc.perform(put("/api/projects/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectName").value("Updated Project"))
                .andExpect(jsonPath("$.iteration").value(2));
    }

    @Test
    void testDeleteProject_success() throws Exception {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        mockMvc.perform(delete("/api/projects/1"))
                .andExpect(status().isOk());

        verify(projectRepository, times(1)).delete(project);
    }

    @Test
    void testUpdateProjectContext_success() throws Exception {
        IsraProjectContext contextRequest = IsraProjectContext.builder()
                .projectDescription("Description of project")
                .projectUrl("http://example.com")
                .securityProjectObjectives("Objective 1")
                .build();

        IsraProject projectWithContext = IsraProject.builder()
                .id(1L)
                .projectContext(contextRequest)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(IsraProject.class))).thenReturn(projectWithContext);

        mockMvc.perform(put("/api/projects/1/context")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contextRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testUploadContextAttachment_success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", MediaType.TEXT_PLAIN_VALUE, "Hello".getBytes());

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(fileStorageService.storeFile(file)).thenReturn("/stored/path/test.txt");
        when(projectRepository.save(any(IsraProject.class))).thenReturn(project);

        mockMvc.perform(multipart("/api/projects/1/context/attachment").file(file))
                .andExpect(status().isOk());

        verify(fileStorageService, times(1)).storeFile(file);
    }

    @Test
    void testDownloadContextAttachment_success() throws Exception {
        IsraProjectContext context = IsraProjectContext.builder()
                .projectDescriptionAttachmentPath("/stored/path/test.txt")
                .build();
        project.setProjectContext(context);

        Resource resource = new ByteArrayResource("Hello Content".getBytes()) {
            @Override
            public String getFilename() {
                return "test.txt";
            }
        };

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(fileStorageService.loadFileAsResource("/stored/path/test.txt")).thenReturn(resource);

        mockMvc.perform(get("/api/projects/1/context/attachment"))
                .andExpect(status().isOk())
                .andExpect(status().isOk());
    }

    @Test
    void testDownloadContextAttachment_notFound() throws Exception {
        project.setProjectContext(null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        mockMvc.perform(get("/api/projects/1/context/attachment"))
                .andExpect(status().isNotFound());
    }
}
