package com.thalesgroup.isra.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class IsraProjectTest {

    @Test
    void testGetterSetterAndBuilder() {
        IsraProjectContext context = new IsraProjectContext();
        IsraProject project = IsraProject.builder()
                .id(1L)
                .projectName("Test Project")
                .projectVersion("1.0")
                .projectOrganization("Thales")
                .classification("Restricted")
                .schemaVersion(1)
                .iteration(1)
                .ownerOid("user-123")
                .ownerName("John Doe")
                .projectContext(context)
                .trackingList(new ArrayList<>())
                .businessAssets(new ArrayList<>())
                .supportingAssets(new ArrayList<>())
                .vulnerabilities(new ArrayList<>())
                .risks(new ArrayList<>())
                .build();

        assertEquals(1L, project.getId());
        assertEquals("Test Project", project.getProjectName());
        assertEquals("1.0", project.getProjectVersion());
        assertEquals("Thales", project.getProjectOrganization());
        assertEquals("Restricted", project.getClassification());
        assertEquals(1, project.getSchemaVersion());
        assertEquals(1, project.getIteration());
        assertEquals("user-123", project.getOwnerOid());
        assertEquals("John Doe", project.getOwnerName());
        assertEquals(context, project.getProjectContext());
        assertNotNull(project.getTrackingList());
        assertNotNull(project.getBusinessAssets());
        assertNotNull(project.getSupportingAssets());
        assertNotNull(project.getVulnerabilities());
        assertNotNull(project.getRisks());

        // Test setter
        project.setProjectName("Updated Project");
        assertEquals("Updated Project", project.getProjectName());
    }

    @Test
    void testPrePersistAndPreUpdate() {
        IsraProject project = new IsraProject();
        assertNull(project.getCreatedAt());
        assertNull(project.getUpdatedAt());

        project.onCreate();
        assertNotNull(project.getCreatedAt());
        assertNotNull(project.getUpdatedAt());

        LocalDateTime created = project.getCreatedAt();
        LocalDateTime updated = project.getUpdatedAt();

        // Simulate some delay and update
        project.onUpdate();
        assertNotNull(project.getUpdatedAt());
        assertEquals(created, project.getCreatedAt());
    }
}
