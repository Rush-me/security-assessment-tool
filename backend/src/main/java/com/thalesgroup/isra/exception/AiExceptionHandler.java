package com.thalesgroup.isra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class AiExceptionHandler {

    @ExceptionHandler(AiUnavailableException.class)
    public ResponseEntity<?> handleAiUnavailable(AiUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "error", "AI service is currently unavailable",
                        "message", ex.getMessage()
                ));
    }

    @ExceptionHandler(GeminiApiException.class)
    public ResponseEntity<?> handleGeminiApi(GeminiApiException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of(
                        "error", "Gemini API integration failure",
                        "message", ex.getMessage()
                ));
    }
}
