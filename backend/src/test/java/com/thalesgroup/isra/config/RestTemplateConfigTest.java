package com.thalesgroup.isra.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;

class RestTemplateConfigTest {

    @Test
    void restTemplate_createsBeanWithTimeouts() {
        RestTemplateConfig config = new RestTemplateConfig();
        RestTemplate restTemplate = config.restTemplate();

        assertNotNull(restTemplate);
        ClientHttpRequestFactory requestFactory = restTemplate.getRequestFactory();
        assertNotNull(requestFactory);

        if (requestFactory instanceof SimpleClientHttpRequestFactory) {
            SimpleClientHttpRequestFactory simpleFactory = (SimpleClientHttpRequestFactory) requestFactory;
            Object connectTimeout = ReflectionTestUtils.getField(simpleFactory, "connectTimeout");
            Object readTimeout = ReflectionTestUtils.getField(simpleFactory, "readTimeout");

            assertEquals(10000, connectTimeout);
            assertEquals(20000, readTimeout);
        }
    }
}
