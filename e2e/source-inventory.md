# ISRA 2.0 - COMPLETE SOURCE CODE INVENTORY
## Source-to-Test Traceability Matrix

**Analysis Date:** June 24, 2026  
**Repository:** security-assessment-tool (ISRA 2.0)  
**Analyzer Role:** Principal Software Architect, QA Architect, Test Coverage Specialist  

---

## EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| **Total Source Files** | 55 |
| **Backend Java Files** | 25 |
| **Frontend TypeScript Files** | 26 |
| **Electron + Build Scripts** | 4 |
| **Total Lines of Code** | ~10,500 |
| **Existing Test Files** | 3 |
| **Existing Test Cases** | ~3 |
| **Current Coverage** | <5% |
| **Files with Tests** | 1 |
| **Files Without Tests** | 54 |
| **P0 (Business Critical) Files** | 12 |
| **P1 (Core Business) Files** | 28 |
| **P2 (Supporting) Files** | 15 |
| **Priority 1 Generation Priority** | 40 files |
| **Priority 2 Generation Priority** | 10 files |
| **Priority 3 Generation Priority** | 5 files |

---

## PART 1: BACKEND JAVA CONTROLLERS (7 files)

### 1.1 File: backend/src/main/java/com/thalesgroup/isra/controller/IsraProjectController.java

**Category:** Project Management Controller  
**Business Criticality:** P0 (CRITICAL)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.controller  
**Type:** REST Controller (Project CRUD)  
**Complexity:** MEDIUM  
**LOC:** ~130

**Exports (Public Methods):**
- `getAllProjects(username: String)` → `ResponseEntity<List<IsraProject>>` `GET /api/projects`
- `getProjectById(id: Long)` → `ResponseEntity<IsraProject>` `GET /api/projects/{id}`
- `createProject(project: CreateProjectRequest, username: String)` → `ResponseEntity<IsraProject>` `POST /api/projects`
- `updateProject(id: Long, project: UpdateProjectRequest)` → `ResponseEntity<IsraProject>` `PUT /api/projects/{id}`
- `deleteProject(id: Long)` → `ResponseEntity<Void>` `DELETE /api/projects/{id}`

**External Dependencies:**
- `IsraProjectRepository` (data access)
- `FileStorageService` (attachment handling)
- Spring Web (REST annotations, ResponseEntity)
- Spring Security (authentication context)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Owner OID resolution logic from authenticated user
- Project CRUD operations (create, read, update, delete)
- Project not found error handling
- Duplicate project name handling
- Project ownership validation
- HTTP status code assertions (200, 201, 404, 409)
- Request body validation
- Response transformation

**Test Generation Estimated Effort:** 8-10 test cases (2-3 hours)

---

### 1.2 File: backend/src/main/java/com/thalesgroup/isra/controller/RiskController.java

**Category:** Risk Assessment Controller  
**Business Criticality:** P0 (CRITICAL)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.controller  
**Type:** REST Controller (Risk CRUD + Calculation Orchestration)  
**Complexity:** VERY HIGH  
**LOC:** ~200+

**Exports (Public Methods):**
- `getRisks(projectId: Long)` → `ResponseEntity<List<Risk>>` `GET /api/projects/{projectId}/risks`
- `addRisk(projectId: Long, riskRequest: CreateRiskRequest)` → `ResponseEntity<Risk>` `POST /api/projects/{projectId}/risks`
- `updateRisk(projectId: Long, id: Long, riskRequest: UpdateRiskRequest)` → `ResponseEntity<Risk>` `PUT /api/projects/{projectId}/risks/{id}`
- `deleteRisk(projectId: Long, id: Long)` → `ResponseEntity<Void>` `DELETE /api/projects/{projectId}/risks/{id}`
- Threat assessment endpoints (additional methods)

**External Dependencies:**
- `RiskRepository`, `BusinessAssetRepository`, `SupportingAssetRepository`, `VulnerabilityRepository`
- `IsraProjectRepository` (project validation)
- `RiskCalculationService` (core business logic orchestration)
- Spring Transaction (Transactional annotations)
- Spring Web

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE (HIGHEST PRIORITY)

**Missing Coverage:**
- Risk CRUD operations (create, read, update, delete)
- Multi-entity resolution (asset, threat, vulnerability references)
- Risk name auto-generation logic
- Risk calculation invocation
- Threat factor scoring validation
- Occurrence level validation (1-5)
- Likelihood calculation verification
- Mitigation effects application
- Transaction rollback scenarios
- Cascade delete implications
- Entity not found error handling
- Project ownership verification

**Test Generation Estimated Effort:** 15-20 test cases (4-5 hours)

---

### 1.3 File: backend/src/main/java/com/thalesgroup/isra/controller/BusinessAssetController.java

**Category:** Asset Management Controller  
**Business Criticality:** P1 (CORE BUSINESS)  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.controller  
**Type:** REST Controller (Business Asset CRUD)  
**Complexity:** MEDIUM  
**LOC:** ~120

**Exports (Public Methods):**
- `getBusinessAssets(projectId: Long)` → `ResponseEntity<List<BusinessAsset>>` `GET /api/projects/{projectId}/business-assets`
- `addBusinessAsset(projectId: Long, assetRequest: CreateAssetRequest)` → `ResponseEntity<BusinessAsset>` `POST /api/projects/{projectId}/business-assets`
- `updateBusinessAsset(projectId: Long, id: Long, assetRequest: UpdateAssetRequest)` → `ResponseEntity<BusinessAsset>` `PUT /api/projects/{projectId}/business-assets/{id}`
- `deleteBusinessAsset(projectId: Long, id: Long)` → `ResponseEntity<Void>` `DELETE /api/projects/{projectId}/business-assets/{id}`

**External Dependencies:**
- `BusinessAssetRepository` (CRUD)
- `IsraProjectRepository` (project validation)
- `RiskCalculationService` (cascade recalculation on changes)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Asset CRUD operations
- Asset criticality validation (1-5 scale)
- CIA score validation (1-10 range)
- Cascade risk recalculation on asset update
- Asset ID auto-increment logic
- Project existence validation
- Asset not found error handling
- Duplicate asset naming

**Test Generation Estimated Effort:** 8-10 test cases (2-3 hours)

---

### 1.4 File: backend/src/main/java/com/thalesgroup/isra/controller/SupportingAssetController.java

**Category:** Infrastructure Asset Controller  
**Business Criticality:** P1 (CORE BUSINESS)  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.controller  
**Type:** REST Controller (Supporting Asset CRUD)  
**Complexity:** MEDIUM  
**LOC:** ~100

**Exports (Public Methods):**
- `getSupportingAssets(projectId: Long)` → `ResponseEntity<List<SupportingAsset>>` `GET /api/projects/{projectId}/supporting-assets`
- `addSupportingAsset(projectId: Long, assetRequest: CreateAssetRequest)` → `ResponseEntity<SupportingAsset>` `POST /api/projects/{projectId}/supporting-assets`
- `updateSupportingAsset(projectId: Long, id: Long, assetRequest: UpdateAssetRequest)` → `ResponseEntity<SupportingAsset>` `PUT /api/projects/{projectId}/supporting-assets/{id}`
- `deleteSupportingAsset(projectId: Long, id: Long)` → `ResponseEntity<Void>` `DELETE /api/projects/{projectId}/supporting-assets/{id}`

**External Dependencies:**
- `SupportingAssetRepository` (CRUD)
- `BusinessAssetRepository` (reference validation)
- `IsraProjectRepository`

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Asset CRUD operations
- Asset type validation
- Business asset mapping/resolution
- Asset ID auto-increment
- M:M relationship management
- Cascade delete behavior
- Security level validation (1-4)

**Test Generation Estimated Effort:** 8-10 test cases (2-3 hours)

---

### 1.5 File: backend/src/main/java/com/thalesgroup/isra/controller/VulnerabilityController.java

**Category:** Vulnerability Management Controller  
**Business Criticality:** P1 (CORE BUSINESS)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.controller  
**Type:** REST Controller (Vulnerability CRUD + Batch Operations + File Handling)  
**Complexity:** HIGH  
**LOC:** ~200+

**Exports (Public Methods):**
- `getVulnerabilities(projectId: Long)` → `ResponseEntity<List<Vulnerability>>` `GET /api/projects/{projectId}/vulnerabilities`
- `addVulnerability(projectId: Long, vulnRequest: CreateVulnRequest)` → `ResponseEntity<Vulnerability>` `POST /api/projects/{projectId}/vulnerabilities`
- `updateVulnerability(projectId: Long, id: Long, vulnRequest: UpdateVulnRequest)` → `ResponseEntity<Vulnerability>` `PUT /api/projects/{projectId}/vulnerabilities/{id}`
- `batchUpdateVulnerabilities(projectId: Long, requests: List<VulnUpdateRequest>)` → `ResponseEntity<List<Vulnerability>>` `PUT /api/projects/{projectId}/vulnerabilities/batch` [@Transactional]
- `deleteVulnerability(projectId: Long, id: Long)` → `ResponseEntity<Void>` `DELETE /api/projects/{projectId}/vulnerabilities/{id}`
- `uploadAttachment(projectId: Long, vulnId: Long, file: MultipartFile)` → `ResponseEntity<String>`
- `downloadAttachment(projectId: Long, vulnId: Long)` → `ResponseEntity<Resource>`

**External Dependencies:**
- `VulnerabilityRepository`, `SupportingAssetRepository`, `IsraProjectRepository`
- `FileStorageService` (attachment lifecycle)
- `RiskCalculationService` (cascade recalculation on score changes)
- Spring Transaction (Transactional)
- Spring Web (MultipartFile, Resource)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE (HIGH COMPLEXITY)

**Missing Coverage:**
- Vulnerability CRUD operations
- Batch update with change detection
- Batch update transaction semantics
- CVSS score validation (0-10 scale)
- CVSS → severity mapping (Critical/High/Medium/Low)
- CVE ID validation
- Cascade risk recalculation on score change
- File attachment upload validation
- File storage security (path traversal prevention)
- File retrieval authorization
- Supporting asset reference resolution
- Null/empty batch handling
- Partial batch failure scenarios

**Test Generation Estimated Effort:** 15-20 test cases (4-5 hours)

---

### 1.6 File: backend/src/main/java/com/thalesgroup/isra/controller/AiController.java

**Category:** AI Integration Controller  
**Business Criticality:** P2 (SUPPORTING)  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.controller  
**Type:** REST Controller (AI Status & Suggestions)  
**Complexity:** MEDIUM  
**LOC:** ~80

**Exports (Public Methods):**
- `status(refresh: Boolean)` → `ResponseEntity<AiStatusResponse>` `GET /api/ai/status`
- `suggestThreats(request: ThreatSuggestionRequest)` → `ResponseEntity<ThreatSuggestionResponse>` `POST /api/ai/suggest-threats`
- `suggestVulnerabilities(request: VulnerabilitySuggestionRequest)` → `ResponseEntity<VulnerabilitySuggestionResponse>` `POST /api/ai/suggest-vulnerabilities`

**External Dependencies:**
- `RiskAiAssistService` (orchestration)
- `AiConnectivityChecker` (status reporting)
- Spring Web

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Status reporting logic (available/offline/not-configured)
- Status refresh logic
- Threat suggestion flow
- Vulnerability suggestion flow
- Error handling for API failures
- Request validation
- Response transformation
- 503 vs 502 error scenarios

**Test Generation Estimated Effort:** 6-8 test cases (1.5-2 hours)

---

### 1.7 File: backend/src/main/java/com/thalesgroup/isra/controller/AuthController.java

**Category:** Authentication Controller  
**Business Criticality:** P1 (CORE BUSINESS)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.controller  
**Type:** REST Controller (User Authentication)  
**Complexity:** MEDIUM  
**LOC:** ~80

**Exports (Public Methods):**
- `register(request: RegisterRequest)` → `ResponseEntity<UserDto>` `POST /api/auth/register`
- `login(credentials: LoginRequest)` → `ResponseEntity<UserDto>` `POST /api/auth/login` (implied)
- `logout()` → `ResponseEntity<Void>` `POST /api/auth/logout`

**External Dependencies:**
- `UserRepository` (user lookup)
- `BCryptPasswordEncoder` (password hashing)
- Spring Security (authentication)
- Spring Web

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE (SECURITY CRITICAL)

**Missing Coverage:**
- User registration validation
- Username uniqueness check
- Email uniqueness check
- Password strength validation
- Login authentication flow
- Incorrect password rejection
- User not found handling
- Logout session cleanup
- BCrypt password hash verification
- Token generation (if applicable)
- Error response formats

**Test Generation Estimated Effort:** 10-12 test cases (3-4 hours)

---

## PART 2: BACKEND JAVA SERVICES (5 files)

### 2.1 File: backend/src/main/java/com/thalesgroup/isra/service/RiskCalculationService.java

**Category:** Risk Calculation Engine  
**Business Criticality:** P0 (CRITICAL - CORE BUSINESS LOGIC)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.service  
**Type:** Business Logic Service  
**Complexity:** VERY HIGH  
**LOC:** ~350+

**Exports (Public Methods):**
- `calculateRisk(risk: Risk)` → void (mutates Risk in-place)
- `calculateThreatFactor(risk: Risk)` → double (average of 5 threat factors)
- `calculateOccurrenceLevel(risk: Risk)` → int level mapping
- `calculateLikelihood(risk: Risk)` → void (calculates Threat Factor × Occurrence)
- `calculateImpact(risk: Risk)` → void (calculates max of CIA + verb mapping)
- `calculateAttackPaths(risk: Risk)` → void (aggregates vulnerability scores)
- `calculateInherentRisk(risk: Risk)` → void (Likelihood × Impact)
- `calculateMitigations(risk: Risk)` → void (control effectiveness calculation)
- `calculateResidualRisk(risk: Risk)` → void (final accepted risk after mitigations)
- `constructRiskName(risk: Risk)` → String (auto-name from threat + asset)
- `updateRiskImpactThreatVerb(risk: Risk)` → void (maps threat verb to CIA flag)

**External Dependencies:**
- Risk model only (pure logic, no dependencies)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE (HIGHEST PRIORITY)

**Missing Coverage:**
- **Threat Factor Calculation:**
  - 5 input factors (skillLevel, reward, accessResources, size, intrusionDetection)
  - Min/max/average logic
  - Null handling
  - Out-of-range values (< 0 or > 10)

- **Occurrence Level Mapping:**
  - Score → level conversion (4 thresholds)
  - Boundary cases

- **Likelihood Calculation (OWASP Matrix):**
  - Threat Factor × Occurrence formula
  - 9 combinations (5 × levels 1-5)
  - Zero factors
  - Edge cases

- **Impact Calculation:**
  - CIA scores (Confidentiality, Integrity, Availability)
  - Max selection
  - Threat verb → CIA flag mapping (7 verbs: Disclose, Alter, Destroy, Denial, Reference, Authentic, Repudiate)
  - Null/missing CIA values

- **Attack Path Aggregation:**
  - Vulnerability score summation
  - Zero vulnerabilities
  - Missing attack paths

- **Inherent Risk Calculation:**
  - Likelihood × Impact formula
  - Normalization to 1-100 scale
  - Zero likelihood/impact

- **Mitigation Effectiveness:**
  - Cost/benefit calculation
  - Mitigation benefits application
  - Multiple mitigations

- **Residual Risk Calculation:**
  - Inherent Risk - Mitigation Effect
  - Accepted risk thresholds

- **Risk Name Construction:**
  - Format: "[Threat] [Asset]"
  - Null asset/threat handling
  - Special character escaping

- **Threat Verb → CIA Mapping:**
  - All 7 threat verbs
  - Multiple flags per verb
  - Default mappings

- **Edge Cases & Error Handling:**
  - Null inputs
  - All-zero scores
  - Maximum values
  - Rounding behavior
  - Division by zero prevention

**Test Generation Estimated Effort:** 50-70 test cases (12-15 hours) - HIGHEST PRIORITY

---

### 2.2 File: backend/src/main/java/com/thalesgroup/isra/service/FileStorageService.java

**Category:** File Management Service  
**Business Criticality:** P2 (SUPPORTING)  
**Test Priority:** Priority 3  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.service  
**Type:** Utility Service (File I/O)  
**Complexity:** MEDIUM  
**LOC:** ~100

**Exports (Public Methods):**
- `storeFile(multipartFile: MultipartFile)` → String (unique filename)
- `loadFileAsResource(filePath: String)` → Resource (File resource for download)

**External Dependencies:**
- Spring Framework (Resource, ResourceLoader)
- Java NIO (file operations, Path)
- java.io (FileNotFoundException)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- File storage validation (size, type)
- Filename generation logic (uniqueness, encoding)
- Path traversal prevention (../../ attacks)
- File retrieval security (authorization per project)
- Directory creation (automatic parent dirs)
- Exception handling (disk full, permission denied)
- Temporary file cleanup
- File encoding/charset
- Symlink handling

**Test Generation Estimated Effort:** 10-12 test cases (2-3 hours)

---

### 2.3 File: backend/src/main/java/com/thalesgroup/isra/service/ai/RiskAiAssistService.java

**Category:** AI Orchestration Service  
**Business Criticality:** P2 (SUPPORTING)  
**Test Priority:** Priority 2  
**Existing Test:** RiskAiAssistServiceTest.java (3 unit tests)  
**Coverage:** ~40% (configuration & online checks only)  

**Module:** com.thalesgroup.isra.service.ai  
**Type:** Orchestration Service  
**Complexity:** MEDIUM  
**LOC:** ~80

**Exports (Public Methods):**
- `isConfigured()` → Boolean (checks if API key exists)
- `isOnline()` → Boolean (polls connectivity)
- `suggestThreats(businessAssetId: Long, supportingAssetId: Long)` → List<ThreatSuggestion>
- `suggestVulnerabilities(supportingAssetId: Long)` → List<VulnerabilitySuggestion>

**External Dependencies:**
- `GeminiAiProvider` (actual API calls)
- `AiConnectivityChecker` (online status)
- `BusinessAssetRepository`, `SupportingAssetRepository` (entity lookup)

**Unit Test Status:** PARTIALLY COVERED

**Recommended Action:** EXPAND EXISTING TEST SUITE

**Missing Coverage (Beyond Existing 3 Tests):**
- Threat suggestion retrieval with actual asset data
- Vulnerability suggestion retrieval
- Null asset handling (business asset not found)
- Null asset handling (supporting asset not found)
- Exception propagation (API failures)
- Result caching/memoization (if applicable)
- Timeout handling
- Empty suggestion results

**Test Generation Estimated Effort:** 6-8 additional test cases (1.5-2 hours)

**Existing Tests:**
1. Configuration check
2. Online status check
3. Basic connectivity

---

### 2.4 File: backend/src/main/java/com/thalesgroup/isra/service/ai/GeminiAiProvider.java

**Category:** AI Provider Client  
**Business Criticality:** P2 (SUPPORTING)  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.service.ai  
**Type:** API Client Service (REST integration)  
**Complexity:** HIGH  
**LOC:** ~200+

**Exports (Public Methods):**
- `isConfigured()` → Boolean
- `suggestThreats(businessName: String, type: String, desc: String, supportingName: String, type: String)` → List<ThreatSuggestion>
- `suggestVulnerabilities(assetName: String, type: String)` → List<VulnerabilitySuggestion>

**External Dependencies:**
- RestTemplate (HTTP client)
- ObjectMapper/Jackson (JSON serialization)
- Google Gemini API (HTTP endpoint)
- Google Gemini API credentials (@Value injected from config)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE (COMPLEX MOCKING REQUIRED)

**Missing Coverage:**
- API request construction (JSON schema generation)
- API endpoint invocation
- Response parsing (JSON deserialization)
- Error handling (API failures, 5XX responses)
- Timeout handling (read/connect timeouts)
- Rate limiting handling (429 responses)
- API key validation
- Model/temperature configuration
- Token limit handling
- Malformed response handling
- Network exception handling (ConnectException, SocketTimeoutException)
- Response null/empty handling
- Suggestion format validation (Agent + Verb + Motivation)

**Test Generation Estimated Effort:** 15-20 test cases (3-4 hours) - REQUIRES MOCKING FRAMEWORK

---

### 2.5 File: backend/src/main/java/com/thalesgroup/isra/service/ai/AiConnectivityChecker.java

**Category:** AI Health Monitoring Service  
**Business Criticality:** P2 (SUPPORTING)  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** com.thalesgroup.isra.service.ai  
**Type:** Polling Service (Background monitoring)  
**Complexity:** MEDIUM  
**LOC:** ~60

**Exports (Public Methods):**
- `isOnline()` → Boolean (check cached status)
- `isOnline(forceRefresh: Boolean)` → Boolean (refresh if needed)

**External Dependencies:**
- Java HTTP client (URL, HttpURLConnection)
- Threading (implicit in polling)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Health check HTTP call success
- Health check HTTP call timeout
- Cache TTL logic (expiration)
- Double-checked locking (thread safety)
- Exception handling (ConnectException, SocketTimeoutException)
- HTTP status code validation
- Force refresh logic
- Concurrent access handling
- Initial state (not yet checked)
- Polling interval (if background polling exists)

**Test Generation Estimated Effort:** 10-12 test cases (2-3 hours)

---

## PART 3: BACKEND JAVA REPOSITORIES (6 files)

### 3.1 File: backend/src/main/java/com/thalesgroup/isra/repository/IsraProjectRepository.java

**Category:** Project Data Access  
**Business Criticality:** P0  
**Type:** Spring Data JPA Repository  
**Complexity:** LOW  
**LOC:** ~15

**Exports (Methods - Mix of Inherited & Custom):**
- `findAll()` → List<IsraProject> (inherited CRUD)
- `findById(id: Long)` → Optional<IsraProject> (inherited CRUD)
- `save(project: IsraProject)` → IsraProject (inherited CRUD)
- `deleteById(id: Long)` → void (inherited CRUD)
- `findByOwnerOid(ownerOid: String)` → List<IsraProject> (custom query)

**External Dependencies:**
- Spring Data JPA (CrudRepository)
- IsraProject entity

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE REPOSITORY TESTS

**Missing Coverage:**
- Query method functionality (`findByOwnerOid`)
- Null handling
- Empty result sets
- Pagination (if applicable)

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 3.2 File: backend/src/main/java/com/thalesgroup/isra/repository/RiskRepository.java

**Category:** Risk Data Access  
**Business Criticality:** P0  
**Type:** Spring Data JPA Repository  
**Complexity:** LOW  
**LOC:** ~15

**Exports (Methods):**
- CRUD inherited: `findAll()`, `findById()`, `save()`, `deleteById()`
- Custom: `findByProjectId(projectId: Long)` → List<Risk>

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE REPOSITORY TESTS

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 3.3 File: backend/src/main/java/com/thalesgroup/isra/repository/BusinessAssetRepository.java

**Category:** Asset Data Access  
**Business Criticality:** P1  
**Type:** Spring Data JPA Repository  
**Complexity:** LOW  
**LOC:** ~15

**Exports (Methods):**
- CRUD inherited
- Custom: `findByProjectId(projectId: Long)` → List<BusinessAsset>

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 3.4 File: backend/src/main/java/com/thalesgroup/isra/repository/SupportingAssetRepository.java

**Category:** Asset Data Access  
**Business Criticality:** P1  
**Type:** Spring Data JPA Repository  
**Complexity:** LOW  
**LOC:** ~15

**Exports (Methods):**
- CRUD inherited
- Custom: `findByProjectId(projectId: Long)` → List<SupportingAsset>

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 3.5 File: backend/src/main/java/com/thalesgroup/isra/repository/VulnerabilityRepository.java

**Category:** Vulnerability Data Access  
**Business Criticality:** P1  
**Type:** Spring Data JPA Repository  
**Complexity:** LOW  
**LOC:** ~15

**Exports (Methods):**
- CRUD inherited
- Custom: `findByProjectId(projectId: Long)` → List<Vulnerability>

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 3.6 File: backend/src/main/java/com/thalesgroup/isra/repository/UserRepository.java

**Category:** User Data Access  
**Business Criticality:** P1  
**Type:** Spring Data JPA Repository  
**Complexity:** LOW  
**LOC:** ~15

**Exports (Methods):**
- CRUD inherited
- Custom: `existsByUsername(username: String)` → Boolean
- Custom: `existsByEmail(email: String)` → Boolean
- Custom: `findByUsername(username: String)` → Optional<User>

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 6-8 test cases (1.5 hours)

---

## PART 4: BACKEND JAVA ENTITIES/MODELS (11 files)

### 4.1 File: backend/src/main/java/com/thalesgroup/isra/model/IsraProject.java

**Category:** Root Project Aggregate  
**Business Criticality:** P0  
**Type:** JPA Entity  
**Complexity:** MEDIUM  
**LOC:** ~120

**Key Fields:**
- projectName, version, organization, classification, schemaVersion, iteration
- ownerOid, ownerName, createdAt, updatedAt

**Relationships:**
- 1:1 IsraProjectContext (cascade all)
- 1:N TrackingList (cascade all)
- 1:N BusinessAsset (cascade all)
- 1:N SupportingAsset (cascade all)
- 1:N Vulnerability (cascade all)
- 1:N Risk (cascade all)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE ENTITY TESTS

**Missing Coverage:**
- Entity mapping (JPA annotations)
- Cascading deletes
- @PrePersist and @PreUpdate hooks
- Relationship cardinality
- Lazy/eager loading configuration
- Constructor validation

**Test Generation Estimated Effort:** 6-8 test cases (1.5-2 hours)

---

### 4.2 File: backend/src/main/java/com/thalesgroup/isra/model/IsraProjectContext.java

**Category:** Project Metadata Container  
**Business Criticality:** P1  
**Type:** JPA Entity  
**Complexity:** LOW  
**LOC:** ~40

**Key Fields:**
- description, url, objectives, assumptions, attachmentPath

**Relationships:**
- 1:1 IsraProject (backref)

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 2-3 test cases (0.5 hours)

---

### 4.3 File: backend/src/main/java/com/thalesgroup/isra/model/BusinessAsset.java

**Category:** Business Asset Entity  
**Business Criticality:** P1  
**Type:** JPA Entity  
**Complexity:** LOW  
**LOC:** ~50

**Key Fields:**
- assetId, name, type, description
- confidentialityScore, integrityScore, availabilityScore (1-10 each)
- authenticityScore, authorizationScore, nonRepudiationScore

**Relationships:**
- N:1 IsraProject

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 4.4 File: backend/src/main/java/com/thalesgroup/isra/model/SupportingAsset.java

**Category:** Infrastructure/Technical Asset Entity  
**Business Criticality:** P1  
**Type:** JPA Entity  
**Complexity:** LOW  
**LOC:** ~50

**Key Fields:**
- assetId, hldId, name, type, securityLevel (1-4)

**Relationships:**
- N:1 IsraProject
- M:M BusinessAsset (join table)

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 4.5 File: backend/src/main/java/com/thalesgroup/isra/model/Vulnerability.java

**Category:** Vulnerability Entity  
**Business Criticality:** P1  
**Type:** JPA Entity  
**Complexity:** MEDIUM  
**LOC:** ~70

**Key Fields:**
- vulnId, name, family, cve, cveScore (CVSS)
- overallLevel (severity), trackingId, uri, description, attachmentPath

**Relationships:**
- N:1 IsraProject
- M:M SupportingAsset (via RiskVulnerabilityRef)

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 5-6 test cases (1.5 hours)

---

### 4.6 File: backend/src/main/java/com/thalesgroup/isra/model/Risk.java

**Category:** Risk Aggregate (Complex)  
**Business Criticality:** P0  
**Type:** JPA Entity  
**Complexity:** VERY HIGH  
**LOC:** ~150+

**Key Fields (50+ total):**
- Threat: agent, verb, motivation, threatAgentDetail, threatResources, skillLevel, intMotive, intCapability
- Likelihood: threat factors (5), occurrence (1-5)
- Impact: CIA flags (6 flags for impact)
- Attack Paths: aggregated score, name
- Mitigations: benefits, costs, decision fields
- Residual: final score, level
- Decision: management decision, detail

**Relationships:**
- N:1 IsraProject
- N:1 BusinessAsset
- N:1 SupportingAsset
- 1:N RiskAttackPath (cascade all)
- 1:N RiskMitigation (cascade all)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE ENTITY TESTS (COMPLEX)

**Missing Coverage:**
- Complex entity mapping
- Enum mappings (threat verbs, impact levels)
- All 50+ field validations
- Cascading operations
- Relationship cardinality
- Calculation result persistence
- Null handling for optional fields

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours)

---

### 4.7 File: backend/src/main/java/com/thalesgroup/isra/model/RiskAttackPath.java

**Category:** Attack Path Entity  
**Business Criticality:** P1  
**Type:** JPA Entity  
**Complexity:** MEDIUM  
**LOC:** ~40

**Key Fields:**
- attackPathId, name, score

**Relationships:**
- N:1 Risk
- 1:N RiskVulnerabilityRef

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 3-4 test cases (1 hour)

---

### 4.8 File: backend/src/main/java/com/thalesgroup/isra/model/RiskVulnerabilityRef.java

**Category:** Attack Path - Vulnerability Reference  
**Business Criticality:** P1  
**Type:** JPA Entity  
**Complexity:** LOW  
**LOC:** ~35

**Key Fields:**
- score, name (from vulnerability)

**Relationships:**
- N:1 RiskAttackPath
- N:1 Vulnerability

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 2-3 test cases (0.5 hours)

---

### 4.9 File: backend/src/main/java/com/thalesgroup/isra/model/RiskMitigation.java

**Category:** Mitigation Control Entity  
**Business Criticality:** P1  
**Type:** JPA Entity  
**Complexity:** LOW  
**LOC:** ~35

**Key Fields:**
- mitigationId, description, benefits, cost, decision, decisionDetail

**Relationships:**
- N:1 Risk

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 2-3 test cases (0.5 hours)

---

### 4.10 File: backend/src/main/java/com/thalesgroup/isra/model/IsraTracking.java

**Category:** Audit Trail Entity  
**Business Criticality:** P2  
**Type:** JPA Entity  
**Complexity:** LOW  
**LOC:** ~35

**Key Fields:**
- iteration, date, comment

**Relationships:**
- N:1 IsraProject

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 2-3 test cases (0.5 hours)

---

### 4.11 File: backend/src/main/java/com/thalesgroup/isra/model/User.java

**Category:** User Entity  
**Business Criticality:** P1  
**Type:** JPA Entity  
**Complexity:** LOW  
**LOC:** ~35

**Key Fields:**
- id, username (unique), email (unique), passwordHash, role, createdAt

**Relationships:**
- Standalone (owns projects via ownerOid)

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

## PART 5: BACKEND JAVA CONFIGURATION & UTILITIES

### 5.1 File: backend/src/main/java/com/thalesgroup/isra/IsraBackendApplication.java

**Category:** Spring Boot Application Entry Point  
**Business Criticality:** P0  
**Type:** Entry Point  
**Complexity:** LOW  
**LOC:** ~10

**Exports:**
- `main(args: String[])` - Spring application launcher

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 1-2 test cases (0.5 hours)

---

### 5.2 File: backend/src/main/java/com/thalesgroup/isra/config/CorsConfig.java

**Category:** CORS Security Configuration  
**Business Criticality:** P1  
**Type:** Spring Configuration  
**Complexity:** LOW  
**LOC:** ~35

**Exports:**
- `corsConfigurer()` → WebMvcConfigurer bean

**Configuration:**
- Allowed origins: localhost:4200, localhost:4201
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Max age: 3600s
- Credentials: true/false

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 3-4 test cases (1 hour)

---

### 5.3 File: backend/src/main/java/com/thalesgroup/isra/config/RestTemplateConfig.java

**Category:** HTTP Client Configuration  
**Business Criticality:** P1  
**Type:** Spring Configuration  
**Complexity:** LOW  
**LOC:** ~30

**Exports:**
- `restTemplate()` → RestTemplate bean (factory method)

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 2-3 test cases (0.5 hours)

---

## PART 6: BACKEND JAVA EXCEPTIONS & DTOs (10 files)

### 6.1 File: backend/src/main/java/com/thalesgroup/isra/exception/AiUnavailableException.java

**Category:** Exception  
**Business Criticality:** P2  
**Type:** Custom RuntimeException  
**Complexity:** LOW  
**LOC:** ~10

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 1 test case (0.25 hours)

---

### 6.2 File: backend/src/main/java/com/thalesgroup/isra/exception/GeminiApiException.java

**Category:** Exception  
**Business Criticality:** P2  
**Type:** Custom RuntimeException  
**Complexity:** LOW  
**LOC:** ~10

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 1 test case (0.25 hours)

---

### 6.3 File: backend/src/main/java/com/thalesgroup/isra/exception/AiExceptionHandler.java

**Category:** Global Exception Handler  
**Business Criticality:** P2  
**Type:** @RestControllerAdvice  
**Complexity:** LOW  
**LOC:** ~30

**Exports:**
- `handleAiUnavailable(ex)` → 503 Service Unavailable
- `handleGeminiApi(ex)` → 502 Bad Gateway

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 6.4-6.10 DTO Files (7 files in com.thalesgroup.isra.dto.ai)

**Types:**
- `AiStatusResponse` - API response for AI status
- `ThreatSuggestion` - Threat suggestion DTO (Agent, Verb, Motivation, Rationale)
- `ThreatSuggestionRequest` - Request DTO
- `ThreatSuggestionResponse` - Wrapper response
- `VulnerabilitySuggestion` - Vulnerability DTO
- `VulnerabilitySuggestionRequest` - Request DTO
- `VulnerabilitySuggestionResponse` - Wrapper response

**Business Criticality:** P2  
**Type:** DTOs (Data Transfer Objects)  
**Complexity:** LOW  
**LOC:** Each ~15-20 lines

**Unit Test Status:** NOT COVERED (DTOs typically tested via service/controller tests)

**Test Generation Estimated Effort:** 2-3 test cases per DTO for serialization (optional)

---

## PART 7: FRONTEND ANGULAR COMPONENTS (13 files)

### 7.1 File: frontend/src/app/features/dashboard/dashboard.component.ts

**Category:** Dashboard/Home Component  
**Business Criticality:** P0 (CRITICAL - Main entry post-login)  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.dashboard  
**Type:** Standalone Angular Component  
**Complexity:** HIGH  
**LOC:** ~150+

**Exports (Public Methods):**
- `projects: Signal<IsraProject[]>` - Project list reactive state
- `filteredProjects: Signal<IsraProject[]>` - Computed from search
- `showCreateForm: Signal<boolean>` - Form visibility toggle
- `toggleTheme()` - Light/dark mode toggle
- `toggleUserPopup(event)` - User menu dropdown
- `getUserInitials()` - Avatar initials
- Project creation form handling

**External Dependencies:**
- ProjectService (CRUD)
- AuthService (current user info)
- Angular Material (table, form, snack-bar components)
- RxJS (observables, operators)
- Reactive Forms

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Project list loading
- Search/filter functionality
- Project creation form submission
- Theme toggle persistence
- User dropdown display/hide
- User initials calculation
- Error handling and retry
- Loading states
- Empty state (no projects)
- Material table population

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours)

---

### 7.2 File: frontend/src/app/features/project-layout/project-layout.component.ts

**Category:** Project Wizard Layout  
**Business Criticality:** P0 (CRITICAL - Workflow orchestrator)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.project-layout  
**Type:** Standalone Component (container/layout)  
**Complexity:** VERY HIGH  
**LOC:** ~150+

**Exports (Public Methods):**
- `projectId: Signal<number>` - Current project ID
- `activeProject: Signal<IsraProject>` - Loaded project
- `isSaving: Signal<boolean>` - From WizardValidationService
- `drawerOpen: Signal<boolean>` - Sidebar visibility
- `nextStep()` - Wizard navigation
- `prevStep()` - Wizard navigation
- Wizard steps configuration (8 steps)

**External Dependencies:**
- ProjectService (project loading)
- AuthService (authentication)
- AiStatusService (AI status display)
- WizardValidationService (step validation coordination)
- ActivatedRoute, Router (routing)
- Angular Material (sidenav, buttons)
- RxJS

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE (HIGHEST PRIORITY - CRITICAL PATH)

**Missing Coverage:**
- Wizard step navigation (prev/next)
- Step validation blocking
- Route synchronization
- Sidebar toggle/close behavior
- Project loading on route param change
- Project not found error handling
- Unauthorized project access
- Step persistence
- AI status display based on service state
- Saving state feedback

**Test Generation Estimated Effort:** 20-25 test cases (5-6 hours) - HIGH COMPLEXITY

---

### 7.3 File: frontend/src/app/features/risks/risks.component.ts

**Category:** Risk Management Component  
**Business Criticality:** P0 (CRITICAL - Core risk entry)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.risks  
**Type:** Standalone Component  
**Complexity:** VERY HIGH  
**LOC:** ~200+

**Exports (Public Methods):**
- `risks: Signal<Risk[]>` - Risk list
- `selectedRisk: Signal<Risk | null>` - Form context
- `aiSuggestions: Signal<ThreatSuggestion[]>` - AI suggestions
- `isLoadingSuggestions: Signal<boolean>` - Loading state
- `submitRisk()` - Create/update risk
- `updateRisk()` - Inline update
- `deleteRisk()` - Risk deletion
- `loadAiSuggestions()` - Async call to AI
- `applyAiSuggestion(suggestion)` - Populate form from suggestion

**External Dependencies:**
- RiskService (CRUD + nested resources)
- AssetService, VulnerabilityService (related data)
- RiskAiService (threat suggestions)
- AiStatusService (AI availability)
- ProjectService, WizardValidationService
- Material (form, table, snack-bar)
- RxJS (timeout, finalize operators)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE (HIGH PRIORITY)

**Missing Coverage:**
- Risk list loading
- Risk creation form validation
- Risk update operations
- Risk deletion confirmation
- AI threat suggestion loading
- Threat verb selection and mapping
- CIA impact flag selection
- Occurrence level (1-5) selection
- Threat factor (0-10) scoring
- Mitigation management
- Form error display
- Success/error notifications
- AI status affecting UI (enabled/disabled)
- Attack path management
- Null/edge case handling

**Test Generation Estimated Effort:** 25-30 test cases (6-8 hours)

---

### 7.4 File: frontend/src/app/features/vulnerabilities/vulnerabilities.component.ts

**Category:** Vulnerability Management Component  
**Business Criticality:** P1 (Core data entry)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.vulnerabilities  
**Type:** Standalone Component  
**Complexity:** HIGH  
**LOC:** ~200+

**Exports (Public Methods):**
- `vulnerabilities: Signal<Vulnerability[]>` - Vulnerability list
- `selectedVulnerability: Signal<Vulnerability | null>` - Form context
- `aiSuggestions: Signal<VulnerabilitySuggestion[]>` - Suggestions
- `isLoadingSuggestions: Signal<boolean>` - Loading
- `addVulnerability()`, `updateVulnerability()`, `deleteVulnerability()`
- `loadAiSuggestions()` - CVE/weakness suggestions
- `applyAiSuggestion(suggestion)` - Populate form
- Batch update coordination

**External Dependencies:**
- VulnerabilityService (batch operations, file I/O)
- AssetService, RiskService
- RiskAiService (AI suggestions)
- AiStatusService
- ProjectService, WizardValidationService
- Material, RxJS

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Vulnerability CRUD operations
- AI vulnerability suggestions
- CVSS score input validation (0-10)
- CVSS → severity mapping (Critical/High/Medium/Low)
- CVE ID format validation
- Batch vulnerability updates
- Supporting asset linking
- File attachment upload/download
- Form validation and error display
- Success/error notifications
- Empty state handling

**Test Generation Estimated Effort:** 20-25 test cases (5-6 hours)

---

### 7.5 File: frontend/src/app/features/basic-info/basic-info.component.ts

**Category:** Wizard Step 1 - Project Metadata  
**Business Criticality:** P1  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.basic-info  
**Type:** Standalone Component  
**Complexity:** MEDIUM  
**LOC:** ~100

**Exports:**
- Form for project name, version, organization, classification
- Save logic
- Validation

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 8-10 test cases (2-3 hours)

---

### 7.6 File: frontend/src/app/features/project-context/project-context.component.ts

**Category:** Wizard Step 2 - Project Description  
**Business Criticality:** P1  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.project-context  
**Type:** Standalone Component  
**Complexity:** HIGH  
**LOC:** ~150+

**Exports:**
- Project context form (description, objectives, assumptions, URLs)
- File upload/download attachment
- Reactive forms with validation

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Form field validation
- File upload handling
- File download/retrieve
- Attachment lifecycle
- Form state persistence
- Navigation between steps

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours)

---

### 7.7 File: frontend/src/app/features/business-assets/business-assets.component.ts

**Category:** Wizard Step 3 - Business Assets  
**Business Criticality:** P0 (Core asset data - CIA impacts risk)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.business-assets  
**Type:** Standalone Component  
**Complexity:** HIGH  
**LOC:** ~150+

**Exports:**
- Inline CRUD with Material table
- CIA value scoring (1-10 validation)
- Asset type selection
- Form state management

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Add asset form submission
- Edit asset inline
- Delete asset confirmation
- CIA score validation (1-10)
- Asset criticality (1-5)
- Other impact scores validation
- Form state transitions
- Material table binding

**Test Generation Estimated Effort:** 15-18 test cases (4-5 hours)

---

### 7.8 File: frontend/src/app/features/supporting-assets/supporting-assets.component.ts

**Category:** Wizard Step 4 - Supporting/Technical Assets  
**Business Criticality:** P1  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.supporting-assets  
**Type:** Standalone Component  
**Complexity:** HIGH  
**LOC:** ~150+

**Exports:**
- Supporting asset CRUD
- M:M map to business assets
- Security level (1-4) assignment
- Material table operations

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Asset creation
- Asset editing
- Asset deletion
- Business asset reference resolution
- M:M mapping UI
- Security level validation
- Form state management

**Test Generation Estimated Effort:** 15-18 test cases (4-5 hours)

---

### 7.9 File: frontend/src/app/features/auth/login/login.component.ts

**Category:** Login Component  
**Business Criticality:** P1 (Authentication gate)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.auth.login  
**Type:** Standalone Component  
**Complexity:** MEDIUM  
**LOC:** ~80

**Exports:**
- Login form (username, password)
- Form submission
- Error displays
- Redirect to dashboard

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Form validation (required fields, format)
- Successful login → navigation
- Failed login → error message
- Session persistence
- Spinner/loading state
- Remember me (if applicable)

**Test Generation Estimated Effort:** 10-12 test cases (3-4 hours)

---

### 7.10 File: frontend/src/app/features/auth/register/register.component.ts

**Category:** User Registration Component  
**Business Criticality:** P1  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.auth.register  
**Type:** Standalone Component  
**Complexity:** MEDIUM  
**LOC:** ~100

**Exports:**
- Registration form (username, email, password, confirm)
- Form validation
- Email/username uniqueness check
- Error displays
- Success → login redirect

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Field validation (email format, password strength)
- Username uniqueness check (async)
- Email uniqueness check (async)
- Password confirmation matching
- Form submission
- Success notification
- Error handling
- Spinner states

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours)

---

### 7.11 File: frontend/src/app/features/reports/reports.component.ts

**Category:** Reports & Analytics Component  
**Business Criticality:** P2 (Reporting/visualization)  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** features.reports  
**Type:** Standalone Component  
**Complexity:** HIGH  
**LOC:** ~150+

**Exports (Computed KPIs):**
- `highRiskCount: Signal<number>` - Risks with high/critical severity
- `averageRiskScore: Signal<number>` - Mean of all risk scores
- `mitigationsCount: Signal<number>` - Total control count
- `riskTrendChart: Signal<ChartData>` - Risk distribution
- Report generation (HTML/PDF)
- Export functionality

**External Dependencies:**
- Risk calculations (via signals)
- RiskService
- Report generation service (backend)
- Chart library (if applicable)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- KPI computation accuracy
- Risk filtering logic
- Chart data binding
- Report generation trigger
- Export format selection
- Null/empty data handling
- Visual regression (chart updates)

**Test Generation Estimated Effort:** 18-20 test cases (4-5 hours)

---

### 7.12 File: frontend/src/app/app.component.ts

**Category:** Root Application Component  
**Business Criticality:** P0 (Bootstrap)  
**Type:** Root Component  
**Complexity:** LOW  
**LOC:** ~10

**Exports:**
- Just `<router-outlet></router-outlet>` template

**Unit Test Status:** NO TEST (placeholder app.component.spec.ts exists)

**Test Generation Estimated Effort:** 1-2 test cases (0.5 hours)

---

## PART 8: FRONTEND ANGULAR SERVICES (10 files)

### 8.1 File: frontend/src/app/core/services/project.service.ts

**Category:** Project Data Service  
**Business Criticality:** P0  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.services  
**Type:** HTTP Service (CRUD)  
**Complexity:** MEDIUM  
**LOC:** ~80

**Exports (Public Methods):**
- `getProjects()` → Observable<IsraProject[]>
- `getProject(id: number)` → Observable<IsraProject>
- `createProject(project: CreateProjectRequest)` → Observable<IsraProject>
- `updateProject(id: number, project: UpdateProjectRequest)` → Observable<IsraProject>
- `deleteProject(id: number)` → Observable<void>
- `updateProjectContext(projectId: number, context)` → Observable<IsraProject>
- `uploadContextAttachment(projectId: number, file: File)` → Observable<IsraProject>
- `downloadContextAttachment(projectId: number)` → Observable<Blob>
- `activeProject: Signal<IsraProject | null>` - Shared state

**External Dependencies:**
- HttpClient (Angular)
- ConfigService (API URL)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- HTTP GET requests
- HTTP POST/PUT requests
- HTTP DELETE requests
- Error handling (4XX, 5XX)
- Observable completion
- File upload encoding
- File download binary handling
- Active project signal updates
- Null response handling

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours)

---

### 8.2 File: frontend/src/app/core/services/risk.service.ts

**Category:** Risk Data Service  
**Business Criticality:** P0  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.services  
**Type:** HTTP Service (nested resources)  
**Complexity:** HIGH  
**LOC:** ~120+

**Exports (Public Methods):**
- `getRisks(projectId: number)` → Observable<Risk[]>
- `getRisk(projectId: number, riskId: number)` → Observable<Risk>
- `addRisk(projectId: number, risk: CreateRiskRequest)` → Observable<Risk>
- `updateRisk(projectId: number, riskId: number, risk: UpdateRiskRequest)` → Observable<Risk>
- `deleteRisk(projectId: number, riskId: number)` → Observable<void>
- `addAttackPath(projectId: number, riskId: number, path)` → Observable<RiskAttackPath>
- `addMitigation(projectId: number, riskId: number, mitigation)` → Observable<RiskMitigation>

**External Dependencies:**
- HttpClient, ConfigService
- Asset/Vulnerability service references

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- All CRUD operations
- Nested resource URL construction
- Attack path addition
- Mitigation addition
- Error handling
- Response transformation

**Test Generation Estimated Effort:** 15-18 test cases (4-5 hours)

---

### 8.3 File: frontend/src/app/core/services/asset.service.ts

**Category:** Asset Data Service  
**Business Criticality:** P1  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.services  
**Type:** HTTP Service  
**Complexity:** MEDIUM  
**LOC:** ~80

**Exports (Public Methods):**
- Business Assets:
  - `getBusinessAssets(projectId)` → Observable<BusinessAsset[]>
  - `addBusinessAsset()` → Observable<BusinessAsset>
  - `updateBusinessAsset()` → Observable<BusinessAsset>
  - `deleteBusinessAsset()` → Observable<void>
- Supporting Assets:
  - `getSupportingAssets()` → Observable<SupportingAsset[]>
  - `addSupportingAsset()` → Observable<SupportingAsset>
  - `updateSupportingAsset()` → Observable<SupportingAsset>
  - `deleteSupportingAsset()` → Observable<void>

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours)

---

### 8.4 File: frontend/src/app/core/services/vulnerability.service.ts

**Category:** Vulnerability Data Service  
**Business Criticality:** P1  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.services  
**Type:** HTTP Service (includes batch)  
**Complexity:** MEDIUM  
**LOC:** ~80

**Exports (Public Methods):**
- `getVulnerabilities(projectId)` → Observable<Vulnerability[]>
- `addVulnerability()` → Observable<Vulnerability>
- `updateVulnerability()` → Observable<Vulnerability>
- `deleteVulnerability()` → Observable<void>
- `batchUpdateVulnerabilities(projectId, vulns)` → Observable<Vulnerability[]> (batch operation)
- `uploadAttachment()` → Observable<string> (file path)
- `downloadAttachment()` → Observable<Blob>

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Batch update HTTP logic
- File upload/download
- Error handling
- Observable completion

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours)

---

### 8.5 File: frontend/src/app/core/services/auth.service.ts

**Category:** Authentication Service  
**Business Criticality:** P1 (Authentication gate)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.services  
**Type:** HTTP + State Service  
**Complexity:** MEDIUM  
**LOC:** ~60

**Exports (Public Methods):**
- `login(credentials: LoginRequest)` → Observable<UserDto>
- `register(userData: RegisterRequest)` → Observable<UserDto>
- `logout()` → void
- `currentUser: Signal<UserDto | null>` - Persistent user state
- `isAuthenticated: Signal<boolean>` - Computed from currentUser
- `userRole: Signal<UserRole>` - Computed from currentUser

**External Dependencies:**
- HttpClient, ConfigService
- localStorage (session persistence)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Login HTTP call
- Registration HTTP call
- Session persistence (localStorage save/retrieve)
- Logout cleanup
- currentUser signal updates
- Computed signal derivation
- Session recovery on browser refresh
- Error handling

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours)

---

### 8.6 File: frontend/src/app/core/services/ai-status.service.ts

**Category:** AI Health Monitoring Service  
**Business Criticality:** P2  
**Test Priority:** Priority 2  
**Existing Test:** ai-status.service.spec.ts (placeholder)  
**Coverage:** 0% (no real tests)  

**Module:** core.services  
**Type:** Polling Service  
**Complexity:** MEDIUM  
**LOC:** ~80

**Exports (Public Methods):**
- `check(forceRefresh: boolean)` → Observable/void
- `aiState: Signal<'available' | 'offline' | 'not-configured'>`
- `statusMessage: Signal<string>`
- Auto-polling every 15 seconds
- Browser online/offline event listeners

**External Dependencies:**
- HttpClient, ConfigService
- DestroyRef (Angular lifecycle)
- Browser online event

**Unit Test Status:** PLACEHOLDER ONLY

**Recommended Action:** CREATE REAL TEST SUITE

**Missing Coverage:**
- Health check HTTP call
- Status update (available → offline)
- Auto-polling interval (15s)
- Browser online event handler
- Browser offline event handler
- Force refresh logic
- Error state handling
- Component destruction cleanup

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours)

---

### 8.7 File: frontend/src/app/core/services/risk-ai.service.ts

**Category:** AI Suggestion Service  
**Business Criticality:** P2  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.services  
**Type:** HTTP Service (pass-through)  
**Complexity:** LOW  
**LOC:** ~60

**Exports (Public Methods):**
- `suggestThreats(businessAssetId, supportingAssetId)` → Observable<ThreatSuggestionResponse>
- `suggestVulnerabilities(supportingAssetId)` → Observable<VulnerabilitySuggestionResponse>

**External Dependencies:**
- HttpClient, ConfigService

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 6-8 test cases (1.5-2 hours)

---

### 8.8 File: frontend/src/app/core/services/config.service.ts

**Category:** Configuration Service  
**Business Criticality:** P1  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.services  
**Type:** Configuration/Environment Detection  
**Complexity:** LOW  
**LOC:** ~15

**Exports (Public Methods):**
- `getApiUrl()` → string (detects Electron vs dev mode)

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 8.9 File: frontend/src/app/core/services/wizard-validation.service.ts

**Category:** Wizard Flow Coordination Service  
**Business Criticality:** P1  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.services  
**Type:** RxJS Subject-based Coordination  
**Complexity:** MEDIUM  
**LOC:** ~40

**Exports (Public Methods & Signals):**
- `requestContinue()` - Called by layout component
- `reportResult(canNavigate: boolean)` - Called by step component
- `continueClicked$: Observable<void>` - Event stream
- `navigationGranted$: Observable<boolean>` - Result stream
- `isSaving: Signal<boolean>` - Loading state

**External Dependencies:**
- RxJS (Subject)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE

**Missing Coverage:**
- Subject emission patterns
- requestContinue trigger
- reportResult cancellation/approval
- isSaving signal updates
- Multi-subscriber coordination
- Null/edge case handling

**Test Generation Estimated Effort:** 8-10 test cases (2-3 hours)

---

## PART 9: FRONTEND ANGULAR GUARDS & INTERCEPTORS (2 files)

### 9.1 File: frontend/src/app/core/guards/auth.guard.ts

**Category:** Route Guard  
**Business Criticality:** P1 (Access control)  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.guards  
**Type:** Functional Guard (CanActivateFn)  
**Complexity:** LOW  
**LOC:** ~20

**Exports:**
- `authGuard: CanActivateFn` - Checks `AuthService.isAuthenticated()`

**Logic:**
- If authenticated → allow navigation
- If not authenticated → redirect to `/login`

**External Dependencies:**
- AuthService, Router

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 9.2 File: frontend/src/app/core/interceptors/auth.interceptor.ts

**Category:** HTTP Interceptor  
**Business Criticality:** P1 (Auth propagation)  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** core.interceptors  
**Type:** HTTP Interceptor (HttpInterceptorFn)  
**Complexity:** LOW  
**LOC:** ~20

**Exports:**
- `authInterceptor: HttpInterceptorFn`

**Logic:**
- Reads user from localStorage
- Appends `X-Username` header to all requests

**External Dependencies:**
- localStorage API
- HttpRequest/HttpResponse types

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 6-8 test cases (1.5-2 hours)

---

## PART 10: FRONTEND ROOT CONFIGURATION (3 files)

### 10.1 File: frontend/src/app/app.routes.ts

**Category:** Application Routes Configuration  
**Business Criticality:** P0  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** Root routing  
**Type:** Route configuration  
**Complexity:** MEDIUM  
**LOC:** ~65

**Exports:**
- `routes: Routes` array with 8+ route definitions

**Route Structure:**
```
/login → LoginComponent
/register → RegisterComponent
/ → DashboardComponent [authGuard]
/project/:projectId → ProjectLayoutComponent [authGuard]
  /basic-info → BasicInfoComponent
  /context → ProjectContextComponent
  /business-assets → BusinessAssetsComponent
  /supporting-assets → SupportingAssetsComponent
  /vulnerabilities → VulnerabilitiesComponent
  /risks → RisksComponent
  /reports → ReportsComponent
** → redirect to /
```

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 8-10 test cases (2-3 hours)

---

### 10.2 File: frontend/src/app/app.config.ts

**Category:** Application Bootstrap Configuration  
**Business Criticality:** P0  
**Type:** Provider configuration  
**Complexity:** LOW  
**LOC:** ~30

**Exports:**
- Application providers array

**Providers:**
- `provideRouter(routes, withHashLocation())`
- `provideAnimations()`
- `provideHttpClient(withInterceptors([authInterceptor]))`
- Material theme setup

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 2-3 test cases (0.5 hours)

---

### 10.3 File: frontend/src/app/app.component.ts

**Category:** Root Component  
**Business Criticality:** P0  
**Type:** Root component  
**Complexity:** LOW  
**LOC:** ~10

**Content:**
- Only `<router-outlet></router-outlet>`

**Existing Tests:** app.component.spec.ts (placeholder, no real tests)

**Test Generation Estimated Effort:** 1-2 test cases (0.5 hours)

---

## PART 11: ELECTRON DESKTOP INTEGRATION (4 files)

### 11.1 File: electron/main.js

**Category:** Electron Main Process  
**Business Criticality:** P0 (CRITICAL - Application launcher)  
**Test Priority:** Priority 1  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** Electron main process  
**Type:** Application Orchestration  
**Complexity:** VERY HIGH  
**LOC:** ~300+

**Key Responsibilities:**
1. Show splash screen on launch
2. Find free TCP port (for backend)
3. Locate bundled JRE within app resources
4. Launch Spring Boot JAR with dynamic port
5. Poll backend health until ready (with timeout)
6. Create BrowserWindow for Angular frontend (at localhost:port)
7. Handle backend crashes (with restart)
8. Graceful shutdown (cleanup processes)
9. Preload script bridging (IPC)

**Exports (Key Functions):**
- `setupLogging(userDataPath)` - Logger configuration
- `findFreePort()` → Promise<number>
- `resolveResourcePath(...segments)` → string (asset resolution)
- `resolveJavaBinary()` → string (path to java executable)
- `resolveJar()` → string (path to JRE-bundled Spring Boot JAR)
- `startBackend(port, userDataPath)` → Promise<port>
- `createWindow(port)` → void (BrowserWindow creation)
- `handleIPC()` → void (Preload bridge handlers)

**External Dependencies:**
- electron-log (file logging)
- child_process.spawn (JRE/JAR execution)
- net.createServer (port detection)
- fs (file system)
- path (resource resolution)
- electron APIs (BrowserWindow, app lifecycle)

**Unit Test Status:** NOT COVERED

**Recommended Action:** GENERATE COMPLETE TEST SUITE (VERY HIGH COMPLEXITY)

**Missing Coverage:**
- Port detection logic (find free port)
- JRE resolution logic (multiple possible paths)
- JRE binary existence checks
- JAR file existence checks
- Backend process spawning
- Backend startup polling (health checks)
- Polling timeout handling
- Backend crash detection & recovery
- Window creation and lifecycle
- IPC handler registration
- Graceful shutdown (SIGTERM handling)
- Error scenarios:
  - Port conflict (in use)
  - JRE not found (fallback logic)
  - JAR not found
  - Backend startup timeout
  - Backend process crash
  - Window creation failure
- Resource path resolution (Windows vs macOS/Linux)
- App data directory handling
- Logging configuration

**Test Generation Estimated Effort:** 30-40 test cases (8-10 hours) - VERY COMPLEX, REQUIRES PROCESS MOCKING

---

### 11.2 File: electron/preload.js

**Category:** Preload Script (Context Isolation Bridge)  
**Business Criticality:** P1  
**Test Priority:** Priority 2  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** Electron preload  
**Type:** Context Bridge  
**Complexity:** LOW  
**LOC:** ~30

**Exports (Context Bridge):**
- `electronAPI.getApiPort()` → number (sync call)
- `electronAPI.getAppVersion()` → string (sync call)
- `electronAPI.logFromRenderer(level, message)` → void (async log)

**Security Model:**
- contextIsolation: true (process isolated)
- nodeIntegration: false (Node discouraged)
- Only safe narrow surface exposed

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 4-5 test cases (1 hour)

---

### 11.3 File: electron/scripts/build.js

**Category:** Build Orchestrator  
**Business Criticality:** P1  
**Test Priority:** Priority 3  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** Build script  
**Type:** Build automation  
**Complexity:** HIGH  
**LOC:** ~100+

**Responsibilities:**
1. Build Angular frontend → `dist/` directory
2. Build Spring Boot JAR → `backend/target/`
3. Download/prepare bundled JRE (if needed)
4. Launch Electron dev mode OR trigger electron-builder (prod)

**Command-line Modes:**
- `--dev` - Debug mode (launch Electron directly)
- `--prod` - Production mode (package all platforms)
- `--win`, `--linux`, `--mac` - Platform-specific packaging

**External Dependencies:**
- child_process.spawn, child_process.execSync
- fs (file checks)
- path (cross-platform paths)

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 12-15 test cases (3-4 hours) - REQUIRES SUBPROCESS MOCKING

---

### 11.4 File: electron/scripts/download-jre.js

**Category:** JRE Download Utility  
**Business Criticality:** P1  
**Test Priority:** Priority 3  
**Existing Test:** NO TEST  
**Coverage:** 0%  

**Module:** Build helper  
**Type:** Build utility  
**Complexity:** HIGH  
**LOC:** ~100+

**Responsibilities:**
1. Download Temurin Java 17 for platform (Windows/macOS/Linux)
2. Extract to `jre/` directory
3. Fallback to system Java if download unavailable
4. Cache detection (skip re-download if exists)

**External Dependencies:**
- HTTP client (download)
- Archive extraction (zip, tar.gz)
- fs (file operations)
- path (platform-specific paths)

**Unit Test Status:** NOT COVERED

**Test Generation Estimated Effort:** 15-18 test cases (4-5 hours) - REQUIRES NETWORK & EXTRACTION MOCKING

---

## PART 12: TEST SUMMARY & STATISTICS

### Total Inventory

| Category | Files | P0 | P1 | P2 |
|----------|-------|----|----|-----|
| Controllers | 7 | 3 | 3 | 1 |
| Services | 5 | 1 | 3 | 1 |
| Repositories | 6 | 1 | 4 | 1 |
| Models/Entities | 11 | 2 | 8 | 1 |
| Config/Util | 5 | 1 | 2 | 2 |
| Components | 13 | 3 | 7 | 3 |
| Services (FE) | 10 | 1 | 6 | 3 |
| Guards/Interceptors | 2 | 0 | 2 | 0 |
| Routes/Config | 3 | 2 | 1 | 0 |
| Electron/Build | 4 | 1 | 2 | 1 |
| **TOTAL** | **56** | **15** | **38** | **13** |

### Current Testing Status

| Metric | Count |
|--------|-------|
| Files with Tests | 1 |
| Files WITHOUT Tests | 55 |
| Existing Test Cases | ~3 |
| Test Coverage | <5% |
| P0 Files with Tests | 0 |
| P1 Files with Tests | 1 |
| P2 Files with Tests | 0 |

### Test Generation Priority Breakdown

| Priority | Backend | Frontend | Electron | Total Files | Estimated Tests | Effort (hours) |
|----------|---------|----------|----------|-------------|-----------------|----------------|
| **Priority 1 (CRITICAL)** | 8 | 8 | 1 | **17 files** | 180-220 tests | 45-55 hours |
| **Priority 2 (HIGH)** | 10 | 9 | 2 | **21 files** | 120-150 tests | 30-40 hours |
| **Priority 3 (MEDIUM)** | 5 | 5 | 1 | **11 files** | 60-80 tests | 15-20 hours |
| **Priority 4 (LOW)** | 2 | 8 | 0 | **10 files** | 40-50 tests | 10-15 hours |
| | | | | **TOTAL: 59 files** | **400-500 tests** | **100-130 hours** |

### Files by Business Criticality

| Criticality | Count | Test Priority | Key Files |
|-------------|-------|---------------|-----------|
| **P0 (CRITICAL)** | 15 | Priority 1 | RiskCalculationService, RiskController, ProjectLayoutComponent, Electron main.js |
| **P1 (CORE)** | 38 | Priority 2 | Repositories, Business Services, Most Components, Guards |
| **P2 (SUPPORTING)** | 13 | Priority 3 | Config, Utils, DTOs, Electron scripts |

### Files by Test Difficulty

| Difficulty | Files | Examples | Estimated Tests |
|-----------|-------|----------|-----------------|
| **EASY** | 15 | Repositories, DTOs, Guards | 40-50 tests (1-2 hours each) |
| **MEDIUM** | 22 | Services, Components, Controllers | 150-180 tests (2-3 hours each) |
| **HARD** | 12 | RiskCalc, Wizard, Batch Ops | 100-130 tests (3-4 hours each) |
| **VERY HARD** | 7 | Electron, Build scripts, GeminiAPI | 110-140 tests (4-5+ hours each) |

---

## PART 13: STRATEGIC RECOMMENDATIONS

### Phase 1: Foundation (Weeks 1-3) - 40 hours
**Focus:** Business-critical calculations and core workflows

Priority 1 Files (most critical):
1. **RiskCalculationService** (50-70 tests) - 12-15 hours
2. **RiskController** (15-20 tests) - 4-5 hours
3. **ProjectLayoutComponent** (20-25 tests) - 5-6 hours
4. **Electron main.js** (30-40 tests) - 8-10 hours
5. **AuthController + AuthService** (20-25 tests) - 5-6 hours

### Phase 2: Coverage Expansion (Weeks 4-6) - 40 hours
Priority 2 Files:
- Service layer (ProjectService, AssetService, VulnerabilityService)
- Frontend components (Risks, Vulnerabilities, Assets)
- Business logic (Asset/Risk/Vulnerability CRUD)

### Phase 3: Automation & Regression (Weeks 7-10) - 25 hours
- E2E tests (Playwright) for critical workflows
- Integration tests
- Repository tests
- Configuration tests

### Phase 4: Polish & Optimization (Weeks 11-12) - 20 hours
- Performance tests
- Security tests (auth, injection, CSRF)
- Accessibility tests
- Coverage optimization

---

## END OF SOURCE INVENTORY

**Document:** Complete source code inventory with test traceability  
**Total Files Analyzed:** 56 source files  
**Total Test Gap:** 55 files without tests (98% uncovered)  
**Total Estimated Test Generation:** 400-500 test cases (100-130 hours)  
**Recommended Start:** Priority 1 risk calculation and wizard tests  

### Next Steps for AI Agents
1. Use this inventory to systematically generate tests file-by-file
2. Start with Priority 1 P0 files (highest business value)
3. Focus on core risk calculation logic first (foundation)
4. Build up E2E tests after unit test foundation
5. Validate test coverage metrics after each phase

