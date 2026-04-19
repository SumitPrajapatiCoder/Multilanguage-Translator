import whisper
import os
import re
from models.language_detect import detect_language
 
model = whisper.load_model("base")


SUPPORTED_AUDIO = (
    ".wav", ".mp3", ".m4a", ".flac", ".ogg", ".aac"
)

SUPPORTED_VIDEO = (
    ".mp4", ".mov", ".avi", ".mkv", ".webm"
)


def speech_to_text(file_path: str):
    """
    Accepts both audio and video files.
    Whisper internally extracts audio using ffmpeg.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError("File not found")

    ext = os.path.splitext(file_path)[1].lower()
    if ext not in SUPPORTED_AUDIO + SUPPORTED_VIDEO:
        raise ValueError("Unsupported file format")

    result = model.transcribe(
    file_path,
    temperature=0,
    beam_size=10,
    best_of=10
    )


    lang = result.get("language")

    if lang == "en":

     if re.search(r"[^\x00-\x7F]", result["text"]):
        print("Non Latin script detected, correcting language")
        lang = detect_language(result["text"])

    return {
    "text": result["text"],
    "language": lang
    }
