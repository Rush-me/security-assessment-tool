package com.thalesgroup.isra.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalesgroup.isra.model.User;
import com.thalesgroup.isra.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void testRegister_validationErrors() throws Exception {
        // Username too short
        Map<String, String> request = new HashMap<>();
        request.put("username", "ab");
        request.put("email", "test@test.com");
        request.put("password", "password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        // Invalid email
        request.put("username", "user123");
        request.put("email", "invalid-email");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        // Password too short
        request.put("email", "test@test.com");
        request.put("password", "123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testRegister_usernameTaken() throws Exception {
        Map<String, String> request = Map.of(
                "username", "takenUser",
                "email", "new@test.com",
                "password", "password123"
        );

        when(userRepository.existsByUsername("takenUser")).thenReturn(true);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void testRegister_emailRegistered() throws Exception {
        Map<String, String> request = Map.of(
                "username", "newUser",
                "email", "taken@test.com",
                "password", "password123"
        );

        when(userRepository.existsByUsername("newUser")).thenReturn(false);
        when(userRepository.existsByEmail("taken@test.com")).thenReturn(true);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void testRegister_success() throws Exception {
        Map<String, String> request = Map.of(
                "username", "newUser",
                "email", "new@test.com",
                "password", "password123"
        );

        when(userRepository.existsByUsername("newUser")).thenReturn(false);
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newUser"))
                .andExpect(jsonPath("$.email").value("new@test.com"));

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testLogin_missingCredentials() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("username", null);
        request.put("password", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLogin_userNotFound() throws Exception {
        Map<String, String> request = Map.of(
                "username", "nonExistent",
                "password", "password123"
        );

        when(userRepository.findByUsername("nonExistent")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLogin_invalidPassword() throws Exception {
        Map<String, String> request = Map.of(
                "username", "validUser",
                "password", "wrongPassword"
        );

        User mockUser = User.builder()
                .username("validUser")
                .passwordHash(passwordEncoder.encode("correctPassword"))
                .build();

        when(userRepository.findByUsername("validUser")).thenReturn(Optional.of(mockUser));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLogin_success() throws Exception {
        Map<String, String> request = Map.of(
                "username", "validUser",
                "password", "correctPassword"
        );

        User mockUser = User.builder()
                .username("validUser")
                .email("valid@test.com")
                .role("USER")
                .passwordHash(passwordEncoder.encode("correctPassword"))
                .build();

        when(userRepository.findByUsername("validUser")).thenReturn(Optional.of(mockUser));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("validUser"))
                .andExpect(jsonPath("$.email").value("valid@test.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void testMe_withUsernameHeader_found() throws Exception {
        User mockUser = User.builder()
                .username("someUser")
                .email("some@test.com")
                .role("USER")
                .build();

        when(userRepository.findByUsername("someUser")).thenReturn(Optional.of(mockUser));

        mockMvc.perform(get("/api/auth/me")
                        .header("X-Username", "someUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("someUser"))
                .andExpect(jsonPath("$.email").value("some@test.com"));
    }

    @Test
    void testMe_withUsernameHeader_notFound() throws Exception {
        when(userRepository.findByUsername("unknownUser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/auth/me")
                        .header("X-Username", "unknownUser"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testMe_withoutUsernameHeader_fallback() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("default-owner"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
