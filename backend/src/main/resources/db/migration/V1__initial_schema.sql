-- ============================================================
-- ISRA Database Schema - V1 (initial schema)
-- ============================================================

-- Create ISRA Projects table
-- Ownership is tracked via Azure AD Object ID (owner_oid) instead of a local users FK.
CREATE TABLE isra_projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_version VARCHAR(100),
    project_organization VARCHAR(255),
    classification VARCHAR(255),
    schema_version INT DEFAULT 1,
    iteration INT DEFAULT 1,
    owner_oid VARCHAR(100) NOT NULL,      -- Azure AD Object ID (oid claim)
    owner_name VARCHAR(255),              -- Azure AD preferred_username (display only)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ISRA Tracking table
CREATE TABLE isra_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    tracking_iteration INT NOT NULL,
    tracking_date DATE,
    tracking_comment TEXT,
    FOREIGN KEY (project_id) REFERENCES isra_projects(id) ON DELETE CASCADE
);

-- Create ISRA Project Contexts table
CREATE TABLE isra_project_contexts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL UNIQUE,
    project_description LONGTEXT,
    project_url VARCHAR(512),
    project_description_attachment_path VARCHAR(512),
    security_project_objectives LONGTEXT,
    security_officer_objectives LONGTEXT,
    security_assumptions LONGTEXT,
    FOREIGN KEY (project_id) REFERENCES isra_projects(id) ON DELETE CASCADE
);

-- Create Business Assets table
CREATE TABLE business_assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    asset_id INT NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100),
    asset_description LONGTEXT,
    confidentiality INT DEFAULT 0,
    integrity INT DEFAULT 0,
    availability INT DEFAULT 0,
    authenticity INT DEFAULT 0,
    authorization INT DEFAULT 0,
    non_repudiation INT DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES isra_projects(id) ON DELETE CASCADE
);

-- Create Supporting Assets table
CREATE TABLE supporting_assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    asset_id INT NOT NULL,
    hld_id VARCHAR(100),
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100),
    security_level INT DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES isra_projects(id) ON DELETE CASCADE
);

-- Create Supporting-Business Asset Map (Many-to-Many)
CREATE TABLE supporting_business_assets (
    supporting_asset_id BIGINT NOT NULL,
    business_asset_id BIGINT NOT NULL,
    PRIMARY KEY (supporting_asset_id, business_asset_id),
    FOREIGN KEY (supporting_asset_id) REFERENCES supporting_assets(id) ON DELETE CASCADE,
    FOREIGN KEY (business_asset_id) REFERENCES business_assets(id) ON DELETE CASCADE
);

-- Create Vulnerabilities table
CREATE TABLE vulnerabilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    vulnerability_id INT NOT NULL,
    vulnerability_name VARCHAR(255) NOT NULL,
    vulnerability_family VARCHAR(100),
    tracking_id VARCHAR(100),
    tracking_uri VARCHAR(512),
    vulnerability_description LONGTEXT,
    description_attachment_path VARCHAR(512),
    cve VARCHAR(100),
    cve_score DOUBLE,
    overall_score INT,
    overall_level VARCHAR(50),
    FOREIGN KEY (project_id) REFERENCES isra_projects(id) ON DELETE CASCADE
);

-- Create Vulnerability-Supporting Asset Map (Many-to-Many)
CREATE TABLE vulnerability_supporting_assets (
    vulnerability_id BIGINT NOT NULL,
    supporting_asset_id BIGINT NOT NULL,
    PRIMARY KEY (vulnerability_id, supporting_asset_id),
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    FOREIGN KEY (supporting_asset_id) REFERENCES supporting_assets(id) ON DELETE CASCADE
);

-- Create Risks table
CREATE TABLE risks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    risk_id INT NOT NULL,
    risk_name VARCHAR(512) NOT NULL,
    threat_agent VARCHAR(255),
    threat_agent_detail LONGTEXT,
    threat_verb VARCHAR(255),
    threat_verb_detail LONGTEXT,
    motivation VARCHAR(255),
    motivation_detail LONGTEXT,
    business_asset_ref BIGINT,
    supporting_asset_ref BIGINT,
    is_automatic_risk_name BOOLEAN DEFAULT TRUE,

    -- Likelihood Evaluator
    risk_likelihood INT,
    risk_likelihood_detail LONGTEXT,
    skill_level INT,
    reward INT,
    access_resources INT,
    size INT,
    intrusion_detection INT,
    threat_factor_score DOUBLE,
    threat_factor_level VARCHAR(50),
    occurrence INT,
    occurrence_level VARCHAR(50),
    is_owasp_likelihood BOOLEAN DEFAULT TRUE,

    -- Impact Evaluator
    risk_impact INT,
    confidentiality_flag INT DEFAULT 0,
    integrity_flag INT DEFAULT 0,
    availability_flag INT DEFAULT 0,
    authenticity_flag INT DEFAULT 0,
    authorization_flag INT DEFAULT 0,
    non_repudiation_flag INT DEFAULT 0,

    -- Inherent Score
    all_attack_paths_name VARCHAR(512),
    all_attack_paths_score DOUBLE,
    inherent_risk_score DOUBLE,

    -- Mitigation Benefits
    mitigations_benefits DOUBLE,
    mitigations_done_benefits DOUBLE,
    mitigated_risk_score DOUBLE,

    -- Risk Management Decision
    risk_management_decision VARCHAR(100),
    risk_management_detail LONGTEXT,
    residual_risk_score DOUBLE,
    residual_risk_level VARCHAR(50),

    FOREIGN KEY (project_id) REFERENCES isra_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (business_asset_ref) REFERENCES business_assets(id) ON DELETE SET NULL,
    FOREIGN KEY (supporting_asset_ref) REFERENCES supporting_assets(id) ON DELETE SET NULL
);

-- Create Risk Attack Paths table
CREATE TABLE risk_attack_paths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    risk_id BIGINT NOT NULL,
    attack_path_id INT NOT NULL,
    attack_path_name VARCHAR(512),
    attack_path_score DOUBLE,
    FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
);

-- Create Risk Vulnerability Ref table (Many-to-Many mapped attributes)
CREATE TABLE risk_vulnerability_refs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attack_path_id BIGINT NOT NULL,
    vulnerability_id BIGINT NOT NULL,
    score DOUBLE,
    name VARCHAR(255),
    FOREIGN KEY (attack_path_id) REFERENCES risk_attack_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(id) ON DELETE CASCADE
);

-- Create Risk Mitigations table
CREATE TABLE risk_mitigations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    risk_id BIGINT NOT NULL,
    mitigation_id INT NOT NULL,
    description LONGTEXT,
    benefits DOUBLE,
    cost DOUBLE,
    decision VARCHAR(100),
    decision_detail LONGTEXT,
    FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
);

CREATE INDEX idx_owner_oid ON isra_projects (owner_oid);
