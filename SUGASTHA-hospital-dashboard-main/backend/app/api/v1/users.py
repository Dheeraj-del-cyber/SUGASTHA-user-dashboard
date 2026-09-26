from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, RoleChecker
from app.models.user import User

router = APIRouter()

@router.get("/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "phone": current_user.phone,
        "role": current_user.role,
        "is_active": current_user.is_active
    }

@router.get("/admin-dashboard")
def read_admin_data(current_user: User = Depends(RoleChecker(["HOSPITAL_ADMIN", "SYSTEM_ADMIN"]))):
    return {
        "message": "Welcome to the admin dashboard",
        "user": current_user.phone
    }
