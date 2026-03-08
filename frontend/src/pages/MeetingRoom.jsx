import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Room, createLocalTracks } from "livekit-client";
import socket from "../services/socket";
import axios from "axios";

import {
    FaMicrophone,
    FaMicrophoneSlash,
    FaVideo,
    FaVideoSlash,
    FaVolumeUp,
    FaUser
} from "react-icons/fa";

const LANG_MAP = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    ta: "Tamil",
    te: "Telugu",
    kn: "Kannada",
    ml: "Malayalam",
    bn: "Bengali",
    gu: "Gujarati",
    pa: "Punjabi",
    fr: "French",
    es: "Spanish",
    de: "German",
    ar: "Arabic",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean"
};

const MeetingRoom = () => {

    const { state } = useLocation();
    const navigate = useNavigate();

    const { token, meetingId, name, language, mode } = state;

    const localVideoRef = useRef(null);
    const videoGridRef = useRef(null);
    const recognitionRef = useRef(null);

    const lastTextRef = useRef("");
    const lastSentTimeRef = useRef(0);

    const [room, setRoom] = useState(null);
    const [localTracks, setLocalTracks] = useState([]);

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    const [micText, setMicText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [audioUrl, setAudioUrl] = useState(null);

    const [participants, setParticipants] = useState([]);

    useEffect(() => {

        let interval;

        const connectRoom = async () => {

            try {

                const r = new Room();

                await r.connect(
                    import.meta.env.VITE_LIVEKIT_URL,
                    token
                );

                const tracks = await createLocalTracks({
                    audio: true,
                    video: true
                });

                tracks.forEach(track => {

                    r.localParticipant.publishTrack(track);

                    if (track.kind === "video" && localVideoRef.current) {
                        track.attach(localVideoRef.current);
                    }

                });

                r.on("trackSubscribed", (track) => {

                    if (track.kind === "video") {

                        const video = document.createElement("video");

                        video.autoplay = true;
                        video.playsInline = true;
                        video.style.width = "300px";
                        video.style.height = "220px";
                        video.style.borderRadius = "12px";
                        video.style.objectFit = "cover";
                        video.style.background = "black";
                        video.style.boxShadow = "0 8px 25px rgba(0,0,0,0.6)";

                        track.attach(video);

                        videoGridRef.current.appendChild(video);
                    }

                });

                r.on("trackUnsubscribed", (track) => {
                    track.detach();
                });

                setLocalTracks(tracks);
                setRoom(r);

            } catch (err) {
                console.error("LiveKit connection error:", err);
            }

        };

        const checkMeeting = async () => {

            try {

                const res = await axios.get(
                    `/api/v1/meeting/status/${meetingId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                if (res.data.status === "ended") {

                    alert("Meeting has ended");

                    navigate("/home");

                    return false;
                }

                if (res.data.status === "not_started") {

                    alert("Meeting has not started yet");

                    navigate("/home");

                    return false;
                }

                return true;

            } catch {

                alert("Unable to verify meeting");

                navigate("/home");

                return false;
            }

        };

        const init = async () => {

            const allowed = await checkMeeting();

            if (!allowed) return;

            await connectRoom();

            socket.emit("join-room", {
                meetingId,
                name,
                language,
                mode
            });

            socket.on("participants-update", (data) => {
                setParticipants(data);
            });

            socket.on("translated-text", handleTranslation);

            startSpeech();

        };

        init();

        interval = setInterval(async () => {

            try {

                const res = await axios.get(
                    `/api/v1/meeting/status/${meetingId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                if (res.data.status === "ended") {

                    alert("Meeting ended");

                    if (room) room.disconnect();

                    navigate("/home");
                }

            } catch (err) {
                console.error("Status check error:", err);
            }

        }, 10000);

        return () => {

            clearInterval(interval);

            socket.off("translated-text", handleTranslation);
            socket.off("participants-update");

            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }

            if (room) {
                room.disconnect();
            }

        };

    }, []);

    const handleTranslation = (msg) => {

        setTranslatedText(msg.text);
        setAudioUrl(msg.audio);

        if (mode !== "text" && msg.audio) {

            const audio = new Audio(msg.audio);

            audio.play().catch(() => {
                console.log("Autoplay blocked");
            });

        }

    };

    const startSpeech = async () => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            console.warn("Mic permission denied");
            return;
        }

        const rec = new SpeechRecognition();

        rec.lang = language + "-IN";
        rec.continuous = true;
        rec.interimResults = false;

        rec.onresult = (e) => {

            const text =
                e.results[e.results.length - 1][0].transcript.trim();

            const now = Date.now();

            if (text === lastTextRef.current) return;
            if (now - lastSentTimeRef.current < 1500) return;

            lastTextRef.current = text;
            lastSentTimeRef.current = now;

            setMicText(text);

            socket.emit("speech-text", {
                meetingId,
                text,
                language
            });

        };

        rec.start();

        recognitionRef.current = rec;

    };

    const toggleMic = () => {

        localTracks.forEach(track => {
            if (track.kind === "audio") {
                track.enabled = !micOn;
            }
        });

        setMicOn(!micOn);

    };

    const toggleCamera = () => {

        localTracks.forEach(track => {
            if (track.kind === "video") {
                track.enabled = !camOn;
            }
        });

        setCamOn(!camOn);

    };

    const leaveMeeting = () => {

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        if (room) {
            room.disconnect();
        }

        navigate("/home");

    };

    return (

        <div style={{
            height: "100vh",
            background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
            color: "white",
            padding: "20px",
            fontFamily: "sans-serif"
        }}>

            <h2 style={{ textAlign: "center", letterSpacing: "1px" }}>Meeting Room</h2>

            <div style={{
                textAlign: "center",
                marginBottom: "15px",
                fontSize: "16px",
                opacity: 0.9
            }}>
                <FaUser /> {name} | 🌐 {LANG_MAP[language]}
            </div>

            <div
                ref={videoGridRef}
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,300px)",
                    gap: "15px",
                    justifyContent: "center",
                    marginTop: "20px"
                }}
            >

                <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                        width: "300px",
                        height: "220px",
                        borderRadius: "12px",
                        objectFit: "cover",
                        background: "black",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.6)"
                    }}
                />

            </div>

            <div style={{
                textAlign: "center",
                marginTop: "20px",
                padding: "10px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "10px"
            }}>
                <b>Mic Preview:</b> {micText}
            </div>

            <div style={{
                textAlign: "center",
                marginTop: "10px",
                color: "#00ffc8",
                padding: "10px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "10px"
            }}>
                <b>Translation:</b> {translatedText}
            </div>

            <div style={{
                marginTop: "20px",
                textAlign: "center",
                padding: "10px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "10px"
            }}>

                <h3>Participants</h3>

                {participants.map((p, i) => (
                    <div key={i}>
                        👤 {p.name} — 🌐 {LANG_MAP[p.language]}
                    </div>
                ))}

            </div>

            <div
                style={{
                    position: "fixed",
                    bottom: "25px",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px"
                }}
            >

                <button style={btnStyle} onClick={toggleMic}>
                    {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />} {micOn ? "Mic On" : "Mic Off"}
                </button>

                <button style={btnStyle} onClick={toggleCamera}>
                    {camOn ? <FaVideo /> : <FaVideoSlash />} {camOn ? "Camera On" : "Camera Off"}
                </button>

                <button
                    onClick={leaveMeeting}
                    style={{ ...btnStyle, background: "#ff4d4d" }}
                >
                    Leave
                </button>

                {audioUrl && (
                    <button
                        style={btnStyle}
                        onClick={() => {
                            const audio = new Audio(audioUrl);
                            audio.play();
                        }}
                    >
                        <FaVolumeUp /> Play Translation
                    </button>
                )}

            </div>

        </div>

    );

};

const btnStyle = {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
};

export default MeetingRoom;
