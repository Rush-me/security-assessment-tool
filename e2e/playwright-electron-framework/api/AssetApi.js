const ApiClient = require("./ApiClient");

class AssetApi {
  constructor(client = new ApiClient()) {
    this.client = client;
  }

  async createBusinessAsset(projectId, payload) {
    return this.client.post(`/api/projects/${projectId}/business-assets`, payload);
  }

  async createSupportingAsset(projectId, payload) {
    return this.client.post(`/api/projects/${projectId}/supporting-assets`, payload);
  }

  async deleteBusinessAsset(assetId) {
    return this.client.delete(`/api/business-assets/${assetId}`);
  }
}

module.exports = AssetApi;
