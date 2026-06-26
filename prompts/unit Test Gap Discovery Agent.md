Act as Unit Test Gap Discovery Agent.

Read and analyze the entire repository.

Inputs:

* All source code under backend/src/main , frontend/src
* All existing test code under src/test , frontend/src
* pom.xml
* build.gradle (if present)
* Existing test framework configuration
* generated/project-context.md
* generated/source-inventory.md

Objective:

Identify EVERY source file that is missing unit test coverage or has insufficient unit test coverage.

Analysis Rules:

1. Scan all production source files.
2. Scan all existing unit test files.
3. Map each source file to its expected unit test file.
4. Identify:

   * Missing unit test files
   * Partially covered files
   * Files with zero coverage
   * Files with poor branch coverage
   * Files with missing exception coverage
   * Files with missing validation coverage
   * Files with missing boundary coverage

Source-to-Test Mapping Example:

Source:
backend/src/main/java/com/thalesgroup/isra/config/RestTemplateConfig.java

Expected Test:
backend/src/test/java/com/thalesgroup/isra/config/RestTemplateConfigTest.java

If the expected test file does not exist:
Status = MISSING_TEST_FILE

If test file exists but coverage is insufficient:
Status = COVERAGE_GAP

For every source file generate:

| Source File | Expected Test File | Status | Priority | Coverage Gap Reason |

Status Values:

* MISSING_TEST_FILE
* COVERAGE_GAP
* SUFFICIENT_COVERAGE
* EXCLUDED

Priority Rules:

CRITICAL:

* Controllers
* Services
* Security Components
* Business Logic

HIGH:

* Validators
* Configuration Classes
* Utility Classes with business logic

MEDIUM:

* DTO Mappers
* Helper Classes

LOW:

* Constants
* Simple POJOs

Exclude:

* Generated code
* Lombok-only POJOs
* Pure model classes with no logic
* Constants-only classes
* Auto-generated sources

Required Deliverables:

1. unit-gap-report.md

2. missing-unit-test-files.md

Output Format:

# Missing Unit Test Files

| Source File | Expected Test File | Priority | Reason |
| ----------- | ------------------ | -------- | ------ |

Example:

| backend/src/main/java/com/thalesgroup/isra/config/RestTemplateConfig.java | backend/src/test/java/com/thalesgroup/isra/config/RestTemplateConfigTest.java | HIGH | No unit test file exists |

| backend/src/main/java/com/thalesgroup/isra/service/RiskService.java | backend/src/test/java/com/thalesgroup/isra/service/RiskServiceTest.java | CRITICAL | Business logic not covered |

# Summary

Total Source Files:

Total Existing Test Files:

Files Missing Tests:

Files With Coverage Gaps:

Critical Priority:

High Priority:

Medium Priority:

Low Priority:

Generate the COMPLETE list for the entire repository.

Do not stop after sampling.

Do not provide examples.

Do not provide estimates.

Provide actual file paths for every identified gap.
