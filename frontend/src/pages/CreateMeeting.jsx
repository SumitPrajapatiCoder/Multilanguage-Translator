import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
    Table,
    Button,
    Modal,
    Input,
    DatePicker,
    Space,
    Tag
} from "antd";

import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const CreateMeeting = () => {

    const [meetings, setMeetings] = useState([]);
    const [open, setOpen] = useState(false);

    const [title, setTitle] = useState("");
    const [times, setTimes] = useState([]);

    const token = localStorage.getItem("token");



    /* LOAD MEETINGS */
    const loadMeetings = async () => {

        try {

            const res = await axios.get(
                "/api/v1/meeting/list",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMeetings(res.data);

        } catch {
            toast.error("Failed to load meetings");
        }

    };



    useEffect(() => {
        loadMeetings();
    }, []);




    /* CREATE MEETING */
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
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
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




    /* END MEETING */
    const endMeeting = async (meetingId) => {

        try {

            await axios.post(
                "/api/v1/meeting/end",
                { meetingId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success("Meeting ended");

            loadMeetings();

        } catch {
            toast.error("Failed to end meeting");
        }

    };




    /* DELETE MEETING */
    const deleteMeeting = async (meetingId) => {

        try {

            await axios.delete(
                "/api/v1/meeting/delete",
                {
                    data: { meetingId },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success("Meeting deleted");

            loadMeetings();

        } catch {
            toast.error("Delete meeting failed");
        }

    };



    /* TABLE COLUMNS */
    const columns = [

        {
            title: "Meeting ID",
            dataIndex: "meetingId"
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

                <Space>

                    <Input
                        value={`http://localhost:5173/join/${m.meetingId}`}
                        readOnly
                        style={{ width: 220 }}
                    />

                    <Button
                        type="primary"
                        onClick={() =>
                            navigator.clipboard.writeText(
                                `http://localhost:5173/join/${m.meetingId}`
                            )
                        }
                    >
                        Copy
                    </Button>

                </Space>

            )
        },

        {
            title: "Action",
            render: (m) => (

                <Space>

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

        <div style={{ padding: 40 }}>

            <Space
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 20
                }}
            >

                <h2>Meetings</h2>

                <Button
                    type="primary"
                    onClick={() => setOpen(true)}
                >
                    Create Meeting
                </Button>

            </Space>



            <Table
                columns={columns}
                dataSource={meetings}
                rowKey="_id"
                bordered
            />



            {/* CREATE MEETING MODAL */}

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
                        getPopupContainer={(trigger) => trigger.parentNode}
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



                    {/* ACTION BUTTONS */}

                    <Space style={{ justifyContent: "flex-end", width: "100%" }}>

                        <Button onClick={() => setOpen(false)}>
                            Cancel
                        </Button>

                        <Button
                            type="primary"
                            onClick={createMeeting}
                        >
                            Create Meeting
                        </Button>

                    </Space>

                </Space>

            </Modal>

        </div>

    );

};

export default CreateMeeting;