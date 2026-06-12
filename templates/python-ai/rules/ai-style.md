# Python AI, LLM & Data Science Style Rules

Enforce strict coding standards, performance rules, and workflow safety for AI/ML/LLM components in this repository.

## 1. GPU & Memory Management (PyTorch / TensorFlow)
- **Device Allocation**: Do not hardcode `"cuda"` or `"cpu"`. Dynamically allocate device paths:
  - `device = torch.device("cuda" if torch.cuda.is_available() else "cpu")`
- **Inference Optimization**: Always wrap inference and evaluation routines with `with torch.no_grad():` to prevent gradients calculations and save VRAM.
- **CUDA Cache Cleanup**: Clear CUDA memory cache when batch tasks complete, especially in long loops or notebooks, to avoid CUDA Out-Of-Memory (OOM):
  - `torch.cuda.empty_cache()`

## 2. Reproducibility & Seeding
- **Deterministic Runs**: Set random seeds globally at the entrypoint of any training, evaluation, or data splits to ensure reproducible outcomes:
  ```python
  import random
  import numpy as np
  import torch

  def set_seed(seed=42):
      random.seed(seed)
      np.random.seed(seed)
      torch.manual_seed(seed)
      if torch.cuda.is_available():
          torch.cuda.manual_seed_all(seed)
  ```

## 3. Data Leakage & Pipeline Integrity
- **Train/Val/Test Splits**: Keep dataset splits completely isolated. Never normalize, fit, or train encoders (e.g. Scalers, Tokenizers) using the validation or test splits. Encoders must only fit on the training split.
- **DataLoader Assertions**: Validate dataset shapes and boundary constraints using `assert` statements before launching loops.

## 4. Prompt Engineering & LLM Integration
- **Decoupled Prompt Schemas**: Keep system prompts and templates isolated from execution logic (e.g., store prompts in dedicated configs, JSON, or template files, rather than hardcoding long strings inside python files).
- **Prompt Validation**: Always validate prompt arguments before sending them to the LLM Client using schema validators or Pydantic.

## 5. Metrics Logging
- **No Swallowed Logs**: Avoid generic `print` statements in training loops. Utilize standard python `logging` or professional metrics trackers like TensorBoard, MLflow, or Weights & Biases.
