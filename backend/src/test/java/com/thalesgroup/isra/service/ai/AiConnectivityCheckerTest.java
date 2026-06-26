package com.thalesgroup.isra.service.ai;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import static org.junit.jupiter.api.Assertions.*;

class AiConnectivityCheckerTest {

    private HttpServer server;
    private int port;
    private AiConnectivityChecker connectivityChecker;

    @BeforeEach
    void setUp() throws IOException {
        // Spin up a tiny JDK HttpServer on a dynamic port
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/", exchange -> {
            byte[] response = "OK".getBytes();
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });
        server.start();
        port = server.getAddress().getPort();
    }

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void isOnline_whenServerIsRunning_returnsTrue() {
        connectivityChecker = new AiConnectivityChecker("http://localhost:" + port);
        assertTrue(connectivityChecker.isOnline());
    }

    @Test
    void isOnline_whenServerIsStopped_returnsFalse() {
        server.stop(0);
        connectivityChecker = new AiConnectivityChecker("http://localhost:" + port);
        assertFalse(connectivityChecker.isOnline());
    }

    @Test
    void isOnline_withInvalidUrl_returnsFalse() {
        connectivityChecker = new AiConnectivityChecker("invalid-url-string");
        assertFalse(connectivityChecker.isOnline());
    }

    @Test
    void isOnline_cachingBehavior() {
        connectivityChecker = new AiConnectivityChecker("http://localhost:" + port);
        
        // First check: should call server and return true
        assertTrue(connectivityChecker.isOnline());

        // Stop server immediately
        server.stop(0);

        // Second check (within cache TTL of 10s): should return cached value (true)
        assertTrue(connectivityChecker.isOnline());

        // Force check: should bypass cache, try to call stopped server, and return false
        assertFalse(connectivityChecker.isOnline(true));
    }
}
