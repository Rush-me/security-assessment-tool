class WorldContext {
  constructor() {
    this.data = {
      projectId: null,
      assessmentId: null,
      assetIds: [],
      supportingAssetIds: [],
      threatIds: [],
      vulnerabilityIds: [],
      riskIds: [],
      mitigationIds: [],
      responses: {},
      runtime: {}
    };
  }

  set(key, value) {
    this.data[key] = value;
  }

  get(key) {
    return this.data[key];
  }

  push(key, value) {
    if (!Array.isArray(this.data[key])) {
      this.data[key] = [];
    }
    this.data[key].push(value);
  }

  reset() {
    this.data = {
      projectId: null,
      assessmentId: null,
      assetIds: [],
      supportingAssetIds: [],
      threatIds: [],
      vulnerabilityIds: [],
      riskIds: [],
      mitigationIds: [],
      responses: {},
      runtime: {}
    };
  }
}

module.exports = WorldContext;
