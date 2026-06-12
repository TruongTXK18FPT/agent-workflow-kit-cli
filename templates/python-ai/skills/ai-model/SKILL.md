---
name: ai-model
description: Generates or extends a Python machine learning model architecture or training script
---

Follow this workflow to define a new model architecture or write a training/evaluation routine.

Inputs:
- modelName: Name of the model component (e.g., `face_encoder`)
- framework: The target framework (e.g., `pytorch`, `onnx`)

Steps:
1. Examine existing models or wrappers in the codebase to keep signatures and abstractions consistent.
2. Define the model architecture class:
   - Make device configuration dynamic (`device` GPU/CPU delegation).
   - Use correct data types (e.g. FP32 for training, FP16/INT8 for edge inference).
3. Write the training or inference execution script:
   - Set random seeds globally using standard random/numpy/torch configurations.
   - For training loops: output logging metrics (loss, evaluation score) to TensorBoard/MLflow.
   - For inference loops: wrap logic within `torch.no_grad()` contexts to save VRAM.
4. Write tests:
   - Assert input/output tensor dimensions.
   - Verify the forward pass with mock inputs (assert shape and type).
5. Run validations:
   - Run unit tests and style linter commands.
