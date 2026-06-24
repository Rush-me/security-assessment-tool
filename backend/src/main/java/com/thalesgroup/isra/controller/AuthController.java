package com.thalesgroup.isra.controller;

import com.thalesgroup.isra.model.User;
import com.thalesgroup.isra.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Real auth controller — username/password stored in H2. No JWT.
 * A simple X-Username header is used for project ownership scoping.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // ── Register ─────────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String username = trim(request.get("username"));
        String email = trim(request.get("email"));
        String password = request.get("password");

        // Validation
        if (username == null || username.length() < 3)
            return ResponseEntity.badRequest().body("Username must be at least 3 characters.");
        if (email == null || !email.contains("@"))
            return ResponseEntity.badRequest().body("A valid email address is required.");
        if (password == null || password.length() < 6)
            return ResponseEntity.badRequest().body("Password must be at least 6 characters.");

        // Uniqueness checks
        if (userRepository.existsByUsername(username))
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken.");
        if (userRepository.existsByEmail(email))
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered.");

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role("USER")
                .build();

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole()));
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = trim(request.get("username"));
        String password = request.get("password");

        if (username == null || password == null)
            return ResponseEntity.badRequest().body("Username and password are required.");

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPasswordHash()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password.");

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole()));
    }

    // ── Current user (mock-compatible fallback) ───────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "X-Username", required = false) String username) {
        if (username != null && !username.isBlank()) {
            return userRepository.findByUsername(username)
                    .map(u -> ResponseEntity.ok(Map.of(
                            "username", u.getUsername(),
                            "email", u.getEmail(),
                            "role", u.getRole())))
                    .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }
        // Fallback for open-access mode (no header)
        return ResponseEntity.ok(Map.of(
                "username", "default-owner",
                "email", "default-owner@example.com",
                "role", "ADMIN"));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String trim(String s) {
        return s == null ? null : s.trim();
    }
}
