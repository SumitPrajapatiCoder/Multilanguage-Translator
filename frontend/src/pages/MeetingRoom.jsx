// import { useEffect, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Room, createLocalTracks } from "livekit-client";
// import socket from "../services/socket";
// import axios from "axios";
// import defaultAvatar from "../assets/default-avatar.png";
// import "../styles/meetingRoom.css";

// import {
//     FaMicrophone,
//     FaMicrophoneSlash,
//     FaVideo,
//     FaVideoSlash,
//     FaVolumeUp,
//     FaUser
// } from "react-icons/fa";

// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";

// const LANG_MAP = {
//     en: "English",
//     hi: "Hindi",
//     mr: "Marathi",
//     ta: "Tamil",
//     te: "Telugu",
//     kn: "Kannada",
//     ml: "Malayalam",
//     bn: "Bengali",
//     gu: "Gujarati",
//     pa: "Punjabi",
//     fr: "French",
//     es: "Spanish",
//     de: "German",
//     ar: "Arabic",
//     zh: "Chinese",
//     ja: "Japanese",
//     ko: "Korean"
// };

// const MeetingRoom = () => {

//     const { state } = useLocation();
//     const navigate = useNavigate();

//     const { token, meetingId, name, language, mode, gender } = state;

//     const localVideoRef = useRef(null);
//     const videoGridRef = useRef(null);
//     const recognitionRef = useRef(null);

//     const lastTextRef = useRef("");
//     const lastSentTimeRef = useRef(0);

//     const [room, setRoom] = useState(null);
//     const [localTracks, setLocalTracks] = useState([]);

//     const [micOn, setMicOn] = useState(true);
//     const [camOn, setCamOn] = useState(true);

//     const [micText, setMicText] = useState("");
//     const [translatedText, setTranslatedText] = useState("");
//     const [audioUrl, setAudioUrl] = useState(null);

//     const [participants, setParticipants] = useState([]);
    

//     const MySwal = withReactContent(Swal);

//     useEffect(() => {

//         let interval;

//         const connectRoom = async () => {

//             try {

//                 const stream = await navigator.mediaDevices.getUserMedia({
//                     video: true,
//                     audio: true
//                 });

//                 if (localVideoRef.current) {
//                     localVideoRef.current.srcObject = stream;
//                     await localVideoRef.current.play();
//                 }

               
//                 const r = new Room();

//                 await r.connect(
//                     import.meta.env.VITE_LIVEKIT_URL,
//                     token
//                 );

//                 const tracks = await createLocalTracks({
//                     audio: true,
//                     video: true
//                 });

//                 tracks.forEach(track => {

//                     r.localParticipant.publishTrack(track);

//                     if (track.kind === "video" && localVideoRef.current) {
//                         track.attach(localVideoRef.current);
//                     }

//                 });

//                 r.on("trackSubscribed", (track) => {

//                     if (track.kind === "video") {

//                         const video = document.createElement("video");

//                         video.autoplay = true;
//                         video.playsInline = true;
//                         video.style.width = "300px";
//                         video.style.height = "220px";
//                         video.style.borderRadius = "12px";
//                         video.style.objectFit = "cover";
//                         video.style.background = "black";
//                         video.style.boxShadow = "0 8px 25px rgba(0,0,0,0.6)";

//                         track.attach(video);

//                         videoGridRef.current.appendChild(video);
//                     }

//                 });

//                 r.on("trackUnsubscribed", (track) => {
//                     track.detach();
//                 });

//                 setLocalTracks(tracks);

//                 setRoom(r);

//             } catch (err) {
//                 console.error("LiveKit connection error:", err);
//             }

//         };



//         const checkMeeting = async () => {

//             try {

//                 const res = await axios.get(
//                     `/api/v1/meeting/status/${meetingId}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${localStorage.getItem("token")}`
//                         }
//                     }
//                 );

//                 if (res.data.status === "ended") {

//                     await MySwal.fire({
//                         icon: "info",
//                         title: "Meeting Ended",
//                         text: "This meeting has already ended.",
//                         confirmButtonText: "Go Home"
//                     });

//                     navigate("/home");

//                     return false;
//                 }

//                 if (res.data.status === "not_started") {

//                     await MySwal.fire({
//                         icon: "warning",
//                         title: "Meeting Not Started",
//                         text: "The meeting host has not started the meeting yet.",
//                         confirmButtonText: "Go Home"
//                     });

//                     navigate("/home");

//                     return false;
//                 }

//                 return true;

//             } catch {

//                 await MySwal.fire({
//                     icon: "error",
//                     title: "Connection Error",
//                     text: "Unable to verify meeting status.",
//                     confirmButtonText: "Go Home"
//                 });

//                 navigate("/home");

//                 return false;
//             }

//         };

//         const init = async () => {

//             const allowed = await checkMeeting();

//             if (!allowed) return;

//             await connectRoom();

//             socket.emit("join-room", {
//                 meetingId,
//                 name,
//                 language,
//                 mode,
//                 gender
//             });

//             socket.on("participants-update", (data) => {
//                 setParticipants(data);
//             });

//             socket.on("translated-text", handleTranslation);

//             startSpeech();

//         };

//         init();

//         interval = setInterval(async () => {

//             try {

//                 const res = await axios.get(
//                     `/api/v1/meeting/status/${meetingId}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${localStorage.getItem("token")}`
//                         }
//                     }
//                 );

//                 if (res.data.status === "ended") {

//                     await MySwal.fire({
//                         icon: "info",
//                         title: "Meeting Ended",
//                         text: "The host has ended this meeting.",
//                         confirmButtonText: "OK"
//                     });

//                     if (room) room.disconnect();

//                     navigate("/home");
//                 }

//             } catch (err) {
//                 console.error("Status check error:", err);
//             }

//         }, 10000);

//         return () => {

//             clearInterval(interval);

//             socket.off("translated-text", handleTranslation);
//             socket.off("participants-update");

//             if (recognitionRef.current) {
//                 recognitionRef.current.stop();
//             }

//             if (room) {
//                 room.disconnect();
//             }

//         };

//     }, []);

    
//     const handleTranslation = (msg) => {

//         setTranslatedText(msg.text);
//         setAudioUrl(msg.audio);

//         console.log("Speaker:", msg.speakerId);

//         if ((mode === "audio" || mode === "both") && msg.audio) {

//             const audio = new Audio(msg.audio);

//             audio.play().catch(() => {
//                 console.log("Autoplay blocked");
//             });
//         }
//     };

//     const startSpeech = async () => {

//         const SpeechRecognition =
//             window.SpeechRecognition ||
//             window.webkitSpeechRecognition;

//         if (!SpeechRecognition) return;

//         try {
//             await navigator.mediaDevices.getUserMedia({ audio: true });
//         } catch {
//             console.warn("Mic permission denied");
//             return;
//         }

//         const rec = new SpeechRecognition();

//         rec.lang = language + "-IN";
//         rec.continuous = true;
//         rec.interimResults = false;

//         rec.onresult = (e) => {

//             const text =
//                 e.results[e.results.length - 1][0].transcript.trim();

//             const now = Date.now();

//             if (text === lastTextRef.current) return;
//             if (now - lastSentTimeRef.current < 1500) return;

//             lastTextRef.current = text;
//             lastSentTimeRef.current = now;

//             setMicText(text);

//             socket.emit("speech-text", {
//                 meetingId,
//                 text,
//                 language
//             });

//         };

//         rec.start();

//         recognitionRef.current = rec;

//     };




//     const toggleMic = () => {

//         localTracks.forEach(track => {

//             if (track.kind === "audio") {

//                 if (micOn) {
//                     track.mute();
//                 } else {
//                     track.unmute();
//                 }

//             }

//         });

//         if (micOn) {
//             if (recognitionRef.current) {
//                 recognitionRef.current.stop();
//             }
//         }
//         else {
//             startSpeech();
//         }

//         setMicOn(!micOn);

//     };


//     const toggleCamera = () => {

//         localTracks.forEach(track => {

//             if (track.kind === "video") {

//                 if (camOn) {

//                     track.disable();

//                     if (localVideoRef.current) {
//                         track.detach(localVideoRef.current);
//                         localVideoRef.current.srcObject = null;
//                     }

//                 } else {

//                     track.enable();

//                     if (localVideoRef.current) {
//                         track.attach(localVideoRef.current);
//                     }

//                 }

//             }

//         });

//         setCamOn(!camOn);

//     };


//     const leaveMeeting = async () => {

//         const result = await MySwal.fire({
//             title: "Leave meeting?",
//             text: "You will exit the meeting room.",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonText: "Leave",
//             cancelButtonText: "Stay"
//         });

//         if (!result.isConfirmed) return;

//         if (recognitionRef.current) {
//             recognitionRef.current.stop();
//         }

//         if (room) {
//             room.disconnect();
//         }

//         navigate("/home");

//     };

//     return (

//         <div className="meeting-room-page">

//             <h2 className="meeting-room-title">Meeting Room</h2>

//             <div className="meeting-room-user">
//                 <FaUser /> {name} | {LANG_MAP[language]} | {gender.charAt(0).toUpperCase() + gender.slice(1)}
//             </div>

//             <div ref={videoGridRef} className="video-grid">

//                 {
//                     camOn ? (
//                         <video
//                             ref={localVideoRef}
//                             autoPlay
//                             muted
//                             playsInline
//                             className="video-box"
//                         />
//                     ) : (
//                         <div className="avatar-box">
//                             <img src={defaultAvatar} alt="avatar" className="avatar-img" />
//                             <div>{name}</div>
//                         </div>
//                     )
//                 }

//             </div>

//             {(mode === "text" || mode === "both") && (
//                 <div className="mic-box">
//                     <b>Mic Preview:</b> {micText}
//                 </div>
//             )}

//             {(mode === "text" || mode === "both") && (
//                 <div className="translation-box">
//                     <b>Translation:</b> {translatedText}
//                 </div>
//             )}

//             <div className="participants-box">
//                 <h3>Participants</h3>

//                 {participants.map((p, i) => (
//                     <div key={i}>
//                         👤 {p.name} — 🌐 {LANG_MAP[p.language]}
//                     </div>
//                 ))}
//             </div>

//             <div className="controls">

//                 <button className="control-btn" onClick={toggleMic}>
//                     {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
//                     {micOn ? "Mic On" : "Mic Off"}
//                 </button>

//                 <button className="control-btn" onClick={toggleCamera}>
//                     {camOn ? <FaVideo /> : <FaVideoSlash />}
//                     {camOn ? "Camera On" : "Camera Off"}
//                 </button>

//                 <button className="control-btn leave-btn" onClick={leaveMeeting}>
//                     Leave
//                 </button>

//                 {audioUrl && (mode === "audio" || mode === "both") && (
//                     <button
//                         className="control-btn"
//                         onClick={() => {
//                             const audio = new Audio(audioUrl);
//                             audio.play();
//                         }}
//                     >
//                         <FaVolumeUp /> Play Translation
//                     </button>
//                 )}

//             </div>

//         </div>

//     );

// };

// export default MeetingRoom;

































import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Room, createLocalTracks } from "livekit-client";
import socket from "../services/socket";
import axios from "axios";
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

const LANG_MAP = {
    en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil",
    te: "Telugu", kn: "Kannada", ml: "Malayalam",
    bn: "Bengali", gu: "Gujarati", pa: "Punjabi",
    fr: "French", es: "Spanish", de: "German",
    ar: "Arabic", zh: "Chinese", ja: "Japanese", ko: "Korean"
};

const MeetingRoom = () => {

    const { state } = useLocation();
    const navigate = useNavigate();

    const {  meetingId, name, language, mode, gender } = state;

    const localVideoRef = useRef(null);
    const recognitionRef = useRef(null);

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

    useEffect(() => {

        let interval;

        const connectRoom = async () => {

            try {

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    await localVideoRef.current.play();
                }

                const r = new Room();


                const livekitToken =
                    state?.lkToken ||
                    localStorage.getItem("lk_token");

                console.log("LIVEKIT TOKEN:", livekitToken);


                await r.connect(
                    import.meta.env.VITE_LIVEKIT_URL, livekitToken,
                );
                

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

                const tracks = await createLocalTracks({ audio: true, video: true });

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
                const res = await axios.get(`/api/v1/meeting/status/${meetingId}`, {
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
                const res = await axios.get(`/api/v1/meeting/status/${meetingId}`);
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

    const handleTranslation = (msg) => {

        setTranslatedText(msg.text);
        setAudioUrl(msg.audio);

        if ((mode === "audio" || mode === "both") && msg.audio) {
            new Audio(msg.audio).play().catch(() => { });
        }
    };

    const startSpeech = async () => {

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const rec = new SpeechRecognition();
        rec.lang = language + "-IN";
        rec.continuous = true;

        // rec.onresult = (e) => {

        //     const text = e.results[e.results.length - 1][0].transcript.trim();
        //     const now = Date.now();

        //     if (text === lastTextRef.current) return;
        //     if (now - lastSentTimeRef.current < 1500) return;

        //     lastTextRef.current = text;
        //     lastSentTimeRef.current = now;

        //     setMicText(text);

        //     socket.emit("speech-text", { meetingId, text, language });
        // };


        rec.onresult = (e) => {

            const result = e.results[e.results.length - 1];

            if (!result.isFinal) return; // 🔥 VERY IMPORTANT

            const text = result[0].transcript.trim();
            const now = Date.now();

            const cleanText = text.toLowerCase().replace(/[^\w\s]/g, "").trim();

            if (cleanText.length < 2) return;
            if (cleanText === lastTextRef.current) return;
            if (now - lastSentTimeRef.current < 2000) return;

            lastTextRef.current = cleanText;
            lastSentTimeRef.current = now;

            setMicText(text);

            socket.emit("speech-text", {
                meetingId,
                text: cleanText,
                language
            });
        };

        rec.start();
        recognitionRef.current = rec;
    };

    // ✅ ORIGINAL LOGIC RESTORED
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

    return (

        <div className="meeting-room-page">

            <h2 className="meeting-room-title">Meeting Room</h2>

            <div className="meeting-room-user">
                <FaUser /> {name} | {LANG_MAP[language]} | {gender}
            </div>

            <div className="video-grid">

                {/* LOCAL */}
                <div className={`video-wrapper ${activeSpeaker === room?.localParticipant?.sid ? "active-speaker" : ""}`}>
                    {camOn ? (
                        <video ref={localVideoRef} autoPlay muted className="video-box" />
                    ) : (
                        <div className="avatar-box">
                            <img src={defaultAvatar} className="avatar-img" />
                            <div>{name}</div>
                        </div>
                    )}
                    <div className="name-label">{name}</div>
                </div>

                {/* REMOTE */}
                {remoteParticipants.map(p => (
                    <ParticipantVideo
                        key={p.sid}
                        participant={p}
                        isActive={p.sid === activeSpeaker}
                    />
                ))}

            </div>

            {(mode === "text" || mode === "both") && (
                <div className="mic-box">
                    <b>Mic Preview:</b> {micText}
                </div>
            )}

            {(mode === "text" || mode === "both") && (
                <div className="translation-box">
                    <b>Translation:</b> {translatedText}
                </div>
            )}

            <div className="participants-box">
                <h3>Participants</h3>
                {participants.map((p, i) => (
                    <div key={i}>
                        👤 {p.name} — 🌐 {LANG_MAP[p.language]}
                    </div>
                ))}
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

                {audioUrl && (mode === "audio" || mode === "both") && (
                    <button
                        className="control-btn"
                        onClick={() => new Audio(audioUrl).play()}
                    >
                        <FaVolumeUp /> Play Translation
                    </button>
                )}

            </div>

        </div>
    );
};

export default MeetingRoom;