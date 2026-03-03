from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import os
import base64
import tempfile
import requests
import cloudinary
import cloudinary.uploader

from pipeline.translator_pipeline import process, process_file

app = FastAPI()

# ================= CLOUDINARY CONFIG =================

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# ================= REQUEST MODELS =================

class Request(BaseModel):
    text: str
    targetLanguage: str
    inputLanguage: Optional[str] = None
    mode: str


class UploadRequest(BaseModel):
    fileUrl: str
    targetLanguage: str



# ================= TEXT TRANSLATE =================

@app.post("/translate")
def translate_api(req: Request):

    result = process(
        req.text,
        req.targetLanguage,
        req.mode,
        req.inputLanguage
    )

    # If speech generated → upload to Cloudinary
    audio_url = None
    audio_public_id = None

    if result.get("audio_file"):

        audio_path = f"generated_audio/{result['audio_file']}"

        upload_res = cloudinary.uploader.upload(
            audio_path,
            folder="generated_tts_audio",
            resource_type="auto",
        )

        audio_url = upload_res["secure_url"]
        audio_public_id = upload_res["public_id"]

        os.remove(audio_path)

    return {
        "translated_text": result["translated_text"],
        "detected_language": result["detected_language"],
        "audio_url": audio_url,
        "audio_public_id": audio_public_id
    }


# ================= FILE TRANSLATE (Cloudinary URL) =================


@app.post("/upload")
def upload_from_url(data: UploadRequest):

    file_url = data.fileUrl
    target_language = data.targetLanguage

    response = requests.get(file_url)

    # 🔥 FIX HERE
    file_extension = os.path.splitext(file_url)[1]

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=file_extension
    )

    temp_file.write(response.content)
    temp_file.close()

    result = process_file(temp_file.name, target_language)

    upload_res = cloudinary.uploader.upload(
        f"generated_audio/{result['audio_file']}",
        folder="generated_tts_audio",
        resource_type="auto",
    )

    os.remove(temp_file.name)

    return {
        "original_text": result["original_text"],
        "translated_text": result["translated_text"],
        "detected_language": result["detected_language"],
        "audio_url": upload_res["secure_url"],
        "audio_public_id": upload_res["public_id"],
    }