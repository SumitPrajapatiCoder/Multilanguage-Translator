# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
# import torch

# MODEL_NAME = "facebook/nllb-200-distilled-600M"

# print("Loading tokenizer...")
# tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# print("Loading model... (this may take 30-60 seconds)")

# model = AutoModelForSeq2SeqLM.from_pretrained(
#     MODEL_NAME,
#     device_map="cpu",        
#     low_cpu_mem_usage=True    
# )

# print("Model loaded successfully!")

# LANG_MAP = {
#     "en": "eng_Latn",
#     "fr": "fra_Latn",
#     "es": "spa_Latn",
#     "de": "deu_Latn",
#     "ar": "arb_Arab",
#     "zh": "zho_Hans",
#     "ja": "jpn_Jpan",
#     "ko": "kor_Hang",

#     "hi": "hin_Deva",
#     "mr": "mar_Deva",
#     "ta": "tam_Taml",
#     "te": "tel_Telu",
#     "kn": "kan_Knda",
#     "ml": "mal_Mlym",
#     "bn": "ben_Beng",
#     "gu": "guj_Gujr",
#     "pa": "pan_Guru",
# }


# def translate(text, src, tgt):
#     src_code = LANG_MAP.get(src)
#     tgt_code = LANG_MAP.get(tgt)

#     if not src_code or not tgt_code:
#         return f"Unsupported language: {src} → {tgt}"

#     tokenizer.src_lang = src_code
#     tokens = tokenizer(text, return_tensors="pt")

#     output = model.generate(
#         **tokens,
#         forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_code),
#         max_length=400
#     )

#     return tokenizer.decode(output[0], skip_special_tokens=True)

















from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import traceback


MODEL_NAME = "facebook/nllb-200-distilled-600M"

print("Loading model...")

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME,
    device_map="cpu",
    low_cpu_mem_usage=True
)

print("Model loaded successfully!")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    use_fast=False
)

print("Tokenizer loaded (thread-safe)")

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
    try:
        print("\n========== TRANSLATION START ==========")
        print(f"Input Text: {text}")
        print(f"Source: {src}")
        print(f"Target: {tgt}")

        # 🔁 Convert short code → NLLB code
        src_code = LANG_MAP.get(src)
        tgt_code = LANG_MAP.get(tgt)

        if not src_code or not tgt_code:
            error_msg = f"Unsupported language: {src} → {tgt}"
            print(error_msg)
            return error_msg

        print(f"Converted Codes: {src_code} → {tgt_code}")

        # 🔥 Set source language
        tokenizer.src_lang = src_code

        # 🔥 Tokenize
        inputs = tokenizer(text, return_tensors="pt")

        print("Tokenization done")

        # 🔥 Generate translation
        translated_tokens = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_code),
            max_length=200
        )

        print(" Model generation complete")

        # 🔥 Decode output
        result = tokenizer.batch_decode(
            translated_tokens,
            skip_special_tokens=True
        )[0]

        print(f"Translated Output: {result}")
        print("========== TRANSLATION END ==========\n")

        return result

    except Exception as e:
        print(" ERROR OCCURRED")
        traceback.print_exc()
        return f"Translation error: {str(e)}"