import langid

def detect_language(text: str) -> str:
    lang, confidence = langid.classify(text)
    return lang
