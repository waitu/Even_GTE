from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin, get_db
from app.models.template import InvitationTemplate
from app.schemas.template import (
    InvitationTemplateCreate,
    InvitationTemplateOut,
    InvitationTemplateUpdate,
)

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("/", dependencies=[Depends(get_current_admin)])
def list_templates(db: Session = Depends(get_db)) -> list[InvitationTemplateOut]:
    rows = db.query(InvitationTemplate).order_by(InvitationTemplate.updated_at.desc()).all()
    return [InvitationTemplateOut.model_validate(r) for r in rows]


@router.post("/", response_model=InvitationTemplateOut, dependencies=[Depends(get_current_admin)])
def create_template(payload: InvitationTemplateCreate, db: Session = Depends(get_db)):
    exists = db.query(InvitationTemplate).filter(InvitationTemplate.name == payload.name).first()
    if exists:
        raise HTTPException(status_code=400, detail="Template name already exists")

    t = InvitationTemplate(**payload.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.get("/{template_id}", response_model=InvitationTemplateOut, dependencies=[Depends(get_current_admin)])
def get_template(template_id: str, db: Session = Depends(get_db)):
    t = db.query(InvitationTemplate).filter(InvitationTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return t


@router.put("/{template_id}", response_model=InvitationTemplateOut, dependencies=[Depends(get_current_admin)])
def update_template(template_id: str, payload: InvitationTemplateUpdate, db: Session = Depends(get_db)):
    t = db.query(InvitationTemplate).filter(InvitationTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")

    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"] != t.name:
        exists = db.query(InvitationTemplate).filter(InvitationTemplate.name == data["name"]).first()
        if exists:
            raise HTTPException(status_code=400, detail="Template name already exists")

    for k, v in data.items():
        setattr(t, k, v)

    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/{template_id}", dependencies=[Depends(get_current_admin)])
def delete_template(template_id: str, db: Session = Depends(get_db)):
    t = db.query(InvitationTemplate).filter(InvitationTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(t)
    db.commit()
    return {"ok": True}
