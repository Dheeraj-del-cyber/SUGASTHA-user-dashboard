import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.auth import OtpSession, UserSession
from app.schemas.auth import OTPRequest, OTPVerify, Token
from app.core.config import settings
from app.core.security import create_access_token, verify_password

router = APIRouter()

@router.post("/request-otp")
def request_otp(req: OTPRequest, db: Session = Depends(get_db)):
    # Mock OTP logic for development: always generate "123456"
    otp_code = "123456"
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    
    otp_session = OtpSession(
        phone=req.phone,
        otp_code=otp_code,
        expires_at=expires_at
    )
    db.add(otp_session)
    db.commit()
    
    # In a real system, trigger SMS here
    return {"message": "OTP sent successfully", "session_id": otp_session.id}

@router.post("/verify-otp", response_model=Token)
def verify_otp(req: OTPVerify, db: Session = Depends(get_db)):
    otp_session = db.query(OtpSession).filter(
        OtpSession.id == req.session_id,
        OtpSession.phone == req.phone,
        OtpSession.otp_code == req.otp_code
    ).first()
    
    if not otp_session:
        raise HTTPException(status_code=400, detail="Invalid OTP or session")
    
    if otp_session.is_verified:
        raise HTTPException(status_code=400, detail="OTP already verified")
        
    if otp_session.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")
        
    otp_session.is_verified = 1
    
    # Check if user exists, otherwise create
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        # Assuming we register them as PATIENT by default for OTP flow
        user = User(phone=req.phone, role="PATIENT")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Generate 45-day session for PATIENT, standard for others
    expires_in_seconds = settings.SESSION_45_DAYS if user.role == "PATIENT" else settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    
    user_session = UserSession(
        user_id=user.id,
        session_token=str(uuid.uuid4()),
        expires_at=datetime.utcnow() + timedelta(seconds=expires_in_seconds)
    )
    db.add(user_session)
    db.commit()
    
    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(seconds=expires_in_seconds),
        additional_claims={"role": user.role, "session_id": user_session.session_token}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": expires_in_seconds,
        "session_id": user_session.session_token
    }

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == form_data.username).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect phone or password")
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect phone or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    expires_in_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    user_session = UserSession(
        user_id=user.id,
        session_token=str(uuid.uuid4()),
        expires_at=datetime.utcnow() + timedelta(seconds=expires_in_seconds)
    )
    db.add(user_session)
    db.commit()
    
    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(seconds=expires_in_seconds),
        additional_claims={"role": user.role, "session_id": user_session.session_token}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": expires_in_seconds,
        "session_id": user_session.session_token
    }
