# ISRA 2.0 - Integrated Security Risk Assessment Tool
## Complete Project Context

**Generated:** 2026-06-24  
**Project Name:** ISRA 2.0 (Integrated Security Risk Assessment)  
**Type:** Electron Desktop Application + Spring Boot Backend  
**Purpose:** ISO 27005-Compliant Security Risk Assessment Platform

---

## 1. PROJECT OVERVIEW

### 1.1 Project Identity
- **Name:** ISRA 2.0
- **Full Name:** Integrated Security Risk Assessment Tool
- **Application Type:** Electron Desktop Application with Spring Boot Backend
- **Target Users:** Security professionals, Risk managers, Compliance officers
- **Business Domain:** Information Security Risk Management

### 1.2 Project Purpose
ISRA 2.0 provides organizations with a comprehensive, ISO 27005-compliant security risk assessment platform that:
- Guides structured security risk assessments through a 7-step wizard workflow
- Automatically calculates risk scores using likelihood × impact methodology
- Manages organizations' assets, threats, vulnerabilities, and risks
- Integrates with Google Gemini AI for intelligent threat/vulnerability suggestions
- Generates comprehensive HTML/PDF assessment reports
- Tracks risk mitigations and residual risk reduction

### 1.3 Technology Stack

**Frontend:**
- Angular 18 (Signals-based reactive framework)
- Material Design Components
- TypeScript 5.x
- Reactive Forms & RxJS
- SCSS for styling
- Webpack bundling

**Backend:**
- Java 17 LTS
- Spring Boot 3.3.x
- Spring Data JPA
- Lombok (boilerplate reduction)
- Google Gemini API client
- H2 Database (embedded)

**Desktop:**
- Electron 31.x (Desktop wrapper)
- Node.js runtime
- JRE bundled (for Spring Boot execution)

**Database:**
- H2 Database (file-based, embedded)
- SQL migrations (Flyway/native)
- Single-user architecture

**Build & DevOps:**
- Maven (Java backend)
- npm/Node.js (Frontend & Electron)
- Electron Builder (Desktop packaging)
- Windows/macOS targets supported

### 1.4 Frameworks & Libraries

**Backend Frameworks:**
- Spring Boot 3.3
- Spring Data JPA
- Spring Web (REST APIs)
- Spring Security (Authentication)

**Backend Libraries:**
- Lombok (annotation processing)
- Jackson (JSON serialization)
- Google Gemini API client
- H2 JDBC driver

**Frontend Frameworks:**
- Angular 18 (core routing, DI)
- Angular Material (UI components)

**Frontend Libraries:**
- RxJS (reactive programming)
- Angular HttpClient (HTTP requests)
- Angular Forms (form management)
- Date-fns (date utilities)

**Desktop Integration:**
- Electron API (process management)
- Node.js child_process (JRE execution)

---

## 2. ARCHITECTURE ANALYSIS

### 2.1 Layered Architecture

```
┌─────────────────────────────────────────────┐
│     ELECTRON DESKTOP SHELL (Main/Preload)   │
│    - Window Management                      │
│    - IPC Communication                      │
│    - JRE Lifecycle Management               │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼──────────┐     ┌──────▼────────┐
   │   FRONTEND    │     │    BACKEND    │
   │   (Angular18) │◄──►│ (Spring Boot) │
   └────┬──────────┘     └──────┬────────┘
        │                       │
   ┌────▼──────────┐     ┌──────▼────────┐
   │  Components   │     │   REST APIs   │
   │  Services     │     │   Services    │
   │  Guards       │     │   Controllers │
   │  Interceptors │     │   Repositories│
   └────┬──────────┘     └──────┬────────┘
        │                       │
        └───────────────────────┴─────────┐
                                │
                        ┌───────▼────────┐
                        │  H2 Database   │
                        │  (Embedded)    │
                        └────────────────┘
```

### 2.2 Application Layers

**Layer 1: Desktop Shell (Electron)**
- Main Process: Application lifecycle, window management
- Preload Script: Secure IPC bridge between renderer and main
- Responsibility: Launch backend JRE, manage app window, handle system integration

**Layer 2: Frontend (Angular 18)**
- Components: UI rendering, user interactions
- Services: Data access, API calls, business logic client-side
- Guards: Authentication & authorization checks
- Interceptors: HTTP request/response handling, auth headers
- Routing: Application navigation structure
- Signals: Reactive state management

**Layer 3: Backend (Spring Boot)**
- Controllers: HTTP endpoint handlers, request routing
- Services: Business logic, risk calculations, AI integration
- Repositories: Data access, JPA queries
- Entities: Domain models, database mappings
- Configuration: Spring beans, CORS, security settings

**Layer 4: Persistence (H2 Database)**
- Embedded database, file-based storage
- 11 entity models with relationships
- SQL migrations for schema management

### 2.3 API Layer

**REST API Endpoints:** 30+ endpoints for:
- Project Management (CRUD)
- Asset Management (Business & Supporting)
- Vulnerability Catalog
- Risk Assessment (Create, Update, Finalize)
- Threat/Vulnerability Suggestions (AI-powered)
- Assessment Reporting
- AI Status Monitoring
- Configuration Management

**API Security:**
- Spring Security with Bearer token authentication
- Optional Azure AD integration (X-Username header fallback)
- CORS whitelist configuration
- Request validation via Spring validators

---

## 3. BUSINESS DOMAIN ANALYSIS

### 3.1 Business Domain
**Domain:** Information Security Risk Management  
**Compliance Framework:** ISO 27005 (Security Risk Management)  
**Related Standards:** NIST Cybersecurity Framework, OWASP Risk Rating Methodology

### 3.2 Core Objectives

1. **Structured Risk Assessment**
   - Guide organizations through ISO 27005-compliant assessment process
   - Provide step-by-step wizard for thoroughness
   - Ensure consistent methodology across projects

2. **Risk Quantification**
   - Calculate inherent risk (likelihood × impact)
   - Evaluate residual risk after mitigations
   - Generate risk scores and rankings

3. **Asset Management**
   - Catalog business assets (systems, data, processes)
   - Document supporting assets (infrastructure, people, suppliers)
   - Track asset relationships and dependencies

4. **Threat & Vulnerability Management**
   - Identify relevant threats to assets
   - Document vulnerabilities affecting systems
   - Leverage AI for threat/vulnerability discovery
   - Maintain threat/vulnerability library

5. **Risk Mitigation Planning**
   - Document mitigation strategies
   - Track mitigation effectiveness
   - Calculate residual risk reduction
   - Plan risk treatment options (Accept, Mitigate, Transfer, Avoid)

6. **Comprehensive Reporting**
   - Generate assessment reports (HTML/PDF)
   - Executive summaries with risk heat maps
   - Detailed risk registers
   - Audit trails and evidence documentation

### 3.3 Major Capabilities

1. **Risk Assessment Wizard**
   - 7-step guided workflow
   - Data validation at each step
   - Progress tracking and persistence

2. **Asset Management**
   - Creates and categorizes assets
   - Maintains asset relationships
   - Tracks asset criticality

3. **Threat Modeling**
   - AI-powered threat suggestions
   - Threat scenario documentation
   - Attack path assessment

4. **Vulnerability Scanning**
   - Vulnerability catalog integration
   - CVSS scoring
   - AI-powered vulnerability suggestions

5. **Risk Calculation Engine**
   - Threat factor assessment (attacker capability analysis)
   - Likelihood estimation (threat × occurrence)
   - Impact assessment (confidentiality, integrity, availability)
   - Risk matrix visualization

6. **Mitigation Tracking**
   - Document mitigation controls
   - Estimate cost/effort
   - Track implementation progress
   - Calculate residual risk

7. **Reporting & Export**
   - HTML report generation
   - PDF export capability
   - Risk register export
   - Trend analysis and metrics

8. **AI Integration**
   - Google Gemini API for threat suggestions
   - Vulnerability discovery assistance
   - Context-aware recommendations
   - Graceful degradation if API unavailable

---

## 4. ENTITY DISCOVERY & DATA MODEL

### 4.1 Core Entities (11 Total)

#### **User**
- **Purpose:** Authentication and user identity
- **Attributes:** ID, username, email, password (BCrypt), roles
- **Relationships:** Owns Projects (1:N)
- **Critical Operations:** 
  - Login/Authentication
  - Password management
  - Role assignment

#### **Project**
- **Purpose:** Container for an assessment
- **Attributes:** ID, name, description, owner, created_date, updated_date, status
- **Relationships:** 
  - Owned by User (N:1)
  - Contains Assets (1:N)
  - Contains Risks (1:N)
  - Contains Assessment (1:1)
- **Critical Operations:**
  - Create project
  - Update project metadata
  - Archive/Delete project
  - Export project data

#### **Assessment**
- **Purpose:** Document a specific risk assessment instance
- **Attributes:** ID, project_id, status (STARTED/IN_PROGRESS/FINALIZED), created_date, finalized_date
- **Relationships:**
  - Belongs to Project (N:1)
  - Contains Risks (1:N)
- **Critical Operations:**
  - Start assessment
  - Progress assessment steps
  - Finalize assessment
  - Generate report from assessment

#### **BusinessAsset**
- **Purpose:** Represent valuable organizational assets (systems, data, business processes)
- **Attributes:** ID, project_id, name, description, asset_type, criticality (1-5), value, status
- **Relationships:**
  - Belongs to Project (N:1)
  - Can be linked to Risks (N:N via Risk.asset_id)
  - Associated with Vulnerabilities (N:N)
- **Critical Operations:**
  - Create/Update asset metadata
  - Set asset criticality/value
  - Link threats to asset
  - Query asset impact on risks

#### **SupportingAsset**
- **Purpose:** Infrastructure, personnel, or external dependencies supporting business assets
- **Attributes:** ID, project_id, name, asset_type (INFRASTRUCTURE/PERSONNEL/EXTERNAL), description
- **Relationships:**
  - Belongs to Project (N:1)
  - Associated with BusinessAssets (N:N)
- **Critical Operations:**
  - Document supporting assets
  - Assess dependency impact
  - Identify single points of failure

#### **Threat**
- **Purpose:** Potential harmful events or actors that could exploit vulnerabilities
- **Attributes:** ID, project_id, name, description, threat_type, attacker_profile, attack_method
- **Relationships:**
  - Belongs to Project (N:1)
  - Associated with Vulnerabilities (N:N)
  - Referenced in Risks (N:N)
- **Critical Operations:**
  - Create threat scenarios
  - Document threat motivations
  - Assess threat actor capabilities
  - Generate threat suggestions via AI

#### **Vulnerability**
- **Purpose:** Weaknesses in systems/processes that threats could exploit
- **Attributes:** ID, project_id, name, cve_id, cvss_score, description, remediation, severity
- **Relationships:**
  - Belongs to Project (N:1)
  - Associated with BusinessAssets (N:N)
  - Associated with Threats (N:N)
  - Referenced in Risks (N:N)
- **Critical Operations:**
  - Create vulnerability record
  - Update CVSS metrics
  - Document remediation
  - Generate vulnerability suggestions via AI

#### **Risk**
- **Purpose:** Assessed combination of threat, vulnerability, and asset impact
- **Attributes:**
  - ID, assessment_id, asset_id, threat_id, vulnerability_id
  - threat_factor (0-10: avg attacker capability)
  - occurrence (1-5: likelihood of threat occurring)
  - likelihood (calculated from threat_factor × occurrence)
  - confidentiality/integrity/availability_impact (1-10)
  - inherent_risk_score (likelihood × max CIA impact)
  - residual_risk_score (after mitigations)
  - status (IDENTIFIED/REVIEWED/ACCEPTED/MITIGATED)
- **Relationships:**
  - Belongs to Assessment (N:1)
  - References Asset, Threat, Vulnerability (N:1 each)
  - Has Attack Paths (1:N)
  - Has Mitigations (1:N)
- **Critical Operations:**
  - Create risk record  
  - Calculate likelihood (threat_factor × occurrence)
  - Calculate impact (max of CIA damages)
  - Calculate inherent risk (likelihood × impact)
  - Add/evaluate mitigations
  - Calculate residual risk
  - Accept or reject risk

#### **AttackPath**
- **Purpose:** Document specific attack scenarios or exploit chains
- **Attributes:** ID, risk_id, description, steps (in sequence), estimated_effort, required_knowledge
- **Relationships:**
  - Belongs to Risk (N:1)
- **Critical Operations:**
  - Document attack scenarios
  - Describe exploitation steps
  - Assess required attacker capabilities

#### **Mitigation**
- **Purpose:** Controls or actions to reduce risk
- **Attributes:** ID, risk_id, description, control_type (PREVENTIVE/DETECTIVE/CORRECTIVE), cost_estimate, effort_estimate, implementation_status, residual_risk_reduction
- **Relationships:**
  - Belongs to Risk (N:1)
  - Can be assigned to Supporting Assets
- **Critical Operations:**
  - Create mitigation strategies
  - Estimate cost/effort  
  - Track implementation status
  - Calculate effectiveness

#### **Report**
- **Purpose:** Generated assessment documentation
- **Attributes:** ID, assessment_id, generated_date, format (HTML/PDF), file_location, summary
- **Relationships:**
  - Belongs to Assessment (N:1)
- **Critical Operations:**
  - Generate HTML report
  - Generate PDF report
  - Export risk register
  - Create executive summary

### 4.2 Entity Relationships Summary

```
User
  └─ owns ─────────────► Project (1:N)
                           ├─ contains ──────► BusinessAsset (1:N)
                           ├─ contains ──────► SupportingAsset (1:N)
                           ├─ contains ──────► Threat (1:N)
                           ├─ contains ──────► Vulnerability (1:N)
                           └─ has ───────────► Assessment (1:1)
                                               └─ contains ──► Risk (1:N)
                                                                ├─ references ─► Asset
                                                                ├─ references ─► Threat
                                                                ├─ references ─► Vulnerability
                                                                ├─ has ────────► AttackPath (1:N)
                                                                └─ has ────────► Mitigation (1:N)
```

---

## 5. WORKFLOW DISCOVERY & BUSINESS PROCESSES

### 5.1 Primary Workflows

#### **Workflow 1: Create New Assessment Project**
- **Status:** Core workflow, heavily used
- **Actors:** Security Manager, Risk Manager
- **Preconditions:**
  - User authenticated
  - User has permission to create projects
- **Steps:**
  1. Navigate to Projects page
  2. Click "Create New Project"
  3. Enter project name, description
  4. (Optional) Select assessment template
  5. Assign team members (basic: owner assignment)
  6. Submit project creation
  7. System creates project with initial Assessment record
- **Expected Outcome:**
  - New Project created with DRAFT status
  - Assessment initialized with STARTED status
  - User redirected to assessment wizard
- **Data Entities Involved:** User → Project → Assessment

#### **Workflow 2: Add Assets to Assessment**
- **Status:** Critical workflow
- **Actors:** Security Manager, Risk Analyst
- **Preconditions:**
  - Assessment in STARTED or IN_PROGRESS status
  - Project created
- **Steps:**
  1. Navigate to "Assets" section in assessment
  2. Click "Add Business Asset"
  3. Enter asset name, description, type
  4. Set criticality level (1-5 scale)
  5. Define asset value/importance
  6. Save asset
  7. (Optional) Link asset to supporting assets (infrastructure, people)
  8. Repeat for multiple assets
- **Expected Outcome:**
  - BusinessAsset records created and linked to project
  - Assets displayed in asset inventory
  - Assets become available for risk assessment
- **Data Entities Involved:** Project → BusinessAsset, SupportingAsset
- **Risk:** Users may skip assets → incomplete risk assessment

#### **Workflow 3: Identify Threats & Vulnerabilities**
- **Status:** Core workflow (can be AI-assisted)
- **Actors:** Security Analyst, Threat Modeler
- **Preconditions:**
  - Assets defined
  - Assessment in progress
  - (Optional) Gemini API available for AI suggestions
- **Steps:**
  1. Navigate to Threats section
  2. Option A: Manually create threat
     - Enter threat name, description
     - Define threat actor profile
     - Describe attack method
  3. Option B: Request AI suggestions (via Gemini)
     - System analyzes assets
     - Generates 3 threat scenarios: (Agent + Verb + Motivation)
     - User reviews and selects relevant threats
  4. Create threats in system
  5. Repeat for Vulnerabilities section
  6. Similar manual/AI workflow for vulnerabilities
  7. Link threats and vulnerabilities to assets
- **Expected Outcome:**
  - Threat and Vulnerability records created
  - Linked to BusinessAssets
  - Available for risk calculation
- **Data Entities Involved:** Project → Threat, Vulnerability → BusinessAsset
- **AI Integration:** Gemini API provides intelligent suggestions
- **Risk:** Without AI, threat discovery may miss important scenarios

#### **Workflow 4: Create & Calculate Risks**
- **Status:** Core workflow, heavily weighted
- **Actors:** Risk Analyst, Security Manager
- **Preconditions:**
  - Assessment in progress
  - At least 1 asset, threat, and vulnerability
  - Assessment step: "Create Risks"
- **Steps:**
  1. Navigate to Risks section
  2. Create risk entry:
     - Select Asset
     - Select applicable Threat
     - Select applicable Vulnerability
  3. Set threat assessment parameters:
     - **Threat Factor (0-10):** Estimate attacker capabilities (skills, resources, motivation)
     - **Occurrence (1-5):** Likelihood threat will occur (1=rare, 5=almost certain)
  4. System calculates: **Likelihood = Threat Factor × Occurrence**
  5. Set impact parameters:
     - **Confidentiality Impact (1-10):** Damage if data disclosed
     - **Integrity Impact (1-10):** Damage if data modified
     - **Availability Impact (1-10):** Damage if system unavailable
  6. System calculates: **Max CIA = max(Confidentiality, Integrity, Availability)**
  7. System calculates: **Inherent Risk = Likelihood × Max CIA**
  8. (Optional) Document attack paths
  9. Save risk record
  10. Repeat for all asset-threat-vulnerability combinations
- **Expected Outcome:**
  - Risk records with calculated scores
  - Risk severity classification (Critical/High/Medium/Low)
  - Risk matrix populated
- **Data Entities Involved:** Assessment → Risk, with Asset/Threat/Vulnerability references
- **Risk Calculation Formula:**
  ```
  Likelihood = Threat_Factor (0-10) × Occurrence (1-5)
  Impact = max(Confidentiality_Impact, Integrity_Impact, Availability_Impact)
  Inherent_Risk = Likelihood × Impact
  Inherent_Risk_Score = Inherent_Risk normalized to 1-100 scale (or 1-25 scale based on max values)
  ```

#### **Workflow 5: Plan & Document Mitigations**
- **Status:** Critical workflow
- **Actors:** Risk Manager, Control Owner
- **Preconditions:**
  - Risks identified and calculated
  - Assessment in progress
- **Steps:**
  1. For each significant risk:
     - Review inherent risk score
     - Determine tolerable risk level
  2. If inherent risk > tolerance:
     - Click "Add Mitigation"
     - Document mitigation strategy
     - Select control type:
       - PREVENTIVE: Prevent threat from exploiting vulnerability
       - DETECTIVE: Detect exploitation after it occurs
       - CORRECTIVE: Recover from impact
     - Estimate implementation cost
     - Estimate effort/timeline
     - Assign responsibility
  3. Link mitigation to supporting assets (if applicable)
  4. Estimate risk reduction amount
  5. System recalculates: **Residual Risk = Inherent Risk - Mitigation Reduction**
  6. Accept or reject mitigation effectiveness  
  7. Save mitigation record
- **Expected Outcome:**
  - Mitigation records created
  - Residual risk calculated
  - Risk accepted or mitigation plan tracked
- **Data Entities Involved:** Risk → Mitigation
- **Key Metrics:**
  - Reduction percentage
  - Implementation timeline
  - Responsible party

#### **Workflow 6: Finalize Assessment & Generate Report**
- **Status:** Final workflow
- **Actors:** Assessment Owner, Risk Manager
- **Preconditions:**
  - All risks reviewed
  - All significant risks have mitigation plans or formal acceptance
  - Assessment data complete
- **Steps:**
  1. Review Assessment Summary
     - Total risks identified
     - Residual risk profile
     - Key mitigations
  2. Validate data completeness
  3. Click "Finalize Assessment"
  4. System transitions Assessment status → FINALIZED
  5. Generate Report:
     - Option A: HTML Report (interactive, browser-viewable)
     - Option B: PDF Report (printable, distributable)
  6. Report includes:
     - Executive Summary
     - Risk Heat Map
     - Detailed Risk Register
     - Mitigation Plans
     - Audit Trail
  7. Export Risk Register (CSV/Excel for external tracking)
  8. Archive assessment or schedule for review
- **Expected Outcome:**
  - Assessment marked FINALIZED
  - Reports generated and downloadable
  - Risk register available for tracking
  - Project data locked (view-only) or transitioned to monitoring
- **Data Entities Involved:** Assessment → Report

### 5.2 Secondary Workflows

#### **Workflow 7: Monitor & Update Risks**
- **Frequency:** Ongoing after assessments
- **Steps:**
  1. Review previous assessment
  2. Update mitigation status
  3. Reassess residual risk
  4. Track control effectiveness
  5. Update risk records with new information
- **Actors:** Risk Coordinator, Control Owner

#### **Workflow 8: AI-Assisted Threat Discovery**
- **Triggers:** User clicks "Get Threat Suggestions"
- **Preconditions:**
  - Google Gemini API configured and online
  - Assets defined in project
- **Steps:**
  1. System collects asset information
  2. Sends prompt to Gemini API:
     - "Given these business assets, what realistic threats could apply?"
     - API returns 3 threat scenarios: (Actor/Attacker + Verb/Action + Context/Motivation)
  3. System displays suggestions to user
  4. User reviews and selects relevant threats
  5. Selected threats added to project
- **Graceful Degradation:** If API unavailable, feature disabled with user notification

---

## 6. EXISTING TEST ANALYSIS

### 6.1 Backend Test Coverage

**Test Framework:** JUnit 5 (Jupiter)  
**Mocking Framework:** Mockito  
**Test Count:** ~3 unit tests (minimal coverage)

**Existing Backend Tests:**
1. **Risk Calculation Tests** (if present)
2. **Service Layer Tests** (sparse)
3. **Minimal controller testing**

**Test File Locations:** `backend/src/test/java/com/thalesgroup/`

### 6.2 Frontend Test Coverage

**Test Framework:** Jasmine + Karma  
**Component Testing:** Angular TestBed  
**Test Count:** Placeholder specs in components, minimal implementations

**Existing Frontend Tests:**
- Component specs present but incomplete
- Service mocks tend to be basic
- Minimal routing guard tests
- No E2E tests (Playwright/Cypress)

### 6.3 Coverage Summary

| Area | Coverage | Status |
|------|----------|--------|
| Backend Services | **LOW** (5-15%) | ⚠️ Needs expansion |
| Backend Controllers | **MINIMAL** (0-5%) | ⚠️ Critical gap |
| Frontend Components | **MINIMAL** (5-10%) | ⚠️ Critical gap |
| Frontend Services | **LOW** (10-20%) | ⚠️ Needs expansion |
| Risk Calculation Logic | **MEDIUM** (40-50%) | ⚠️ Some coverage |
| Authentication | **MINIMAL** | ⚠️ Critical gap |
| E2E Workflows | **NONE** (0%) | 🔴 Not covered |

### 6.4 Missing Test Areas (HIGH PRIORITY)

**Backend (P0 - Critical):**
- [ ] RiskService.calculateInherentRisk() - Core business logic
- [ ] RiskService.calculateResidualRisk() - With mitigations
- [ ] RiskService.validateRiskData() - Input validation
- [ ] AuthenticationController - Login/auth flow
- [ ] ProjectController - CRUD operations
- [ ] AssetController - Asset management
- [ ] VulnerabilityController - Vulnerability operations
- [ ] Error handling & edge cases

**Backend (P1 - Important):**
- [ ] ThreatSuggestionService - AI integration
- [ ] VulnerabilitySuggestionService - AI context
- [ ] ReportGenerationService - HTML/PDF export
- [ ] FileOperationService - Report file handling
- [ ] AI status monitoring
- [ ] Database transaction handling
- [ ] Integration tests (Rest templates, database)

**Frontend (P0 - Critical):**
- [ ] AssessmentWizardComponent - 7-step navigation
- [ ] RiskMatrixComponent - Risk visualization
- [ ] Authentication flow (login, session)
- [ ] Route guards (auth.guard)
- [ ] HTTP interceptor (auth.interceptor)
- [ ] Asset management components
- [ ] Risk creation form validation

**Frontend (P1 - Important):**
- [ ] AI suggestion polling (real-time updates)
- [ ] Report generation trigger
- [ ] Vuln_matrix component
- [ ] State management with Signals
- [ ] Error handling & user feedback
- [ ] Form validation across modules
- [ ] Navigation & routing

**E2E Tests (P0 - Critical):**
- [ ] Complete assessment workflow (end-to-end)
- [ ] Project creation → Assets → Threats → Risks → Report
- [ ] AI suggestion integration (mocked)
- [ ] Report generation (HTML/PDF)
- [ ] User authentication (login/logout)
- [ ] Error scenarios (network failures, invalid data)

---

## 7. AUTOMATION OPPORTUNITY ANALYSIS

### 7.1 High Priority (P0) - Business Critical Workflows

**Automation Target 1: Complete Assessment Workflow**
- **Coverage:** Project creation → Assets → Threats → Risks → Mitigations → Report
- **Priority:** P0 (Core business flow, highest user usage)
- **Complexity:** High (7+ steps, data dependencies)
- **Tool:** Playwright E2E tests
- **Test Scenarios:**
  1. Happy path: Complete assessment from start to finish
  2. Happy path with AI suggestions enabled (mocked)
  3. Partial completion and save/resume
  4. Multi-asset risk assessment
  5. Report generation (HTML & PDF)
  6. Export functionality

**Automation Target 2: Authentication & Authorization**
- **Coverage:** Login, session management, route guards
- **Priority:** P0 (Security critical)
- **Complexity:** Medium
- **Tool:** Playwright E2E + API tests
- **Test Scenarios:**
  1. Valid login/logout flow
  2. Invalid credentials handling
  3. Session expiration & re-authentication
  4. Unauthorized access attempts
  5. Route guard enforcement
  6. API auth header validation

**Automation Target 3: Risk Calculation Engine**
- **Coverage:** Likelihood, Impact, Inherent Risk, Residual Risk
- **Priority:** P0 (Core business logic)
- **Complexity:** High (mathematical validation)
- **Tool:** Unit tests (backend) + API contract tests
- **Test Scenarios:**
  1. Threat factor × occurrence = Likelihood (various inputs)
  2. Max(CIA) = Impact calculation
  3. Likelihood × Impact = Inherent Risk
  4. Inherent Risk - Mitigation = Residual Risk
  5. Edge cases: zero factors, maximum values, rounding
  6. Integration: risk creation → calculation → persistence

**Automation Target 4: AI-Powered Suggestions**
- **Coverage:** Threat/Vulnerability suggestions via Gemini
- **Priority:** P0 (Differentiator feature)
- **Complexity:** High (external API mocking required)
- **Tool:** Playwright E2E (mocked API) + API contract tests
- **Test Scenarios:**
  1. Request suggestions for asset pair
  2. Validate suggestion format (Agent + Verb + Motivation)
  3. Select suggestion → add to project
  4. API offline → graceful degradation
  5. Suggestion polling (15s interval update)
  6. Online/offline detection accuracy

### 7.2 Medium Priority (P1) - Frequently Used Features

**Automation Target 5: Asset Management**
- **Coverage:** Create, read, update, delete assets
- **Priority:** P1 (Used frequently but straightforward)
- **Complexity:** Medium
- **Tool:** Playwright E2E
- **Test Scenarios:**
  1. Create business asset with metadata
  2. Create supporting asset (infrastructure/personnel)
  3. Update asset properties
  4. Delete asset (cascade behavior)
  5. Link assets together
  6. Search/filter assets

**Automation Target 6: Report Generation & Export**
- **Coverage:** HTML/PDF generation, export workflows
- **Priority:** P1 (Important deliverable)
- **Complexity:** Medium-High (file generation validation)
- **Tool:** Playwright E2E + API tests
- **Test Scenarios:**
  1. Generate HTML report from finalized assessment
  2. Generate PDF report
  3. Verify report content completeness
  4. Export risk register (CSV)
  5. Download file to client
  6. Report format validation

**Automation Target 7: Risk Workflow (Create, Update, Accept)**
- **Coverage:** Risk CRUD, status transitions, mitigation linking
- **Priority:** P1 (Core domain, heavily used)
- **Complexity:** High
- **Tool:** Playwright E2E + Unit tests
- **Test Scenarios:**
  1. Create risk for asset-threat-vulnerability trio
  2. Update risk parameters
  3. Accept/reject risk
  4. Add mitigations to risk
  5. Recalculate residual risk
  6. Status transitions (IDENTIFIED → REVIEWED → ACCEPTED)

### 7.3 Lower Priority (P2) - Regression Coverage

**Automation Target 8: Form Validation**
- **Coverage:** Input validation across all forms
- **Priority:** P2 (Regression, prevents bad data)
- **Complexity:** Low
- **Tool:** Unit tests + component specs
- **Scenarios:**
  - Required field validation
  - Numeric range validation
  - Format validation (email, URLs)
  - Cross-field validation
  - Error message display

**Automation Target 9: Data Persistence & Recovery**
- **Coverage:** Save/load workflows, data integrity
- **Priority:** P2 (Reliability)
- **Complexity:** Medium
- **Tool:** Integration tests
- **Scenarios:**
  - Create → Save → Close → Reopen → Verify data
  - Partial completion recovery
  - Database transaction handling
  - Concurrent access (if applicable)

**Automation Target 10: Navigation & Routing**
- **Coverage:** SPA routing, guard enforcement, state preservation
- **Priority:** P2 (Regression)
- **Complexity:** Low-Medium
- **Tool:** Playwright E2E + Unit tests
- **Scenarios:**
  - Navigate through assessment steps
  - Back/forward navigation
  - Direct URL access (guard enforcement)
  - Deep linking preservation
  - Popup/modal interactions

### 7.4 Automation ROI Summary

| Target | Estimated Effort | Risk Reduction | Business Impact |
|--------|------------------|----------------|-----------------|
| P0: Assessment Workflow | 40 hours | **CRITICAL** | Prevents regression in core flow |
| P0: Authentication | 20 hours | **CRITICAL** | Security + compliance |
| P0: Risk Calculation | 30 hours | **CRITICAL** | Accuracy of core algorithm |
| P0: AI Suggestions | 25 hours | **HIGH** | Feature differentiation |
| P1: Asset Management | 15 hours | HIGH | Frequent use |
| P1: Report Generation | 20 hours | HIGH | Key deliverable |
| P1: Risk Workflow | 25 hours | HIGH | Core functionality |
| P2: Form Validation | 10 hours | MEDIUM | Data quality |
| P2: Data Persistence | 15 hours | MEDIUM | Reliability |
| P2: Navigation | 10 hours | MEDIUM | User experience |

**Total Automation Effort:** ~170 hours  
**ROI Timeline:** Payback after resolving 5-10 P0/P1 issues

---

## 8. UNIT TEST OPPORTUNITY ANALYSIS

### 8.1 Backend Test Gap Analysis

#### **HIGH PRIORITY (P0) - Complex Business Logic**

**Target 1: RiskService Class**
- **Current Coverage:** Minimal to none
- **Complexity:** HIGH (Mathematical risk calculations)
- **Lines of Code:** ~300-400 LOC
- **Critical Methods:**
  ```
  - calculateLikelihood(threatFactor, occurrence) → double
  - calculateImpact(confImpact, integImpact, availImpact) → double
  - calculateInherentRisk(likelihood, impact) → double
  - calculateResidualRisk(inheritRisk, mitigation) → double
  - validateRiskData(risk) → boolean
  - createRisk(riskInput) → Risk (persistence)
  ```
- **Test Coverage Goal:** 80%+
- **Recommended Test Cases:**
  1. Boundary tests (min/max inputs)
  2. Calculation accuracy tests
  3. Edge cases (zero factors, null handling)
  4. Integration with persistence
  5. Mitigation effectiveness validation

**Target 2: ThreatSuggestionService**
- **Current Coverage:** Minimal
- **Complexity:** HIGH (External API integration)
- **Lines of Code:** ~150-200 LOC
- **Critical Methods:**
  ```
  - getSuggestionsForAssets(asset1, asset2) → List<ThreatSuggestion>
  - parseSuggestionsFromGemini(response) → List<ThreatSuggestion>
  - validateSuggestionFormat(suggestion) → boolean
  ```
- **Test Coverage Goal:** 85%+
- **Recommended Test Cases:**
  1. Gemini API mocking tests
  2. Response parsing validation
  3. Error handling (API failures, timeouts)
  4. Null/empty response handling
  5. Format validation

**Target 3: VulnerabilitySuggestionService**
- **Similar to ThreatSuggestionService**
- **Priority:** P0
- **Test Focus:** API integration, CVSS parsing, error handling

**Target 4: ReportGenerationService**
- **Current Coverage:** None
- **Complexity:** HIGH (File generation, HTML/PDF)
- **Lines of Code:** ~250-350 LOC
- **Critical Methods:**
  ```
  - generateHtmlReport(assessment) → String
  - generatePdfReport(assessment) → byte[]
  - exportRiskRegister(risks) → String (CSV)
  - validateReportContent(report) → boolean
  ```
- **Test Coverage Goal:** 75%+
- **Recommended Test Cases:**
  1. HTML report content completeness
  2. PDF binary generation
  3. CSV export format validation
  4. Missing data handling
  5. File I/O error scenarios

#### **MEDIUM PRIORITY (P1) - Standard Service Layer**

**Target 5: ProjectService**
- **Current Coverage:** Minimal
- **Complexity:** MEDIUM (CRUD + relationships)
- **Lines of Code:** ~200-250 LOC
- **Critical Methods:**
  ```
  - createProject(projectInput) → Project
  - updateProject(id, projectInput) → Project
  - getProjectById(id) → Project
  - deleteProject(id) → void
  - getProjectsByUser(userId) → List<Project>
  ```
- **Test Coverage Goal:** 80%+
- **Recommended Test Cases:**
  1. CRUD operations
  2. User ownership validation
  3. Cascade delete behavior
  4. Not found exceptions
  5. Permission checks (if applicable)

**Target 6: AssetService**
- **Current Coverage:** Minimal
- **Complexity:** MEDIUM
- **Critical Methods:** Business & Supporting Asset CRUD
- **Test Coverage Goal:** 75%+

**Target 7: AuthenticationService**
- **Current Coverage:** Minimal
- **Complexity:** MEDIUM-HIGH (Security critical)
- **Critical Methods:**
  ```
  - authenticate(username, password) → AuthToken
  - validateToken(token) → boolean
  - refreshToken(token) → AuthToken
  ```
- **Test Coverage Goal:** 90%+ (Security critical)
- **Recommended Test Cases:**
  1. Valid credentials → token issued
  2. Invalid credentials → failure
  3. Token expiration handling
  4. BCrypt password validation
  5. Concurrent authentication

**Target 8: Assessment/Risk Workflow Services**
- **Priority:** P1
- **Coverage Goal:** 75%+

#### **LOW PRIORITY (P2) - Utilities & Helpers**

**Target 9: Utility Classes & Helpers**
- **Priority:** P2
- **Examples:** DateUtils, ValidationUtils, FormatUtils
- **Coverage Goal:** 60%+

### 8.2 Frontend Test Gap Analysis

#### **HIGH PRIORITY (P0)**

**Target 1: AssessmentWizardComponent**
- **Current Coverage:** Placeholder spec only
- **Complexity:** HIGH (Multi-step state management)
- **Critical Scenarios:**
  1. Step 1: Project selection & creation
  2. Step 2: Asset entry
  3. Step 3: Threat identification
  4. Step 4: Vulnerability identification
  5. Step 5: Risk creation (with calculation validation)
  6. Step 6: Mitigation planning
  7. Step 7: Report generation & finalization
- **Test Focus:** Step navigation, state persistence, data validation
- **Test Coverage Goal:** 85%+

**Target 2: RiskMatrixComponent**
- **Current Coverage:** None
- **Complexity:** HIGH (Data visualization, calculations)
- **Critical Scenarios:**
  1. Render risk matrix grid
  2. Position risks based on likelihood × impact
  3. Color coding by severity
  4. Interaction: click to view risk details
  5. Filtering by risk status
  6. Chart updates on data change
- **Test Focus:** Visual data binding, calculations, user interactions
- **Test Coverage Goal:** 80%+

**Target 3: RiskFormComponent / Risk Creation UI**
- **Current Coverage:** Minimal
- **Complexity:** MEDIUM-HIGH (Form validation + API calls)
- **Critical Scenarios:**
  1. Form field validation (required, numeric ranges)
  2. Threat factor input (0-10)
  3. Occurrence input (1-5)
  4. Impact fields (CIA, 1-10 each)
  5. Calculation preview (likelihood, inherent risk)
  6. Mitigation addition
  7. Residual risk calculation
  8. Form submission & API call
- **Test Focus:** Form validation, calculation display, API integration
- **Test Coverage Goal:** 85%+

**Target 4: AuthComponent & Authentication Flow**
- **Current Coverage:** Minimal
- **Complexity:** MEDIUM-HIGH (Security critical)
- **Critical Scenarios:**
  1. Login form submission
  2. Valid credentials → navigation to dashboard
  3. Invalid credentials → error display
  4. Session recovery after refresh
  5. Logout navigation
  6. Route guard enforcement
- **Test Focus:** Form handling, auth service mocking, navigation
- **Test Coverage Goal:** 90%+

#### **MEDIUM PRIORITY (P1)**

**Target 5: Asset Management Components**
- **AssetListComponent:** View/edit/delete assets
- **AssetCreateComponent:** Create new assets
- **Test Focus:** CRUD operations, filtering, search
- **Coverage Goal:** 75%+

**Target 6: ReportComponent**
- **Test Focus:** Report display, export triggers, PDF/HTML validation
- **Coverage Goal:** 70%+

**Target 7: Service Layer (Frontend)**
- **RiskService:** HTTP calls to backend
- **AssetService:** Asset API calls
- **ProjectService:** Project management API
- **AuthService:** Authentication/token management
- **Test Focus:** HTTP mocking, error handling, state updates
- **Coverage Goal:** 75%+

#### **P2 - Utilities & Forms**

**Target 8: Validation Services & Utility Functions**
- **Priority:** P2
- **Coverage Goal:** 60%+

### 8.3 Files Requiring Immediate Test Coverage

**Backend Files (Sorted by Priority):**
1. `backend/src/main/java/com/thalesgroup/isra/service/RiskService.java` - **P0**
2. `backend/src/main/java/com/thalesgroup/isra/service/ThreatSuggestionService.java` - **P0**
3. `backend/src/main/java/com/thalesgroup/isra/service/VulnerabilitySuggestionService.java` - **P0**
4. `backend/src/main/java/com/thalesgroup/isra/service/ReportGenerationService.java` - **P0**
5. `backend/src/main/java/com/thalesgroup/isra/service/ProjectService.java` - **P1**
6. `backend/src/main/java/com/thalesgroup/isra/service/AssetService.java` - **P1**
7. `backend/src/main/java/com/thalesgroup/isra/service/AuthenticationService.java` - **P1**
8. `backend/src/main/java/com/thalesgroup/isra/controller/RiskController.java` - **P1**
9. `backend/src/main/java/com/thalesgroup/isra/controller/ProjectController.java` - **P1**
10. Other controllers and utilities - **P2**

**Frontend Files (Sorted by Priority):**
1. `frontend/src/app/features/assessment-wizard/assessment-wizard.component.ts` - **P0**
2. `frontend/src/app/features/risks/risk-matrix.component.ts` - **P0**
3. `frontend/src/app/features/risks/risk-form.component.ts` - **P0**
4. `frontend/src/app/features/auth/login.component.ts` - **P0**
5. `frontend/src/app/core/services/auth.service.ts` - **P1**
6. `frontend/src/app/core/guards/auth.guard.ts` - **P1**
7. `frontend/src/app/core/interceptors/auth.interceptor.ts` - **P1**
8. Asset management components - **P1**
9. Report generation components - **P1**
10. Utilities and helpers - **P2**

### 8.4 Test Strategy Summary

| Category | P0 Priority | P1 Priority | P2 Priority | Total Effort |
|----------|------------|------------|------------|--------------|
| Backend Services | 4 files | 3 files | 5 files | ~80 hours |
| Backend Controllers | 2 files | 2 files | 3 files | ~40 hours |
| Frontend Components | 4 files | 3 files | 3 files | ~60 hours |
| Frontend Services | 3 files | 2 files | 2 files | ~40 hours |
| E2E Tests (Playwright) | 4 scenarios | 3 scenarios | 2 scenarios | ~50 hours |
| **Total** | | | | **~270 hours** |

**Recommended Phase 1 Approach (High ROI):**
1. Focus on P0 backend services (80 hours)
2. Implement E2E tests for critical workflows (50 hours)
3. Add frontend component tests for P0 (30 hours)
4. Total Phase 1: ~160 hours

---

## 9. TECHNOLOGY STACK DETAILED

### 9.1 Backend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Spring Boot | 3.3.x | REST API, Dependency Injection |
| **Language** | Java | 17 LTS | Compiled backend services |
| **ORM** | Spring Data JPA | 3.1.x | Object-Relational Mapping |
| **Database** | H2 | 2.1.x | Embedded relational DB |
| **Security** | Spring Security | 6.0.x | Authentication & Authorization |
| **JSON** | Jackson | 2.15.x | JSON serialization/deserialization |
| **Annotations** | Lombok | 1.18.x | Reduce boilerplate code |
| **API Client** | Google Generative AI | Latest | Gemini API integration |
| **Build Tool** | Maven | 3.8.x | Build orchestration |
| **Testing** | JUnit 5, Mockito | 5.9.x | Unit & mock testing |

### 9.2 Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Angular | 18.x | SPA framework, DI, routing |
| **Language** | TypeScript | 5.x | Typed JavaScript |
| **Styling** | SCSS | Latest | CSS preprocessing |
| **UI Library** | Angular Material | 18.x | Material Design components |
| **State Mgmt** | Angular Signals | 18.x | Reactive signal-based state |
| **HTTP** | HttpClient | 18.x | API communication |
| **Forms** | Reactive Forms | 18.x | Form handling & validation |
| **RxJS** | RxJS | 7.x | Reactive programming |
| **Date Utils** | date-fns | 3.x | Date manipulation |
| **Build Tool** | npm/Node.js | 18+ | Dependency & build management |
| **Testing** | Jasmine, Karma | 4.x, 6.x | Unit testing framework |

### 9.3 Desktop Integration Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Desktop Framework** | Electron | 31.x | Cross-platform desktop app |
| **Runtime** | Node.js | 18+ | Server-side JavaScript |
| **Bundler** | Electron Builder | 24.x | App packaging & signing |
| **JRE** | OpenJDK | 17+ | Java Runtime (bundled) |
| **Process Mgmt** | Child Process | Node built-in | Spawn backend JRE |

### 9.4 Dependency Summary

**Backend Dependencies (pom.xml):** ~50+ artifacts  
**Frontend Dependencies (package.json):** ~100+ packages  
**Electron Builder Config:** builder-config.yml

---

## 10. DEPLOYMENT & ENVIRONMENT

### 10.1 Development Environment

**Setup:**
1. Frontend: `cd frontend && npm install && ng serve`
2. Backend: `cd backend && mvn spring-boot:run`
3. Electron: `cd electron && npm install && npm start`

**Environment Variables (backend):**
- `GEMINI_API_KEY` - Google Gemini API key
- `SPRING_DATASOURCE_URL` - H2 database file path
- `CORS_ALLOWED_ORIGINS` - Frontend URL whitelist
- `SERVER_PORT` - Backend server port (default: 8080)

**Environment Variables (frontend):**
- `API_BASE_URL` - Backend API URL
- `ENVIRONMENT` - dev/prod flag
- `APP_VERSION` - Application version

### 10.2 Production Deployment

**Desktop Distribution:**
- Windows .exe installer (via Electron Builder)
- macOS .dmg installer
- Auto-update capability via Electron Updater

**Database:**
- H2 file stored in user's AppData (Windows)
- Single-user embedded database
- No server installation required

---

## 11. SECURITY CONSIDERATIONS

### 11.1 Current Security Measures

1. **Authentication**
   - Spring Security with Bearer token
   - Optional Azure AD integration
   - Session management via localStorage
   - Password hashing (BCrypt)

2. **Authorization**
   - Route guards (Angular)
   - API endpoint guards (Spring)
   - Basic role-based access

3. **Data Protection**
   - CORS whitelist enforcement
   - HTTPS in production (TLS/SSL)
   - Secure headers (HSTS, CSP)

4. **Input Validation**
   - Backend validation on all endpoints
   - Frontend form validation
   - SQL injection prevention (JPA parameterized queries)

### 11.2 Security Gaps

1. **Limited RBAC** - All authenticated users have full access
2. **Single-user** - No concurrent user isolation
3. **API Key Management** - Gemini API key stored in config
4. **Data Encryption** - H2 database not encrypted at rest
5. **Audit Logging** - Minimal audit trail

### 11.3 Recommended Security Tests

- [ ] SQL injection prevention
- [ ] XSS prevention in report HTML
- [ ] CSRF token validation
- [ ] API rate limiting
- [ ] Sensitive data masking in logs
- [ ] Password strength validation
- [ ] Session timeout handling
- [ ] Secure header enforcement

---

## 12. RISK ASSESSMENT MODULES & FEATURES

### 12.1 Risk Calculation Engine

**Core Algorithm:**
```
Likelihood = Threat_Factor (0-10) × Occurrence (1-5)
           = Range: 0-50

Impact = max(Confidentiality, Integrity, Availability)
       = Range: 1-10

Inherent Risk = Likelihood × Impact
              = Range: 0-500 (normalized to 1-100 scale)

Residual Risk = Inherent Risk - Mitigation_Reduction
              = Risk acceptance decision point
```

### 12.2 Risk Categories

1. **By Severity:**
   - Critical (90-100)
   - High (70-89)
   - Medium (40-69)
   - Low (1-39)

2. **By Status:**
   - Identified (newly created)
   - Reviewed (assessor validated)
   - Accepted (formally approved)
   - Mitigated (control implemented)

3. **By Type:**
   - Technical (system/software vulnerability)
   - Operational (process/procedural)
   - Strategic (organizational/external)
   - Compliance (regulatory requirement)

---

## 13. COMPREHENSIVE FEATURE MATRIX

| Feature | Backend | Frontend | Status | Complexity |
|---------|---------|----------|--------|-----------|
| Project Management | ✅ | ✅ | Complete | Low |
| Asset Management (Business) | ✅ | ✅ | Complete | Low |
| Asset Management (Supporting) | ✅ | ✅ | Complete | Low |
| Threat Management | ✅ | ✅ | Complete | Low |
| Vulnerability Management | ✅ | ✅ | Complete | Low |
| Risk Creation & Calculation | ✅ | ✅ | Complete | **HIGH** |
| Mitigation Planning | ✅ | ✅ | Complete | Medium |
| AI Threat Suggestions (Gemini) | ✅ | ✅ | Complete | **HIGH** |
| AI Vulnerability Suggestions | ✅ | ✅ | Complete | **HIGH** |
| Report Generation (HTML) | ✅ | ✅ | Complete | High |
| Report Generation (PDF) | ✅ | ✅ | Complete | High |
| Risk Register Export | ✅ | ✅ | Complete | Low |
| User Authentication | ✅ | ✅ | Complete | Medium |
| Role-Based Access | ⚠️ Partial | ⚠️ Partial | Incomplete | Medium |
| Multi-organization Support | ❌ | ❌ | Not Implemented | High |
| Real-time Collaboration | ❌ | ❌ | Not Implemented | **VERY HIGH** |

---

## 14. SUMMARY & ANALYSIS CONCLUSIONS

### 14.1 Strengths

1. ✅ **Modern Technology Stack:** Angular 18, Spring Boot 3.3, Electron 31 - cutting edge
2. ✅ **Clean Architecture:** Well-separated layers, decoupled components
3. ✅ **AI-Powered Features:** Gemini integration for threat/vulnerability suggestions
4. ✅ **Comprehensive Risk Model:** ISO 27005-aligned methodology
5. ✅ **Complete Feature Set:** All core risk assessment functionality present
6. ✅ **Desktop Distribution:** Electron wrapper enables easy app distribution
7. ✅ **Professional UI:** Material Design, responsive layout

### 14.2 Weaknesses

1. ⚠️ **Minimal Test Coverage:** ~5-10% coverage, missing critical test areas
2. ⚠️ **Single-User Architecture:** H2 embedded database, no multi-user support
3. ⚠️ **Limited Authorization:** Basic RBAC, not comprehensive
4. ⚠️ **API Key Management:** Gemini API key in configuration files
5. ⚠️ **No Audit Logging:** Limited user action tracking
6. ⚠️ **Data Not Encrypted:** H2 database unencrypted at rest
7. ⚠️ **Missing Documentation:** Code comments and API docs sparse

### 14.3 Recommendations

**Immediate (Phase 1):**
1. Implement comprehensive test suite (P0 priority - 160 hours)
2. Add E2E automation for critical workflows
3. Improve error handling & user feedback
4. Add audit logging for compliance

**Short-term (Phase 2):**
1. Enhance RBAC implementation
2. Add data encryption at rest
3. Implement API rate limiting
4. Improve Gemini API key management (secrets vault)

**Long-term (Phase 3):**
1. Multi-user support (database migration, concurrency)
2. Real-time collaboration features
3. Multi-organization support
4. Advanced reporting & analytics
5. Integration with external risk management systems

### 14.4 Test Execution Priority

**Phase 1: Foundation (Critical path to production readiness)**
- Backend RiskService tests (P0)
- Authentication workflow tests (P0)
- Risk calculation validation (P0)
- Assessment wizard E2E (P0)
- Report generation tests (P0)

**Phase 2: Coverage Expansion (Quality & reliability)**
- Remaining backend services (P1)
- Frontend component tests (P1)
- Additional E2E scenarios
- Integration tests

**Phase 3: Automation (Regression prevention)**
- Full E2E test suite
- Continuous integration tests
- Performance tests
- Load testing (if multi-user upgrade planned)

---

## APPENDIX: Project Metrics

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | ~10,000 LOC |
| **Backend Java Files** | ~30-40 files |
| **Frontend TypeScript Files** | ~50-60 files |
| **Database Entities** | 11 core entities |
| **REST API Endpoints** | 30+ |
| **Test Coverage** | 5-10% (critical gap) |
| **UI Components** | 40+ |
| **Services (Backend)** | 8-10 services |
| **Services (Frontend)** | 8-10 services |
| **Build Artifacts** | 3 (Backend JAR, Frontend bundle, Electron app) |
| **Deployment Targets** | Windows, macOS, Web (via Electron) |

---

**Document Generation Date:** 2026-06-24  
**Analysis Methodology:** Comprehensive codebase exploration, architecture analysis, test gap identification  
**Intended Audience:** Development team, QA leads, project managers, AI agents for downstream task generation
