# EMMANUELLA OBIDIKE
from fastapi import APIRouter, UploadFile, File
from app.aws_s3 import s3_client, AWS_S3_BUCKET
import uuid

# Create a router so we can add routes to our API
router = APIRouter(prefix="/api/uploads", tags=["uploads"]) # All routes in this file will be under /api/uploads

@router.post("/upload-image") # Run when the frontend sends a POST request to /upload-image
async def upload_image(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1] # Get the file extension (like jpg, png, etc.)
    filename = str(uuid.uuid4()) + "." + ext # Create a random filename so files don't overwrite each other

    # Upload the file to your S3 bucket
    s3_client.upload_fileobj(
        file.file,          # the actual file data
        AWS_S3_BUCKET,      # the name of your S3 bucket
        filename,            # the key (filename) to save as in S3
        ExtraArgs={"ACL": "public-read"} # Make the file public
    )

    return {"image_key": filename}

