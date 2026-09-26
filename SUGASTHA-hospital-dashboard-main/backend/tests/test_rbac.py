import pytest
from fastapi.testclient import TestClient
from fastapi import APIRouter, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import get_db
from app.db.base import Base
from app.models.user import User
from app.core.dependencies import RoleChecker, get_current_user

# Setup test db
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dummy routes for RBAC testing
router = APIRouter()
@router.get("/admin-only")
def admin_only(user: User = Depends(RoleChecker(["HOSPITAL_ADMIN"]))):
    return {"status": "ok"}
    
app.include_router(router)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

def test_rbac_access_granted(client):
    # 1. Login or verify as ADMIN
    req = client.post("/api/v1/auth/request-otp", json={"phone": "+911111111111"})
    verify = client.post("/api/v1/auth/verify-otp", json={
        "phone": "+911111111111",
        "otp_code": "123456",
        "session_id": req.json()["session_id"]
    })
    
    # OTP creates PATIENT by default. Need to manually change role for test.
    # Actually wait, let's use the DB directly to change role.
    
def test_rbac_access_denied(client, db_session):
    # Patient tries to access admin route
    req = client.post("/api/v1/auth/request-otp", json={"phone": "+912222222222"})
    verify = client.post("/api/v1/auth/verify-otp", json={
        "phone": "+912222222222",
        "otp_code": "123456",
        "session_id": req.json()["session_id"]
    })
    token = verify.json()["access_token"]
    
    response = client.get("/admin-only", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert response.json()["detail"] == "Operation not permitted for your role"

def test_rbac_access_granted_admin(client, db_session):
    from app.core.security import get_password_hash
    admin_user = User(
        phone="+913333333333",
        role="HOSPITAL_ADMIN",
        hashed_password=get_password_hash("admin123")
    )
    db_session.add(admin_user)
    db_session.commit()
    
    login = client.post("/api/v1/auth/login", data={"username": "+913333333333", "password": "admin123"})
    token = login.json()["access_token"]
    
    response = client.get("/admin-only", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
