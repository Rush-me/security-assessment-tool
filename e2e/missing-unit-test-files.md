# Missing Unit Test Files

| Source File | Expected Test File | Priority | Reason |
| ----------- | ------------------ | -------- | ------ |
| backend/src/main/java/com/thalesgroup/isra/config/CorsConfig.java | backend/src/test/java/com/thalesgroup/isra/config/CorsConfigTest.java | HIGH | System configuration class |
| backend/src/main/java/com/thalesgroup/isra/config/RestTemplateConfig.java | backend/src/test/java/com/thalesgroup/isra/config/RestTemplateConfigTest.java | HIGH | System configuration class |
| backend/src/main/java/com/thalesgroup/isra/controller/AiController.java | backend/src/test/java/com/thalesgroup/isra/controller/AiControllerTest.java | CRITICAL | REST API endpoint controller with routing and request validation |
| backend/src/main/java/com/thalesgroup/isra/controller/AuthController.java | backend/src/test/java/com/thalesgroup/isra/controller/AuthControllerTest.java | CRITICAL | REST API endpoint controller with routing and request validation |
| backend/src/main/java/com/thalesgroup/isra/controller/BusinessAssetController.java | backend/src/test/java/com/thalesgroup/isra/controller/BusinessAssetControllerTest.java | CRITICAL | REST API endpoint controller with routing and request validation |
| backend/src/main/java/com/thalesgroup/isra/controller/IsraProjectController.java | backend/src/test/java/com/thalesgroup/isra/controller/IsraProjectControllerTest.java | CRITICAL | REST API endpoint controller with routing and request validation |
| backend/src/main/java/com/thalesgroup/isra/controller/RiskController.java | backend/src/test/java/com/thalesgroup/isra/controller/RiskControllerTest.java | CRITICAL | REST API endpoint controller with routing and request validation |
| backend/src/main/java/com/thalesgroup/isra/controller/SupportingAssetController.java | backend/src/test/java/com/thalesgroup/isra/controller/SupportingAssetControllerTest.java | CRITICAL | REST API endpoint controller with routing and request validation |
| backend/src/main/java/com/thalesgroup/isra/controller/VulnerabilityController.java | backend/src/test/java/com/thalesgroup/isra/controller/VulnerabilityControllerTest.java | CRITICAL | REST API endpoint controller with routing and request validation |
| backend/src/main/java/com/thalesgroup/isra/exception/AiExceptionHandler.java | backend/src/test/java/com/thalesgroup/isra/exception/AiExceptionHandlerTest.java | MEDIUM | Global exception handler routing |
| backend/src/main/java/com/thalesgroup/isra/IsraBackendApplication.java | backend/src/test/java/com/thalesgroup/isra/IsraBackendApplicationTest.java | LOW | Spring Boot Application entry point with launcher code |
| backend/src/main/java/com/thalesgroup/isra/model/IsraProject.java | backend/src/test/java/com/thalesgroup/isra/model/IsraProjectTest.java | LOW | Simple POJO with basic JPA lifecycle hooks |
| backend/src/main/java/com/thalesgroup/isra/repository/BusinessAssetRepository.java | backend/src/test/java/com/thalesgroup/isra/repository/BusinessAssetRepositoryTest.java | MEDIUM | JPA Data Repository interface |
| backend/src/main/java/com/thalesgroup/isra/repository/IsraProjectRepository.java | backend/src/test/java/com/thalesgroup/isra/repository/IsraProjectRepositoryTest.java | MEDIUM | JPA Data Repository interface |
| backend/src/main/java/com/thalesgroup/isra/repository/RiskRepository.java | backend/src/test/java/com/thalesgroup/isra/repository/RiskRepositoryTest.java | MEDIUM | JPA Data Repository interface |
| backend/src/main/java/com/thalesgroup/isra/repository/SupportingAssetRepository.java | backend/src/test/java/com/thalesgroup/isra/repository/SupportingAssetRepositoryTest.java | MEDIUM | JPA Data Repository interface |
| backend/src/main/java/com/thalesgroup/isra/repository/UserRepository.java | backend/src/test/java/com/thalesgroup/isra/repository/UserRepositoryTest.java | MEDIUM | JPA Data Repository interface |
| backend/src/main/java/com/thalesgroup/isra/repository/VulnerabilityRepository.java | backend/src/test/java/com/thalesgroup/isra/repository/VulnerabilityRepositoryTest.java | MEDIUM | JPA Data Repository interface |
| backend/src/main/java/com/thalesgroup/isra/service/ai/AiConnectivityChecker.java | backend/src/test/java/com/thalesgroup/isra/service/ai/AiConnectivityCheckerTest.java | CRITICAL | Business logic service layer |
| backend/src/main/java/com/thalesgroup/isra/service/ai/GeminiAiProvider.java | backend/src/test/java/com/thalesgroup/isra/service/ai/GeminiAiProviderTest.java | CRITICAL | Business logic service layer |
| backend/src/main/java/com/thalesgroup/isra/service/ai/RiskAiAssistService.java | backend/src/test/java/com/thalesgroup/isra/service/ai/RiskAiAssistServiceTest.java | CRITICAL | Only online checks covered (~40%). Missing asset suggestions and error scenarios. |
| backend/src/main/java/com/thalesgroup/isra/service/FileStorageService.java | backend/src/test/java/com/thalesgroup/isra/service/FileStorageServiceTest.java | CRITICAL | Business logic service layer |
| backend/src/main/java/com/thalesgroup/isra/service/RiskCalculationService.java | backend/src/test/java/com/thalesgroup/isra/service/RiskCalculationServiceTest.java | CRITICAL | Business logic service layer |
| electron/main.js | electron/main.spec.js | CRITICAL | Electron main process orchestrating app lifecycle, child process spawning, and IPC |
| electron/preload.js | electron/preload.spec.js | MEDIUM | Context bridge preload script |
| electron/scripts/build.js | electron/scripts/build.spec.js | HIGH | Automated build and JRE downloader utility scripts |
| electron/scripts/download-jre.js | electron/scripts/download-jre.spec.js | HIGH | Automated build and JRE downloader utility scripts |
| frontend/src/app/app.component.ts | frontend/src/app/app.component.spec.ts | LOW | Shell exists but route transitions and shell layout are not verified. |
| frontend/src/app/app.config.ts | frontend/src/app/app.config.spec.ts | HIGH | Angular configuration / Routing definitions |
| frontend/src/app/app.routes.ts | frontend/src/app/app.routes.spec.ts | HIGH | Angular configuration / Routing definitions |
| frontend/src/app/core/guards/auth.guard.ts | frontend/src/app/core/guards/auth.guard.spec.ts | CRITICAL | Route guard for access control |
| frontend/src/app/core/interceptors/auth.interceptor.ts | frontend/src/app/core/interceptors/auth.interceptor.spec.ts | CRITICAL | HTTP Interceptor for credential propagation |
| frontend/src/app/core/services/ai-status.service.ts | frontend/src/app/core/services/ai-status.service.spec.ts | CRITICAL | Basic shell exists but auto-polling, network listeners, and error states are not tested. |
| frontend/src/app/core/services/asset.service.ts | frontend/src/app/core/services/asset.service.spec.ts | CRITICAL | Data management and HTTP communication service |
| frontend/src/app/core/services/auth.service.ts | frontend/src/app/core/services/auth.service.spec.ts | CRITICAL | Data management and HTTP communication service |
| frontend/src/app/core/services/config.service.ts | frontend/src/app/core/services/config.service.spec.ts | CRITICAL | Data management and HTTP communication service |
| frontend/src/app/core/services/project.service.ts | frontend/src/app/core/services/project.service.spec.ts | CRITICAL | Data management and HTTP communication service |
| frontend/src/app/core/services/risk-ai.service.ts | frontend/src/app/core/services/risk-ai.service.spec.ts | CRITICAL | Data management and HTTP communication service |
| frontend/src/app/core/services/risk.service.ts | frontend/src/app/core/services/risk.service.spec.ts | CRITICAL | Data management and HTTP communication service |
| frontend/src/app/core/services/vulnerability.service.ts | frontend/src/app/core/services/vulnerability.service.spec.ts | CRITICAL | Data management and HTTP communication service |
| frontend/src/app/core/services/wizard-validation.service.ts | frontend/src/app/core/services/wizard-validation.service.spec.ts | CRITICAL | Data management and HTTP communication service |
| frontend/src/app/features/auth/login/login.component.ts | frontend/src/app/features/auth/login/login.component.spec.ts | CRITICAL | Authentication component |
| frontend/src/app/features/auth/register/register.component.ts | frontend/src/app/features/auth/register/register.component.spec.ts | CRITICAL | Authentication component |
| frontend/src/app/features/basic-info/basic-info.component.ts | frontend/src/app/features/basic-info/basic-info.component.spec.ts | CRITICAL | Wizard workflow component |
| frontend/src/app/features/business-assets/business-assets.component.ts | frontend/src/app/features/business-assets/business-assets.component.spec.ts | CRITICAL | Core business logic and state orchestration component |
| frontend/src/app/features/dashboard/dashboard.component.ts | frontend/src/app/features/dashboard/dashboard.component.spec.ts | CRITICAL | Core business logic and state orchestration component |
| frontend/src/app/features/project-context/project-context.component.ts | frontend/src/app/features/project-context/project-context.component.spec.ts | CRITICAL | Wizard workflow component |
| frontend/src/app/features/project-layout/project-layout.component.ts | frontend/src/app/features/project-layout/project-layout.component.spec.ts | CRITICAL | Core business logic and state orchestration component |
| frontend/src/app/features/reports/reports.component.ts | frontend/src/app/features/reports/reports.component.spec.ts | HIGH | KPI calculations and metrics component |
| frontend/src/app/features/risks/risks.component.ts | frontend/src/app/features/risks/risks.component.spec.ts | CRITICAL | Core business logic and state orchestration component |
| frontend/src/app/features/supporting-assets/supporting-assets.component.ts | frontend/src/app/features/supporting-assets/supporting-assets.component.spec.ts | CRITICAL | Wizard workflow component |
| frontend/src/app/features/vulnerabilities/vulnerabilities.component.ts | frontend/src/app/features/vulnerabilities/vulnerabilities.component.spec.ts | CRITICAL | Core business logic and state orchestration component |
| frontend/src/main.ts | frontend/src/main.spec.ts | LOW | Bootstrap/entry script |

# Summary

Total Source Files: 72

Total Existing Test Files: 3

Files Missing Tests: 50

Files With Coverage Gaps: 3

Critical Priority: 34

High Priority: 7

Medium Priority: 8

Low Priority: 4
