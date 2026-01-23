"""
Camera Integration Service
Handles external camera connections, RTSP streams, recording, and HIPAA compliance
"""

import asyncio
# Optional dependencies; provide graceful degradation if missing
try:
    import cv2  # OpenCV (optional)
except Exception:
    cv2 = None
try:
    import numpy as np  # Numpy (optional)
except Exception:
    np = None
import os
import json
import logging
import hashlib
import hmac
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import aiohttp
try:
    import aiortc  # Optional
    from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
except Exception:
    aiortc = None
    RTCPeerConnection = RTCSessionDescription = VideoStreamTrack = None
try:
    from av import VideoFrame  # Optional
except Exception:
    VideoFrame = None
import threading
import queue
import time
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CameraConfig:
    """Camera configuration data"""
    id: str
    name: str
    ip_address: str
    port: int
    username: str
    password: str
    rtsp_url: str
    resolution: str
    fps: int
    recording_enabled: bool
    motion_detection_enabled: bool
    ai_analytics_enabled: bool
    privacy_zones: List[Dict]
    retention_days: int
    encryption_enabled: bool

@dataclass
class RecordingInfo:
    """Recording information"""
    id: str
    camera_id: str
    file_path: str
    start_time: datetime
    end_time: Optional[datetime]
    file_size: int
    duration: int
    motion_detected: bool
    encryption_key: Optional[str]
    retention_policy: str

class CameraConnection:
    """Manages individual camera connections"""
    
    def __init__(self, config: CameraConfig):
        self.config = config
        self.cap = None
        self.is_connected = False
        self.is_recording = False
        self.recording_thread = None
        self.motion_detector = MotionDetector()
        self.ai_analyzer = AIAnalyzer()
        self.recording_queue = queue.Queue()
        self.last_frame = None
        self.connection_retries = 0
        self.max_retries = 5
        
    async def connect(self) -> bool:
        """Establish connection to camera"""
        try:
            # Try different connection methods
            connection_methods = [
                self._connect_rtsp,
                self._connect_http,
                self._connect_onvif
            ]
            
            for method in connection_methods:
                if await method():
                    self.is_connected = True
                    self.connection_retries = 0
                    logger.info(f"Camera {self.config.name} connected successfully")
                    return True
                    
            self.connection_retries += 1
            logger.error(f"Failed to connect to camera {self.config.name}")
            return False
            
        except Exception as e:
            logger.error(f"Error connecting to camera {self.config.name}: {str(e)}")
            return False
    
    async def _connect_rtsp(self) -> bool:
        """Connect via RTSP"""
        try:
            if cv2 is None:
                logger.warning("OpenCV not installed; RTSP connection unavailable")
                return False
            rtsp_url = f"rtsp://{self.config.username}:{self.config.password}@{self.config.ip_address}:{self.config.port}/stream1"
            self.cap = cv2.VideoCapture(rtsp_url)
            
            if self.cap.isOpened():
                # Set camera properties
                self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self._get_resolution_width())
                self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self._get_resolution_height())
                self.cap.set(cv2.CAP_PROP_FPS, self.config.fps)
                return True
            return False
            
        except Exception as e:
            logger.error(f"RTSP connection failed: {str(e)}")
            return False
    
    async def _connect_http(self) -> bool:
        """Connect via HTTP/HTTPS"""
        try:
            if cv2 is None:
                logger.warning("OpenCV not installed; HTTP video connection unavailable")
                return False
            http_url = f"http://{self.config.ip_address}:{self.config.port}/video"
            self.cap = cv2.VideoCapture(http_url)
            
            if self.cap.isOpened():
                return True
            return False
            
        except Exception as e:
            logger.error(f"HTTP connection failed: {str(e)}")
            return False
    
    async def _connect_onvif(self) -> bool:
        """Connect via ONVIF protocol"""
        try:
            # ONVIF connection implementation
            # This would require ONVIF library
            logger.info("ONVIF connection not implemented yet")
            return False
            
        except Exception as e:
            logger.error(f"ONVIF connection failed: {str(e)}")
            return False
    
    def _get_resolution_width(self) -> int:
        """Get resolution width from string"""
        resolution_map = {
            "4K": 3840,
            "1080p": 1920,
            "720p": 1280,
            "480p": 854
        }
        return resolution_map.get(self.config.resolution, 1920)
    
    def _get_resolution_height(self) -> int:
        """Get resolution height from string"""
        resolution_map = {
            "4K": 2160,
            "1080p": 1080,
            "720p": 720,
            "480p": 480
        }
        return resolution_map.get(self.config.resolution, 1080)
    
    async def get_frame(self) -> Optional[Any]:
        """Get current frame from camera"""
        if np is None or not self.is_connected or self.cap is None:
            return None
            
        try:
            ret, frame = self.cap.read()
            if ret:
                self.last_frame = frame
                return frame
            return None
            
        except Exception as e:
            logger.error(f"Error getting frame from camera {self.config.name}: {str(e)}")
            return None
    
    async def start_recording(self, output_path: str) -> bool:
        """Start recording from camera"""
        if cv2 is None:
            logger.warning("OpenCV not installed; cannot start recording")
            return False
        if not self.is_connected:
            return False
            
        try:
            # Create output directory
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Initialize video writer
            fourcc = cv2.VideoWriter_fourcc(*'H264')
            fps = self.config.fps
            frame_size = (self._get_resolution_width(), self._get_resolution_height())
            
            self.video_writer = cv2.VideoWriter(output_path, fourcc, fps, frame_size)
            
            if not self.video_writer.isOpened():
                logger.error(f"Failed to initialize video writer for camera {self.config.name}")
                return False
            
            self.is_recording = True
            self.recording_thread = threading.Thread(target=self._recording_loop, args=(output_path,))
            self.recording_thread.start()
            
            logger.info(f"Started recording for camera {self.config.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error starting recording for camera {self.config.name}: {str(e)}")
            return False
    
    def _recording_loop(self, output_path: str):
        """Recording loop in separate thread"""
        try:
            while self.is_recording:
                if self.last_frame is not None:
                    # Apply privacy zones
                    frame = self._apply_privacy_zones(self.last_frame)
                    
                    # Write frame
                    self.video_writer.write(frame)
                    
                    # Check for motion
                    if self.config.motion_detection_enabled:
                        motion_detected = self.motion_detector.detect_motion(frame)
                        if motion_detected:
                            self._handle_motion_detected()
                    
                    # AI analytics
                    if self.config.ai_analytics_enabled:
                        ai_events = self.ai_analyzer.analyze_frame(frame)
                        if ai_events:
                            self._handle_ai_events(ai_events)
                
                time.sleep(1.0 / self.config.fps)
                
        except Exception as e:
            logger.error(f"Error in recording loop for camera {self.config.name}: {str(e)}")
        finally:
            if hasattr(self, 'video_writer'):
                self.video_writer.release()
    
    def _apply_privacy_zones(self, frame: Any) -> Any:
        """Apply privacy zones to frame"""
        if cv2 is None or np is None or not self.config.privacy_zones:
            return frame
            
        for zone in self.config.privacy_zones:
            if zone.get('enabled', True):
                x1, y1, x2, y2 = zone['coordinates']
                # Blur the privacy zone
                roi = frame[int(y1):int(y2), int(x1):int(x2)]
                blurred_roi = cv2.GaussianBlur(roi, (99, 99), 30)
                frame[int(y1):int(y2), int(x1):int(x2)] = blurred_roi
                
        return frame
    
    def _handle_motion_detected(self):
        """Handle motion detection event"""
        event_data = {
            'camera_id': self.config.id,
            'event_type': 'motion',
            'timestamp': datetime.utcnow().isoformat(),
            'severity': 'medium'
        }
        self.recording_queue.put(event_data)
    
    def _handle_ai_events(self, events: List[Dict]):
        """Handle AI analytics events"""
        for event in events:
            event_data = {
                'camera_id': self.config.id,
                'event_type': 'ai_analytics',
                'timestamp': datetime.utcnow().isoformat(),
                'ai_event': event
            }
            self.recording_queue.put(event_data)
    
    async def stop_recording(self) -> bool:
        """Stop recording"""
        self.is_recording = False
        if self.recording_thread:
            self.recording_thread.join()
        
        logger.info(f"Stopped recording for camera {self.config.name}")
        return True
    
    async def disconnect(self):
        """Disconnect from camera"""
        if self.cap:
            self.cap.release()
        self.is_connected = False
        logger.info(f"Disconnected from camera {self.config.name}")

class MotionDetector:
    """Motion detection using OpenCV"""
    
    def __init__(self):
        if cv2 is not None:
            self.background_subtractor = cv2.createBackgroundSubtractorMOG2(
                history=500, varThreshold=50, detectShadows=True
            )
        else:
            self.background_subtractor = None
        self.motion_threshold = 0.1
        
    def detect_motion(self, frame: Any) -> bool:
        """Detect motion in frame"""
        try:
            if self.background_subtractor is None or np is None:
                return False
            # Apply background subtraction
            fg_mask = self.background_subtractor.apply(frame)
            
            # Calculate motion percentage
            motion_pixels = np.count_nonzero(fg_mask)
            total_pixels = frame.shape[0] * frame.shape[1]
            motion_percentage = motion_pixels / total_pixels
            
            return motion_percentage > self.motion_threshold
            
        except Exception as e:
            logger.error(f"Error in motion detection: {str(e)}")
            return False

class AIAnalyzer:
    """AI analytics for video frames"""
    
    def __init__(self):
        # Load pre-trained models when OpenCV is present
        if cv2 is not None:
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            self.body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')
        else:
            self.face_cascade = None
            self.body_cascade = None
        
    def analyze_frame(self, frame: Any) -> List[Dict]:
        """Analyze frame for AI events"""
        events = []
        
        try:
            # Face detection
            faces = self._detect_faces(frame)
            if faces:
                events.append({
                    'type': 'face_detection',
                    'count': len(faces),
                    'confidence': 0.85
                })
            
            # Body detection
            bodies = self._detect_bodies(frame)
            if bodies:
                events.append({
                    'type': 'body_detection',
                    'count': len(bodies),
                    'confidence': 0.75
                })
            
            # Fall detection (simplified)
            fall_detected = self._detect_fall(frame)
            if fall_detected:
                events.append({
                    'type': 'fall_detection',
                    'confidence': 0.90,
                    'severity': 'high'
                })
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
        
        return events
    
    def _detect_faces(self, frame: Any) -> List:
        """Detect faces in frame"""
        if cv2 is None or self.face_cascade is None:
            return []
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        try:
            return faces.tolist()
        except Exception:
            return []
    
    def _detect_bodies(self, frame: Any) -> List:
        """Detect bodies in frame"""
        if cv2 is None or self.body_cascade is None:
            return []
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        bodies = self.body_cascade.detectMultiScale(gray, 1.1, 4)
        try:
            return bodies.tolist()
        except Exception:
            return []
    
    def _detect_fall(self, frame: Any) -> bool:
        """Detect falls in frame (simplified implementation)"""
        # This would typically use a more sophisticated ML model
        # For now, return False as placeholder
        return False

class HIPAACompliance:
    """HIPAA compliance utilities"""
    
    def __init__(self, encryption_key: str):
        self.encryption_key = encryption_key.encode('utf-8')
        
    def encrypt_video(self, video_data: bytes) -> bytes:
        """Encrypt video data for HIPAA compliance"""
        try:
            # Use AES encryption
            from cryptography.fernet import Fernet
            from cryptography.hazmat.primitives import hashes
            from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
            
            # Generate key from password
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b'surveillance_salt',
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(self.encryption_key))
            
            # Encrypt data
            f = Fernet(key)
            encrypted_data = f.encrypt(video_data)
            return encrypted_data
            
        except Exception as e:
            logger.error(f"Error encrypting video: {str(e)}")
            return video_data
    
    def decrypt_video(self, encrypted_data: bytes) -> bytes:
        """Decrypt video data"""
        try:
            from cryptography.fernet import Fernet
            from cryptography.hazmat.primitives import hashes
            from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
            
            # Generate key from password
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b'surveillance_salt',
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(self.encryption_key))
            
            # Decrypt data
            f = Fernet(key)
            decrypted_data = f.decrypt(encrypted_data)
            return decrypted_data
            
        except Exception as e:
            logger.error(f"Error decrypting video: {str(e)}")
            return encrypted_data
    
    def generate_audit_log(self, action: str, user: str, details: Dict) -> Dict:
        """Generate HIPAA audit log entry"""
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'action': action,
            'user': user,
            'details': details,
            'ip_address': '127.0.0.1',  # Would be actual IP in production
            'session_id': hashlib.md5(f"{user}{time.time()}".encode()).hexdigest()
        }

class CameraManager:
    """Manages all camera connections and operations"""
    
    def __init__(self, storage_path: str = "/var/surveillance/recordings"):
        self.cameras: Dict[str, CameraConnection] = {}
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.hipaa_compliance = HIPAACompliance("your-secret-key-here")
        self.recording_tasks = {}
        
    async def add_camera(self, config: CameraConfig) -> bool:
        """Add a new camera"""
        try:
            camera = CameraConnection(config)
            if await camera.connect():
                self.cameras[config.id] = camera
                logger.info(f"Added camera {config.name} successfully")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error adding camera {config.name}: {str(e)}")
            return False
    
    async def remove_camera(self, camera_id: str) -> bool:
        """Remove a camera"""
        try:
            if camera_id in self.cameras:
                camera = self.cameras[camera_id]
                await camera.disconnect()
                del self.cameras[camera_id]
                logger.info(f"Removed camera {camera_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error removing camera {camera_id}: {str(e)}")
            return False
    
    async def start_recording(self, camera_id: str) -> bool:
        """Start recording for a camera"""
        try:
            if camera_id not in self.cameras:
                return False
                
            camera = self.cameras[camera_id]
            
            # Generate recording file path
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{camera_id}_{timestamp}.mp4"
            file_path = self.storage_path / filename
            
            # Start recording
            success = await camera.start_recording(str(file_path))
            
            if success:
                self.recording_tasks[camera_id] = {
                    'file_path': str(file_path),
                    'start_time': datetime.utcnow(),
                    'recording_info': RecordingInfo(
                        id=f"rec_{camera_id}_{timestamp}",
                        camera_id=camera_id,
                        file_path=str(file_path),
                        start_time=datetime.utcnow(),
                        end_time=None,
                        file_size=0,
                        duration=0,
                        motion_detected=False,
                        encryption_key=None,
                        retention_policy=f"{camera.config.retention_days}_days"
                    )
                }
                
            return success
            
        except Exception as e:
            logger.error(f"Error starting recording for camera {camera_id}: {str(e)}")
            return False
    
    async def stop_recording(self, camera_id: str) -> bool:
        """Stop recording for a camera"""
        try:
            if camera_id not in self.cameras:
                return False
                
            camera = self.cameras[camera_id]
            success = await camera.stop_recording()
            
            if success and camera_id in self.recording_tasks:
                # Update recording info
                task_info = self.recording_tasks[camera_id]
                task_info['end_time'] = datetime.utcnow()
                task_info['recording_info'].end_time = task_info['end_time']
                
                # Calculate file size and duration
                file_path = Path(task_info['file_path'])
                if file_path.exists():
                    task_info['recording_info'].file_size = file_path.stat().st_size
                    duration = (task_info['end_time'] - task_info['start_time']).total_seconds()
                    task_info['recording_info'].duration = int(duration)
                
                # Apply HIPAA encryption if enabled
                if camera.config.encryption_enabled:
                    await self._encrypt_recording(task_info['recording_info'])
                
                del self.recording_tasks[camera_id]
                
            return success
            
        except Exception as e:
            logger.error(f"Error stopping recording for camera {camera_id}: {str(e)}")
            return False
    
    async def _encrypt_recording(self, recording_info: RecordingInfo):
        """Encrypt recording for HIPAA compliance"""
        try:
            file_path = Path(recording_info.file_path)
            if file_path.exists():
                # Read video file
                with open(file_path, 'rb') as f:
                    video_data = f.read()
                
                # Encrypt data
                encrypted_data = self.hipaa_compliance.encrypt_video(video_data)
                
                # Write encrypted file
                encrypted_path = file_path.with_suffix('.encrypted.mp4')
                with open(encrypted_path, 'wb') as f:
                    f.write(encrypted_data)
                
                # Update recording info
                recording_info.file_path = str(encrypted_path)
                recording_info.encryption_key = "encrypted"
                
                # Remove original file
                file_path.unlink()
                
        except Exception as e:
            logger.error(f"Error encrypting recording: {str(e)}")
    
    async def get_camera_status(self, camera_id: str) -> Dict:
        """Get camera status"""
        try:
            if camera_id not in self.cameras:
                return {'status': 'not_found'}
                
            camera = self.cameras[camera_id]
            
            return {
                'id': camera_id,
                'name': camera.config.name,
                'status': 'online' if camera.is_connected else 'offline',
                'is_recording': camera.is_recording,
                'uptime': 99.5,  # Would calculate actual uptime
                'storage_used': 0,  # Would calculate actual storage
                'last_maintenance': camera.config.last_maintenance.isoformat() if hasattr(camera.config, 'last_maintenance') else None
            }
            
        except Exception as e:
            logger.error(f"Error getting camera status: {str(e)}")
            return {'status': 'error'}
    
    async def get_all_cameras_status(self) -> List[Dict]:
        """Get status of all cameras"""
        status_list = []
        for camera_id in self.cameras:
            status = await self.get_camera_status(camera_id)
            status_list.append(status)
        return status_list
    
    async def get_recording_info(self, camera_id: str) -> Optional[RecordingInfo]:
        """Get recording information for a camera"""
        if camera_id in self.recording_tasks:
            return self.recording_tasks[camera_id]['recording_info']
        return None
    
    async def cleanup_old_recordings(self, retention_days: int = 30):
        """Clean up old recordings based on retention policy"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
            
            for file_path in self.storage_path.glob("*.mp4"):
                if file_path.stat().st_mtime < cutoff_date.timestamp():
                    file_path.unlink()
                    logger.info(f"Deleted old recording: {file_path}")
                    
        except Exception as e:
            logger.error(f"Error cleaning up old recordings: {str(e)}")

# Global camera manager instance
camera_manager = CameraManager()

# Example usage functions
async def initialize_cameras():
    """Initialize cameras from configuration"""
    # Example camera configurations
    camera_configs = [
        CameraConfig(
            id="CAM001",
            name="Main Entrance",
            ip_address="192.168.1.100",
            port=554,
            username="admin",
            password="password123",
            rtsp_url="rtsp://192.168.1.100:554/stream1",
            resolution="1080p",
            fps=30,
            recording_enabled=True,
            motion_detection_enabled=True,
            ai_analytics_enabled=True,
            privacy_zones=[],
            retention_days=30,
            encryption_enabled=True
        ),
        CameraConfig(
            id="CAM002",
            name="Patient Room 101",
            ip_address="192.168.1.101",
            port=554,
            username="admin",
            password="password123",
            rtsp_url="rtsp://192.168.1.101:554/stream1",
            resolution="1080p",
            fps=25,
            recording_enabled=True,
            motion_detection_enabled=True,
            ai_analytics_enabled=True,
            privacy_zones=[
                {
                    'enabled': True,
                    'coordinates': [0.7, 0.3, 1.0, 1.0],  # Bathroom area
                    'type': 'blur'
                }
            ],
            retention_days=90,  # Longer retention for patient areas
            encryption_enabled=True
        )
    ]
    
    for config in camera_configs:
        await camera_manager.add_camera(config)
        await camera_manager.start_recording(config.id)

async def get_camera_stream_url(camera_id: str) -> Optional[str]:
    """Get streaming URL for camera"""
    if camera_id in camera_manager.cameras:
        camera = camera_manager.cameras[camera_id]
        return f"rtsp://{camera.config.username}:{camera.config.password}@{camera.config.ip_address}:{camera.config.port}/stream1"
    return None 