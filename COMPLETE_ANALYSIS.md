# Security Assessment Tool - Complete Repository Analysis

**Project Name:** ISRA 2.0 (Thales Security Risk Assessment Tool)  
**Version:** 2.0.0  
**Organization:** Thales Group  
**Analysis Date:** June 24, 2026

---

## Executive Summary

**ISRA (Integrated Security Risk Assessment)** is a comprehensive desktop application built with **Electron**, **Angular**, and **Spring Boot** that evaluates security risks of engineering projects in compliance with **ISO 27005** risk management standards. The tool provides an end-to-end risk assessment workflow with AI-powered threat and vulnerability suggestions powered by Google Gemini.

**Key Purpose:** Enable security teams to systematically assess and manage security risks through a structured, multi-step wizardlike interface that captures project context, identifies assets, catalogs vulnerabilities, and creates risk profiles with mitigation strategies.

---

## 1. PROJECT STRUCTURE & ARCHITECTURE

### Directory Layout
```
security-assessment-tool/
├── backend/                    # Spring Boot 3.3 REST API (Java 17)
├── frontend/                   # Angular 18 Web Client
├── electron/                   # Electron Desktop Application
├── prompts/                    # AI/ML Prompt Templates
├── generated/                  # Generated Files
├── architecture_diagram.md     # Architecture Documentation
├── instructions.md             # Development Instructions
└── README.md
```

### High-Level Architecture: Decoupled Layered System

```
┌─────────────────────────────────────────────────────┐
│        Presentation Layer (Angular 18)              │
│  Dashboard, Project Wizard, Risk Assessment UI      │
│  Material Design Components, Signals-based State    │
└─────────────┬───────────────────────────────────────┘
              │ HTTP REST
┌─────────────▼───────────────────────────────────────┐
│     API Gateway (Spring Boot REST)                  │
│  Controllers → Services → Repositories → H2 DB      │
│  Risk Calculation, AI Integration, File Upload      │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│  Electron Main Process                              │
│  • Launches Backend JAR dynamically                 │
│  • Manages Windows & Lifecycle                      │
│  • Bridges IPC between Renderer & Backend           │
└─────────────────────────────────────────────────────┘
```

---

## 2. BACKEND ARCHITECTURE (Java/Spring)

### Technology Stack
- **Framework:** Spring Boot 3.3.0
- **Java Version:** 17
- **Database:** H2 (Embedded, File-Based)
- **ORM:** Hibernate (Spring Data JPA)
- **Database Migrations:** Flyway (initially disabled, manual migration in V1)
- **Build Tool:** Maven
- **HTTP Client:** RestTemplate
- **Serialization:** Jackson JSON
- **Code Generation:** Lombok
- **Cryptography:** Spring Security Crypto (BCrypt)

### Core Package Structure

```
com/thalesgroup/isra/
├── IsraBackendApplication.java      # Spring Boot Entry Point
├── controller/                       # REST Endpoints
│   ├── AiController                 # AI Suggestions (Threats, Vulnerabilities)
│   ├── AuthController               # Authentication / User Management
│   ├── BusinessAssetController      # Business Assets CRUD
│   ├── IsraProjectController        # Project Management CRUD
│   ├── RiskController               # Risk Management & Calculations
│   ├── SupportingAssetController    # Supporting Assets CRUD
│   └── VulnerabilityController      # Vulnerability CRUD
├── model/                           # JPA Entities
│   ├── IsraProject                  # Root Project Aggregate
│   ├── IsraProjectContext           # Project Metadata & Scope
│   ├── IsraTracking                 # Iteration Tracking
│   ├── BusinessAsset                # High-level Assets (CIA Properties)
│   ├── SupportingAsset              # Technical/Logical Assets
│   ├── Vulnerability                # Vulnerability Catalog
│   ├── Risk                         # Risk Register with Calculations
│   ├── RiskAttackPath               # Attack Path Details
│   ├── RiskVulnerabilityRef         # Attack Path Vulnerabilities
│   ├── RiskMitigation               # Risk Mitigations
│   └── User                         # User Entity (for auth)
├── service/                         # Business Logic
│   ├── RiskCalculationService       # Risk Scoring & Aggregation
│   ├── FileStorageService           # Attachment Management
│   └── ai/                          # AI Integration
│       ├── RiskAiAssistService      # AI Orchestrator
│       ├── GeminiAiProvider         # Google Gemini Integration
│       └── AiConnectivityChecker    # Health Checks
├── repository/                      # Data Access Layer
│   ├── IsraProjectRepository
│   ├── BusinessAssetRepository
│   ├── SupportingAssetRepository
│   ├── VulnerabilityRepository
│   ├── RiskRepository
│   └── UserRepository
├── config/                          # Configuration
│   ├── CorsConfig                   # CORS Policy (Allow Frontend Origins)
│   └── RestTemplateConfig           # HTTP Client Bean
├── dto/                             # Data Transfer Objects
│   └── ai/
│       ├── ThreatSuggestion         # Threat DTO
│       ├── VulnerabilitySuggestion  # Vulnerability DTO
│       ├── AiStatusResponse         # Status DTO
│       └── ...Request/Response DTOs
└── exception/                       # Custom Exceptions
    └── AiUnavailableException
```

### Database Schema (H2)

#### Tables Overview
1. **isra_projects** - Root project entity with Azure AD ownership
2. **isra_tracking** - Version/iteration history for projects
3. **isra_project_contexts** - Project scope, objectives, assumptions
4. **business_assets** - High-level assets (CIA properties: 0-10 scale)
5. **supporting_assets** - Technical/logical assets supporting business assets
6. **supporting_business_assets** - M2M mapping (Supporting → Business)
7. **vulnerabilities** - Vulnerability catalog with CVE tracking
8. **vulnerability_supporting_assets** - M2M mapping (Vulnerability → Supporting)
9. **risks** - Risk register with multi-stage calculations
10. **risk_attack_paths** - Attack paths per risk
11. **risk_vulnerability_refs** - Vulnerabilities in attack paths
12. **risk_mitigations** - Mitigation strategies per risk

#### Key Entity Relationships
```
IsraProject (1:N)
├── IsraTracking
├── IsraProjectContext (1:1)
├── BusinessAsset (1:N)
├── SupportingAsset (1:N)
│   └── SupportingAsset.businessAssets (M:M via supporting_business_assets)
├── Vulnerability (1:N)
│   └── Vulnerability.supportingAssets (M:M via vulnerability_supporting_assets)
└── Risk (1:N)
    ├── Risk.businessAssetRef (M:1)
    ├── Risk.supportingAssetRef (M:1)
    ├── RiskAttackPath (1:N)
    │   └── RiskVulnerabilityRef (1:N) → Vulnerability
    └── RiskMitigation (1:N)
```

---

## 3. SERVICE LAYER & BUSINESS LOGIC

### RiskCalculationService
**Purpose:** Multi-stage automated risk scoring following ISO 27005 principles

**Calculation Pipeline:**
1. **Threat Factor Score** - Average of: Skill Level, Reward, Access Resources, Size, Intrusion Detection
2. **Threat Factor Level** - Categorized as: Low | Medium | High | Very High
3. **Occurrence Level** - Based on Occurrence input (Low/Medium/High/Very High)
4. **Risk Likelihood** - OWASP-style matrix combining Threat Factor + Occurrence
5. **Risk Impact** - Maximum CIA value (C/I/A/Auth/AuthZ/NonRep) affected
6. **Attack Paths Score** - Aggregation of vulnerability scores in paths
7. **Inherent Risk Score** - Likelihood × Impact
8. **Mitigation Adjustment** - Benefits of mitigations applied
9. **Residual Risk Score** - Final score after mitigations
10. **Residual Risk Level** - Low/Medium/High/Critical

**Key Methods:**
- `calculateThreatFactor()` - Averages threat agent capability attributes
- `calculateLikelihood()` - OWASP-style matrix lookup
- `calculateImpact()` - Max of affected CIA properties from business asset
- `calculateAttackPaths()` - Aggregates vulnerability path scores
- `updateRiskImpactThreatVerb()` - Auto-maps threat verbs to CIA flags (e.g., "steal" → Confidentiality)

### RiskAiAssistService
**Purpose:** Orchestrates AI-powered threat and vulnerability suggestions

**Features:**
- Validates API key configuration & connectivity
- Passes asset context to Gemini API
- Returns structured suggestions as JSON

**Methods:**
- `suggestThreats(businessAssetId, supportingAssetId)` - Returns 3 threat scenarios
- `suggestVulnerabilities(supportingAssetId)` - Returns relevant vulnerabilities

### GeminiAiProvider
**Purpose:** Direct integration with Google Generative AI API

**Configuration:**
- API Key: `${ISRA_AI_API_KEY}` environment variable
- Model: `gemini-3.1-flash-lite` (configurable)
- Base URL: `https://generativelanguage.googleapis.com`
- Response Format: Structured JSON with schema validation

**Usage:**
- Prompts model for threat scenarios given business/supporting asset context
- Parses JSON responses with threat agent, verb, motivation, rationale
- Fallback: Graceful degradation if API unavailable

### FileStorageService
**Purpose:** Manages file uploads/downloads for project attachments

**Features:**
- Upload directory: `${app.data.dir}/attachments`
- Attachment support: Project descriptions, vulnerability details
- Max file size: 1024 MB

### AiConnectivityChecker
**Purpose:** Health monitoring of AI service

**Methods:**
- `isOnline(forceRefresh)` - Polls Gemini health check endpoint
- Caches result with optional refresh

---

## 4. FRONTEND ARCHITECTURE (Angular 18)

### Technology Stack
- **Framework:** Angular 18 with standalone components
- **State Management:** Signals & Computed (no NgRx)
- **Forms:** Reactive Forms API
- **HTTP:** HttpClient with interceptors
- **UI Library:** Angular Material 18
- **Styling:** SCSS
- **Build Tool:** Angular CLI

### Core Features

#### Global App Configuration
- **AppConfig:** Provides zone change detection, router, HTTP client, animations
- **AuthInterceptor:** Attaches `X-Username` header on all requests

#### Routing Structure
```
/login                        → LoginComponent
/register                     → RegisterComponent
/                             → DashboardComponent (protected by authGuard)
/project/:projectId
├── /basic-info               → BasicInfoComponent
├── /context                  → ProjectContextComponent
├── /business-assets          → BusinessAssetsComponent
├── /supporting-assets        → SupportingAssetsComponent
├── /vulnerabilities          → VulnerabilitiesComponent
├── /risks                    → RisksComponent
└── /reports                  → ReportsComponent
```

### Core Services Architecture

#### AuthService
**State:** Using Signals
- `currentUser: Signal<UserDto | null>`
- `isAuthenticated: Computed()`
- `userRole: Computed()`

**Methods:**
- `login(username, password)` - POST /api/auth/login
- `register(userData)` - POST /api/auth/register
- `logout()` - Clear local storage & signal

**Notes:** Session persisted in localStorage; no JWT (uses X-Username header)

#### ProjectService
**Shared State:**
- `activeProject: Signal<IsraProject | null>`

**Methods:**
- `getProjects()` - All projects for current user
- `getProject(id)` - Single project details
- `createProject(project)` - Create new project
- `updateProject(id, project)` - Update project metadata
- `deleteProject(id)` - Delete project
- `updateProjectContext(projectId, context)` - Update scope/objectives
- `uploadContextAttachment(projectId, file)` - File upload
- `downloadContextAttachment(projectId)` - File download

#### AssetService
**DTOs:**
```ts
interface BusinessAsset {
  assetName: string;
  assetType?: string;
  assetDescription?: string;
  confidentiality: number;    // 0-10 scale
  integrity: number;
  availability: number;
  authenticity: number;
  authorization: number;
  nonRepudiation: number;
}

interface SupportingAsset {
  hldId?: string;
  assetName: string;
  assetType?: string;
  securityLevel?: number;
  businessAssets?: BusinessAsset[];
}
```

**Methods:** CRUD for business and supporting assets at `/api/projects/{projectId}/[business|supporting]-assets`

#### RiskService
**DTOs:**
```ts
interface Risk {
  riskId?: number;
  riskName?: string;
  threatAgent?: string;
  threatVerb?: string;
  motivation?: string;
  
  // Likelihood
  skillLevel?: number;
  reward?: number;
  accessResources?: number;
  size?: number;
  intrusionDetection?: number;
  threatFactorScore?: number;
  occurrence?: number;
  isOwaspLikelihood?: boolean;
  
  // Impact
  riskImpact?: number;
  confidentialityFlag?: number;
  integrityFlag?: number;
  availabilityFlag?: number;
  authenticityFlag?: number;
  
  // Scores
  inherentRiskScore?: number;
  mitigatedRiskScore?: number;
  residualRiskScore?: number;
  residualRiskLevel?: string;
  
  // Assets & Mitigations
  businessAssetRef?: BusinessAsset;
  supportingAssetRef?: SupportingAsset;
  riskAttackPaths?: RiskAttackPath[];
  riskMitigations?: RiskMitigation[];
}
```

**Methods:**
- `getRisks(projectId)`
- `addRisk(projectId, risk)` - Creates + auto-calculates
- `updateRisk(projectId, id, risk)` - Updates + recalculates
- `deleteRisk(projectId, id)`
- `getAllRisksByProject(projectId)`

#### VulnerabilityService
**Methods:**
- `getVulnerabilities(projectId)`
- `addVulnerability(projectId, vuln)`
- `updateVulnerability(projectId, id, vuln)`
- `batchUpdateVulnerabilities(projectId, vulns)`
- `deleteVulnerability(projectId, id)`
- `uploadAttachment(projectId, id, file)`
- `downloadAttachment(projectId, id)`

#### RiskAiService
**DTOs:**
```ts
interface ThreatSuggestion {
  threatAgent: string;
  threatVerb: string;
  motivation: string;
  rationale: string;
}

interface VulnerabilitySuggestion {
  vulnerabilityName: string;
  vulnerabilityFamily?: string;
  vulnerabilityDescription?: string;
  estimatedCveScore: number;
}
```

**Methods:**
- `suggestThreats(businessAssetId, supportingAssetId)` - POST /api/ai/suggest-threats
- `suggestVulnerabilities(supportingAssetId)` - POST /api/ai/suggest-vulnerabilities

#### AiStatusService
**Real-time Monitoring:**
- `aiState: Signal<'available' | 'offline' | 'not-configured'>`
- `statusMessage: Signal<string>`
- Polls backend every 15 seconds
- Browser online/offline event listeners

**Methods:**
- `check(forceRefresh)` - GET /api/ai/status

#### ConfigService
**Purpose:** Centralize backend URL resolution

**Logic:**
- For Electron: Uses `window.electronAPI.getApiPort()` to get dynamic port
- For Web Dev: Falls back to `http://localhost:8080`

#### WizardValidationService
Validates cross-tab constraints (e.g., risks can't reference deleted assets)

#### AuthGuard
Redirect to `/login` if not authenticated

---

## 5. COMPONENT STRUCTURE

### DashboardComponent
**Purpose:** Project listing, creation, search, theme toggle

**Features:**
- Signal-based project filtering
- Create new project form
- User profile popup
- Dark/Light theme toggle (localStorage persistence)
- Material Table for projects

**Displayed Columns:** Status, Risk Count, Vulnerability Count, Top Risk, Last Updated

### ProjectLayoutComponent
**Purpose:** Nested routing wrapper for project sub-pages

**Child Routes:** basic-info, context, business-assets, supporting-assets, vulnerabilities, risks, reports

### BasicInfoComponent
Edit project details (name, version, organization, classification)

### ProjectContextComponent
Capture project scope, security objectives, assumptions, attachments

### BusinessAssetsComponent
Manage high-level business assets with CIA scoring

### SupportingAssetsComponent
Manage technical/logical assets supporting business assets

### VulnerabilitiesComponent
Catalog vulnerabilities with CVE scoring, supporting asset mapping

### RisksComponent
**Complex Component with:**
- Risk CRUD operations
- Threat agent/verb selection
- Impact flag mapping from threat verb
- Attack path management (vulnerabilities in sequence)
- Mitigation tracking (decision, cost/benefit)
- AI-powered threat suggestions
- Risk calculation visualization

**Features:**
```ts
@Component
- Form validation (submitted, listSubmitted signals)
- Threat suggestion loading indicator
- AI status display
- Default risk templates for demo
- Multi-stage form (basic info → attack paths → mitigations)
```

### ReportsComponent
Generate visual reports with charts (Chart.js via frontend library) and export to HTML/PDF

---

## 6. ELECTRON APPLICATION

### Startup Sequence
1. **main.js launches** → Setup logging
2. **Find free TCP port** dynamically
3. **Locate bundled JRE** (Temurin layout: `jre/<version>/bin/java`)
4. **Launch Spring Boot JAR**:
   ```bash
   java -Dserver.port=<dynamicPort> \
        -Dapp.data.dir=<userDataPath> \
        -jar security-risk-assessment-tool.jar
   ```
5. **Poll backend until ready** (health check loop)
6. **Create BrowserWindow** (splash screen shown initially)
7. **Load Angular app** (`dist/frontend/index.html`)
8. **Close splash → Show main window**

### Directory Structure
```
electron/
├── main.js                  # Electron Main Process (Entry Point)
├── preload.js              # IPC Bridge (Context Isolation)
├── splash.html             # Splash Screen
├── package.json            # Dependencies & Scripts
├── builder-config.yml      # Electron Builder Configuration
├── scripts/
│   ├── build.js            # Build workflow (ng build → electron-builder)
│   └── download-jre.js     # JRE download utility
└── assets/                 # App Icons & Resources
```

### Key Features
- **Dynamic Port Assignment:** Eliminates port conflicts
- **JRE Bundling:** Ships with self-contained Java runtime
- **Splash Screen:** Immediate visual feedback during startup
- **Graceful Shutdown:** Terminates backend process on window close
- **Process Crash Handling:** Monitors backend health, restarts if needed
- **Logging:** Electron + backend logs to `<userData>/logs/`

### Distribution
- **Scripts:**
  - `npm run dev` - Development mode (ng serve + electron)
  - `npm run build` - Production build
  - `npm run dist:win` - Windows executable
  - `npm run dist:linux` - Linux appimage
  - `npm run dist:mac` - macOS .app
  - `npm run dist:all` - All platforms

---

## 7. DATA MODEL (Entities & Relationships)

### IsraProject
**Root Aggregate** - Represents a single security assessment project

**Fields:**
- `id: Long` - Primary key
- `projectName: String` - Project identifier
- `projectVersion: String` - Release version
- `projectOrganization: String` - Department/team
- `classification: String` - Sensitivity (Public, Confidential, Secret, etc.)
- `schemaVersion: Integer` - Data format version for migrations
- `iteration: Integer` - Assessment round number
- `ownerOid: String` - Azure AD Object ID (ownership tracking)
- `ownerName: String` - Display name for convenience
- `createdAt: LocalDateTime` - Audit timestamp
- `updatedAt: LocalDateTime` - Audit timestamp

**Collections:**
- `projectContext: IsraProjectContext (1:1)` - Scope & objectives
- `trackingList: List<IsraTracking>` - Iteration history
- `businessAssets: List<BusinessAsset>` - High-level assets
- `supportingAssets: List<SupportingAsset>` - Technical assets
- `vulnerabilities: List<Vulnerability>` - Catalog
- `risks: List<Risk>` - Risk register

### IsraProjectContext
**Metadata for project scope**

**Fields:**
- `projectDescription: String` - Assessment scope narrative
- `projectUrl: String` - Project reference link
- `securityProjectObjectives: String` - What security goals to achieve
- `securityOfficerObjectives: String` - Officer-specific goals
- `securityAssumptions: String` - Limitations & assumptions
- `projectDescriptionAttachmentPath: String` - Uploaded file reference

### BusinessAsset
**High-level organizational assets** (what's being protected)

**Fields:**
- `assetId: Integer` - Sequential ID within project
- `assetName: String` - Business-readable name (e.g., "Cardholder Data")
- `assetType: String` - Category (Data, Service, Process, etc.)
- `assetDescription: String` - Context & importance
- **CIA Properties (0-10 scale):**
  - `confidentiality: Integer` - Impact if disclosed
  - `integrity: Integer` - Impact if modified
  - `availability: Integer` - Impact if unavailable
  - `authenticity: Integer` - Impact if spoofed
  - `authorization: Integer` - Impact of unauthorized access
  - `nonRepudiation: Integer` - Impact of denial

### SupportingAsset
**Technical/logical assets** supporting business assets (IT systems, networks, APIs)

**Fields:**
- `assetId: Integer` - Sequential ID
- `hldId: String` - High-Level Design reference
- `assetName: String` - System name (e.g., "Payment API")
- `assetType: String` - Technology type (Web Service, Database, etc.)
- `securityLevel: Integer` - Inherent protection level (0-10)
- `businessAssets: List<BusinessAsset>` - M2M mapping (what it supports)

### Vulnerability
**Known weaknesses** that can be exploited

**Fields:**
- `vulnerabilityId: Integer` - Sequential ID
- `vulnerabilityName: String` - Weakness name
- `vulnerabilityFamily: String` - Category (e.g., OWASP Top 10)
- `trackingId: String` - Internal tracking reference
- `trackingUri: String` - Link to tracking system (JIRA, etc.)
- `vulnerabilityDescription: String` - Technical details
- `cve: String` - CVE identifier (e.g., "CVE-2024-1234")
- `cveScore: Double` - CVSS score (0-10)
- `overallScore: Integer` - Custom severity score
- `overallLevel: String` - Severity label (Low/Medium/High/Critical)
- `supportingAssets: List<SupportingAsset>` - M2M mapping (affected systems)

### Risk
**Combinations of threat + vulnerability + asset + impact**

**Threat Modeling (Threat Agent + Threat Verb):**
- `threatAgent: String` - Who (External Attacker, Insider, etc.)
- `threatVerb: String` - Action (steal, tamper, deny, spoof, repudiate, etc.)
- `motivation: String` - Why (financial gain, sabotage, etc.)

**Asset References:**
- `businessAssetRef: BusinessAsset` - What's at risk
- `supportingAssetRef: SupportingAsset` - How it's exploited

**Likelihood Calculation (ISO 27005 / OWASP Style):**
- `skillLevel: Integer` - Attacker capability (0-10)
- `reward: Integer` - Motivation/gain (0-10)
- `accessResources: Integer` - Resource availability (0-10)
- `size: Integer` - Group size capability (0-10)
- `intrusionDetection: Integer` - Detection difficulty (0-10)
- → `threatFactorScore: Double` - Average of above
- → `threatFactorLevel: String` - Low/Medium/High/Very High

**Occurrence:**
- `occurrence: Integer` - Frequency of threat (0-10)
- → `occurrenceLevel: String` - Low/Medium/High/Very High

**Likelihood Output:**
- `riskLikelihood: Integer` - 1-4 scale (maps from threat factor × occurrence matrix)
- `isOwaspLikelihood: Boolean` - Use OWASP matrix (else manual)

**Impact Measurement:**
- `confidentialityFlag: Integer` - Affects confidentiality? (0/1)
- `integrityFlag: Integer` - Affects integrity? (0/1)
- `availabilityFlag: Integer` - Affects availability? (0/1)
- ... (5 more CIA properties)
- → `riskImpact: Integer` - Max CIA value from business asset

**Attack Paths:**
- `allAttackPathsName: String` - Concatenation of vulnerability names
- `allAttackPathsScore: Double` - Aggregated attack path score
- `riskAttackPaths: List<RiskAttackPath>` - Multi-step exploitation sequences

**Scoring:**
- `inherentRiskScore: Double` - Likelihood × Impact (before mitigations)
- `mitigationsBenefits: Double` - Total benefit from all mitigations
- `mitigationsDoneBenefits: Double` - Benefit from completed mitigations only
- `mitigatedRiskScore: Double` - Risk after mitigations (if all done)
- `residualRiskScore: Double` - Final accepted risk level
- `residualRiskLevel: String` - Critical/High/Medium/Low

**Risk Management Decision:**
- `riskManagementDecision: String` - Avoid / Accept / Mitigate / Transfer / Discard
- `riskManagementDetail: String` - Justification

### RiskAttackPath
**Sequence of vulnerabilities** creating an attack scenario

**Fields:**
- `attackPathId: Integer` - Sequential ID within risk
- `attackPathName: String` - Descriptive name (e.g., "Unpatched Auth API → DB Injection")
- `attackPathScore: Double` - Aggregated severity
- `vulnerabilityRefs: List<RiskVulnerabilityRef>` - Vulnerabilities in sequence

### RiskVulnerabilityRef
**Maps vulnerabilities into attack paths**

**Fields:**
- `vulnerability: Vulnerability` - The weakness
- `score: Double` - Contribution to path score
- `name: String` - Alias/description in context

### RiskMitigation
**Control strategies** to reduce risk

**Fields:**
- `mitigationId: Integer` - Sequential ID
- `description: String` - What control is implemented
- `benefits: Double` - Risk reduction percentage (0-100)
- `cost: Double` - Implementation cost
- `decision: String` - Accepted / Done / Proposed
- `decisionDetail: String` - Notes

### IsraTracking
**Audit trail** of assessment versions

**Fields:**
- `trackingIteration: Integer` - Version number
- `trackingDate: Date` - Assessment date
- `trackingComment: String` - Summary of changes

---

## 8. API / SERVICE LAYER

### REST Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration

#### Projects
- `GET /api/projects` - List projects (filtered by X-Username header)
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project metadata
- `DELETE /api/projects/{id}` - Delete project

#### Project Context
- `GET /api/projects/{id}/context` - Get scope/objectives
- `PUT /api/projects/{id}/context` - Update context
- `POST /api/projects/{id}/context/attachment` - Upload file
- `GET /api/projects/{id}/context/attachment` - Download file

#### Business Assets
- `GET /api/projects/{projectId}/business-assets`
- `POST /api/projects/{projectId}/business-assets` - Create asset
- `PUT /api/projects/{projectId}/business-assets/{id}` - Update asset
- `DELETE /api/projects/{projectId}/business-assets/{id}` - Delete asset

#### Supporting Assets
- `GET /api/projects/{projectId}/supporting-assets`
- `POST /api/projects/{projectId}/supporting-assets` - Create asset
- `PUT /api/projects/{projectId}/supporting-assets/{id}` - Update asset
- `DELETE /api/projects/{projectId}/supporting-assets/{id}` - Delete asset

#### Vulnerabilities
- `GET /api/projects/{projectId}/vulnerabilities`
- `POST /api/projects/{projectId}/vulnerabilities` - Create vulnerability
- `PUT /api/projects/{projectId}/vulnerabilities/{id}` - Update vulnerability
- `PUT /api/projects/{projectId}/vulnerabilities/batch` - Batch update
- `DELETE /api/projects/{projectId}/vulnerabilities/{id}` - Delete vulnerability
- `POST /api/projects/{projectId}/vulnerabilities/{id}/attachment` - Upload attachment
- `GET /api/projects/{projectId}/vulnerabilities/{id}/attachment` - Download attachment

#### Risks
- `GET /api/projects/{projectId}/risks` - List risks
- `POST /api/projects/{projectId}/risks` - Create risk (auto-calculates)
- `PUT /api/projects/{projectId}/risks/{id}` - Update risk (recalculates)
- `DELETE /api/projects/{projectId}/risks/{id}` - Delete risk

#### AI Services
- `GET /api/ai/status[?refresh=true]` - Check AI service availability
  - Returns: `{ status: 'available'|'offline'|'not-configured', message: String }`
- `POST /api/ai/suggest-threats` - AI threat suggestions
  - Request: `{ businessAssetId?: Long, supportingAssetId?: Long }`
  - Response: `{ suggestions: ThreatSuggestion[] }`
- `POST /api/ai/suggest-vulnerabilities` - AI vulnerability suggestions
  - Request: `{ supportingAssetId?: Long }`
  - Response: `{ suggestions: VulnerabilitySuggestion[] }`

---

## 9. SECURITY FEATURES

### Authentication & Authorization
- **Session Management:** Username stored in localStorage
- **Header-Based ID:** X-Username header sent with all requests
- **Per-Project Ownership:** Data scoped via `ownerOid` (Azure AD Object ID)
- **Auth Guard:** Route protection at `/project/:id` and dashboard
- **Auth Interceptor:** Automatically attaches X-Username header

### Data Protection
- **Password Hashing:** Spring Security BCrypt for credentials
- **Serialization Security:** Jackson ObjectMapper for JSON validation
- **File Upload Security:** Max 1024 MB; stored in isolated directory
- **CORS Configuration:** Whitelist allowed origins (localhost:4200/4201 for dev)

### Authorization Patterns
- **Project Isolation:** Each user sees only their own projects (via ownerOid)
- **No JWT:** Simplified auth using header-based user tracking
- **Default Owner:** Projects default to "default-owner-oid" if X-Username absent

### TODO / Gaps
- Consider JWT tokens for Electron distribution
- Add role-based access control (ADMIN, ASSESSOR, REVIEWER)
- Implement audit logging of risk changes
- Add export encryption for sensitive reports

---

## 10. RISK ASSESSMENT WORKFLOW

### Step-by-Step Process

**1. Project Initialization**
- Create project with name, version, organization, classification
- Auto-create empty `IsraProjectContext`

**2. Define Project Scope** (basic-info, context)
- Set project description, URL, security objectives
- Document assumptions and constraints
- Upload reference documents

**3. Identify Business Assets** (business-assets)
- List high-level assets (e.g., "Customer Data", "Payment Gateway")
- Score each on CIA properties (0-10 scale)
- Define asset importance to organization

**4. Map Technical Assets** (supporting-assets)
- Identify systems supporting business assets
- Link supporting assets to business assets (M:M)

**5. Catalog Vulnerabilities** (vulnerabilities)
- Research relevant weaknesses (OWASP, CVE database)
- Record CVE scores, families, descriptions
- Map vulnerabilities to supporting assets

**6. Model Threats & Quantify Risk** (risks)
- **Create Risk Entry:**
  - Select threat agent (External Attacker, Insider, etc.)
  - Define threat verb (steal, tamper, deny, spoof, etc.)
  - Select target business asset & supporting asset
  - Auto-map threat verb to CIA impact flags (e.g., "steal" → Confidentiality)

- **Evaluate Threat Factor (Likelihood):**
  - Score threat agent capabilities (Skill, Reward, Resources, Size, Detection)
  - Calculate Threat Factor = Avg(scores)
  - Map to occurrence frequency
  - **OWASP Matrix:** Threat Factor × Occurrence → Likelihood (1-4 scale)

- **Evaluate Impact:**
  - Auto-determine CIA flags from threat verb
  - Max CIA value from business asset = Risk Impact

- **Model Attack Paths:**
  - Sequence vulnerabilities (e.g., "Weak Auth → SQL Injection")
  - Aggregate vulnerability scores
  
- **Calculate Inherent Risk:**
  - Inherent Score = Likelihood × Impact
  
- **Define Mitigations:**
  - Document controls to reduce risk
  - Estimate benefit (%) and cost
  - Track decision (Accepted/Done/Proposed)

- **Calculate Residual Risk:**
  - Residual = Inherent - (Mitigations Benefits)
  - Assign management decision (Accept/Mitigate/Transfer/Avoid)

**7. Generate Reports** (reports)
- Visualize risk distribution
- Export to HTML/PDF for stakeholders

---

## 11. AI INTEGRATION (Google Gemini)

### Architecture
- **Provider:** Google Generative AI (Gemini)
- **Configuration:**
  - API Key: Environment variable `ISRA_AI_API_KEY`
  - Model: `gemini-3.1-flash-lite` (configurable)
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/`

### Features

**1. Threat Suggestion**
- **Input:** Business asset (name, type, description) + Supporting asset (name, type)
- **Output:** 3 realistic threat scenarios
  - Threat Agent
  - Threat Verb
  - Motivation
  - Rationale
- **Use Case:** Accelerate threat modeling for inexperienced assessors

**2. Vulnerability Suggestion**
- **Input:** Supporting asset details
- **Output:** Relevant vulnerabilities
  - Vulnerability Name
  - Family (OWASP, CWE, etc.)
  - Description
  - Estimated CVE Score
- **Use Case:** Bootstrap vulnerability inventory

### Integration Points
- **Frontend Signal:** `AiStatusService.aiState` - Real-time status
- **Backend Check:** `AiConnectivityChecker` - Periodic health polling
- **Status Endpoint:** `GET /api/ai/status?refresh=true`

### Graceful Degradation
- If API key not set: Status = "not-configured"
- If endpoint unreachable: Status = "offline"
- If online: Status = "available"
- Frontend disables AI suggestion buttons when offline

---

## 12. EXISTING TESTS

### Backend Tests
**Location:** `backend/src/test/java/com/thalesgroup/isra/service/ai/`

**File:** `RiskAiAssistServiceTest.java`
- **Test Count:** 3 tests
- **Scope:** AI Service integration
- **Methods Tested:**
  - Configuration validation
  - Connectivity checks
  - Threat/vulnerability suggestion logic

**Framework:** JUnit 5 with Spring Boot Test fixtures

### Angular Tests
**Location:** `frontend/src/app/**/*.spec.ts`

**Examples:**
- `ai-status.service.spec.ts` - AI status polling
- `app.component.spec.ts` - Routing & main shell

**Framework:** Jasmine + Karma

**Current Status:** Minimal coverage; mostly placeholder specs

### Notes
- **No integration tests** for full workflow (project → risk calculation → report)
- **No end-to-end tests** for Electron app
- **No database migration tests**
- **Opportunity:** Add tests for risk calculation math, API contracts, UI interactions

---

## 13. TECHNOLOGY STACK SUMMARY

### Backend
| Layer | Technology | Version |
|---|---|---|
| Framework | Spring Boot | 3.3.0 |
| Language | Java | 17 |
| Database | H2 (Embedded) | Latest |
| ORM | Hibernate (JPA) | Bundled in Spring |
| Build | Maven | 3.x |
| HTTP Client | RestTemplate | Bundled |
| Serialization | Jackson | Bundled |
| Crypto | Spring Security | Bundled |
| Code Gen | Lombok | Bundled |

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | Angular | 18 |
| Language | TypeScript | 5.5 |
| State | Signals | Native |
| Forms | Reactive Forms | 18 |
| UI Library | Material | 18 |
| HTTP | HttpClient | 18 |
| Styling | SCSS | Latest |
| Build Tool | Angular CLI | 18 |

### Desktop
| Layer | Technology | Version |
|---|---|---|
| Runtime | Electron | 31.7.7 |
| Backend Runtime | Java 17 (Temurin) | 17 |
| Package Tool | electron-builder | 24.13.3 |

### AI
| Component | Technology |
|---|---|
| Provider | Google Generative AI |
| Model | Gemini 3.1 Flash Lite |
| Request/Response | JSON with schema validation |

---

## 14. PROJECT PURPOSE & BUSINESS DOMAIN

### What Problem Does It Solve?

**ISO 27005 Compliance & Risk Management Automation**

Organizations need to systematically identify, assess, and manage IT security risks. Traditionally this requires:
- Manual threat modeling workshops
- Spreadsheet-based risk tracking
- Fragmented documentation
- Inconsistent scoring methodologies
- Labor-intensive report generation

**ISRA solves this by:**
1. **Providing structured workflow** - Step-by-step wizard ensures nothing is missed
2. **Automating calculations** - ISO 27005 + OWASP threat factor matrices
3. **AI-powered suggestions** - Gemini API jump-starts threat/vulnerability identification
4. **Centralized data model** - All risks, assets, vulnerabilities in one place
5. **Audit trail** - Track assessment iterations over time
6. **Export capabilities** - Generate compliance reports for stakeholders

### Target Users
- **Security Risk Assessors** - Conduct assessments
- **IT Directors** - Review and approve risk decisions
- **Compliance Officers** - Report on residual risks
- **Enterprise Architects** - Use for system design reviews

### Business Value
- **Efficiency:** AI suggestions cut threat modeling time in half
- **Consistency:** Enforced methodology across teams
- **Compliance:** Evidence of ISO 27005-aligned process
- **Governance:** Audit trail for regulatory proof
- **Scalability:** Web + desktop deliver anywhere

---

## 15. DEPLOYMENT & CONFIGURATION

### Development Environment

**Backend (Spring Boot)**
```bash
cd backend
mvn clean package
java -Dserver.port=8080 -jar target/security-risk-assessment-tool.jar
```

**Frontend (Angular)**
```bash
cd frontend
npm install
ng serve --port 4200
```

**Electron (Desktop)**
```bash
cd electron
npm install
npm run dev  # Launches both ng serve + electron
```

### Production Deployment

**Electron Distributiion:**
```bash
cd frontend && npm run build:electron  # Build optimized Angular bundle
cd electron && npm run dist:win        # Create Windows .exe installer
```

**Standalone Backend:**
```bash
java -Dserver.port=8080 \
     -Dapp.data.dir=/opt/isra/data \
     -jar security-risk-assessment-tool.jar
```

### Environment Variables
```env
# AI Integration
ISRA_AI_API_KEY=sk-...              # Google Gemini API key

# Server Configuration
server.port=8080                    # (Can be overridden by Electron)
app.data.dir=./data                 # (Can be overridden by Electron)

# CORS (allow Angular dev servers)
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:4201
```

### Database
- **Type:** H2 (embedded)
- **Location:** `${app.data.dir}/securityrisk.h2.db`
- **Auto-upgrade:** Hibernateddl-auto=update
- **Max connections:** Single-user by default (File mode)

---

## 16. KEY ARCHITECTURAL DECISIONS

### 1. Decoupled Layered Architecture
- **Frontend:** Stateless Angular SPA
- **Backend:** Stateless REST API
- **Desktop:** Electron as thin wrapper
- **Benefit:** Easy testing, scalability, cross-platform support

### 2. H2 Database + File-Based Storage
- **Decision:** Eliminate DevOps complexity for Electron distribution
- **Trade-off:** No multi-user concurrent access; suitable for single-assessor-per-project model
- **Future:** Could upgrade to PostgreSQL for enterprise deployments

### 3. Signals for Frontend State (No NgRx)
- **Decision:** Angular 18 Signals replace RxJS Subject/BehaviorSubject pattern
- **Benefit:** Simpler code, better performance, lower learning curve
- **Trade-off:** No time-travel debugging (like Redux DevTools)

### 4. X-Username Header for Auth (No JWT)
- **Decision:** Simplified auth for Electron app
- **Trade-off:** Less secure for untrusted networks (mitigated by desktop-only usage)
- **Future:** Migrate to JWT + OAuth2 for web deployment

### 5. Google Gemini for AI
- **Decision:** Third-party API vs. self-hosted model
- **Benefit:** Low infrastructure cost, latest model improvements, easy to switch
- **Trade-off:** API calls + latency; no on-premise option

### 6. Lombok for Entity Boilerplate
- **Decision:** Use code generation for getters/setters/builders
- **Trade-off:** Requires annotation processor; less IDE-transparent for some IDEs

---

## 17. KNOWN LIMITATIONS & FUTURE IMPROVEMENTS

### Current Limitations
1. **Single-User by Design:** H2 file DB = no concurrent multi-user access
2. **Minimal Test Coverage:** No automated integration tests for risk workflow
3. **Basic Auth:** No role-based access control (RBAC)
4. **Limited Export:** HTML/PDF only (no XML for system interchange)
5. **AI Offline:** If Gemini API unavailable, UI disables suggestions but assessment still works
6. **No Template Library:** Each project starts from scratch (no risk templates)
7. **No Integration with External Tools:** No JIRA/Azure Boards sync

### Recommended Improvements (Priority Order)
1. **[HIGH] Add PostgreSQL support** for multi-user enterprise deployments
2. **[HIGH] Implement RBAC** (Assessor, Reviewer, Admin roles)
3. **[MEDIUM] Add end-to-end tests** for critical workflows
4. **[MEDIUM] Implement OAuth2/Azure AD** for corporate authentication
5. **[MEDIUM] Add assessment templates** (e.g., "Payment System", "Healthcare App")
6. **[LOW] Implement audit logging** of all risk modifications
7. **[LOW] Add risk heatmap** export (PNG/SVG visualization)
8. **[LOW] Support multiple languages** (i18n)

---

## 18. CODEBASE STATISTICS

### Lines of Code (Approximate)
- **Backend Java:** ~3,000-4,000 LOC (Controllers, Services, Models)
- **Frontend TypeScript:** ~5,000-6,000 LOC (Components, Services)
- **Electron:** ~1,500 LOC (main.js, build scripts)
- **Database Schema:** ~300 LOC (SQL migrations)
- **Total:** ~10,000-11,000 LOC

### Dependency Summary
- **Spring Boot:** 15+ starter libraries
- **Angular:** ~20 npm packages (core, material, forms, etc.)
- **Electron:** electron, electron-builder, electron-log
- **Build Tools:** Maven, Angular CLI, webpack (via Angular)

---

## 19. COMPLIANCE & STANDARDS

### ISO 27005 Risk Management
- **Scope Definition:** Via IsraProjectContext
- **Asset Identification:** BusinessAsset + SupportingAsset
- **Risk Analysis:** Likelihood (OWASP matrix) × Impact (CIA) = Inherent Risk
- **Risk Evaluation:** Compare residual risk to appetite
- **Risk Treatment:** Mitigations (Accept/Mitigate/Transfer/Avoid)
- **Monitoring:** Tracking iterations over time

### OWASP Top 10
- Threat verb mapping to common attack vectors (e.g., "steal" = injection, logic flaws)
- Likelihood matrix in RiskCalculationService mirrors OWASP risk rating methodology

### NIST Cybersecurity Framework
- **Identify:** Project context, asset identification
- **Protect:** Mitigation strategies
- **Detect:** Threat modeling
- **Respond:** Risk management decisions
- **Recover:** Not explicitly addressed (future enhancement)

---

## 20. SUMMARY TABLE

| Aspect | Details |
|--------|---------|
| **Project Name** | ISRA 2.0 (Integrated Security Risk Assessment) |
| **Purpose** | ISO 27005 security risk assessment & management |
| **Target Users** | Security assessors, IT directors, compliance officers |
| **Architecture** | Decoupled layered (Frontend + Backend + Desktop) |
| **Tech Stack** | Angular 18 + Spring Boot 3.3 + Electron 31 + H2 DB |
| **Data Model** | 11 JPA entities (Project, Asset, Risk, Vulnerability, etc.) |
| **Key Features** | Risk calculation, AI suggestions, threat modeling, reports |
| **AI Integration** | Google Gemini (threat/vulnerability suggestions) |
| **Database** | H2 embedded (file-based, single-user) |
| **Authentication** | Simple (X-Username header + localStorage) |
| **Test Coverage** | ~3 backend unit tests, placeholder frontend specs |
| **Deployment** | Electron installer (.exe/.dmg/.appimage) or standalone REST API |
| **Status** | Production-ready for desktop; enterprise enhancements pending |

---

## CONCLUSION

ISRA is a **well-architected, feature-complete security risk assessment platform** that successfully combines:
- ✅ Structured ISO 27005 workflow automation
- ✅ Powerful risk scoring calculations (Likelihood × Impact)
- ✅ AI-powered threat/vulnerability suggestions
- ✅ Cross-platform desktop delivery (Electron)
- ✅ Modern Angular 18 frontend with Signals
- ✅ Scalable Spring Boot REST backend
- ✅ Simplified H2 embedded database

**Key Strengths:**
1. Enforces consistent risk methodology across teams
2. Reduces assessment time through AI automation
3. Provides audit trail via iteration tracking
4. Easy to deploy as standalone desktop app
5. Clean separation of concerns (frontend/backend/desktop)

**Areas for Enhancement:**
1. Multi-user support (migrate to PostgreSQL)
2. RBAC and OAuth2 integration
3. Comprehensive test suite (integration + E2E)
4. Template library for common assessment patterns
5. Advanced reporting (heatmaps, trend analysis)

**Overall Assessment:** Code quality is good, architecture is sound, and the project successfully leverages modern frameworks and AI to solve a real business problem (security risk management).

