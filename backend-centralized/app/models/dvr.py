"""
DVR models (generic DVR/NVR + channels)
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class DVR(Base):
    __tablename__ = "dvrs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    host = Column(String(100), nullable=False)
    port = Column(Integer, default=554)
    username = Column(String(100))
    password = Column(String(200))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    channels = relationship("DVRChannel", back_populates="dvr")


class DVRChannel(Base):
    __tablename__ = "dvr_channels"

    id = Column(Integer, primary_key=True, index=True)
    dvr_id = Column(Integer, ForeignKey("dvrs.id"), nullable=False)
    name = Column(String(200), nullable=False)
    rtsp_url = Column(String(500), nullable=False)
    hls_path = Column(String(500))
    ingest_active = Column(Boolean, default=False)
    motion_enabled = Column(Boolean, default=True)
    motion_sensitivity = Column(Integer, default=5)  # 1-10
    last_probe_ok = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    dvr = relationship("DVR", back_populates="channels")


