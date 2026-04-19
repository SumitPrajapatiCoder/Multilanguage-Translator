import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/createMeeting.css";

import {
    Table,
    Button,
    Modal,
    Input,
    DatePicker,
    Space,
    Tag
} from "antd";

import { FaCopy } from "react-icons/fa";

import dayjs from "dayjs";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const { RangePicker } = DatePicker;

const CreateMeeting = () => {

    const [meetings, setMeetings] = useState([]);
    const [open, setOpen] = useState(false);

    const [title, setTitle] = useState("");
    const [times, setTimes] = useState([]);

    const token = localStorage.getItem("token");

    const MySwal = withReactContent(Swal);

    /* LOAD MEETINGS */
    const loadMeetings = async () => {
        try {
            const res = await axios.get("/api/v1/meeting/list", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMeetings(res.data);
        } catch {
            toast.error("Failed to load meetings");
        }
    };

    useEffect(() => {
        loadMeetings();
    }, []);

    const createMeeting = async () => {

        if (!title.trim()) {
            toast.error("Meeting title required");
            return;
        }

        if (times.length !== 2) {
            toast.error("Select start and end time");
            return;
        }

        try {
            await axios.post(
                "/api/v1/meeting/create",
                {
                    title,
                    startTime: times[0],
                    endTime: times[1]
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success("Meeting created");

            setTitle("");
            setTimes([]);
            setOpen(false);

            loadMeetings();

        } catch {
            toast.error("Create meeting failed");
        }
    };

    const endMeeting = async (meetingId) => {

        const result = await MySwal.fire({
            title: "End this meeting?",
            text: "All participants will be disconnected.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, End Meeting",
            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) return;

        try {
            await axios.post(
                "/api/v1/meeting/end",
                { meetingId },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success("Meeting ended");
            loadMeetings();

        } catch {
            toast.error("Failed to end meeting");
        }
    };

    const deleteMeeting = async (meetingId) => {

        const result = await MySwal.fire({
            title: "Delete this meeting?",
            text: "This action cannot be undone.",
            icon: "error",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(
                "/api/v1/meeting/delete",
                {
                    data: { meetingId },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success("Meeting deleted");
            loadMeetings();

        } catch {
            toast.error("Delete meeting failed");
        }
    };

    const columns = [
        {
            title: "Meeting ID",
            render: (m) => (
                <Space>
                    <Input
                        value={m.meetingId}
                        readOnly
                        style={{ width: 150 }}
                    />
                    <Button
                        onClick={() => {
                            navigator.clipboard.writeText(m.meetingId);
                            toast.success("Meeting ID copied");
                        }}
                    >
                        <FaCopy />
                    </Button>
                </Space>
            )
        },
        {
            title: "Title",
            dataIndex: "title"
        },
        {
            title: "Start Time",
            render: (m) =>
                m.startTime
                    ? dayjs(m.startTime).format("DD MMM YYYY HH:mm")
                    : "-"
        },
        {
            title: "End Time",
            render: (m) =>
                m.endTime
                    ? dayjs(m.endTime).format("DD MMM YYYY HH:mm")
                    : "-"
        },
        {
            title: "Status",
            render: (m) => {
                if (m.status === "ended")
                    return <Tag color="red">ENDED</Tag>;

                if (m.status === "scheduled")
                    return <Tag color="orange">SCHEDULED</Tag>;

                return <Tag color="green">ACTIVE</Tag>;
            }
        },
        {
            title: "Join Link",
            render: (m) => (
                <Space className="join-link-group">
                    <Input
                        value={`http://localhost:5173/join/${m.meetingId}`}
                        readOnly
                    />
                    <Button
                        type="primary"
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `http://localhost:5173/join/${m.meetingId}`
                            );
                            toast.success("Link copied");
                        }}
                    >
                        <FaCopy />
                    </Button>
                </Space>
            )
        },
        {
            title: "Action",
            render: (m) => (
                <Space className="action-buttons">

                    {m.status !== "ended" && (
                        <Button
                            danger
                            onClick={() => endMeeting(m.meetingId)}
                        >
                            End
                        </Button>
                    )}

                    <Button
                        danger
                        type="primary"
                        onClick={() => deleteMeeting(m.meetingId)}
                    >
                        Delete
                    </Button>

                </Space>
            )
        }
    ];

    return (
        <div className="meeting-container">

            {/* HEADER */}
            <div className="meeting-header">
                <h2>Meetings</h2>

                <Button type="primary" onClick={() => setOpen(true)}>
                    Create Meeting
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={meetings}
                rowKey="_id"
                bordered
                scroll={{ x: true }}  
            />

            <Modal
                title="Create Meeting"
                open={open}
                footer={null}
                onCancel={() => setOpen(false)}
                centered
                width={500}
            >
                <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="large"
                >
                    <Input
                        placeholder="Meeting Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <RangePicker
                        showTime
                        style={{ width: "100%" }}
                        // getPopupContainer={(trigger) => trigger.parentNode}
                        getPopupContainer={() => document.body}
                        onChange={(value) => {

                            if (!value) {
                                setTimes([]);
                                return;
                            }

                            setTimes([
                                value[0].format("YYYY-MM-DD HH:mm:ss"),
                                value[1].format("YYYY-MM-DD HH:mm:ss")
                            ]);
                        }}
                    />

                    <Space
                        style={{
                            justifyContent: "flex-end",
                            width: "100%"
                        }}
                    >
                        <Button onClick={() => setOpen(false)}>
                            Cancel
                        </Button>

                        <Button type="primary" onClick={createMeeting}>
                            Create Meeting
                        </Button>
                    </Space>

                </Space>
            </Modal>

        </div>
    );
};

export default CreateMeeting;