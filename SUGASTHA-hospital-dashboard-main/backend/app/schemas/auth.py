from pydantic import BaseModel, Field
from typing import Optional

class OTPRequest(BaseModel):
    phone: str = Field(..., description="User's phone number")
    role: str = Field(default="PATIENT", description="Role to login/register as")

class OTPVerify(BaseModel):
    phone: str
    otp_code: str
    session_id: str

class LoginRequest(BaseModel):
    phone: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    session_id: str
