# import os
# import uuid
# from TTS.api import TTS

# tts_model = None

# def get_tts():
#     global tts_model
#     if tts_model is None:
#         print("Loading XTTS model...")
#         tts_model = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
#     return tts_model


# def generate_speech(text, language):
#     tts = get_tts()

#     os.makedirs("generated_audio", exist_ok=True)

#     filename = f"{uuid.uuid4()}.wav"
#     file_path = os.path.join("generated_audio", filename)

#     supported_langs = [
#         'en', 'es', 'fr', 'de', 'it', 'pt', 'pl',
#         'tr', 'ru', 'nl', 'cs', 'ar',
#         'zh-cn', 'hu', 'ko', 'ja', 'hi'
#     ]

#     if language not in supported_langs:
#         print(f"Language {language} not supported by XTTS. Falling back to Hindi.")
#         language = "hi"

#     speaker_dict = tts.synthesizer.tts_model.speaker_manager.speakers
#     speaker_id = list(speaker_dict.keys())[0]

#     tts.tts_to_file(
#         text=text,
#         file_path=file_path,
#         language=language,
#         speaker=speaker_id
#     )

#     return filename





















# import os
# import uuid
# from gtts import gTTS

# def generate_speech(text, language, source_language=None):
#     os.makedirs("generated_audio", exist_ok=True)

#     src = source_language.upper() if source_language else "AUTO"
#     tgt = language.upper()

#     unique_id = str(uuid.uuid4())[:8] 

#     filename = f"{src}_TO_{tgt}_{unique_id}.mp3"
#     file_path = os.path.join("generated_audio", filename)

#     tts = gTTS(text=text, lang=language)
#     tts.save(file_path)

#     return filename














# import os
# import uuid
# from gtts import gTTS
# from gtts.lang import tts_langs

# SUPPORTED_GTTS = tts_langs()

# def generate_speech(text, language, source_language=None):
#     os.makedirs("generated_audio", exist_ok=True)

#     if language not in SUPPORTED_GTTS:
#         print(f"gTTS does not support {language}, falling back to en")
#         language = "en"

#     src = source_language.upper() if source_language else "AUTO"
#     tgt = language.upper()

#     unique_id = str(uuid.uuid4())[:8]
#     filename = f"{src}_TO_{tgt}_{unique_id}.mp3"
#     file_path = os.path.join("generated_audio", filename)

#     tts = gTTS(text=text, lang=language, slow=False)
#     tts.save(file_path)

#     return filename


























# import os
# import uuid
# import asyncio
# import edge_tts

# VOICE_MAP = {
#     "en": "en-US-AriaNeural",
#     "hi": "hi-IN-SwaraNeural",
#     "ta": "ta-IN-PallaviNeural",
#     "te": "te-IN-ShrutiNeural",
#     "mr": "mr-IN-AarohiNeural",
#     "bn": "bn-IN-TanishaaNeural",
#     "gu": "gu-IN-DhwaniNeural",
#     "pa": "pa-IN-GaganNeural",
#     "ml": "ml-IN-SobhanaNeural",
#     "kn": "kn-IN-SapnaNeural",
#     "fr": "fr-FR-DeniseNeural",
#     "es": "es-ES-ElviraNeural",
#     "de": "de-DE-KatjaNeural",
#     "ar": "ar-SA-ZariyahNeural",
#     "zh": "zh-CN-XiaoxiaoNeural",
#     "ja": "ja-JP-NanamiNeural",
#     "ko": "ko-KR-SunHiNeural",
# }

# DEFAULT_VOICE = "en-US-AriaNeural"


# async def generate_speech_async(text, language, source_language=None):
#     os.makedirs("generated_audio", exist_ok=True)

#     voice = VOICE_MAP.get(language, DEFAULT_VOICE)

#     src = source_language.upper() if source_language else "AUTO"
#     tgt = language.upper()

#     unique_id = str(uuid.uuid4())[:8]
#     filename = f"{src}_TO_{tgt}_{unique_id}.mp3"
#     file_path = os.path.join("generated_audio", filename)

#     communicate = edge_tts.Communicate(
#         text=text,
#         voice=voice,
#     )

#     await communicate.save(file_path)

#     return filename


# def generate_speech(text, language, source_language=None):
#     return asyncio.run(generate_speech_async(text, language, source_language))




























import edge_tts
import asyncio
import base64
import uuid
from io import BytesIO
from dotenv import load_dotenv
load_dotenv()


import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)



VOICE_MAPP = {
    "en": "en-US-AriaNeural",
    "hi": "hi-IN-SwaraNeural",
    "ta": "ta-IN-PallaviNeural",
    "te": "te-IN-ShrutiNeural",
    "mr": "mr-IN-AarohiNeural",
    "bn": "bn-IN-TanishaaNeural",
    "gu": "gu-IN-DhwaniNeural",
    "pa": "pa-IN-GaganNeural",
    "ml": "ml-IN-SobhanaNeural",
    "kn": "kn-IN-SapnaNeural",
    "fr": "fr-FR-DeniseNeural",
    "es": "es-ES-ElviraNeural",
    "de": "de-DE-KatjaNeural",
    "ar": "ar-SA-ZariyahNeural",
    "zh": "zh-CN-XiaoxiaoNeural",
    "ja": "ja-JP-NanamiNeural",
    "ko": "ko-KR-SunHiNeural",
}

VOICE_MAP = {
    "en": {"male": "en-US-GuyNeural", "female": "en-US-AriaNeural"},
    "hi": {"male": "hi-IN-MadhurNeural", "female": "hi-IN-SwaraNeural"},
    "mr": {"male": "mr-IN-ManoharNeural", "female": "mr-IN-AarohiNeural"},
    "ta": {"male": "ta-IN-ValluvarNeural", "female": "ta-IN-PallaviNeural"},
    "te": {"male": "te-IN-MohanNeural", "female": "te-IN-ShrutiNeural"},
    "bn": {"male": "bn-IN-BashkarNeural", "female": "bn-IN-TanishaaNeural"},
    "gu": {"male": "gu-IN-NiranjanNeural", "female": "gu-IN-DhwaniNeural"},
    "pa": {"male": "pa-IN-GaganNeural", "female": "pa-IN-GaganNeural"},
    "ml": {"male": "ml-IN-MidhunNeural", "female": "ml-IN-SobhanaNeural"},
    "kn": {"male": "kn-IN-GaganNeural", "female": "kn-IN-SapnaNeural"},
    "fr": {"male": "fr-FR-HenriNeural", "female": "fr-FR-DeniseNeural"},
    "es": {"male": "es-ES-AlvaroNeural", "female": "es-ES-ElviraNeural"},
    "de": {"male": "de-DE-ConradNeural", "female": "de-DE-KatjaNeural"},
    "ar": {"male": "ar-SA-HamedNeural", "female": "ar-SA-ZariyahNeural"},
    "zh": {"male": "zh-CN-YunxiNeural", "female": "zh-CN-XiaoxiaoNeural"},
    "ja": {"male": "ja-JP-KeitaNeural", "female": "ja-JP-NanamiNeural"},
    "ko": {"male": "ko-KR-InJoonNeural", "female": "ko-KR-SunHiNeural"},
}


async def generate_speech_async(text, language, source_language=None):

    voice = VOICE_MAPP.get(language, "en-US-AriaNeural")

    src = source_language.upper() if source_language else "AUTO"
    tgt = language.upper()

    unique_id = str(uuid.uuid4())[:8]
    public_id = f"{src}_TO_{tgt}_{unique_id}"

    print("====== TTS UPLOAD DEBUG ======")
    print("Voice:", voice)
    print("Public ID:", public_id)
    print("==============================")

    audio_buffer = BytesIO()

    communicate = edge_tts.Communicate(text=text, voice=voice)

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    audio_buffer.seek(0)

    upload_result = cloudinary.uploader.upload(
        audio_buffer,
        resource_type="auto",
        folder="generated_tts_audio",
        public_id=public_id
    )

    print("CLOUDINARY CHECK:",
      os.getenv("CLOUDINARY_NAME"),
      os.getenv("CLOUDINARY_API_KEY"))

    return {
        "audio_url": upload_result["secure_url"],
        "audio_public_id": upload_result["public_id"]
    }


def generate_speech(text, language, source_language=None):
    return asyncio.run(generate_speech_async(text, language, source_language))


async def generate_speech_stream_async(text, language, gender="male"):

    voice = VOICE_MAP.get(language, {}).get(
        gender,
        "en-US-AriaNeural"
    )

    print("====== STREAM TTS DEBUG ======")
    print("Language:", language)
    print("Gender:", gender)
    print("Voice:", voice)
    print("==============================")

    audio_buffer = BytesIO()

    communicate = edge_tts.Communicate(text=text, voice=voice)

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    audio_bytes = audio_buffer.getvalue()

    return base64.b64encode(audio_bytes).decode()


def generate_speech_stream(text, language, gender="male"):
    return asyncio.run(generate_speech_stream_async(text, language, gender))