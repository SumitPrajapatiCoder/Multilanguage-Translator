import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/joinMeeting.css";

const JoinMeeting = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [language, setLanguage] = useState("en");
    const [mode, setMode] = useState("both");
    const [gender, setGender] = useState("male");

    const join = async () => {

        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }

        try {

            const cleanId = id.trim();

            const res = await axios.post(
                "/api/v1/meeting/join",
                {
                    meetingId: cleanId,
                    name,
                    language,
                    mode,
                    gender
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            navigate("/meeting", {
                state: {
                    token: res.data.token,
                    meetingId: cleanId,
                    name,
                    language,
                    mode,
                    gender
                }
            });

        } catch (err) {

            const msg = err.response?.data?.error;

            if (msg === "Meeting not started yet") {
                toast.info("Meeting has not started yet. Please join at the scheduled time.");
            } else if (msg === "Meeting already ended") {
                toast.error("This meeting has already ended.");
            } else if (msg === "Meeting not found") {
                toast.error("Invalid meeting ID.");
            } else {
                toast.error("Unable to join meeting.");
            }
        }
    };

    return (

        <div className="join-meeting-page">

            <div className="join-meeting-card">

                <h2 className="join-meeting-title">Meeting Setup</h2>

                <input
                    className="join-meeting-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />

                <select
                    className="join-meeting-select"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="kn">Kannada</option>
                    <option value="ml">Malayalam</option>
                    <option value="bn">Bengali</option>
                    <option value="gu">Gujarati</option>
                    <option value="pa">Punjabi</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                    <option value="ar">Arabic</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                </select>

                <select
                    className="join-meeting-select"
                    value={mode}
                    onChange={e => setMode(e.target.value)}
                >
                    <option value="text">Text Translation</option>
                    <option value="audio">Audio Translation</option>
                    <option value="both">Text + Audio</option>
                </select>

                <select
                    className="join-meeting-select"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                >
                    <option value="male">Male Voice</option>
                    <option value="female">Female Voice</option>
                </select>

                <button
                    className="join-meeting-button"
                    onClick={join}
                >
                    Join Meeting
                </button>

            </div>

        </div>

    );
};

export default JoinMeeting;