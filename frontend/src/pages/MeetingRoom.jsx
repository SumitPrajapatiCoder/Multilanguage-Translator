import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Room, createLocalTracks } from "livekit-client";
import socket from "../services/socket";
import api from "../api";
import defaultAvatar from "../assets/default-avatar.png";
import "../styles/meetingRoom.css";

import ParticipantVideo from "../components/VideoTrack";

import {
    FaMicrophone,
    FaMicrophoneSlash,
    FaVideo,
    FaVideoSlash,
    FaVolumeUp,
    FaUser
} from "react-icons/fa";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";



const MeetingRoom = () => {

    const { state } = useLocation();
    const navigate = useNavigate();

    const { meetingId, name, language, mode, gender } = state;

    const localVideoRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);

    const lastTextRef = useRef("");
    const lastSentTimeRef = useRef(0);

    const [room, setRoom] = useState(null);
    const [localTracks, setLocalTracks] = useState([]);

    const [remoteParticipants, setRemoteParticipants] = useState([]);
    const [activeSpeaker, setActiveSpeaker] = useState(null);

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    const [micText, setMicText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [audioUrl, setAudioUrl] = useState(null);

    const [participants, setParticipants] = useState([]);

    const MySwal = withReactContent(Swal);
    const hasConnectedRef = useRef(false);


    const [showAll, setShowAll] = useState(false);
    const MAX_VISIBLE = 3;

    const LANG_MAP = {
        en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil",
        te: "Telugu", kn: "Kannada", ml: "Malayalam",
        bn: "Bengali", gu: "Gujarati", pa: "Punjabi",
        fr: "French", es: "Spanish", de: "German",
        ar: "Arabic", zh: "Chinese", ja: "Japanese", ko: "Korean"
    };

    const LANG_CODE = {
        en: "en-US", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN",
        te: "te-IN", kn: "kn-IN", ml: "ml-IN",
        bn: "bn-IN", gu: "gu-IN", pa: "pa-IN",
        fr: "fr-FR", es: "es-ES", de: "de-DE",
        ar: "ar-SA", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR"
    };

    const handleTranslation = (msg) => {

        setTranslatedText(msg.text);
        setAudioUrl(msg.audio);

        if ((mode === "audio" || mode === "both") && msg.audio && audioRef.current) {

            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            audioRef.current.src = msg.audio;

            audioRef.current.play().catch(() => {
                console.log("Autoplay blocked");
            });
        }
    };

    const startSpeech = async () => {

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            console.warn("Mic permission denied");
            return;
        }

        const rec = new SpeechRecognition();

        rec.lang = LANG_CODE[language] || "en-US";
        rec.continuous = true;
        rec.interimResults = false;

        rec.onresult = (e) => {

            const text = e.results[e.results.length - 1][0].transcript.trim();
            const now = Date.now();

            if (!text) return;
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
                micOn ? track.mute() : track.unmute();
            }
        });

        if (micOn) recognitionRef.current?.stop();
        else startSpeech();

        setMicOn(!micOn);
    };

    const toggleCamera = () => {

        localTracks.forEach(track => {
            if (track.kind === "video") {
                camOn ? track.disable() : track.enable();
            }
        });

        setCamOn(!camOn);
    };

    const leaveMeeting = async () => {

        const result = await MySwal.fire({
            title: "Leave meeting?",
            icon: "warning",
            showCancelButton: true
        });

        if (!result.isConfirmed) return;

        recognitionRef.current?.stop();
        room?.disconnect();
        navigate("/home");
    };

    useEffect(() => {
        if (hasConnectedRef.current) return;
        hasConnectedRef.current = true;

        let interval;

        const connectRoom = async () => {
            try {

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    await localVideoRef.current.play();
                }

                const r = new Room();

                const livekitToken =
                    state?.lkToken ||
                    localStorage.getItem("lk_token");

                await r.connect(import.meta.env.VITE_LIVEKIT_URL, livekitToken);

                setRemoteParticipants(Array.from(r.remoteParticipants.values()));

                r.on("participantConnected", (p) => {
                    setRemoteParticipants(prev => [...prev, p]);
                });

                r.on("participantDisconnected", (p) => {
                    setRemoteParticipants(prev => prev.filter(x => x.sid !== p.sid));
                });

                r.on("activeSpeakersChanged", (speakers) => {
                    setActiveSpeaker(speakers[0]?.sid || null);
                });

                const tracks = await createLocalTracks({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    },
                    video: true
                });

                tracks.forEach(track => {
                    r.localParticipant.publishTrack(track);
                    if (track.kind === "video") {
                        track.attach(localVideoRef.current);
                    }
                });

                setLocalTracks(tracks);
                setRoom(r);

            } catch (err) {
                console.error("LiveKit error:", err);
            }
        };
        const checkMeeting = async () => {
            try {
                const res = await api.get(`/api/v1/meeting/status/${meetingId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });

                if (res.data.status === "ended") {
                    await MySwal.fire("Meeting Ended");
                    navigate("/home");
                    return false;
                }

                if (res.data.status === "not_started") {
                    await MySwal.fire("Meeting Not Started");
                    navigate("/home");
                    return false;
                }

                return true;

            } catch {
                navigate("/home");
                return false;
            }
        };

        const init = async () => {

            const allowed = await checkMeeting();
            if (!allowed) return;

            await connectRoom();

            socket.emit("join-room", { meetingId, name, language, mode, gender });

            socket.on("participants-update", setParticipants);
            socket.on("translated-text", handleTranslation);

            startSpeech();
        };

        init();

        interval = setInterval(async () => {
            try {
                const res = await api.get(`/api/v1/meeting/status/${meetingId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });

                if (res.data.status === "ended") {
                    room?.disconnect();
                    navigate("/home");
                }
            } catch { }
        }, 10000);

        return () => {
            clearInterval(interval);
            socket.off("translated-text", handleTranslation);
            socket.off("participants-update");
            recognitionRef.current?.stop();
            room?.disconnect();
        };

    }, []);


    return (
        <div className="meeting-room-page">

            <h2 className="meeting-room-title">Meeting Room</h2>

            <div className="meeting-room-user">
                <FaUser /> {name} | {LANG_MAP[language]} | {gender}
            </div>

            <div className="video-grid">

                <div className={`video-wrapper ${activeSpeaker === room?.localParticipant?.sid ? "active-speaker" : ""}`}>
                    {camOn ? (
                        <video ref={localVideoRef} autoPlay muted className="video-box" />
                    ) : (
                        <div className="avatar-box">
                            <img src={defaultAvatar} className="avatar-img" />
                            <div>{name}</div>
                        </div>
                    )}
                </div>

                {remoteParticipants.map(p => (
                    <ParticipantVideo key={p.sid} participant={p} />
                ))}
            </div>

            <div className="mic-box">
                <b>Mic Preview:</b> {micText}
            </div>

            <div className="translation-box">
                <b>Translation:</b> {translatedText}
            </div>

            {/* <div className="participants-box">
                <h3>Participants ({participants.length})</h3>
                {participants.map((p, i) => (
                    <div key={i}>
                        👤 {p.name} — 🌐 {LANG_MAP[p.language]}
                    </div>
                ))}
            </div> */}

            <div className="participants-box">
                <h3>Participants ({participants.length})</h3>

                {(showAll ? participants : participants.slice(0, MAX_VISIBLE)).map((p, i) => (
                    <div key={i}>
                        👤 {p.name} — 🌐 {LANG_MAP[p.language]}
                    </div>
                ))}

                {participants.length > MAX_VISIBLE && (
                    <button
                        className="view-more-btn"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? "Show Less ▲" : "View More ▼"}
                    </button>
                )}
            </div>

            <div className="controls">

                <button className="control-btn" onClick={toggleMic}>
                    {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    {micOn ? "Mic On" : "Mic Off"}
                </button>

                <button className="control-btn" onClick={toggleCamera}>
                    {camOn ? <FaVideo /> : <FaVideoSlash />}
                    {camOn ? "Camera On" : "Camera Off"}
                </button>

                <button className="control-btn leave-btn" onClick={leaveMeeting}>
                    Leave
                </button>

                {audioUrl && (
                    <button
                        className="control-btn"
                        onClick={() => {
                            if (audioRef.current) {
                                audioRef.current.src = audioUrl;
                                audioRef.current.play();
                            }
                        }}
                    >
                        <FaVolumeUp /> Play Translation
                    </button>
                )}

                <audio ref={audioRef} />

            </div>

        </div>
    );
};

export default MeetingRoom;