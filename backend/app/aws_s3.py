# EMMANUELLA OBIDIKE
from app.config import settings
import boto3

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region
)

AWS_S3_BUCKET = settings.aws_s3_bucket