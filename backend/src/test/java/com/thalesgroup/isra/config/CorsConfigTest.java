package com.thalesgroup.isra.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CorsConfigTest {

    @Test
    void corsConfigurer_registersMappings() {
        CorsConfig corsConfig = new CorsConfig();
        ReflectionTestUtils.setField(corsConfig, "allowedOrigins", "http://localhost:4200, http://localhost:4201");

        WebMvcConfigurer configurer = corsConfig.corsConfigurer();
        assertNotNull(configurer);

        CorsRegistry registry = mock(CorsRegistry.class);
        CorsRegistration registration = mock(CorsRegistration.class);

        when(registry.addMapping(anyString())).thenReturn(registration);
        when(registration.allowedOrigins(any(String[].class))).thenReturn(registration);
        when(registration.allowedMethods(any(String[].class))).thenReturn(registration);
        when(registration.allowedHeaders(any(String[].class))).thenReturn(registration);
        when(registration.exposedHeaders(any(String[].class))).thenReturn(registration);
        when(registration.allowCredentials(anyBoolean())).thenReturn(registration);
        when(registration.maxAge(anyLong())).thenReturn(registration);

        configurer.addCorsMappings(registry);

        verify(registry).addMapping("/**");
        verify(registration).allowedOrigins(new String[]{"http://localhost:4200", "http://localhost:4201"});
        verify(registration).allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS");
        verify(registration).allowCredentials(false);
    }
}
