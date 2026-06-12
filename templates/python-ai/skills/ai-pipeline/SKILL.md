---
name: ai-pipeline
description: Generates or extends a Python data preprocessing or ingestion pipeline
---

Follow this workflow to create a new dataset pipeline, loader, or feature cleaning routine.

Inputs:
- pipelineName: Name of the data pipeline component (e.g., `face_alignment`)
- inputSource: Description of raw input (e.g., `camera_frames`, `text_corpus`)

Steps:
1. Inspect neighboring codebase files to understand local directory layouts and input/output schema conventions.
2. Define input preprocessing utilities:
   - Handle invalid/null inputs, empty values, or dimension mismatches.
   - Vectorize array transformations using NumPy (avoid pixel-by-pixel loops).
3. Create the data ingestion/loader class:
   - Implement batch loading or caching to prevent memory blockages.
   - For file-based operations, verify try-except-finally release locks.
4. Add verification and test scripts:
   - Write a unit test asserting shape transformations, boundary inputs, and types.
   - Validate execution speed on standard sample frames or test inputs.
5. Run code formatting:
   - Run linter/formatter check: e.g. `ruff check .` or `black --check .`
