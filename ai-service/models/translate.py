from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL_NAME = "facebook/nllb-200-distilled-600M"
#MODEL_NAME = "facebook/nllb-200-1.3B"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

LANG_MAP = {
    "en": "eng_Latn",
    "fr": "fra_Latn",
    "es": "spa_Latn",
    "de": "deu_Latn",
    "ar": "arb_Arab",
    "zh": "zho_Hans",
    "ja": "jpn_Jpan",
    "ko": "kor_Hang",

    "hi": "hin_Deva",
    "mr": "mar_Deva",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "bn": "ben_Beng",
    "gu": "guj_Gujr",
    "pa": "pan_Guru",
}


def translate(text, src, tgt):
    src_code = LANG_MAP.get(src)
    tgt_code = LANG_MAP.get(tgt)

    if not src_code or not tgt_code:
        return f"Unsupported language: {src} → {tgt}"

    tokenizer.src_lang = src_code
    tokens = tokenizer(text, return_tensors="pt")

    output = model.generate(
        **tokens,
        forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_code),
        max_length=400
    )

    return tokenizer.decode(output[0], skip_special_tokens=True)

