import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const JoinMeeting = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [language, setLanguage] = useState("en");
    const [mode, setMode] = useState("both");

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
                    mode
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
                    mode
                }
            });

        } catch (err) {

            const msg = err.response?.data?.error;

            if (msg === "Meeting not started yet") {
                toast.info("Meeting has not started yet. Please join at the scheduled time.");
            }

            else if (msg === "Meeting already ended") {
                toast.error("This meeting has already ended.");
            }

            else if (msg === "Meeting not found") {
                toast.error("Invalid meeting ID.");
            }

            else {
                toast.error("Unable to join meeting.");
            }

        }

    };

    return (

        <div style={styles.page}>

            <div style={styles.card}>

                <h2 style={styles.title}>Join Meeting</h2>

                <input
                    style={styles.input}
                    placeholder="Enter your name"
                    onChange={e => setName(e.target.value)}
                />

                <select
                    style={styles.select}
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
                    style={styles.select}
                    onChange={e => setMode(e.target.value)}
                >
                    <option value="text">Text Translation</option>
                    <option value="audio">Audio Translation</option>
                    <option value="both">Text + Audio</option>
                </select>

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
        width: "350px",
        padding: "40px",
        borderRadius: "14px",
        background: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },

    title: {
        textAlign: "center",
        marginBottom: "10px"
    },

    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "14px"
    },

    select: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "14px",
        cursor: "pointer"
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
        transition: "0.3s"
    }

};

export default JoinMeeting;