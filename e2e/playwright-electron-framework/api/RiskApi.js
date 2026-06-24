const ApiClient = require("./ApiClient");

class RiskApi {
  constructor(client = new ApiClient()) {
    this.client = client;
  }

  async createRisk(assessmentId, payload) {
    return this.client.post(`/api/assessments/${assessmentId}/risks`, payload);
  }

  async updateRisk(riskId, payload) {
    return this.client.put(`/api/risks/${riskId}`, payload);
  }

  async deleteRisk(riskId) {
    return this.client.delete(`/api/risks/${riskId}`);
  }

  async createMitigation(riskId, payload) {
    return this.client.post(`/api/risks/${riskId}/mitigations`, payload);
  }
}

module.exports = RiskApi;
