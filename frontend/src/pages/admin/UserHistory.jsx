import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/Userhistory.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useParams, useNavigate } from "react-router-dom";

const MySwal = withReactContent(Swal);

const UserHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `/api/v1/admin/user-history/${id}`,
                config
            );

            setHistory(res.data.data);
        } catch (error) {
            toast.error("Failed to load history");

            if (error.response?.status === 401) {
                localStorage.clear();
                window.location.href = "/";
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (historyId) => {
        const result = await MySwal.fire({
            title: "Delete this history?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(
                `/api/v1/history/delete_history/${historyId}`,
                config
            );

            MySwal.fire("Deleted!", "History removed", "success");

            toast.success("Deleted successfully");

            setHistory((prev) =>
                prev.filter((item) => item._id !== historyId)
            );
        } catch (error) {
            toast.error("Delete failed");

            MySwal.fire("Error", "Failed to delete history", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [id]);

    return (
        <div className="history-container">

            <button
                className="back-btn"
                onClick={() => navigate("/admin/users")}
            >
                 Back to Users
            </button>

            <h2>User Translation History</h2>

            {loading ? (
                <p>Loading...</p>
            ) : history.length === 0 ? (
                <p>No history found</p>
            ) : (
                history.map((item) => (
                    <div key={item._id} className="history-card">

                        <div className="history-section">
                            <h4>Original</h4>
                            <p>{item.originalText || "—"}</p>
                        </div>

                        <div className="history-section">
                            <h4>Translated</h4>
                            <p>{item.translatedText}</p>
                        </div>

                        <div className="history-meta">
                            <span>
                                {item.detectedLanguage?.toUpperCase()} →{" "}
                                {item.targetLanguage?.toUpperCase()}
                            </span>
                            <span>
                                {new Date(item.createdAt).toLocaleString()}
                            </span>
                        </div>

                        {item.audioUrl && (
                            <div className="history-audio">
                                <audio controls src={item.audioUrl}></audio>
                            </div>
                        )}

                        {item.originalFileUrl && (
                            <div className="history-file">
                                <a
                                    href={item.originalFileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    View Original File
                                </a>
                            </div>
                        )}

                        <button
                            className="delete-btn"
                            onClick={() => handleDelete(item._id)}
                        >
                            Delete
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default UserHistory;