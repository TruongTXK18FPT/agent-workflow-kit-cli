---
name: ai-debug
description: Systematically diagnoses and resolves Python AI, memory, and hardware errors
---

Follow this workflow to debug, reproduce, and resolve errors in the Python AI project.

Inputs:
- errorMessage: Stack trace, error logs, or problem description
- componentName: Name of the suspected class, package, or API endpoint

Steps:
1. **Analyze Stack Traces & Exceptions:**
   - Locate the exact exception class (e.g. `RuntimeError: CUDA out of memory`, `cv2.error`, `ValidationError` in Pydantic).
   - Find the exact file and line number where the failure occurs.

2. **Diagnose Common AI & Hardware Failures:**
   - **CUDA OOM**: Check if batch size is too large or if gradients are accumulating (verify if `with torch.no_grad():` is used for inference). Clear cache with `torch.cuda.empty_cache()`.
   - **OpenCV/Serial blockages**: Check if cameras or ports were left open. Verify resources are closed in a `finally` block or using a context manager.
   - **Prompt Drift / LLM mismatch**: Validate if the arguments sent to the LLM client match the expected Pydantic schema.

3. **Write a Reproducing Test:**
   - Before writing the fix, add a minimal unit test under `tests/` that passes the failing input parameters and triggers the exact error.
   - Run the test and confirm it fails.

4. **Apply the Fix & Verify:**
   - Fix the bug in the code.
   - Run the reproducing test and confirm it passes.
   - Run linter and tests:
     - `{{runCommand}} ruff check .`
     - `{{runCommand}} -m pytest`
