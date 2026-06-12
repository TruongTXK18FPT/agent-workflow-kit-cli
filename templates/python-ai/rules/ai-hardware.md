# Python Hardware-Integrated & Edge AI Rules

Rules for writing Python AI applications that interface with cameras, sensors, edge hardware, and computer vision libraries (OpenCV, MediaPipe, serial ports).

## 1. Thread-safe Video & Sensor Capture
- **Async Frame Capture**: Never process camera frames or sensor inputs directly on the main execution/UI thread (causes lag and dropouts). Process input capturing on a dedicated daemon thread and pass frames to the main thread using thread-safe queues:
  ```python
  import threading
  from queue import Queue

  class FrameReader:
      def __init__(self, source=0):
          self.cap = cv2.VideoCapture(source)
          self.queue = Queue(maxsize=10)
          self.stopped = False

      def start(self):
          t = threading.Thread(target=self.update, args=())
          t.daemon = True
          t.start()
          return self

      def update(self):
          while not self.stopped:
              ret, frame = self.cap.read()
              if not ret: break
              if not self.queue.full():
                  self.queue.put(frame)
  ```

## 2. Strict Resource Management & Cleanups
- **Resource Releasing**: Always release camera captures, serial communication ports, and windows in `finally` blocks or context managers:
  ```python
  try:
      # frame loops...
  finally:
      cap.release()
      cv2.destroyAllWindows()
  ```

## 3. Memory & Frame Buffers
- **No Frame Accumulation**: Never append raw video frames directly to list containers without limits. If frame history is required, use a circular buffer with a strict size constraint:
  - `from collections import deque`
  - `frame_buffer = deque(maxlen=30)  # maximum 30 frames`

## 4. Edge Optimization & Quantization
- **NumPy Vectorization**: Avoid nested Python loops over individual pixels (extremely slow). Always use vectorized NumPy operations:
  - *Incorrect*: Loop over x, y coordinates to threshold an image.
  - *Correct*: `binary_image = (gray_image > threshold).astype(np.uint8) * 255`
- **Model Quantization**: For deployment on low-resource edge hardware (e.g. Raspberry Pi, CPUs), quantize model weights to FP16 or INT8 (using ONNX Runtime or TFLite) to increase inference throughput and reduce memory foot-print.
