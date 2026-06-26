# ISRA 2.0 - COMPREHENSIVE QA TEST PLAN
**Generated:** 2026-06-24  
**Test Manager:** Principal QA Architect, Enterprise Release Manager  
**Version:** 1.0  
**Scope:** Complete repository analysis covering 73 source files across backend, frontend, and Electron  
**Classification:** High-Priority, Business-Critical Testing Strategy  

---

## SECTION 1: TEST PLAN OVERVIEW

### 1.1 Application Identity
- **Application Name:** ISRA 2.0 (Integrated Security Risk Assessment Tool)
- **Business Domain:** Information Security Risk Management (ISO 27005-Compliant)
- **Application Type:** Desktop Application (Electron) + Web Backend (Spring Boot)
- **Target Users:** Security professionals, Risk managers, Compliance officers

### 1.2 Repository Summary
- **Total Source Files Analyzed:** 73 (42 Java, 27 TypeScript, 4 JavaScript)
- **Total Lines of Code:** ~10,500
- **Existing Test Coverage:** <5% (only 3 minimal test cases found)
- **User Stories Derived:** 35 repository-validated stories
- **Business Workflows:** 6 primary workflows, 2 secondary workflows
- **Epics Identified:** 10 business epics
- **Critical Business Logic:** Risk calculation engine, threat/vulnerability assessment, mitigation planning

### 1.3 Architecture Summary
```
Desktop Launcher (Electron)
    ↓ (Process Management + IPC)
Frontend (Angular 18 + Signals)
    ↓ (HTTP REST)
Backend (Spring Boot 3.3)
    ↓ (JPA Persistence)
H2 Database (Embedded)
```

### 1.4 Testing Objectives

**Primary Objectives:**
1. **Functional Completeness:** Verify all 35 user stories execute correctly per acceptance criteria
2. **Business Logic Correctness:** Validate ISO 27005 risk calculation algorithm (threat factor × occurrence × impact)
3. **Data Integrity:** Ensure entity relationships, cascading operations, and transactional consistency
4. **Integration Correctness:** Verify REST API contracts and backend-frontend communication
5. **Security Validation:** Authenticate protected operations, validate authorization guards, verify secure password handling
6. **Workflow Correctness:** Execute end-to-end assessment workflows from project creation through report generation
7. **AI Integration:** Validate Gemini API integration with graceful fallback capability
8. **Error Resilience:** Test exception handling, recovery mechanisms, user-friendly error messages
9. **Compliance:** Verify audit trail logging, data persistence, assessment finalization workflow

**Secondary Objectives:**
10. Performance and scalability within single-user desktop context
11. Data recovery and persistence across application restarts
12. Browser compatibility (if web version deployed separately)
13. File upload/download operations and attachment handling

### 1.5 Testing Approach

**Risk-Based Strategy:**
- P0 (Business Critical): **Exhaustive testing** with 100% acceptance criteria coverage
- P1 (Core Business): **Comprehensive testing** with 90%+ acceptance criteria and branch coverage
- P2 (Supporting): **Adequate testing** with 80%+ acceptance criteria coverage

**Testing Types by Priority:**
1. **Smoke Testing:** Verify critical paths work (5-10 test cases, 1-2 hours)
2. **Functional Testing per Story:** Each story has 5-10 test cases validating all acceptance criteria
3. **Integration Testing:** API contracts, service-to-service communication, database transactions
4. **Negative Testing:** Invalid inputs, missing data, permission denials, API failures
5. **Boundary Testing:** Numeric limits (1-10, 1-5 scales), string length constraints, file sizes
6. **Validation Testing:** Business rules enforcement, duplicate detection, relationship constraints
7. **Regression Testing:** Automated test suite for prior defect prevention
8. **Security Testing:** Authentication bypass attempts, SQL injection, CSRF, authorization bypass
9. **Workflow Testing:** Complete assessment workflows from start to finalization
10. **Data Integrity Testing:** Cascade deletes, orphan prevention, transaction rollback
11. **AI Integration Testing:** Gemini API success/failure scenarios, timeout handling, offline mode
12. **Automation Testing:** E2E Playwright scripts for critical workflows and regression suite

**Coverage Targets:**
- Unit Test Coverage (Backend Services): **90%**
- Integration Test Coverage (API Layer): **85%**
- E2E Workflow Coverage: **80%**
- Acceptance Criteria Coverage: **100%**
- Business Story Coverage: **100%**

---

## SECTION 2: TEST SCOPE

### 2.1 In Scope (All Repository-Discovered Functionality)

#### **Assessment Management Module**
- Project CRUD operations (Create, Read, Update, Delete)
- Project ownership and access control validation
- Assessment lifecycle (STARTED → IN_PROGRESS → FINALIZED)
- Project archival and deletion with cascade behavior
- Assessment context initialization and updates

#### **Business Asset Management Module**
- Business asset CRUD operations
- Criticality level assignment (1-5 scale validation)
- CIA impact scoring (1-10 scale validation)
- Asset type categorization
- Asset relationship management

#### **Supporting Asset Management Module**
- Supporting asset CRUD (Infrastructure, Personnel, External Dependencies)
- Security level assignment (1-4 scale)
- M:M relationship mapping between business and supporting assets
- Dependency impact tracking

#### **Threat Management Module**
- Manual threat creation (Agent, Verb, Motivation)
- Threat listing and filtering
- AI-powered threat suggestion engine (Gemini API integration)
- Threat-to-risk linkage validation

#### **Vulnerability Management Module**
- Vulnerability CRUD operations
- CVSS score management (0-10 scale, severity mapping)
- CVE ID format validation and linkage
- Vulnerability-to-asset relationship tracking
- AI-powered vulnerability suggestions (Gemini API)
- File attachment handling for vulnerability evidence

#### **Risk Management Module (CRITICAL)**
- Risk creation with Asset, Threat, Vulnerability selection validation
- Threat factor scoring (0-10 scale representing attacker capability)
- Occurrence level selection (1-5 scale, likelihood mapping)
- **Likelihood calculation:** Threat Factor × Occurrence
- **Impact calculation:** max(Confidentiality, Integrity, Availability scores)
- **Inherent Risk calculation:** Likelihood × Impact with normalization
- Risk score classification (CRITICAL/HIGH/MEDIUM/LOW)
- Risk status transitions (IDENTIFIED → REVIEWED → ACCEPTED → MITIGATED)
- Attack path documentation and scoring
- Risk update and recalculation workflows

#### **Mitigation Planning Module**
- Mitigation control creation for risks
- Control type assignment (PREVENTIVE, DETECTIVE, CORRECTIVE)
- Cost and effort estimating
- Implementation status tracking
- Risk reduction percentage specification
- **Residual risk calculation:** Inherent Risk - Mitigation Reduction
- Mitigation effectiveness validation

#### **Report Generation Module**
- Assessment finalization with validation
- HTML report generation with complete content coverage
- PDF report generation from HTML source
- Risk register export to CSV/Excel format
- Report downloads and file handling
- Report content completeness validation

#### **Authentication & Authorization Module**
- User registration with duplicate detection
- User login with credential validation
- Session management and token handling
- Password hashing with BCrypt
- Rate limiting on failed login attempts (max 5 per 15 min)
- Logout and session termination
- Auth guard enforcement on protected routes
- HTTP Auth header injection via interceptor
- Request authorization validation

#### **Wizard Navigation Module**
- 7-8 step wizard progression (Basic Info → Context → Assets → Supporting → Threats → Vulnerabilities → Risks → Mitigations → Finalize)
- Step validation and blocking
- Back/forward navigation
- Progress persistence across sessions
- Step completion status tracking
- Current step display and highlighting in sidebar

#### **REST API Layer (30+ endpoints)**
- HTTP status code correctness (200, 201, 400, 401, 403, 404, 409, 500)
- JSON request/response serialization
- Error response format consistency
- CORS header validation
- Content-Type header validation
- Request body validation and schema enforcement

#### **Data Persistence Layer**
- Entity-repository CRUD operations
- Transaction handling and ACID compliance
- Cascade delete relationships (1:N, M:N)
- Orphan prevention
- Query accuracy (findByProjectId, findByOwnerOid, existsByUsername, etc.)
- Database transaction rollback on errors

#### **Configuration & Infrastructure**
- CORS policy enforcement
- HTTP client bean creation and configuration
- Spring Security bean configuration
- Logging and audit trail output

### 2.2 Out of Scope (With Justification)

| Area | Reason |
|------|--------|
| **Electron Build Packages** | Build scripts (build.js, download-jre.js) require CI/CD environment; covered by script validation only |
| **JRE Download & Version Management** | Platform-specific script execution; assumed pre-deployed for testing |
| **Cross-Browser Testing** | Desktop app; single browser context via Chromium in Electron |
| **Mobile/Responsive Design** | Desktop application (Electron); Angular Material responsive design assumed working |
| **Load Testing (>10 concurrent users)** | Single-user desktop architecture; multi-user load testing not applicable |
| **Penetration Testing** | Out of scope for functional test plan; security audit separate effort |
| **Third-Party Library Updates** | Dependency management outside test plan scope |
| **Internationalization (i18n)** | Not implemented in source code; not in scope |
| **Accessibility (WCAG)** | Not explicitly implemented; optional future enhancement |
| **A/B Testing** | Not applicable to assessment platform |

---

## SECTION 3: BUSINESS WORKFLOW COVERAGE

### 3.1 Workflow 1: Create New Assessment Project

| Attribute | Value |
|-----------|-------|
| **Workflow ID** | W-ASSESS-001 |
| **Business Priority** | **P0 (CRITICAL)** |
| **Automation Candidate** | **HIGH** |
| **User Stories Covered** | US-ASSESS-001, US-ASSESS-002 |
| **Business Value** | Enables all subsequent assessment activities; foundational step |
| **Dependencies** | Authentication (User must be logged in) |
| **Module** | Assessment Management / Project Management |
| **Triggers** | User clicks "New Project" button on Dashboard |

**Testing Priority Ranking:**
1. **Smoke Test** (Gate 1): Can user create project with minimal valid data? → Must pass before deployment
2. **Functional Test**: All acceptance criteria (AC1-AC12) validated
3. **Negative Test:** Duplicate names, missing fields, database errors, permission denial
4. **Validation Test**: Mandatory field enforcement, format validation
5. **Integration Test:** Database persistence, timestamp recording, Assessment record creation
6. **Security Test:** Only authenticated users can create; ownership assignment correct
7. **Regression Test:** Automated daily to prevent project creation breaking

**Test Design:**

| Test Case | Category | Objective | Input | Expected | Priority |
|-----------|----------|-----------|-------|----------|----------|
| T-ASSESS-001-FXN | Functional | Create project with minimal data | projectName=TestProj, org=Org1, classification=PUBLIC | Project created, Assessment initialized (STARTED), success message | P0 |
| T-ASSESS-002-FXN | Functional | Create project with all optional fields | ++description, ++additionalField | Project created with all fields | P0 |
| T-ASSESS-003-NEG | Negative | Duplicate project name | projectName=TestProj (second time) | Error: "Project name already exists" | P0 |
| T-ASSESS-004-NEG | Negative | Missing mandatory field (projectName) | org=Org1, classification=PUBLIC (no name) | Form validation error; submit disabled | P0 |
| T-ASSESS-005-NEG | Negative | Database unavailable | Create project while DB offline | Error message: "Unable to save project. Try again." | P0 |
| T-ASSESS-006-VALID | Validation | Valid org name format | org=ThalesGroup International | Accepted | P1 |
| T-ASSESS-007-VALID | Validation | Invalid org name format | org=<script>alert(1)</script> | Validation error (XSS prevention) | P1 |
| T-ASSESS-008-INTEGRATION | Integration | Project persisted to database | Create and query directly from DB | Project record exists with correct timestamps | P0 |
| T-ASSESS-009-INTEGRATION | Integration | Assessment record created | Create project; verify Assessment table | Assessment created with status=STARTED | P0 |
| T-ASSESS-010-SECURITY | Security | Project owner assignment | Create as user1; check ownerOid | ownerOid = user1's ID | P0 |
| T-ASSESS-011-REGRESSION | Regression | No side effects on prior projects | Create project; list all projects | Prior projects unchanged; new project in list | P1 |

---

### 3.2 Workflow 2: Add Assets to Assessment

| Attribute | Value |
|-----------|-------|
| **Workflow ID** | W-ASSESS-002 |
| **Business Priority** | **P0 (CRITICAL)** |
| **Automation Candidate** | **HIGH** |
| **User Stories Covered** | US-ASSET-001, US-SUPP-001 |
| **Business Value** | Establishes foundation for risk assessment; CIA scores directly impact inherent risk |
| **Dependencies** | Project exists; Assessment in progress |
| **Module** | Asset Management (Business + Supporting) |
| **Triggers** | User navigates to Business Assets step in wizard |

**Testing Priority Ranking:**
1. Smoke Test: Create business asset succeeds with valid data
2. Functional Test: All asset properties configurable and persisted
3. Negative Test: Invalid CIA scores (out of range), duplicate names, deletion cascade
4. Validation Test: CIA score range validation (1-10), criticality validation (1-5)
5. Integration Test: Asset-to-project relationship, risk recalculation on asset change
6. Regression Test: Asset creation doesn't break existing risks
7. Security Test: User can only modify their project's assets

**High-Level Test Cases:**
- Asset creation success path (Functional)
- Criticality level validation boundaries (1, 5, 6→error) (Boundary)
- CIA score range enforcement (0→error, 1, 10, 11→error) (Boundary)
- Duplicate asset name handling (Negative)
- Asset deletion with cascade to risks (Negative)
- Edit asset; recalculate dependent risks (Integration)
- Supporting asset M:M relationship to business assets (Integration)

---

### 3.3 Workflow 3: Identify Threats & Vulnerabilities

| Attribute | Value |
|-----------|-------|
| **Workflow ID** | W-ASSESS-003 |
| **Business Priority** | **P0 (CRITICAL)** |
| **Automation Candidate** | **MEDIUM** (Gemini API integration complicates automation) |
| **User Stories Covered** | US-THREAT-001, US-THREAT-002, US-VULN-001, US-VULN-004 |
| **Business Value** | Threat/vulnerability identification necessary for risk calculation; AI suggestions accelerate discovery |
| **Dependencies** | Business assets defined; Assessment in progress |
| **Module** | Threat & Vulnerability Management; AI Integration |
| **Triggers** | User navigates to Threats section (or requests AI suggestions) |

**Testing Strategy:**

**Manual Threat Entry (No External Dependency):**
- Create threat with Agent, Verb, Motivation (Functional)
- Threat agent enum validation (Negative)
- Threat verb enum validation (Negative)
- Duplicate threat detection (Negative)
- Threat to risk linkage (Integration)

**AI Threat Suggestions (With Mock):**
- Gemini API online: System requests suggestions, API returns 3-5 suggestions, UI displays (Functional)
- Gemini API offline: System displays graceful error; "AI suggestions unavailable" (Negative)
- User selects suggestion: Suggestion becomes threat record (Integration)
- API timeout: After 15s, display timeout error and allow continue (Negative)
- User rejects all suggestions: No threats created; can create manual threat (Manual/Functional)

**Vulnerability Management:**
- Create vulnerability with name, CVSS score, CVE ID (Functional)
- CVSS score validation: 0-10 range, decimal accepted (Boundary)
- CVSS→Severity mapping: 9-10→CRITICAL, 7-8.9→HIGH, 4-6.9→MEDIUM, 0-3.9→LOW (Validation)
- CVE ID format validation (e.g., CVE-2024-001) (Validation)
- Vulnerability-supporting asset linkage (Integration)
- File attachment upload/download (Functional)

---

### 3.4 Workflow 4: Create & Calculate Risks (CORE ALGORITHM)

| Attribute | Value |
|-----------|-------|
| **Workflow ID** | W-ASSESS-004 |
| **Business Priority** | **P0 (CRITICAL - HIGHEST)** |
| **Automation Candidate** | **HIGH** |
| **User Stories Covered** | US-RISK-001, US-RISK-002 |
| **Business Value** | Core business logic; risk calculation correctness essential for compliance and audit |
| **Dependencies** | Assessment, Business Asset, Threat, Vulnerability must exist |
| **Module** | Risk Management; Risk Calculation Engine |
| **Triggers** | User navigates to Risks step; clicks "Add Risk" |

**Critical Test Strategy (100% Calculation Correctness Required):**

**Formula Verification Tests:**
```
Likelihood = Threat_Factor × Occurrence
Impact = max(Confidentiality, Integrity, Availability)
Inherent_Risk = Likelihood × Impact
Risk_Classification = based on Inherent_Risk score
Residual_Risk = Inherent_Risk - Mitigation_Reduction
```

**Calculation Boundary Tests (Exhaustive):**
- Threat Factor: 0, 0.5, 1, 5, 9.9, 10 (6 values)
- Occurrence: 1, 2, 3, 4, 5 (5 values)
- CIA Scores: 1, 5, 10 (3 values each × 3 = 27 combinations)
- Total matrix: 6 × 5 × 27 = 810 calculation verification test cases

**Risk Creation Happy Path (Functional):**
- TC1: User selects Asset, Threat, Vulnerability from dropdowns
- TC2: User sets Threat Factor to 7 (slider input)
- TC3: User sets Occurrence to 3 (dropdown)
- TC4: System calculates Likelihood = 7 × 3 = 21; displays for verification
- TC5: User sets CIA scores: Confidentiality=8, Integrity=6, Availability=9
- TC6: System calculates Impact = max(8,6,9) = 9; displays
- TC7: System calculates Inherent Risk = 21 × 9 = 189; normalizes to scale
- TC8: System assigns classification based on score threshold
- TC9: Risk record created and persisted
- TC10: Risk appears in risks table with calculated scores

**Negative Test Cases:**
- Threat Factor slider below 0: Rejected/clamped to 0 (Boundary)
- Threat Factor slider above 10: Rejected/clamped to 10 (Boundary)
- CIA score below 1: Form validation error (Boundary)
- CIA score above 10: Form validation error (Boundary)
- Occurrence not in [1-5]: Form validation error (Boundary)
- Risk with same Asset+Threat+Vulnerability: Duplicate error (Negative)
- Asset not found (deleted before risk submit): Error message (Negative)

**Integration Test Cases:**
- Risk creation triggers database transaction commit
- Risk record includes audit timestamp
- Risk linked to correct Assessment, Asset, Threat, Vulnerability
- Risk scores persisted correctly (decimal precision)
- Query risk retrieves all calculated fields
- Risk appears in project's risk dashboard

**Regression Test Cases:**
- Creating new risk doesn't recalculate prior risks
- Updating prior risk recalculates only that risk
- Deleting risk doesn't affect other risks
- Residual risk field populated correctly

**Security Test Cases:**
- User can only create risks in their own project
- Risk scores cannot be manually overridden (calculated only)
- Risk tamper detection (e.g., direct database modification)

---

### 3.5 Workflow 5: Plan & Document Mitigations

| Attribute | Value |
|-----------|-------|
| **Workflow ID** | W-ASSESS-005 |
| **Business Priority** | **P0 (CRITICAL)** |
| **Automation Candidate** | **HIGH** |
| **User Stories Covered** | US-MITIG-001, US-MITIG-002 |
| **Business Value** | Risk treatment strategy; residual risk calculation essential for risk acceptance decisions |
| **Dependencies** | Risk with significant inherent score |
| **Module** | Mitigation Planning; Risk Treatment |
| **Triggers** | User clicks "Add Mitigation" within risk details |

**Testing Strategy:**

**Mitigation Creation (Functional):**
- TC1: User enters mitigation description (mandatory)
- TC2: User selects control type (PREVENTIVE/DETECTIVE/CORRECTIVE)
- TC3: User enters cost estimate (optional, currency format)
- TC4: User enters effort estimate (DAYS/WEEKS/MONTHS)
- TC5: User enters risk reduction % (0-100 range)
- TC6: System calculates Residual Risk = Inherent Risk - Reduction
- TC7: Mitigation record created and linked to risk
- TC8: Mitigation appears in risk details

**Residual Risk Calculation (Validation):**
- TC1: Inherent Risk=100, Reduction=30% → Residual=70 (Calculation)
- TC1: Inherent Risk=100, Reduction=0% → Residual=100 (Boundary)
- TC1: Inherent Risk=100, Reduction=100% → Residual=0 (Boundary)
- TC1: Inherent Risk=100, Reduction=101% → Error (Boundary)

**Mitigation Status Updates (Functional):**
- Change status PLANNED→IN_PROGRESS→IMPLEMENTED (Functional)
- Update cost/effort estimates (Functional)
- Update risk reduction percentage; residual recalculates (Integration)

**Negative Test Cases:**
- Missing description: Form validation error
- Risk reduction > 100%: Validation error
- Negative cost value: Validation error
- Delete mitigation: Updates residual risk (Integration)

---

### 3.6 Workflow 6: Finalize Assessment & Generate Report

| Attribute | Value |
|-----------|-------|
| **Workflow ID** | W-ASSESS-006 |
| **Business Priority** | **P0 (CRITICAL)** |
| **Automation Candidate** | **HIGH** |
| **User Stories Covered** | US-REPORT-001, US-REPORT-002, US-REPORT-003, US-REPORT-004 |
| **Business Value** | Compliance deliverable; audit trail recording; report generation for stakeholder communication |
| **Dependencies** | Assessment data complete; all significant risks have mitigations or acceptance |
| **Module** | Report Generation; Assessment Lifecycle |
| **Triggers** | User clicks "Finalize Assessment" on summary page |

**Finalization (Workflow TC1-TC10):**
- TC1: User reviews assessment summary (risks, residual risk profile)
- TC2: System validates completeness (no mandatory fields missing)
- TC3: User clicks "Finalize Assessment"
- TC4: System displays confirmation dialog
- TC5: User confirms finalization
- TC6: Assessment status changes from IN_PROGRESS to FINALIZED
- TC7: Finalization timestamp recorded in database
- TC8: Assessment becomes read-only (subsequent modifications prevented)
- TC9: Success message displayed
- TC10: User offered option to generate report

**HTML Report Generation (Functional):**
- TC1: User clicks "Generate HTML Report"
- TC2: Backend collects project, assessment, risks, mitigations data
- TC3: Template renders: Executive Summary section
- TC4: Template renders: Risk Register table (all risks with scores)
- TC5: Template renders: Risk Matrix visualization (5×5 grid)
- TC6: Template renders: Mitigation Plans section
- TC7: Template renders: Residual Risk Assessment
- TC8: Template renders: Audit Trail (dates, history)
- TC9: Report file generated and returned for download
- TC10: Browser prompts download dialog
- TC11: User downloads HTML file to local disk

**HTML Report Content Validation (Integration):**
- Project name, org, classification present and correct
- All risks listed with Asset, Threat, Vulnerability names
- All risk scores (Threat Factor, Occurrence, Likelihood, Impact, Inherent Risk) correct
- Risk severity color coding applied correctly (Red/Orange/Yellow/Green)
- Mitigation controls listed under corresponding risks
- Residual risk scores calculated and displayed

**PDF Report Generation (Functional):**
- TC1: System converts HTML to PDF format
- TC2: PDF includes all HTML report content
- TC3: PDF formatting is professional (headers, footers, page numbers)
- TC4: PDF page breaks correct (no content cutoff)
- TC5: PDF downloadable to user's file system
- TC6: File naming includes project name and date

**Risk Register Export (Functional):**
- TC1: User clicks "Export Risk Register"
- TC2: User selects format: CSV or Excel
- TC3: System generates export with columns: Risk ID, Asset, Threat, Vulnerability, Scores, Mitigations, Status
- TC4: All risks included in export
- TC5: Export file downloadable
- TC6: CSV/Excel opens in spreadsheet application without errors

**Regression Tests (Post-Finalization):**
- Finalized assessment cannot be modified (edit attempts blocked)
- Prior assessments unaffected by finalization
- Multiple reports can be generated from same finalized assessment
- Report file format consistency across generations

---

### 3.7 Workflow 7: Authenticate User & Manage Session

| Attribute | Value |
|-----------|-------|
| **Workflow ID** | W-AUTH-001 |
| **Business Priority** | **P0 (CRITICAL - SECURITY)** |
| **Automation Candidate** | **HIGH** |
| **User Stories Covered** | US-AUTH-001, US-AUTH-002, US-AUTH-003, US-AUTH-004, US-AUTH-005 |
| **Business Value** | Security gate; protects assessment data; enables audit trail user attribution |
| **Dependencies** | System running; user account exists |
| **Module** | Authentication & Authorization |
| **Triggers** | User navigates to application; attempts to access protected route |

**Authentication Flow (Comprehensive):**

**Registration (Happy Path):**
- TC1: User navigates to registration page
- TC2: User enters username=jsmith, email=j.smith@org.com, password=SecurePass123!
- TC3: User confirms password matches
- TC4: System validates username uniqueness (not "jsmith" already exists)
- TC5: System validates email uniqueness
- TC6: System validates password strength (8+ chars, mix of case/numbers)
- TC7: User clicks Register button
- TC8: System hashes password with BCrypt (cost factor ≥10)
- TC9: System creates User record in database
- TC10: Success message displayed
- TC11: User redirected to login page

**Registration Negative Tests:**
- Duplicate username: Error "Username already taken"
- Duplicate email: Error "Email already registered"
- Weak password: Error "Password must be 8+ chars with uppercase, lowercase, numbers"
- Password mismatch: Error "Passwords do not match"
- Invalid email format: Validation error

**Login (Happy Path):**
- TC1: User navigates to login page
- TC2: User enters username=jsmith, password=SecurePass123!
- TC3: System queries User table for username
- TC4: System retrieves password hash from database
- TC5: System compares entered password with stored hash (BCrypt.verify)
- TC6: Credentials valid; system creates authentication session/token
- TC7: Token stored in localStorage (or secure cookie)
- TC8: User redirected to Projects dashboard
- TC9: Dashboard displays authenticated user's projects

**Login Negative Tests:**
- Invalid username: Error "Invalid username or password" (no user ID leak)
- Invalid password: Error "Invalid username or password" (no user ID leak)
- Case-sensitive username: "JSMITH" vs "jsmith" fail
- Blank username: Form validation error
- Blank password: Form validation error
- 5 failed attempts: Account temporarily locked for 15 minutes (Rate limiting)
- After 15 min lockout: Retry succeeds

**Session Management (Integration):**
- TC1: User logs in; token stored
- TC2: Token includes expiration (24 hours, configurable)
- TC3: User navigates within app; token included in all API requests
- TC4: Token expires after 24 hours
- TC5: Expired token triggers logout; user redirected to login
- TC6: User logs out; session cleared
- TC7: Browser localStorage cleared
- TC8: Authentication token destroyed

**Auth Guard Enforcement (Security):**
- TC1: Unauthenticated user attempts direct URL access to /projects
- TC2: Auth guard checks isAuthenticated signal
- TC3: isAuthenticated=false; user redirected to /login
- TC4: Protected route blocked from access
- TC5: After login, /projects accessible

**Auth Interceptor (Integration):**
- TC1: Authenticated user makes HTTP request to backend
- TC2: Auth interceptor intercepts request
- TC3: Interceptor reads token from localStorage
- TC4: Interceptor adds "Authorization: Bearer <token>" header
- TC5: Backend receives request with auth header
- TC6: Request processed with authorization

**Password Security (Security):**
- TC1: Password stored as BCrypt hash (never plain text)
- TC2: Hash begins with "$2a$10$..." format
- TC3: Repeated hash of same password yields different hash (salt) each time
- TC4: Password comparison uses timing-safe BCrypt.verify
- TC5: Forgot password (if implemented) sends reset link (not password)

---

### 3.8 Workflow 8: Navigate Assessment Wizard (Supporting Workflow)

| Attribute | Value |
|-----------|-------|
| **Workflow ID** | W-WIZARD-001 |
| **Business Priority** | **P1 (Core)** |
| **Automation Candidate** | **HIGH** |
| **User Stories Covered** | US-WIZARD-001 |
| **Business Value** | Enables systematic progression through assessment; prevents incomplete assessments |
| **Dependencies** | Assessment created; user authenticated |
| **Module** | Assessment Workflow; Wizard Navigation |
| **Triggers** | User redirected to wizard after project creation |

**Wizard Navigation (Functional):**
- TC1: User sees wizard with 8 steps displayed in sidebar
- TC2: Current step highlighted (e.g., Step 1: Basic Info)
- TC3: User completes Step 1 fields (project name, version, org)
- TC4: User clicks "Next"
- TC5: System validates Step 1 (mandatory fields present)
- TC6: Validation passes; wizard advances to Step 2: Project Context
- TC7: User can see completed Step 1 marked as done (checkmark)
- TC8: User can click "Previous" to return to Step 1
- TC9: User can navigate back freely (no re-validation on back)
- TC10: User can jump to previous steps via sidebar click

**Step Validation (Validation):**
- Step 1 (Basic Info): Requires project name, org, classification (Block advance)
- Step 2 (Context): Context fields optional; allow advance
- Step 3 (Business Assets): At least 1 asset recommended (optional; allow advance)
- Step 4 (Supporting Assets): Optional; allow advance
- Step 5 (Threats): At least 1 threat required (Block advance if none)
- Step 6 (Vulnerabilities): At least 1 required (Block advance if none)
- Step 7 (Risks): At least 1 risk required (Block advance if none)
- Step 8 (Mitigations): Optional; allow advance
- Finalize: All required fields complete; enable Finalize button

**Step Persistence (Integration):**
- TC1: User on Step 3 (Business Assets)
- TC2: User closes browser/app
- TC3: User reopens app; navigates to same project
- TC4: Wizard shows Step 3 as current (persistence verified)
- TC5: Previously entered data in Steps 1-2 still present

---

## SECTION 4: TEST DESIGN STRATEGY

### 4.1 Backend Java Testing (Spring Boot, JUnit 5, Mockito)

#### **RiskCalculationService (CRITICAL - 50-70 Unit Tests)**

**Testing Scope:**
- 10+ calculation methods for threat factor, likelihood, impact, inherent risk, residual risk
- 50 boundary value tests for each input scale (0-10, 1-5, 1-10)
- 27 CIA impact combinations
- Null/edge case handling for optional fields
- Floating-point precision and rounding consistency

**Test Categories:**

| Test Type | Count | Objective |
|-----------|-------|-----------|
| **Threat Factor Calculation** | 5 | Avg of 5 input factors: (skillLevel + reward + accessResources + size + intrusionDetection) / 5 |
| **Occurrence Level Mapping** | 7 | Map 1-5 to probability labels; boundary 1 (rare), 2 (unlikely), 3 (possible), 4 (likely), 5 (almost certain) |
| **Likelihood Calculation** | 12 | Threat_Factor × Occurrence for various input combinations; verify 0-50 output range |
| **Impact Calculation** | 8 | max(Confidentiality, Integrity, Availability); verify correct max identification |
| **Inherent Risk Calculation** | 10 | Likelihood × Impact; verify normalization to classification scale |
| **Threat Verb → CIA Mapping** | 7 | Map 7 threat verbs to CIA flags: (e.g., UNAUTHENTICATED_ACCESS→C_FLAG, DATA_MODIFICATION→I_FLAG) |
| **Attack Path Aggregation** | 5 | Combine multiple vulnerability scores; weight by criticality |
| **Mitigation Effects** | 6 | Apply reduction percentage; verify residual = inherent - (inherent × reduction%) |
| **Residual Risk Calculation** | 8 | Various mitigation scenarios; verify correctness |
| **Rounding & Precision** | 2 | Decimal place consistency (2 places); rounding direction (HALF_UP) |

**Test Examples:**

```java
@Test
void calculateThreatFactor_AllFieldsHigh_Returns10() {
  // Arrange
  ThreatFactorInputs inputs = new ThreatFactorInputs()
    .skillLevel(10).reward(10).accessResources(10).size(10).intrusionDetection(10);
  
  // Act
  double result = riskCalculationService.calculateThreatFactor(inputs);
  
  // Assert
  assertEquals(10.0, result, 0.01); // 10%
}

@Test
void calculateLikelihood_ThreatFactorZero_ReturnsZero() {
  // Arrange: Threat Factor = 0, Occurrence = 5
  // Act
  double result = riskCalculationService.calculateLikelihood(0, 5);
  // Assert
  assertEquals(0.0, result, 0.01);
}

@Test
void calculateCIAImpact_MaxOfThreeValues_ReturnsCorrectMax() {
  // Arrange
  Risk risk = new Risk()
    .confidentialityImpact(7)
    .integrityImpact(10)
    .availabilityImpact(6);
  
  // Act
  double result = riskCalculationService.calculateImpact(risk);
  
  // Assert
  assertEquals(10.0, result, 0.01); // Max is 10
}

@Test
void calculateInherentRisk_LikelihoodZero_ReturnsZero() {
  // Arrange: Likelihood = 0, Impact = 10
  // Act
  double result = riskCalculationService.calculateInherentRisk(0, 10);
  // Assert
  assertEquals(0.0, result, 0.01);
}

@Test
void calculateResidualRisk_AfterMitigation_Correct() {
  // Arrange
  double inheritRisk = 200;
  double mitigationReduction = 30; // 30%
  
  // Act
  double result = riskCalculationService.calculateResidualRisk(inheritRisk, mitigationReduction);
  
  // Assert
  double expected = inheritRisk - (inheritRisk * 0.30);
  assertEquals(expected, result, 0.01);
}
```

#### **RiskController (15-20 Unit Tests)**

**Test Scope:**
- CRUD operations (Create, Read, Update, Delete)
- HTTP status code correctness (200, 201, 400, 404, 409)
- Request body validation
- Response serialization
- Error handling (not found, duplicate, validation error)
- Transaction semantics (rollback on error)

**Test Examples:**

```java
@Test
void addRisk_ValidRequest_Returns201() {
  // Arrange
  CreateRiskRequest request = new CreateRiskRequest()
    .assetId(1L).threatId(2L).vulnerabilityId(3L)
    .threatFactor(7).occurrence(3)
    .confidentialityImpact(8).integrityImpact(6).availabilityImpact(7);
  
  // Act
  ResponseEntity<Risk> response = riskController.addRisk(projectId, request);
  
  // Assert
  assertEquals(HttpStatus.CREATED, response.getStatusCode());
  assertNotNull(response.getBody().getId());
  assertEquals(projectId, response.getBody().getProjectId());
}

@Test
void addRisk_MissingAsset_Returns400() {
  // Arrange
  CreateRiskRequest request = new CreateRiskRequest()
    .assetId(null).threatId(2L).vulnerabilityId(3L);
  
  // Act & Assert
  assertThrows(IllegalArgumentException.class, 
    () -> riskController.addRisk(projectId, request));
}

@Test
void addRisk_DuplicateRisk_Returns409() {
  // Arrange: Risk already exists for this Asset+Threat+Vulln combo
  CreateRiskRequest request = new CreateRiskRequest()
    .assetId(1L).threatId(2L).vulnerabilityId(3L);
  riskService.addRisk(projectId, request); // Create first
  
  // Act & Assert
  assertThrows(ConflictException.class, 
    () -> riskController.addRisk(projectId, request)); // Create duplicate
}

@Test
void deleteRisk_ExistingRisk_Returns204() {
  // Arrange
  long riskId = createTestRisk();
  
  // Act
  ResponseEntity<Void> response = riskController.deleteRisk(projectId, riskId);
  
  // Assert
  assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
  assertFalse(riskRepository.existsById(riskId));
}
```

#### **BusinessAssetRepository (4-5 Integration Tests)**

**Test Scope:**
- Query accuracy: findByProjectId
- Avoid query injection/SQL injection
- Cascade delete behavior
- Relationship cardinality (N:1 correct)

**Test Examples:**

```java
@DataJpaTest
class BusinessAssetRepositoryTests {
  
  @Test
  void findByProjectId_MultipleAssets_ReturnsAll() {
    // Arrange
    Project project = projectRepository.save(new Project().name("Test"));
    businessAssetRepository.save(new BusinessAsset().projectId(project.getId()).name("Asset1"));
    businessAssetRepository.save(new BusinessAsset().projectId(project.getId()).name("Asset2"));
    
    // Act
    List<BusinessAsset> results = businessAssetRepository.findByProjectId(project.getId());
    
    // Assert
    assertEquals(2, results.size());
    assertTrue(results.stream().allMatch(a -> a.getProjectId().equals(project.getId())));
  }
  
  @Test
  void deleteProject_CascadeDeletesAssets() {
    // Arrange
    Project project = projectRepository.save(new Project().name("Test"));
    businessAssetRepository.save(new BusinessAsset().projectId(project.getId()).name("Asset1"));
    
    // Act
    projectRepository.delete(project);
    
    // Assert
    assertTrue(businessAssetRepository.findByProjectId(project.getId()).isEmpty());
  }
}
```

#### **UserRepository (6-8 Unit Tests)**

**Test Scope:**
- Username uniqueness query
- Email uniqueness query
- Password hash retrieval
- User not found scenarios

---

### 4.2 Frontend Angular Testing (Jasmine/Karma, TestBed, HttpTestingController)

#### **RisksComponent (25-30 Unit Tests)**

**Test Scope:**
- Component initialization and SignalStore binding
- Risk list loading from service
- Risk creation form submission and calculation verification
- AI threat suggestion loading and selection
- CIA impact scoring UI
- Error handling and user feedback

**Test Examples:**

```typescript
describe('RisksComponent', () => {
  let component: RisksComponent;
  let fixture: ComponentFixture<RisksComponent>;
  let riskService: jasmine.SpyObj<RiskService>;
  let aiService: jasmine.SpyObj<RiskAiService>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisksComponent],
      providers: [
        { provide: RiskService, useValue: jasmine.createSpyObj('RiskService', ['getRisks', 'addRisk', 'updateRisk', 'deleteRisk']) },
        { provide: RiskAiService, useValue: jasmine.createSpyObj('RiskAiService', ['getThreatSuggestions']) }
      ]
    }).compileComponents();
    
    component = fixture.componentInstance;
    riskService = TestBed.inject(RiskService) as jasmine.SpyObj<RiskService>;
    aiService = TestBed.inject(RiskAiService) as jasmine.SpyObj<RiskAiService>;
  });
  
  it('should load risks on init', () => {
    // Arrange
    const mockRisks = [{ id: 1, assetId: 1, threatFactor: 7, occurrence: 3, inheritRisk: 189 }];
    riskService.getRisks.and.returnValue(of(mockRisks));
    
    // Act
    fixture.detectChanges();
    
    // Assert
    expect(riskService.getRisks).toHaveBeenCalledWith(projectId);
    expect(component.risks()).toEqual(mockRisks);
  });
  
  it('should calculate likelihood when threat factor and occurrence change', () => {
    // Arrange
    component.threatFactor = 7;
    component.occurrence = 3;
    
    // Act
    component.calculateLikelihood();
    
    // Assert
    expect(component.likelihood).toBe(21);
  });
  
  it('should disable submit button if CIA scores out of range', () => {
    // Arrange
    component.confidentialityImpact = 11; // Out of range
    
    // Act
    fixture.detectChanges();
    
    // Assert
    expect(component.isFormValid()).toBe(false);
    expect(fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.disabled).toBe(true);
  });
  
  it('should request AI suggestions and display them', (done) => {
    // Arrange
    const mockSuggestions = [
      { agent: 'HACKER', verb: 'NETWORK_SCAN', motivation: 'Reconnaissance' },
      { agent: 'INSIDER', verb: 'DATA_ACCESS', motivation: 'Espionage' }
    ];
    aiService.getThreatSuggestions.and.returnValue(of(mockSuggestions));
    
    // Act
    component.loadAiSuggestions();
    
    // Assert
    expect(component.isLoadingSuggestions()).toBe(false);
    expect(component.aiSuggestions()).toEqual(mockSuggestions);
    done();
  });
  
  it('should apply AI suggestion to form', () => {
    // Arrange
    const suggestion = { agent: 'HACKER', verb: 'MALWARE_DEPLOY', motivation: 'Financial gain' };
    
    // Act
    component.applyAiSuggestion(suggestion);
    
    // Assert
    expect(component.threatAgent).toBe('HACKER');
    expect(component.threatVerb).toBe('MALWARE_DEPLOY');
  });
});
```

#### **ProjectLayoutComponent (20-25 Unit Tests)**

**Test Scope:**
- Wizard step navigation (next, previous, jump)
- Step validation blocking
- Current step persistence and restoration
- Sidebar completion indicators
- Route parameter synchronization

#### **ProjectService (12-15 Integration Tests with HttpTestingController)**

**Test Scope:**
- GET /api/projects (list all projects)
- GET /api/projects/{id} (get single project)
- POST /api/projects (create project)
- PUT /api/projects/{id} (update project)
- DELETE /api/projects/{id} (delete project)
- HTTP error status code handling (4XX, 5XX)
- Response deserialization

**Test Examples:**

```typescript
describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/projects';
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should fetch all projects', () => {
    // Arrange
    const mockProjects = [
      { id: 1, name: 'Project1', organization: 'Org1' },
      { id: 2, name: 'Project2', organization: 'Org2' }
    ];
    
    // Act
    service.getProjects().subscribe(projects => {
      // Assert
      expect(projects.length).toBe(2);
      expect(projects[0].name).toBe('Project1');
    });
    
    // Assert HTTP call
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);
  });
  
  it('should create project with POST', () => {
    // Arrange
    const newProject = { name: 'NewProject', organization: 'Org3' };
    const createdProject = { id: 3, ...newProject };
    
    // Act
    service.createProject(newProject).subscribe(project => {
      // Assert
      expect(project.id).toBe(3);
      expect(project.name).toBe('NewProject');
    });
    
    // Assert HTTP call
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProject);
    req.flush(createdProject);
  });
  
  it('should handle 404 error on project not found', () => {
    // Arrange
    const projectId = 999;
    
    // Act & Assert
    service.getProject(projectId).subscribe(
      () => fail('should have failed with 404 error'),
      (error) => {
        expect(error.status).toBe(404);
      }
    );
    
    const req = httpMock.expectOne(`${baseUrl}/${projectId}`);
    req.flush('Project not found', { status: 404, statusText: 'Not Found' });
  });
});
```

#### **AuthService (10-12 Unit Tests)**

**Test Scope:**
- Login success/failure
- Registration success/failure  
- Session persistence (localStorage)
- Logout and session clearing
- currentUser and isAuthenticated signals

#### **AuthGuard (4-5 Unit Tests)**

**Test Scope:**
- Route access allowed if authenticated
- Route access denied if not authenticated
- Redirect to login on denial
- Return false for canActivate on auth failure

---

## SECTION 5: RISK-BASED TESTING MATRIX

| Module | Business Risk | Technical Risk | Priority | Test Depth | Unit Tests | Integration | E2E |
|--------|---------------|----------------|----------|-----------|------------|-------------|-----|
| **Risk Calculation Engine** | **CRITICAL** | **CRITICAL** | **P0** | **Exhaustive** | 50-70 | 10-15 | 12-15 |
| **Risk Controller** | **CRITICAL** | HIGH | **P0** | Exhaustive | 15-20 | 8-10 | 10-12 |
| **Authentication & Auth** | **CRITICAL** | **CRITICAL** | **P0** | Exhaustive | 20-25 | 6-8 | 10-12 |
| **Report Generation** | **CRITICAL** | HIGH | **P0** | Comprehensive | 10-15 | 8-10 | 6-8 |
| **Wizard Navigation** | **CRITICAL** | MEDIUM | **P0** | Comprehensive | 8-10 | 5-7 | 8-10 |
| **Project CRUD** | HIGH | MEDIUM | **P1** | Comprehensive | 10-15 | 8-10 | 8-10 |
| **Asset Management** | HIGH | MEDIUM | **P1** | Comprehensive | 12-16 | 6-8 | 8-10 |
| **Threat/Vulnerability** | HIGH | MEDIUM | **P1** | Comprehensive | 10-14 | 6-8 | 6-8 |
| **AI Integration (Gemini)** | MEDIUM | **HIGH** | **P0** | Comprehensive | 8-12 | 8-10 | 6-8 |
| **Mitigation Planning** | MEDIUM | LOW | **P1** | Adequate | 6-10 | 4-6 | 4-6 |
| **Validation Logic** | MEDIUM | MEDIUM | **P1** | Adequate | 10-15 | 4-6 | 4-6 |
| **Error Handling** | MEDIUM | MEDIUM | **P1** | Adequate | 8-12 | 6-8 | 6-8 |
| **Data Persistence** | HIGH | HIGH | **P1** | Comprehensive | 12-16 | 12-16 | 4-6 |
| **Configuration** | LOW | MEDIUM | **P2** | Basic | 3-5 | 2-3 | 2 |

**Risk Definitions:**

| Risk Level | Business Impact | Technical Complexity | Example |
|------------|-----------------|----------------------|---------|
| **CRITICAL** | Blocks assessment workflow; compliance violation; audit failure | Complex algorithm; external APIs; multi-entity orchestration | Risk calculation formula; authentication; finalization |
| **HIGH** | Significant workflow disruption; data loss risk; performance impact | Complex queries; edge case handling; transaction management | CRUD operations; cascade deletes; large data sets |
| **MEDIUM** | Workflow inconvenience; data inconsistency; user confusion | Moderate complexity; UI/UX issues; optional features | Validation; error handling; suggestions |
| **LOW** | Cosmetic issues; documentation concerns; non-critical features | Low complexity; isolated components; optional nice-to-haves | Configuration; utilities; formatting |

---

## SECTION 6: TEST COVERAGE STRATEGY

### 6.1 Unit Test Coverage Goals

| Layer | Target | Rationale |
|-------|--------|-----------|
| **Backend Services (Risk, Asset, Mitigation)** | **90%** | Core business logic; calculation correctness critical |
| **Backend Controllers** | **85%** | API contract validation; HTTP semantics important |
| **Backend Repositories** | **80%** | Query accuracy; cascade behavior verification |
| **Backend Entities/Models** | **75%** | Mostly data mapping; covered via service/controller tests |
| **Frontend Components** | **85%** | User interaction, form handling; significant business logic |
| **Frontend Services** | **85%** | HTTP contracts; error handling |
| **Frontend Guards/Interceptors** | **90%** | Security-critical; must cover all paths |

**Coverage Measurement:** JaCoCo (Java) + Istanbul/NYC (TypeScript)

### 6.2 Integration Test Coverage Goals

| Integration Point | Target | Dependencies |
|------------------|--------|--------------|
| **Backend → Database (JPA)** | **90%** | Entity mapping; cascade; transactions |
| **Frontend → Backend (HTTP)** | **85%** | Request/response contracts; error scenarios |
| **Backend Services Orchestration** | **85%** | Multi-service workflows; data flow |
| **Frontend Component → Service** | **80%** | Signal binding; async operations |
| **Wizard Step Coordination** | **80%** | Multi-step state management; validation |
| **External API (Gemini)** | **75%** (mocked) | Success/failure paths; timeout handling |

### 6.3 E2E Test Coverage Goals

| Workflow | Target | Scope |
|----------|--------|-------|
| **Complete Assessment Workflow** | **100%** | Create → Assets → Threats → Risks → Finalize → Report |
| **P0 Critical Workflows** | **100%** | All 6 P0 workflows must pass |
| **P1 Core Workflows** | **80%** | Representative P1 workflows |
| **Error Scenarios** | **70%** | Database offline, API timeout, invalid data |
| **Regression Suite** | **100%** | All prior defects prevented |
| **Account Management** | **100%** | Register → Login → Logout |
| **Risk Calculation Matrix** | **60%** | Representative risk calculations (not exhaustive 810 combinations) |

### 6.4 Acceptance Criteria Coverage

| Target | Coverage | Method |
|--------|----------|--------|
| **All 35 User Stories** | **100%** | Each story > 1 test case per AC + negative scenarios |
| **All Acceptance Criteria (AC1-AC35 across stories)** | **100%** | Test case traceability matrix |
| **Negative Scenarios per Story** | **100%** | Each NS > 1 test case |
| **Business Rules per Story** | **100%** | Each BR validated in tests |

### 6.5 Business Workflow Coverage

| Workflow | Manual TC | Automated TC | Total |
|----------|-----------|--------------|-------|
| W-ASSESS-001 (Project Create) | 5 | 6 | 11 |
| W-ASSESS-002 (Add Assets) | 6 | 8 | 14 |
| W-ASSESS-003 (Threats/Vulns) | 8 | 10 | 18 |
| W-ASSESS-004 (Risk Creation) | 12 | 20 | 32 |
| W-ASSESS-005 (Mitigations) | 6 | 8 | 14 |
| W-ASSESS-006 (Finalize & Report) | 10 | 12 | 22 |
| W-AUTH-001 (Authentication) | 8 | 10 | 18 |
| W-WIZARD-001 (Navigation) | 5 | 8 | 13 |
| **TOTAL** | **60** | **82** | **142** |

---

## SECTION 7: NON-FUNCTIONAL TEST STRATEGY

### 7.1 Performance Testing

| Aspect | Test Objective | Acceptance Criteria | Priority |
|--------|----------------|-------------------|----------|
| **Risk Calculation Speed** | Verify threat factor × occurrence × impact calculates <100ms | <100ms for single calculation | P0 |
| **Risk List Load** | 100 risks load in list <2s | <2s with 100 risks | P1 |
| **Report Generation** | HTML report generates <5s for 50 risks | <5s | P1 |
| **Database Query Performance** | findByProjectId on 1000 records <500ms | <500ms | P1 |
| **AI Suggestion API** | Gemini API response <10s with timeout 15s | <10s typical, 15s timeout | P0 |
| **Wizard Navigation** | Step change <500ms | <500ms | P2 |

### 7.2 Reliability & Error Recovery

| Aspect | Test Objective | Acceptance Criteria | Priority |
|--------|----------------|-------------------|----------|
| **Database Connection Loss** | App recovers gracefully; user sees error message | Error message, retry button | P1 |
| **AI API Unavailable** | Feature disabled; rest of app functional | Graceful degradation message | P0 |
| **Network Timeout** | Timeout after 15s; user prompted retry | Retry succeeds on resume | P1 |
| **Session Expiration** | User redirected to login; data preserved | Login required, no data loss | P0 |
| **Crash Recovery** | Data persisted before crash; resume assessment | Data recovery on reopen | P1 |

### 7.3 Data Integrity

| Aspect | Test Objective | Acceptance Criteria | Priority |
|--------|----------------|-------------------|----------|
| **Cascade Deletes** | Delete project → deletes all assets/risks/mitigations | All cascade verified | P0 |
| **Orphan Prevention** | Risk references non-existent asset → prevented | FK constraint enforced | P0 |
| **Transaction Rollback** | Error in risk creation → no partial data | All-or-nothing semantics | P0 |
| **Duplicate Prevention** | Duplicate risk (same Asset+Threat+Vuln) rejected | FK + unique constraint | P1 |
| **Referential Integrity** | All foreign keys valid; no dangling references | DB integrity audit | P1 |

### 7.4 Security Testing

| Aspect | Test Objective | Acceptance Criteria | Priority |
|--------|----------------|-------------------|----------|
| **Authentication Bypass** | Unauthenticated access to protected routes denied | 401/403 responses | P0 |
| **Authorization Bypass** | User1 cannot access User2's projects | 403 Forbidden | P0 |
| **SQL Injection** | Malicious input in search fields filtered | No SQL errors; input sanitized | P0 |
| **XSS Prevention** | Script tags in project name displayed safely | Script rendered as text, not executed | P0 |
| **CSRF Protection** | Token validation on state-changing requests | CSRF token required | P1 |
| **Password Storage** | Passwords stored as BCrypt hash, never plain text | Hash format "$2a$10$..." verified | P0 |
| **Session Hijacking** | Stolen token → session terminated if detected | Token expiration enforced | P1 |
| **Rate Limiting** | Brute force attacks blocked after 5 failures | 15-min lockout enforced | P0 |

### 7.5 Availability & Scalability (Within Single-User Context)

| Aspect | Test Objective | Acceptance Criteria | Priority |
|--------|----------------|-------------------|----------|
| **Large Assessment** | 500 risks in single project load/operate normally | <5s load; <2s risk update | P2 |
| **Large File Upload** | 10MB file attachment upload succeeds | Upload, download verified | P1 |
| **Browser Compatibility** | Electron Chromium version 31+ rendering correct | Consistent UI across platforms | P2 |
| **Memory Usage** | App memory <300MB with 100 risks | Stable, no memory leaks | P2 |

---

## SECTION 8: TEST ENVIRONMENT STRATEGY

### 8.1 Environment Requirements

**Development Environment:**
- Windows 10/11 or macOS 12+
- Node.js 18+ (Frontend, Electron)
- Java 17 LTS (Backend)
- Maven 3.8+
- npm 9+

**Test Execution Environment:**
- Same as development (single machine)
- Spring Boot running on localhost:8080
- Angular dev server on localhost:4200
- Electron app running in test mode

**CI/CD Environment (GitHub Actions):**
- Ubuntu 22.04 LTS runner
- All development tools installed
- MySQL test database provisioned
- Playwright browsers installed

### 8.2 Application Dependencies

| Component | Purpose | Test Strategy |
|-----------|---------|----------------|
| **Spring Boot 3.3** | Backend framework | Unit/integration tests via Mockito/TestBed |
| **Angular 18** | Frontend framework | Unit/E2E tests via Karma/Playwright |
| **H2 Database** | Embedded DB | @DataJpaTest for repository tests |
| **Google Gemini API** | AI suggestions | Mock via WireMock or custom stubs |
| **HttpClient** | HTTP communication | MockHttpClient / HttpTestingController |

### 8.3 External Services (Mock/Stub Requirements)

| Service | Mock Type | Purpose | Scenarios |
|---------|-----------|---------|-----------|
| **Gemini API** | WireMock HTTP stubserver | Threat/vulnerability AI suggestions | Success (200), Timeout (504), Offline (no response) |
| **System Clock** | Mockito Clock bean | Timestamp testing | Future dates, past dates, DST transitions |
| **File System** | Mockito FileService | Attachment upload/download | Success, permission denied, disk full |

### 8.4 Test Data Requirements

**Seed Data (Initial DB State):**
- 1 test user (username: testuser, email: test@org.com, password: TestPass123!)
- 2 test projects (owned by testuser)
- 5 test business assets per project
- 3 test threats per project
- 5 test vulnerabilities per project

**Dynamic Test Data (Created During Tests):**
-Generated via TestDataBuilder factory pattern
- Factory creates complete assessment with all related entities
- Cleanup via @Test tearDown / @DataJpaTest transaction rollback

### 8.5 Browser & Automation Requirements

**Browsers:**
- Electron 31+ (Chromium) - Primary
- Chrome 125+ (if web version deployed)
- Firefox 122+ (if web version deployed)

**Automation Framework:**
- Playwright 1.40+ (E2E and API testing)
- JUnit 5 (Backend unit tests)
- Jasmine 5.x + Karma (Frontend unit tests)
- Cucumber-JVM 7.x (BDD scenario execution, if needed)

**Testing Libraries:**
- Mockito 5.x (Java mocking)
- WireMock 3.x (HTTP mocking)
- TestFX (JavaFX automation, if applicable)
- Selenium (alternative to Playwright)

---

## SECTION 9: AUTOMATION STRATEGY

### 9.1 Automation Scope

| Category | Automation Candidates | Manual Only |
|----------|----------------------|------------|
| **Unit Tests** | 100% (backend services, controllers, repositories, entities, frontend components/services) | None |
| **Integration Tests** | 100% (API contracts, database transactions, service orchestration) | None |
| **E2E Workflows** | 80% (critical and P0/P1 workflows; mocked external APIs) | Complex user judgment scenarios |
| **Negative Testing** | 90% (invalid inputs, error cases, edge conditions) | Accessibility, visual regression |
| **Security Testing** | 70% (auth bypass, XSS, SQL injection; automated); 30% manual review | Penetration testing (manual), compliance audit (manual) |
| **Regression Testing** | 100% (automated daily suite covering all prior defects) | None |
| **Performance Testing** | High-value performance gates automated; stress testing manual | Load testing >10 concurrent users (manual) |

**Automation Coverage:**

| Test Type | Automation Rate | Tools |
|-----------|-----------------|-------|
| **Smoke Testing** | 100% | Playwright E2E |
| **Unit Tests** | 100% | JUnit 5, Jasmine |
| **Functional Tests** | 95% | Playwright E2E, Jasmine/Karma |
| **Integration Tests** | 95% | Cucumber, Playwright API, HttpTestingController |
| **Regression Tests** | 100% | Playwright E2E suite (daily) |
| **Negative Tests** | 90% | Unit tests + E2E edge cases |
| **Boundary Tests** | 95% | Unit tests (comprehensive input matrix) |
| **Security Tests** | 70% | OWASP ZAP (optional); manual security review |
| **Performance Tests** | 80% | k6 (load), Lighthouse (performance audit) |

### 9.2 Automation Priorities

**Phase 1 (Weeks 1-2): Critical Path E2E + Unit Tests**
- Smoke test: Create project → Add assets → Create risk → Finalize → Generate report
- Unit tests for RiskCalculationService (50+ cases)
- Unit tests for Authentication (20+ cases)
- E2E test for complete assessment workflow
- **Effort:** 60+ hours

**Phase 2 (Weeks 3-4): Full P0 Coverage**
- All P0 workflows E2E tests (6 workflows)
- Unit tests for Risk controller (15+ cases)
- Unit tests for all P0 services (100+ cases)
- API integration tests (30+ cases)
- **Effort:** 80+ hours

**Phase 3 (Weeks 5-6): P1 Coverage + Regression**
- P1 workflow E2E tests (representative scenarios)
- P1 service/component unit tests (120+ cases)
- Regression suite automation (all prior defects)
- Performance baseline tests (5+ key operations)
- **Effort:** 100+ hours

**Phase 4 (Week 7): Edge Cases + Accessibility**
- Boundary value testing (large datasets, limit values)
- Error scenario E2E (DB offline, API timeout)
- Visual regression testing (if applicable)
- Accessibility audit (manual + tools)
- **Effort:** 40+ hours

**Total Automation Effort:** ~280 hours (6-7 weeks for 1 QA engineer)

### 9.3 Automation Feasibility by Workflow

| Workflow | Feasibility | Tools | Notes |
|----------|-------------|-------|-------|
| **W-ASSESS-001 (Create Project)** | **HIGH** | Playwright E2E | Simple form; no external dependencies |
| **W-ASSESS-002 (Add Assets)** | **HIGH** | Playwright + Unit | Table operations, form handling |
| **W-ASSESS-003 (Threats/Vulns)** | **MEDIUM** | Playwright + Mocked Gemini | External API requires mocking; complex suggestion selection |
| **W-ASSESS-004 (Create Risk)** | **HIGH** | Playwright + Unit | Calculation verification; no external deps |
| **W-ASSESS-005 (Mitigations)** | **HIGH** | Playwright | Straightforward form entry |
| **W-ASSESS-006 (Report)** | **MEDIUM** | Playwright + HTML validation | File download; HTML/PDF content verification complex |
| **W-AUTH-001 (Authentication)** | **HIGH** | Playwright + Unit | Standard auth flows; well-understood patterns |
| **W-WIZARD-001 (Navigation)** | **MEDIUM** | Playwright | Multi-step state tracking; session persistence |

### 9.4 Recommended Automation Framework

**Backend Testing:**
- **Framework:** JUnit 5 (Jupiter)
- **Mocking:** Mockito 5.x
- **Assertions:** AssertJ (fluent API)
- **Test Data:** TestDataBuilder, @ParameterizedTest for matrix testing
- **Integration:** @DataJpaTest, @SpringBootTest
- **Reporting:** JUnit reporting + custom JSON reporter for CI/CD

**Frontend Testing:**
- **Framework:** Jasmine 5.x + Karma test runner
- **Mocking:** Jasmine spies + HttpTestingController
- **E2E:** Playwright 1.40+
- **Page Objects:** PageObjectModel pattern for maintainability
- **Assertions:** Expect assertions + custom matchers
- **CI Integration:** Playwright report HTML + JUnit XML output

**Test Organization:**
```
backend/src/test/java/com/thalesgroup/isra/
  ├─ unit/
  │  ├─ service/
  │  │  ├─ RiskCalculationServiceTest.java (50+ tests)
  │  │  ├─ RiskServiceTest.java (25+ tests)
  │  │  └─ AuthServiceTest.java (20+ tests)
  │  ├─ controller/
  │  │  ├─ RiskControllerTest.java (20+ tests)
  │  │  ├─ IsraProjectControllerTest.java (15+ tests)
  │  │  └─ AuthControllerTest.java (18+ tests)
  │  └─ repository/
  │     ├─ IsraProjectRepositoryTest.java (6 tests)
  │     └─ RiskRepositoryTest.java (6 tests)
  └─ integration/
     ├─ RiskWorkflowIntegrationTest.java
     ├─ ApiEndToEndTest.java
     └─ DataPersistenceTest.java

frontend/src/
  ├─ risks/
  │  ├─ risks.component.spec.ts (30+ tests)
  │  ├─ risks.component.e2e.ts (8 Playwright tests)
  │  └─ risks.service.spec.ts (15+ tests)
  ├─ auth/
  │  ├─ login.component.spec.ts (12+ tests)
  │  ├─ auth.guard.spec.ts (6 tests)
  │  └─ auth.service.spec.ts (20+ tests)
  ├─ shared/
  │  └─ project.service.spec.ts (18+ tests)
  └─ e2e/
     ├─ assessment-workflow.e2e.ts (platform: Playwright)
     ├─ risk-calculation.e2e.ts
     └─ auth.e2e.ts
```

---

## SECTION 10: TRACEABILITY MATRIX

### 10.1 User Story to Test Coverage Mapping

| # | Story ID | Epic | Module | Priority | Acceptance Criteria Count | Test Types | Est. Test Cases |
|----|----------|------|--------|----------|------------------------|-----------|-----------------|
| 1 | US-ASSESS-001 | Assessment Mgmt | Project Management | P0 | 12 | Functional, Negative, Integration, Security | 11 |
| 2 | US-ASSESS-002 | Assessment Mgmt | Project Management | P0 | 6 | Functional, Integration | 8 |
| 3 | US-ASSESS-003 | Assessment Mgmt | Project Management | P1 | 8 | Functional, Validation, Regression | 9 |
| 4 | US-ASSESS-004 | Assessment Mgmt | Project Management | P1 | 13 | Functional, Negative, Validation | 12 |
| 5 | US-ASSESS-005 | Assessment Mgmt | Project Management | P1 | 9 | Functional, Negative, Integration | 10 |
| 6 | US-ASSET-001 | Business Asset Mgmt | Asset Management | P0 | 12 | Functional, Negative, Boundary, Validation | 14 |
| 7 | US-ASSET-002 | Business Asset Mgmt | Asset Management | P1 | 6 | Boundary, Validation | 8 |
| 8 | US-ASSET-003 | Business Asset Mgmt | Asset Management | P1 | 13 | Functional, Negative, Integration | 14 |
| 9 | US-ASSET-004 | Business Asset Mgmt | Asset Management | P1 | 8 | Functional, Negative, Integration | 9 |
| 10 | US-SUPP-001 | Supporting Asset Mgmt | Asset Management | P1 | 12 | Functional, Negative, Validation | 14 |
| 11 | US-SUPP-002 | Supporting Asset Mgmt | Asset Management | P1 | 9 | Functional, Integration | 10 |
| 12 | US-THREAT-001 | Threat Management | Threat Management | P0 | 10 | Functional, Negative, Validation | 12 |
| 13 | US-THREAT-002 | Threat Management | AI Integration | P0 | 11 | Functional, Negative, Integration | 14 |
| 14 | US-VULN-001 | Vulnerability Mgmt | Vulnerability Management | P1 | 14 | Functional, Negative, Boundary, Validation | 16 |
| 15 | US-VULN-002 | Vulnerability Mgmt | Vulnerability Management | P1 | 8 | Functional, Integration | 9 |
| 16 | US-VULN-003 | Vulnerability Mgmt | Vulnerability Management | P1 | 7 | Functional, Negative, Integration | 8 |
| 17 | US-VULN-004 | Vulnerability Mgmt | AI Integration | P1 | 9 | Functional, Negative, Integration | 12 |
| 18 | US-RISK-001 | Risk Management | Risk Management | P0 | 17 | Functional, Negative, Boundary, Validation, **Calculation** | **32** |
| 19 | US-RISK-002 | Risk Management | Risk Management | P0 | 9 | Functional, **Calculation Verification**, Boundary | **24** |
| 20 | US-RISK-003 | Risk Management | Risk Management | P1 | 11 | Functional, Integration | 12 |
| 21 | US-RISK-004 | Risk Management | Risk Management | P1 | 8 | Functional, Negative, Integration | 9 |
| 22 | US-RISK-005 | Risk Management | Risk Management | P1 | 10 | Functional, Negative, Integration | 11 |
| 23 | US-MITIG-001 | Mitigation Planning | Risk Treatment | P0 | 13 | Functional, Negative, Validation, Calculation | 15 |
| 24 | US-MITIG-002 | Mitigation Planning | Risk Treatment | P1 | 10 | Functional, Integration | 11 |
| 25 | US-REPORT-001 | Report Generation | Assessment Lifecycle | P0 | 12 | Functional, Negative, Integration | 13 |
| 26 | US-REPORT-002 | Report Generation | Report Generation | P0 | 12 | Functional, Integration, Content Validation | 14 |
| 27 | US-REPORT-003 | Report Generation | Report Generation | P0 | 9 | Functional, Integration, Format Validation | 10 |
| 28 | US-REPORT-004 | Report Generation | Report Generation | P1 | 8 | Functional, Integration, Format Validation | 9 |
| 29 | US-AUTH-001 | Authentication & Authz | Authentication | P0 | 13 | Functional, Negative, Validation, Security | 16 |
| 30 | US-AUTH-002 | Authentication & Authz | Authentication | P0 | 12 | Functional, Negative, Security | 15 |
| 31 | US-AUTH-003 | Authentication & Authz | Authentication | P1 | 8 | Functional, Integration | 9 |
| 32 | US-AUTH-004 | Authentication & Authz | Authorization | P0 | 6 | Functional, Security | 8 |
| 33 | US-AUTH-005 | Authentication & Authz | Authorization | P0 | 7 | Functional, Integration, Security | 9 |
| 34 | US-CONFIG-001 | Configuration Mgmt | System Configuration | P1 | 7 | Functional, Integration, Validation | 8 |
| 35 | US-WIZARD-001 | Assessment Mgmt | Assessment Workflow | P0 | 10 | Functional, Negative, Integration | 13 |

**TOTAL:** 35 Stories → **425+ Test Cases** across unit, integration, and E2E testing

---

## SECTION 11: ENTRY CRITERIA

**Pre-Test Execution Gates:**

| Gate | Criteria | Owner | Verification |
|------|----------|-------|--------------|
| **Code Completeness** | All 35 user stories implemented in source code | Development Team | Code review + compile validation |
| **Unit Tests Passing** | 90% of backend unit tests passing (RiskCalcService, Controllers, Repos) | Development Team | CI/CD pipeline (JUnit reports) |
| **Frontend Build Success** | Angular build completes without errors; Webpack bundle created | Frontend Team | npm build script success |
| **Backend Build Success** | Maven build succeeds; Spring Boot JAR created | Backend Team | Maven build script success |
| **Test Environment Ready** | H2 database initialized; Spring Boot running on :8080; Angular dev server on :4200 | DevOps/QA | Service health checks |
| **Mock Services Available** | WireMock configured for Gemini API; test data seeded | QA Team | WireMock verification; DB record count |
| **Automation Framework Setup** | Playwright installed; Jasmine/Karma configured; JUnit 5 configured | QA Team | Test execution (sample smoke test) |
| **Acceptance Criteria Clarity** | All 35 stories with clear AC1-AC(N) statements | Product Owner | Story review sign-off |
| **No Critical Defects Open** | P0 defects identified in pre-testing closed or waived | QA Lead | Defect triage review |
| **Test Plan Approved** | This test plan reviewed and approved by stakeholders | QA Lead + PM | Sign-off documentation |

---

## SECTION 12: EXIT CRITERIA

**Test Completion Gates (Release Readiness):**

| Gate | Criteria | Measurement | Owner |
|------|----------|-------------|-------|
| **P0 Test Execution 100%** | All P0 user stories tested (stories #1-6, 12-13, 18-19, 23, 25-27, 29-30, 32-33, 35) | Test execution report | QA Lead |
| **P0 Tests Passed ≥95%** | 95%+ of P0 test cases passed (allowable: max 5% critical warnings) | JUnit/Playwright pass rate | QA Lead |
| **P1 Test Execution ≥80%** | 80%+ of P1 user stories tested | Test coverage report | QA Lead |
| **Critical Defects = 0** | No open P0 defects blocking release | Defect triage zero | QA Lead |
| **High Priority Defects ≤3** | Max 3 high-impact P1 defects; all documented/deferred | Defect register | QA Lead |
| **Unit Test Coverage ≥90%** | Backend code coverage ≥90% (services, controllers); frontend ≥85% | JaCoCo/Istanbul reports | Development |
| **Integration Tests ≥85%** | API endpoints, database transactions verify correctly | Integration test report | QA Team |
| **Regression Tests Passed** | All automated regression tests pass (prior defect prevention) | Regression suite results | QA Team |
| **E2E Smoke Test Passed** | Critical workflow (Create → Assets → Risks → Report) passes end-to-end | Smoke test report | QA Team |
| **Security Testing Complete** | Auth bypass, XSS, SQL injection vulnerability scans passed | OWASP scan results | Security Lead |
| **Performance Baselines Met** | Risk calculation <100ms, risk list load <2s, report gen <5s | Performance test report | QA Lead |
| **Documentation Complete** | Test plan, test cases, known issues documented | Documentation sign-off | QA Lead |
| **Stakeholder Sign-Off** | Product Owner, Tech Lead, Release Manager approve | Sign-off document | Release Manager |

---

## SECTION 13: TEST EXECUTION PHASES

### 13.1 Phased Test Execution Schedule

**Phase 1: Smoke Testing (Day 1-2) – 2 test execution days**
- **Scope:** Critical path validation only
- **Tests:** 10-15 smoke test cases (no detailed functional testing)
- **Effort:** 8-12 hours
- **Objective:** Verify application launches, core workflows don't crash
- **Critical Path:**
  - User registration and login
  - Create project
  - Add asset
  - Create risk
  - Finalize assessment
  - Generate report
- **Success Criteria:** Smoke tests ≥95% pass rate
- **Blocker for Phase 2:** P0 smoke tests must pass

---

**Phase 2: P0 Functional & Calculation Testing (Day 3-8) – 5 test execution days**
- **Scope:** All P0 (business critical) user stories
- **Tests:** 120-140 test cases from 15 P0 stories
- **Effort:** 50-60 hours
- **Key Focus:**
  - Risk calculation accuracy (50+ calculation verification tests)
  - Risk controller CRUD (20+ tests)
  - Authentication flows (25+ tests)
  - Report generation (15+ tests)
  - Wizard navigation (12+ tests)
- **Success Criteria:** P0 tests ≥95% pass rate; calculation accuracy 100%
- **Blockers for Phase 3:** Critical defects fixed; P0 pass rate ≥95%

---

**Phase 3: P0 Integration Testing (Day 9-11) – 3 test execution days**
- **Scope:** P0 API contracts, database interactions, service orchestration
- **Tests:** 40-50 integration tests
- **Effort:** 30-40 hours
- **Key Focus:**
  - Database cascade operations
  - Transaction handling and rollback
  - API response contracts
  - Service-to-service calls
  - External API (Gemini) mocking
- **Success Criteria:** Integration tests ≥90% pass rate
- **Blockers for Phase 4:** Integration defects resolved

---

**Phase 4: P1 Functional Testing (Day 12-16) – 4 test execution days**
- **Scope:** P1 (core business) user stories (#3-5, 7-10, 14-17, 20-22, 24, 28, 31, 34)
- **Tests:** 140-160 test cases from 20 P1 stories
- **Effort:** 60-70 hours
- **Parallel:** Can run alongside Phase 3 if resources allow
- **Success Criteria:** P1 tests ≥85% pass rate
- **Blockers for Phase 5:** P1 defects triaged

---

**Phase 5: Regression & Negative Testing (Day 17-19) – 3 test execution days**
- **Scope:** Automated regression suite + negative scenarios
- **Tests:** 80-100 regression + 50-70 negative scenario tests
- **Effort:** 40-50 hours
- **Key Focus:**
  - Prior defect prevention
  - Invalid inputs, boundary values
  - Error handling and recovery
  - Edge cases and corner scenarios
- **Success Criteria:** Regression tests ≥95% pass rate; negative tests ≥85% pass
- **Blockers for Phase 6:** Regression blockages resolved

---

**Phase 6: Automation Execution & E2E Validation (Day 20-22) – 3 test execution days**
- **Scope:** Full automation suite execution (unit, integration, E2E)
- **Tests:** 400+ automated tests from Phases 1-5
- **Effort:** 30-40 hours (automation execution)
- **Key Focus:**
  - Complete E2E assessment workflow (Playwright)
  - All automated test suite pass/fail
  - Coverage report generation
  - Performance baseline validation
- **Success Criteria:** Automation pass rate ≥95%; coverage targets met
- **Blockers for Phase 7:** Automation failures resolved

---

**Phase 7: Release Validation (Day 23-24) – 2 test execution days**
- **Scope:** Final acceptance and readiness verification
- **Tests:** Smoke test re-run + compliance checklist
- **Effort:** 16-20 hours
- **Key Focus:**
  - User acceptance testing (UAT) scenarios
  - Release notes verification
  - Security audit completion
  - Performance benchmarking
  - Documentation final review
- **Success Criteria:** UAT pass rate 100%; all exit criteria met
- **Deliverable:** Release certification document

---

### 13.2 Parallel Testing Opportunities

**Parallel Streams (to compress timeline):**
- **Stream A:** Backend unit tests + API integration tests (Days 3-8)
- **Stream B:** Frontend component tests + E2E workflows (Days 3-8)
- **Stream C:** Database transaction tests (Days 9-11)
- **Merge Point:** Day 12 (P1 testing, combined results)

**Estimated Parallel Timeline:** 16-18 test execution days (vs. 24 sequential)

---

## SECTION 14: QUALITY GATES & RELEASE READINESS

### 14.1 Progressive Quality Gates

| Gate # | Gate Name | Trigger | Entry Criteria | Decision |
|--------|-----------|---------|---|----------|
| **Gate 1** | Repository Completeness | Code commit | All 35 stories code-complete | Go / No-Go to testing |
| **Gate 2** | Unit Test Coverage | Test run | Unit tests ≥90% pass rate; coverage ≥90% | Go / No-Go to Phase 3 |
| **Gate 3** | P0 Functional Ready | Phase 2 complete | P0 tests ≥95% pass; calc 100% accurate | Go / No-Go to Phase 3 |
| **Gate 4** | P0 Integration Ready | Phase 3 complete | Integration tests ≥90% pass; DB integrity verified | Go / No-Go to Phase 4 |
| **Gate 5** | P1 Functional Ready | Phase 4 complete | P1 tests ≥85% pass; defects triaged | Go / No-Go to Phase 5 |
| **Gate 6** | Regression Ready | Phase 5 complete | Regression ≥95% pass; automation stable | Go / No-Go to Phase 6 |
| **Gate 7** | Automation Ready | Phase 6 complete | Automation ≥95% pass; coverage targets met | Go / No-Go to Phase 7 |
| **Gate 8** | Release Ready | Phase 7 complete | All exit criteria met; UAT signed off | GO / NO-GO (Release) |

### 14.2 Defect Severity Classification

| Severity | Definition | Example | Exit Criteria |
|----------|-----------|---------|---|
| **Critical** | Application crash; data loss; security breach; compliance violation | Risk calculation wrong by >10%; auth bypass; SQL injection | **0 Critical** (blocking release) |
| **High** | Significant functionality broken; core workflows blocked; data inconsistency | Risk CRUD fails; report generation fails; cascade delete broken | **≤3 High** (allowed with leadership approval) |
| **Medium** | Known limitation; workaround exists; non-core feature impacted | Slow performance (>5s); UI glitch; minor validation missing | **≤10 Medium** (documented) |
| **Low** | Cosmetic; documentation; typo | UI spacing issue; tooltip missing; log message unclear | **No limit** (backlog for v2) |

### 14.3 Release Decision Matrix

| P0 Pass Rate | P1 Pass Rate | Critical Defects | High Defects | Decision |
|---|---|---|---|---|
| ≥95% | ≥80% | 0 | 0-3 | ✅ **APPROVED FOR RELEASE** |
| 90-94% | ≥75% | 0 | 0-3 | ⚠️ **APPROVED WITH RISK (leadership sign-off)** |
| 85-89% | 70-74% | 0 | 4-6 | ❌ **HOLD - Fix & Retest** |
| <85% | <70% | >0 | >6 | ❌ **BLOCKED - Significant work required** |

---

## SECTION 15: TEST PLAN SUMMARY

### 15.1 Scope Summary

| Dimension | Count | Status |
|-----------|-------|--------|
| **Total Epics Covered** | 10 | ✅ Complete |
| **Total Workflows Discovered** | 8 (6 primary + 2 secondary) | ✅ Covered |
| **Total User Stories** | 35 repository-derived stories | ✅ Mapped to tests |
| **Total Acceptance Criteria** | ~300+ AC across 35 stories | ✅ 100% coverage target |
| **P0 Stories (Business Critical)** | 15 stories | ✅ Exhaustive testing |
| **P1 Stories (Core)** | 18 stories | ✅ Comprehensive testing |
| **P2 Stories (Supporting)** | 2 stories | ✅ Adequate testing |
| **Source Files Analyzed** | 73 files (42 Java, 27 TypeScript, 4 JavaScript) | ✅ Complete codebase |

### 15.2 Test Coverage Summary

| Coverage Type | Target | Status |
|---|---|---|
| **Unit Test Coverage** | 90% (backend services) | 🔄 In planning |
| **Integration Test Coverage** | 85% (API layer + DB) | 🔄 In planning |
| **E2E Workflow Coverage** | 80% (critical + P0 workflows) | 🔄 In planning |
| **Acceptance Criteria Coverage** | 100% (all AC across all stories) | 🔄 In planning |
| **Business Story Coverage** | 100% (all 35 stories) | 🔄 In planning |
| **Automation Coverage** | 80-90% of all test cases | 🔄 In planning |

### 15.3 Estimated Testing Effort

| Phase | Duration | Effort (hours) | Team |
|---|---|---|---|
| **Phase 1: Smoke** | 2 days | 12 | 1 QA engineer |
| **Phase 2: P0 Functional** | 5 days | 55 | 1-2 QA engineers |
| **Phase 3: P0 Integration** | 3 days | 35 | 1 QA engineer |
| **Phase 4: P1 Functional** | 4 days | 65 | 2 QA engineers (parallel) |
| **Phase 5: Regression/Negative** | 3 days | 50 | 2 QA engineers |
| **Phase 6: Automation** | 3 days | 35 | QA automation engineer |
| **Phase 7: Release Validation** | 2 days | 18 | 1 QA lead |
| **Planning + Setup** | 1 week | 30 | QA team |
| **Automation Development** | 6-7 weeks | 280 | QA automation engineer (parallel to manual)

| **TOTAL** | **~24 days sequential** (16-18 days parallel) | **~580 hours** | 4 QA team members |

---

### 15.4 Automation Scope Summary

| Category | Automated | Manual | Total |
|---|---|---|---|
| **Smoke Tests** | 100% (10-15 cases) | 0% | 10-15 |
| **Unit Tests** | 100% (300+ cases) | 0% | 300+ |
| **Integration Tests** | 100% (100+ cases) | 0% | 100+ |
| **E2E Workflows** | 80% (25-30 cases) | 20% (complex judgment) | 30-40 |
| **Functional Tests** | 95% (350+ cases) | 5% (accessibility, UX) | 360+ |
| **Negative Tests** | 90% (100+ cases) | 10% (manual pentesting) | 110+ |
| **Regression Tests** | 100% (80+ cases) | 0% | 80+ |
| **Security Tests** | 70% (automated scans) | 30% (manual audit) | 60+ |
| **Overall** | **~85-90%** | 10-15% | **1,150+ test cases** |

---

### 15.5 Remaining Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Risk Calculation Algorithm Complexity** | HIGH | CRITICAL | Exhaustive calculation test matrix (810 combinations); third-party algorithm validation |
| **External API (Gemini) Integration** | HIGH | HIGH | Comprehensive mocking with WireMock; offline scenario testing; timeout handling |
| **Multi-Entity Cascade Behavior** | MEDIUM | HIGH | Dedicated cascade delete test cases; database constraint validation |
| **Data Integrity in Large Datasets** | MEDIUM | MEDIUM | Performance tests with 500+ risks; memory leak detection; concurrent access (if applicable) |
| **Authentication/Session Management Gaps** | MEDIUM | CRITICAL | Rate limiting tests; token expiration; session hijacking scenarios |
| **Report Generation Content Completeness** | MEDIUM | MEDIUM | HTML/PDF content validation; template accuracy; cross-browser verification |
| **Browser Compatibility** | LOW | MEDIUM | Electron Chromium 31+ primary; secondary Chrome/Firefox if web deployment occurs |
| **AI Suggestion Quality** | LOW | LOW | Gemini API vendor responsibility; testing only success/failure paths |

---

### 15.6 Release Confidence Assessment

| Criteria | Status | Confidence |
|---|---|---|
| **Repository Analysis Complete** | ✅ 73 files analyzed; 35 stories derived | 95% |
| **Test Coverage Design** | ✅ 1,150+ test cases planned | 90% |
| **Automation Strategy Clear** | ✅ Budget 280+ hours; tools selected | 85% |
| **Calculation Accuracy** | 🔄 Design ready; execution pending | 80% |
| **Workflow Completeness** | ✅ All 8 workflows documented | 95% |
| **Risk Mitigation** | ✅ Key risks identified & mitigated | 85% |
| **Team Capability** | 🔄 Assumes 4 QA engineers trained | 80% |
| **Timeline Feasibility** | 🔄 16-18 days execution (parallel) | 75% |

**OVERALL RELEASE CONFIDENCE: 85-90% (HIGH)**

---

## APPENDIX: References & Related Documents

1. **generated/project-context.md** - Business domain, architecture, entities, workflows
2. **generated/source-inventory.md** - Source file locations, criticality, complexity classification
3. **generated/user-stories.md** - 35 user stories with acceptance criteria and negative scenarios
4. **prompts/test-plan-generator.md** - Test plan generation instructions (this document's source)
5. **prompts/test-case-generator.md** - Detailed test case generation (next phase)
6. **prompts/automation-generator.md** - Automation code generation (next phase)

---

*Test Plan Generated: June 24, 2026*  
*Test Manager:** Principal QA Architect  
*Classification:** Business Critical Testing Strategy  
*Status:** Ready for Execution  
*Next Step:** Test Case Generation (Phase 1)
