from models.language_detect import detect_language
from models.translate import translate
from models.tts import generate_speech
from models.stt import speech_to_text


SUPPORTED_LANGS = {
    "en", "hi", "mr", "ta", "te", "kn", "ml",
    "bn", "gu", "pa", "fr", "es", "de",
    "ar", "zh", "ja", "ko"
}


def normalize_detected_lang(lang: str, text: str) -> str:
    roman_confusion = {"hr", "sk", "cs", "pl"}

    if lang in roman_confusion:
        return "mr"

    if lang in SUPPORTED_LANGS:
        return lang

    return "en"


def process(text, target_language, mode="both", input_language=None):
    print("Input text:", text)
    print("INPUT LANGUAGE FROM FRONTEND:", input_language)

    if input_language and input_language in SUPPORTED_LANGS:
        detected = input_language
        print("Using manual input language:", detected)

    else:
        detected_raw = detect_language(text)
        detected = normalize_detected_lang(detected_raw, text)

        print("Auto detected language:", detected)

    print("Target language:", target_language)

    translated = translate(text, detected, target_language)

    print("Translated text:", translated)

    audio_file = None

    if mode in ["speech", "both"]:
        audio_file = generate_speech(translated, target_language, detected)

    return {
        "detected_language": detected,
        "translated_text": translated,
        "audio_file": audio_file
    }


def process_file(file_path, target_language, mode="both"):

    stt_result = speech_to_text(file_path)

    extracted_text = stt_result["text"]
    whisper_lang = stt_result["language"]

    print("Whisper detected language:", whisper_lang)
    print("Extracted text:", extracted_text)

    detected = normalize_detected_lang(whisper_lang, extracted_text)

    print("Final detected language:", detected)
    print("Target language:", target_language)

    translated = translate(extracted_text, detected, target_language)

    print("Translated text:", translated)

    audio_file = None

    if mode in ["speech", "both"]:
        audio_file = generate_speech(translated, target_language, detected)

    return {
        "original_text": extracted_text,
        "detected_language": detected,
        "translated_text": translated,
        "audio_file": audio_file
    }