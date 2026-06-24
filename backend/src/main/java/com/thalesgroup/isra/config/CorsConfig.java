package com.thalesgroup.isra.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

  @Value("${isra.cors.allowed-origins:http://localhost:4200,http://localhost:4201}")
  private String allowedOrigins;

  @Bean
  public WebMvcConfigurer corsConfigurer() {
    final String[] origins = allowedOrigins.split("\\s*,\\s*");
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(origins)
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Content-Disposition")
            .allowCredentials(false)
            .maxAge(3600);
      }
    };
  }
}
