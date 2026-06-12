# Python Hardware-Integrated & Edge AI Rules

## 1. Thread-safe Frame & Sensor Capture
- Do not process camera/sensor input on the main thread. Use a dedicated daemon thread and pass data/frames using a thread-safe Queue:
  ```python
  class FrameReader:
      def __init__(self, source=0):
          self.cap = cv2.VideoCapture(source)
          self.queue = Queue(maxsize=10)
          self.stopped = False
      def start(self):
          threading.Thread(target=self.update, daemon=True).start()
      def update(self):
          while not self.stopped:
              ret, frame = self.cap.read()
              if ret and not self.queue.full():
                  self.queue.put(frame)
  ```

## 2. Resource Management
- Always release camera captures, serial ports, and windows in a `finally` block:
  ```python
  try: ...
  finally:
      cap.release()
      cv2.destroyAllWindows()
  ```

## 3. Frame Buffers
- Use circular buffers to store frame history to avoid memory leaks:
  `frame_buffer = deque(maxlen=30)`

## 4. Edge Optimization
- Avoid pixel loops. Use vectorized NumPy operations (e.g. `binary = (gray > th).astype(np.uint8) * 255`).
- Quantize model weights to FP16 or INT8 (using ONNX Runtime / TFLite) for CPU/edge deployment.

