from models.language_detect import detect_language
from models.translate import translate
from models.tts import generate_speech, generate_speech_stream
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

    print("\n========== PROCESS START ==========")
    print("Input text:", text)
    print("Input language from frontend:", input_language)
    print("Target language:", target_language)
    print("Mode:", mode)

    if input_language and input_language in SUPPORTED_LANGS:
        detected = input_language
        print("Using manual input language:", detected)
    else:
        detected_raw = detect_language(text)
        print("Detected language (raw):", detected_raw)

        detected = normalize_detected_lang(detected_raw, text)
        print("Normalized detected language:", detected)

    translated = translate(text, detected, target_language)
    print("Translated text:", translated)

    audio_file = None

    if mode in ["speech", "both"]:
        print("Generating speech...")
        audio_file = generate_speech(translated, target_language, detected)
        print("Generated audio file:", audio_file)
    else:
        print("Speech generation skipped")

    print("========== PROCESS END ==========\n")

    return {
        "detected_language": detected,
        "translated_text": translated,
        "audio_file": audio_file
    }




def process_file(file_path, target_language, mode="both"):

    print("\n========== PROCESS FILE START ==========")
    print("Input file path:", file_path)
    print("Target language:", target_language)
    print("Mode:", mode)

    print("\n--- Running Speech-to-Text ---")

    stt_result = speech_to_text(file_path)

    extracted_text = stt_result["text"]
    whisper_lang = stt_result["language"]

    print("Whisper detected language:", whisper_lang)
    print("Extracted text:", extracted_text)

    print("\n--- Normalizing language ---")

    detected = normalize_detected_lang(whisper_lang, extracted_text)

    print("Normalized detected language:", detected)

    print("\n--- Translating text ---")

    translated = translate(extracted_text, detected, target_language)

    print("Translated text:", translated)

    audio_file = None

    if mode in ["speech", "both"]:
        print("\n--- Generating speech ---")

        audio_file = generate_speech(translated, target_language, detected)

        print("Generated audio file:", audio_file)

    else:
        print("\nSpeech generation skipped")

    print("\n========== PROCESS FILE END ==========\n")

    return {
        "original_text": extracted_text,
        "detected_language": detected,
        "translated_text": translated,
        "audio_file": audio_file
    }



def process_stream(text, source_language, target_language, gender="male"):

    print("\n========== STREAM PROCESS START ==========")
    print("Incoming text:", text)
    print("Source language:", source_language)
    print("Target language:", target_language)

    translated = translate(text, source_language, target_language)
    print("Translated text:", translated)

    print("Generating streaming speech...")
    audio_base64 = generate_speech_stream(translated, target_language, gender)

    if audio_base64:
        print("Audio stream generated (base64 length):", len(audio_base64))
    else:
        print("No audio generated")

    print("========== STREAM PROCESS END ==========\n")

    return {
        "translated_text": translated,
        "audio_base64": audio_base64
    }