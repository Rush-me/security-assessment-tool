package com.thalesgroup.isra.service.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class AiConnectivityChecker {

    private final String checkUrl;
    private volatile Boolean lastStatus = null;
    private volatile long lastCheckTime = 0;
    private static final long CACHE_TTL_MS = 10000; // 10 seconds

    public AiConnectivityChecker(@Value("${isra.ai.health-check-url:https://generativelanguage.googleapis.com}") String checkUrl) {
        this.checkUrl = checkUrl;
    }

    public boolean isOnline() {
        return isOnline(false);
    }

    public boolean isOnline(boolean forceRefresh) {
        if (!forceRefresh) {
            long now = System.currentTimeMillis();
            if (lastStatus != null && (now - lastCheckTime) < CACHE_TTL_MS) {
                return lastStatus;
            }
        }
        return doCheck(forceRefresh);
    }

    private synchronized boolean doCheck(boolean forceRefresh) {
        // Double-checked locking: re-evaluate cache inside synchronized block
        if (!forceRefresh) {
            long now = System.currentTimeMillis();
            if (lastStatus != null && (now - lastCheckTime) < CACHE_TTL_MS) {
                return lastStatus;
            }
        }

        try {
            URL url = new URL(checkUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(2000); // 2 seconds connect timeout for status check
            conn.setReadTimeout(2000);
            conn.setRequestMethod("GET");
            int responseCode = conn.getResponseCode();
            // Any response code indicates connectivity to the endpoint
            lastStatus = (responseCode > 0);
        } catch (Exception e) {
            lastStatus = false;
        }

        lastCheckTime = System.currentTimeMillis();
        return lastStatus;
    }
}
