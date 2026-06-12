# Python AI & LLM Style Rules

## 1. GPU & Memory Management
- Allocate device dynamically (never hardcode `"cuda"` or `"cpu"`):
  `device = torch.device("cuda" if torch.cuda.is_available() else "cpu")`
- Wrap evaluation/inference in `with torch.no_grad():` to save VRAM.
- Clear cache in long loops/batch runs: `torch.cuda.empty_cache()`.

## 2. Reproducibility
- Set seeds globally at startup:
  ```python
  def set_seed(seed=42):
      random.seed(seed)
      np.random.seed(seed)
      torch.manual_seed(seed)
      if torch.cuda.is_available():
          torch.cuda.manual_seed_all(seed)
  ```

## 3. Data Leakage
- Fit encoders/scalers/tokenizers ONLY on the training split (never val/test).
- Assert data shapes/bounds before starting training loops.

## 4. LLM & Prompts
- Decouple prompts: Store prompts in separate files (JSON, YAML, .txt) instead of hardcoding strings in Python files.
- Validate inputs using Pydantic before calling LLM APIs.

## 5. Metrics Logging
- Log metrics via standard python `logging` or tools (MLflow, W&B, TensorBoard). Avoid `print` statements.

