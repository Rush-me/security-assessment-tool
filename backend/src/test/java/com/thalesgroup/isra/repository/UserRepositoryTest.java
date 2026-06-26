package com.thalesgroup.isra.repository;

import com.thalesgroup.isra.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveAndFindOperations() {
        User user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashed")
                .role("USER")
                .build();

        User saved = userRepository.save(user);
        assertNotNull(saved.getId());

        Optional<User> byUsername = userRepository.findByUsername("testuser");
        assertTrue(byUsername.isPresent());
        assertEquals("test@example.com", byUsername.get().getEmail());

        Optional<User> byEmail = userRepository.findByEmail("test@example.com");
        assertTrue(byEmail.isPresent());

        assertTrue(userRepository.existsByUsername("testuser"));
        assertFalse(userRepository.existsByUsername("nonexistent"));

        assertTrue(userRepository.existsByEmail("test@example.com"));
        assertFalse(userRepository.existsByEmail("other@example.com"));
    }
}
