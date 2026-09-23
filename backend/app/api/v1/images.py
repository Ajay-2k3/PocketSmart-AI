import uuid
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from app.core.security import AuthenticatedUser
from app.core.dependencies import get_current_user
from app.services.image_service import ImageService

router = APIRouter(prefix="/images", tags=["Images"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    plan_id: Optional[str] = Form(None),
    image_type: Optional[str] = Form("outfit"),
    user: AuthenticatedUser = Depends(get_current_user)
):
    content = await file.read()
    ImageService.validate_image(content, file.content_type or "image/jpeg", file.filename or "upload.jpg")

    clean_filename = ImageService.generate_filename(file.filename or "upload.jpg")
    storage_path = ImageService.get_storage_path(user.id, plan_id, clean_filename)
    public_url = f"https://mock-storage.supabase.co/storage/v1/object/public/outfits/{storage_path}"

    return {
        "file_url": public_url,
        "storage_path": storage_path,
        "file_name": clean_filename,
        "content_type": file.content_type,
        "size_bytes": len(content)
    }
