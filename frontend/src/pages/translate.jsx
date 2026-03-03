// import { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { speakText } from "../utils/speak";
// import "../styles/translate.css";

// import {
//   FaMicrophone,
//   FaLanguage,
//   FaVolumeUp,
//   FaUser,
// } from "react-icons/fa";

// const Translate = () => {
//   const [step, setStep] = useState(1);

//   const [text, setText] = useState("");
//   const [result, setResult] = useState("");

//   const [targetLang, setTargetLang] = useState("en");
//   const [inputLangOverride, setInputLangOverride] = useState("auto");

//   const [status, setStatus] = useState("idle");
//   const [loading, setLoading] = useState(false);
//   const [detectedLang, setDetectedLang] = useState(null);

//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [canReplay, setCanReplay] = useState(false);
//   const [recording, setRecording] = useState(false);

//   useEffect(() => {
//     window.speechSynthesis.onvoiceschanged = () => {
//       window.speechSynthesis.getVoices();
//     };
//   }, []);

//   const recognitionRef = useRef(null);
//   const audioCtxRef = useRef(null);
//   const analyserRef = useRef(null);
//   const dataArrayRef = useRef(null);
//   const animationRef = useRef(null);
//   const mediaStreamRef = useRef(null);



//   const LANGUAGES = [
//     { code: "en", label: "English", tts: "en-US", mic: "en-IN" },
//     { code: "hi", label: "Hindi", tts: "hi-IN", mic: "hi-IN" },
//     { code: "mr", label: "Marathi", tts: "mr-IN", mic: "mr-IN" },
//     { code: "ta", label: "Tamil", tts: "ta-IN", mic: "ta-IN" },
//     { code: "te", label: "Telugu", tts: "te-IN", mic: "te-IN" },
//     { code: "kn", label: "Kannada", tts: "kn-IN", mic: "kn-IN" },
//     { code: "ml", label: "Malayalam", tts: "ml-IN", mic: "ml-IN" },
//     { code: "bn", label: "Bengali", tts: "bn-IN", mic: "bn-IN" },
//     { code: "gu", label: "Gujarati", tts: "gu-IN", mic: "gu-IN" },
//     { code: "pa", label: "Punjabi", tts: "pa-IN", mic: "pa-IN" },
//     { code: "fr", label: "French", tts: "fr-FR", mic: "fr-FR" },
//     { code: "es", label: "Spanish", tts: "es-ES", mic: "es-ES" },
//     { code: "de", label: "German", tts: "de-DE", mic: "de-DE" },
//     { code: "ar", label: "Arabic", tts: "ar-SA", mic: "ar-SA" },
//     { code: "zh", label: "Chinese", tts: "zh-CN", mic: "zh-CN" },
//     { code: "ja", label: "Japanese", tts: "ja-JP", mic: "ja-JP" },
//     { code: "ko", label: "Korean", tts: "ko-KR", mic: "ko-KR" },
//   ];

//   const getLangLabel = (code) =>
//     LANGUAGES.find((l) => l.code === code)?.label || "Auto";


//   const startWaveform = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     mediaStreamRef.current = stream; 

//     audioCtxRef.current = new AudioContext();
//     analyserRef.current = audioCtxRef.current.createAnalyser();
//     analyserRef.current.fftSize = 64;

//     const source = audioCtxRef.current.createMediaStreamSource(stream);
//     source.connect(analyserRef.current);

//     dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

//     const animate = () => {
//       analyserRef.current.getByteFrequencyData(dataArrayRef.current);
//       animationRef.current = requestAnimationFrame(animate);
//     };

//     animate();
//   };


//   const stopWaveform = () => {
//     cancelAnimationFrame(animationRef.current);

//     audioCtxRef.current?.close();
//     audioCtxRef.current = null;

//     mediaStreamRef.current?.getTracks().forEach(track => track.stop());
//     mediaStreamRef.current = null;
//   };


//   const startListening = async () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       toast.error("Speech recognition not supported");
//       return;
//     }

//     await startWaveform();
//     setRecording(true);
//     setStatus("listening");

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;

//     if (inputLangOverride !== "auto") {
//       const selected = LANGUAGES.find((l) => l.code === inputLangOverride);
//       recognition.lang = selected?.mic;
//     }

//     recognition.onresult = (e) => {
//       setText(e.results[0][0].transcript);

//       recognition.stop();  
//       stopWaveform();      

//       setRecording(false);
//       setStatus("idle");
//     };

//     recognition.onerror = () => {
//       recognition.stop();
//       stopWaveform();
//       setRecording(false);
//       setStatus("idle");
//     };


//     recognition.start();
//     recognitionRef.current = recognition;
//   };

//   const handleTranslate = async () => {
//     if (!text.trim()) {
//       toast.error("Please enter or speak text");
//       return;
//     }

//     try {
//       setLoading(true);
//       setStatus("translating");
//       setCanReplay(false);

//       const res = await axios.post(
//         "/api/v1/language/translate",
//         {
//           text,
//           targetLanguage: targetLang,
//           inputLanguage: inputLangOverride === "auto" ? null : inputLangOverride,
//           mode: "both",
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       setResult(res.data.translated_text);
//       setDetectedLang(res.data.detected_language?.toUpperCase());
//       setStep(3);

//       const lang = LANGUAGES.find((l) => l.code === targetLang);
//       setIsSpeaking(true);
//       setCanReplay(true);
//       setStatus("speaking");

//       speakText(res.data.translated_text, lang?.tts, () => {
//         setIsSpeaking(false);
//         setStatus("idle");
//       });
//     } catch {
//       setStatus("idle");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="translator-container">
//       <div className={`status-badge ${status}`}>{status.toUpperCase()}</div>

//       {detectedLang && <div className="lang-badge">Detected: {detectedLang}</div>}

//       <h2>AI Language Translator</h2>

//       {/* STEP 1 */}
//       {step === 1 && (
//         <div className="controls">
//           <div>
//             <label>Input Language</label>
//             <select
//               value={inputLangOverride}
//               onChange={(e) => setInputLangOverride(e.target.value)}
//             >
//               <option value="auto">Auto Detect</option>
//               {LANGUAGES.map((l) => (
//                 <option key={l.code} value={l.code}>
//                   {l.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label>Target Language</label>
//             <select
//               value={targetLang}
//               onChange={(e) => setTargetLang(e.target.value)}
//             >
//               {LANGUAGES.map((l) => (
//                 <option key={l.code} value={l.code}>
//                   {l.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <button className="translate-btn" onClick={() => setStep(2)}>
//             Next
//           </button>
//         </div>
//       )}

//       {/* STEP 2 & 3 */}
//       {step >= 2 && (
//         <>
//           {/* Language Summary */}
//           <div className="lang-summary">
//             <strong>Input:</strong> {getLangLabel(inputLangOverride)} &nbsp;→&nbsp;
//             <strong>Output:</strong> {getLangLabel(targetLang)}
//           </div>

//           <div className="panel-wrapper">
//             {/* HUMAN */}
//             <div className="panel input-panel">
//               <h3><FaUser /> Human</h3>

//               <textarea
//                 placeholder="Type here..."
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//               />

//               {/* <button onClick={startListening}>
//                 <FaMicrophone /> Speak
//               </button> */}

//               <button onClick={startListening} disabled={isSpeaking}>
//                 <FaMicrophone /> Speak
//               </button>

//               {recording && (
//                 <div className="waveform real">
//                   {[...Array(10)].map((_, i) => (
//                     <span
//                       key={i}
//                       style={{
//                         height: `${dataArrayRef.current?.[i] / 2 || 10}px`,
//                       }}
//                     />
//                   ))}
//                 </div>
//               )}

//               <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
//                 <button onClick={() => setStep(step - 1)}>Previous</button>

//                 <button
//                   className="translate-btn"
//                   onClick={handleTranslate}
//                   disabled={loading}
//                 >
//                   {loading ? "Translating..." : <><FaLanguage /> Translate</>}
//                 </button>
//               </div>
//             </div>

//             {/* AI */}
//             {step === 3 && (
//               <div className="panel output-panel">
//                 {/* <div className={`ai-face ${status}`}> */}
//                 <div className={`ai-face ${isSpeaking ? "speaking" : "idle"}`}>
//                   <div className="ai-head">
//                     <div className="ai-eyes">
//                       <span className="eye left"></span>
//                       <span className="eye right"></span>
//                     </div>

//                     <div className="ai-mouth">
//                       <span></span>
//                       <span></span>
//                       <span></span>
//                     </div>
//                   </div>

//                   <p className="ai-label">AI Translator</p>
//                 </div>

//                 <p>{result}</p>

//                 <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
//                   <button onClick={() => setStep(2)}>Previous</button>

//                   {canReplay && (
//                     <button
//                       onClick={() => {
//                         const lang = LANGUAGES.find(
//                           (l) => l.code === targetLang
//                         );
//                         speakText(result, lang?.tts);
//                       }}
//                     >
//                       <FaVolumeUp /> Replay
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Translate;




















































// import { useState, useRef } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "../styles/translate.css";

// import {
//   FaMicrophone,
//   FaLanguage,
//   FaVolumeUp,
//   FaUser,
// } from "react-icons/fa";

// const Translate = () => {
//   const [step, setStep] = useState(1);

//   const [modeType, setModeType] = useState("text");
//   const [originalText, setOriginalText] = useState("");

//   const [text, setText] = useState("");
//   const [result, setResult] = useState("");

//   const [targetLang, setTargetLang] = useState("en");
//   const [inputLangOverride, setInputLangOverride] = useState("auto");

//   const [status, setStatus] = useState("idle");
//   const [loading, setLoading] = useState(false);
//   const [detectedLang, setDetectedLang] = useState(null);

//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [canReplay, setCanReplay] = useState(false);
//   const [recording, setRecording] = useState(false);

//   const [audioFile, setAudioFile] = useState(null);
//   const audioRef = useRef(null);

//   const [file, setFile] = useState(null);
//   const recognitionRef = useRef(null);

//   const LANGUAGES = [
//     { code: "en", label: "English", mic: "en-IN" },
//     { code: "hi", label: "Hindi", mic: "hi-IN" },
//     { code: "mr", label: "Marathi", mic: "mr-IN" },
//     { code: "ta", label: "Tamil", mic: "ta-IN" },
//     { code: "te", label: "Telugu", mic: "te-IN" },
//     { code: "kn", label: "Kannada", mic: "kn-IN" },
//     { code: "ml", label: "Malayalam", mic: "ml-IN" },
//     { code: "bn", label: "Bengali", mic: "bn-IN" },
//     { code: "gu", label: "Gujarati", mic: "gu-IN" },
//     { code: "pa", label: "Punjabi", mic: "pa-IN" },
//     { code: "fr", label: "French", mic: "fr-FR" },
//     { code: "es", label: "Spanish", mic: "es-ES" },
//     { code: "de", label: "German", mic: "de-DE" },
//     { code: "ar", label: "Arabic", mic: "ar-SA" },
//     { code: "zh", label: "Chinese", mic: "zh-CN" },
//     { code: "ja", label: "Japanese", mic: "ja-JP" },
//     { code: "ko", label: "Korean", mic: "ko-KR" },
//   ];

//   // const getLangLabel = (code) =>
//   //   LANGUAGES.find((l) => l.code === code)?.label || "Auto";

//   /* ================= SPEECH ================= */

//   const startListening = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       toast.error("Speech recognition not supported");
//       return;
//     }

//     setRecording(true);
//     setStatus("listening");

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;

//     if (inputLangOverride !== "auto") {
//       const selected = LANGUAGES.find((l) => l.code === inputLangOverride);
//       recognition.lang = selected?.mic;
//     }

//     recognition.onresult = (e) => {
//       setText(e.results[0][0].transcript);
//       setRecording(false);
//       setStatus("idle");
//     };

//     recognition.onerror = () => {
//       setRecording(false);
//       setStatus("idle");
//     };

//     recognition.start();
//     recognitionRef.current = recognition;
//   };

//   /* ================= PLAY AUDIO ================= */

//   const playAudio = (fileName) => {
//     if (!fileName) return;

//     const audio = new Audio(
//       `http://127.0.0.1:8000/audio/${fileName}`
//     );

//     audioRef.current = audio;
//     setIsSpeaking(true);
//     setStatus("speaking");

//     audio.play();

//     audio.onended = () => {
//       setIsSpeaking(false);
//       setStatus("idle");
//     };
//   };

//   /* ================= TEXT TRANSLATE ================= */

//   const handleTranslate = async () => {
//     if (!text.trim()) {
//       toast.error("Please enter or speak text");
//       return;
//     }

//     try {
//       setLoading(true);
//       setStatus("translating");
//       setCanReplay(false);
//       setAudioFile(null);

//       const payload = {
//         text: text,
//         targetLanguage: targetLang,
//         inputLanguage: inputLangOverride,
//         mode: "both",
//       };

//       const res = await axios.post(
//         "/api/v1/language/translate",
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       setResult(res.data.translated_text);
//       setDetectedLang(res.data.detected_language?.toUpperCase());
//       setAudioFile(res.data.audio_file);
//       setStep(3);

//       if (res.data.audio_file) {
//         setCanReplay(true);
//         playAudio(res.data.audio_file);
//       }

//     } catch (err) {
//       toast.error("Translation failed",err);
//       setStatus("idle");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= FILE TRANSLATE ================= */

//   const handleFileUpload = async () => {
//     if (!file) {
//       toast.error("Please select file");
//       return;
//     }

//     try {
//       setLoading(true);
//       setStatus("translating");

//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("targetLanguage", targetLang);

//       const res = await axios.post(
//         "/api/v1/uploadTrans/uploadFiles",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       setOriginalText(res.data.original_text);
//       setResult(res.data.translated_text);
//       setDetectedLang(res.data.detected_language?.toUpperCase());
//       setAudioFile(res.data.audio_file);
//       setStep(3);

//       if (res.data.audio_file) {
//         setCanReplay(true);
//         playAudio(res.data.audio_file);
//       }

//     } catch {
//       toast.error("Upload failed");
//       setStatus("idle");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="translator-container">

//       <div className={`status-badge ${status}`}>
//         {status.toUpperCase()}
//       </div>

//       {detectedLang && (
//         <div className="lang-badge">
//           Detected: {detectedLang}
//         </div>
//       )}

//       <h2>AI Language Translator</h2>

//       {/* MODE TOGGLE */}
//       <div className="mode-toggle">
//         <button
//           onClick={() => setModeType("text")}
//           className={modeType === "text" ? "translate-btn" : ""}
//         >
//           Text / Speak
//         </button>

//         <button
//           onClick={() => setModeType("file")}
//           className={modeType === "file" ? "translate-btn" : ""}
//         >
//           Audio / Video
//         </button>
//       </div>

//       {/* LANGUAGE CONTROLS */}
//       {step === 1 && (
//         <div className="controls">
//           {modeType === "text" && (
//             <div>
//               <label>Input Language</label>
//               <select
//                 value={inputLangOverride}
//                 onChange={(e) =>
//                   setInputLangOverride(e.target.value)
//                 }
//               >
//                 <option value="auto">Auto Detect</option>
//                 {LANGUAGES.map((l) => (
//                   <option key={l.code} value={l.code}>
//                     {l.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           <div>
//             <label>Target Language</label>
//             <select
//               value={targetLang}
//               onChange={(e) => setTargetLang(e.target.value)}
//             >
//               {LANGUAGES.map((l) => (
//                 <option key={l.code} value={l.code}>
//                   {l.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <button
//             className="translate-btn"
//             onClick={() => setStep(2)}
//           >
//             Next
//           </button>
//         </div>
//       )}

//       {step >= 2 && (
//         <div className="panel-wrapper">

//           {/* INPUT PANEL */}
//           <div className="panel input-panel">
//             <h3><FaUser /> Human</h3>

//             {modeType === "text" ? (
//               <>
//                 <textarea
//                   placeholder="Type here..."
//                   value={text}
//                   onChange={(e) => setText(e.target.value)}
//                 />

//                 <button
//                   className={`speak-btn ${recording ? "listening" : ""}`}
//                   onClick={startListening}
//                   disabled={isSpeaking}
//                 >
//                   <FaMicrophone /> Speak
//                 </button>

//                 <button
//                   className="translate-btn"
//                   onClick={handleTranslate}
//                   disabled={loading}
//                 >
//                   {loading ? "Translating..." : <><FaLanguage /> Translate</>}
//                 </button>
//               </>
//             ) : (
//               <>
//                 <input
//                   type="file"
//                   accept="audio/*,video/*"
//                   onChange={(e) => setFile(e.target.files[0])}
//                 />

//                 <button
//                   className="translate-btn"
//                   onClick={handleFileUpload}
//                   disabled={loading}
//                 >
//                   {loading ? "Processing..." : "Upload & Translate"}
//                 </button>

//                 {originalText && (
//                   <>
//                     <label style={{ marginTop: "10px" }}>
//                       Extracted Text
//                     </label>
//                     <textarea
//                       value={originalText}
//                       readOnly
//                       className="backend-textarea"
//                     />
//                   </>
//                 )}
//               </>
//             )}
//           </div>

//           {/* OUTPUT PANEL */}
//           {step === 3 && (
//             <div className="panel output-panel">
//               <h3>AI Translator</h3>

//               <textarea
//                 value={result}
//                 readOnly
//                 placeholder="Translated text will appear here..."
//               />

//               {canReplay && audioFile && (
//                 <button onClick={() => playAudio(audioFile)}>
//                   <FaVolumeUp /> Replay
//                 </button>
//               )}
//             </div>
//           )}

//         </div>
//       )}
//     </div>
//   );
// };

// export default Translate;




































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
      // 🔥 Explicitly request mic permission first
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



  /* ================= PLAY AUDIO ================= */

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

  /* ================= FILE TRANSLATE ================= */

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

  /* ================= UI ================= */

  return (
    <div className="translator-container">

      <div className={`status-badge ${status}`}>
        {status.toUpperCase()}
      </div>

      {detectedLang && (
        <div className="lang-badge">
          Detected: {detectedLang}
        </div>
      )}

      <h2>AI Language Translator</h2>

      <div className="mode-toggle">
        <button
          onClick={() => setModeType("text")}
          className={modeType === "text" ? "translate-btn" : ""}
        >
          Text / Speak
        </button>

        <button
          onClick={() => setModeType("file")}
          className={modeType === "file" ? "translate-btn" : ""}
        >
          Audio / Video
        </button>
      </div>

      {step === 1 && (
        <div className="controls">

          {modeType === "text" && (
            <div>
              <label>Input Language</label>
              <select
                value={inputLangOverride}
                onChange={(e) =>
                  setInputLangOverride(e.target.value)
                }
              >
                <option value="auto">Auto Detect</option>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
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
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="translate-btn"
            onClick={() => setStep(2)}
          >
            Next
          </button>

        </div>
      )}

      {step >= 2 && (
        <div className="panel-wrapper">

          <div className="panel input-panel">
            <h3><FaUser /> Human</h3>

            {modeType === "text" ? (
              <>
                <textarea
                  placeholder="Type here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                {/* <button
                  className={`speak-btn ${recording ? "listening" : ""}`}
                  onClick={startListening}
                  disabled={isSpeaking}
                >
                  <FaMicrophone /> Speak
                </button> */}

                <button
                  className={`speak-btn ${recording ? "listening" : ""}`}
                  onClick={startListening}
                  disabled={isSpeaking}
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
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => setFile(e.target.files[0])}
                />

                <button
                  className="translate-btn"
                  onClick={handleFileUpload}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Upload & Translate"}
                </button>

                {originalText && (
                  <>
                    <label style={{ marginTop: "10px" }}>
                      Extracted Text
                    </label>
                    <textarea
                      value={originalText}
                      readOnly
                      className="backend-textarea"
                    />
                  </>
                )}
              </>
            )}
          </div>

          {step === 3 && (
            <div className="panel output-panel">
              <h3>AI Translator</h3>

              <textarea
                value={result}
                readOnly
                placeholder="Translated text will appear here..."
              />

              {canReplay && audioFile && (
                <button onClick={() => playAudio(audioFile)}>
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