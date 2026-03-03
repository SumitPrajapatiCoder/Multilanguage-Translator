import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/history.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");


    const fetchHistory = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                "/api/v1/history/get_history",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setHistory(res.data);
        } catch (error) {
            toast.error("Failed to load history",error);
        } finally {
            setLoading(false);
        }
    };


    const MySwal = withReactContent(Swal);

    const handleDelete = async (id) => {

        const result = await MySwal.fire({
            title: "Are you sure?",
            text: "This translation will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(
                `/api/v1/history/delete_history/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await MySwal.fire({
                title: "Deleted!",
                text: "Your history item has been removed.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
            toast.success("Deleted successfully");
            setHistory((prev) =>
                prev.filter((item) => item._id !== id)
            );

        } catch (error) {
            MySwal.fire({
                title: "Error!",
                text: "Failed to delete history.",error,
                icon: "error",
            });

            toast.error("Delete failed", error);
        }
    };




    useEffect(() => {
        fetchHistory();
    }, []);


    return (
        <div className="history-container">
            <h2>Translation History</h2>

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
                                {item.detectedLanguage?.toUpperCase()} → {item.targetLanguage?.toUpperCase()}
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

export default History;