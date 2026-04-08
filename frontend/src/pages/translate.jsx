import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/translate.css";

import {
  FaMicrophone,
  FaLanguage,
  FaVolumeUp,
  FaUser, FaMicrophoneSlash,
} from "react-icons/fa";

const Translate = () => {
  const [step, setStep] = useState(1);

  const [modeType, setModeType] = useState("text");
  const [originalText, setOriginalText] = useState("");

  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const [targetLang, setTargetLang] = useState("en");
  const [inputLangOverride, setInputLangOverride] = useState("auto");

  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [detectedLang, setDetectedLang] = useState(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [canReplay, setCanReplay] = useState(false);
  const [recording, setRecording] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  const audioRef = useRef(null);

  const [file, setFile] = useState(null);
  const recognitionRef = useRef(null);

  const LANGUAGES = [
    { code: "en", label: "English", mic: "en-IN" },
    { code: "hi", label: "Hindi", mic: "hi-IN" },
    { code: "mr", label: "Marathi", mic: "mr-IN" },
    { code: "ta", label: "Tamil", mic: "ta-IN" },
    { code: "te", label: "Telugu", mic: "te-IN" },
    { code: "kn", label: "Kannada", mic: "kn-IN" },
    { code: "ml", label: "Malayalam", mic: "ml-IN" },
    { code: "bn", label: "Bengali", mic: "bn-IN" },
    { code: "gu", label: "Gujarati", mic: "gu-IN" },
    { code: "pa", label: "Punjabi", mic: "pa-IN" },
    { code: "fr", label: "French", mic: "fr-FR" },
    { code: "es", label: "Spanish", mic: "es-ES" },
    { code: "de", label: "German", mic: "de-DE" },
    { code: "ar", label: "Arabic", mic: "ar-SA" },
    { code: "zh", label: "Chinese", mic: "zh-CN" },
    { code: "ja", label: "Japanese", mic: "ja-JP" },
    { code: "ko", label: "Korean", mic: "ko-KR" },
  ];



  const startListening = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      toast.error("Microphone permission denied",err);
      return;
    }

    setRecording(true);
    setStatus("listening");

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (inputLangOverride !== "auto") {
      const selected = LANGUAGES.find((l) => l.code === inputLangOverride);
      recognition.lang = selected?.mic;
    }

    recognition.onresult = (e) => {
      setText(e.results[0][0].transcript);
      setRecording(false);
      setStatus("idle");
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setRecording(false);
      setStatus("idle");
    };

    recognition.onend = () => {
      setRecording(false);
      setStatus("idle");
    };

    recognition.start();
    recognitionRef.current = recognition;
  };


  const playAudio = (audioUrl) => {
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    setIsSpeaking(true);
    setStatus("speaking");

    audio.play().catch((err) => {
      console.error("Audio play error:", err);
    });

    audio.onended = () => {
      setIsSpeaking(false);
      setStatus("idle");
    };
  };


  const handleTranslate = async () => {
    if (!text.trim()) {
      toast.error("Please enter or speak text");
      return;
    }

    try {
      setLoading(true);
      setStatus("translating");
      setCanReplay(false);
      setAudioFile(null);

      const payload = {
        text: text,
        targetLanguage: targetLang,
        inputLanguage: inputLangOverride,
        mode: "both",
      };

      const res = await axios.post(
        "/api/v1/language/translate",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setResult(res.data.translated_text);
      setDetectedLang(res.data.detected_language?.toUpperCase());
      setAudioFile(res.data.audio_url);
      setStep(3);

      if (res.data.audio_url) {
        setCanReplay(true);
        playAudio(res.data.audio_url);
      }

    } catch (err) {
      toast.error("Translation failed", err);
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  };


  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please select file");
      return;
    }

    try {
      setLoading(true);
      setStatus("translating");
      setCanReplay(false);
      setAudioFile(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetLanguage", targetLang);

      const res = await axios.post(
        "/api/v1/uploadTrans/uploadFiles",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOriginalText(res.data.original_text);
      setResult(res.data.translated_text);
      setDetectedLang(res.data.detected_language?.toUpperCase());
      setAudioFile(res.data.audio_url);
      setStep(3);

      if (res.data.audio_url) {
        setCanReplay(true);
        playAudio(res.data.audio_url);
      }

    } catch {
      toast.error("Upload failed");
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="tr-container">

      <div className={`tr-status ${status}`}>
        {status.toUpperCase()}
      </div>

      {detectedLang && (
        <div className="tr-lang">
          Detected: {detectedLang}
        </div>
      )}

      <h2 className="tr-title">AI Language Translator</h2>

      <div className="tr-mode">
        <button
          onClick={() => setModeType("text")}
          className={modeType === "text" ? "tr-btn-active" : ""}
        >
          Text / Speak
        </button>

        <button
          onClick={() => setModeType("file")}
          className={modeType === "file" ? "tr-btn-active" : ""}
        >
          Audio / Video
        </button>
      </div>

      {step === 1 && (
        <div className="tr-controls">

          {modeType === "text" && (
            <div>
              <label>Input Language</label>
              <select
                value={inputLangOverride}
                onChange={(e) => setInputLangOverride(e.target.value)}
              >
                <option value="auto">Auto Detect</option>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label>Target Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <button className="tr-main-btn" onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      )}

      {step >= 2 && (
        <div className="tr-panels">

          <div className="tr-panel">
            <h3><FaUser /> Human</h3>

            {modeType === "text" ? (
              <>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <button
                  className={`tr-speak ${recording ? "recording" : ""}`}
                  onClick={startListening}
                >
                  {recording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  {recording ? " Stop" : " Speak"}
                </button>

                <button
                  className="translate-btn"
                  onClick={handleTranslate}
                  disabled={loading}
                >
                  {loading ? "Translating..." : <><FaLanguage /> Translate</>}
                </button>
              </>
            ) : (
              <>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />

                <button className="tr-main-btn" onClick={handleFileUpload}>
                  Upload & Translate
                </button>
              </>
            )}
          </div>

          {step === 3 && (
            <div className="tr-panel">
              <h3>AI Translator</h3>

              <textarea value={result} readOnly />

              {canReplay && (
                <button className="tr-replay" onClick={() => playAudio(audioFile)}>
                  <FaVolumeUp /> Replay
                </button>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Translate;