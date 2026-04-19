from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import os
import requests
import tempfile

from pipeline.translator_pipeline import process, process_file, process_stream

app = FastAPI()

class Request(BaseModel):
    text: str
    targetLanguage: str
    inputLanguage: Optional[str] = None
    mode: str
    


class UploadRequest(BaseModel):
    fileUrl: str
    targetLanguage: str


class StreamRequest(BaseModel):
    text: str
    sourceLanguage: str
    targetLanguage: str
    gender: Optional[str] = "male"



@app.post("/translate")
def translate_api(req: Request):

    result = process(
        req.text,
        req.targetLanguage,
        req.mode,
        req.inputLanguage
    )

    return {
        "translated_text": result["translated_text"],
        "detected_language": result["detected_language"],
        "audio_url": result["audio"]["audio_url"] if result["audio"] else None,
        "audio_public_id": result["audio"]["audio_public_id"] if result["audio"] else None
    }


# @app.post("/upload")
# def upload_from_url(data: UploadRequest):

#     file_url = data.fileUrl
#     target_language = data.targetLanguage

#     response = requests.get(file_url)

#     temp_file = tempfile.NamedTemporaryFile(delete=False)
#     temp_file.write(response.content)
#     temp_file.close()

#     result = process_file(temp_file.name, target_language)

#     os.remove(temp_file.name)

#     return {
#         "original_text": result["original_text"],
#         "translated_text": result["translated_text"],
#         "detected_language": result["detected_language"],
#         "audio_url": result["audio"]["audio_url"] if result["audio"] else None,
#         "audio_public_id": result["audio"]["audio_public_id"] if result["audio"] else None
#     }


@app.post("/upload")
def upload_from_url(data: UploadRequest):

    file_url = data.fileUrl
    target_language = data.targetLanguage

    response = requests.get(file_url)

    # 🔥 Extract extension from URL
    ext = file_url.split(".")[-1]

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}")
    temp_file.write(response.content)
    temp_file.close()

    result = process_file(temp_file.name, target_language)

    os.remove(temp_file.name)

    return {
        "original_text": result["original_text"],
        "translated_text": result["translated_text"],
        "detected_language": result["detected_language"],
        "audio_url": result["audio"]["audio_url"] if result["audio"] else None,
        "audio_public_id": result["audio"]["audio_public_id"] if result["audio"] else None
    }




@app.post("/translate-stream")
def translate_stream(req: StreamRequest):

    return process_stream(
        req.text,
        req.sourceLanguage,
        req.targetLanguage,
        req.gender
    )