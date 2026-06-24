const ApiClient = require("./ApiClient");

class AssessmentApi {
  constructor(client = new ApiClient()) {
    this.client = client;
  }

  async createProject(payload) {
    return this.client.post("/api/projects", payload);
  }

  async listProjects() {
    return this.client.get("/api/projects");
  }

  async deleteProject(projectId) {
    return this.client.delete(`/api/projects/${projectId}`);
  }

  async finalizeAssessment(assessmentId) {
    return this.client.post(`/api/assessments/${assessmentId}/finalize`);
  }
}

module.exports = AssessmentApi;
