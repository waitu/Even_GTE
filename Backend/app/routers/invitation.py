from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
import uuid
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import case, func
from app.core.auth import get_db, get_current_admin
from app.models.invitation import Invitation, InvitationStatus
from app.models.invitation_response import InvitationResponse
from app.models.rsvp import RsvpStatus
from app.schemas.invitation import InvitationAdminListItem, InvitationCreate, InvitationOut
from app.schemas.invitation_response import InvitationResponseCreate, InvitationResponseOut
from slugify import slugify
from datetime import datetime

router = APIRouter(prefix="/api/invitations", tags=["invitations"])


@router.get("/", dependencies=[Depends(get_current_admin)])
def list_invitations(db: Session = Depends(get_db)) -> list[InvitationAdminListItem]:
    rows = (
        db.query(
            Invitation,
            func.count(InvitationResponse.id).label("responses"),
            func.coalesce(
                func.sum(case((InvitationResponse.response == RsvpStatus.ATTENDING, 1), else_=0)),
                0,
            ).label("attending"),
            func.coalesce(
                func.sum(case((InvitationResponse.response == RsvpStatus.DECLINED, 1), else_=0)),
                0,
            ).label("declined"),
        )
        .outerjoin(InvitationResponse, InvitationResponse.invitation_id == Invitation.id)
        .group_by(Invitation.id)
        .order_by(Invitation.created_at.desc())
        .all()
    )
    result: list[InvitationAdminListItem] = []
    for inv, responses, attending, declined in rows:
        base = InvitationOut.model_validate(inv).model_dump()
        result.append(
            InvitationAdminListItem(
                **base,
                responses=int(responses),
                attending=int(attending),
                declined=int(declined),
            )
        )
    return result

@router.post("/", response_model=InvitationOut, dependencies=[Depends(get_current_admin)])
def create_invitation(invitation: InvitationCreate, db: Session = Depends(get_db)):
    payload = invitation.dict()

    # Default salutation if not provided (older clients / optional field).
    salutation = payload.get("recipient_salutation")
    if salutation is None or (isinstance(salutation, str) and not salutation.strip()):
        payload["recipient_salutation"] = "Ông"

    # Default draft if status not provided.
    status_value = payload.pop("status", None)
    if status_value:
        try:
            payload["status"] = InvitationStatus(status_value)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    db_invitation = Invitation(**payload)

    # Rule: slug only generated when publishing.
    if db_invitation.status == InvitationStatus.published and not db_invitation.slug:
        base = slugify(f"{db_invitation.title}-{db_invitation.recipient_name}")
        candidate = base
        suffix = 2
        while db.query(Invitation).filter(Invitation.slug == candidate).first():
            candidate = f"{base}-{suffix}"
            suffix += 1
        db_invitation.slug = candidate

    db.add(db_invitation)
    db.commit()
    db.refresh(db_invitation)
    return db_invitation

@router.get("/{slug}", response_model=InvitationOut)
def get_invitation(slug: str, db: Session = Depends(get_db)):
    invitation = db.query(Invitation).filter(Invitation.slug == slug, Invitation.status == InvitationStatus.published).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return invitation

@router.post("/{slug}/response", response_model=InvitationResponseOut)
def respond_invitation(
    slug: str,
    payload: InvitationResponseCreate,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    invitation = db.query(Invitation).filter(Invitation.slug == slug, Invitation.status == InvitationStatus.published).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    response_value = payload.response
    if response_value == RsvpStatus.PENDING:
        raise HTTPException(status_code=400, detail="Invalid response")

    # 1 invitation has at most 1 active response per client (identified by cookie).
    responder_cookie_key = f"invite_responder_{invitation.id}"
    responder_id_raw = request.cookies.get(responder_cookie_key)
    try:
        responder_id = UUID(responder_id_raw) if responder_id_raw else uuid.uuid4()
    except Exception:
        responder_id = uuid.uuid4()

    db_response = (
        db.query(InvitationResponse)
        .filter(
            InvitationResponse.invitation_id == invitation.id,
            InvitationResponse.responder_id == responder_id,
        )
        .first()
    )

    if db_response:
        db_response.response = response_value
    else:
        db_response = InvitationResponse(
            invitation_id=invitation.id,
            responder_id=responder_id,
            response=response_value,
        )
        db.add(db_response)

    invitation.rsvp_status = response_value
    db.commit()
    db.refresh(db_response)

    one_year = 60 * 60 * 24 * 365
    response.set_cookie(responder_cookie_key, str(responder_id), httponly=True, samesite="lax", max_age=one_year)
    response.set_cookie(f"invite_choice_{invitation.id}", response_value.value, httponly=False, samesite="lax", max_age=one_year)
    return db_response


@router.delete("/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_invitation(invitation_id: UUID, db: Session = Depends(get_db)):
    invitation = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    db.query(InvitationResponse).filter(InvitationResponse.invitation_id == invitation_id).delete(synchronize_session=False)
    db.delete(invitation)
    db.commit()
    return None
