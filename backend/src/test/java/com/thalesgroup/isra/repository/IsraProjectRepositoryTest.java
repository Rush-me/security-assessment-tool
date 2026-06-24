package com.thalesgroup.isra.repository;

import com.thalesgroup.isra.model.IsraProject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class IsraProjectRepositoryTest {

    @Autowired
    private IsraProjectRepository israProjectRepository;

    @Test
    void testSaveAndFindByOwnerOid() {
        IsraProject project1 = IsraProject.builder()
                .projectName("Project 1")
                .ownerOid("owner-1")
                .build();

        IsraProject project2 = IsraProject.builder()
                .projectName("Project 2")
                .ownerOid("owner-1")
                .build();

        israProjectRepository.save(project1);
        israProjectRepository.save(project2);

        List<IsraProject> owned = israProjectRepository.findByOwnerOid("owner-1");
        assertEquals(2, owned.size());

        List<IsraProject> owned2 = israProjectRepository.findByOwnerOid("owner-2");
        assertTrue(owned2.isEmpty());
    }
}
