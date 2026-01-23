"""
Server-side motion detection for DVR channels via ffmpeg/ffprobe and OpenCV (optional).
This is a minimal placeholder that can be extended to decode frames and compute diffs.
"""

import os
from typing import Optional
try:
    import cv2  # type: ignore
except Exception:
    cv2 = None

class MotionService:
    def __init__(self):
        self.enabled = cv2 is not None

    def is_available(self) -> bool:
        return self.enabled

    def detect_motion_stub(self, sensitivity: int = 5) -> bool:
        # Placeholder: integrate frame differencing when RTSP decoding is added
        return False

motion_service = MotionService()


