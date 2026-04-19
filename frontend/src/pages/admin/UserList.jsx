import React, { useEffect, useState } from "react";
import api from "../api";
import "../../styles/UserList.css";
import { toast } from "react-toastify";
import { Table, Button, Tag, Space } from "antd";
import { useNavigate } from "react-router-dom";
import {
    DeleteOutlined,
    StopOutlined,
    CheckOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
} from "@ant-design/icons";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await api.post(
                "/api/v1/user/get_User_data",
                {},
                config
            );
            setCurrentUserId(res.data.data._id);
        } catch {
            toast.error("Failed to get current user");
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get("/api/v1/admin/users", config);
            setUsers(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Unauthorized");

            if (err.response?.status === 401) {
                localStorage.clear();
                window.location.href = "/";
            }
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchCurrentUser();
    }, []);

    const handleBlock = async (user) => {
        const result = await MySwal.fire({
            title: user.isBlocked ? "Unblock User?" : "Block User?",
            text: `Are you sure you want to ${user.isBlocked ? "unblock" : "block"} ${user.name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await api.put(
                `/api/v1/admin/block-user/${user._id}`,
                {},
                config
            );

            toast.success(res.data.message);

            MySwal.fire("Success!", res.data.message, "success");

            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        }
    };

    const handleDelete = async (user) => {
        const result = await MySwal.fire({
            title: "Delete User?",
            text: `This will permanently delete ${user.name}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await api.delete(
                `/api/v1/admin/delete-user/${user._id}`,
                config
            );

            toast.success(res.data.message);

            MySwal.fire("Deleted!", res.data.message, "success");

            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const handleAdmin = async (user) => {
        const result = await MySwal.fire({
            title: user.isAdmin ? "Remove Admin?" : "Make Admin?",
            text: `Change role for ${user.name}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Yes",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await api.put(
                `/api/v1/admin/toggle-admin/${user._id}`,
                {},
                config
            );

            toast.success(res.data.message);

            MySwal.fire("Updated!", res.data.message, "success");

            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Role update failed");
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text) => <strong>{text}</strong>,
        },
        { title: "Email", dataIndex: "email" },

        {
            title: "Role",
            render: (_, r) =>
                r.isAdmin ? <Tag color="green">Admin</Tag> : <Tag>User</Tag>,
        },

        {
            title: "Status",
            render: (_, r) =>
                r.isBlocked ? <Tag color="red">Blocked</Tag> : <Tag color="green">Active</Tag>,
        },

        {
            title: "Actions",
            render: (_, r) => (
                <Space wrap>
                    <Button
                        icon={r.isBlocked ? <CheckOutlined /> : <StopOutlined />}
                        onClick={() => handleBlock(r)}
                        disabled={r.isAdmin}
                    >
                        {r.isBlocked ? "Unblock" : "Block"}
                    </Button>

                    <Button
                        icon={r.isAdmin ? <UserDeleteOutlined /> : <UserAddOutlined />}
                        onClick={() => handleAdmin(r)}
                        disabled={r._id === currentUserId}  
                    >
                        {r.isAdmin ? "Remove Admin" : "Make Admin"}
                    </Button>

                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(r)}
                        disabled={r.isAdmin}
                    >
                        Delete
                    </Button>

                    <Button onClick={() => navigate(`/admin/history/${r._id}`)}>
                        History
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="userlist-wrapper">
            <h2 className="userlist-title">Registered User List</h2>

            <div className="table-container">
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="_id"
                    pagination={{ pageSize: 6 }}
                    scroll={{ x: true }}  
                />
            </div>
        </div>
    );
};

export default UserList;