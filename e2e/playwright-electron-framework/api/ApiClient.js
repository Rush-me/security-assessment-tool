const axios = require("axios");
const env = require("../config/env");

class ApiClient {
  constructor(baseURL = env.backendBaseUrl) {
    this.client = axios.create({
      baseURL,
      timeout: env.apiTimeoutMs,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  setAuthToken(token) {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  async get(url, config = {}) {
    return this.withRetry(() => this.client.get(url, config));
  }

  async post(url, data = {}, config = {}) {
    return this.withRetry(() => this.client.post(url, data, config));
  }

  async put(url, data = {}, config = {}) {
    return this.withRetry(() => this.client.put(url, data, config));
  }

  async delete(url, config = {}) {
    return this.withRetry(() => this.client.delete(url, config));
  }

  async withRetry(fn, retries = 2) {
    let lastErr;
    for (let i = 0; i <= retries; i += 1) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr;
  }
}

module.exports = ApiClient;
