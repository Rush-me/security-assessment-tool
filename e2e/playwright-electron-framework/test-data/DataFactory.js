const { v4: uuidv4 } = require("uuid");

function project(overrides = {}) {
  return {
    name: `AutoProject-${uuidv4().slice(0, 8)}`,
    organization: "GlobalOrg",
    classification: "CONFIDENTIAL",
    ...overrides
  };
}

function businessAsset(overrides = {}) {
  return {
    name: `Asset-${uuidv4().slice(0, 6)}`,
    type: "SYSTEM",
    criticality: 4,
    c: 8,
    i: 7,
    a: 9,
    ...overrides
  };
}

function vulnerability(overrides = {}) {
  return {
    name: `Vuln-${uuidv4().slice(0, 6)}`,
    cve: "CVE-2024-0001",
    cvss: 8.5,
    description: "Input validation issue",
    ...overrides
  };
}

function risk(overrides = {}) {
  return {
    asset: "DatabaseServer",
    threat: "HACKER",
    vulnerability: "SQL Injection",
    threatFactor: 7,
    occurrence: 3,
    c: 8,
    i: 6,
    a: 9,
    ...overrides
  };
}

module.exports = {
  project,
  businessAsset,
  vulnerability,
  risk
};
