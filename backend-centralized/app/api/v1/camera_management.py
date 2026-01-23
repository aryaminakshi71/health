"""
Camera Management API
Handles camera connections, recording, and storage management
"""

from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import os
import shutil
from pathlib import Path
import re
from ...core.security import (
    security_manager, 
    access_control, 
    compliance_checker,
    get_current_user,
    get_current_user_dev_optional,
    verify_permission
)
from ...services.camera_integration import CameraManager, CameraConfig, camera_manager
from ...core.database import get_db
from sqlalchemy.orm import Session
from ...models.surveillance import Recording as RecordingModel
from ...core.realtime import realtime_manager, EventType
from cryptography.fernet import Fernet
import subprocess
import tempfile
from fastapi.responses import FileResponse, StreamingResponse
try:
    import jwt as _pyjwt  # PyJWT
except Exception:
    _pyjwt = None
try:
    import av as _pyav
except Exception:
    _pyav = None
from io import BytesIO

async def verify_api_key(request: Request):
    api_key_env = os.getenv("API_KEY")
    if not api_key_env:
        return
    provided = request.headers.get("x-api-key") or request.headers.get("X-API-Key") or request.query_params.get("api_key")
    if provided != api_key_env:
        raise HTTPException(status_code=401, detail="Unauthorized")

router = APIRouter(dependencies=[Depends(verify_api_key)])

# Simple role check (viewer < operator < admin)
def _role_level(role: str) -> int:
    r = (role or '').lower()
    return 0 if r == 'viewer' else 1 if r == 'operator' else 2 if r == 'admin' else 0

def _extract_role_from_jwt(request: Request) -> str:
    try:
        secret = os.getenv('JWT_SECRET')
        auth = request.headers.get('authorization') or request.headers.get('Authorization')
        if secret and auth and auth.lower().startswith('bearer '):
            token = auth.split(' ', 1)[1].strip()
            if _pyjwt:
                payload = _pyjwt.decode(token, secret, algorithms=["HS256"])  # type: ignore
                role = payload.get('role') or payload.get('permissions') or None
                if isinstance(role, str):
                    return role
    except Exception:
        return ''
    return ''

async def require_operator(request: Request):
    # Default to operator if not provided (dev-friendly); in production, require explicit role
    role = _extract_role_from_jwt(request) or request.headers.get('X-User-Role') or request.headers.get('x-user-role') or 'operator'
    if _role_level(role) < 1:
        raise HTTPException(status_code=403, detail="Insufficient role")
    return True

# Recording storage configuration (ensure directory exists)
RECORDING_STORAGE_PATH = os.getenv("RECORDING_STORAGE_PATH", "/var/surveillance/recordings")
RECORDING_RETENTION_DAYS = int(os.getenv("RECORDING_RETENTION_DAYS", "30"))

Path(RECORDING_STORAGE_PATH).mkdir(parents=True, exist_ok=True)
THUMBNAIL_DIR = Path(RECORDING_STORAGE_PATH) / "thumbnails"
THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)

def _thumbnail_path_for_recording_id(recording_id: str) -> Path:
    return THUMBNAIL_DIR / f"{recording_id}.jpg"

def _generate_thumbnail_from_bytes(video_bytes: bytes, out_path: Path) -> bool:
    if _pyav is None:
        return False
    try:
        with _pyav.open(BytesIO(video_bytes), format='mp4') as container:
            for frame in container.decode(video=0):
                img = frame.to_image()
                img.save(out_path, format='JPEG', quality=80)
                return True
    except Exception:
        # Try webm if mp4 failed
        try:
            with _pyav.open(BytesIO(video_bytes), format='webm') as container:
                for frame in container.decode(video=0):
                    img = frame.to_image()
                    img.save(out_path, format='JPEG', quality=80)
                    return True
        except Exception:
            return False
    return False

@router.post("/recordings/{recording_id}/hls", dependencies=[Depends(require_operator)])
async def generate_hls(recording_id: str):
    """Transcode a recording into an HLS playlist with segments (requires ffmpeg)."""
    mp4_path = Path(RECORDING_STORAGE_PATH) / f"{recording_id}.mp4"
    webm_path = Path(RECORDING_STORAGE_PATH) / f"{recording_id}.webm"
    enc_mp4_path = mp4_path.with_suffix(".mp4.enc")
    enc_webm_path = webm_path.with_suffix(".webm.enc")
    file_path = None
    for p in [mp4_path, webm_path, enc_mp4_path, enc_webm_path]:
        if p.exists():
            file_path = p
            break
    if not file_path:
        raise HTTPException(status_code=404, detail="Recording not found")

    hls_dir = Path(RECORDING_STORAGE_PATH) / "hls" / recording_id
    hls_dir.mkdir(parents=True, exist_ok=True)
    playlist = hls_dir / "index.m3u8"

    # If encrypted, decrypt to temp file
    input_path = file_path
    tmp_input = None
    if str(file_path).endswith('.enc'):
        key = os.getenv("RECORDING_ENCRYPTION_KEY")
        if not key:
            raise HTTPException(status_code=403, detail="Encryption key not configured")
        fernet = Fernet(key.encode())
        with file_path.open('rb') as f:
            ciphertext = f.read()
        plaintext = fernet.decrypt(ciphertext)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        tmp.write(plaintext)
        tmp.flush()
        tmp_input = tmp.name
        input_path = Path(tmp_input)

    try:
        cmd = [
            'ffmpeg','-y','-i', str(input_path),
            '-codec:v', 'libx264', '-codec:a', 'aac', '-start_number', '0',
            '-hls_time', '4', '-hls_list_size', '0', '-f', 'hls', str(playlist)
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        if tmp_input:
            try: os.unlink(tmp_input)
            except Exception: pass
        raise HTTPException(status_code=500, detail="ffmpeg failed")
    finally:
        if tmp_input:
            try: os.unlink(tmp_input)
            except Exception: pass

    return {"success": True, "playlist": f"/api/v1/camera/recordings/{recording_id}/hls/index.m3u8"}

@router.get("/recordings/{recording_id}/hls/{filename}")
async def serve_hls_segment(recording_id: str, filename: str):
    hls_dir = Path(RECORDING_STORAGE_PATH) / "hls" / recording_id
    target = hls_dir / filename
    if not target.exists():
        raise HTTPException(status_code=404, detail="HLS file not found")
    media_type = 'application/vnd.apple.mpegurl' if filename.endswith('.m3u8') else 'video/MP2T'
    return FileResponse(path=target, media_type=media_type, filename=filename)

@router.get("/compliance/status")
async def compliance_status():
    """Return HIPAA-related configuration status for surveillance recordings."""
    try:
        encryption_key_present = bool(os.getenv("RECORDING_ENCRYPTION_KEY"))
        # Check if any encrypted files exist
        recordings_path = Path(RECORDING_STORAGE_PATH)
        has_encrypted_files = any(recordings_path.glob("*.enc")) if recordings_path.exists() else False
        return {
            "success": True,
            "data": {
                "encryption_key_present": encryption_key_present,
                "retention_days": RECORDING_RETENTION_DAYS,
                "storage_path": RECORDING_STORAGE_PATH,
                "has_encrypted_files": has_encrypted_files
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting compliance status: {str(e)}")

@router.get("/monitoring/recording-status")
async def recording_status(window_minutes: int = 10):
    """Simple heartbeat for recording activity: counts files modified in last window."""
    try:
        now = datetime.utcnow().timestamp()
        recordings_path = Path(RECORDING_STORAGE_PATH)
        recent = 0
        if recordings_path.exists():
            for file_path in recordings_path.glob("*.*"):
                if (now - file_path.stat().st_mtime) <= window_minutes * 60:
                    recent += 1
        return {
            "success": True,
            "data": {
                "window_minutes": window_minutes,
                "recent_files": recent,
                "recording_active": recent > 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recording status: {str(e)}")

@router.post("/cameras/add")
async def add_camera(
    camera_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Add a new camera to the system"""
    try:
        # Validate camera data
        required_fields = ['name', 'ip_address', 'port', 'username', 'password', 'rtsp_url']
        for field in required_fields:
            if field not in camera_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create camera configuration
        config = CameraConfig(
            id=camera_data.get('id', f"cam_{datetime.now().strftime('%Y%m%d_%H%M%S')}"),
            name=camera_data['name'],
            ip_address=camera_data['ip_address'],
            port=camera_data['port'],
            username=camera_data['username'],
            password=camera_data['password'],
            rtsp_url=camera_data['rtsp_url'],
            resolution=camera_data.get('resolution', '1080p'),
            fps=camera_data.get('fps', 30),
            recording_enabled=camera_data.get('recording_enabled', True),
            motion_detection_enabled=camera_data.get('motion_detection_enabled', True),
            ai_analytics_enabled=camera_data.get('ai_analytics_enabled', False),
            privacy_zones=camera_data.get('privacy_zones', []),
            retention_days=camera_data.get('retention_days', RECORDING_RETENTION_DAYS),
            encryption_enabled=camera_data.get('encryption_enabled', True)
        )
        
        # Add camera to manager
        success = await camera_manager.add_camera(config)
        
        if success:
            # Log the action
            await security_manager.log_access(
                user=current_user,
                action="camera_added",
                resource=f"camera_{config.id}",
                ip_address=request.client.host
            )
            
            return {
                "success": True,
                "message": f"Camera {config.name} added successfully",
                "camera_id": config.id,
                "status": "connected"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to connect to camera")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding camera: {str(e)}")

@router.get("/cameras")
async def get_cameras(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Get all cameras"""
    try:
        cameras = await camera_manager.get_all_cameras_status()
        
        # Add audit logging
        await security_manager.log_access(
            user=current_user,
            action="cameras_listed",
            resource="cameras",
            ip_address=request.client.host
        )
        
        return {
            "success": True,
            "data": cameras,
            "total": len(cameras)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cameras: {str(e)}")

@router.get("/cameras/{camera_id}")
async def get_camera(
    camera_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Get specific camera details"""
    try:
        camera_status = await camera_manager.get_camera_status(camera_id)
        
        if camera_status.get('status') == 'not_found':
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Add audit logging
        await security_manager.log_access(
            user=current_user,
            action="camera_viewed",
            resource=f"camera_{camera_id}",
            ip_address=request.client.host
        )
        
        return {
            "success": True,
            "data": camera_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching camera: {str(e)}")

@router.post("/cameras/{camera_id}/start-recording", dependencies=[Depends(require_operator)])
async def start_recording(
    camera_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Start recording for a camera"""
    try:
        success = await camera_manager.start_recording(camera_id)
        
        if success:
            # Log the action
            await security_manager.log_access(
                user=current_user,
                action="recording_started",
                resource=f"camera_{camera_id}",
                ip_address=request.client.host
            )
            # Realtime event
            await realtime_manager.broadcast_event(
                EventType.RECORDING_STARTED,
                {"camera_id": camera_id, "timestamp": datetime.utcnow().isoformat()},
                target_app="surveillance-guard"
            )
            
            return {
                "success": True,
                "message": f"Recording started for camera {camera_id}",
                "camera_id": camera_id,
                "recording_status": "started"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to start recording")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting recording: {str(e)}")

@router.post("/cameras/{camera_id}/stop-recording", dependencies=[Depends(require_operator)])
async def stop_recording(
    camera_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Stop recording for a camera"""
    try:
        success = await camera_manager.stop_recording(camera_id)
        
        if success:
            # Log the action
            await security_manager.log_access(
                user=current_user,
                action="recording_stopped",
                resource=f"camera_{camera_id}",
                ip_address=request.client.host
            )
            # Realtime event
            await realtime_manager.broadcast_event(
                EventType.RECORDING_STOPPED,
                {"camera_id": camera_id, "timestamp": datetime.utcnow().isoformat()},
                target_app="surveillance-guard"
            )
            
            return {
                "success": True,
                "message": f"Recording stopped for camera {camera_id}",
                "camera_id": camera_id,
                "recording_status": "stopped"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to stop recording")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error stopping recording: {str(e)}")

@router.post("/recordings/upload", dependencies=[Depends(require_operator)])
async def upload_recording(
    request: Request,
    file: UploadFile = File(...),
    camera_id: Optional[str] = Form(None),
    start_time: Optional[str] = Form(None),
    duration: Optional[int] = Form(None),
    motion_detected: Optional[bool] = Form(False),
    format: Optional[str] = Form("webm"),
    filename: Optional[str] = Form(None),
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db)
):
    """Upload a recording file and persist metadata in database.
    Accepts multipart/form-data with a video file and metadata fields.
    """
    try:
        # Sanitize and build file name
        ts_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        safe_camera = (camera_id or "webcam").replace("/", "_")
        base_candidate = filename or f"{safe_camera}_{ts_str}"
        # strip extension if provided
        base_name = re.sub(r"(\.webm|\.mp4)$", "", base_candidate, flags=re.IGNORECASE)
        ext = ".webm" if format and "webm" in format.lower() else ".mp4"
        out_name = f"{base_name}{ext}"
        out_path = Path(RECORDING_STORAGE_PATH) / out_name

        # Write file to disk
        with out_path.open("wb") as out_f:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                out_f.write(chunk)

        stat = out_path.stat()

        # Optional encryption at rest
        encryption_key_env = os.getenv("RECORDING_ENCRYPTION_KEY")
        encryption_applied = False
        if encryption_key_env:
            try:
                fernet = Fernet(encryption_key_env.encode())
                with out_path.open("rb") as f:
                    plaintext = f.read()
                ciphertext = fernet.encrypt(plaintext)
                enc_path = out_path.with_suffix(out_path.suffix + ".enc")
                with enc_path.open("wb") as ef:
                    ef.write(ciphertext)
                # Remove plaintext
                out_path.unlink(missing_ok=True)
                out_path = enc_path
                stat = out_path.stat()
                encryption_applied = True
            except Exception as enc_err:
                # If encryption fails, keep plaintext but log
                await security_manager.log_access(
                    user=current_user,
                    action="recording_encryption_failed",
                    resource=base_name,
                    details={"error": str(enc_err)},
                    ip_address=request.client.host
                )

        # Parse start_time if provided
        start_dt = None
        if start_time:
            try:
                start_dt = datetime.fromisoformat(start_time)
            except Exception:
                start_dt = datetime.utcnow()
        else:
            start_dt = datetime.utcnow()

        # Create DB record (camera_id is optional integer FK)
        recording_row = RecordingModel(
            camera_id=None,  # Optional; integrate camera mapping later
            filename=out_name,
            file_path=str(out_path),
            file_size=stat.st_size,
            duration=duration or 0,
            start_time=start_dt,
            end_time=None,
            motion_detected=bool(motion_detected),
            retention_policy=f"{RECORDING_RETENTION_DAYS}_days",
            encryption_key=("fernet" if encryption_applied else None),
            created_at=datetime.utcnow()
        )
        db.add(recording_row)
        db.commit()
        db.refresh(recording_row)

        # Audit log
        await security_manager.log_access(
            user=current_user,
            action="recording_uploaded",
            resource=f"recording_{recording_row.id}",
            ip_address=request.client.host
        )

        # Broadcast realtime event (reuse existing type)
        await realtime_manager.broadcast_event(
            EventType.RECORDING_STOPPED,
            {
                "recording_id": recording_row.id,
                "filename": out_name,
                "size": stat.st_size,
                "duration": duration or 0,
                "encrypted": encryption_applied
            },
            target_app="surveillance-guard"
        )

        # Best-effort thumbnail generation (decrypted bytes only)
        try:
            thumb_path = _thumbnail_path_for_recording_id(recording_row.id)
            if str(out_path).endswith('.enc'):
                # Attempt to decrypt in-memory if key exists
                key = os.getenv("RECORDING_ENCRYPTION_KEY")
                if key:
                    fernet = Fernet(key.encode())
                    with out_path.open('rb') as f:
                        ciphertext = f.read()
                    plaintext = fernet.decrypt(ciphertext)
                    _generate_thumbnail_from_bytes(plaintext, thumb_path)
            else:
                with out_path.open('rb') as f:
                    _generate_thumbnail_from_bytes(f.read(), thumb_path)
        except Exception:
            pass

        return {
            "success": True,
            "data": {
                "id": recording_row.id,
                "filename": out_name,
                "file_size": stat.st_size,
                "duration": duration or 0,
                "path": str(out_path)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading recording: {str(e)}")

@router.get("/recordings")
async def get_recordings(
    camera_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    sort_by: str = "created_at",  # created_at | filename | file_size
    sort_dir: str = "desc",        # asc | desc
    request: Request = None,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Get all recordings"""
    try:
        recordings_path = Path(RECORDING_STORAGE_PATH)
        recordings = []
        
        if recordings_path.exists():
            patterns = ["*.mp4", "*.webm", "*.mp4.enc", "*.webm.enc"]
            for pattern in patterns:
                for file_path in recordings_path.glob(pattern):
                    # Build a stable id without double extensions
                    name = file_path.name
                    base = name[:-4] if name.endswith('.enc') else name
                    # strip .mp4 or .webm
                    if base.endswith('.mp4'):
                        rec_id = base[:-4]
                    elif base.endswith('.webm'):
                        rec_id = base[:-5]
                    else:
                        rec_id = file_path.stem

                    # Parse camera_id and date/time from id if possible
                    parts = rec_id.split('_')
                    file_camera_id = parts[0] if len(parts) >= 1 else None
                    date_str = parts[1] if len(parts) >= 2 else None
                    time_str = parts[2] if len(parts) >= 3 else None
                    
                    # Apply filters
                    if camera_id and file_camera_id and file_camera_id != camera_id:
                        continue
                    if start_date and date_str and date_str < start_date:
                        continue
                    if end_date and date_str and date_str > end_date:
                        continue
                    
                    # Get file stats
                    stat = file_path.stat()
                    
                    recordings.append({
                        "id": rec_id,
                        "camera_id": file_camera_id,
                        "filename": file_path.name,
                        "file_path": str(file_path),
                        "file_size": stat.st_size,
                        "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "download_url": f"/api/v1/camera/recordings/{rec_id}/download",
                        "thumbnail_url": f"/api/v1/camera/recordings/{rec_id}/thumbnail" if _thumbnail_path_for_recording_id(rec_id).exists() else None
                    })
        
        # Sorting
        key_fn = (
            (lambda x: x.get('created_at')) if sort_by == 'created_at' else
            (lambda x: x.get('filename')) if sort_by == 'filename' else
            (lambda x: x.get('file_size', 0))
        )
        recordings.sort(key=key_fn, reverse=(sort_dir.lower() != 'asc'))

        # Pagination
        total = len(recordings)
        page = max(page, 1)
        page_size = max(min(page_size, 200), 1)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_items = recordings[start_idx:end_idx]
        
        # Add audit logging
        await security_manager.log_access(
            user=current_user,
            action="recordings_listed",
            resource="recordings",
            ip_address=request.client.host if request else None
        )
        
        return {
            "success": True,
            "data": page_items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "filters": {
                "camera_id": camera_id,
                "start_date": start_date,
                "end_date": end_date
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recordings: {str(e)}")

@router.get("/recordings/{recording_id}/thumbnail")
async def get_recording_thumbnail(recording_id: str):
    """Serve a JPEG thumbnail for the recording if available."""
    thumb = _thumbnail_path_for_recording_id(recording_id)
    if not thumb.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(path=thumb, media_type='image/jpeg', filename=thumb.name)

@router.get("/recordings/{recording_id}")
async def get_recording(
    recording_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Get specific recording details"""
    try:
        # Support both plaintext and encrypted files
        mp4_path = Path(RECORDING_STORAGE_PATH) / f"{recording_id}.mp4"
        webm_path = Path(RECORDING_STORAGE_PATH) / f"{recording_id}.webm"
        enc_mp4_path = mp4_path.with_suffix(".mp4.enc")
        enc_webm_path = webm_path.with_suffix(".webm.enc")
        file_path = None
        for p in [mp4_path, webm_path, enc_mp4_path, enc_webm_path]:
            if p.exists():
                file_path = p
                break
        if not file_path:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Recording not found")
        
        stat = file_path.stat()
        
        recording_info = {
            "id": recording_id,
            "filename": file_path.name,
            "file_path": str(file_path),
            "file_size": stat.st_size,
            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "download_url": f"/api/v1/camera/recordings/{recording_id}/download"
        }
        
        # Add audit logging
        await security_manager.log_access(
            user=current_user,
            action="recording_viewed",
            resource=f"recording_{recording_id}",
            ip_address=request.client.host
        )
        
        return {
            "success": True,
            "data": recording_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recording: {str(e)}")

@router.get("/recordings/{recording_id}/download")
async def download_recording(
    recording_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Download a recording file"""
    try:
        # Support both plaintext and encrypted files
        mp4_path = Path(RECORDING_STORAGE_PATH) / f"{recording_id}.mp4"
        webm_path = Path(RECORDING_STORAGE_PATH) / f"{recording_id}.webm"
        enc_mp4_path = mp4_path.with_suffix(".mp4.enc")
        enc_webm_path = webm_path.with_suffix(".webm.enc")
        file_path = None
        for p in [mp4_path, webm_path, enc_mp4_path, enc_webm_path]:
            if p.exists():
                file_path = p
                break
        if not file_path:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        # Add audit logging
        await security_manager.log_access(
            user=current_user,
            action="recording_downloaded",
            resource=f"recording_{recording_id}",
            ip_address=request.client.host
        )
        # If encrypted and key is present, decrypt to temp and stream
        if str(file_path).endswith(".enc"):
            encryption_key_env = os.getenv("RECORDING_ENCRYPTION_KEY")
            if not encryption_key_env:
                # Without key, return encrypted blob
                return FileResponse(path=file_path, filename=file_path.name, media_type='application/octet-stream')
            fernet = Fernet(encryption_key_env.encode())
            def iter_decrypted():
                with file_path.open("rb") as f:
                    ciphertext = f.read()
                plaintext = fernet.decrypt(ciphertext)
                yield plaintext
            # Guess media type
            media_type = 'video/webm' if '.webm' in str(file_path) else 'video/mp4'
            download_name = Path(str(file_path).replace('.enc','')).name
            return StreamingResponse(iter_decrypted(), media_type=media_type, headers={"Content-Disposition": f"attachment; filename={download_name}"})
        else:
        # Return file download response
            media_type = 'video/webm' if '.webm' in str(file_path) else 'video/mp4'
        return FileResponse(
            path=file_path,
            filename=file_path.name,
                media_type=media_type,
                headers={"Content-Disposition": f"attachment; filename={file_path.name}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading recording: {str(e)}")

@router.get("/recordings/{recording_id}/stream")
async def stream_recording(
    recording_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Stream a recording inline for browser playback (no download prompt)."""
    # Locate file
    mp4_path = Path(RECORDING_STORAGE_PATH) / f"{recording_id}.mp4"
    webm_path = Path(RECORDING_STORAGE_PATH) / f"{recording_id}.webm"
    enc_mp4_path = mp4_path.with_suffix(".mp4.enc")
    enc_webm_path = webm_path.with_suffix(".webm.enc")
    file_path = None
    for p in [mp4_path, webm_path, enc_mp4_path, enc_webm_path]:
        if p.exists():
            file_path = p
            break
    if not file_path:
        raise HTTPException(status_code=404, detail="Recording not found")

    media_type = 'video/webm' if '.webm' in str(file_path) else 'video/mp4'

    # Inline streaming
    if str(file_path).endswith('.enc'):
        encryption_key_env = os.getenv("RECORDING_ENCRYPTION_KEY")
        if not encryption_key_env:
            raise HTTPException(status_code=403, detail="Encryption key not configured for streaming")
        fernet = Fernet(encryption_key_env.encode())

        def iter_decrypted():
            with file_path.open('rb') as f:
                ciphertext = f.read()
            plaintext = fernet.decrypt(ciphertext)
            yield plaintext

        return StreamingResponse(iter_decrypted(), media_type=media_type, headers={"Content-Disposition": "inline"})
    else:
        return FileResponse(path=file_path, media_type=media_type, headers={"Content-Disposition": f"inline; filename={file_path.name}"})


@router.delete("/recordings/{recording_id}", dependencies=[Depends(require_operator)])
async def delete_recording(
    recording_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Delete a recording"""
    try:
        # Support both webm/mp4 and encrypted variants
        candidates = [
            Path(RECORDING_STORAGE_PATH) / f"{recording_id}.mp4",
            Path(RECORDING_STORAGE_PATH) / f"{recording_id}.webm",
            Path(RECORDING_STORAGE_PATH) / f"{recording_id}.mp4.enc",
            Path(RECORDING_STORAGE_PATH) / f"{recording_id}.webm.enc",
        ]
        file_path = next((p for p in candidates if p.exists()), None)
        if not file_path:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        # Delete the file
        file_path.unlink()
        
        # Add audit logging
        await security_manager.log_access(
            user=current_user,
            action="recording_deleted",
            resource=f"recording_{recording_id}",
            ip_address=request.client.host
        )
        
        return {
            "success": True,
            "message": f"Recording {recording_id} deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting recording: {str(e)}")

@router.post("/recordings/retention/cleanup", dependencies=[Depends(require_operator)])
async def retention_cleanup(
    request: Request,
    days: Optional[int] = None,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Delete recordings older than retention days.
    Default uses RECORDING_RETENTION_DAYS.
    """
    try:
        cutoff_days = days if days is not None else RECORDING_RETENTION_DAYS
        cutoff = datetime.utcnow() - timedelta(days=int(cutoff_days))

        recordings_path = Path(RECORDING_STORAGE_PATH)
        deleted = 0

        if recordings_path.exists():
            for file_path in recordings_path.glob("*.*"):
                # Use file modification time for retention
                if datetime.fromtimestamp(file_path.stat().st_mtime) < cutoff:
                    try:
                        file_path.unlink()
                        deleted += 1
                    except Exception:
                        continue

        await security_manager.log_access(
            user=current_user,
            action="retention_cleanup",
            resource="recordings",
            details={"deleted": deleted, "days": cutoff_days},
            ip_address=request.client.host
        )

        return {"success": True, "deleted": deleted, "retention_days": cutoff_days}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during retention cleanup: {str(e)}")

@router.get("/monitoring/health")
async def monitoring_health(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Basic monitoring: cameras status summary and storage usage."""
    try:
        cameras = await camera_manager.get_all_cameras_status()
        online = len([c for c in cameras if c.get("status") == "online"]) if isinstance(cameras, list) else 0
        total = len(cameras) if isinstance(cameras, list) else 0

        recordings_path = Path(RECORDING_STORAGE_PATH)
        total_size = 0
        file_count = 0
        if recordings_path.exists():
            for file_path in recordings_path.glob("*.*"):
                total_size += file_path.stat().st_size
                file_count += 1

        disk_usage = shutil.disk_usage(recordings_path)

        data = {
            "cameras": {"total": total, "online": online, "offline": max(total - online, 0)},
            "recordings": {"count": file_count, "total_size_bytes": total_size},
            "storage": {
                "path": str(recordings_path),
                "disk_total_gb": round(disk_usage.total / (1024**3), 2),
                "disk_used_gb": round(disk_usage.used / (1024**3), 2),
                "disk_free_gb": round(disk_usage.free / (1024**3), 2)
            }
        }

        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting monitoring health: {str(e)}")

@router.post("/cameras/test-connection")
async def test_camera_connection(
    camera_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Test camera connection without adding it"""
    try:
        # Create temporary camera config for testing
        config = CameraConfig(
            id="test_camera",
            name=camera_data.get('name', 'Test Camera'),
            ip_address=camera_data['ip_address'],
            port=camera_data['port'],
            username=camera_data['username'],
            password=camera_data['password'],
            rtsp_url=camera_data['rtsp_url'],
            resolution=camera_data.get('resolution', '1080p'),
            fps=camera_data.get('fps', 30),
            recording_enabled=False,  # Don't record during test
            motion_detection_enabled=False,
            ai_analytics_enabled=False,
            privacy_zones=[],
            retention_days=1,
            encryption_enabled=False
        )
        
        # Test connection
        from ...services.camera_integration import CameraConnection
        test_camera = CameraConnection(config)
        success = await test_camera.connect()
        
        if success:
            await test_camera.disconnect()
            
            return {
                "success": True,
                "message": "Camera connection test successful",
                "camera_info": {
                    "ip_address": config.ip_address,
                    "port": config.port,
                    "resolution": config.resolution,
                    "fps": config.fps
                }
            }
        else:
            return {
                "success": False,
                "message": "Camera connection test failed",
                "error": "Unable to establish connection"
            }
            
    except Exception as e:
        return {
            "success": False,
            "message": "Camera connection test failed",
            "error": str(e)
        }

@router.get("/storage/status")
async def get_storage_status(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db = Depends(get_db)
):
    """Get storage status and usage"""
    try:
        recordings_path = Path(RECORDING_STORAGE_PATH)
        
        if not recordings_path.exists():
            recordings_path.mkdir(parents=True, exist_ok=True)
        
        # Calculate storage usage
        total_size = 0
        file_count = 0
        
        for file_path in recordings_path.glob("*.mp4"):
            total_size += file_path.stat().st_size
            file_count += 1
        
        # Get disk usage
        import shutil
        disk_usage = shutil.disk_usage(recordings_path)
        
        storage_info = {
            "recordings_path": str(recordings_path),
            "total_recordings": file_count,
            "total_size_bytes": total_size,
            "total_size_gb": round(total_size / (1024**3), 2),
            "disk_total_gb": round(disk_usage.total / (1024**3), 2),
            "disk_used_gb": round(disk_usage.used / (1024**3), 2),
            "disk_free_gb": round(disk_usage.free / (1024**3), 2),
            "disk_usage_percent": round((disk_usage.used / disk_usage.total) * 100, 2)
        }
        
        return {
            "success": True,
            "data": storage_info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting storage status: {str(e)}") 

@router.get("/capabilities")
async def capabilities():
    """Report available surveillance capabilities so UI can surface features."""
    try:
        caps = {}
        # Encryption
        caps["encryption_enabled"] = bool(os.getenv("RECORDING_ENCRYPTION_KEY"))
        # API key
        caps["api_key_required"] = bool(os.getenv("API_KEY"))
        # JWT
        caps["jwt_enabled"] = bool(os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY"))
        # Thumbnails
        caps["pyav_available"] = _pyav is not None
        # ffmpeg for HLS
        try:
            import shutil as _shutil
            caps["ffmpeg_available"] = _shutil.which('ffmpeg') is not None
        except Exception:
            caps["ffmpeg_available"] = False
        # Storage path
        caps["recording_path"] = RECORDING_STORAGE_PATH
        caps["thumbnails_path"] = str(THUMBNAIL_DIR)
        return {"success": True, "data": caps}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting capabilities: {str(e)}")