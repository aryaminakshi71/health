"""
Generic DVR API: register DVRs, channels, probe RTSP, start/stop ingest to HLS
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.dvr import DVR, DVRChannel
from app.services.motion_service import motion_service
import subprocess, os, shlex
from pathlib import Path

router = APIRouter()

HLS_ROOT = Path(os.getenv("RECORDING_STORAGE_PATH", "/var/surveillance/recordings")) / "hls"
HLS_ROOT.mkdir(parents=True, exist_ok=True)

@router.get("/dvrs")
async def list_dvrs(db: Session = Depends(get_db)):
    rows = db.query(DVR).all()
    return {"success": True, "data": [{"id": r.id, "name": r.name, "host": r.host, "port": r.port} for r in rows]}

@router.post("/dvrs")
async def create_dvr(payload: Dict[str, Any], db: Session = Depends(get_db)):
    d = DVR(name=payload.get("name") or "DVR", host=payload.get("host"), port=payload.get("port", 554), username=payload.get("username"), password=payload.get("password"), notes=payload.get("notes"))
    if not d.host:
        raise HTTPException(status_code=400, detail="host required")
    db.add(d); db.commit(); db.refresh(d)
    return {"success": True, "id": d.id}

@router.get("/dvrs/{dvr_id}/channels")
async def list_channels(dvr_id: int, db: Session = Depends(get_db)):
    chans = db.query(DVRChannel).filter(DVRChannel.dvr_id == dvr_id).all()
    return {"success": True, "data": [{"id": c.id, "name": c.name, "rtsp_url": c.rtsp_url, "ingest_active": c.ingest_active, "last_probe_ok": c.last_probe_ok} for c in chans]}

@router.post("/dvrs/{dvr_id}/channels")
async def create_channel(dvr_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    if not payload.get("name") or not payload.get("rtsp_url"):
        raise HTTPException(status_code=400, detail="name and rtsp_url required")
    c = DVRChannel(dvr_id=dvr_id, name=payload["name"], rtsp_url=payload["rtsp_url"])
    db.add(c); db.commit(); db.refresh(c)
    return {"success": True, "id": c.id}

@router.post("/dvrs/channels/{channel_id}/probe")
async def probe_channel(channel_id: int, db: Session = Depends(get_db)):
    c = db.query(DVRChannel).filter(DVRChannel.id == channel_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Channel not found")
    # ffprobe the RTSP URL
    try:
        cmd = f"ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height -of default=nokey=1:noprint_wrappers=1 {shlex.quote(c.rtsp_url)}"
        subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10)
        c.last_probe_ok = True
        db.commit()
        return {"success": True, "ok": True}
    except Exception:
        c.last_probe_ok = False
        db.commit()
        return {"success": True, "ok": False}

@router.post("/dvrs/channels/{channel_id}/start-ingest")
async def start_ingest(channel_id: int, db: Session = Depends(get_db)):
    c = db.query(DVRChannel).filter(DVRChannel.id == channel_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Channel not found")
    out_dir = HLS_ROOT / f"dvr_{c.dvr_id}_ch_{c.id}"
    out_dir.mkdir(parents=True, exist_ok=True)
    playlist = out_dir / "index.m3u8"
    # spawn ffmpeg to transcode RTSP -> HLS
    cmd = [
        "ffmpeg","-rtsp_transport","tcp","-i", c.rtsp_url,
        "-codec:v","libx264","-codec:a","aac","-start_number","0",
        "-hls_time","4","-hls_list_size","6","-f","hls", str(playlist)
    ]
    try:
        subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        c.ingest_active = True
        c.hls_path = f"/api/v1/camera/recordings/hls/dvr_{c.dvr_id}_ch_{c.id}/index.m3u8"
        db.commit()
        return {"success": True, "hls_url": c.hls_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dvrs/channels/{channel_id}/motion")
async def toggle_motion(channel_id: int, enabled: Optional[bool] = None, sensitivity: Optional[int] = None, db: Session = Depends(get_db)):
    c = db.query(DVRChannel).filter(DVRChannel.id == channel_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Channel not found")
    if enabled is not None:
        c.motion_enabled = bool(enabled)
    if sensitivity is not None:
        c.motion_sensitivity = max(1, min(10, int(sensitivity)))
    db.commit()
    return {"success": True, "motion_available": motion_service.is_available(), "motion_enabled": c.motion_enabled, "sensitivity": c.motion_sensitivity}

@router.post("/dvrs/channels/{channel_id}/stop-ingest")
async def stop_ingest(channel_id: int, db: Session = Depends(get_db)):
    # Minimal: mark inactive; external supervisor should manage ffmpeg PIDs in production
    c = db.query(DVRChannel).filter(DVRChannel.id == channel_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Channel not found")
    c.ingest_active = False
    db.commit()
    return {"success": True}


