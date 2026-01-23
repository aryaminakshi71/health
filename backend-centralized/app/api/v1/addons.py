from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.addons import Addon


router = APIRouter()


class AddonStatus(BaseModel):
    slug: str
    installed: bool
    enabled: bool

    class Config:
        from_attributes = True


class AddonAction(BaseModel):
    slug: str


@router.get("/addons", response_model=List[AddonStatus])
def list_addons(db: Session = Depends(get_db)):
    addons = db.query(Addon).all()
    return addons


@router.post("/addons/install", response_model=AddonStatus)
def install_addon(payload: AddonAction, db: Session = Depends(get_db)):
    slug = payload.slug.strip()
    if not slug:
        raise HTTPException(status_code=400, detail="slug is required")
    addon = db.query(Addon).get(slug)
    if not addon:
        addon = Addon(slug=slug)
        db.add(addon)
    addon.mark_installed()
    db.commit()
    db.refresh(addon)
    return addon


@router.post("/addons/enable", response_model=AddonStatus)
def enable_addon(payload: AddonAction, db: Session = Depends(get_db)):
    slug = payload.slug.strip()
    addon = db.query(Addon).get(slug)
    if not addon or not addon.installed:
        raise HTTPException(status_code=404, detail="addon not installed")
    addon.mark_enabled(True)
    db.commit()
    db.refresh(addon)
    return addon


@router.post("/addons/disable", response_model=AddonStatus)
def disable_addon(payload: AddonAction, db: Session = Depends(get_db)):
    slug = payload.slug.strip()
    addon = db.query(Addon).get(slug)
    if not addon or not addon.installed:
        raise HTTPException(status_code=404, detail="addon not installed")
    addon.mark_enabled(False)
    db.commit()
    db.refresh(addon)
    return addon


