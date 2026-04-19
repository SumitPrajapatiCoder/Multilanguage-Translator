from models.language_detect import detect_language
from models.translate import translate
from models.tts import generate_speech, generate_speech_stream
from models.stt import speech_to_text


SUPPORTED_LANGS = {
    "en", "hi", "mr", "ta", "te", "kn", "ml",
    "bn", "gu", "pa", "fr", "es", "de",
    "ar", "zh", "ja", "ko"
}

last_processed_cache = {}


def normalize_text(text: str) -> str:
    return text.lower().strip()


def normalize_detected_lang(lang: str, text: str) -> str:
    roman_confusion = {"hr", "sk", "cs", "pl"}

    if lang in roman_confusion:
        return "mr"

    if lang in SUPPORTED_LANGS:
        return lang

    return "en"



def process(text, target_language, mode="both", input_language=None):

    print("\n========== PROCESS START ==========")

    if input_language and input_language in SUPPORTED_LANGS:
        detected = input_language
    else:
        detected_raw = detect_language(text)
        detected = normalize_detected_lang(detected_raw, text)

    translated = translate(text, detected, target_language)

    audio_result = None

    if mode in ["speech", "both"]:
        print("Generating speech (Cloudinary direct)...")
        audio_result = generate_speech(translated, target_language, detected)

    print("========== PROCESS END ==========\n")

    return {
        "detected_language": detected,
        "translated_text": translated,
        "audio": audio_result 
    }


def process_file(file_path, target_language, mode="both"):

    print("\n========== PROCESS FILE START ==========")

    stt_result = speech_to_text(file_path)

    extracted_text = stt_result["text"]
    whisper_lang = stt_result["language"]

    detected = normalize_detected_lang(whisper_lang, extracted_text)

    translated = translate(extracted_text, detected, target_language)
    

    audio_result = None

    if mode in ["speech", "both"]:
        audio_result = generate_speech(translated, target_language, detected)

    print("========== PROCESS FILE END ==========\n")

    return {
        "original_text": extracted_text,
        "detected_language": detected,
        "translated_text": translated,
        "audio": audio_result
    }


def process_stream(text, source_language, target_language, gender="male"):

    global last_processed_cache

    clean_text = normalize_text(text)

    key = f"{clean_text}_{source_language}_{target_language}"

    if key in last_processed_cache:
        return {
            "translated_text": last_processed_cache[key],
            "audio_base64": None
        }

    translated = translate(clean_text, source_language, target_language)

    last_processed_cache[key] = translated

    if len(last_processed_cache) > 100:
        last_processed_cache.clear()

    audio_base64 = generate_speech_stream(translated, target_language, gender)

    return {
        "translated_text": translated,
        "audio_base64": audio_base64
    }