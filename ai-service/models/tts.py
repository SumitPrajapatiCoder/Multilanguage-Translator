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


























import os
import uuid
import asyncio
import edge_tts

VOICE_MAP = {
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

DEFAULT_VOICE = "en-US-AriaNeural"


async def generate_speech_async(text, language, source_language=None):
    os.makedirs("generated_audio", exist_ok=True)

    voice = VOICE_MAP.get(language, DEFAULT_VOICE)

    src = source_language.upper() if source_language else "AUTO"
    tgt = language.upper()

    unique_id = str(uuid.uuid4())[:8]
    filename = f"{src}_TO_{tgt}_{unique_id}.mp3"
    file_path = os.path.join("generated_audio", filename)

    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
    )

    await communicate.save(file_path)

    return filename


def generate_speech(text, language, source_language=None):
    return asyncio.run(generate_speech_async(text, language, source_language))