import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinById = () => {

    const [meetingId, setMeetingId] = useState("");
    const navigate = useNavigate();

    const join = () => {

        if (!meetingId.trim()) return;

        navigate(`/join/${meetingId}`);

    };

    return (

        <div style={styles.page}>

            <div style={styles.card}>

                <h2 style={styles.title}>Join a Meeting</h2>

                <p style={styles.subtitle}>
                    Enter the meeting ID
                </p>

                <input
                    style={styles.input}
                    placeholder="Enter Meeting ID"
                    onChange={(e) => setMeetingId(e.target.value)}
                />

                <button
                    style={styles.button}
                    onClick={join}
                >
                    Join Meeting
                </button>

            </div>

        </div>

    );

};


const styles = {

    page: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        fontFamily: "sans-serif"
    },

    card: {
        width: "360px",
        padding: "40px",
        borderRadius: "14px",
        background: "white",
        boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        textAlign: "center"
    },

    title: {
        marginBottom: "5px"
    },

    subtitle: {
        fontSize: "14px",
        color: "#666",
        marginBottom: "10px"
    },

    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "14px"
    },

    button: {
        marginTop: "10px",
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        background: "#4f46e5",
        color: "white",
        fontWeight: "bold",
        fontSize: "15px",
        cursor: "pointer",
        transition: "all 0.3s ease"
    }

};

export default JoinById;