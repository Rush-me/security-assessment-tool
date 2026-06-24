package com.thalesgroup.isra.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AiExceptionHandlerTest {

    private MockMvc mockMvc;

    @RestController
    static class TestController {
        @GetMapping("/trigger-ai-unavailable")
        public void triggerAiUnavailable() {
            throw new AiUnavailableException("AI is down");
        }

        @GetMapping("/trigger-gemini-api")
        public void triggerGeminiApi() {
            throw new GeminiApiException("Gemini API failed");
        }
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new AiExceptionHandler())
                .build();
    }

    @Test
    void testHandleAiUnavailable() throws Exception {
        mockMvc.perform(get("/trigger-ai-unavailable"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("AI service is currently unavailable"))
                .andExpect(jsonPath("$.message").value("AI is down"));
    }

    @Test
    void testHandleGeminiApi() throws Exception {
        mockMvc.perform(get("/trigger-gemini-api"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("Gemini API integration failure"))
                .andExpect(jsonPath("$.message").value("Gemini API failed"));
    }

    @Test
    void testDirectInvocation() {
        AiExceptionHandler handler = new AiExceptionHandler();
        
        ResponseEntity<?> responseUnavailable = handler.handleAiUnavailable(new AiUnavailableException("Direct down"));
        assertEquals(503, responseUnavailable.getStatusCode().value());
        assertNotNull(responseUnavailable.getBody());
        
        ResponseEntity<?> responseGemini = handler.handleGeminiApi(new GeminiApiException("Direct Gemini error"));
        assertEquals(502, responseGemini.getStatusCode().value());
        assertNotNull(responseGemini.getBody());
    }
}
