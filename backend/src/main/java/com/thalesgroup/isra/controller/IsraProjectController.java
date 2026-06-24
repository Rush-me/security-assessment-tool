package com.thalesgroup.isra.controller;

import com.thalesgroup.isra.model.*;
import com.thalesgroup.isra.repository.IsraProjectRepository;
import com.thalesgroup.isra.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class IsraProjectController {

    private final IsraProjectRepository projectRepository;
    private final FileStorageService fileStorageService;

    public IsraProjectController(IsraProjectRepository projectRepository,
                                 FileStorageService fileStorageService) {
        this.projectRepository = projectRepository;
        this.fileStorageService = fileStorageService;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Resolve owner OID from X-Username header (falls back to "default-owner-oid"). */
    private String resolveOwnerOid(String username) {
        if (username != null && !username.isBlank()) return username;
        return "default-owner-oid";
    }

    private IsraProject getOwnedProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<IsraProject>> getAllProjects(
            @RequestHeader(value = "X-Username", required = false) String username) {
        String ownerOid = resolveOwnerOid(username);
        List<IsraProject> projects = "default-owner-oid".equals(ownerOid)
                ? projectRepository.findAll()
                : projectRepository.findByOwnerOid(ownerOid);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IsraProject> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(getOwnedProject(id));
    }

    @PostMapping
    public ResponseEntity<IsraProject> createProject(
            @RequestBody IsraProject projectRequest,
            @RequestHeader(value = "X-Username", required = false) String username) {

        String ownerOid = resolveOwnerOid(username);
        projectRequest.setOwnerOid(ownerOid);
        projectRequest.setOwnerName(username != null ? username : "default-owner");

        if (projectRequest.getProjectContext() == null) {
            IsraProjectContext context = new IsraProjectContext();
            context.setProject(projectRequest);
            projectRequest.setProjectContext(context);
        } else {
            projectRequest.getProjectContext().setProject(projectRequest);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectRepository.save(projectRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IsraProject> updateProject(@PathVariable Long id,
                                                      @RequestBody IsraProject projectRequest) {
        IsraProject existing = getOwnedProject(id);
        existing.setProjectName(projectRequest.getProjectName());
        existing.setProjectVersion(projectRequest.getProjectVersion());
        existing.setProjectOrganization(projectRequest.getProjectOrganization());
        existing.setClassification(projectRequest.getClassification());
        existing.setSchemaVersion(projectRequest.getSchemaVersion());
        existing.setIteration(projectRequest.getIteration());
        return ResponseEntity.ok(projectRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectRepository.delete(getOwnedProject(id));
        return ResponseEntity.ok().build();
    }

    // ── Project Context ───────────────────────────────────────────────────────

    @PutMapping("/{id}/context")
    public ResponseEntity<IsraProject> updateProjectContext(@PathVariable Long id,
                                                             @RequestBody IsraProjectContext contextRequest) {
        IsraProject project = getOwnedProject(id);
        IsraProjectContext context = project.getProjectContext();
        if (context == null) {
            context = new IsraProjectContext();
            context.setProject(project);
            project.setProjectContext(context);
        }
        context.setProjectDescription(contextRequest.getProjectDescription());
        context.setProjectUrl(contextRequest.getProjectUrl());
        context.setSecurityProjectObjectives(contextRequest.getSecurityProjectObjectives());
        context.setSecurityOfficerObjectives(contextRequest.getSecurityOfficerObjectives());
        context.setSecurityAssumptions(contextRequest.getSecurityAssumptions());
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @PostMapping("/{id}/context/attachment")
    public ResponseEntity<IsraProject> uploadContextAttachment(@PathVariable Long id,
                                                                @RequestParam("file") MultipartFile file) {
        IsraProject project = getOwnedProject(id);
        String path = fileStorageService.storeFile(file);
        IsraProjectContext context = project.getProjectContext();
        if (context == null) {
            context = new IsraProjectContext();
            context.setProject(project);
            project.setProjectContext(context);
        }
        context.setProjectDescriptionAttachmentPath(path);
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @GetMapping("/{id}/context/attachment")
    public ResponseEntity<Resource> downloadContextAttachment(@PathVariable Long id) {
        IsraProject project = getOwnedProject(id);
        IsraProjectContext context = project.getProjectContext();
        if (context == null || context.getProjectDescriptionAttachmentPath() == null) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = fileStorageService.loadFileAsResource(context.getProjectDescriptionAttachmentPath());
        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(Paths.get(context.getProjectDescriptionAttachmentPath()));
        } catch (IOException ignored) {}
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
