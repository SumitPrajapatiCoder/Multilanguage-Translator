import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/joinById.css";

const JoinById = () => {

    const [meetingId, setMeetingId] = useState("");
    const navigate = useNavigate();

    const join = () => {
        if (!meetingId.trim()) return;
        navigate(`/join/${meetingId}`);
    };

    return (

        <div className="join-page">

            <div className="join-card">

                <h2 className="join-title">Join a Meeting</h2>

                <p className="join-subtitle">
                    Enter the meeting ID Provided by the host to join the meeting
                </p>

                <input
                    className="join-input"
                    placeholder="Enter Meeting ID"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                />

                <button
                    className="join-button"
                    onClick={join}
                >
                    Join Meeting
                </button>

            </div>

        </div>

    );
};

export default JoinById;